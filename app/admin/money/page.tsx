"use client";

import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { MoneyDisplay } from "@/components/common/money-display";
import { EmptyState } from "@/components/common/empty-state";
import { DataPagination } from "@/components/common/data-pagination";
import { DatePicker, formatYMD } from "@/components/common/date-picker";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/common/toast-provider";
import { formatDate, formatPaymentMode } from "@/lib/format";
import type { MoneyCategory, PaymentMode } from "@/types";

const PAGE_SIZE = 10;
const CATEGORIES: MoneyCategory[] = ["SERVICE", "PARTS", "ADVANCE", "SALARY", "RENT", "UTILITIES", "SUPPLIES", "OTHER"];
const PAYMENT_MODES: PaymentMode[] = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"];

export default function MoneyPage() {
  const { income, expenses, addIncome, addExpense } = useApp();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"income" | "expenses">("income");
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const [iForm, setIForm] = useState({
    description: "",
    category: "SERVICE" as MoneyCategory,
    paymentMode: "CASH" as PaymentMode,
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [eForm, setEForm] = useState({
    description: "",
    category: "OTHER" as MoneyCategory,
    paymentMode: "CASH" as PaymentMode,
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [incomePage, setIncomePage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);

  const paginatedIncome = income.slice((incomePage - 1) * PAGE_SIZE, incomePage * PAGE_SIZE);
  const paginatedExpenses = expenses.slice((expensePage - 1) * PAGE_SIZE, expensePage * PAGE_SIZE);

  function handleAddIncome(e: React.FormEvent) {
    e.preventDefault();
    if (!iForm.description || !iForm.amount) return;
    addIncome({ ...iForm, amount: Number(iForm.amount) });
    toast("Income added");
    setIForm({ description: "", category: "SERVICE", paymentMode: "CASH", amount: "", date: new Date().toISOString().slice(0, 10) });
    setIncomeOpen(false);
  }

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!eForm.description || !eForm.amount) return;
    addExpense({ ...eForm, amount: Number(eForm.amount) });
    toast("Expense added");
    setEForm({ description: "", category: "OTHER", paymentMode: "CASH", amount: "", date: new Date().toISOString().slice(0, 10) });
    setExpenseOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Money" description="Track income and expenses." />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Income</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-status-completed-bg">
              <TrendingUp className="size-4 text-status-completed-fg" aria-hidden />
            </div>
          </CardHeader>
          <CardContent><MoneyDisplay amount={totalIncome} variant="income" className="text-2xl font-bold" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Expenses</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-status-cancelled-bg">
              <TrendingDown className="size-4 text-status-cancelled-fg" aria-hidden />
            </div>
          </CardHeader>
          <CardContent><MoneyDisplay amount={totalExpenses} variant="expense" className="text-2xl font-bold" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Net</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Wallet className="size-4 text-muted-foreground" aria-hidden />
            </div>
          </CardHeader>
          <CardContent>
            <MoneyDisplay
              amount={totalIncome - totalExpenses}
              variant={totalIncome - totalExpenses >= 0 ? "income" : "expense"}
              className="text-2xl font-bold"
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs with Tab-Wise Buttons */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "income" | "expenses")} className="w-full">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="income" className="cursor-pointer">Income ({income.length})</TabsTrigger>
            <TabsTrigger value="expenses" className="cursor-pointer">Expenses ({expenses.length})</TabsTrigger>
          </TabsList>
          
          {/* Tab-wise button rendering */}
          {activeTab === "income" ? (
            <Button size="sm" onClick={() => setIncomeOpen(true)}>
              <Plus className="size-4" aria-hidden />Add Income
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setExpenseOpen(true)}>
              <Plus className="size-4" aria-hidden />Add Expense
            </Button>
          )}
        </div>

        <TabsContent value="income" className="mt-4">
          {income.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No income records" />
          ) : (
            <div className="rounded-xl border overflow-hidden bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Mode</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedIncome.map((i) => (
                    <tr key={i.id} className="interactive-row">
                      <td className="px-4 py-3 text-caption">{formatDate(i.date)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground">{i.description}</p>
                        {i.entryNumber && <p className="text-caption">{i.entryNumber}</p>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-muted-foreground">{i.category}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{formatPaymentMode(i.paymentMode)}</td>
                      <td className="px-4 py-3 text-right"><MoneyDisplay amount={i.amount} variant="income" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <DataPagination
                currentPage={incomePage}
                totalItems={income.length}
                pageSize={PAGE_SIZE}
                onPageChange={setIncomePage}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          {expenses.length === 0 ? (
            <EmptyState icon={TrendingDown} title="No expense records" />
          ) : (
            <div className="rounded-xl border overflow-hidden bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Mode</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedExpenses.map((e) => (
                    <tr key={e.id} className="interactive-row">
                      <td className="px-4 py-3 text-caption">{formatDate(e.date)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground">{e.description}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-muted-foreground">{e.category}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{formatPaymentMode(e.paymentMode)}</td>
                      <td className="px-4 py-3 text-right"><MoneyDisplay amount={e.amount} variant="expense" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <DataPagination
                currentPage={expensePage}
                totalItems={expenses.length}
                pageSize={PAGE_SIZE}
                onPageChange={setExpensePage}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Income Dialog — Single column grid layout with full width fields and DatePicker */}
      <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Income</DialogTitle></DialogHeader>
          <form onSubmit={handleAddIncome} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5 w-full">
                <Label htmlFor="inc-desc">Description *</Label>
                <Input
                  id="inc-desc"
                  value={iForm.description}
                  onChange={(e) => setIForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Screen repair payment"
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-1.5 w-full">
                <Label htmlFor="inc-amount">Amount (₹) *</Label>
                <Input
                  id="inc-amount"
                  type="number"
                  min="0"
                  value={iForm.amount}
                  onChange={(e) => setIForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0"
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-1.5 w-full">
                <Label>Date *</Label>
                <DatePicker
                  date={iForm.date}
                  onSelect={(d) => d && setIForm((p) => ({ ...p, date: formatYMD(d) }))}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5 w-full">
                <Label htmlFor="inc-cat">Category</Label>
                <Select value={iForm.category} onValueChange={(v) => setIForm((p) => ({ ...p, category: v as MoneyCategory }))}>
                  <SelectTrigger id="inc-cat" className="w-full cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="cursor-pointer">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 w-full">
                <Label htmlFor="inc-mode">Payment Mode</Label>
                <Select value={iForm.paymentMode} onValueChange={(v) => setIForm((p) => ({ ...p, paymentMode: v as PaymentMode }))}>
                  <SelectTrigger id="inc-mode" className="w-full cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODES.map((m) => (
                      <SelectItem key={m} value={m} className="cursor-pointer">{formatPaymentMode(m)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIncomeOpen(false)}>Cancel</Button>
              <Button type="submit">Add Income</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog — Single column grid layout with full width fields and DatePicker */}
      <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5 w-full">
                <Label htmlFor="exp-desc">Description *</Label>
                <Input
                  id="exp-desc"
                  value={eForm.description}
                  onChange={(e) => setEForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Spare parts purchase"
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-1.5 w-full">
                <Label htmlFor="exp-amount">Amount (₹) *</Label>
                <Input
                  id="exp-amount"
                  type="number"
                  min="0"
                  value={eForm.amount}
                  onChange={(e) => setEForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0"
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-1.5 w-full">
                <Label>Date *</Label>
                <DatePicker
                  date={eForm.date}
                  onSelect={(d) => d && setEForm((p) => ({ ...p, date: formatYMD(d) }))}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5 w-full">
                <Label htmlFor="exp-cat">Category</Label>
                <Select value={eForm.category} onValueChange={(v) => setEForm((p) => ({ ...p, category: v as MoneyCategory }))}>
                  <SelectTrigger id="exp-cat" className="w-full cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="cursor-pointer">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 w-full">
                <Label htmlFor="exp-mode">Payment Mode</Label>
                <Select value={eForm.paymentMode} onValueChange={(v) => setEForm((p) => ({ ...p, paymentMode: v as PaymentMode }))}>
                  <SelectTrigger id="exp-mode" className="w-full cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODES.map((m) => (
                      <SelectItem key={m} value={m} className="cursor-pointer">{formatPaymentMode(m)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setExpenseOpen(false)}>Cancel</Button>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
