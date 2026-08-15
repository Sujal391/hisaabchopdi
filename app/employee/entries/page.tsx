"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { EntryCard } from "@/components/common/entry-card";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataPagination } from "@/components/common/data-pagination";
import { ViewEntryModal } from "@/components/features/view-entry-modal";
import { useApp } from "@/contexts/app-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/components/common/toast-provider";
import { STATUS_LIST } from "@/constants/statuses";
import type { EntryStatus } from "@/types";

const ALL_TAB = "ALL";
const PAGE_SIZE = 10;

export default function EmployeeEntriesPage() {
  const { entries, currentUser, takeWork } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<EntryStatus | typeof ALL_TAB>(ALL_TAB);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [viewEntryId, setViewEntryId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 250);

  const [currentPage, setCurrentPage] = useState(1);

  const filtered = entries.filter((e) => {
    const matchStatus = activeTab === ALL_TAB || e.status === activeTab;
    const q = debouncedSearch.toLowerCase();
    const matchSearch =
      !q ||
      e.entryNumber.toLowerCase().includes(q) ||
      e.customerName.toLowerCase().includes(q) ||
      e.serviceType.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const paginatedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const confirmEntry = entries.find((e) => e.id === confirmId);

  function handleTakeWork() {
    if (!confirmId || !currentUser) return;
    takeWork(confirmId, currentUser);
    toast("You took the work!");
    setConfirmId(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="All Entries" description="Browse and take available work." />

      <div className="flex flex-col gap-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setCurrentPage(1); }}
          placeholder="Search entries…"
          className="w-full"
        />

        <Tabs
          value={activeTab}
          onValueChange={(v) => { setActiveTab(v as EntryStatus | typeof ALL_TAB); setCurrentPage(1); }}
          className="w-full"
        >
          <div className="w-full overflow-x-auto no-scrollbar">
            <TabsList className="flex flex-nowrap h-auto gap-1 bg-muted p-1 w-max min-w-full justify-start">
              <TabsTrigger value={ALL_TAB} className="text-xs cursor-pointer shrink-0 whitespace-nowrap">
                All ({entries.length})
              </TabsTrigger>
              {STATUS_LIST.map((s) => (
                <TabsTrigger key={s} value={s} className="text-xs cursor-pointer shrink-0 whitespace-nowrap">
                  {s.replace("_", " ")} ({entries.filter((e) => e.status === s).length})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No entries found" />
      ) : (
        <div className="space-y-3">
          {paginatedData.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              showTakeWork
              onTakeWork={setConfirmId}
              onView={(id) => setViewEntryId(id)}
              className="cursor-pointer"
            />
          ))}
          <DataPagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Take this work?"
        description={confirmEntry ? `You will be assigned to ${confirmEntry.entryNumber} — ${confirmEntry.customerName}` : ""}
        confirmLabel="Take Work"
        onConfirm={handleTakeWork}
      />

      <ViewEntryModal
        open={!!viewEntryId}
        onOpenChange={(open) => !open && setViewEntryId(null)}
        entryId={viewEntryId}
      />
    </div>
  );
}
