"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportExportButton } from "@/components/ui/pdf-export-button"
import { TrendingUp, Users, FileText, Award } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface ReportStats {
  totalAppraisals: number
  submittedAppraisals: number
  approvedAppraisals: number
  pendingAppraisals: number
  averageScore: number
  totalFaculty: number
  departmentStats: Array<{
    department: string
    count: number
    averageScore: number
  }>
  yearlyTrends: Array<{
    year: string
    count: number
    averageScore: number
  }>
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState("2023-24")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchReportData()
  }, [selectedYear, selectedDepartment])

  const fetchReportData = async () => {
    try {
      setLoading(true)

      // Check if user is admin
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (profile?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to view reports.",
          variant: "destructive",
        })
        return
      }

      // Fetch appraisals data
      let appraisalsQuery = supabase.from("appraisals").select(`
          *,
          profiles!appraisals_faculty_id_fkey (
            full_name,
            department,
            designation
          )
        `)

      if (selectedYear !== "all") {
        appraisalsQuery = appraisalsQuery.eq("academic_year", selectedYear)
      }

      const { data: appraisals, error: appraisalsError } = await appraisalsQuery

      if (appraisalsError) throw appraisalsError

      // Fetch faculty count
      let facultyQuery = supabase.from("profiles").select("*", { count: "exact" }).eq("role", "faculty")

      if (selectedDepartment !== "all") {
        facultyQuery = facultyQuery.eq("department", selectedDepartment)
      }

      const { count: facultyCount, error: facultyError } = await facultyQuery

      if (facultyError) throw facultyError

      // Process statistics
      const totalAppraisals = appraisals?.length || 0
      const submittedAppraisals = appraisals?.filter((a) => a.status === "submitted").length || 0
      const approvedAppraisals = appraisals?.filter((a) => a.status === "approved").length || 0
      const pendingAppraisals = appraisals?.filter((a) => a.status === "draft").length || 0

      // Calculate average score from LLM analysis
      const scoresWithAnalysis = appraisals?.filter((a) => a.llm_analysis?.overall_score) || []
      const averageScore =
        scoresWithAnalysis.length > 0
          ? scoresWithAnalysis.reduce((sum, a) => sum + a.llm_analysis.overall_score, 0) / scoresWithAnalysis.length
          : 0

      // Department statistics
      const departmentMap = new Map()
      appraisals?.forEach((appraisal) => {
        const dept = appraisal.profiles?.department || "Unknown"
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, { count: 0, totalScore: 0, scoreCount: 0 })
        }
        const deptData = departmentMap.get(dept)
        deptData.count++
        if (appraisal.llm_analysis?.overall_score) {
          deptData.totalScore += appraisal.llm_analysis.overall_score
          deptData.scoreCount++
        }
      })

      const departmentStats = Array.from(departmentMap.entries()).map(([department, data]) => ({
        department,
        count: data.count,
        averageScore: data.scoreCount > 0 ? data.totalScore / data.scoreCount : 0,
      }))

      // Yearly trends (mock data for demo)
      const yearlyTrends = [
        { year: "2021-22", count: 45, averageScore: 82 },
        { year: "2022-23", count: 52, averageScore: 85 },
        { year: "2023-24", count: totalAppraisals, averageScore: Math.round(averageScore) },
      ]

      setStats({
        totalAppraisals,
        submittedAppraisals,
        approvedAppraisals,
        pendingAppraisals,
        averageScore: Math.round(averageScore),
        totalFaculty: facultyCount || 0,
        departmentStats,
        yearlyTrends,
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch report data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports & Analytics</h1>
          <p className="text-gray-600">No data available for the selected filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into faculty appraisal data</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2023-24">2023-24</SelectItem>
              <SelectItem value="2022-23">2022-23</SelectItem>
              <SelectItem value="2021-22">2021-22</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Electronics Engineering">Electronics Engineering</SelectItem>
              <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
            </SelectContent>
          </Select>

          <ReportExportButton
            reportData={stats}
            title="Faculty Appraisal Analytics Report"
            className="bg-primary hover:bg-primary/90"
          />
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appraisals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppraisals}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submittedAppraisals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAppraisals > 0
                ? `${Math.round((stats.submittedAppraisals / stats.totalAppraisals) * 100)}% completion rate`
                : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}/100</div>
            <p className="text-xs text-muted-foreground">Based on AI analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFaculty}</div>
            <p className="text-xs text-muted-foreground">Active faculty members</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Analytics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Tabs defaultValue="departments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="departments">Department Analysis</TabsTrigger>
            <TabsTrigger value="trends">Yearly Trends</TabsTrigger>
            <TabsTrigger value="status">Status Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Performance</CardTitle>
                <CardDescription>Appraisal statistics by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.departmentStats.map((dept, index) => (
                    <motion.div
                      key={dept.department}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{dept.department}</h4>
                        <p className="text-sm text-muted-foreground">{dept.count} appraisals</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={dept.averageScore >= 85 ? "default" : "secondary"}>
                          {dept.averageScore > 0 ? `${Math.round(dept.averageScore)}/100` : "No scores"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Yearly Trends</CardTitle>
                <CardDescription>Appraisal trends over academic years</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.yearlyTrends.map((trend, index) => (
                    <motion.div
                      key={trend.year}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{trend.year}</h4>
                        <p className="text-sm text-muted-foreground">{trend.count} appraisals</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{trend.averageScore}/100</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Current status of all appraisals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.approvedAppraisals}</div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.submittedAppraisals}</div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.pendingAppraisals}</div>
                    <p className="text-sm text-muted-foreground">Draft</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
