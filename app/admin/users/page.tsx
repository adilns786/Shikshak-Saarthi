import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/ui/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from "date-fns"
import { Search, Filter, UserPlus, Mail, Edit } from "lucide-react"
import { Filters } from "@/components/ui/filters-client"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; search?: string }>
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
  let query = supabase.from("users").select("*").order("created_at", { ascending: false })

  // Apply filters
  if (params.role && params.role !== "all") {
    query = query.eq("role", params.role)
  }

  if (params.search) {
    query = query.ilike("full_name", `%${params.search}%`)
  }

  const { data: users } = await query

  return (
    <AdminLayout user={profile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage faculty and admin users.</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Filters - Using client component */}
        <Filters searchParams={params} />

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!users || users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => {
                  const userInitials =
                    user.full_name
                      ?.split(" ")
                      .map((n: any[]) => n[0])
                      .join("")
                      .toUpperCase() || "U"

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.profile_image_url || "/placeholder.svg"} alt={user.full_name} />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-foreground">{user.full_name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{user.email}</span>
                            {user.employee_id && (
                              <>
                                <span>•</span>
                                <span>ID: {user.employee_id}</span>
                              </>
                            )}
                          </div>
                          {user.department && <p className="text-sm text-muted-foreground">{user.department}</p>}
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Mail className="mr-2 h-4 w-4" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}