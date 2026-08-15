export type EntryStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "WAITING"
  | "COMPLETED"
  | "CANCELLED"
  | "REOPENED";

export type PaymentMode = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "OTHER";

export type DeviceType =
  | "LAPTOP"
  | "DESKTOP"
  | "PRINTER"
  | "MOBILE"
  | "TABLET"
  | "OTHER";

export interface StatusHistory {
  id: string;
  entryId: string;
  fromStatus: EntryStatus | null;
  toStatus: EntryStatus;
  changedBy: string;    // employee/admin name
  changedById: string;
  note?: string;
  timestamp: string;   // ISO date string
}

export interface ServiceEntry {
  id: string;
  entryNumber: string; // e.g. #1025
  status: EntryStatus;

  // Customer
  customerId: string;
  customerName: string;
  customerMobile: string;

  // Device
  deviceType: DeviceType;
  customDeviceType?: string;
  brand: string;
  model: string;
  serialNumber?: string;

  // Service
  serviceType: string;
  complaint: string;
  customerNotes?: string;
  internalNotes?: string;
  accessories?: string;
  physicalCondition?: string;

  // Financial
  estimatedAmount?: number;
  advanceAmount?: number;
  finalAmount?: number;
  paidAmount?: number;
  paymentMode?: PaymentMode;

  // Assignment
  assignedToId?: string;
  assignedToName?: string;
  takenAt?: string;

  // Cancellation
  cancellationReason?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;

  // History
  statusHistory: StatusHistory[];
}
