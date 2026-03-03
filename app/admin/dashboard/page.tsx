"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db as firestore } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { AppShell } from "@/components/ui/app-shell";
import { ExportReportButton } from "@/components/ui/pdf-export-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Activity,
  BarChart3,
  Download,
  Settings,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07 },
  }),
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalHod: 0,
    totalUsers: 0,
    withPbas: 0,
  });
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

        if (data.role === "hod") {
          router.replace("/hod/dashboard");
          return;
        }

        if (data.role !== "misAdmin" && data.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setUserRole(data.role);
        setUserData(data);

        // Load real stats
        const usersSnap = await getDocs(collection(firestore, "users"));
        let faculty = 0;
        let hod = 0;
        let withPbas = 0;
        usersSnap.forEach((d) => {
          const u = d.data();
          if (u.role === "faculty") faculty++;
          if (u.role === "hod") hod++;
          if (u.part_b || u.part_a) withPbas++;
        });
        setStats({
          totalFaculty: faculty,
          totalHod: hod,
          totalUsers: usersSnap.size,
          withPbas,
        });

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const appUser = {
    email: userData?.email ?? "",
    full_name: userData?.name ?? userData?.full_name ?? "Admin",
    role: (userRole ?? "misAdmin") as any,
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "var(--text-1)" }}
              >
                Admin Dashboard
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
                Manage users, view analytics, and export faculty PBAS data
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ExportReportButton label="Export All" />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Total Users",
              value: stats.totalUsers,
              color: "text-blue-600",
              bg: "bg-blue-50",
              icon: Users,
            },
            {
              label: "Faculty Members",
              value: stats.totalFaculty,
              color: "text-[var(--brand-primary)]",
              bg: "bg-[var(--brand-primary-subtle)]",
              icon: BookOpen,
            },
            {
              label: "HOD Members",
              value: stats.totalHod,
              color: "text-green-600",
              bg: "bg-green-50",
              icon: Users,
            },
            {
              label: "With PBAS Data",
              value: stats.withPbas,
              color: "text-purple-600",
              bg: "bg-purple-50",
              icon: Database,
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={FADE_UP}
              initial="hidden"
              animate="show"
            >
              <Card
                className="border shadow-sm hover:shadow-md transition-shadow"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-xs sm:text-sm mb-1"
                        style={{ color: "var(--text-3)" }}
                      >
                        {s.label}
                      </p>
                      <p
                        className={`text-2xl sm:text-3xl font-bold ${s.color}`}
                      >
                        {s.value}
                      </p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-xl ${s.bg}`}>
                      <s.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${s.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <motion.div
            custom={4}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
          >
            <Card
              className="h-full border shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5 text-blue-600" />
                  Manage Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
                  Create, update, and manage faculty user accounts
                </p>
                <Link href="/admin/manage-users">
                  <Button className="w-full">Manage Users</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            custom={5}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
          >
            <Card
              className="h-full border shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Faculty Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
                  View comprehensive analytics and performance metrics
                </p>
                <Link href="/dashboard/stats">
                  <Button className="w-full" variant="outline">
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            custom={6}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
          >
            <Card
              className="h-full border shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-green-600" />
                  Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
                  View system activity logs and data ingestion events
                </p>
                <Link href="/admin/activity-logs">
                  <Button className="w-full" variant="outline">
                    View Logs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            custom={7}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
          >
            <Card
              className="h-full border shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Download
                    className="h-5 w-5"
                    style={{ color: "var(--brand-primary)" }}
                  />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
                  Export faculty PBAS data, analytics, and reports as CSV
                </p>
                <Link href="/export">
                  <Button className="w-full" variant="outline">
                    Export Data
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            custom={8}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
          >
            <Card
              className="h-full border shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                  All Faculty Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
                  View all faculty PBAS submissions and profiles
                </p>
                <Link href="/admin/users">
                  <Button className="w-full" variant="outline">
                    View Faculty
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            custom={9}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
          >
            <Card
              className="h-full border shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings
                    className="h-5 w-5"
                    style={{ color: "var(--text-3)" }}
                  />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
                  Configure system preferences and user settings
                </p>
                <Link href="/settings">
                  <Button className="w-full" variant="outline">
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
