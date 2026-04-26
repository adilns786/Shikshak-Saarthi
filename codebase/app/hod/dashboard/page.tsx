"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db as firestore } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportButton } from "@/components/ui/export-button";
import { AppShell } from "@/components/ui/app-shell";
import { ExportReportButton } from "@/components/ui/pdf-export-dialog";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  BarChart3,
  Building2,
  FileText,
  GraduationCap,
  Briefcase,
  Presentation,
  BookMarked,
  Bot,
  Target,
  Zap,
  LogOut,
  Loader2,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import GeneratePBASButton from "@/components/generatePbas";
import { DepartmentAnalyticsComponent } from "@/components/ui/department-analytics";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function HODDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [deptStats, setDeptStats] = useState<any>(null);
  const [personalMetrics, setPersonalMetrics] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

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

        if (userData.role !== "hod") {
          router.replace("/dashboard");
          return;
        }

        setProfile(userData);
        setPersonalMetrics(computePersonalMetrics(userData));
        await fetchDepartmentStats(userData.department);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        router.replace("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const computePersonalMetrics = (profileData: any) => {
    if (!profileData) return null;

    const researchPapers = profileData.part_b?.table2?.researchPapers ?? [];
    const publications = profileData.part_b?.table2?.publications ?? [];
    const patents = profileData.part_b?.patents_policy_awards ?? [];
    const lectures = profileData.part_b?.invited_lectures ?? [];
    const projects = profileData.part_b?.table2?.researchProjects ?? [];
    const consultancy = profileData.part_b?.table2?.consultancyProjects ?? [];
    const guidance = profileData.part_b?.table2?.researchGuidance ?? [];

    const totalOutputs =
      researchPapers.length +
      publications.length +
      patents.length +
      lectures.length +
      projects.length +
      consultancy.length;

    return {
      totalResearchPapers: researchPapers.length,
      totalPublications: publications.length,
      totalPatents: patents.length,
      totalLectures: lectures.length,
      totalProjects: projects.length + consultancy.length,
      totalGuidance: guidance.length,
      totalOutputs,
    };
  };

  const fetchDepartmentStats = async (department: string) => {
    try {
      setLoadingStats(true);
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("department", "==", department));
      const querySnapshot = await getDocs(q);

      let totalFaculty = 0;
      let totalPublications = 0;
      let totalPatents = 0;
      let totalProjects = 0;
      let totalGuidance = 0;
      const facultyList: any[] = [];
      const yearlyData: Record<string, number> = {};
      const categoryData: Record<string, number> = {
        "Research Papers": 0,
        Publications: 0,
        Patents: 0,
        Projects: 0,
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "faculty" || data.role === "hod") {
          totalFaculty++;

          const publications = data.part_b?.table2?.publications || [];
          const researchPapers = data.part_b?.table2?.researchPapers || [];
          const patents = data.part_b?.patents_policy_awards || [];
          const projects = data.part_b?.table2?.researchProjects || [];
          const consultancy = data.part_b?.table2?.consultancyProjects || [];
          const guidance = data.part_b?.table2?.researchGuidance || [];

          const facultyPubs = publications.length + researchPapers.length;
          totalPublications += facultyPubs;
          totalPatents += patents.length;
          totalProjects += projects.length + consultancy.length;
          totalGuidance += guidance.length;

          categoryData["Research Papers"] += researchPapers.length;
          categoryData["Publications"] += publications.length;
          categoryData["Patents"] += patents.length;
          categoryData["Projects"] += projects.length + consultancy.length;

          // Year-wise analysis
          [...researchPapers, ...publications, ...patents].forEach(
            (item: any) => {
              const year = item.year || new Date().getFullYear();
              yearlyData[year] = (yearlyData[year] || 0) + 1;
            },
          );

          facultyList.push({
            id: doc.id,
            name: data.name || data.email,
            email: data.email,
            publications: facultyPubs,
            patents: patents.length,
            projects: projects.length + consultancy.length,
            guidance: guidance.length,
          });
        }
      });

      const yearData = Object.entries(yearlyData)
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => Number(a.year) - Number(b.year));

      const categoryChartData = Object.entries(categoryData).map(
        ([name, value]) => ({
          name,
          value,
        }),
      );

      setDeptStats({
        totalFaculty,
        totalPublications,
        totalPatents,
        totalProjects,
        totalGuidance,
        facultyList: facultyList.sort(
          (a, b) => b.publications - a.publications,
        ),
        yearData,
        categoryChartData,
        avgPublicationsPerFaculty:
          totalFaculty > 0 ? (totalPublications / totalFaculty).toFixed(1) : 0,
      });
    } catch (err) {
      console.error("Error fetching department stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 border-4 border-t-transparent border-blue-500 rounded-full"
        />
        <p className="mt-4 text-slate-600 font-medium">
          Loading HOD Dashboard...
        </p>
      </div>
    );
  }

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  const pbasFormSections = [
    {
      title: "Personal Information",
      subtitle: "Basic Details & Contact Info",
      href: "/dashboard/forms/part-a/personal-info",
      icon: FileText,
    },
    {
      title: "Academic Qualifications",
      subtitle: "Educational Background",
      href: "/dashboard/forms/part-a/academic-qualifications",
      icon: GraduationCap,
    },
    {
      title: "Employment History",
      subtitle: "Professional Experience",
      href: "/dashboard/forms/part-a/employment",
      icon: Briefcase,
    },
    {
      title: "Research Publications",
      subtitle: "Papers, Books & Chapters",
      href: "/dashboard/forms/part-b/table2",
      icon: BookMarked,
    },
    {
      title: "Patents & Awards",
      subtitle: "Recognition & Intellectual Property",
      href: "/dashboard/forms/part-b/patents-policy-awards",
      icon: Award,
    },
    {
      title: "Invited Lectures",
      subtitle: "Conferences & Presentations",
      href: "/dashboard/forms/part-b/invited_lectures",
      icon: Presentation,
    },
  ];

  return (
    <AppShell
      user={{
        email: profile?.email ?? "",
        full_name: profile?.name ?? profile?.full_name ?? "HOD",
        role: (profile?.role ?? "hod") as any,
        department: profile?.department,
        profile_image_url: profile?.profile_image_url,
      }}
      onSignOut={handleLogout}
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="glass-card p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: "var(--brand-primary-subtle)" }}
                >
                  <Building2
                    className="h-5 w-5"
                    style={{ color: "var(--brand-primary)" }}
                  />
                </div>
                <div>
                  <h1
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: "var(--text-1)" }}
                  >
                    HOD Dashboard
                  </h1>
                  <p className="text-sm" style={{ color: "var(--text-3)" }}>
                    {profile?.name}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div
                  className="px-3 py-1 rounded-full"
                  style={{
                    background: "var(--brand-primary-subtle)",
                    color: "var(--brand-primary)",
                  }}
                >
                  <p className="text-sm font-medium">
                    {profile?.department} Department
                  </p>
                </div>
                <div
                  className="px-3 py-1 rounded-full"
                  style={{
                    background: "var(--brand-purple-subtle)",
                    color: "var(--brand-purple)",
                  }}
                >
                  <p className="text-sm font-medium">
                    {profile?.designation || "Head of Department"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <ExportReportButton
                department={profile?.department}
                targetName={`${profile?.department ?? ""} – Dept Data`}
                label="Export Dept Data"
              />
              <Link href="/hod/activity-logs" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  <Activity className="mr-2 h-4 w-4" /> Activity Logs
                </Button>
              </Link>
              <Link href="/admin/users" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" /> Manage Faculty
                </Button>
              </Link>
              <Link href="/dashboard/stats" className="w-full sm:w-auto">
                <Button className="w-full btn-primary">
                  <BarChart3 className="mr-2 h-4 w-4" /> All Faculty Stats
                </Button>
              </Link>
              <Link href="/chatbot" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  <Bot className="mr-2 h-4 w-4" /> AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Tabs for Different Views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="department">Department</TabsTrigger>
            <TabsTrigger value="mydata">My PBAS</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Combined Quick Stats */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Personal Quick Stats */}
            <Card
              style={{
                border: "1px solid var(--border-subtle)",
                background: "var(--surface-1)",
              }}
            >
              <CardHeader>
                <CardTitle
                  className="text-lg flex items-center gap-2"
                  style={{ color: "var(--text-1)" }}
                >
                  <Target
                    className="h-5 w-5"
                    style={{ color: "var(--brand-primary)" }}
                  />
                  My Performance Metrics
                </CardTitle>
                <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                  Your individual research and academic contributions
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    {
                      label: "Papers",
                      val: personalMetrics?.totalResearchPapers || 0,
                      color: "var(--brand-primary)",
                    },
                    {
                      label: "Books",
                      val: personalMetrics?.totalPublications || 0,
                      color: "var(--brand-purple)",
                    },
                    {
                      label: "Patents",
                      val: personalMetrics?.totalPatents || 0,
                      color: "var(--brand-accent)",
                    },
                    {
                      label: "Projects",
                      val: personalMetrics?.totalProjects || 0,
                      color: "#f59e0b",
                    },
                    {
                      label: "Students",
                      val: personalMetrics?.totalGuidance || 0,
                      color: "#ec4899",
                    },
                    {
                      label: "Total",
                      val: personalMetrics?.totalOutputs || 0,
                      color: "var(--brand-accent)",
                    },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="text-center">
                      <p className="text-2xl font-bold" style={{ color }}>
                        {val}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-3)" }}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Department Quick Stats */}
            <div className="space-y-2">
              <h3
                className="text-sm font-semibold px-1"
                style={{ color: "var(--text-1)" }}
              >
                Department Performance Overview
              </h3>
              <p className="text-xs px-1" style={{ color: "var(--text-3)" }}>
                Real-time statistics for {profile?.department} Department
                faculty
              </p>
            </div>
            {loadingStats ? (
              <div className="flex items-center justify-center py-8">
                <Loader2
                  className="h-8 w-8 animate-spin"
                  style={{ color: "var(--brand-primary)" }}
                />
                <span className="ml-2" style={{ color: "var(--text-3)" }}>
                  Loading department statistics...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  {
                    label: "Faculty",
                    val: deptStats?.totalFaculty || 0,
                    icon: Users,
                    accent: "var(--brand-primary)",
                  },
                  {
                    label: "Publications",
                    val: deptStats?.totalPublications || 0,
                    icon: BookOpen,
                    accent: "var(--brand-purple)",
                  },
                  {
                    label: "Patents",
                    val: deptStats?.totalPatents || 0,
                    icon: Award,
                    accent: "var(--brand-accent)",
                  },
                  {
                    label: "Avg/Faculty",
                    val: deptStats?.avgPublicationsPerFaculty || 0,
                    icon: TrendingUp,
                    accent: "#f59e0b",
                  },
                ].map(({ label, val, icon: Icon, accent }) => (
                  <div
                    key={label}
                    className="rounded-2xl p-4 sm:p-6 hover:shadow-md transition-shadow"
                    style={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-xs sm:text-sm mb-1"
                          style={{ color: "var(--text-3)" }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-2xl sm:text-3xl font-bold"
                          style={{ color: accent }}
                        >
                          {val}
                        </p>
                      </div>
                      <div
                        className="p-3 rounded-xl"
                        style={{ background: `${accent}22` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: accent }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Charts Row */}
            <div className="space-y-2">
              <h3
                className="text-sm font-semibold px-1"
                style={{ color: "var(--text-1)" }}
              >
                Visual Analytics
              </h3>
              <p className="text-xs px-1" style={{ color: "var(--text-3)" }}>
                Graphical representation of department research output
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <Card
                style={{
                  border: "1px solid var(--border-subtle)",
                  background: "var(--surface-1)",
                }}
              >
                <CardHeader>
                  <CardTitle
                    className="text-base sm:text-lg"
                    style={{ color: "var(--text-1)" }}
                  >
                    Research Output by Category
                  </CardTitle>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-3)" }}
                  >
                    Distribution of publications, patents, and projects
                  </p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={deptStats?.categoryChartData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(deptStats?.categoryChartData || []).map(
                          (_: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card
                style={{
                  border: "1px solid var(--border-subtle)",
                  background: "var(--surface-1)",
                }}
              >
                <CardHeader>
                  <CardTitle
                    className="text-base sm:text-lg"
                    style={{ color: "var(--text-1)" }}
                  >
                    Publication Trends Over Time
                  </CardTitle>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-3)" }}
                  >
                    Year-wise research output growth analysis
                  </p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={deptStats?.yearData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab - Advanced Department Analytics with Filters */}
          <TabsContent value="analytics" className="space-y-4 mt-4">
            <Card
              style={{
                border: "1px solid var(--border-subtle)",
                background: "var(--surface-1)",
              }}
            >
              <CardHeader>
                <CardTitle
                  className="text-lg flex items-center gap-2"
                  style={{ color: "var(--text-1)" }}
                >
                  <BarChart3
                    className="h-5 w-5"
                    style={{ color: "var(--brand-primary)" }}
                  />
                  Department Analytics Dashboard
                </CardTitle>
                <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                  Comprehensive department-wide analytics with year-wise trends, faculty-wise breakdown,
                  and data export capabilities. Filter by year range (2020-2026) and research categories.
                </p>
              </CardHeader>
              <CardContent>
                <DepartmentAnalyticsComponent department={profile?.department || ""} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Department Tab - Detailed Department Stats */}
          <TabsContent value="department" className="space-y-4 mt-4">
            {/* Section Label */}
            <div className="space-y-1">
              <h3
                className="text-sm font-semibold px-1"
                style={{ color: "var(--text-1)" }}
              >
                Department Faculty Rankings
              </h3>
              <p className="text-xs px-1" style={{ color: "var(--text-3)" }}>
                Ranked by total publications and research output
              </p>
            </div>

            {/* Top Performers */}
            <Card
              style={{
                border: "1px solid var(--border-subtle)",
                background: "var(--surface-1)",
              }}
            >
              <CardHeader>
                <CardTitle
                  className="text-lg sm:text-xl flex items-center gap-2"
                  style={{ color: "var(--text-1)" }}
                >
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Top Performers - {profile?.department} Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deptStats?.facultyList
                    .slice(0, 5)
                    .map((faculty: any, index: number) => (
                      <motion.div
                        key={faculty.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border-subtle)",
                        }}
                        className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm"
                            style={{ background: "var(--brand-primary)" }}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p
                              className="font-semibold text-sm sm:text-base"
                              style={{ color: "var(--text-1)" }}
                            >
                              {faculty.name}
                            </p>
                            <p
                              className="text-xs sm:text-sm"
                              style={{ color: "var(--text-3)" }}
                            >
                              {faculty.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-right">
                          <div>
                            <p
                              className="text-lg sm:text-xl font-bold"
                              style={{ color: "var(--brand-purple)" }}
                            >
                              {faculty.publications}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-3)" }}
                            >
                              Pubs
                            </p>
                          </div>
                          <div>
                            <p
                              className="text-lg sm:text-xl font-bold"
                              style={{ color: "var(--brand-accent)" }}
                            >
                              {faculty.patents}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-3)" }}
                            >
                              Patents
                            </p>
                          </div>
                          <div>
                            <p
                              className="text-lg sm:text-xl font-bold"
                              style={{ color: "#f59e0b" }}
                            >
                              {faculty.projects}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-3)" }}
                            >
                              Projects
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* All Faculty List */}
            <Card
              style={{
                border: "1px solid var(--border-subtle)",
                background: "var(--surface-1)",
              }}
            >
              <CardHeader>
                <CardTitle
                  className="text-lg sm:text-xl"
                  style={{ color: "var(--text-1)" }}
                >
                  All Department Faculty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deptStats?.facultyList.map((faculty: any, index: number) => (
                    <motion.div
                      key={faculty.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: "var(--text-1)" }}
                        >
                          {faculty.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-3)" }}
                        >
                          {faculty.email}
                        </p>
                      </div>
                      <div className="flex gap-3 text-right text-xs sm:text-sm">
                        <div>
                          <p
                            className="font-bold"
                            style={{ color: "var(--brand-purple)" }}
                          >
                            {faculty.publications}
                          </p>
                          <p style={{ color: "var(--text-3)" }}>Pubs</p>
                        </div>
                        <div>
                          <p
                            className="font-bold"
                            style={{ color: "var(--brand-accent)" }}
                          >
                            {faculty.patents}
                          </p>
                          <p style={{ color: "var(--text-3)" }}>Patents</p>
                        </div>
                        <div>
                          <p className="font-bold" style={{ color: "#f59e0b" }}>
                            {faculty.guidance}
                          </p>
                          <p style={{ color: "var(--text-3)" }}>Students</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My PBAS Data Tab */}
          <TabsContent value="mydata" className="space-y-4 mt-4">
            {/* Personal Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  label: "Papers",
                  val: personalMetrics?.totalResearchPapers || 0,
                  icon: BookOpen,
                  accent: "var(--brand-primary)",
                },
                {
                  label: "Publications",
                  val: personalMetrics?.totalPublications || 0,
                  icon: FileText,
                  accent: "var(--brand-purple)",
                },
                {
                  label: "Patents",
                  val: personalMetrics?.totalPatents || 0,
                  icon: Award,
                  accent: "var(--brand-accent)",
                },
                {
                  label: "Projects",
                  val: personalMetrics?.totalProjects || 0,
                  icon: Briefcase,
                  accent: "#f59e0b",
                },
              ].map(({ label, val, icon: Icon, accent }) => (
                <div
                  key={label}
                  className="rounded-2xl p-4"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-xs mb-1"
                        style={{ color: "var(--text-3)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: accent }}
                      >
                        {val}
                      </p>
                    </div>
                    <Icon
                      className="h-8 w-8 opacity-20"
                      style={{ color: accent }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* PBAS Form Sections */}
            <Card
              style={{
                border: "1px solid var(--border-subtle)",
                background: "var(--surface-1)",
              }}
            >
              <CardHeader>
                <CardTitle
                  className="text-lg sm:text-xl"
                  style={{ color: "var(--text-1)" }}
                >
                  PBAS Data Entry
                </CardTitle>
                <p className="text-sm" style={{ color: "var(--text-3)" }}>
                  Click on any section to add or update your PBAS information
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pbasFormSections.map((section, index) => (
                    <Link key={index} href={section.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              background: "var(--brand-primary-subtle)",
                            }}
                          >
                            <section.icon
                              className="h-5 w-5"
                              style={{ color: "var(--brand-primary)" }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3
                              className="font-semibold text-sm"
                              style={{ color: "var(--text-1)" }}
                            >
                              {section.title}
                            </h3>
                            <p
                              className="text-xs mt-1"
                              style={{ color: "var(--text-3)" }}
                            >
                              {section.subtitle}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate PBAS Button */}
            <Card
              style={{
                border: "1px solid var(--border-subtle)",
                background: "var(--brand-primary-subtle)",
              }}
            >
              <CardContent className="p-6 text-center">
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--text-1)" }}
                >
                  Generate Your PBAS Document
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-2)" }}>
                  Download a complete PBAS form with all your data
                </p>
                <GeneratePBASButton userId={auth.currentUser?.uid ?? ""} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
