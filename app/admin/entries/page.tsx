"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { StatusBadge } from "@/components/common/status-badge";
import { EntryCard } from "@/components/common/entry-card";
import { EmptyState } from "@/components/common/empty-state";
import { useApp } from "@/contexts/app-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useMobile } from "@/hooks/use-mobile";
import { STATUS_LIST } from "@/constants/statuses";
import { formatRelative } from "@/lib/format";
import type { EntryStatus } from "@/types";

const ALL_TAB = "ALL";

export default function AdminEntriesPage() {
  const { entries } = useApp();
  const isMobile = useMobile();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<EntryStatus | typeof ALL_TAB>(ALL_TAB);
  const debouncedSearch = useDebounce(search, 250);

  const filtered = entries.filter((e) => {
    const matchesStatus = activeTab === ALL_TAB || e.status === activeTab;
    const q = debouncedSearch.toLowerCase();
    const matchesSearch =
      !q ||
      e.entryNumber.toLowerCase().includes(q) ||
      e.customerName.toLowerCase().includes(q) ||
      e.customerMobile.includes(q) ||
      e.serviceType.toLowerCase().includes(q) ||
      e.brand.toLowerCase().includes(q) ||
      e.model.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Entries"
        description="Manage all service entries."
        actions={
          <Button asChild>
            <Link href="/admin/entries/new">
              <Plus className="size-4" aria-hidden />
              New Entry
            </Link>
          </Button>
        }
      />

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by entry number, customer, service…"
        className="max-w-sm"
      />

      {/* Status tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntryStatus | typeof ALL_TAB)}>
        <TabsList className="flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value={ALL_TAB} className="text-xs">
            All ({entries.length})
          </TabsTrigger>
          {STATUS_LIST.map((status) => {
            const count = entries.filter((e) => e.status === status).length;
            return (
              <TabsTrigger key={status} value={status} className="text-xs">
                {status.replace("_", " ")} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No entries found"
          description={debouncedSearch ? "Try a different search term." : "No entries match the selected filter."}
        />
      ) : isMobile ? (
        /* Mobile — cards */
        <div className="space-y-3">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} basePath="/admin" />
          ))}
        </div>
      ) : (
        /* Desktop — table */
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Entry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Device</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((entry) => (
                <tr key={entry.id} className="interactive-row">
                  <td className="px-4 py-3">
                    <span className="text-mono text-xs font-semibold">{entry.entryNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.customerName}</p>
                      <p className="text-caption">{entry.customerMobile}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{entry.brand} {entry.model}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground">{entry.serviceType}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={entry.status} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground">{entry.assignedToName ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-caption">{formatRelative(entry.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="xs" asChild>
                      <Link href={`/admin/entries/${entry.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
