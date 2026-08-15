"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  SessionUser,
  UserAccount,
  ServiceEntry,
  Customer,
  Employee,
  Income,
  Expense,
  EntryStatus,
} from "@/types";
import {
  mockServiceEntries,
  mockCustomers,
  mockEmployees,
  mockIncome,
  mockExpenses,
  mockAuditLogs,
} from "@/mock";
import type { AuditLog } from "@/types";

// ── Context shape ──────────────────────────────────────────────────────────

interface AppContextValue {
  // Session
  currentUser: SessionUser | null;
  setCurrentUser: (user: SessionUser | null) => void;
  authLogin: (mobile: string, password: string) => { success: boolean; error?: string; user?: SessionUser; dest?: string };
  authRegister: (account: Omit<UserAccount, "id">) => { success: boolean; error?: string; user?: SessionUser; dest?: string };

  // Data
  entries: ServiceEntry[];
  customers: Customer[];
  employees: Employee[];
  income: Income[];
  expenses: Expense[];
  auditLogs: AuditLog[];

  // Entry mutations
  // These mirror future API calls — replace body with fetch() for backend integration
  takeWork: (entryId: string, employee: SessionUser) => void;
  assignWork: (entryId: string, employeeId: string, employeeName: string) => void;
  transferWork: (entryId: string, newEmployeeId: string, newEmployeeName: string, reason: string) => void;
  updateStatus: (entryId: string, newStatus: EntryStatus, note?: string, actorId?: string, actorName?: string) => void;
  cancelEntry: (entryId: string, reason: string) => void;
  reopenEntry: (entryId: string) => void;
  createEntry: (entry: Omit<ServiceEntry, "id" | "entryNumber" | "statusHistory" | "createdAt" | "updatedAt">) => ServiceEntry;
  addWorkNote: (entryId: string, note: string, actorId: string, actorName: string) => void;

  // Customer mutations
  createCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Customer;

  // Employee mutations
  createEmployee: (employee: Omit<Employee, "id" | "createdAt">) => Employee;
  toggleEmployeeStatus: (employeeId: string) => void;

  // Money mutations
  addIncome: (income: Omit<Income, "id" | "createdAt">) => void;
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => void;
}

// ── Context creation ───────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

// ── Helpers ────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nextEntryNumber(entries: ServiceEntry[]): string {
  const nums = entries.map((e) => parseInt(e.entryNumber.replace("#", ""), 10));
  const max = nums.length > 0 ? Math.max(...nums) : 1000;
  return `#${max + 1}`;
}

function now(): string {
  return new Date().toISOString();
}

// ── Provider ───────────────────────────────────────────────────────────────

