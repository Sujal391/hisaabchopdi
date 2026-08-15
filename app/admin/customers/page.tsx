"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { CustomerAvatar } from "@/components/common/customer-avatar";
import { EmptyState } from "@/components/common/empty-state";
import { useApp } from "@/contexts/app-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/components/common/toast-provider";
import { formatDate } from "@/lib/format";

export default function CustomersPage() {
  const { customers, entries, createCustomer } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", email: "", address: "" });
  const debouncedSearch = useDebounce(search, 250);

  const filtered = customers.filter((c) => {
    const q = debouncedSearch.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.mobile.includes(q);
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) return;
    createCustomer({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
    });
    toast(`Customer ${form.name} added`);
    setForm({ name: "", mobile: "", email: "", address: "" });
    setAddOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage customer records and service history."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Add Customer
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by name or mobile…"
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description="Add your first customer to get started." />
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Total Entries</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Member Since</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((customer) => {
                const custEntries = entries.filter((e) => e.customerId === customer.id);
                return (
                  <tr key={customer.id} className="interactive-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CustomerAvatar name={customer.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{customer.name}</p>
                          {customer.email && <p className="text-caption">{customer.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{customer.mobile}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{custEntries.length}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-caption">{formatDate(customer.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="xs" asChild>
                        <Link href={`/admin/customers/${customer.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cust-name">Name *</Label>
                <Input id="cust-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-mobile">Mobile *</Label>
                <Input id="cust-mobile" type="tel" value={form.mobile} onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} placeholder="10-digit number" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-email">Email</Label>
                <Input id="cust-email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-address">Address</Label>
                <Input id="cust-address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Optional" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit">Add Customer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
