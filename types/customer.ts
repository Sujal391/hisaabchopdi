export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  createdAt: string; // ISO date string
  totalEntries?: number; // computed from entries
  lastVisit?: string;   // computed from entries
}
