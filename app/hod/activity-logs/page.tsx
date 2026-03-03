"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db as firestore } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { AppShell } from "@/components/ui/app-shell";
import { ActivityLogsViewer } from "@/components/ui/activity-logs-viewer";

export default function HODActivityLogsPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (!userDoc.exists()) {
          router.replace("/auth/login");
          return;
        }

        const data = userDoc.data();

        if (data.role !== "hod") {
          router.replace("/dashboard");
          return;
        }

        setUserData(data);
      } catch (err) {
        console.error("Error:", err);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!userData) return null;

  const appUser = {
    email: userData?.email ?? "",
    full_name: userData?.name ?? userData?.full_name ?? "HOD",
    role: "hod" as const,
    department: userData?.department,
  };

  return (
    <AppShell
      user={appUser}
      onSignOut={async () => {
        const { signOut } = await import("firebase/auth");
        const { auth } = await import("@/lib/firebase");
        await signOut(auth);
        router.replace("/auth/login");
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
            Department Activity Logs
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
            System events for {userData.department} department
          </p>
        </div>

        <ActivityLogsViewer
          department={userData.department}
          showFilters={true}
          maxHeight="calc(100vh - 280px)"
        />
      </div>
    </AppShell>
  );
}
