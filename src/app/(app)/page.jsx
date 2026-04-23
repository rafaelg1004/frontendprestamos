"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardView } from "@/components/DashboardView";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="));
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return <DashboardView />;
}
