"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db as firestore } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { AppShell } from "@/components/ui/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityLogsViewer } from "@/components/ui/activity-logs-viewer";

export default function AdminActivityLogsPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );
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

        if (data.role !== "admin" && data.role !== "misAdmin") {
          router.replace("/dashboard");
          return;
        }

        setUserData(data);

        const usersSnapshot = await getDocs(collection(firestore, "users"));
        const depts = new Set<string>();
        usersSnapshot.docs.forEach((d) => {
          const dept = d.data().department;
          if (dept) depts.add(dept);
        });
        setDepartments(Array.from(depts).sort());
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
    full_name: userData?.name ?? userData?.full_name ?? "Admin",
    role: (userData?.role ?? "misAdmin") as any,
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
            System Activity Logs
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
            Monitor data ingestion, logins, form saves, and all platform events
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger
              value="all"
              onClick={() => setSelectedDepartment(null)}
            >
              All Activity
            </TabsTrigger>
            <TabsTrigger value="departments">By Department</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ActivityLogsViewer
              showFilters={true}
              maxHeight="calc(100vh - 320px)"
            />
          </TabsContent>

          <TabsContent value="departments" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Department</CardTitle>
                <CardDescription>
                  Choose a department to view its activity logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {departments.map((dept) => (
                    <Button
                      key={dept}
                      variant={
                        selectedDepartment === dept ? "default" : "outline"
                      }
                      onClick={() => setSelectedDepartment(dept)}
                      className="justify-start"
                    >
                      {dept}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedDepartment && (
              <ActivityLogsViewer
                department={selectedDepartment}
                showFilters={true}
                maxHeight="calc(100vh - 550px)"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