const DEFAULT_ADMIN_USER: SessionUser = {
  id: "admin-1",
  name: "Admin",
  role: "ADMIN",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<SessionUser | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("entrybook_session");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return null; // start with no one logged in
  });

  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const DEFAULT_ACCOUNTS: UserAccount[] = [
      {
        id: "admin-1",
        name: "Admin",
        mobile: "9999999999",
        password: "password123", // basic default admin
        role: "ADMIN",
      }
    ];

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("entrybook_accounts");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Migrate legacy accounts
            const migrated = parsed.map((a: any) => {
              if (!a.mobile) {
                // If they had the old admin account, map it to the new mobile number
                if (a.username === "admin") {
                  return { ...a, mobile: "9999999999" };
                }
                // Fallback for other old accounts
                return { ...a, mobile: a.username || "0000000000" };
              }
              return a;
            });
            return migrated;
          }
        } catch {
          // ignore
        }
      }
      localStorage.setItem("entrybook_accounts", JSON.stringify(DEFAULT_ACCOUNTS));
    }
    return DEFAULT_ACCOUNTS;
  });

  const saveAccounts = useCallback((newAccounts: UserAccount[]) => {
    setAccounts(newAccounts);
    if (typeof window !== "undefined") {
      localStorage.setItem("entrybook_accounts", JSON.stringify(newAccounts));
    }
  }, []);

  const setCurrentUser = useCallback((user: SessionUser | null) => {
    setCurrentUserState(user);
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("entrybook_session", JSON.stringify(user));
      } else {
        localStorage.removeItem("entrybook_session");
      }
    }
  }, []);

  const [entries, setEntries] = useState<ServiceEntry[]>(mockServiceEntries);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [income, setIncome] = useState<Income[]>(mockIncome);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);

  const addAudit = useCallback((log: Omit<AuditLog, "id">) => {
    setAuditLogs((prev) => [{ id: generateId("audit"), ...log }, ...prev]);
  }, []);

  // ── Authentication ───────────────────────────────────────────

  const authLogin = useCallback(
    (mobile: string, password: string) => {
      const account = accounts.find(
        (a) => a.mobile === mobile && a.password === password
      );

      if (!account) {
        return { success: false, error: "Invalid mobile number or password" };
      }

      const sessionUser: SessionUser = {
        id: account.id,
        name: account.name,
        role: account.role,
        employeeId: account.employeeId,
        avatar: account.avatar,
      };

      setCurrentUser(sessionUser);
      return {
        success: true,
        user: sessionUser,
        dest: account.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard",
      };
    },
    [accounts, setCurrentUser]
  );

  const authRegister = useCallback(
    (data: Omit<UserAccount, "id">) => {
      // check if mobile exists
      if (accounts.some((a) => a.mobile === data.mobile)) {
        return { success: false, error: "Mobile number already registered" };
      }

      const id = generateId("usr");
      const newAccount: UserAccount = { ...data, id };
      
      // If employee, we also want to simulate creating an employee record automatically,
      // or at least keeping track of it. But for simplicity, we just save the account.
      saveAccounts([...accounts, newAccount]);

      const sessionUser: SessionUser = {
        id: newAccount.id,
        name: newAccount.name,
        role: newAccount.role,
        employeeId: newAccount.employeeId,
        avatar: newAccount.avatar,
      };

      setCurrentUser(sessionUser);
      return {
        success: true,
        user: sessionUser,
        dest: newAccount.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard",
      };
    },
    [accounts, saveAccounts, setCurrentUser]
  );

  // ── Entry mutations ──────────────────────────────────────────

  const takeWork = useCallback(
    (entryId: string, employee: SessionUser) => {
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== entryId) return e;
          const ts = now();
          return {
            ...e,
            status: "IN_PROGRESS",
            assignedToId: employee.employeeId ?? employee.id,
            assignedToName: employee.name,
            takenAt: ts,
            updatedAt: ts,
            statusHistory: [
              ...e.statusHistory,
              {
                id: generateId("sh"),
                entryId,
                fromStatus: e.status,
                toStatus: "IN_PROGRESS" as EntryStatus,
                changedBy: employee.name,
                changedById: employee.id,
                note: "Took the work",
                timestamp: ts,
              },
            ],
          };
        })
      );
      addAudit({
        action: "WORK_TAKEN",
        actorId: employee.id,
        actorName: employee.name,
        targetId: entryId,
        targetLabel: entries.find((e) => e.id === entryId)?.entryNumber,
        description: `${employee.name} took entry ${entries.find((e) => e.id === entryId)?.entryNumber}`,
        timestamp: now(),
      });
    },
    [entries, addAudit]
  );

  const assignWork = useCallback(
    (entryId: string, employeeId: string, employeeName: string) => {
      const ts = now();
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== entryId) return e;
          return {
            ...e,
            status: "IN_PROGRESS",
            assignedToId: employeeId,
            assignedToName: employeeName,
            takenAt: ts,
            updatedAt: ts,
            statusHistory: [
              ...e.statusHistory,
              {
                id: generateId("sh"),
                entryId,
                fromStatus: e.status,
                toStatus: "IN_PROGRESS" as EntryStatus,
                changedBy: "Admin",
                changedById: "admin-1",
                note: `Assigned to ${employeeName}`,
                timestamp: ts,
              },
            ],
          };
        })
      );
    },
    []
  );

  const transferWork = useCallback(
    (entryId: string, newEmployeeId: string, newEmployeeName: string, reason: string) => {
      const ts = now();
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== entryId) return e;
          return {
            ...e,
            assignedToId: newEmployeeId,
            assignedToName: newEmployeeName,
            updatedAt: ts,
            statusHistory: [
              ...e.statusHistory,
              {
                id: generateId("sh"),
                entryId,
                fromStatus: e.status,
                toStatus: e.status,
                changedBy: "Admin",
                changedById: "admin-1",
                note: `Transferred to ${newEmployeeName}. Reason: ${reason}`,
                timestamp: ts,
              },
            ],
          };
        })
      );
      addAudit({
        action: "WORK_TRANSFERRED",
        actorId: "admin-1",
        actorName: "Admin",
        targetId: entryId,
        targetLabel: entries.find((e) => e.id === entryId)?.entryNumber,
        description: `Admin transferred entry ${entries.find((e) => e.id === entryId)?.entryNumber} to ${newEmployeeName}`,
        timestamp: ts,
      });
    },
    [entries, addAudit]
  );

  const updateStatus = useCallback(
    (entryId: string, newStatus: EntryStatus, note?: string, actorId = "admin-1", actorName = "Admin") => {
      const ts = now();
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== entryId) return e;
          return {
            ...e,
            status: newStatus,
            updatedAt: ts,
            completedAt: newStatus === "COMPLETED" ? ts : e.completedAt,
            statusHistory: [
              ...e.statusHistory,
              {
                id: generateId("sh"),
                entryId,
                fromStatus: e.status,
                toStatus: newStatus,
                changedBy: actorName,
                changedById: actorId,
                note,
                timestamp: ts,
              },
            ],
          };
        })
      );
      addAudit({
        action: "STATUS_CHANGED",
        actorId,
        actorName,
        targetId: entryId,
        targetLabel: entries.find((e) => e.id === entryId)?.entryNumber,
        description: `${actorName} updated ${entries.find((e) => e.id === entryId)?.entryNumber} to ${newStatus}`,
        timestamp: ts,
      });
    },
    [entries, addAudit]
  );

  const cancelEntry = useCallback(
    (entryId: string, reason: string) => {
      const ts = now();
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== entryId) return e;
          return {
            ...e,
            status: "CANCELLED" as EntryStatus,
            cancellationReason: reason,
            updatedAt: ts,
            statusHistory: [
              ...e.statusHistory,
              {
                id: generateId("sh"),
                entryId,
                fromStatus: e.status,
                toStatus: "CANCELLED" as EntryStatus,
                changedBy: "Admin",
                changedById: "admin-1",
                note: `Cancelled: ${reason}`,
                timestamp: ts,
              },
            ],
          };
        })
      );
      addAudit({
        action: "ENTRY_CANCELLED",
        actorId: "admin-1",
        actorName: "Admin",
        targetId: entryId,
        targetLabel: entries.find((e) => e.id === entryId)?.entryNumber,
        description: `Admin cancelled entry ${entries.find((e) => e.id === entryId)?.entryNumber} — ${reason}`,
        timestamp: ts,
      });
    },
    [entries, addAudit]
  );

  const reopenEntry = useCallback(
    (entryId: string) => {
      const ts = now();
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== entryId) return e;
          return {
            ...e,
            status: "REOPENED" as EntryStatus,
            updatedAt: ts,
            statusHistory: [
              ...e.statusHistory,
              {
                id: generateId("sh"),
                entryId,
                fromStatus: e.status,
                toStatus: "REOPENED" as EntryStatus,
                changedBy: "Admin",
                changedById: "admin-1",
                note: "Reopened by Admin",
                timestamp: ts,
              },
            ],
          };
        })
      );
    },
    []
  );

  const createEntry = useCallback(
    (entryData: Omit<ServiceEntry, "id" | "entryNumber" | "statusHistory" | "createdAt" | "updatedAt">): ServiceEntry => {
      const ts = now();
      const id = generateId("entry");
      const entryNumber = nextEntryNumber(entries);
      const newEntry: ServiceEntry = {
        ...entryData,
        id,
        entryNumber,
        status: "NOT_STARTED",
        statusHistory: [
          {
            id: generateId("sh"),
            entryId: id,
            fromStatus: null,
            toStatus: "NOT_STARTED",
            changedBy: "Admin",
            changedById: "admin-1",
            timestamp: ts,
          },
        ],
        createdAt: ts,
        updatedAt: ts,
      };
      setEntries((prev) => [newEntry, ...prev]);
      addAudit({
        action: "ENTRY_CREATED",
        actorId: "admin-1",
        actorName: "Admin",
        targetId: id,
        targetLabel: entryNumber,
        description: `Admin created entry ${entryNumber} for ${entryData.customerName}`,
        timestamp: ts,
      });
      return newEntry;
    },
    [entries, addAudit]
  );

  const addWorkNote = useCallback(
    (entryId: string, note: string, actorId: string, actorName: string) => {
      const ts = now();
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== entryId) return e;
          return {
            ...e,
            updatedAt: ts,
            statusHistory: [
              ...e.statusHistory,
              {
                id: generateId("sh"),
                entryId,
                fromStatus: e.status,
                toStatus: e.status,
                changedBy: actorName,
                changedById: actorId,
                note,
                timestamp: ts,
              },
            ],
          };
        })
      );
    },
    []
  );

  // ── Customer mutations ───────────────────────────────────────

  const createCustomer = useCallback(
    (data: Omit<Customer, "id" | "createdAt">): Customer => {
      const customer: Customer = {
        ...data,
        id: generateId("cust"),
        createdAt: now(),
      };
      setCustomers((prev) => [customer, ...prev]);
      return customer;
    },
    []
  );

  // ── Employee mutations ───────────────────────────────────────

  const createEmployee = useCallback(
    (data: Omit<Employee, "id" | "createdAt">): Employee => {
      const employee: Employee = {
        ...data,
        id: generateId("emp"),
        createdAt: now(),
      };
      setEmployees((prev) => [employee, ...prev]);

      // Automatically create a user account so they can log in
      if (data.mobile) {
        const newAccount: UserAccount = {
          id: generateId("usr"),
          name: data.name,
          mobile: data.mobile,
          password: data.password || "password123", // default fallback
          role: "EMPLOYEE",
          employeeId: employee.id, // Link to the employee record
        };
        setAccounts((prev) => {
          const next = [...prev, newAccount];
          if (typeof window !== "undefined") {
            localStorage.setItem("entrybook_accounts", JSON.stringify(next));
          }
          return next;
        });
      }

      return employee;
    },
    []
  );

  const toggleEmployeeStatus = useCallback((employeeId: string) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? { ...e, status: e.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : e
      )
    );
  }, []);

  // ── Money mutations ──────────────────────────────────────────

  const addIncome = useCallback((data: Omit<Income, "id" | "createdAt">) => {
    setIncome((prev) => [
      { ...data, id: generateId("inc"), createdAt: now() },
      ...prev,
    ]);
  }, []);

  const addExpense = useCallback((data: Omit<Expense, "id" | "createdAt">) => {
    setExpenses((prev) => [
      { ...data, id: generateId("exp"), createdAt: now() },
      ...prev,
    ]);
  }, []);

  // ── Context value ────────────────────────────────────────────

  const value: AppContextValue = {
    currentUser,
    setCurrentUser,
    authLogin,
    authRegister,
    entries,
    customers,
    employees,
    income,
    expenses,
    auditLogs,
    takeWork,
    assignWork,
    transferWork,
    updateStatus,
    cancelEntry,
    reopenEntry,
    createEntry,
    addWorkNote,
    createCustomer,
    createEmployee,
    toggleEmployeeStatus,
    addIncome,
    addExpense,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside <AppProvider>");
  }
  return ctx;
}
