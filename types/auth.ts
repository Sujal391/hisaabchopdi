export type UserRole = "ADMIN" | "EMPLOYEE";

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
  employeeId?: string; // only for EMPLOYEE role
  avatar?: string;
}
