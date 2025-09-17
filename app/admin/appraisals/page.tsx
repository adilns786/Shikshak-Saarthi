import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/ui/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Eye, MessageSquare, Download, Search, Filter } from "lucide-react"

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

export default async function AdminAppraisalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

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

  // Build query
  let query = supabase
    .from("appraisals")
    .select(`
      id,
      title,
      academic_year,
      status,
      created_at,
      submitted_at,
      user:users(id, full_name, email, department)
    `)
    .order("created_at", { ascending: false })

  // Apply filters
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status)
  }

  const { data: appraisals } = await query

  // Filter by search term (client-side for simplicity)
  const filteredAppraisals = appraisals?.filter((appraisal) => {
    if (!params.search) return true
    const searchTerm = params.search.toLowerCase()
    return (
      appraisal.title.toLowerCase().includes(searchTerm) ||
      appraisal.user?.full_name.toLowerCase().includes(searchTerm) ||
      appraisal.user?.department?.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <AdminLayout user={profile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">Appraisal Management</h1>
            <p className="text-muted-foreground mt-1">Review and manage faculty appraisals.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appraisals, faculty names, or departments..."
                    className="pl-10"
                    defaultValue={params.search}
                  />
                </div>
              </div>
              <Select defaultValue={params.status || "all"}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Pending Review</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appraisals List */}
        <Card>
          <CardHeader>
            <CardTitle>Appraisals ({filteredAppraisals?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!filteredAppraisals || filteredAppraisals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No appraisals found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppraisals.map((appraisal) => (
                  <div
                    key={appraisal.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground mb-1">{appraisal.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                            <span>by {appraisal.user?.full_name}</span>
                            {appraisal.user?.department && (
                              <>
                                <span>•</span>
                                <span>{appraisal.user.department}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>AY {appraisal.academic_year}</span>
                          </div>
                          <div className="flex items-center space-x-3">
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
                      <Button variant="outline" size="sm">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Comment
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
