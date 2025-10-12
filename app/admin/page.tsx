import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/ui/admin-layout"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Users, FileText, Clock, TrendingUp, Eye } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile and check admin role
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get admin dashboard stats
  const [usersResult, appraisalsResult, recentAppraisalsResult] = await Promise.all([
    supabase.from("users").select("id, role, created_at").order("created_at", { ascending: false }),
    supabase
      .from("appraisals")
      .select("id, status, created_at, submitted_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("appraisals")
      .select(`
        id, 
        title, 
        status, 
        created_at, 
        submitted_at,
        user:users(full_name, email, department)
      `)
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const users = usersResult.data || []
  const appraisals = appraisalsResult.data || []
  const recentAppraisals = recentAppraisalsResult.data || []

  // Calculate stats
  const totalUsers = users.length
  const facultyCount = users.filter((u) => u.role === "faculty").length
  const adminCount = users.filter((u) => u.role === "admin").length
  const totalAppraisals = appraisals.length
  const pendingAppraisals = appraisals.filter((a) => a.status === "submitted").length
  const approvedAppraisals = appraisals.filter((a) => a.status === "approved").length
  const draftAppraisals = appraisals.filter((a) => a.status === "draft").length

  const statusColors = {
    draft: "secondary",
    submitted: "default",
    under_review: "default",
    approved: "default",
    rejected: "destructive",
  } as const

  const statusLabels = {
    draft: "Draft",
    submitted: "Pending Review",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
  }

  return (
    <AdminLayout user={profile}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage faculty appraisals, users, and system configuration.</p>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href="/admin/reports">View Reports</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/appraisals">Review Appraisals</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={totalUsers}
            description={`${facultyCount} faculty, ${adminCount} admin`}
            iconName="Users"
            delay={0}
          />
          <StatsCard
            title="Total Appraisals"
            value={totalAppraisals}
            description="All time submissions"
            iconName="FileText"
            delay={0.1}
          />
          <StatsCard
            title="Pending Reviews"
            value={pendingAppraisals}
            description="Awaiting admin action"
            iconName="Clock"
            delay={0.2}
          />
          <StatsCard
            title="Approval Rate"
            value={totalAppraisals > 0 ? `${Math.round((approvedAppraisals / totalAppraisals) * 100)}%` : "0%"}
            description="Overall success rate"
            iconName="TrendingUp"
            delay={0.3}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Appraisal Status Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Appraisal Status Overview
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/appraisals">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalAppraisals === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No appraisals yet</h3>
                  <p className="text-muted-foreground">Faculty members haven't submitted any appraisals yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{draftAppraisals}</div>
                      <div className="text-sm text-muted-foreground">Draft</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{pendingAppraisals}</div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{approvedAppraisals}</div>
                      <div className="text-sm text-muted-foreground">Approved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {appraisals.filter((a) => a.status === "rejected").length}
                      </div>
                      <div className="text-sm text-muted-foreground">Rejected</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/admin/appraisals?status=submitted">
                  <Clock className="mr-2 h-4 w-4" />
                  Review Pending ({pendingAppraisals})
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/admin/reports">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Reports
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appraisals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Appraisals
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/appraisals">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAppraisals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent appraisals</p>
            ) : (
              <div className="space-y-4">
                {recentAppraisals.map((appraisal) => (
                  <div
                    key={appraisal.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium text-foreground">{appraisal.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-muted-foreground">by {appraisal.user?.full_name}</span>
                            {appraisal.user?.department && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{appraisal.user.department}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={statusColors[appraisal.status as keyof typeof statusColors]}>
                              {statusLabels[appraisal.status as keyof typeof statusLabels]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {appraisal.submitted_at
                                ? `Submitted ${formatDistanceToNow(new Date(appraisal.submitted_at), { addSuffix: true })}`
                                : `Created ${formatDistanceToNow(new Date(appraisal.created_at), { addSuffix: true })}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/appraisals/${appraisal.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}