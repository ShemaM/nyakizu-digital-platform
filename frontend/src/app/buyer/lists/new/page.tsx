"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { ListSkeleton } from "@/components/ui/LoadingState";
import { NewListContent } from "./NewListContent";

export default function NewListPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="New Order">
          <ListSkeleton count={5} showAvatar={false} lines={2} />
        </AppShell>
      }
    >
      <NewListContent />
    </Suspense>
  );
}
