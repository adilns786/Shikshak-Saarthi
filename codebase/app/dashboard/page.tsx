"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import {
  onAuthStateChanged,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/ui/app-shell";
import { ExportReportButton } from "@/components/ui/pdf-export-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import {
  FileText,
  BookOpen,
  Calendar,
  LogOut,
  Key,
  Lightbulb,
  User,
  Award,
  Briefcase,
  GraduationCap,
  Clock,
  Bot,
  BarChart as BarChartIcon,
  Building2,
} from "lucide-react";
import {
  History,
  Layers,
  ClipboardList,
  FileStack,
  Presentation,
  BookMarked,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  InteractiveTour,
  HelpButton,
  type TourStep,
} from "@/components/ui/interactive-tour";

import GeneratePBASButton from "@/components/generatePbas";
import { motion } from "framer-motion";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Enhanced color palette
  const DONUT_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];
  const BAR_COLOR = "#6366f1";

  const computeMetrics = (profileData: any) => {
    if (!profileData) {
      console.log("⚠️ No profile data provided");
      return null;
    }

    console.log("🔍 Computing metrics for profile:", profileData);

    const researchPapers = profileData.part_b?.table2?.researchPapers ?? [];
    const publications = profileData.part_b?.table2?.publications ?? [];
    const patents = profileData.part_b?.patents_policy_awards ?? [];
    const lectures = profileData.part_b?.invited_lectures ?? [];
    const courses = profileData.part_a?.courses_fdp ?? [];
    const researchProjects = profileData.part_b?.table2?.researchProjects ?? [];
    const consultancyProjects =
      profileData.part_b?.table2?.consultancyProjects ?? [];
    const guidance = profileData.part_b?.table2?.researchGuidance ?? [];

    console.log("📊 Array lengths:", {
      researchPapers: researchPapers.length,
      publications: publications.length,
      patents: patents.length,
      lectures: lectures.length,
      courses: courses.length,
      researchProjects: researchProjects.length,
      consultancyProjects: consultancyProjects.length,
      guidance: guidance.length,
    });

    const totalResearchPapers = researchPapers.length;
    const totalPublications = publications.length;
    const totalPatents = patents.length;
    const totalLectures = lectures.length;
    const totalCourses = courses.length;
    const totalResearchProjects = researchProjects.length;
    const totalConsultancy = consultancyProjects.length;
    const totalGuidance = guidance.length;

    const categoryCounts = {
      "Research Papers": totalResearchPapers,
      Publications: totalPublications,
      "Patents & Awards": totalPatents,
      "Invited Lectures": totalLectures,
      Projects: totalResearchProjects + totalConsultancy,
    };

    const yearCounts: Record<string, number> = {};
    const safeGetYear = (item: any) => {
      if (!item) return null;
      if (item.year) return String(item.year);
      if (item.date_of_award) {
        const y = new Date(item.date_of_award).getFullYear();
        if (!Number.isNaN(y)) return String(y);
      }
      if (item.year_passing) return String(item.year_passing);
      if (item.date) {
        const y = new Date(item.date).getFullYear();
        if (!Number.isNaN(y)) return String(y);
      }
      return null;
    };
    const pushToYear = (y: string | null) => {
      if (!y) return;
      yearCounts[y] = (yearCounts[y] || 0) + 1;
    };

    researchPapers.forEach((p: any) => pushToYear(safeGetYear(p)));
    publications.forEach((p: any) => pushToYear(safeGetYear(p)));
    researchProjects.forEach((p: any) => pushToYear(safeGetYear(p)));
    consultancyProjects.forEach((p: any) => pushToYear(safeGetYear(p)));

    const yearData = Object.keys(yearCounts)
      .map((y) => ({ year: y, count: yearCounts[y] }))
      .sort((a, b) => Number(a.year) - Number(b.year));

    const totalOutputs =
      totalResearchPapers +
      totalPublications +
      totalPatents +
      totalLectures +
      totalResearchProjects +
      totalConsultancy;

    let topCategory = "None";
    {
      const entries = Object.entries(categoryCounts);
      entries.sort((a, b) => b[1] - a[1]);
      if (entries.length > 0) topCategory = entries[0][0];
    }

    let mostProductiveYear: string | null = null;
    if (yearData.length > 0) {
      const sortedByCount = [...yearData].sort((a, b) => b.count - a.count);
      mostProductiveYear = sortedByCount[0].year;
    }

    const parseAmount = (v: any) => {
      if (!v && v !== 0) return 0;
      if (typeof v === "number") return v;
      const s = String(v).replace(/[^0-9.-]+/g, "");
      const n = parseFloat(s);
      return Number.isNaN(n) ? 0 : n;
    };
    const totalGrantAmount =
      researchProjects.reduce(
        (acc: number, p: any) => acc + parseAmount(p.amount),
        0,
      ) +
      consultancyProjects.reduce(
        (acc: number, p: any) => acc + parseAmount(p.amount),
        0,
      );

    return {
      totals: {
        totalResearchPapers,
        totalPublications,
        totalPatents,
        totalLectures,
        totalCourses,
        totalResearchProjects,
        totalConsultancy,
        totalGuidance,
        totalOutputs,
        totalGrantAmount,
      },
      categoryCounts,
      yearData,
      topCategory,
      mostProductiveYear,
    };
  };

  useEffect(() => {
    const cachedProfile = localStorage.getItem("pbas_profile");
    const cachedMetrics = localStorage.getItem("pbas_metrics");
    if (cachedProfile) {
      try {
        const p = JSON.parse(cachedProfile);
        setProfile(p);
        if (cachedMetrics) setMetrics(JSON.parse(cachedMetrics));
        setLoading(false);
      } catch {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (!userDoc.exists()) {
          await signOut(auth);
          router.replace("/auth/login");
          return;
        }
        const liveProfile = userDoc.data();

        // Redirect admin users directly to admin dashboard
        if (liveProfile.role === "misAdmin" || liveProfile.role === "admin") {
          router.replace("/admin/appraisals");
          return;
        }

        // Redirect HOD to HOD dashboard
        if (liveProfile.role === "hod") {
          router.replace("/hod/dashboard");
          return;
        }

        console.log("📊 Loaded profile from Firebase:", liveProfile);
        console.log("📝 Part B data:", liveProfile?.part_b);
        console.log(
          "📚 Publications:",
          liveProfile?.part_b?.table2?.publications,
        );
        console.log(
          "🔬 Research Papers:",
          liveProfile?.part_b?.table2?.researchPapers,
        );
        console.log("🏆 Patents:", liveProfile?.part_b?.patents_policy_awards);

        setProfile(liveProfile || {});
        const liveMetrics = computeMetrics(liveProfile);
        console.log("📈 Computed metrics:", liveMetrics);
        setMetrics(liveMetrics);
        try {
          localStorage.setItem("pbas_profile", JSON.stringify(liveProfile));
          localStorage.setItem("pbas_metrics", JSON.stringify(liveMetrics));
        } catch {}
        setLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err);
        await signOut(auth);
        router.replace("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const tmp: string[] = [];
    if (!metrics) {
      setInsights([
        "No academic data found yet — start adding research, publications or projects to get rich insights.",
      ]);
      return;
    }
    const { totals, topCategory, mostProductiveYear } = metrics as any;
    tmp.push(
      `You have recorded ${totals.totalOutputs} academic outputs (papers, publications, patents, lectures, projects).`,
    );
    if (totals.totalOutputs > 0)
      tmp.push(`Top contribution area: ${topCategory}.`);
    if (totals.totalGuidance > 0)
      tmp.push(`Guided students: ${totals.totalGuidance}.`);
    else
      tmp.push(
        "No research guidance recorded — consider adding guided students.",
      );
    if (mostProductiveYear)
      tmp.push(`Most productive year: ${mostProductiveYear}.`);
    if (totals.totalGrantAmount > 0)
      tmp.push(
        `Total recorded funding: ₹ ${totals.totalGrantAmount.toFixed(2)}.`,
      );
    if (totals.totalPublications < 2)
      tmp.push(
        "Consider publishing more peer-reviewed articles to strengthen your profile.",
      );
    if (totals.totalCourses < 1)
      tmp.push(
        "Attend/organize at least one FDP/course this year for teaching credentials.",
      );

    setInsights(tmp);
  }, [metrics]);

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password mismatch!");
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user || !profile?.email) return;
      const credential = EmailAuthProvider.credential(
        profile.email,
        passwordForm.oldPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);
      alert("Password updated successfully!");
      setShowPasswordModal(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      try {
        localStorage.removeItem("pbas_profile");
        localStorage.removeItem("pbas_metrics");
      } catch {}
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error updating password");
    }
  };

  if (loading || !profile) {
    return (
      <div
        className="page-shell flex items-center justify-center"
        style={{ background: "var(--surface-base)" }}
      >
        <div className="w-full max-w-4xl px-6 space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl skeleton-shimmer" />
            <div className="space-y-2">
              <div className="w-44 h-5 rounded-lg skeleton-shimmer" />
              <div className="w-28 h-3.5 rounded-lg skeleton-shimmer" />
            </div>
          </div>
          {/* Stat cards skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 space-y-3"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
                <div className="w-12 h-7 rounded-lg skeleton-shimmer" />
                <div className="w-20 h-3.5 rounded-lg skeleton-shimmer" />
              </div>
            ))}
          </div>
          {/* Wide card skeleton */}
          <div
            className="rounded-2xl p-6 space-y-3"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="w-36 h-5 rounded-lg skeleton-shimmer" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-12 rounded-xl skeleton-shimmer"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const yearChartData =
    metrics?.yearData && metrics.yearData.length > 0
      ? metrics.yearData.map((d: any) => ({ year: d.year, count: d.count }))
      : [{ year: new Date().getFullYear().toString(), count: 0 }];

  const donutData = metrics
    ? Object.entries(metrics.categoryCounts)
        .filter(([_, value]) => (value as number) > 0)
        .map(([name, value]) => ({ name, value: value as number }))
    : [];

  const quickActions = [
    {
      title: "Profile",
      subtitle: "Profile Details",
      href: "/dashboard/forms/profile",
      icon: User,
    },
    {
      title: "Faculty Details",
      subtitle: "Personal & Contact Information",
      href: "/dashboard/forms/part-a/personal-info",
      icon: Briefcase,
    },
    {
      title: "Qualifications",
      subtitle: "Academic Qualifications",
      href: "/dashboard/forms/part-a/qualifications",
      icon: GraduationCap,
    },
    {
      title: "Research Degrees",
      subtitle: "Research Qualifications",
      href: "/dashboard/forms/part-a/research",
      icon: Award,
    },
    {
      title: "Employment History",
      subtitle: "Past Employment Info",
      href: "/dashboard/forms/part-a/employment-history",
      icon: History,
    },
    {
      title: "Teaching Experience",
      subtitle: "Teaching Details",
      href: "/dashboard/forms/part-a/teaching-experience",
      icon: BookOpen,
    },
    {
      title: "Courses & FDP",
      subtitle: "Refresher & MOOCs",
      href: "/dashboard/forms/part-a/courses_fdp",
      icon: Layers,
    },
    {
      title: "Teaching & Student Activity Assessment",
      subtitle: "Self & Verified Grading",
      href: "/dashboard/forms/part-b/table1",
      icon: ClipboardList,
    },
    {
      title: "Research & Academic Contribution",
      subtitle: "Self & Verified Contributions",
      href: "/dashboard/forms/part-b/table2",
      icon: FileStack,
    },
    {
      title: "Patents, Policy, and Awards Module",
      subtitle: "Patents, Policy, and Awards Assessment",
      href: "/dashboard/forms/part-b/patents_policy_awards",
      icon: Lightbulb,
    },
    {
      title: "Lectures & Conference Presentations",
      subtitle: "Lectures & Conference Presentations Assessment",
      href: "/dashboard/forms/part-b/invited_lectures",
      icon: Presentation,
    },
  ];

  const totals = metrics?.totals ?? {
    totalResearchPapers: 0,
    totalPublications: 0,
    totalPatents: 0,
    totalLectures: 0,
    totalCourses: 0,
    totalResearchProjects: 0,
    totalConsultancy: 0,
    totalGuidance: 0,
    totalOutputs: 0,
    totalGrantAmount: 0,
  };

  console.log("📊 Current totals:", totals);
  console.log("📊 Current metrics:", metrics);

  const appUser = {
    email: profile?.email ?? "",
    full_name:
      profile?.personal_in?.name ?? profile?.name ?? profile?.full_name,
    role: (profile?.role ?? "faculty") as any,
    department: profile?.formHeader?.department_name ?? profile?.department,
    profile_image_url: profile?.profile_image_url,
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/auth/login");
  };

  return (
    <AppShell user={appUser} onSignOut={handleSignOut}>
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* Page Header */}
        <header className="glass-card p-5 sm:p-6" data-tour="profile-header">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "var(--text-1)" }}
              >
                Welcome,{" "}
                {profile?.personal_in?.name ?? profile?.name ?? "Faculty"}!
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-sm" style={{ color: "var(--text-3)" }}>
                  {profile?.formHeader?.department_name ??
                    profile?.department ??
                    ""}
                </p>
                {profile?.formHeader?.academic_year && (
                  <>
                    <span style={{ color: "var(--border-strong)" }}>•</span>
                    <p className="text-sm" style={{ color: "var(--text-3)" }}>
                      {profile.formHeader.academic_year}
                    </p>
                  </>
                )}
              </div>
              {profile?.formHeader?.cas_promotion_stage && (
                <div
                  className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "var(--brand-primary-subtle)",
                    color: "var(--brand-primary)",
                  }}
                >
                  {profile.formHeader.cas_promotion_stage}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div data-tour="generate-pbas">
                <GeneratePBASButton userId={auth.currentUser?.uid ?? ""} />
              </div>
              <ExportReportButton
                targetUserId={auth.currentUser?.uid ?? undefined}
                targetName={profile?.personal_in?.name ?? profile?.name}
                label="Export Report"
              />
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(true)}
                size="sm"
              >
                <Key className="mr-2 h-4 w-4" /> Change Password
              </Button>
            </div>
          </div>
        </header>

        {/* Empty Data Banner - Only show if truly no data */}
        {totals?.totalOutputs === 0 && totals?.totalCourses === 0 && (
          <div
            className="rounded-2xl p-4 sm:p-6"
            style={{
              background: "var(--brand-primary-subtle)",
              border: "1px solid var(--brand-primary-alpha20)",
            }}
          >
            <div className="flex items-start gap-3">
              <Lightbulb
                className="h-6 w-6 flex-shrink-0 mt-1"
                style={{ color: "var(--brand-primary)" }}
              />
              <div>
                <h3
                  className="font-semibold mb-1"
                  style={{ color: "var(--text-1)" }}
                >
                  Welcome! Let&apos;s build your PBAS profile
                </h3>
                <p className="text-sm mb-3" style={{ color: "var(--text-2)" }}>
                  Your profile is empty. Start by filling out your academic
                  information, publications, and research work using the forms
                  below. Data is automatically saved to Firebase and will appear
                  here in real-time.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/dashboard/forms/part-a/personal-info">
                    <Button size="sm" className="btn-primary">
                      Start with Personal Info
                    </Button>
                  </Link>
                  <Link href="/dashboard/forms/part-b/table2">
                    <Button size="sm" variant="outline">
                      Add Publications
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Research Papers",
              count: totals.totalResearchPapers ?? 0,
              sub: "Peer-reviewed papers",
              icon: BookOpen,
              accent: "#6366f1",
            },
            {
              label: "Publications",
              count: totals.totalPublications ?? 0,
              sub: "Books & chapters",
              icon: FileText,
              accent: "#f59e0b",
            },
            {
              label: "Patents & Awards",
              count: totals.totalPatents ?? 0,
              sub: "Recognitions",
              icon: Award,
              accent: "#10b981",
            },
            {
              label: "Invited Lectures",
              count: totals.totalLectures ?? 0,
              sub: "Talks & presentations",
              icon: Calendar,
              accent: "#8b5cf6",
            },
          ].map(({ label, count, sub, icon: Icon, accent }) => (
            <div
              key={label}
              className="rounded-2xl p-5 transition-shadow hover:shadow-md"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${accent}22` }}
              >
                <Icon className="h-5 w-5" style={{ color: accent }} />
              </div>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--text-1)" }}
              >
                {count}
              </p>
              <p
                className="text-sm font-medium mt-0.5"
                style={{ color: "var(--text-2)" }}
              >
                {label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h3
              className="text-lg font-semibold mb-1"
              style={{ color: "var(--text-1)" }}
            >
              Academic Output Timeline
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
              Year-wise contribution breakdown
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={yearChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-subtle)"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: "var(--text-3)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--border-default)" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--text-3)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--border-default)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface-1)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "8px",
                      color: "var(--text-1)",
                    }}
                    labelStyle={{ color: "var(--text-2)" }}
                  />
                  <Bar
                    dataKey="count"
                    name="Outputs"
                    fill={BAR_COLOR}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h3
              className="text-lg font-semibold mb-1"
              style={{ color: "var(--text-1)" }}
            >
              Category Distribution
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
              Contribution by category
            </p>
            {donutData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {donutData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface-1)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "8px",
                        color: "var(--text-1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "12px",
                        paddingTop: "12px",
                        color: "var(--text-2)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                className="h-64 flex items-center justify-center"
                style={{ color: "var(--text-3)" }}
              >
                <p>No data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        <div
          className="rounded-2xl p-5"
          data-tour="stats-overview"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb
              className="h-5 w-5"
              style={{ color: "var(--warning)" }}
            />
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-1)" }}
            >
              Insights &amp; Suggestions
            </h3>
          </div>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span style={{ color: "var(--warning)", marginTop: 2 }}>•</span>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-2)" }}
                >
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div data-tour="quick-actions">
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-1)" }}
          >
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <a
                  key={idx}
                  href={action.href}
                  className="group block p-4 rounded-xl transition-all"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--brand-primary-alpha20)";
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--brand-primary-subtle)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border-subtle)";
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--surface-1)";
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ background: "var(--brand-primary-subtle)" }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: "var(--brand-primary)" }}
                      />
                    </div>
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-1)" }}
                    >
                      {action.title}
                    </h3>
                  </div>
                  <p
                    className="text-xs pl-11"
                    style={{ color: "var(--text-3)" }}
                  >
                    {action.subtitle}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Floating AI Button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full shadow-xl h-14 px-6 text-white"
        style={{ background: "var(--brand-primary)" }}
        onClick={() => router.push("/chatbot")}
      >
        <Bot className="h-5 w-5 mr-2" />
        <span className="font-medium">AI Assistant</span>
      </Button>

      {/* Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordChange();
            }}
          >
            {[
              { key: "oldPassword", label: "Old Password" },
              { key: "newPassword", label: "New Password" },
              { key: "confirmPassword", label: "Confirm New Password" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-2)" }}
                >
                  {label}
                </label>
                <input
                  type="password"
                  required
                  className="w-full p-2.5 rounded-lg outline-none"
                  style={{
                    background: "var(--surface-base)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-1)",
                  }}
                  value={passwordForm[key as keyof typeof passwordForm]}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, [key]: e.target.value })
                  }
                />
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Password</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Interactive Tour */}
      <InteractiveTour />
      <HelpButton
        steps={[
          {
            target: "[data-tour='profile-header']",
            title: "Welcome to Your Dashboard!",
            content:
              "This is your personal dashboard where you can manage your PBAS forms and track your academic achievements.",
            placement: "bottom",
          },
          {
            target: "[data-tour='quick-actions']",
            title: "Quick Actions",
            content:
              "Access all your important PBAS forms from here. Click any category to start filling your forms.",
            placement: "bottom",
          },
          {
            target: "[data-tour='stats-overview']",
            title: "Your Statistics",
            content:
              "Track your research outputs, publications, and academic contributions at a glance.",
            placement: "top",
          },
          {
            target: "[data-tour='generate-pbas']",
            title: "Generate PBAS Report",
            content:
              "When you're ready, click here to generate your complete PBAS report PDF.",
            placement: "left",
          },
        ]}
      />
    </AppShell>
  );
}
