"use client";

import { ChartNoAxesCombined } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { MoneyDisplay } from "@/components/common/money-display";
import { CustomerAvatar } from "@/components/common/customer-avatar";
import { useApp } from "@/contexts/app-context";

export default function ReportsPage() {
  const { entries, income, expenses, employees } = useApp();

  const total = entries.length;
  const completed = entries.filter((e) => e.status === "COMPLETED").length;
  const cancelled = entries.filter((e) => e.status === "CANCELLED").length;
  const pending = entries.filter((e) => ["NOT_STARTED","IN_PROGRESS","WAITING","REOPENED"].includes(e.status)).length;
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Reports" description="Overview of business performance." />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Entries", value: total },
          { label: "Completed", value: completed },
          { label: "Pending", value: pending },
          { label: "Cancelled", value: cancelled },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-foreground">{value}</p></CardContent>
          </Card>
        ))}
      </div>

      {/* Financial summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Total Income</CardTitle></CardHeader>
          <CardContent><MoneyDisplay amount={totalIncome} variant="income" className="text-2xl font-bold" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Total Expenses</CardTitle></CardHeader>
          <CardContent><MoneyDisplay amount={totalExpenses} variant="expense" className="text-2xl font-bold" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Net Profit</CardTitle></CardHeader>
          <CardContent>
            <MoneyDisplay amount={totalIncome - totalExpenses} variant={totalIncome >= totalExpenses ? "income" : "expense"} className="text-2xl font-bold" />
          </CardContent>
        </Card>
      </div>

      {/* Employee workload */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Employee Workload</h2>
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Employee</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Completed</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">In Progress</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Waiting</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.filter((e) => e.status === "ACTIVE").map((emp) => {
                const empEntries = entries.filter((e) => e.assignedToId === emp.id);
                return (
                  <tr key={emp.id} className="interactive-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CustomerAvatar name={emp.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{emp.name}</p>
                          <p className="text-caption">{emp.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-status-completed-fg font-medium">
                      {empEntries.filter((e) => e.status === "COMPLETED").length}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-status-in-progress-fg font-medium">
                      {empEntries.filter((e) => e.status === "IN_PROGRESS").length}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-status-waiting-fg font-medium">
                      {empEntries.filter((e) => e.status === "WAITING").length}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-foreground font-semibold">
                      {empEntries.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
