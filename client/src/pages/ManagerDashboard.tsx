import { useEmployees, useCreateEmployee } from "@/hooks/use-employees";
import { useLeaves, useApproveLeave, useRejectLeave } from "@/hooks/use-leaves";
import { useSalaryRecords } from "@/hooks/use-salary";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Users, Briefcase, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertEmployeeSchema } from "@shared/schema";
import { useState } from "react";

export default function ManagerDashboard() {
  const { data: employees } = useEmployees();
  const { data: leaves } = useLeaves();
  const { data: salaryRecords } = useSalaryRecords();
  const { mutate: approveLeave } = useApproveLeave();
  const { mutate: rejectLeave } = useRejectLeave();
  const { mutate: createEmployee, isPending: isCreating } = useCreateEmployee();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter for pending leaves
  const pendingLeaves = leaves?.filter(l => l.status === 'PENDING') || [];
  
  // Stats
  const totalEmployees = employees?.length || 0;
  const pendingRequests = pendingLeaves.length;
  const totalSalaryPaid = salaryRecords?.reduce((acc, curr) => acc + curr.finalSalary, 0) || 0;

  const handleAction = (action: 'approve' | 'reject', id: number) => {
    const mutation = action === 'approve' ? approveLeave : rejectLeave;
    mutation(id, {
      onSuccess: () => {
        toast({
          title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: `The leave request has been processed.`,
          variant: action === 'approve' ? "default" : "destructive",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to process request.",
          variant: "destructive",
        });
      }
    });
  };

  const form = useForm<z.infer<typeof insertEmployeeSchema>>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      name: "",
      role: "employee",
      baseSalary: 50000,
    },
  });

  const onSubmitEmployee = (data: z.infer<typeof insertEmployeeSchema>) => {
    createEmployee(data, {
      onSuccess: () => {
        toast({ title: "Employee Created", description: `${data.name} has been added.` });
        setIsDialogOpen(false);
        form.reset();
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of HR operations and requests.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Create a new employee record in the system.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEmployee)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="baseSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Salary</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Employee"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg shadow-black/5 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Active staff members</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg shadow-yellow-500/10 border-yellow-100 bg-yellow-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pending Requests</CardTitle>
            <FileText className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{pendingRequests}</div>
            <p className="text-xs text-yellow-600/80 mt-1">Require your attention</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg shadow-green-500/10 border-green-100 bg-green-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Payroll (YTD)</CardTitle>
            <Briefcase className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">${totalSalaryPaid.toLocaleString()}</div>
            <p className="text-xs text-green-600/80 mt-1">Total processed salaries</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="salary">Salary Audit Log</TabsTrigger>
          <TabsTrigger value="employees">Employee Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {pendingLeaves.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-border">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-3 bg-green-100 p-2 rounded-full" />
              <p className="text-foreground font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground">No pending leave requests.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingLeaves.map((request) => {
                const employee = employees?.find(e => e.id === request.employeeId);
                return (
                  <div key={request.id} className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {employee?.name.charAt(0) || "?"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{employee?.name || `Employee #${request.employeeId}`}</h3>
                        <p className="text-sm text-muted-foreground">
                          Requesting <span className="font-medium text-foreground">{request.leaveDays} days</span> ({request.leaveType})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-green-200 hover:bg-green-50 text-green-700 hover:text-green-800"
                        onClick={() => handleAction('approve', request.id)}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-red-200 hover:bg-red-50 text-red-700 hover:text-red-800"
                        onClick={() => handleAction('reject', request.id)}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="salary">
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Month</th>
                    <th className="px-6 py-3 text-right">Final Salary</th>
                    <th className="px-6 py-3 text-right">Deductions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {salaryRecords?.map((record) => {
                    const emp = employees?.find(e => e.id === record.employeeId);
                    return (
                      <tr key={record.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 font-medium">{emp?.name || `ID: ${record.employeeId}`}</td>
                        <td className="px-6 py-4">{record.month}</td>
                        <td className="px-6 py-4 text-right font-mono text-green-600">${record.finalSalary.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-mono text-red-500">-${record.deductions.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="employees">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees?.map((emp) => (
              <div key={emp.id} className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{emp.name}</h3>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{emp.role}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Salary</span>
                    <span className="font-medium font-mono">${emp.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-medium font-mono">#{emp.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
