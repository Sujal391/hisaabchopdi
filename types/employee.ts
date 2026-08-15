export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface Employee {
  id: string;
  employeeId: string; // e.g. EMP-001
  name: string;
  mobile: string;
  status: EmployeeStatus;
  password?: string; // stored only in mock; never sent to client in real app
  createdAt: string;
}
