"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function LegacyCatalogRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/seller/dashboard/catalog");
  }, [router]);

  return <LoadingScreen />;
}

