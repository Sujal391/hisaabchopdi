"use client";

import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/common/status-badge";
import { MoneyDisplay } from "@/components/common/money-display";
import { CustomerAvatar } from "@/components/common/customer-avatar";
import { EmptyState } from "@/components/common/empty-state";
import { useApp } from "@/contexts/app-context";
import { formatDate, formatRelative } from "@/lib/format";
import { ClipboardList } from "lucide-react";

export default function CustomerDetailPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { customers, entries } = useApp();
  const { id } = params as unknown as { id: string };
  const customer = customers.find((c) => c.id === id);
  const custEntries = entries.filter((e) => e.customerId === id);
  const totalSpent = custEntries.reduce((sum, e) => sum + (e.paidAmount ?? 0), 0);
  const lastEntry = custEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="text-muted-foreground">Customer not found.</p>
        <Button variant="outline" asChild><Link href="/admin/customers"><ArrowLeft className="size-4" />Back</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/customers"><ArrowLeft className="size-4" aria-hidden />Back to Customers</Link>
      </Button>

      {/* Profile */}
      <div className="flex items-start gap-4">
        <CustomerAvatar name={customer.name} size="lg" />
        <div className="space-y-1">
          <h1 className="page-title">{customer.name}</h1>
          <p className="text-muted-foreground text-sm">{customer.mobile}</p>
          {customer.email && <p className="text-caption">{customer.email}</p>}
          {customer.address && <p className="text-caption">{customer.address}</p>}
          <p className="text-caption">Member since {formatDate(customer.createdAt)}</p>
        </div>
      </div>

      <Button variant="outline" size="sm" asChild>
        <a href={`tel:${customer.mobile}`}><Phone className="size-3.5" aria-hidden />Call</a>
      </Button>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Visits", value: custEntries.length },
          { label: "Last Visit", value: lastEntry ? formatRelative(lastEntry.createdAt) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-caption">{label}</p>
            <p className="text-lg font-semibold text-foreground mt-1">{value}</p>
          </div>
        ))}
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-caption">Total Spent</p>
          <MoneyDisplay amount={totalSpent} className="text-lg font-semibold mt-1 block" />
        </div>
      </div>

      <Separator />

      {/* Service History */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Service History</h2>
        {custEntries.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No entries yet" />
        ) : (
          <div className="space-y-2">
            {custEntries.map((e) => (
              <Link key={e.id} href={`/admin/entries/${e.id}`} className="flex items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3 interactive-card">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-mono text-xs font-semibold">{e.entryNumber}</span>
                    <span className="text-sm text-foreground truncate">{e.serviceType}</span>
                  </div>
                  <p className="text-caption mt-0.5">{e.brand} {e.model} · {formatRelative(e.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {e.finalAmount !== undefined && <MoneyDisplay amount={e.finalAmount} />}
                  <StatusBadge status={e.status} showIcon={false} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
