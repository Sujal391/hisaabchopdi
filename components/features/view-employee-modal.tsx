"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerAvatar } from "@/components/common/customer-avatar";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/common/toast-provider";
import { formatDate, formatRelative } from "@/lib/format";
import { Wrench } from "lucide-react";

interface ViewEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string | null;
  onSelectEntry?: (entryId: string) => void;
}

export function ViewEmployeeModal({
  open,
  onOpenChange,
  employeeId,
  onSelectEntry,
}: ViewEmployeeModalProps) {
  const { employees, entries, toggleEmployeeStatus } = useApp();
  const { toast } = useToast();

  const employee = employees.find((e) => e.id === employeeId);
  const empEntries = employeeId
    ? entries.filter((e) => e.assignedToId === employeeId || e.assignedToId === employee?.employeeId)
    : [];
  const currentWork = empEntries.filter(
    (e) => e.status === "IN_PROGRESS" || e.status === "WAITING"
  );
  const completedWork = empEntries.filter((e) => e.status === "COMPLETED");

  if (!employee) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <p className="py-6 text-center text-muted-foreground">Employee not found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  function handleToggleStatus() {
    if (!employee) return;
    toggleEmployeeStatus(employee.id);
    toast(`${employee.name} marked as ${employee.status === "ACTIVE" ? "Inactive" : "Active"}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-y-auto overflow-x-hidden flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0 sticky top-0 z-10 bg-popover/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <CustomerAvatar name={employee.name} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold">{employee.name}</DialogTitle>
                <Badge variant={employee.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                  {employee.status === "ACTIVE" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs font-mono text-muted-foreground">{employee.employeeId}</p>
            </div>
          </div>
          <Button
            variant={employee.status === "ACTIVE" ? "outline" : "default"}
            size="sm"
            onClick={handleToggleStatus}
            className="shrink-0"
          >
            {employee.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </Button>
        </DialogHeader>

        <div className="flex-1 px-6">
          <div className="grid grid-cols-1 gap-6 py-6">
            {/* Employee Info */}
            <section className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Employee Information
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm bg-muted/40 p-3 rounded-md">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs font-semibold text-foreground">{employee.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="font-medium text-foreground">{employee.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined Date</span>
                  <span className="font-medium text-foreground">{formatDate(employee.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Jobs</span>
                  <span className="font-semibold text-foreground">{currentWork.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed Jobs</span>
                  <span className="font-semibold text-foreground">{completedWork.length}</span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Active Jobs */}
            <section className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current Active Jobs ({currentWork.length})
              </p>
              {currentWork.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No active jobs assigned.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {currentWork.map((e) => (
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
                          <span className="text-xs text-foreground truncate">{e.customerName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {e.brand} {e.model} · {e.serviceType}
                        </p>
                      </div>
                      <StatusBadge status={e.status} showIcon={false} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Separator />

            {/* Recent Work History */}
            <section className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Work History ({empEntries.length})
              </p>
              {empEntries.length === 0 ? (
                <EmptyState icon={Wrench} title="No work records yet" />
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {empEntries.slice(0, 10).map((e) => (
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
                          <span className="text-xs text-foreground truncate">{e.customerName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {e.brand} {e.model} · {formatRelative(e.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={e.status} showIcon={false} />
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
