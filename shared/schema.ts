import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  baseSalary: integer("base_salary").notNull(),
  role: text("role").notNull(), // 'employee' or 'manager'
});

export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  leaveDays: integer("leave_days").notNull(),
  leaveType: text("leave_type").notNull(), // 'PAID', 'UNPAID'
  status: text("status").notNull().default("PENDING"), // 'PENDING', 'APPROVED', 'REJECTED'
});

export const salaryRecords = pgTable("salary_records", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  month: text("month").notNull(), // e.g. "2024-05"
  finalSalary: integer("final_salary").notNull(),
  deductions: integer("deductions").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({ id: true, status: true });
export const insertSalaryRecordSchema = createInsertSchema(salaryRecords).omit({ id: true, createdAt: true });

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type SalaryRecord = typeof salaryRecords.$inferSelect;
export type InsertSalaryRecord = z.infer<typeof insertSalaryRecordSchema>;
