"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
    </div>
  );
}
