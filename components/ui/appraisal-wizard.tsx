"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  FileText,
  User,
  BookOpen,
  Users,
  Target,
  CheckCircle,
} from "lucide-react"

interface AppraisalData {
  id?: string
  title: string
  academic_year: string
  status: string
  self_assessment: {
    strengths: string
    areas_for_improvement: string
    achievements: string
  }
  teaching_activities: {
    courses_taught: string
    teaching_methods: string
    student_feedback: string
  }
  research_activities: {
    publications: string
    grants: string
    collaborations: string
  }
  service_activities: {
    committees: string
    reviews: string
    community_service: string
  }
  professional_development: {
    conferences: string
    workshops: string
    certifications: string
  }
  goals_achievements: {
    previous_goals: string
    achievements: string
    future_goals: string
  }
}

interface AppraisalWizardProps {
  initialData?: Partial<AppraisalData>
  isEditing?: boolean
}

const steps = [
  {
    id: "basic",
    title: "Basic Information",
    description: "Appraisal title and academic year",
    icon: FileText,
  },
  {
    id: "self_assessment",
    title: "Self Assessment",
    description: "Your strengths and achievements",
    icon: User,
  },
  {
    id: "teaching",
    title: "Teaching Activities",
    description: "Courses and teaching methods",
    icon: BookOpen,
  },
  {
    id: "research",
    title: "Research Activities",
    description: "Publications and research work",
    icon: Target,
  },
  {
    id: "service",
    title: "Service Activities",
    description: "Committee work and service",
    icon: Users,
  },
  {
    id: "development",
    title: "Professional Development",
    description: "Conferences and training",
    icon: CheckCircle,
  },
  {
    id: "goals",
    title: "Goals & Achievements",
    description: "Past achievements and future goals",
    icon: Target,
  },
]

