import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Wallet,
  UserCog,
  ChartNoAxesCombined,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard",  href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Entries",    href: "/admin/entries",    icon: ClipboardList },
  { label: "Customers",  href: "/admin/customers",  icon: Users },
  { label: "Money",      href: "/admin/money",      icon: Wallet },
  { label: "Employees",  href: "/admin/employees",  icon: UserCog },
  { label: "Reports",    href: "/admin/reports",    icon: ChartNoAxesCombined },
  { label: "Settings",   href: "/admin/settings",   icon: Settings },
];

export const EMPLOYEE_NAV: NavItem[] = [
  { label: "Home",     href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Entries",  href: "/employee/entries",   icon: ClipboardList },
  { label: "My Work",  href: "/employee/my-work",   icon: UserCog },
];
