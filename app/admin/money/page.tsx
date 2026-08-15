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
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/common/toast-provider";
import { formatDate, formatPaymentMode } from "@/lib/format";
import type { MoneyCategory, PaymentMode } from "@/types";

const CATEGORIES: MoneyCategory[] = ["SERVICE","PARTS","ADVANCE","SALARY","RENT","UTILITIES","SUPPLIES","OTHER"];
const PAYMENT_MODES: PaymentMode[] = ["CASH","UPI","CARD","BANK_TRANSFER","OTHER"];

export default function MoneyPage() {
  const { income, expenses, addIncome, addExpense } = useApp();
  const { toast } = useToast();
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const [iForm, setIForm] = useState({ description: "", category: "SERVICE" as MoneyCategory, paymentMode: "CASH" as PaymentMode, amount: "", date: new Date().toISOString().slice(0,10) });
  const [eForm, setEForm] = useState({ description: "", category: "OTHER" as MoneyCategory, paymentMode: "CASH" as PaymentMode, amount: "", date: new Date().toISOString().slice(0,10) });

  function handleAddIncome(e: React.FormEvent) {
    e.preventDefault();
    if (!iForm.description || !iForm.amount) return;
    addIncome({ ...iForm, amount: Number(iForm.amount) });
    toast("Income added");
    setIForm({ description: "", category: "SERVICE", paymentMode: "CASH", amount: "", date: new Date().toISOString().slice(0,10) });
    setIncomeOpen(false);
  }

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!eForm.description || !eForm.amount) return;
    addExpense({ ...eForm, amount: Number(eForm.amount) });
    toast("Expense added");
    setEForm({ description: "", category: "OTHER", paymentMode: "CASH", amount: "", date: new Date().toISOString().slice(0,10) });
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

      {/* Tabs */}
      <Tabs defaultValue="income">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="income">Income ({income.length})</TabsTrigger>
            <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIncomeOpen(true)}>
              <Plus className="size-4" aria-hidden />Add Income
            </Button>
            <Button size="sm" variant="outline" onClick={() => setExpenseOpen(true)}>
              <Plus className="size-4" aria-hidden />Add Expense
            </Button>
          </div>
        </div>

        <TabsContent value="income" className="mt-4">
          {income.length === 0 ? <EmptyState icon={TrendingUp} title="No income records" /> : (
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Mode</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
                </tr></thead>
                <tbody className="divide-y">
                  {income.map((i) => (
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
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          {expenses.length === 0 ? <EmptyState icon={TrendingDown} title="No expense records" /> : (
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Mode</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
                </tr></thead>
                <tbody className="divide-y">
                  {expenses.map((e) => (
                    <tr key={e.id} className="interactive-row">
                      <td className="px-4 py-3 text-caption">{formatDate(e.date)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground">{e.description}</p>
                        {e.entryNumber && <p className="text-caption">{e.entryNumber}</p>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-muted-foreground">{e.category}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{formatPaymentMode(e.paymentMode)}</td>
                      <td className="px-4 py-3 text-right"><MoneyDisplay amount={e.amount} variant="expense" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Income Dialog */}
      <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Income</DialogTitle></DialogHeader>
          <form onSubmit={handleAddIncome} className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="i-desc">Description *</Label>
                <Input id="i-desc" value={iForm.description} onChange={(e) => setIForm((p) => ({ ...p, description: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={iForm.category} onValueChange={(v) => setIForm((p) => ({ ...p, category: v as MoneyCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Payment Mode</Label>
                <Select value={iForm.paymentMode} onValueChange={(v) => setIForm((p) => ({ ...p, paymentMode: v as PaymentMode }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{formatPaymentMode(m)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-amount">Amount (₹) *</Label>
                <Input id="i-amount" type="number" min={1} value={iForm.amount} onChange={(e) => setIForm((p) => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-date">Date</Label>
                <Input id="i-date" type="date" value={iForm.date} onChange={(e) => setIForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIncomeOpen(false)}>Cancel</Button>
              <Button type="submit">Add Income</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="e-desc">Description *</Label>
                <Input id="e-desc" value={eForm.description} onChange={(e) => setEForm((p) => ({ ...p, description: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={eForm.category} onValueChange={(v) => setEForm((p) => ({ ...p, category: v as MoneyCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Payment Mode</Label>
                <Select value={eForm.paymentMode} onValueChange={(v) => setEForm((p) => ({ ...p, paymentMode: v as PaymentMode }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{formatPaymentMode(m)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-amount">Amount (₹) *</Label>
                <Input id="e-amount" type="number" min={1} value={eForm.amount} onChange={(e) => setEForm((p) => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-date">Date</Label>
                <Input id="e-date" type="date" value={eForm.date} onChange={(e) => setEForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setExpenseOpen(false)}>Cancel</Button>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
