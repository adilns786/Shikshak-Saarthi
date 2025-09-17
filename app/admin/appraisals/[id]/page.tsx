import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/ui/admin-layout"
import { AppraisalReview } from "@/components/ui/appraisal-review"

export default async function AdminAppraisalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

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

  // Get appraisal details
  const { data: appraisal } = await supabase
    .from("appraisals")
    .select(`
      *,
      user:users(id, full_name, email, department)
    `)
    .eq("id", id)
    .single()

  if (!appraisal) {
    redirect("/admin/appraisals")
  }

  // Get comments
  const { data: comments } = await supabase
    .from("admin_comments")
    .select(`
      *,
      admin:users!admin_comments_admin_id_fkey(full_name)
    `)
    .eq("appraisal_id", id)
    .order("created_at", { ascending: true })

  return (
    <AdminLayout user={profile}>
      <AppraisalReview appraisal={appraisal} comments={comments || []} />
    </AdminLayout>
  )
}
