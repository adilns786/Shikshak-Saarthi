import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { StatsCard } from "@/components/ui/stats-card"
// import { RecentActivity } from "@/components/ui/recent-activity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { FileText, BookOpen, Calendar, TrendingUp, PlusCircle, Clock } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.log("No user found, redirecting to login")
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
  console.log("User:", user)
  console.log("User Profile:", profile)
  if (!profile) {
    console.log("No profile found, redirecting to login")
    redirect("/auth/login")
  }

  // Get dashboard stats
  const [appraisalsResult, publicationsResult, eventsResult] = await Promise.all([
    supabase
      .from("appraisals")
      .select("id, status, created_at, title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("publications")
      .select("id, title, publication_year, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select("id, title, start_date, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  const appraisals = appraisalsResult.data || []
  const publications = publicationsResult.data || []
  const events = eventsResult.data || []

  // Calculate stats
  const totalAppraisals = appraisals.length
  const draftAppraisals = appraisals.filter((a) => a.status === "draft").length
  const submittedAppraisals = appraisals.filter((a) => a.status === "submitted").length
  const approvedAppraisals = appraisals.filter((a) => a.status === "approved").length
  const currentYearPublications = publications.filter((p) => p.publication_year === new Date().getFullYear()).length

  // Recent activity
  const recentActivity = [
    ...appraisals.slice(0, 3).map((a) => ({
      id: a.id,
      type: "appraisal" as const,
      title: a.title,
      status: a.status,
      date: a.created_at,
      href: `/appraisal/${a.id}`,
    })),
    ...publications.slice(0, 2).map((p) => ({
      id: p.id,
      type: "publication" as const,
      title: p.title,
      date: p.created_at,
      href: `/publications/${p.id}`,
    })),
    ...events.slice(0, 2).map((e) => ({
      id: e.id,
      type: "event" as const,
      title: e.title,
      date: e.created_at,
      href: `/events/${e.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">
              Welcome back, {profile.full_name?.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">Here's an overview of your academic activities and progress.</p>
          </div>
          <Button asChild>
            <Link href="/appraisal/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Appraisal
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Appraisals"
            value={totalAppraisals}
            description="All time appraisals"
            iconName="FileText"
            delay={0}
          />
          <StatsCard
            title="Publications"
            value={publications.length}
            description={`${currentYearPublications} this year`}
            iconName="BookOpen"
            delay={0.1}
          />
          <StatsCard
            title="Events Attended"
            value={events.length}
            description="Conferences & workshops"
            iconName="Calendar"
            delay={0.2}
          />
          <StatsCard
            title="Approval Rate"
            value={totalAppraisals > 0 ? `${Math.round((approvedAppraisals / totalAppraisals) * 100)}%` : "0%"}
            description="Appraisal success rate"
            iconName="TrendingUp"
            delay={0.3}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Appraisal Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Appraisal Overview
                <Button variant="outline" size="sm" asChild>
                  <Link href="/appraisal">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {totalAppraisals === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No appraisals yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your first appraisal to track your academic progress.
                  </p>
                  <Button asChild>
                    <Link href="/appraisal/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create First Appraisal
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{draftAppraisals}</div>
                      <div className="text-sm text-muted-foreground">Draft</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{submittedAppraisals}</div>
                      <div className="text-sm text-muted-foreground">Under Review</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{approvedAppraisals}</div>
                      <div className="text-sm text-muted-foreground">Approved</div>
                    </div>
                  </div>

                  {totalAppraisals > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion Progress</span>
                        <span>{Math.round((approvedAppraisals / totalAppraisals) * 100)}%</span>
                      </div>
                      <Progress value={(approvedAppraisals / totalAppraisals) * 100} />
                    </div>
                  )}
                </>
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
                <Link href="/appraisal/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Appraisal
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/publications">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Publications
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/profile">
                  <Clock className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {/* <RecentActivity activities={recentActivity} /> */}
      </div>
    </DashboardLayout>
  )
}