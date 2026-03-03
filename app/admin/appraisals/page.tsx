"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db as firestore } from "@/lib/firebase";
import { AppShell } from "@/components/ui/app-shell";
import { ExportReportButton } from "@/components/ui/pdf-export-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, FileText, CheckCircle, Clock, BarChart3 } from "lucide-react";

export default function AdminAppraisalsPage() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
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

        const userData = userDoc.data();

        // HOD should go to their own dashboard
        if (userData.role === "hod") {
          router.replace("/hod/dashboard");
          return;
        }

        // Only admins can access this page
        if (userData.role !== "misAdmin" && userData.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setUserRole(userData.role);
        setUserData(userData);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        router.replace("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const appUser = {
    email: userData?.email ?? "",
    full_name: userData?.name ?? userData?.full_name ?? "Admin",
    role: (userRole ?? "admin") as any,
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
        <header className="glass-card p-5 sm:p-6 flex items-center justify-between">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold"
              style={{ color: "var(--text-1)" }}
            >
              Admin Dashboard
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
              Manage faculty appraisals and system settings
            </p>
          </div>
          <ExportReportButton label="Export All" />
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Faculty</p>
                  <p className="text-3xl font-bold text-blue-600">24</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pending Reviews</p>
                  <p className="text-3xl font-bold text-orange-600">8</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-green-600">12</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Submissions</p>
                  <p className="text-3xl font-bold text-purple-600">20</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Manage Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Create, update, and manage faculty user accounts
              </p>
              <Link href="/admin/manage-users">
                <Button className="w-full">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Faculty Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                View comprehensive analytics and performance metrics
              </p>
              <Link href="/dashboard/stats">
                <Button className="w-full" variant="outline">
                  View Statistics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Review Appraisals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Review and approve faculty PBAS submissions
              </p>
              <Button className="w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
