"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { FileText, BookOpen, Calendar, ArrowRight } from "lucide-react"

interface Activity {
  id: string
  type: "appraisal" | "publication" | "event"
  title: string
  status?: string
  date: string
  href: string
}

interface RecentActivityProps {
  activities: Activity[]
}

const activityIcons = {
  appraisal: FileText,
  publication: BookOpen,
  event: Calendar,
}

const statusColors = {
  draft: "secondary",
  submitted: "default",
  under_review: "default",
  approved: "default",
  rejected: "destructive",
} as const

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Activity
          <Button variant="ghost" size="sm" asChild>
            <Link href="/activity">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity, index) => {
            const Icon = activityIcons[activity.type]
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-accent/10 rounded-full flex items-center justify-center">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={activity.href}
                    className="text-sm font-medium text-foreground hover:text-accent transition-colors line-clamp-1"
                  >
                    {activity.title}
                  </Link>
                  <div className="flex items-center space-x-2 mt-1">
                    {activity.status && (
                      <Badge
                        variant={statusColors[activity.status as keyof typeof statusColors] || "secondary"}
                        className="text-xs"
                      >
                        {activity.status.replace("_", " ")}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
