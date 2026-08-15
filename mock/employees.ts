import type { Employee } from "@/types";

export const mockEmployees: Employee[] = [
  {
    id: "emp-1",
    employeeId: "EMP-001",
    name: "Amit Sharma",
    mobile: "9876543210",
    status: "ACTIVE",
    password: "amit123",
    createdAt: "2025-01-10T09:00:00.000Z",
  },
  {
    id: "emp-2",
    employeeId: "EMP-002",
    name: "Rajesh Kumar",
    mobile: "9876543211",
    status: "ACTIVE",
    password: "raj123",
    createdAt: "2025-02-01T09:00:00.000Z",
  },
  {
    id: "emp-3",
    employeeId: "EMP-003",
    name: "Priya Singh",
    mobile: "9876543212",
    status: "ACTIVE",
    password: "priya123",
    createdAt: "2025-03-15T09:00:00.000Z",
  },
  {
    id: "emp-4",
    employeeId: "EMP-004",
    name: "Suresh Patel",
    mobile: "9876543213",
    status: "ACTIVE",
    password: "suresh123",
    createdAt: "2025-04-01T09:00:00.000Z",
  },
  {
    id: "emp-5",
    employeeId: "EMP-005",
    name: "Deepak Verma",
    mobile: "9876543214",
    status: "INACTIVE",
    password: "deepak123",
    createdAt: "2025-05-01T09:00:00.000Z",
  },
  {
    id: "emp-6",
    employeeId: "EMP-006",
    name: "Neha Gupta",
    mobile: "9876543215",
    status: "ACTIVE",
    password: "neha123",
    createdAt: "2025-06-01T09:00:00.000Z",
  },
];

/** The admin user (not an Employee record, handled via SessionUser) */
export const ADMIN_USER = {
  id: "admin-1",
  name: "Admin",
  employeeId: undefined,
};
