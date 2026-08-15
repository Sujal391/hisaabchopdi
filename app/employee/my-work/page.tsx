"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EntryCard } from "@/components/common/entry-card";
import { EmptyState } from "@/components/common/empty-state";
import { ViewEntryModal } from "@/components/features/view-entry-modal";
import { useApp } from "@/contexts/app-context";

export default function MyWorkPage() {
  const { entries, currentUser } = useApp();
  const [viewEntryId, setViewEntryId] = useState<string | null>(null);

  if (!currentUser) return null;

  const myEntries = entries.filter(
    (e) =>
      (e.assignedToId === currentUser.id || e.assignedToId === currentUser.employeeId) &&
      e.status !== "COMPLETED" &&
      e.status !== "CANCELLED"
  );

  const completed = entries.filter(
    (e) =>
      (e.assignedToId === currentUser.id || e.assignedToId === currentUser.employeeId) &&
      e.status === "COMPLETED"
  );

  return (
    <div className="space-y-8">
      <PageHeader title="My Work" description="Entries assigned to you." />

      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Active ({myEntries.length})
        </h2>
        {myEntries.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No active work" description="Take entries from the Entries page." />
        ) : (
          <div className="space-y-3">
            {myEntries.map((e) => (
              <EntryCard key={e.id} entry={e} onView={(id) => setViewEntryId(id)} className="cursor-pointer" />
            ))}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            Completed ({completed.length})
          </h2>
          <div className="space-y-3">
            {completed.map((e) => (
              <EntryCard key={e.id} entry={e} onView={(id) => setViewEntryId(id)} className="cursor-pointer" />
            ))}
          </div>
        </div>
      )}

      <ViewEntryModal
        open={!!viewEntryId}
        onOpenChange={(open) => !open && setViewEntryId(null)}
        entryId={viewEntryId}
      />
    </div>
  );
}
