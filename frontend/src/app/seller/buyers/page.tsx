"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function LegacyBuyersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/seller/dashboard/buyers");
  }, [router]);

  return <LoadingScreen />;
}

