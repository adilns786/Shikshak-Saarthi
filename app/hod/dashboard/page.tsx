"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db as firestore } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { motion } from "framer-motion";
import GeneratePBASButton from "@/components/generatePbas";
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
        "Publications": 0,
        "Patents": 0,
        "Projects": 0,
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
          [...researchPapers, ...publications, ...patents].forEach((item: any) => {
            const year = item.year || new Date().getFullYear();
            yearlyData[year] = (yearlyData[year] || 0) + 1;
          });
          
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

      const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value,
      }));

      setDeptStats({
        totalFaculty,
        totalPublications,
        totalPatents,
        totalProjects,
        totalGuidance,
        facultyList: facultyList.sort((a, b) => b.publications - a.publications),
        yearData,
        categoryChartData,
        avgPublicationsPerFaculty: totalFaculty > 0 ? (totalPublications / totalFaculty).toFixed(1) : 0,
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
        <p className="mt-4 text-slate-600 font-medium">Loading HOD Dashboard...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200">
          <div className="flex flex-col space-y-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    HOD Dashboard
                  </h1>
                  <p className="text-sm text-slate-600">{profile?.name}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div className="px-3 py-1 bg-blue-100 rounded-full">
                  <p className="text-sm font-medium text-blue-700">
                    {profile?.department} Department
                  </p>
                </div>
                <div className="px-3 py-1 bg-purple-100 rounded-full">
                  <p className="text-sm font-medium text-purple-700">
                    {profile?.designation || "Head of Department"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link href="/admin/users" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" /> Manage Faculty
                </Button>
              </Link>
              <Link href="/dashboard/stats" className="w-full sm:w-auto">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <BarChart3 className="mr-2 h-4 w-4" /> All Faculty Stats
                </Button>
              </Link>
              <Link href="/chatbot" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  <Bot className="mr-2 h-4 w-4" /> AI Assistant
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Tabs for Different Views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="department">Department</TabsTrigger>
            <TabsTrigger value="mydata">My PBAS</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Combined Quick Stats */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Personal Quick Stats */}
            <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  My Performance Metrics
                </CardTitle>
                <p className="text-xs text-slate-600 mt-1">Your individual research and academic contributions</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{personalMetrics?.totalResearchPapers || 0}</p>
                    <p className="text-xs text-slate-600">Papers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{personalMetrics?.totalPublications || 0}</p>
                    <p className="text-xs text-slate-600">Books</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyan-600">{personalMetrics?.totalPatents || 0}</p>
                    <p className="text-xs text-slate-600">Patents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{personalMetrics?.totalProjects || 0}</p>
                    <p className="text-xs text-slate-600">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-600">{personalMetrics?.totalGuidance || 0}</p>
                    <p className="text-xs text-slate-600">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{personalMetrics?.totalOutputs || 0}</p>
                    <p className="text-xs text-slate-600">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Quick Stats */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 px-1">Department Performance Overview</h3>
              <p className="text-xs text-slate-600 px-1">Real-time statistics for {profile?.department} Department faculty</p>
            </div>
            {loadingStats ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-600">Loading department statistics...</span>
              </div>
            ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 mb-1">Faculty</p>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                        {deptStats?.totalFaculty || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 mb-1">Publications</p>
                      <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                        {deptStats?.totalPublications || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-cyan-50 to-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 mb-1">Patents</p>
                      <p className="text-2xl sm:text-3xl font-bold text-cyan-600">
                        {deptStats?.totalPatents || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-cyan-100 rounded-xl">
                      <Award className="h-6 w-6 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-orange-50 to-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 mb-1">Avg/Faculty</p>
                      <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                        {deptStats?.avgPublicationsPerFaculty || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {/* Charts Row */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 px-1">Visual Analytics</h3>
              <p className="text-xs text-slate-600 px-1">Graphical representation of department research output</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Research Output by Category</CardTitle>
                  <p className="text-xs text-slate-600 mt-1">Distribution of publications, patents, and projects</p>
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
                        {(deptStats?.categoryChartData || []).map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Publication Trends Over Time</CardTitle>
                  <p className="text-xs text-slate-600 mt-1">Year-wise research output growth analysis</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={deptStats?.yearData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Department Tab - Detailed Department Stats */}
          <TabsContent value="department" className="space-y-4 mt-4">
            {/* Section Label */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-700 px-1">Department Faculty Rankings</h3>
              <p className="text-xs text-slate-600 px-1">Ranked by total publications and research output</p>
            </div>

            {/* Top Performers */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Top Performers - {profile?.department} Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deptStats?.facultyList.slice(0, 5).map((faculty: any, index: number) => (
                    <motion.div
                      key={faculty.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm sm:text-base text-slate-900">{faculty.name}</p>
                          <p className="text-xs sm:text-sm text-slate-600">{faculty.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <p className="text-lg sm:text-xl font-bold text-purple-600">{faculty.publications}</p>
                          <p className="text-xs text-slate-600">Pubs</p>
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl font-bold text-cyan-600">{faculty.patents}</p>
                          <p className="text-xs text-slate-600">Patents</p>
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl font-bold text-orange-600">{faculty.projects}</p>
                          <p className="text-xs text-slate-600">Projects</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* All Faculty List */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">All Department Faculty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deptStats?.facultyList.map((faculty: any, index: number) => (
                    <motion.div
                      key={faculty.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200"
                    >
                      <div>
                        <p className="font-medium text-sm text-slate-900">{faculty.name}</p>
                        <p className="text-xs text-slate-500">{faculty.email}</p>
                      </div>
                      <div className="flex gap-3 text-right text-xs sm:text-sm">
                        <div>
                          <p className="font-bold text-purple-600">{faculty.publications}</p>
                          <p className="text-slate-600">Pubs</p>
                        </div>
                        <div>
                          <p className="font-bold text-cyan-600">{faculty.patents}</p>
                          <p className="text-slate-600">Patents</p>
                        </div>
                        <div>
                          <p className="font-bold text-orange-600">{faculty.guidance}</p>
                          <p className="text-slate-600">Students</p>
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
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Papers</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {personalMetrics?.totalResearchPapers || 0}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Publications</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {personalMetrics?.totalPublications || 0}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Patents</p>
                      <p className="text-2xl font-bold text-cyan-600">
                        {personalMetrics?.totalPatents || 0}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-cyan-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Projects</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {personalMetrics?.totalProjects || 0}
                      </p>
                    </div>
                    <Briefcase className="h-8 w-8 text-orange-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* PBAS Form Sections */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">PBAS Data Entry</CardTitle>
                <p className="text-sm text-slate-600">
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
                        className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <section.icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-slate-900">
                              {section.title}
                            </h3>
                            <p className="text-xs text-slate-600 mt-1">
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
            <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Generate Your PBAS Document
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Download a complete PBAS form with all your data
                </p>
                <GeneratePBASButton userId={auth.currentUser?.uid ?? ""} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
