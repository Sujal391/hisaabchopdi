"use client";

import Link from "next/link";
import { Plus, ClipboardList, Users, TrendingUp, TrendingDown, Clock, LoaderCircle, CircleCheck, Circle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { MoneyDisplay } from "@/components/common/money-display";
import { EmptyState } from "@/components/common/empty-state";
import { useApp } from "@/contexts/app-context";
import { formatRelative } from "@/lib/format";
import { isToday } from "date-fns";

export default function AdminDashboardPage() {
  const { entries, income, expenses, auditLogs, currentUser } = useApp();

  // Summary counts
  const todayEntries = entries.filter((e) => isToday(new Date(e.createdAt)));
  const notStarted = entries.filter((e) => e.status === "NOT_STARTED").length;
  const inProgress = entries.filter((e) => e.status === "IN_PROGRESS").length;
  const completedToday = entries.filter(
    (e) => e.status === "COMPLETED" && e.completedAt && isToday(new Date(e.completedAt))
  ).length;

  const todayIncome = income
    .filter((i) => isToday(new Date(i.date)))
    .reduce((sum, i) => sum + i.amount, 0);
  const todayExpenses = expenses
    .filter((e) => isToday(new Date(e.date)))
    .reduce((sum, e) => sum + e.amount, 0);

  // Today's work — entries from today + active ones
  const todayWork = [
    ...entries.filter((e) => isToday(new Date(e.createdAt))),
    ...entries.filter(
      (e) =>
        !isToday(new Date(e.createdAt)) &&
        (e.status === "IN_PROGRESS" || e.status === "WAITING")
    ),
  ].slice(0, 8);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <PageHeader
        title={`${greeting}, ${currentUser?.name ?? "Admin"}`}
        description="Here's what's happening today."
      />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          title="Today's Entries"
          value={todayEntries.length}
          icon={ClipboardList}
          href="/admin/entries"
        />
        <SummaryCard
          title="Not Started"
          value={notStarted}
          icon={Circle}
          iconClass="text-status-not-started-fg"
          bgClass="bg-status-not-started-bg"
        />
        <SummaryCard
          title="In Progress"
          value={inProgress}
          icon={LoaderCircle}
          iconClass="text-status-in-progress-fg"
          bgClass="bg-status-in-progress-bg"
        />
        <SummaryCard
          title="Completed Today"
          value={completedToday}
          icon={CircleCheck}
          iconClass="text-status-completed-fg"
          bgClass="bg-status-completed-bg"
        />
        <SummaryCard
          title="Today's Income"
          money={todayIncome}
          icon={TrendingUp}
          iconClass="text-status-completed-fg"
          bgClass="bg-status-completed-bg"
        />
        <SummaryCard
          title="Today's Expenses"
          money={todayExpenses}
          icon={TrendingDown}
          iconClass="text-status-cancelled-fg"
          bgClass="bg-status-cancelled-bg"
        />
      </div>

      {/* Two-column section */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        {/* Today's work — 2/3 width */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-base font-semibold text-foreground">Today's Work</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/entries">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            {todayWork.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No active entries"
                description="Create a new entry to get started."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-t bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Entry</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Assigned</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {todayWork.map((entry) => (
                      <tr key={entry.id} className="interactive-row">
                        <td className="px-4 py-3">
                          <span className="text-mono text-xs font-semibold">{entry.entryNumber}</span>
                          <p className="text-caption mt-0.5 hidden xs:block">{entry.brand} {entry.model}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm text-foreground">{entry.customerName}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">{entry.serviceType}</span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={entry.status} />
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {entry.assignedToName ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="xs" asChild>
                            <Link href={`/admin/entries/${entry.id}`}><Eye className="size-4" /></Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity — 1/3 width */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 flex-1">
            {auditLogs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 hover:bg-hover-muted transition-colors"
              >
                <p className="text-sm text-foreground leading-snug">
                  {log.description}
                </p>
                <time className="text-caption" dateTime={log.timestamp}>
                  {formatRelative(log.timestamp)}
                </time>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <p className="text-caption px-3">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Summary card sub-component ──────────────────────────────────────────────

interface SummaryCardProps {
  title: string;
  value?: number;
  money?: number;
  icon: React.ElementType;
  iconClass?: string;
  bgClass?: string;
  href?: string;
}

function SummaryCard({
  title,
  value,
  money,
  icon: Icon,
  iconClass = "text-muted-foreground",
  bgClass = "bg-muted",
  href,
}: SummaryCardProps) {
  const inner = (
    <Card className={href ? "interactive-card cursor-pointer" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`flex size-8 items-center justify-center rounded-lg ${bgClass}`}>
          <Icon className={`size-4 ${iconClass}`} aria-hidden />
        </div>
      </CardHeader>
      <CardContent>
        {money !== undefined ? (
          <MoneyDisplay amount={money} className="text-2xl font-bold" />
        ) : (
          <p className="text-2xl font-bold text-foreground">{value ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
