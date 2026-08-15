"use client";

import { useState } from "react";
import { Plus, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/page-header";
import { CustomerAvatar } from "@/components/common/customer-avatar";
import { EmptyState } from "@/components/common/empty-state";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/common/toast-provider";
import { formatDate } from "@/lib/format";

export default function EmployeesPage() {
  const { employees, entries, createEmployee, toggleEmployeeStatus } = useApp();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", employeeId: "", mobile: "", password: "" });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.employeeId || !form.mobile) return;
    createEmployee({ name: form.name, employeeId: form.employeeId, mobile: form.mobile, password: form.password, status: "ACTIVE" });
    toast(`Employee ${form.name} added`);
    setForm({ name: "", employeeId: "", mobile: "", password: "" });
    setAddOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your team members."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" aria-hidden />Add Employee
          </Button>
        }
      />

      {employees.length === 0 ? (
        <EmptyState icon={UserCog} title="No employees" description="Add your first employee." />
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Current Work</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((emp) => {
                const currentWork = entries.filter(
                  (e) => e.assignedToId === emp.id && (e.status === "IN_PROGRESS" || e.status === "WAITING")
                );
                return (
                  <tr key={emp.id} className="interactive-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CustomerAvatar name={emp.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{emp.name}</p>
                          <p className="text-caption">{emp.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-mono text-xs">{emp.employeeId}</span></td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={emp.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                        {emp.status === "ACTIVE" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">
                      {currentWork.length > 0 ? `${currentWork.length} job(s)` : "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-caption">{formatDate(emp.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          toggleEmployeeStatus(emp.id);
                          toast(`${emp.name} marked as ${emp.status === "ACTIVE" ? "Inactive" : "Active"}`);
                        }}
                      >
                        {emp.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="emp-name">Name *</Label><Input id="emp-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></div>
              <div className="space-y-1.5"><Label htmlFor="emp-id">Employee ID *</Label><Input id="emp-id" value={form.employeeId} onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))} placeholder="EMP-007" required /></div>
              <div className="space-y-1.5"><Label htmlFor="emp-mobile">Mobile *</Label><Input id="emp-mobile" type="tel" value={form.mobile} onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} required /></div>
              <div className="space-y-1.5"><Label htmlFor="emp-pass">Password</Label><Input id="emp-pass" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit">Add Employee</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
