import { z } from 'zod';
import { insertEmployeeSchema, insertLeaveRequestSchema, insertSalaryRecordSchema, employees, leaveRequests, salaryRecords } from './schema';

export const api = {
  employees: {
    list: {
      method: 'GET' as const,
      path: '/api/employees',
      responses: {
        200: z.array(z.custom<typeof employees.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/employees/:id',
      responses: {
        200: z.custom<typeof employees.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/employees',
      input: insertEmployeeSchema,
      responses: {
        201: z.custom<typeof employees.$inferSelect>(),
      },
    }
  },
  leaves: {
    list: {
      method: 'GET' as const,
      path: '/api/leaves',
      responses: {
        200: z.array(z.custom<typeof leaveRequests.$inferSelect>()),
      },
    },
    apply: {
      method: 'POST' as const,
      path: '/api/leaves',
      input: insertLeaveRequestSchema,
      responses: {
        201: z.custom<typeof leaveRequests.$inferSelect>(),
      },
    },
    approve: {
      method: 'POST' as const,
      path: '/api/leaves/:id/approve',
      responses: {
        200: z.custom<typeof leaveRequests.$inferSelect>(),
      },
    },
    reject: {
      method: 'POST' as const,
      path: '/api/leaves/:id/reject',
      responses: {
        200: z.custom<typeof leaveRequests.$inferSelect>(),
      },
    },
  },
  salary: {
    list: {
      method: 'GET' as const,
      path: '/api/salary', // Optional: ?employeeId=...
      responses: {
        200: z.array(z.custom<typeof salaryRecords.$inferSelect>()),
      },
    },
  },
  webhook: {
    payroll: {
      method: 'POST' as const,
      path: '/api/webhook/payroll',
      input: z.object({
        employeeId: z.number(),
        event: z.string(),
        data: z.any()
      }),
      responses: {
        200: z.object({ status: z.string() }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
