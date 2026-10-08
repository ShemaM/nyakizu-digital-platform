"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function LegacySellerOrderFulfillRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (id) {
      router.replace(`/seller/dashboard/orders/${id}/fulfill`);
    } else {
      router.replace("/seller/dashboard/orders");
    }
  }, [id, router]);

  return <LoadingScreen />;
}

