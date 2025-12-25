import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployees } from "@/hooks/use-employees";
import { useLeaves, useApplyLeave } from "@/hooks/use-leaves";
import { useSalaryRecords } from "@/hooks/use-salary";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { Calendar, DollarSign, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertLeaveRequestSchema } from "@shared/schema";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock auth selector since no real auth
function EmployeeSelector({ 
  currentId, 
  onChange 
}: { 
  currentId: number | null, 
  onChange: (id: number) => void 
}) {
  const { data: employees } = useEmployees();

  return (
    <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-border shadow-sm">
      <div className="flex-1">
        <h2 className="text-lg font-semibold font-display">Welcome back!</h2>
        <p className="text-sm text-muted-foreground">Select your profile to view your dashboard</p>
      </div>
      <Select 
        value={currentId?.toString()} 
        onValueChange={(val) => onChange(parseInt(val))}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select Employee" />
        </SelectTrigger>
        <SelectContent>
          {employees?.map((emp) => (
            <SelectItem key={emp.id} value={emp.id.toString()}>
              {emp.name} ({emp.role})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function EmployeeDashboard() {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const { data: leaves } = useLeaves();
  const { data: salaryRecords } = useSalaryRecords();
  const { mutate: applyLeave, isPending } = useApplyLeave();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const myLeaves = leaves?.filter(l => l.employeeId === employeeId) || [];
  const mySalary = salaryRecords?.filter(s => s.employeeId === employeeId) || [];

  const form = useForm<z.infer<typeof insertLeaveRequestSchema>>({
    resolver: zodResolver(insertLeaveRequestSchema),
    defaultValues: {
      leaveDays: 1,
      leaveType: "PAID",
      employeeId: 0, // Will be set on submit
    },
  });

  const onSubmit = (data: z.infer<typeof insertLeaveRequestSchema>) => {
    if (!employeeId) return;
    
    applyLeave({ ...data, employeeId }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Leave request submitted successfully" });
        setIsOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };

  if (!employeeId) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="mb-8 relative w-full h-64 rounded-2xl overflow-hidden shadow-2xl">
          {/* Unsplash image for teamwork/office */}
          {/* Photo by Austin Distel on Unsplash */}
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
            alt="Team Collaboration" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Employee Portal</h1>
          </div>
        </div>
        <EmployeeSelector currentId={employeeId} onChange={setEmployeeId} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <EmployeeSelector currentId={employeeId} onChange={setEmployeeId} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg shadow-blue-500/5 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display text-blue-600">12 Days</div>
            <p className="text-xs text-muted-foreground mt-1">Remaining this year</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg shadow-green-500/5 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Last Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display text-green-600">
              ${mySalary[0]?.finalSalary.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Processed for {mySalary[0]?.month || "N/A"}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg shadow-purple-500/5 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Quick Action</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                  <DialogDescription>
                    Submit a leave request for approval by your manager.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="leaveType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leave Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PAID">Paid Leave</SelectItem>
                              <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="leaveDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Days</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="30"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isPending}>
                        {isPending ? "Submitting..." : "Submit Request"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leaves" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="leaves" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Leave History
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Salary Records
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="leaves" className="space-y-4">
          {myLeaves.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-border">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground font-medium">No leave requests found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Days</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {myLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{leave.leaveType}</td>
                        <td className="px-6 py-4">{leave.leaveDays} Days</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={leave.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="salary" className="space-y-4">
          {mySalary.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-border">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground font-medium">No salary records found.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {mySalary.map((record) => (
                <div key={record.id} className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{record.month}</h3>
                      <p className="text-sm text-muted-foreground">{record.reason || "Monthly Salary"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl">${record.finalSalary.toLocaleString()}</div>
                    <div className="text-xs text-red-500 font-medium">-${record.deductions} deductions</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
