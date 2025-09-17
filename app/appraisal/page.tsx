import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { FileText, PlusCircle, Edit, Eye, Calendar, Clock } from "lucide-react"

const statusColors = {
  draft: "secondary",
  submitted: "default",
  under_review: "default",
  approved: "default",
  rejected: "destructive",
} as const

const statusLabels = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
}

export default async function AppraisalsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get user's appraisals
  const { data: appraisals } = await supabase
    .from("appraisals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">My Appraisals</h1>
            <p className="text-muted-foreground mt-1">Manage your performance appraisals and track their progress.</p>
          </div>
          <Button asChild>
            <Link href="/appraisal/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Appraisal
            </Link>
          </Button>
        </div>

        {/* Appraisals List */}
        {!appraisals || appraisals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No appraisals yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your first appraisal to track your academic progress and achievements.
              </p>
              <Button asChild>
                <Link href="/appraisal/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create First Appraisal
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appraisals.map((appraisal) => (
              <Card key={appraisal.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{appraisal.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {appraisal.academic_year}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {formatDistanceToNow(new Date(appraisal.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <Badge variant={statusColors[appraisal.status as keyof typeof statusColors]}>
                      {statusLabels[appraisal.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {appraisal.submitted_at && (
                        <span>
                          Submitted {formatDistanceToNow(new Date(appraisal.submitted_at), { addSuffix: true })}
                        </span>
                      )}
                      {appraisal.status === "draft" && (
                        <span>
                          Last updated {formatDistanceToNow(new Date(appraisal.updated_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/appraisal/${appraisal.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      {appraisal.status === "draft" && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/appraisal/${appraisal.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
