"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Download,
  User,
  Calendar,
  FileText,
  BookOpen,
  Users,
  Target,
} from "lucide-react"

interface AppraisalReviewProps {
  appraisal: {
    id: string
    title: string
    academic_year: string
    status: string
    created_at: string
    submitted_at?: string
    self_assessment: any
    teaching_activities: any
    research_activities: any
    service_activities: any
    professional_development: any
    goals_achievements: any
    user?: {
      id: string
      full_name: string
      email: string
      department?: string
    }
  }
  comments?: Array<{
    id: string
    comment: string
    comment_type: string
    created_at: string
    admin: {
      full_name: string
    }
  }>
}

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

const sections = [
  { key: "self_assessment", title: "Self Assessment", icon: User },
  { key: "teaching_activities", title: "Teaching Activities", icon: BookOpen },
  { key: "research_activities", title: "Research Activities", icon: Target },
  { key: "service_activities", title: "Service Activities", icon: Users },
  { key: "professional_development", title: "Professional Development", icon: FileText },
  { key: "goals_achievements", title: "Goals & Achievements", icon: Target },
]

export function AppraisalReview({ appraisal, comments = [] }: AppraisalReviewProps) {
  const [newComment, setNewComment] = useState("")
  const [commentType, setCommentType] = useState("general")
  const [newStatus, setNewStatus] = useState(appraisal.status)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("admin_comments").insert({
        appraisal_id: appraisal.id,
        admin_id: user.id,
        comment: newComment,
        comment_type: commentType,
      })

      if (error) throw error

      setNewComment("")
      toast({
        title: "Comment added",
        description: "Your comment has been added to the appraisal.",
      })

      // Refresh the page to show the new comment
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (newStatus === appraisal.status) return

    setIsLoading(true)
    try {
      const updateData: any = { status: newStatus }

      if (newStatus === "approved") {
        updateData.approved_at = new Date().toISOString()
      } else if (newStatus === "under_review") {
        updateData.reviewed_at = new Date().toISOString()
      }

      const { error } = await supabase.from("appraisals").update(updateData).eq("id", appraisal.id)

      if (error) throw error

      toast({
        title: "Status updated",
        description: `Appraisal status changed to ${statusLabels[newStatus as keyof typeof statusLabels]}.`,
      })

      // Refresh the page to show the updated status
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderSectionContent = (sectionKey: string, data: any) => {
    if (!data || typeof data !== "object") return null

    return (
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <h4 className="font-medium text-sm text-muted-foreground mb-2 capitalize">{key.replace(/_/g, " ")}</h4>
            <p className="text-sm text-foreground leading-relaxed">{(value as string) || "Not provided"}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary mb-2">{appraisal.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="mr-1 h-4 w-4" />
              {appraisal.user?.full_name}
            </div>
            {appraisal.user?.department && <div>{appraisal.user.department}</div>}
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              AY {appraisal.academic_year}
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-3">
            <Badge variant={statusColors[appraisal.status as keyof typeof statusColors]}>
              {statusLabels[appraisal.status as keyof typeof statusLabels]}
            </Badge>
            {appraisal.submitted_at && (
              <span className="text-xs text-muted-foreground">
                Submitted {formatDistanceToNow(new Date(appraisal.submitted_at), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Appraisal Content */}
        <div className="lg:col-span-2 space-y-6">
          {sections.map((section) => {
            const Icon = section.icon
            const data = appraisal[section.key as keyof typeof appraisal]

            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span>{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>{renderSectionContent(section.key, data)}</CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Review Panel */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Review Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Pending Review</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newStatus !== appraisal.status && (
                <Button onClick={handleStatusUpdate} disabled={isLoading} className="w-full">
                  {newStatus === "approved" && <CheckCircle className="mr-2 h-4 w-4" />}
                  {newStatus === "rejected" && <XCircle className="mr-2 h-4 w-4" />}
                  Update Status
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Add Comment */}
          <Card>
            <CardHeader>
              <CardTitle>Add Comment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comment-type">Comment Type</Label>
                <Select value={commentType} onValueChange={setCommentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="concern">Concern</SelectItem>
                    <SelectItem value="approval">Approval</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your review comments..."
                  rows={4}
                />
              </div>
              <Button onClick={handleAddComment} disabled={isLoading || !newComment.trim()} className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Comment
              </Button>
            </CardContent>
          </Card>

          {/* Comments History */}
          {comments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comments ({comments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div key={comment.id}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{comment.admin.full_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {comment.comment_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.comment}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {index < comments.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
