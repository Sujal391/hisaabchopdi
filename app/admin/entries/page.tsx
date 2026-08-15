"use client";

import { useState } from "react";
import { Plus, ClipboardList, Eye } from "lucide-react";
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

import { NewEntryModal } from "@/components/features/new-entry-modal";
import { ViewEntryModal } from "@/components/features/view-entry-modal";
import { DataPagination } from "@/components/common/data-pagination";

const ALL_TAB = "ALL";
const PAGE_SIZE = 10;

export default function AdminEntriesPage() {
  const { entries } = useApp();
  const isMobile = useMobile();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<EntryStatus | typeof ALL_TAB>(ALL_TAB);
  const debouncedSearch = useDebounce(search, 250);

  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [viewEntryId, setViewEntryId] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);

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

  const paginatedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Entries"
        description="Manage all service entries."
        actions={
          <Button onClick={() => setNewEntryOpen(true)}>
            <Plus className="size-4" aria-hidden />
            New Entry
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        {/* Search */}
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setCurrentPage(1); }}
          placeholder="Search by entry number, customer, service…"
          className="w-full"
        />

        {/* Status tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as EntryStatus | typeof ALL_TAB); setCurrentPage(1); }} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 w-full justify-start">
            <TabsTrigger value={ALL_TAB} className="text-xs cursor-pointer">
              All ({entries.length})
            </TabsTrigger>
            {STATUS_LIST.map((status) => {
              const count = entries.filter((e) => e.status === status).length;
              return (
                <TabsTrigger key={status} value={status} className="text-xs cursor-pointer">
                  {status.replace("_", " ")} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

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
          {paginatedData.map((entry) => (
            <EntryCard key={entry.id} entry={entry} className="cursor-pointer" onView={setViewEntryId} />
          ))}
          <DataPagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        /* Desktop — table */
        <div className="rounded-xl border overflow-hidden bg-background">
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
              {paginatedData.map((entry) => (
                <tr key={entry.id} className="interactive-row cursor-pointer" onClick={() => setViewEntryId(entry.id)}>
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
                    <Button variant="ghost" size="xs" onClick={(e) => {
                      e.stopPropagation();
                      setViewEntryId(entry.id);
                    }}>
                      <Eye className="size-4"/>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <DataPagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modals */}
      <NewEntryModal
        open={newEntryOpen}
        onOpenChange={setNewEntryOpen}
        onSuccess={(id) => {
          setViewEntryId(id);
        }}
      />
      
      <ViewEntryModal
        open={!!viewEntryId}
        onOpenChange={(open) => !open && setViewEntryId(null)}
        entryId={viewEntryId}
      />
    </div>
  );
}
