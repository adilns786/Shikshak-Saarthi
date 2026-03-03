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
  orderBy,
  limit,
} from "firebase/firestore";
import { AppShell } from "@/components/ui/app-shell";
import { motion } from "framer-motion";
import {
  Mail,
  Building2,
  BadgeCheck,
  BookOpen,
  Award,
  FileText,
  Calendar,
  Phone,
  IdCard,
  GraduationCap,
  TrendingUp,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  role: string;
  name?: string;
  full_name?: string;
  email: string;
  department?: string;
  phone?: string;
  designation?: string;
  employee_id?: string;
  created_at?: string;
}

interface ActivityItem {
  id: string;
  description: string;
  created_at: string;
}

const FADE_UP = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, delay: i * 0.08, ease: [0, 0, 0.2, 1] },
  }),
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      try {
        const snap = await getDoc(doc(firestore, "users", user.uid));
        if (snap.exists()) setUserData(snap.data() as UserData);
        try {
          const logsSnap = await getDocs(
            query(
              collection(firestore, "activity_logs"),
              where("user_id", "==", user.uid),
              orderBy("created_at", "desc"),
              limit(5),
            ),
          );
          setRecentActivity(
            logsSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
              created_at:
                d.data().created_at?.toDate?.()?.toISOString() ||
                d.data().created_at,
            })) as ActivityItem[],
          );
        } catch {
          /* activity logs optional */
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--surface-base)" }}
      >
        <div className="w-full max-w-3xl px-6 space-y-5">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl skeleton-shimmer shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="w-44 h-6 rounded-xl skeleton-shimmer" />
              <div className="w-28 h-4 rounded-lg skeleton-shimmer" />
              <div className="w-36 h-3 rounded-lg skeleton-shimmer" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 space-y-3"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="w-8 h-8 rounded-xl skeleton-shimmer" />
                <div className="w-20 h-4 rounded-lg skeleton-shimmer" />
                <div className="w-32 h-3 rounded-lg skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    userData?.full_name ?? userData?.name ?? userData?.email ?? "User";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
  const roleLabel: Record<string, string> = {
    faculty: "Faculty",
    hod: "Head of Department",
    admin: "Administrator",
    misAdmin: "MIS Administrator",
  };

  const infoFields = [
    { icon: Mail, label: "Email", value: userData?.email },
    { icon: Building2, label: "Department", value: userData?.department },
    {
      icon: BadgeCheck,
      label: "Role",
      value: roleLabel[userData?.role ?? ""] ?? userData?.role,
    },
    { icon: IdCard, label: "Designation", value: userData?.designation || "—" },
    { icon: Phone, label: "Phone", value: userData?.phone || "—" },
    {
      icon: GraduationCap,
      label: "Employee ID",
      value: userData?.employee_id || "—",
    },
    {
      icon: Calendar,
      label: "Joined",
      value: userData?.created_at
        ? new Date(userData.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "—",
    },
  ];

  const quickLinks = [
    {
      icon: FileText,
      label: "PBAS Forms",
      href: "/dashboard/forms/part-a/personal-info",
      color: "var(--brand-primary)",
      bg: "var(--brand-primary-subtle)",
    },
    {
      icon: BookOpen,
      label: "Publications",
      href: "/publications",
      color: "var(--brand-accent)",
      bg: "var(--brand-accent-subtle)",
    },
    {
      icon: Award,
      label: "Appraisals",
      href: "/appraisal",
      color: "var(--brand-purple)",
      bg: "var(--brand-purple-subtle)",
    },
    {
      icon: TrendingUp,
      label: "Dashboard",
      href: "/dashboard",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
  ];

  const cardStyle = {
    background: "var(--surface-1)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-1)",
  };

  return (
    <AppShell
      user={
        userData
          ? {
              email: userData.email,
              name: displayName,
              role: userData.role as "faculty" | "hod" | "admin" | "misAdmin",
              department: userData.department,
            }
          : null
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Hero card */}
        <motion.div
          custom={0}
          variants={FADE_UP}
          initial="hidden"
          animate="show"
          className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          style={cardStyle}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 text-2xl font-black text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-primary) 0%, #c73210 100%)",
              boxShadow: "var(--glow-primary)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold truncate"
              style={{ color: "var(--text-1)" }}
            >
              {displayName}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
              {userData?.designation || roleLabel[userData?.role ?? ""] || ""}
              {userData?.department ? ` · ${userData.department}` : ""}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "var(--brand-primary-subtle)",
                  color: "var(--brand-primary)",
                }}
              >
                {roleLabel[userData?.role ?? ""] ?? userData?.role}
              </span>
              {userData?.department && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "var(--border-subtle)",
                    color: "var(--text-2)",
                  }}
                >
                  {userData.department}
                </span>
              )}
            </div>
          </div>
          <Link
            href="/settings"
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: "var(--border-subtle)",
              color: "var(--text-2)",
            }}
          >
            Edit profile <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Info grid */}
        <motion.div
          custom={1}
          variants={FADE_UP}
          initial="hidden"
          animate="show"
          className="rounded-2xl p-6"
          style={cardStyle}
        >
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--text-2)" }}
          >
            Account Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-y-5 gap-x-8">
            {infoFields.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "var(--border-subtle)" }}
                >
                  <f.icon
                    className="w-4 h-4"
                    style={{ color: "var(--text-3)" }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs font-medium mb-0.5"
                    style={{ color: "var(--text-3)" }}
                  >
                    {f.label}
                  </p>
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--text-1)" }}
                  >
                    {f.value || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          custom={2}
          variants={FADE_UP}
          initial="hidden"
          animate="show"
          className="rounded-2xl p-6"
          style={cardStyle}
        >
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--text-2)" }}
          >
            Quick Links
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map((ql) => (
              <Link
                key={ql.label}
                href={ql.href}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all hover-lift"
                style={{ background: ql.bg }}
              >
                <ql.icon className="w-5 h-5" style={{ color: ql.color }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: ql.color }}
                >
                  {ql.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        {recentActivity.length > 0 && (
          <motion.div
            custom={3}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
            className="rounded-2xl p-6"
            style={cardStyle}
          >
            <h2
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--text-2)" }}
            >
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "var(--brand-primary-subtle)" }}
                  >
                    <Clock
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--brand-primary)" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-1)" }}
                    >
                      {item.description}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-3)" }}
                    >
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
