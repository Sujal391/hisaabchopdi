"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/common/page-header";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/common/toast-provider";
import type { DeviceType, PaymentMode } from "@/types";

export default function NewEntryPage() {
  const router = useRouter();
  const { createEntry, customers } = useApp();
  const { toast } = useToast();

  const [form, setForm] = useState({
    // Customer
    customerName: "",
    customerMobile: "",
    selectedCustomerId: "",
    // Device
    deviceType: "LAPTOP" as DeviceType,
    brand: "",
    model: "",
    serialNumber: "",
    // Service
    serviceType: "",
    complaint: "",
    customerNotes: "",
    internalNotes: "",
    accessories: "",
    physicalCondition: "",
    // Financial
    estimatedAmount: "",
    advanceAmount: "",
    paymentMode: "CASH" as PaymentMode,
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function selectCustomer(customerId: string) {
    const c = customers.find((c) => c.id === customerId);
    if (!c) return;
    setForm((prev) => ({
      ...prev,
      selectedCustomerId: customerId,
      customerName: c.name,
      customerMobile: c.mobile,
    }));
  }

  function validate(): boolean {
    const e: Partial<Record<string, string>> = {};
    if (!form.customerName.trim()) e.customerName = "Customer name is required";
    if (!form.customerMobile.trim()) e.customerMobile = "Mobile number is required";
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
      customerId: form.selectedCustomerId || `cust-new-${Date.now()}`,
      customerName: form.customerName.trim(),
      customerMobile: form.customerMobile.trim(),
      deviceType: form.deviceType,
      brand: form.brand.trim(),
      model: form.model.trim(),
      serialNumber: form.serialNumber.trim() || undefined,
      serviceType: form.serviceType.trim(),
      complaint: form.complaint.trim(),
      customerNotes: form.customerNotes.trim() || undefined,
      internalNotes: form.internalNotes.trim() || undefined,
      accessories: form.accessories.trim() || undefined,
      physicalCondition: form.physicalCondition.trim() || undefined,
      estimatedAmount: form.estimatedAmount ? Number(form.estimatedAmount) : undefined,
      advanceAmount: form.advanceAmount ? Number(form.advanceAmount) : undefined,
      paymentMode: form.advanceAmount ? form.paymentMode : undefined,
    });
    toast(`Entry ${entry.entryNumber} created successfully`);
    router.push(`/admin/entries/${entry.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <PageHeader
        title="New Service Entry"
        description="Fill in the details to create a new service entry."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/entries">
              <ArrowLeft className="size-4" aria-hidden />
              Cancel
            </Link>
          </Button>
        }
      />

      {/* ── Customer ─────────────────────────────────────── */}
      <section className="space-y-4">
        <p className="section-label">Customer</p>
        <Separator />

        {/* Existing customer picker */}
        <div className="space-y-1.5">
          <Label htmlFor="existing-customer">Select Existing Customer (optional)</Label>
          <Select onValueChange={selectCustomer}>
            <SelectTrigger id="existing-customer">
              <SelectValue placeholder="Search existing customers…" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} — {c.mobile}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={form.customerName}
              onChange={(e) => set("customerName", e.target.value)}
              placeholder="e.g. Ramesh Agarwal"
              aria-invalid={!!errors.customerName}
            />
            {errors.customerName && <p className="text-caption text-status-cancelled-fg">{errors.customerName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerMobile">Mobile Number *</Label>
            <Input
              id="customerMobile"
              type="tel"
              value={form.customerMobile}
              onChange={(e) => set("customerMobile", e.target.value)}
              placeholder="e.g. 9811234567"
              aria-invalid={!!errors.customerMobile}
            />
            {errors.customerMobile && <p className="text-caption text-status-cancelled-fg">{errors.customerMobile}</p>}
          </div>
        </div>
      </section>

      {/* ── Device ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <p className="section-label">Device / Product</p>
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="deviceType">Device Type *</Label>
            <Select value={form.deviceType} onValueChange={(v) => set("deviceType", v)}>
              <SelectTrigger id="deviceType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["LAPTOP","DESKTOP","PRINTER","MOBILE","TABLET","OTHER"] as DeviceType[]).map((t) => (
                  <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand *</Label>
            <Input
              id="brand"
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
              placeholder="e.g. Dell, HP, Lenovo"
              aria-invalid={!!errors.brand}
            />
            {errors.brand && <p className="text-caption text-status-cancelled-fg">{errors.brand}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              placeholder="e.g. Inspiron 15"
              aria-invalid={!!errors.model}
            />
            {errors.model && <p className="text-caption text-status-cancelled-fg">{errors.model}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              value={form.serialNumber}
              onChange={(e) => set("serialNumber", e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
      </section>

      {/* ── Service ────────────────────────────────────────── */}
      <section className="space-y-4">
        <p className="section-label">Service Details</p>
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select onValueChange={(v) => set("serviceType", v)}>
              <SelectTrigger id="serviceType" aria-invalid={!!errors.serviceType}>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {["Laptop Repair","Laptop Cleaning","Windows Installation","SSD Upgrade","Screen Replacement","Keyboard Replacement","Desktop Repair","Printer Repair","Data Recovery","Other"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceType && <p className="text-caption text-status-cancelled-fg">{errors.serviceType}</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="complaint">Complaint / Problem *</Label>
            <Textarea
              id="complaint"
              value={form.complaint}
              onChange={(e) => set("complaint", e.target.value)}
              placeholder="Describe the issue reported by the customer…"
              rows={3}
              aria-invalid={!!errors.complaint}
            />
            {errors.complaint && <p className="text-caption text-status-cancelled-fg">{errors.complaint}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="physicalCondition">Physical Condition</Label>
            <Input
              id="physicalCondition"
              value={form.physicalCondition}
              onChange={(e) => set("physicalCondition", e.target.value)}
              placeholder="e.g. Good, Scratches on lid"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accessories">Accessories Received</Label>
            <Input
              id="accessories"
              value={form.accessories}
              onChange={(e) => set("accessories", e.target.value)}
              placeholder="e.g. Charger, Bag"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="customerNotes">Customer Notes</Label>
            <Textarea
              id="customerNotes"
              value={form.customerNotes}
              onChange={(e) => set("customerNotes", e.target.value)}
              placeholder="Any additional notes from the customer…"
              rows={2}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="internalNotes">Internal Notes</Label>
            <Textarea
              id="internalNotes"
              value={form.internalNotes}
              onChange={(e) => set("internalNotes", e.target.value)}
              placeholder="Notes for technicians (not visible to customer)…"
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* ── Financial ──────────────────────────────────────── */}
      <section className="space-y-4">
        <p className="section-label">Financial</p>
        <Separator />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="estimatedAmount">Estimated Amount (₹)</Label>
            <Input
              id="estimatedAmount"
              type="number"
              min={0}
              value={form.estimatedAmount}
              onChange={(e) => set("estimatedAmount", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="advanceAmount">Advance Received (₹)</Label>
            <Input
              id="advanceAmount"
              type="number"
              min={0}
              value={form.advanceAmount}
              onChange={(e) => set("advanceAmount", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paymentMode">Payment Mode</Label>
            <Select value={form.paymentMode} onValueChange={(v) => set("paymentMode", v)}>
              <SelectTrigger id="paymentMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["CASH","UPI","CARD","BANK_TRANSFER","OTHER"] as PaymentMode[]).map((m) => (
                  <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create Entry"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/entries">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
