"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/app-context";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { authRegister, createEmployee } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
    role: "EMPLOYEE" as UserRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.mobile.trim() || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // Simulate slight network delay
    await new Promise((r) => setTimeout(r, 500));

    let employeeId;
    if (formData.role === "EMPLOYEE") {
      // Simulate creating an employee profile in the DB too
      const emp = createEmployee({
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "ACTIVE",
      });
      employeeId = emp.id;
    }

    const result = authRegister({
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      password: formData.password,
      role: formData.role,
      employeeId,
    });

    if (result.success && result.dest) {
      router.push(result.dest);
    } else {
      setError(result.error || "Registration failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted px-4 py-8">
      {/* Brand */}
      <div className="flex flex-col items-center gap-3 mb-8">
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

      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Create Account</h2>
          <p className="text-caption">Sign up for a new account.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="9999999999"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(val) => setFormData({ ...formData, role: val as UserRole })}
              disabled={loading}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
