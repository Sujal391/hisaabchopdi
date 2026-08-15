import type { PaymentMode } from "./service-entry";

export type MoneyCategory =
  | "SERVICE"
  | "PARTS"
  | "ADVANCE"
  | "SALARY"
  | "RENT"
  | "UTILITIES"
  | "SUPPLIES"
  | "OTHER";

export interface Income {
  id: string;
  date: string;         // ISO date string
  description: string;
  category: MoneyCategory;
  entryId?: string;     // linked service entry if applicable
  entryNumber?: string;
  paymentMode: PaymentMode;
  amount: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: MoneyCategory;
  entryId?: string;
  entryNumber?: string;
  paymentMode: PaymentMode;
  amount: number;
  createdAt: string;
}
