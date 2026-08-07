"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { ProductFormContent } from "./ProductFormContent";

export default function ProductFormPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="Add Product">
          <PageSkeleton showKPIs={false} listCount={1} />
        </AppShell>
      }
    >
      <ProductFormContent />
    </Suspense>
  );
}
