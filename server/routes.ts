import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { WebSocket, WebSocketServer } from "ws";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- WebSocket Setup ---
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
  });

  function broadcast(type: string, data: any) {
    const message = JSON.stringify({ type, data });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // --- REST Endpoints ---

  app.get(api.employees.list.path, async (req, res) => {
    const employees = await storage.getEmployees();
    res.json(employees);
  });

  app.get(api.employees.get.path, async (req, res) => {
    const employee = await storage.getEmployee(Number(req.params.id));
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  });

  app.post(api.employees.create.path, async (req, res) => {
    const employee = await storage.createEmployee(req.body);
    broadcast('EMPLOYEE_UPDATED', employee);
    res.status(201).json(employee);
  });

  app.get(api.leaves.list.path, async (req, res) => {
    const leaves = await storage.getLeaveRequests();
    res.json(leaves);
  });

  app.post(api.leaves.apply.path, async (req, res) => {
    const leave = await storage.createLeaveRequest(req.body);
    broadcast('LEAVE_UPDATED', leave);
    res.status(201).json(leave);
  });

  app.post(api.leaves.approve.path, async (req, res) => {
    const leaveId = Number(req.params.id);
    const updatedLeave = await storage.updateLeaveStatus(leaveId, "APPROVED");
    broadcast('LEAVE_UPDATED', updatedLeave);

    // Business Logic: If APPROVED and UNPAID, deduct salary
    // If PAID, no deduction (but maybe log it)
    
    // We need employee info to calculate deductions
    const employee = await storage.getEmployee(updatedLeave.employeeId);
    if (employee) {
      let deduction = 0;
      let reason = "Leave Approved";
      
      if (updatedLeave.leaveType === 'UNPAID') {
        // Simple calculation: Base Salary / 30 * days
        const dailyRate = employee.baseSalary / 30;
        deduction = Math.floor(dailyRate * updatedLeave.leaveDays);
        reason = `Deduction for ${updatedLeave.leaveDays} days UNPAID leave`;
      } else {
        reason = `No deduction for ${updatedLeave.leaveDays} days PAID leave`;
      }

      const finalSalary = employee.baseSalary - deduction;

      const salaryRecord = await storage.createSalaryRecord({
        employeeId: employee.id,
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        finalSalary,
        deductions: deduction,
        reason
      });

      broadcast('SALARY_UPDATED', salaryRecord);

      // Trigger Webhook (Mock)
      try {
        // internal call to our own mock webhook endpoint
        // In real app, this would use fetch/axios to external URL
        console.log(`[Webhook Trigger] Sending payload to /api/webhook/payroll`);
        // We just log it here as "sending"
      } catch (e) {
        console.error("Webhook failed", e);
      }
    }

    res.json(updatedLeave);
  });

  app.post(api.leaves.reject.path, async (req, res) => {
    const leaveId = Number(req.params.id);
    const updatedLeave = await storage.updateLeaveStatus(leaveId, "REJECTED");
    broadcast('LEAVE_UPDATED', updatedLeave);
    res.json(updatedLeave);
  });

  app.get(api.salary.list.path, async (req, res) => {
    const records = await storage.getSalaryRecords();
    res.json(records);
  });

  // Mock Webhook
  app.post(api.webhook.payroll.path, async (req, res) => {
    console.log("PAYROLL WEBHOOK RECEIVED:", JSON.stringify(req.body, null, 2));
    res.json({ status: "received" });
  });

  // --- Seed Data ---
  async function seed() {
    const existing = await storage.getEmployees();
    if (existing.length === 0) {
      await storage.createEmployee({ name: "Alice Johnson", baseSalary: 5000, role: "employee" });
      await storage.createEmployee({ name: "Bob Smith", baseSalary: 7000, role: "manager" });
      await storage.createEmployee({ name: "Charlie Brown", baseSalary: 4500, role: "employee" });
    }
  }
  seed();

  return httpServer;
}
