"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/common/toast-provider";
import { DatePicker, formatYMD } from "@/components/common/date-picker";
import type { DeviceType, PaymentMode } from "@/types";

interface NewEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (entryId: string) => void;
}

export function NewEntryModal({ open, onOpenChange, onSuccess }: NewEntryModalProps) {
  const { createEntry, customers } = useApp();
  const { toast } = useToast();

  const [form, setForm] = useState({
    // Customer
    customerName: "",
    customerMobile: "",
    // Device
    deviceType: "LAPTOP" as DeviceType,
    customDeviceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    // Service
    serviceType: "",
    complaint: "",
    customerNotes: "",
    internalNotes: "",
    expectedDate: "",
    // Financial
    estimatedAmount: "",
    advanceAmount: "",
    paymentMode: "CASH" as PaymentMode,
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setForm({
      customerName: "", customerMobile: "",
      deviceType: "LAPTOP", customDeviceType: "", brand: "", model: "", serialNumber: "",
      serviceType: "", complaint: "", customerNotes: "", internalNotes: "",
      expectedDate: "",
      estimatedAmount: "", advanceAmount: "", paymentMode: "CASH",
    });
    setErrors({});
    setSubmitting(false);
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }


  function validate(): boolean {
    const e: Partial<Record<string, string>> = {};
    if (!form.customerName.trim()) e.customerName = "Name is required";
    if (!form.customerMobile.trim()) e.customerMobile = "Mobile is required";
    if (form.deviceType === "OTHER" && !form.customDeviceType.trim()) e.customDeviceType = "Device type is required";
    if (!form.brand.trim()) e.brand = "Brand is required";
    if (!form.model.trim()) e.model = "Model is required";
    if (!form.serviceType.trim()) e.serviceType = "Service type is required";
    if (!form.complaint.trim()) e.complaint = "Complaint is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const entry = createEntry({
      status: "NOT_STARTED",
      customerId: `cust-new-${Date.now()}`,
      customerName: form.customerName.trim(),
      customerMobile: form.customerMobile.trim(),
      deviceType: form.deviceType,
      customDeviceType: form.deviceType === "OTHER" ? form.customDeviceType.trim() : undefined,
      brand: form.brand.trim(),
      model: form.model.trim(),
      serialNumber: form.serialNumber.trim() || undefined,
      serviceType: form.serviceType.trim(),
      complaint: form.complaint.trim(),
      customerNotes: form.customerNotes.trim() || undefined,
      internalNotes: form.internalNotes.trim() || undefined,
      estimatedAmount: form.estimatedAmount ? Number(form.estimatedAmount) : undefined,
      advanceAmount: form.advanceAmount ? Number(form.advanceAmount) : undefined,
      paymentMode: form.advanceAmount ? form.paymentMode : undefined,
    });
    toast(`Entry ${entry.entryNumber} created successfully`);
    handleOpenChange(false);
    if (onSuccess) onSuccess(entry.id);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-xl p-0 overflow-y-auto overflow-x-hidden flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0 sticky top-0 z-10 bg-popover/95 backdrop-blur">
          <DialogTitle>New Service Entry</DialogTitle>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon-sm" className="shrink-0 -mr-2 text-muted-foreground hover:text-foreground">
              <XIcon className="size-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        </DialogHeader>
        
        <div className="flex-1 px-6">
          <form id="new-entry-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* ── Customer ─────────────────────────────────────── */}
            <section className="space-y-3">
              {/* <p className="font-semibold text-foreground">Customer</p> */}
              {/* <Separator /> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={form.customerName}
                    onChange={(e) => set("customerName", e.target.value)}
                    placeholder="e.g. Ramesh Agarwal"
                    aria-invalid={!!errors.customerName}
                    className="w-full"
                  />
                  {errors.customerName && <p className="text-xs text-status-cancelled-fg">{errors.customerName}</p>}
                </div>
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="customerMobile">Mobile Number *</Label>
                  <Input
                    id="customerMobile"
                    type="tel"
                    value={form.customerMobile}
                    onChange={(e) => set("customerMobile", e.target.value)}
                    placeholder="e.g. 9811234567"
                    aria-invalid={!!errors.customerMobile}
                    className="w-full"
                  />
                  {errors.customerMobile && <p className="text-xs text-status-cancelled-fg">{errors.customerMobile}</p>}
                </div>
              </div>
            </section>

            {/* ── Device ─────────────────────────────────────────── */}
            <section className="space-y-3">
              {/* <p className="font-semibold text-foreground">Device / Product</p>
              <Separator /> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="deviceType">Device Type *</Label>
                  <Select value={form.deviceType} onValueChange={(v) => set("deviceType", v)}>
                    <SelectTrigger id="deviceType" className="w-full cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["LAPTOP","DESKTOP","PRINTER","MOBILE","TABLET","OTHER"] as DeviceType[]).map((t) => (
                        <SelectItem key={t} value={t} className="cursor-pointer">{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.deviceType === "OTHER" && (
                  <div className="space-y-1.5 w-full">
                    <Label htmlFor="customDeviceType">Custom Device Type *</Label>
                    <Input id="customDeviceType" value={form.customDeviceType} onChange={(e) => set("customDeviceType", e.target.value)} placeholder="e.g. Smartwatch" aria-invalid={!!errors.customDeviceType} className="w-full" />
                    {errors.customDeviceType && <p className="text-xs text-status-cancelled-fg">{errors.customDeviceType}</p>}
                  </div>
                )}
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input id="brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Dell, HP" aria-invalid={!!errors.brand} className="w-full" />
                  {errors.brand && <p className="text-xs text-status-cancelled-fg">{errors.brand}</p>}
                </div>
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="model">Model *</Label>
                  <Input id="model" value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. Inspiron 15" aria-invalid={!!errors.model} className="w-full" />
                  {errors.model && <p className="text-xs text-status-cancelled-fg">{errors.model}</p>}
                </div>
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input id="serialNumber" value={form.serialNumber} onChange={(e) => set("serialNumber", e.target.value)} placeholder="Optional" className="w-full" />
                </div>
              </div>
            </section>

            {/* ── Service ────────────────────────────────────────── */}
            <section className="space-y-3">
              {/* <p className="font-semibold text-foreground">Service Details</p>
              <Separator /> */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Input id="serviceType" value={form.serviceType} onChange={(e) => set("serviceType", e.target.value)} placeholder="e.g. Screen Replacement" aria-invalid={!!errors.serviceType} className="w-full" />
                  {errors.serviceType && <p className="text-xs text-status-cancelled-fg">{errors.serviceType}</p>}
                </div>
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="expectedDate">Expected Delivery Date</Label>
                  <DatePicker date={form.expectedDate} onSelect={(d) => set("expectedDate", d ? formatYMD(d) : "")} placeholder="Select delivery date" className="w-full" />
                </div>
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="complaint">Complaint / Problem *</Label>
                  <Textarea id="complaint" value={form.complaint} onChange={(e) => set("complaint", e.target.value)} placeholder="Describe the issue…" rows={3} aria-invalid={!!errors.complaint} className="w-full" />
                  {errors.complaint && <p className="text-xs text-status-cancelled-fg">{errors.complaint}</p>}
                </div>
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="customerNotes">Customer Notes</Label>
                  <Textarea id="customerNotes" value={form.customerNotes} onChange={(e) => set("customerNotes", e.target.value)} placeholder="Any additional notes…" rows={2} className="w-full" />
                </div>
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="internalNotes">Internal Notes</Label>
                  <Textarea id="internalNotes" value={form.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} placeholder="Internal notes…" rows={2} className="w-full" />
                </div>
              </div>
            </section>

            {/* ── Financial ──────────────────────────────────────── */}
            <section className="space-y-3">
              {/* <p className="font-semibold text-foreground">Financial</p>
              <Separator /> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="estimatedAmount">Estimated Amount (₹)</Label>
                  <Input id="estimatedAmount" type="number" min={0} value={form.estimatedAmount} onChange={(e) => set("estimatedAmount", e.target.value)} placeholder="0" className="w-full" />
                </div>
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="advanceAmount">Advance Received (₹)</Label>
                  <Input id="advanceAmount" type="number" min={0} value={form.advanceAmount} onChange={(e) => set("advanceAmount", e.target.value)} placeholder="0" className="w-full" />
                </div>
              </div>
                <div className="space-y-1.5 w-full">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select value={form.paymentMode} onValueChange={(v) => set("paymentMode", v)}>
                    <SelectTrigger id="paymentMode" className="w-full cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["CASH","UPI","CARD","BANK_TRANSFER","OTHER"] as PaymentMode[]).map((m) => (
                        <SelectItem key={m} value={m} className="cursor-pointer">{m.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </section>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t flex justify-end gap-3 shrink-0 bg-popover/95 backdrop-blur sticky bottom-0 z-10">
          <Button type="button" variant="outline" className="cursor-pointer" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button type="submit" className="cursor-pointer" form="new-entry-form" disabled={submitting}>
            {submitting ? "Creating…" : "Create Entry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
