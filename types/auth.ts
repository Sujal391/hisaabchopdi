export type UserRole = "ADMIN" | "EMPLOYEE";

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
  employeeId?: string; // only for EMPLOYEE role
  avatar?: string;
}

export interface UserAccount extends SessionUser {
  mobile: string;
  password?: string; // Make password optional so we don't accidentally send it everywhere, but require it for storage/login
}
