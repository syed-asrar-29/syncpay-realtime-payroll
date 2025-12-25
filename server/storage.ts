import { 
  type Employee, type InsertEmployee,
  type LeaveRequest, type InsertLeaveRequest,
  type SalaryRecord, type InsertSalaryRecord,
  employees, leaveRequests, salaryRecords
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;

  // Leaves
  getLeaveRequests(): Promise<LeaveRequest[]>;
  getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveStatus(id: number, status: string): Promise<LeaveRequest>;

  // Salary
  getSalaryRecords(): Promise<SalaryRecord[]>;
  getSalaryRecordsByEmployee(employeeId: number): Promise<SalaryRecord[]>;
  createSalaryRecord(record: InsertSalaryRecord): Promise<SalaryRecord>;
}

export class DatabaseStorage implements IStorage {
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(employees).values(insertEmployee).returning();
    return employee;
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return await db.select().from(leaveRequests).orderBy(desc(leaveRequests.id));
  }

  async getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]> {
    return await db.select().from(leaveRequests).where(eq(leaveRequests.employeeId, employeeId)).orderBy(desc(leaveRequests.id));
  }

  async createLeaveRequest(insertRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const [request] = await db.insert(leaveRequests).values(insertRequest).returning();
    return request;
  }

  async updateLeaveStatus(id: number, status: string): Promise<LeaveRequest> {
    const [request] = await db.update(leaveRequests)
      .set({ status })
      .where(eq(leaveRequests.id, id))
      .returning();
    return request;
  }

  async getSalaryRecords(): Promise<SalaryRecord[]> {
    return await db.select().from(salaryRecords).orderBy(desc(salaryRecords.createdAt));
  }

  async getSalaryRecordsByEmployee(employeeId: number): Promise<SalaryRecord[]> {
    return await db.select().from(salaryRecords).where(eq(salaryRecords.employeeId, employeeId)).orderBy(desc(salaryRecords.createdAt));
  }

  async createSalaryRecord(insertRecord: InsertSalaryRecord): Promise<SalaryRecord> {
    const [record] = await db.insert(salaryRecords).values(insertRecord).returning();
    return record;
  }
}

export const storage = new DatabaseStorage();
