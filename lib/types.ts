export interface User {
  id: string
  email: string
  full_name: string
  role: "faculty" | "admin"
  department?: string
  designation?: string
  employee_id?: string
  phone?: string
  profile_image_url?: string
  created_at: string
  updated_at: string
}

export interface Appraisal {
  id: string
  user_id: string
  title: string
  academic_year: string
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected"
  self_assessment: Record<string, any>
  teaching_activities: Record<string, any>
  research_activities: Record<string, any>
  service_activities: Record<string, any>
  professional_development: Record<string, any>
  goals_achievements: Record<string, any>
  submitted_at?: string
  reviewed_at?: string
  approved_at?: string
  created_at: string
  updated_at: string
  user?: User
  admin_comments?: AdminComment[]
}

export interface Publication {
  id: string
  user_id: string
  title: string
  authors: string[]
  journal_conference?: string
  publication_year: number
  doi?: string
  citations: number
  publication_type: "journal" | "conference" | "book" | "chapter" | "patent" | "other"
  abstract?: string
  keywords?: string[]
  pdf_url?: string
  external_id?: string
  source?: "manual" | "scholar" | "ieee" | "scopus"
  created_at: string
  updated_at: string
  user?: User
}

export interface Event {
  id: string
  user_id: string
  title: string
  event_type: "conference" | "workshop" | "seminar" | "training" | "other"
  description?: string
  location?: string
  start_date: string
  end_date?: string
  role?: "participant" | "speaker" | "organizer" | "reviewer"
  certificate_url?: string
  created_at: string
  updated_at: string
  user?: User
}

export interface AdminComment {
  id: string
  appraisal_id: string
  admin_id: string
  comment: string
  comment_type: "general" | "suggestion" | "concern" | "approval"
  created_at: string
  admin?: User
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
  user?: User
}
