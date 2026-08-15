export type AuditAction =
  | "ENTRY_CREATED"
  | "ENTRY_UPDATED"
  | "ENTRY_ASSIGNED"
  | "WORK_TAKEN"
  | "STATUS_CHANGED"
  | "WORK_COMPLETED"
  | "WORK_TRANSFERRED"
  | "ENTRY_CANCELLED"
  | "ENTRY_REOPENED"
  | "NOTE_ADDED"
  | "INCOME_ADDED"
  | "EXPENSE_ADDED"
  | "EMPLOYEE_CREATED"
  | "CUSTOMER_CREATED";

export interface AuditLog {
  id: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  targetId?: string;     // entry id, customer id, etc.
  targetLabel?: string;  // human readable, e.g. "#1025"
  description: string;   // human-friendly summary
  timestamp: string;     // ISO date string
}
