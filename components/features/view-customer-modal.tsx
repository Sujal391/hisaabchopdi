"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon, ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerAvatar } from "@/components/common/customer-avatar";
import { MoneyDisplay } from "@/components/common/money-display";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { useApp } from "@/contexts/app-context";
import { formatDate, formatRelative } from "@/lib/format";

interface ViewCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  onSelectEntry?: (entryId: string) => void;
}

export function ViewCustomerModal({
  open,
  onOpenChange,
  customerId,
  onSelectEntry,
}: ViewCustomerModalProps) {
  const { customers, entries } = useApp();

  const customer = customers.find((c) => c.id === customerId);
  const custEntries = customerId ? entries.filter((e) => e.customerId === customerId) : [];
  const totalSpent = custEntries.reduce((sum, e) => sum + (e.paidAmount ?? 0), 0);
  const lastEntry = [...custEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  if (!customer) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <p className="py-6 text-center text-muted-foreground">Customer not found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0 sticky top-0 z-10 bg-popover/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <CustomerAvatar name={customer.name} size="md" />
            <div>
              <DialogTitle className="text-xl font-bold">{customer.name}</DialogTitle>
              <p className="text-xs text-muted-foreground">{customer.mobile}</p>
            </div>
          </div>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
              <XIcon className="size-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4 min-h-0">
          <div className="grid grid-cols-1 gap-4">
            {/* Customer Details */}
            <section className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Customer Details
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm bg-muted/40 p-3 rounded-md">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="font-medium text-foreground">{customer.mobile}</span>
                </div>
                {customer.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-medium text-foreground text-right">{customer.address}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium text-foreground">{formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Summary Cards */}
            <section className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Summary
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-md border bg-card p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Visits</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{custEntries.length}</p>
                </div>
                <div className="rounded-md border bg-card p-3 text-center">
                  <p className="text-xs text-muted-foreground">Last Visit</p>
                  <p className="text-sm font-semibold text-foreground mt-1 truncate">
                    {lastEntry ? formatRelative(lastEntry.createdAt) : "—"}
                  </p>
                </div>
                <div className="rounded-md border bg-card p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <MoneyDisplay amount={totalSpent} className="text-lg font-bold mt-0.5 block" />
                </div>
              </div>
            </section>

            <Separator />

            {/* Service History */}
            <section className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Service History ({custEntries.length})
              </p>
              {custEntries.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No service records yet" />
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {custEntries.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => onSelectEntry && onSelectEntry(e.id)}
                      className="flex items-center justify-between gap-3 rounded-md border bg-card p-3 interactive-row cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {e.entryNumber}
                          </span>
                          <span className="text-xs text-foreground truncate">{e.serviceType}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {e.brand} {e.model} · {formatRelative(e.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {e.finalAmount !== undefined && <MoneyDisplay amount={e.finalAmount} className="text-xs" />}
                        <StatusBadge status={e.status} showIcon={false} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
