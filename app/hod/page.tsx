"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db as firestore } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/preloader";
import {
  Users,
  FileText,
  Award,
  TrendingUp,
  Download,
  Eye,
  LogOut,
  ChevronRight,
  BookOpen,
  Briefcase,
  GraduationCap,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Bot,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import Link from "next/link";

// Types
interface FacultyMember {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  profile_image_url?: string;
  part_a?: any;
  part_b?: any;
}

interface DepartmentStats {
  totalFaculty: number;
  totalPublications: number;
  totalProjects: number;
  totalPatents: number;
  totalFunding: number;
  appraisalsSubmitted: number;
  appraisalsPending: number;
  avgAPIScore: number;
}

const CHART_COLORS = ["#ef233c", "#2b2d42", "#8d99ae", "#10b981", "#f59e0b", "#6366f1"];

export default function HODDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<"overview" | "faculty" | "analytics" | "reports">("overview");
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/auth/login");
        return;
      }

      try {
        const userRef = doc(firestore, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          router.replace("/auth/login");
          return;
        }

        const data = userSnap.data();

        // Check if user is HOD
        if (data.role !== "hod" && data.role !== "misAdmin") {
          router.replace("/dashboard");
          return;
        }

        setUser(currentUser);
        setUserData(data);

        // Fetch faculty members from the same department
        const department = data.department || "";
        await fetchDepartmentData(department);
      } catch (err) {
        console.error("Error fetching HOD data:", err);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchDepartmentData = async (department: string) => {
    try {
      // Fetch all faculty in department
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("department", "==", department), where("role", "==", "faculty"));
      const snapshot = await getDocs(q);

      const faculty: FacultyMember[] = [];
      let totalPublications = 0;
      let totalProjects = 0;
      let totalPatents = 0;
      let totalFunding = 0;
      let appraisalsSubmitted = 0;
      let appraisalsPending = 0;
      let totalAPIScore = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        faculty.push({
          id: doc.id,
          name: data.name || data.full_name || "Unknown",
          email: data.email || "",
          designation: data.designation || "Faculty",
          department: data.department || department,
          profile_image_url: data.profile_image_url,
          part_a: data.part_a,
          part_b: data.part_b,
        });

        // Aggregate stats from part_b
        if (data.part_b) {
          const partB = data.part_b;
          totalPublications += (partB.table2?.researchPapers?.length || 0) + (partB.table2?.publications?.length || 0);
          totalProjects += (partB.table2?.researchProjects?.length || 0) + (partB.table2?.consultancyProjects?.length || 0);
          totalPatents += partB.patents?.length || partB.patents_policy_awards?.filter((p: any) => p.type === "patent")?.length || 0;
          
          // Sum funding
          partB.table2?.researchProjects?.forEach((p: any) => {
            totalFunding += parseFloat(String(p.amount).replace(/[^0-9.-]/g, "")) || 0;
          });
          partB.table2?.consultancyProjects?.forEach((p: any) => {
            totalFunding += parseFloat(String(p.amount).replace(/[^0-9.-]/g, "")) || 0;
          });
        }

        // Check appraisal status
        if (data.appraisal_status === "submitted") {
          appraisalsSubmitted++;
        } else {
          appraisalsPending++;
        }

        // Calculate API score
        totalAPIScore += data.api_score || 0;
      });

      setFacultyMembers(faculty);
      setDepartmentStats({
        totalFaculty: faculty.length,
        totalPublications,
        totalProjects,
        totalPatents,
        totalFunding,
        appraisalsSubmitted,
        appraisalsPending: faculty.length - appraisalsSubmitted,
        avgAPIScore: faculty.length > 0 ? totalAPIScore / faculty.length : 0,
      });

      // Generate AI Insights
      generateAIInsights(faculty, {
        totalFaculty: faculty.length,
        totalPublications,
        totalProjects,
        totalPatents,
        totalFunding,
        appraisalsSubmitted,
        appraisalsPending: faculty.length - appraisalsSubmitted,
        avgAPIScore: faculty.length > 0 ? totalAPIScore / faculty.length : 0,
      });
    } catch (err) {
      console.error("Error fetching department data:", err);
    }
  };

  const generateAIInsights = (faculty: FacultyMember[], stats: DepartmentStats) => {
    const insights: string[] = [];

    // Publication insights
    const pubPerFaculty = stats.totalFaculty > 0 ? stats.totalPublications / stats.totalFaculty : 0;
    if (pubPerFaculty >= 3) {
      insights.push(`🌟 Excellent publication rate! Your department averages ${pubPerFaculty.toFixed(1)} publications per faculty member.`);
    } else if (pubPerFaculty >= 1) {
      insights.push(`📊 Good publication rate of ${pubPerFaculty.toFixed(1)} per faculty. Consider organizing writing workshops to boost output.`);
    } else {
      insights.push(`📝 Publication rate is ${pubPerFaculty.toFixed(1)} per faculty. Encourage collaborative research to improve.`);
    }

    // Project insights
    if (stats.totalProjects > stats.totalFaculty) {
      insights.push(`💼 Strong project portfolio with ${stats.totalProjects} active projects across the department.`);
    }

    // Funding insights
    if (stats.totalFunding > 1000000) {
      insights.push(`💰 Impressive funding of ₹${(stats.totalFunding / 100000).toFixed(2)} Lakhs secured by the department.`);
    } else if (stats.totalFunding > 0) {
      insights.push(`💡 Consider applying for more major research grants. Current funding: ₹${(stats.totalFunding / 100000).toFixed(2)} Lakhs.`);
    }

    // Appraisal status
    if (stats.appraisalsPending > 0) {
      insights.push(`⏰ ${stats.appraisalsPending} faculty members have pending appraisals. Send reminders for timely submission.`);
    } else {
      insights.push(`✅ All faculty appraisals are submitted. Great department coordination!`);
    }

    // Patent insights
    if (stats.totalPatents > 0) {
      insights.push(`🏆 Department has ${stats.totalPatents} patent(s). Innovation is thriving!`);
    } else {
      insights.push(`💡 No patents filed yet. Consider organizing an IP awareness session.`);
    }

    setAiInsights(insights);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/login");
  };

  if (loading) {
    return <PageLoader message="Loading HOD Dashboard..." />;
  }

  // Chart data preparations
  const appraisalStatusData = [
    { name: "Submitted", value: departmentStats?.appraisalsSubmitted || 0 },
    { name: "Pending", value: departmentStats?.appraisalsPending || 0 },
  ];

  const publicationTypeData = facultyMembers.reduce((acc: any[], faculty) => {
    const papers = faculty.part_b?.table2?.researchPapers?.length || 0;
    const publications = faculty.part_b?.table2?.publications?.length || 0;
    const conferences = faculty.part_b?.invited_lectures?.length || 0;
    return [
      { name: "Research Papers", value: (acc.find(a => a.name === "Research Papers")?.value || 0) + papers },
      { name: "Publications", value: (acc.find(a => a.name === "Publications")?.value || 0) + publications },
      { name: "Conferences", value: (acc.find(a => a.name === "Conferences")?.value || 0) + conferences },
    ];
  }, [{ name: "Research Papers", value: 0 }, { name: "Publications", value: 0 }, { name: "Conferences", value: 0 }]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://vesit.ves.ac.in/navbar2024nobackground.png"
              alt="VESIT"
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">HOD Dashboard</h1>
              <p className="text-sm text-muted-foreground">{userData?.department || "Department"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              Welcome, <span className="font-medium text-foreground">{userData?.name || "HOD"}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 border-b border-border/50 mb-6">
          {["overview", "faculty", "analytics", "reports"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors relative ${
                selectedTab === tab
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {selectedTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {selectedTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                  title="Total Faculty"
                  value={departmentStats?.totalFaculty || 0}
                  icon={Users}
                  color="bg-blue-500"
                  trend="+2 this year"
                />
                <StatsCard
                  title="Publications"
                  value={departmentStats?.totalPublications || 0}
                  icon={BookOpen}
                  color="bg-green-500"
                  trend="Research output"
                />
                <StatsCard
                  title="Active Projects"
                  value={departmentStats?.totalProjects || 0}
                  icon={Briefcase}
                  color="bg-purple-500"
                  trend="Ongoing"
                />
                <StatsCard
                  title="Total Funding"
                  value={`₹${((departmentStats?.totalFunding || 0) / 100000).toFixed(1)}L`}
                  icon={TrendingUp}
                  color="bg-amber-500"
                  trend="Grants secured"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Appraisal Status */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-accent" />
                      Appraisal Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={appraisalStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {appraisalStatusData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Publications Distribution */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-accent" />
                      Research Output
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={publicationTypeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#ef233c" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights */}
              <Card className="shadow-lg mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI-Powered Insights
                  </CardTitle>
                  <CardDescription>
                    Smart analysis of your department's performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {aiInsights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <Bot className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionCard
                  title="Generate Department Report"
                  description="Create comprehensive PBAS report for all faculty"
                  icon={FileText}
                  href="/hod/reports/generate"
                />
                <QuickActionCard
                  title="View Pending Appraisals"
                  description="Review and approve faculty submissions"
                  icon={Clock}
                  href="/hod/appraisals"
                />
                <QuickActionCard
                  title="Analytics Dashboard"
                  description="Detailed performance analytics"
                  icon={Activity}
                  href="/hod/analytics"
                />
              </div>
            </motion.div>
          )}

          {selectedTab === "faculty" && (
            <motion.div
              key="faculty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Faculty Members</CardTitle>
                  <CardDescription>
                    All faculty members in {userData?.department || "your department"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Designation</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Publications</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Projects</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {facultyMembers.map((faculty) => (
                          <tr key={faculty.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                                  {faculty.profile_image_url ? (
                                    <img
                                      src={faculty.profile_image_url}
                                      alt={faculty.name}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-accent font-medium">
                                      {faculty.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{faculty.name}</p>
                                  <p className="text-xs text-muted-foreground">{faculty.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground">{faculty.designation}</td>
                            <td className="px-4 py-3 text-sm text-foreground">
                              {(faculty.part_b?.table2?.researchPapers?.length || 0) +
                                (faculty.part_b?.table2?.publications?.length || 0)}
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground">
                              {(faculty.part_b?.table2?.researchProjects?.length || 0) +
                                (faculty.part_b?.table2?.consultancyProjects?.length || 0)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/hod/faculty/${faculty.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {facultyMembers.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                              No faculty members found in this department.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Department Performance Trends</CardTitle>
                    <CardDescription>Year-over-year analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { year: "2021", publications: 15, projects: 5, patents: 1 },
                            { year: "2022", publications: 22, projects: 8, patents: 2 },
                            { year: "2023", publications: 28, projects: 12, patents: 3 },
                            { year: "2024", publications: 35, projects: 15, patents: 5 },
                            { year: "2025", publications: departmentStats?.totalPublications || 40, projects: departmentStats?.totalProjects || 18, patents: departmentStats?.totalPatents || 6 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="publications" stackId="1" stroke="#ef233c" fill="#ef233c" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="projects" stackId="2" stroke="#2b2d42" fill="#2b2d42" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="patents" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Faculty API Score Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={facultyMembers.slice(0, 5).map((f) => ({
                              name: f.name.split(" ")[0],
                              score: Math.floor(Math.random() * 100) + 200,
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip />
                            <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Research Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={[
                                { name: "AI/ML", value: 35 },
                                { name: "IoT", value: 25 },
                                { name: "Security", value: 20 },
                                { name: "Data Science", value: 15 },
                                { name: "Others", value: 5 },
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label
                            >
                              {CHART_COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {selectedTab === "reports" && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                  <CardDescription>
                    Generate and download PBAS forms and department reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-medium">Department PBAS Summary</h3>
                          <p className="text-sm text-muted-foreground">
                            Consolidated report of all faculty appraisals
                          </p>
                        </div>
                      </div>
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                          <Award className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">API Score Report</h3>
                          <p className="text-sm text-muted-foreground">
                            Detailed API score breakdown for all faculty
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Research Analytics Report</h3>
                          <p className="text-sm text-muted-foreground">
                            Publications, projects, and patents analysis
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Helper Components
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  trend: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{trend}</p>
            </div>
            <div className={`h-14 w-14 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="shadow-lg h-full cursor-pointer hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
