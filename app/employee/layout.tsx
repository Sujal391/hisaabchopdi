import { EmployeeShell } from "@/components/layout/employee-shell";

export default function EmployeeLayout({ children }: LayoutProps<"/employee">) {
  return <EmployeeShell>{children}</EmployeeShell>;
}
