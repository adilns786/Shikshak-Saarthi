"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebaseConfig";
import { AppShell } from "@/components/ui/app-shell";

interface AppUser {
  email: string;
  name?: string;
  full_name?: string;
  role: "faculty" | "hod" | "admin" | "misAdmin";
  department?: string;
  profile_image_url?: string;
}

export default function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AppUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/auth/login");
        return;
      }
      try {
        const snap = await getDoc(doc(firestore, "users", firebaseUser.uid));
        if (snap.exists()) {
          const d = snap.data() as any;
          setUser({
            email: d.email ?? firebaseUser.email ?? "",
            name: d.name ?? d.full_name ?? undefined,
            full_name: d.full_name ?? d.name ?? undefined,
            role: (d.role ?? "faculty") as AppUser["role"],
            department:
              d.formHeader?.department_name ?? d.department ?? undefined,
            profile_image_url: d.profile_image_url ?? undefined,
          });
        }
      } catch {
        /* ignore – form pages will redirect if needed */
      }
    });
    return () => unsub();
  }, [router]);

  return (
    <AppShell user={user}>
      <div className="max-w-5xl mx-auto py-2">{children}</div>
    </AppShell>
  );
}
