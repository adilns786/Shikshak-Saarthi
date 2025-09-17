
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PDFExportButton } from "@/components/ui/pdf-export-button"
import { ArrowLeft, User, Award, BookOpen, Briefcase } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface AppraisalDetails {
  profiles?: any
  id: string
  academic_year: string
  status: string
  created_at: string
  submitted_at?: string
  teaching_data: any
  research_data: any
  service_data: any
  llm_analysis?: any
  user_id: string
  users: {
    full_name: string
    department: string
    designation: string
    employee_id: string
  }
}

export default function AppraisalDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [appraisal, setAppraisal] = useState<AppraisalDetails | null>(null)
  const [publications, setPublications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient()

  useEffect(() => {
    if (params.id) {
      fetchAppraisalDetails(params.id as string)
    }
  }, [params.id])

  const fetchAppraisalDetails = async (id: string) => {
    try {
      setLoading(true)

      // Fetch appraisal details with user data using the correct foreign key
      const { data: appraisalData, error: appraisalError } = await supabase
        .from("appraisals")
        .select(`
          *,
          users!appraisals_user_id_fkey (
            full_name,
            department,
            designation,
            employee_id
          )
        `)
        .eq("id", id)
        .single()

      if (appraisalError) throw appraisalError

      setAppraisal(appraisalData)

      // Fetch publications for this user
      const { data: publicationsData, error: publicationsError } = await supabase
        .from("publications")
        .select("*")
        .eq("user_id", appraisalData.user_id) // Changed from faculty_id to user_id
        .order("publication_year", { ascending: false })

      if (publicationsError) throw publicationsError

      setPublications(publicationsData || [])
    } catch (error) {
      console.error("Error fetching appraisal details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch appraisal details. Please try again.",
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

  if (!appraisal) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Appraisal Not Found</h1>
          <p className="text-gray-600 mb-4">The requested appraisal could not be found.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const pdfData = {
    faculty: {
      name: appraisal.profiles?.full_name,
      department: appraisal.profiles?.department,
      designation: appraisal.profiles?.designation,
      employeeId: appraisal.profiles?.employee_id,
    },
    appraisal: {
      academicYear: appraisal.academic_year,
      status: appraisal.status,
      createdAt: appraisal.created_at,
      submittedAt: appraisal.submitted_at,
      teachingData: appraisal.teaching_data,
      researchData: appraisal.research_data,
      serviceData: appraisal.service_data,
      llmAnalysis: appraisal.llm_analysis,
    },
    publications,
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appraisal Details</h1>
            <p className="text-gray-600 mt-1">Academic Year {appraisal.academic_year}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge
            variant={
              appraisal.status === "approved" ? "default" : appraisal.status === "submitted" ? "secondary" : "outline"
            }
          >
            {appraisal.status.charAt(0).toUpperCase() + appraisal.status.slice(1)}
          </Badge>
          <PDFExportButton data={pdfData} />
        </div>
      </motion.div>

      {/* Faculty Information */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Faculty Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg font-semibold">{appraisal.profiles?.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Employee ID</p>
                <p className="text-lg font-semibold">{appraisal.profiles?.employee_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="text-lg font-semibold">{appraisal.profiles?.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Designation</p>
                <p className="text-lg font-semibold">{appraisal.profiles?.designation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Teaching Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Teaching Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Courses Taught</h4>
              <div className="flex flex-wrap gap-2">
                {appraisal.teaching_data?.courses_taught?.map((course: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {course}
                  </Badge>
                )) || <p className="text-gray-500">No courses listed</p>}
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Student Feedback</h4>
              <p className="text-2xl font-bold text-primary">
                {appraisal.teaching_data?.student_feedback || "N/A"}/5.0
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Teaching Innovations</h4>
              <p className="text-gray-700">{appraisal.teaching_data?.innovations || "No innovations reported"}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Research Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Research Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {appraisal.research_data?.publications_count || 0}
                </div>
                <p className="text-sm text-gray-500">Publications</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{appraisal.research_data?.grants_received || 0}</div>
                <p className="text-sm text-gray-500">Grants Received</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {appraisal.research_data?.conferences_attended || 0}
                </div>
                <p className="text-sm text-gray-500">Conferences</p>
              </div>
            </div>

            {publications.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-4">Recent Publications</h4>
                  <div className="space-y-3">
                    {publications.slice(0, 5).map((pub, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm">{pub.title}</h5>
                        <p className="text-xs text-gray-500 mt-1">
                          {pub.venue} • {pub.year} • {pub.citations || 0} citations
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Service Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Service Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Committee Memberships</h4>
              <div className="flex flex-wrap gap-2">
                {appraisal.service_data?.committees?.map((committee: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {committee}
                  </Badge>
                )) || <p className="text-gray-500">No committee memberships</p>}
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Administrative Roles</h4>
              <div className="flex flex-wrap gap-2">
                {appraisal.service_data?.administrative_roles?.map((role: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {role}
                  </Badge>
                )) || <p className="text-gray-500">No administrative roles</p>}
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Outreach Activities</h4>
              <p className="text-2xl font-bold text-primary">{appraisal.service_data?.outreach_activities || 0}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Analysis */}
      {appraisal.llm_analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                AI Analysis & Recommendations
              </CardTitle>
              <CardDescription>Generated insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">{appraisal.llm_analysis.overall_score}/100</div>
                <p className="text-gray-600">Overall Performance Score</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Key Strengths</h4>
                  <ul className="space-y-2">
                    {appraisal.llm_analysis.strengths?.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {appraisal.llm_analysis.areas_for_improvement?.map((area: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {appraisal.llm_analysis.recommendations?.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Summary</h4>
                <p className="text-gray-700">{appraisal.llm_analysis.summary}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
