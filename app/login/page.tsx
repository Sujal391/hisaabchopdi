"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, ShieldCheck, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/app-context";
import { mockEmployees } from "@/mock";
import type { SessionUser } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useApp();
  const [loading, setLoading] = useState(false);

  function loginAs(user: SessionUser, dest: string) {
    setLoading(true);
    setCurrentUser(user);
    router.push(dest);
  }

  const adminUser: SessionUser = {
    id: "admin-1",
    name: "Admin",
    role: "ADMIN",
  };

  // Demo: pick the first active employee
  const emp = mockEmployees.find((e) => e.status === "ACTIVE")!;
  const employeeUser: SessionUser = {
    id: emp.id,
    name: emp.name,
    role: "EMPLOYEE",
    employeeId: emp.employeeId,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted px-4">
      {/* Brand */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <Wrench className="size-7 text-primary-foreground" aria-hidden />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            EntryBook
          </h1>
          <p className="page-description mt-1">
            Service Management System
          </p>
        </div>
      </div>

      {/* Role cards */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-center text-caption mb-4">
          Select your role to continue (demo)
        </p>

        {/* Admin card */}
        <button
          onClick={() => loginAs(adminUser, "/admin/dashboard")}
          disabled={loading}
          className="interactive-card w-full rounded-xl border bg-card p-5 text-left"
          aria-label="Login as Admin"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="size-5 text-primary" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Admin</p>
              <p className="text-caption mt-0.5">
                Full access — entries, customers, money, reports
              </p>
            </div>
          </div>
        </button>

        {/* Employee card */}
        <button
          onClick={() => loginAs(employeeUser, "/employee/dashboard")}
          disabled={loading}
          className="interactive-card w-full rounded-xl border bg-card p-5 text-left"
          aria-label="Login as Employee"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent">
              <UserCircle2 className="size-5 text-accent-foreground" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Employee
                <span className="text-caption font-normal ml-2">
                  ({employeeUser.name})
                </span>
              </p>
              <p className="text-caption mt-0.5">
                View entries, take work, update status
              </p>
            </div>
          </div>
        </button>
      </div>

      <p className="mt-8 text-caption text-center max-w-xs">
        This is a demo. No real authentication is required.
      </p>
    </div>
  );
}
