"use client";

import { useState } from "react";
import { Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/common/toast-provider";

export default function SettingsPage() {
  const { currentUser } = useApp();
  const { toast } = useToast();
  
  const [passForm, setPassForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      toast("New passwords do not match!");
      return;
    }
    if (passForm.new.length < 6) {
      toast("Password must be at least 6 characters.");
      return;
    }
    // Simulation
    toast("Password successfully changed.");
    setPassForm({ current: "", new: "", confirm: "" });
  }

  return (
    <div className="space-y-6 w-full">
      <PageHeader title="Settings" description="Manage your shop and account settings." />

      <div className="flex flex-col gap-6 w-full">
        {/* Profile / Account Info */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Profile Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{currentUser?.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{currentUser?.role?.toLowerCase()}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name</span>
                <span className="text-foreground font-medium">{currentUser?.name ?? "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="text-foreground font-medium capitalize">{currentUser?.role?.toLowerCase() ?? "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee ID</span>
                <span className="text-foreground font-medium">{currentUser?.employeeId ?? "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-pass">Current Password</Label>
                <Input 
                  id="current-pass" 
                  type="password" 
                  value={passForm.current}
                  onChange={(e) => setPassForm(p => ({...p, current: e.target.value}))}
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-pass">New Password</Label>
                <Input 
                  id="new-pass" 
                  type="password" 
                  value={passForm.new}
                  onChange={(e) => setPassForm(p => ({...p, new: e.target.value}))}
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-pass">Confirm New Password</Label>
                <Input 
                  id="confirm-pass" 
                  type="password" 
                  value={passForm.confirm}
                  onChange={(e) => setPassForm(p => ({...p, confirm: e.target.value}))}
                  required 
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto cursor-pointer">Update Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
