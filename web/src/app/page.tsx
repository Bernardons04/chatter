"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserId, getUsername } from "@/lib/localStorage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const userId = getUserId();
    const username = getUsername();
    if (userId && username) {
      router.replace("/rooms");
    } else {
      router.replace("/auth");
    }
  }, [router]);

  return null;
}
