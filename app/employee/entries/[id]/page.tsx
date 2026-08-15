"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/common/status-badge";
import { MoneyDisplay } from "@/components/common/money-display";
import { EntryStatusTimeline } from "@/components/common/entry-status-timeline";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/common/toast-provider";
import { formatDateTime, formatDeviceType, formatPaymentMode } from "@/lib/format";
import { STATUS_CONFIG, EMPLOYEE_ALLOWED_TRANSITIONS } from "@/constants/statuses";
import type { EntryStatus } from "@/types";

export default function EmployeeEntryDetailPage({ params }: PageProps<"/employee/entries/[id]">) {
  const { entries, currentUser, updateStatus, takeWork, addWorkNote } = useApp();
  const { toast } = useToast();
  const { id } = params as unknown as { id: string };
  const entry = entries.find((e) => e.id === id);

  const [statusOpen, setStatusOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [takeOpen, setTakeOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<EntryStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [note, setNote] = useState("");

  if (!entry || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="text-muted-foreground">Entry not found.</p>
        <Button variant="outline" asChild>
          <Link href="/employee/entries"><ArrowLeft className="size-4" />Back</Link>
        </Button>
      </div>
    );
  }

  const isMyEntry =
    entry.assignedToId === currentUser.id ||
    entry.assignedToId === currentUser.employeeId;

  const allowedNextStatuses =
    isMyEntry ? (EMPLOYEE_ALLOWED_TRANSITIONS[entry.status] ?? []) : [];

  function handleUpdateStatus() {
    if (!newStatus || !currentUser || !entry) return;
    updateStatus(entry.id, newStatus, statusNote || undefined, currentUser.id, currentUser.name);
    toast(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
    setStatusOpen(false);
    setNewStatus("");
    setStatusNote("");
  }

  function handleTake() {
    if (!currentUser || !entry) return;
    takeWork(entry.id, currentUser);
    toast("You took the work!");
    setTakeOpen(false);
  }

  function handleNote() {
    if (!note.trim() || !currentUser || !entry) return;
    addWorkNote(entry.id, note.trim(), currentUser.id, currentUser.name);
    toast("Note added");
    setNoteOpen(false);
    setNote("");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/employee/entries"><ArrowLeft className="size-4" aria-hidden />Back to Entries</Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-mono text-2xl font-bold">{entry.entryNumber}</span>
            <StatusBadge status={entry.status} />
          </div>
          <p className="text-muted-foreground">{entry.brand} {entry.model}</p>
          <p className="text-caption">Created {formatDateTime(entry.createdAt)}</p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {entry.status === "NOT_STARTED" && !isMyEntry && (
            <Button size="sm" onClick={() => setTakeOpen(true)}>Take Work</Button>
          )}
          {isMyEntry && allowedNextStatuses.length > 0 && (
            <Button size="sm" onClick={() => setStatusOpen(true)}>Update Status</Button>
          )}
          {isMyEntry && (
            <Button variant="outline" size="sm" onClick={() => setNoteOpen(true)}>
              <Pencil className="size-3.5" aria-hidden />Note
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="space-y-3">
            <p className="section-label">Customer</p>
            <p className="text-sm font-medium text-foreground">{entry.customerName}</p>
            <p className="text-caption">{entry.customerMobile}</p>
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${entry.customerMobile}`}><Phone className="size-3.5" />Call</a>
            </Button>
          </section>

          <section className="space-y-3">
            <p className="section-label">Device</p>
            <dl className="space-y-1.5 text-sm">
              <Row label="Type" value={formatDeviceType(entry.deviceType)} />
              <Row label="Brand" value={entry.brand} />
              <Row label="Model" value={entry.model} />
              {entry.serialNumber && <Row label="Serial" value={entry.serialNumber} mono />}
            </dl>
          </section>

          <section className="space-y-3">
            <p className="section-label">Service</p>
            <dl className="space-y-1.5 text-sm">
              <Row label="Type" value={entry.serviceType} />
              <Row label="Complaint" value={entry.complaint} />
              {entry.physicalCondition && <Row label="Condition" value={entry.physicalCondition} />}
              {entry.accessories && <Row label="Accessories" value={entry.accessories} />}
              {entry.customerNotes && <Row label="Cust. Notes" value={entry.customerNotes} />}
              {entry.internalNotes && <Row label="Internal" value={entry.internalNotes} />}
            </dl>
          </section>

          <section className="space-y-3">
            <p className="section-label">Payment</p>
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="w-28 text-muted-foreground">Estimated</dt>
                <dd><MoneyDisplay amount={entry.estimatedAmount} showDash /></dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 text-muted-foreground">Advance</dt>
                <dd><MoneyDisplay amount={entry.advanceAmount} showDash /></dd>
              </div>
              {entry.paymentMode && <Row label="Mode" value={formatPaymentMode(entry.paymentMode)} />}
            </dl>
          </section>
        </div>

        <div className="space-y-3">
          <p className="section-label">Activity Timeline</p>
          <EntryStatusTimeline history={entry.statusHistory} />
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={takeOpen}
        onOpenChange={setTakeOpen}
        title="Take this work?"
        description={`You will be assigned to ${entry.entryNumber} — ${entry.customerName}`}
        confirmLabel="Take Work"
        onConfirm={handleTake}
      />

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Current Status</Label>
              <StatusBadge status={entry.status} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-status">New Status *</Label>
              <Select onValueChange={(v) => setNewStatus(v as EntryStatus)}>
                <SelectTrigger id="new-status"><SelectValue placeholder="Select new status" /></SelectTrigger>
                <SelectContent>
                  {allowedNextStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status-note">Note (optional)</Label>
              <Textarea id="status-note" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows={2} placeholder="Describe the update…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={!newStatus}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="emp-note">Note</Label>
            <Textarea id="emp-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Work update, parts needed, etc." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={handleNote} disabled={!note.trim()}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd className={mono ? "text-mono" : "text-foreground"}>{value}</dd>
    </div>
  );
}