export function AppraisalWizard({ initialData, isEditing = false }: AppraisalWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<AppraisalData>({
    title: "",
    academic_year: new Date().getFullYear().toString(),
    status: "draft",
    self_assessment: {
      strengths: "",
      areas_for_improvement: "",
      achievements: "",
    },
    teaching_activities: {
      courses_taught: "",
      teaching_methods: "",
      student_feedback: "",
    },
    research_activities: {
      publications: "",
      grants: "",
      collaborations: "",
    },
    service_activities: {
      committees: "",
      reviews: "",
      community_service: "",
    },
    professional_development: {
      conferences: "",
      workshops: "",
      certifications: "",
    },
    goals_achievements: {
      previous_goals: "",
      achievements: "",
      future_goals: "",
    },
    ...initialData,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "error" | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (!data.title || autoSaveStatus === "saving") return

      setAutoSaveStatus("saving")
      try {
        await saveDraft()
        setAutoSaveStatus("saved")
        setTimeout(() => setAutoSaveStatus(null), 2000)
      } catch (error) {
        setAutoSaveStatus("error")
        setTimeout(() => setAutoSaveStatus(null), 3000)
      }
    }

    const timer = setTimeout(autoSave, 2000)
    return () => clearTimeout(timer)
  }, [data])

  const saveDraft = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const appraisalData = {
      user_id: user.id,
      title: data.title,
      academic_year: data.academic_year,
      status: data.status,
      self_assessment: data.self_assessment,
      teaching_activities: data.teaching_activities,
      research_activities: data.research_activities,
      service_activities: data.service_activities,
      professional_development: data.professional_development,
      goals_achievements: data.goals_achievements,
    }

    if (data.id) {
      const { error } = await supabase.from("appraisals").update(appraisalData).eq("id", data.id)
      if (error) throw error
    } else {
      const { data: newAppraisal, error } = await supabase.from("appraisals").insert(appraisalData).select().single()
      if (error) throw error
      setData((prev) => ({ ...prev, id: newAppraisal.id }))
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await saveDraft()
      toast({
        title: "Draft saved",
        description: "Your appraisal has been saved as a draft.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const updatedData = { ...data, status: "submitted", submitted_at: new Date().toISOString() }
      setData(updatedData)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("appraisals")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", data.id)

      if (error) throw error

      toast({
        title: "Appraisal submitted",
        description: "Your appraisal has been submitted for review.",
      })

      router.push("/appraisal")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit appraisal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateData = (section: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof AppraisalData],
        [field]: value,
      },
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  const renderStepContent = () => {
    const step = steps[currentStep]

    switch (step.id) {
      case "basic":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Appraisal Title</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Annual Performance Appraisal 2024"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input
                id="academic_year"
                value={data.academic_year}
                onChange={(e) => setData((prev) => ({ ...prev, academic_year: e.target.value }))}
                placeholder="2024"
                required
              />
            </div>
          </div>
        )

      case "self_assessment":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strengths">Key Strengths</Label>
              <Textarea
                id="strengths"
                value={data.self_assessment.strengths}
                onChange={(e) => updateData("self_assessment", "strengths", e.target.value)}
                placeholder="Describe your key professional strengths..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areas_for_improvement">Areas for Improvement</Label>
              <Textarea
                id="areas_for_improvement"
                value={data.self_assessment.areas_for_improvement}
                onChange={(e) => updateData("self_assessment", "areas_for_improvement", e.target.value)}
                placeholder="Identify areas where you'd like to improve..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="achievements">Key Achievements</Label>
              <Textarea
                id="achievements"
                value={data.self_assessment.achievements}
                onChange={(e) => updateData("self_assessment", "achievements", e.target.value)}
                placeholder="Highlight your major achievements this year..."
                rows={4}
              />
            </div>
          </div>
        )

      case "teaching":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courses_taught">Courses Taught</Label>
              <Textarea
                id="courses_taught"
                value={data.teaching_activities.courses_taught}
                onChange={(e) => updateData("teaching_activities", "courses_taught", e.target.value)}
                placeholder="List the courses you taught this year..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teaching_methods">Teaching Methods & Innovations</Label>
              <Textarea
                id="teaching_methods"
                value={data.teaching_activities.teaching_methods}
                onChange={(e) => updateData("teaching_activities", "teaching_methods", e.target.value)}
                placeholder="Describe your teaching methods and any innovations..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student_feedback">Student Feedback & Outcomes</Label>
              <Textarea
                id="student_feedback"
                value={data.teaching_activities.student_feedback}
                onChange={(e) => updateData("teaching_activities", "student_feedback", e.target.value)}
                placeholder="Summarize student feedback and learning outcomes..."
                rows={4}
              />
            </div>
          </div>
        )

      case "research":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="publications">Publications & Research Output</Label>
              <Textarea
                id="publications"
                value={data.research_activities.publications}
                onChange={(e) => updateData("research_activities", "publications", e.target.value)}
                placeholder="List your publications, papers, and research output..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grants">Grants & Funding</Label>
              <Textarea
                id="grants"
                value={data.research_activities.grants}
                onChange={(e) => updateData("research_activities", "grants", e.target.value)}
                placeholder="Describe grants received or applied for..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collaborations">Research Collaborations</Label>
              <Textarea
                id="collaborations"
                value={data.research_activities.collaborations}
                onChange={(e) => updateData("research_activities", "collaborations", e.target.value)}
                placeholder="Detail your research collaborations and partnerships..."
                rows={4}
              />
            </div>
          </div>
        )

      case "service":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="committees">Committee Work</Label>
              <Textarea
                id="committees"
                value={data.service_activities.committees}
                onChange={(e) => updateData("service_activities", "committees", e.target.value)}
                placeholder="List committee memberships and roles..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviews">Peer Reviews & Editorial Work</Label>
              <Textarea
                id="reviews"
                value={data.service_activities.reviews}
                onChange={(e) => updateData("service_activities", "reviews", e.target.value)}
                placeholder="Describe peer review and editorial activities..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="community_service">Community Service</Label>
              <Textarea
                id="community_service"
                value={data.service_activities.community_service}
                onChange={(e) => updateData("service_activities", "community_service", e.target.value)}
                placeholder="Detail your community service activities..."
                rows={4}
              />
            </div>
          </div>
        )

      case "development":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conferences">Conferences & Presentations</Label>
              <Textarea
                id="conferences"
                value={data.professional_development.conferences}
                onChange={(e) => updateData("professional_development", "conferences", e.target.value)}
                placeholder="List conferences attended and presentations given..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workshops">Workshops & Training</Label>
              <Textarea
                id="workshops"
                value={data.professional_development.workshops}
                onChange={(e) => updateData("professional_development", "workshops", e.target.value)}
                placeholder="Describe workshops and training programs attended..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications & Skills</Label>
              <Textarea
                id="certifications"
                value={data.professional_development.certifications}
                onChange={(e) => updateData("professional_development", "certifications", e.target.value)}
                placeholder="List new certifications and skills acquired..."
                rows={4}
              />
            </div>
          </div>
        )

      case "goals":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="previous_goals">Previous Year Goals</Label>
              <Textarea
                id="previous_goals"
                value={data.goals_achievements.previous_goals}
                onChange={(e) => updateData("goals_achievements", "previous_goals", e.target.value)}
                placeholder="What were your goals from the previous year?"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal_achievements">Goal Achievements</Label>
              <Textarea
                id="goal_achievements"
                value={data.goals_achievements.achievements}
                onChange={(e) => updateData("goals_achievements", "achievements", e.target.value)}
                placeholder="How well did you achieve your previous goals?"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="future_goals">Future Goals</Label>
              <Textarea
                id="future_goals"
                value={data.goals_achievements.future_goals}
                onChange={(e) => updateData("goals_achievements", "future_goals", e.target.value)}
                placeholder="What are your goals for the coming year?"
                rows={4}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-primary">
              {isEditing ? "Edit Appraisal" : "New Appraisal"}
            </h1>
            <p className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {autoSaveStatus && (
              <Badge variant={autoSaveStatus === "error" ? "destructive" : "secondary"}>
                {autoSaveStatus === "saving" && "Saving..."}
                {autoSaveStatus === "saved" && "Saved"}
                {autoSaveStatus === "error" && "Save failed"}
              </Badge>
            )}
            <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep

          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : isCompleted
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{step.title}</span>
            </button>
          )
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {(() => {
              const Icon = steps[currentStep].icon;
              return <Icon className="h-5 w-5" />;
            })()}
            <span>{steps[currentStep].title}</span>
          </CardTitle>
          <p className="text-muted-foreground">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSave} disabled={isLoading || !data.title}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isLoading || !data.title}>
              <Send className="mr-2 h-4 w-4" />
              Submit for Review
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
