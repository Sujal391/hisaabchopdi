"use client";

import { useState } from "react";
import { Phone, ArrowRightLeft, XCircle, Pencil, RotateCcw, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/common/status-badge";
import { EntryStatusTimeline } from "@/components/common/entry-status-timeline";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/common/toast-provider";
import { formatDateTime, formatDeviceType, formatPaymentMode } from "@/lib/format";
import { STATUS_CONFIG, EMPLOYEE_ALLOWED_TRANSITIONS } from "@/constants/statuses";
import type { EntryStatus } from "@/types";

interface ViewEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string | null;
}

export function ViewEntryModal({ open, onOpenChange, entryId }: ViewEntryModalProps) {
  const {
    entries,
    employees,
    currentUser,
    transferWork,
    cancelEntry,
    reopenEntry,
    addWorkNote,
    takeWork,
    updateStatus,
  } = useApp();
  const { toast } = useToast();

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferEmp, setTransferEmp] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [reopenOpen, setReopenOpen] = useState(false);
  
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<EntryStatus | "">("");
  const [statusNote, setStatusNote] = useState("");

  const entry = entries.find((e) => e.id === entryId);

  if (!entry) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <p className="py-6 text-center text-muted-foreground">Entry not found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const isEmployee = currentUser?.role === "EMPLOYEE";
  const isMyEntry =
    currentUser &&
    (entry.assignedToId === currentUser.id || entry.assignedToId === currentUser.employeeId);
  const allowedNextStatuses =
    isEmployee && isMyEntry ? (EMPLOYEE_ALLOWED_TRANSITIONS[entry.status] ?? []) : [];

  function handleTransfer() {
    if (!transferEmp || transferEmp === entry?.assignedToId) return;
    const emp = employees.find((e) => e.id === transferEmp);
    if (!emp) return;
    transferWork(entry!.id, emp.id, emp.name, "Transferred by admin");
    toast(`Transferred to ${emp.name}`);
    setTransferOpen(false);
    setTransferEmp("");
  }

  function handleCancel() {
    if (!cancelReason.trim()) return;
    cancelEntry(entry!.id, cancelReason.trim());
    toast("Entry cancelled");
    setCancelOpen(false);
    setCancelReason("");
  }

  function handleAddNote() {
    if (!newNote.trim()) return;
    addWorkNote(entry!.id, newNote.trim(), currentUser?.id || "user", currentUser?.name || "User");
    toast("Note added");
    setNoteOpen(false);
    setNewNote("");
  }

  function handleReopen() {
    reopenEntry(entry!.id);
    toast("Entry reopened");
    setReopenOpen(false);
  }

  function handleTakeWork() {
    if (!currentUser || !entry) return;
    takeWork(entry.id, currentUser);
    toast("You took the work!");
  }

  function handleUpdateStatus() {
    if (!newStatus || !currentUser || !entry) return;
    updateStatus(entry.id, newStatus, statusNote || undefined, currentUser.id, currentUser.name);
    toast(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
    setStatusOpen(false);
    setNewStatus("");
    setStatusNote("");
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-y-auto overflow-x-hidden flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0 sticky top-0 z-10 bg-popover/95 backdrop-blur">
            <div className="flex flex-col space-y-1">
              <DialogTitle className="flex items-center gap-3 flex-wrap">
                <span className="text-mono text-xl font-bold">{entry.entryNumber}</span>
                <StatusBadge status={entry.status} />
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-normal">
                {entry.brand} {entry.model}
              </p>
            </div>
        </DialogHeader>

          <div className="flex-1 px-6">
            <div className="flex flex-col gap-2">
              {/* Customer */}
              <section className="space-y-2">
                <p className="font-semibold text-foreground">Customer</p>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{entry.customerName}</p>
                    <p className="text-xs text-muted-foreground">{entry.customerMobile}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${entry.customerMobile}`}>
                      <Phone className="size-3.5 mr-1.5" aria-hidden />
                      Call
                    </a>
                  </Button>
                </div>
              </section>
              <Separator />

              {/* Device */}
              <section className="space-y-3">
                <p className="font-semibold text-foreground">Device</p>
                <dl className="grid grid-cols-1 gap-1.5 text-sm">
                  <Row label="Type" value={entry.deviceType === "OTHER" && entry.customDeviceType ? entry.customDeviceType : formatDeviceType(entry.deviceType)} />
                  <Row label="Brand" value={entry.brand} />
                  <Row label="Model" value={entry.model} />
                  {entry.serialNumber && <Row label="Serial No." value={entry.serialNumber} mono />}
                </dl>
              </section>
              <Separator />

              {/* Service */}
              <section className="space-y-3">
                <p className="font-semibold text-foreground">Service</p>
                <dl className="grid grid-cols-1 gap-1.5 text-sm">
                  <Row label="Type" value={entry.serviceType} />
                  <Row label="Complaint" value={entry.complaint} />
                  {entry.customerNotes && <Row label="Customer Notes" value={entry.customerNotes} />}
                  {entry.internalNotes && <Row label="Internal Notes" value={entry.internalNotes} />}
                </dl>
              </section>
              <Separator />

              {/* Financial */}
              <section className="space-y-3">
                <p className="font-semibold text-foreground">Financial</p>
                <dl className="grid grid-cols-1 gap-1.5 text-sm">
                  <Row label="Estimated" value={entry.estimatedAmount ? `₹${entry.estimatedAmount}` : "—"} />
                  <Row label="Advance" value={entry.advanceAmount ? `₹${entry.advanceAmount}` : "—"} />
                  <Row label="Final" value={entry.finalAmount ? `₹${entry.finalAmount}` : "—"} />
                  <Row label="Paid" value={entry.paidAmount ? `₹${entry.paidAmount}` : "—"} />
                  {entry.paidAmount !== undefined && entry.finalAmount !== undefined && (
                    <Row
                      label="Due"
                      value={`₹${entry.finalAmount - entry.paidAmount}`}
                      className={entry.finalAmount - entry.paidAmount > 0 ? "text-status-cancelled-fg" : "text-status-completed-fg"}
                    />
                  )}
                  {entry.paymentMode && <Row label="Payment Mode" value={formatPaymentMode(entry.paymentMode)} />}
                </dl>
              </section>
              <Separator />

              <section className="space-y-3">
                <p className="font-semibold text-foreground">Activity Timeline</p>
                <EntryStatusTimeline history={entry.statusHistory} />
              </section>
              </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t sticky bottom-0 z-10 bg-popover/95 backdrop-blur mt-auto flex-row justify-end items-center gap-2">
              {/* Employee Actions */}
              {isEmployee && entry.status === "NOT_STARTED" && !isMyEntry && (
                <Button size="xs" onClick={handleTakeWork}>
                  <Wrench className="size-3.5" aria-hidden />
                  Take Work
                </Button>
              )}
              {isEmployee && isMyEntry && allowedNextStatuses.length > 0 && (
                <Button size="xs" onClick={() => setStatusOpen(true)}>
                  Update Status
                </Button>
              )}

              {/* Common / Admin Actions */}
              <Button variant="secondary" size="lg" onClick={() => setNoteOpen(true)}>
                <Pencil className="size-3.5" aria-hidden />
                Add Note
              </Button>

              {!isEmployee && entry.assignedToId && entry.status !== "COMPLETED" && entry.status !== "CANCELLED" && (
                <Button variant="outline" size="lg" onClick={() => setTransferOpen(true)}>
                  <ArrowRightLeft className="size-3.5" aria-hidden />
                  Transfer
                </Button>
              )}
              {!isEmployee && entry.status !== "CANCELLED" && entry.status !== "COMPLETED" && (
                <Button variant="destructive" size="lg" onClick={() => setCancelOpen(true)}>
                  <XCircle className="size-3.5" aria-hidden />
                  Cancel
                </Button>
              )}
              {!isEmployee && (entry.status === "COMPLETED" || entry.status === "CANCELLED") && (
                <Button variant="outline" size="lg" onClick={() => setReopenOpen(true)}>
                  <RotateCcw className="size-3.5" aria-hidden />
                  Reopen
                </Button>
              )}
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Action Dialogs ──────────────────────────────── */}

      {/* Update Status Dialog (Employee) */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5 w-full">
              <Label htmlFor="next-status">New Status *</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as EntryStatus)}>
                <SelectTrigger id="next-status" className="w-full cursor-pointer">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {allowedNextStatuses.map((st) => (
                    <SelectItem key={st} value={st} className="cursor-pointer">
                      {STATUS_CONFIG[st].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 w-full">
              <Label htmlFor="status-note">Note / Work Done (optional)</Label>
              <Textarea
                id="status-note"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Details about what was done..."
                rows={3}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={!newStatus}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Work</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5 w-full">
              <Label>Current Employee</Label>
              <p className="text-sm text-muted-foreground">{entry?.assignedToName ?? "Unassigned"}</p>
            </div>
            <div className="space-y-1.5 w-full">
              <Label htmlFor="transfer-emp">New Employee *</Label>
              <Select value={transferEmp} onValueChange={setTransferEmp}>
                <SelectTrigger id="transfer-emp" className="w-full cursor-pointer">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter((e) => e.status === "ACTIVE" && e.id !== entry?.assignedToId).map((e) => (
                    <SelectItem key={e.id} value={e.id} className="cursor-pointer">{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={!transferEmp}>Transfer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Are you sure you want to cancel this entry?</p>
            <div className="space-y-1.5 w-full">
              <Label htmlFor="cancel-reason">Cancellation Reason *</Label>
              <Input
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer declined repair"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Back</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason.trim()}>Confirm Cancellation</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5 w-full">
              <Label htmlFor="new-note">Note *</Label>
              <Textarea
                id="new-note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter note here..."
                rows={4}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>Add Note</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reopen Dialog */}
      <Dialog open={reopenOpen} onOpenChange={setReopenOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reopen Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Reopening entry {entry.entryNumber}.</p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setReopenOpen(false)}>Cancel</Button>
            <Button onClick={handleReopen}>Reopen</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-foreground text-right ${mono ? "font-mono" : "font-medium"} ${className || ""}`}>{value}</span>
    </div>
  );
}
