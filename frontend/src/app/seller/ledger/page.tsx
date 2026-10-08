"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function LegacyLedgerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/seller/dashboard/ledger");
  }, [router]);

  return <LoadingScreen />;
}

