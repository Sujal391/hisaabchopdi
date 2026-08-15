"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, ArrowRightLeft, XCircle, RotateCcw, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/common/status-badge";
import { MoneyDisplay } from "@/components/common/money-display";
import { EntryStatusTimeline } from "@/components/common/entry-status-timeline";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/common/toast-provider";
import { formatDate, formatDateTime, formatDeviceType, formatPaymentMode } from "@/lib/format";
import type { EntryStatus } from "@/types";

const CANCEL_REASONS = [
  "Customer Cancelled",
  "Duplicate Entry",
  "Wrong Entry",
  "Not Repairable",
  "Other",
];

export default function AdminEntryDetailPage({ params }: PageProps<"/admin/entries/[id]">) {
  const router = useRouter();
  const { entries, employees, cancelEntry, reopenEntry, transferWork, updateStatus, addWorkNote, currentUser } = useApp();
  const { toast } = useToast();

  const [transferOpen, setTransferOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);

  const [transferEmployeeId, setTransferEmployeeId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [note, setNote] = useState("");

  // params is a Promise in Next.js 16
  const { id } = (params as unknown as { id: string });
  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="text-muted-foreground">Entry not found.</p>
        <Button variant="outline" asChild>
          <Link href="/admin/entries"><ArrowLeft className="size-4" />Back to Entries</Link>
        </Button>
      </div>
    );
  }

  const activeEmployees = employees.filter((e) => e.status === "ACTIVE" && e.id !== entry.assignedToId);

  function handleTransfer() {
    if (!transferEmployeeId || !transferReason.trim() || !entry) return;
    const emp = employees.find((e) => e.id === transferEmployeeId);
    if (!emp) return;
    transferWork(entry.id, emp.id, emp.name, transferReason);
    toast(`Entry transferred to ${emp.name}`);
    setTransferOpen(false);
    setTransferEmployeeId("");
    setTransferReason("");
  }

  function handleCancel() {
    if (!cancelReason || !entry) return;
    cancelEntry(entry.id, cancelReason);
    toast("Entry cancelled");
    setCancelOpen(false);
  }

  function handleReopen() {
    if (!entry) return;
    reopenEntry(entry.id);
    toast("Entry reopened");
    setReopenOpen(false);
  }

  function handleAddNote() {
    if (!note.trim() || !currentUser || !entry) return;
    addWorkNote(entry.id, note.trim(), currentUser.id, currentUser.name);
    toast("Note added");
    setNoteOpen(false);
    setNote("");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/entries">
          <ArrowLeft className="size-4" aria-hidden />
          Back to Entries
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-mono text-2xl font-bold">{entry.entryNumber}</span>
            <StatusBadge status={entry.status} />
          </div>
          <p className="text-muted-foreground">
            {entry.brand} {entry.model} — {formatDeviceType(entry.deviceType)}
          </p>
          <p className="text-caption">Created {formatDateTime(entry.createdAt)}</p>
        </div>

        {/* Admin actions */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setNoteOpen(true)}>
            <Pencil className="size-3.5" aria-hidden />
            Add Note
          </Button>
          {entry.assignedToId && entry.status !== "COMPLETED" && entry.status !== "CANCELLED" && (
            <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
              <ArrowRightLeft className="size-3.5" aria-hidden />
              Transfer
            </Button>
          )}
          {entry.status !== "CANCELLED" && entry.status !== "COMPLETED" && (
            <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
              <XCircle className="size-3.5" aria-hidden />
              Cancel
            </Button>
          )}
          {(entry.status === "COMPLETED" || entry.status === "CANCELLED") && (
            <Button variant="outline" size="sm" onClick={() => setReopenOpen(true)}>
              <RotateCcw className="size-3.5" aria-hidden />
              Reopen
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Customer */}
          <section className="space-y-3">
            <p className="section-label">Customer</p>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{entry.customerName}</p>
              <p className="text-caption">{entry.customerMobile}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${entry.customerMobile}`}>
                <Phone className="size-3.5" aria-hidden />
                Call Customer
              </a>
            </Button>
          </section>

          {/* Device */}
          <section className="space-y-3">
            <p className="section-label">Device</p>
            <dl className="space-y-1.5 text-sm">
              <Row label="Type" value={formatDeviceType(entry.deviceType)} />
              <Row label="Brand" value={entry.brand} />
              <Row label="Model" value={entry.model} />
              {entry.serialNumber && <Row label="Serial No." value={entry.serialNumber} mono />}
            </dl>
          </section>

          {/* Service */}
          <section className="space-y-3">
            <p className="section-label">Service</p>
            <dl className="space-y-1.5 text-sm">
              <Row label="Type" value={entry.serviceType} />
              <Row label="Complaint" value={entry.complaint} />
              {entry.physicalCondition && <Row label="Condition" value={entry.physicalCondition} />}
              {entry.accessories && <Row label="Accessories" value={entry.accessories} />}
              {entry.customerNotes && <Row label="Customer Notes" value={entry.customerNotes} />}
              {entry.internalNotes && <Row label="Internal Notes" value={entry.internalNotes} />}
            </dl>
          </section>

          {/* Financial */}
          <section className="space-y-3">
            <p className="section-label">Financial</p>
            <dl className="space-y-1.5 text-sm">
              <MoneyRow label="Estimated" amount={entry.estimatedAmount} />
              <MoneyRow label="Advance" amount={entry.advanceAmount} />
              <MoneyRow label="Final" amount={entry.finalAmount} />
              <MoneyRow label="Paid" amount={entry.paidAmount} variant="income" />
              {entry.paidAmount !== undefined && entry.finalAmount !== undefined && (
                <MoneyRow
                  label="Due"
                  amount={entry.finalAmount - entry.paidAmount}
                  variant={entry.finalAmount - entry.paidAmount > 0 ? "expense" : "income"}
                />
              )}
              {entry.paymentMode && <Row label="Payment Mode" value={formatPaymentMode(entry.paymentMode)} />}
            </dl>
          </section>

          {/* Assignment */}
          {entry.assignedToName && (
            <section className="space-y-3">
              <p className="section-label">Assignment</p>
              <dl className="space-y-1.5 text-sm">
                <Row label="Assigned To" value={entry.assignedToName} />
                {entry.takenAt && <Row label="Started At" value={formatDateTime(entry.takenAt)} />}
                {entry.completedAt && <Row label="Completed At" value={formatDateTime(entry.completedAt)} />}
              </dl>
            </section>
          )}

          {/* Cancellation */}
          {entry.cancellationReason && (
            <section className="space-y-3">
              <p className="section-label">Cancellation</p>
              <p className="text-sm text-muted-foreground">{entry.cancellationReason}</p>
            </section>
          )}
        </div>

        {/* Right column — Timeline */}
        <div className="space-y-3">
          <p className="section-label">Activity Timeline</p>
          <EntryStatusTimeline history={entry.statusHistory} />
        </div>
      </div>

      {/* ── Transfer Dialog ──────────────────────────────── */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Work</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Current Employee</Label>
              <p className="text-sm text-muted-foreground">{entry.assignedToName ?? "Unassigned"}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transfer-emp">New Employee *</Label>
              <Select onValueChange={setTransferEmployeeId}>
                <SelectTrigger id="transfer-emp">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {activeEmployees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.employeeId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transfer-reason">Reason *</Label>
              <Textarea
                id="transfer-reason"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="Why is this being transferred?"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={!transferEmployeeId || !transferReason.trim()}>
              Transfer Work
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Dialog ────────────────────────────────── */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {entry.entryNumber} as cancelled. Select a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="cancel-reason">Reason *</Label>
            <Select onValueChange={setCancelReason}>
              <SelectTrigger id="cancel-reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Entry</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason}>
                Cancel Entry
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reopen Dialog ────────────────────────────────── */}
      <ConfirmDialog
        open={reopenOpen}
        onOpenChange={setReopenOpen}
        title="Reopen this entry?"
        description={`Entry ${entry.entryNumber} will be marked as Reopened and can be reassigned.`}
        confirmLabel="Reopen"
        onConfirm={handleReopen}
      />

      {/* ── Add Note Dialog ──────────────────────────────── */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Work Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an internal note or update…"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNote} disabled={!note.trim()}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className={mono ? "text-mono" : "text-foreground"}>{value}</dd>
    </div>
  );
}

function MoneyRow({ label, amount, variant }: {
  label: string;
  amount?: number;
  variant?: "income" | "expense";
}) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd>
        <MoneyDisplay amount={amount} showDash variant={variant ?? "default"} />
      </dd>
    </div>
  );
}
