"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db as firestore } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/ui/admin-layout";
import {
  Users,
  TrendingUp,
  Award,
  BookOpen,
  FileText,
  Lightbulb,
  ArrowLeft,
  BarChart3,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface FacultyStats {
  totalFaculty: number;
  totalPublications: number;
  totalPatents: number;
  totalProjects: number;
  totalGrants: number;
  departmentStats: { department: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
  topPerformers: {
    name: string;
    department: string;
    publications: number;
  }[];
  insights: string[];
}

export default function FacultyStatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FacultyStats | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
        
        // Only admins and HODs can view stats
        if (userData.role !== "misAdmin" && userData.role !== "admin" && userData.role !== "hod") {
          router.replace("/dashboard");
          return;
        }

        setCurrentUser(userData);
        await fetchStats();
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchStats = async () => {
    try {
      const usersRef = collection(firestore, "users");
      const querySnapshot = await getDocs(usersRef);
      
      let totalFaculty = 0;
      let totalPublications = 0;
      let totalPatents = 0;
      let totalProjects = 0;
      let totalGrants = 0;
      const departmentMap = new Map<string, number>();
      const roleMap = new Map<string, number>();
      const facultyPerformance: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.role === "faculty" || data.role === "hod") {
          totalFaculty++;
          
          // Count by department
          const dept = data.department || "Unknown";
          departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
          
          // Count by role
          const role = data.role || "faculty";
          roleMap.set(role, (roleMap.get(role) || 0) + 1);
          
          // Mock statistics (in real app, this would come from PBAS data)
          const mockPubs = Math.floor(Math.random() * 15) + 1;
          totalPublications += mockPubs;
          totalPatents += Math.floor(Math.random() * 3);
          totalProjects += Math.floor(Math.random() * 5);
          totalGrants += Math.floor(Math.random() * 500000);
          
          facultyPerformance.push({
            name: data.name || data.email,
            department: dept,
            publications: mockPubs,
          });
        }
      });

      // Sort faculty by publications
      facultyPerformance.sort((a, b) => b.publications - a.publications);
      const topPerformers = facultyPerformance.slice(0, 5);

      const departmentStats = Array.from(departmentMap.entries())
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count);

      const roleDistribution = Array.from(roleMap.entries())
        .map(([role, count]) => ({ 
          role: role === "hod" ? "HOD" : "Faculty", 
          count 
        }));

      // Generate insights
      const insights = [
        `Total of ${totalFaculty} active faculty members across all departments`,
        `${totalPublications} research publications recorded this year`,
        `${departmentStats[0]?.department || "N/A"} department has the highest faculty count (${departmentStats[0]?.count || 0})`,
        `Average of ${(totalPublications / totalFaculty).toFixed(1)} publications per faculty`,
        `₹${(totalGrants / 100000).toFixed(2)} lakhs total research grants secured`,
      ];

      setStats({
        totalFaculty,
        totalPublications,
        totalPatents,
        totalProjects,
        totalGrants,
        departmentStats,
        roleDistribution,
        topPerformers,
        insights,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 border-4 border-t-transparent border-blue-500 rounded-full"
        />
      </div>
    );
  }

  const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              <Link href="/dashboard">
                <Button variant="ghost" className="mb-2 -ml-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                Faculty Statistics
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">Overall performance analytics and trends</p>
            </div>
          </div>
        </header>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Faculty</p>
                    <p className="text-3xl font-bold text-blue-600">{stats?.totalFaculty || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Publications</p>
                    <p className="text-3xl font-bold text-purple-600">{stats?.totalPublications || 0}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Patents</p>
                    <p className="text-3xl font-bold text-cyan-600">{stats?.totalPatents || 0}</p>
                  </div>
                  <div className="p-3 bg-cyan-100 rounded-xl">
                    <Award className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Projects</p>
                    <p className="text-3xl font-bold text-orange-600">{stats?.totalProjects || 0}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Grants (₹)</p>
                    <p className="text-2xl font-bold text-green-600">
                      {((stats?.totalGrants || 0) / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Department Distribution */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Faculty by Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.departmentStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Role Distribution */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={stats?.roleDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ role, count }) => `${role}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(stats?.roleDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Top Performers (By Publications)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topPerformers.map((performer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? "bg-yellow-100 text-yellow-600" :
                      index === 1 ? "bg-gray-100 text-gray-600" :
                      index === 2 ? "bg-orange-100 text-orange-600" :
                      "bg-blue-100 text-blue-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{performer.name}</p>
                      <p className="text-sm text-slate-600">{performer.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{performer.publications}</p>
                    <p className="text-xs text-slate-600">Publications</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-amber-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.insights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-amber-500 mt-1">•</span>
                  <p className="text-slate-700">{insight}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // If admin, wrap in AdminLayout
  if (currentUser?.role === "misAdmin" || currentUser?.role === "admin") {
    return <AdminLayout user={currentUser}>{content}</AdminLayout>;
  }

  // Otherwise return content directly
  return content;
}
