"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { EntryCard } from "@/components/common/entry-card";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useApp } from "@/contexts/app-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/components/common/toast-provider";
import { STATUS_LIST } from "@/constants/statuses";
import type { EntryStatus } from "@/types";

const ALL_TAB = "ALL";

export default function EmployeeEntriesPage() {
  const { entries, currentUser, takeWork } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<EntryStatus | typeof ALL_TAB>(ALL_TAB);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 250);

  const filtered = entries.filter((e) => {
    const matchStatus = activeTab === ALL_TAB || e.status === activeTab;
    const q = debouncedSearch.toLowerCase();
    const matchSearch = !q || e.entryNumber.toLowerCase().includes(q) || e.customerName.toLowerCase().includes(q) || e.serviceType.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

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

      <SearchInput value={search} onChange={setSearch} placeholder="Search entries…" className="max-w-sm" />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntryStatus | typeof ALL_TAB)}>
        <TabsList className="flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value={ALL_TAB} className="text-xs">All ({entries.length})</TabsTrigger>
          {STATUS_LIST.map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs">{s.replace("_"," ")} ({entries.filter((e) => e.status === s).length})</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No entries found" />
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              basePath="/employee"
              showTakeWork
              onTakeWork={setConfirmId}
            />
          ))}
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
    </div>
  );
}
