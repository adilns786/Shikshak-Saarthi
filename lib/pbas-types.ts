// PBAS Form Types - Comprehensive type definitions for the PBAS system
// Based on API-PBAS Proforma format

// ============= User Roles =============
export type UserRole = "faculty" | "hod" | "admin" | "misAdmin";

export interface User {
  id: string;
  uid?: string;
  email: string;
  full_name: string;
  name?: string;
  role: UserRole;
  department?: string;
  designation?: string;
  employee_id?: string;
  phone?: string;
  mobile?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

// ============= PBAS Part A - General Information =============

export interface BasicInfo {
  institute: string;
  department: string;
  faculty: string;
  academic_year: string;
}

export interface PersonalInfo {
  name: string;
  department: string;
  current_designation: string;
  academic_level: string;
  last_promotion_date: string;
  cas_level: string;
  applied_designation: string;
  applied_grade_pay: string;
  eligibility_date: string;
  address: string;
  pin_code: string;
  mobile: string;
  email: string;
  emergency_contact?: string;
  date_of_birth?: string;
  gender?: string;
  category?: string;
  blood_group?: string;
  aadhaar_number?: string;
  pan_number?: string;
}

export interface AcademicQualification {
  id?: string;
  examination: string;
  board_university: string;
  year_passing: string;
  percentage: string;
  division_class_grade: string;
  subject: string;
}

export interface ResearchDegree {
  id?: string;
  degree_type: "M.Phil." | "Ph.D./D.Phil." | "D.Sc./D.Litt." | "Other";
  title: string;
  date_of_award: string;
  university: string;
  guide_name?: string;
  registration_date?: string;
}

export interface PriorAppointment {
  id?: string;
  designation: string;
  employer_name: string;
  essential_qualifications: string;
  nature_of_appointment: "Regular" | "Fixed Term" | "Temporary" | "Adhoc" | "Contract";
  nature_of_duties: string;
  date_of_joining: string;
  date_of_leaving: string;
  salary_with_grade: string;
  reason_of_leaving: string;
}

export interface CurrentPost {
  id?: string;
  designation: string;
  department: string;
  from_date: string;
  to_date: string;
  grade_pay_level: string;
}

export interface TeachingExperience {
  pg_years: string;
  ug_years: string;
  total_years?: string;
}

export interface ResearchExperience {
  years: string;
  description?: string;
}

export interface Specialization {
  fields: string[];
  primary_area?: string;
  secondary_areas?: string[];
}

export interface Course_FDP {
  id?: string;
  name: string;
  place: string;
  duration: string;
  organizer: string;
  type: "Orientation" | "Refresher" | "FDP" | "MOOC" | "Short Term" | "STTP" | "Workshop" | "Other";
  start_date?: string;
  end_date?: string;
  certificate_url?: string;
  score?: string;
}

// ============= PBAS Part B - API Categories =============

// Category I: Teaching, Learning & Evaluation
export interface TeachingData {
  actual_classes_per_year: string;
  percentage_teaching: string;
  self_appraisal_grading: "Good" | "Satisfactory" | "Not Satisfactory";
  verified_grading?: "Good" | "Satisfactory" | "Not Satisfactory";
  total_hours_spent: string;
  lecture_hours?: string;
  tutorial_hours?: string;
  practical_hours?: string;
  remarks?: string;
}

export interface TeachingActivity {
  id?: string;
  course_name: string;
  course_code: string;
  semester: string;
  year: string;
  classes_allotted: number;
  classes_taken: number;
  student_feedback_score?: number;
}

// Category II: Co-Curricular, Extension & Professional Development
export interface ActivityData {
  admin_days: string;
  admin_grading: "Good" | "Satisfactory" | "Not Satisfactory";
  exam_days: string;
  exam_grading: "Good" | "Satisfactory" | "Not Satisfactory";
  student_days: string;
  student_grading: "Good" | "Satisfactory" | "Not Satisfactory";
  overall_grading?: "Good" | "Satisfactory" | "Not Satisfactory";
}

export interface AdministrativeResponsibility {
  id?: string;
  position: string;
  from_date: string;
  to_date: string;
  days_spent: number;
  description?: string;
}

export interface ExaminationDuty {
  id?: string;
  duty_type: 
    | "Question Paper Setting"
    | "Invigilation"
    | "Flying Squad"
    | "CS/ACS/Custodian"
    | "CAP Director"
    | "Unfair Menace Committee"
    | "Grievance Committee"
    | "Internal Assessment"
    | "External Assessment"
    | "Re-valuation"
    | "Result Preparation"
    | "RRC/RAC Committee"
    | "Ph.D. Thesis Evaluation"
    | "Other";
  date: string;
  days_spent: number;
  description?: string;
}

export interface StudentActivity {
  id?: string;
  activity_type: 
    | "Student Club"
    | "Career Counseling"
    | "Study Visit"
    | "Seminar"
    | "Cultural"
    | "Sports"
    | "NCC"
    | "NSS"
    | "Community Service"
    | "Other";
  name: string;
  date: string;
  days_spent: number;
  role: string;
  description?: string;
}

// Category III: Research, Publications & Academic Contributions
export interface ResearchPaper {
  id?: string;
  title: string;
  authors: string[];
  journal_name: string;
  issn?: string;
  year: string;
  volume?: string;
  issue?: string;
  page_numbers?: string;
  impact_factor?: number;
  indexed_in?: string[]; // SCI, Scopus, UGC Care, etc.
  doi?: string;
  publication_type: "Journal" | "Conference" | "Book Chapter" | "Other";
  api_score?: number;
  is_first_author?: boolean;
  is_corresponding_author?: boolean;
  citations?: number;
  pdf_url?: string;
}

export interface Publication {
  id?: string;
  title: string;
  type: "Book" | "Chapter" | "Editor" | "Translation" | "Other";
  publisher: string;
  isbn?: string;
  year: string;
  pages?: string;
  co_authors?: string[];
  api_score?: number;
}

export interface ResearchProject {
  id?: string;
  title: string;
  funding_agency: string;
  amount: number;
  duration: string;
  role: "PI" | "Co-PI" | "Consultant" | "Team Member";
  status: "Ongoing" | "Completed" | "Submitted";
  start_date: string;
  end_date?: string;
  project_type: "Major" | "Minor" | "Consultancy";
  api_score?: number;
  outcomes?: string;
}

export interface ConsultancyProject {
  id?: string;
  title: string;
  client_organization: string;
  amount: number;
  duration: string;
  status: "Ongoing" | "Completed";
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface ResearchGuidance {
  id?: string;
  student_name: string;
  enrollment_number?: string;
  degree: "M.Phil." | "Ph.D." | "M.Tech" | "M.E." | "Other";
  thesis_title: string;
  status: "Registered" | "Ongoing" | "Completed" | "Awarded";
  registration_date: string;
  award_date?: string;
  university: string;
  role: "Supervisor" | "Co-Supervisor";
}

export interface Patent {
  id?: string;
  title: string;
  patent_number?: string;
  filing_date: string;
  grant_date?: string;
  status: "Filed" | "Published" | "Granted" | "Abandoned";
  country: string;
  inventors: string[];
  applicant_organization?: string;
  api_score?: number;
}

export interface Award {
  id?: string;
  title: string;
  awarding_body: string;
  date_of_award: string;
  category: "National" | "International" | "State" | "University" | "Institute";
  description?: string;
  certificate_url?: string;
}

export interface PolicyDocument {
  id?: string;
  title: string;
  type: "Policy" | "Guideline" | "Report" | "Other";
  commissioning_body: string;
  date: string;
  status: "Draft" | "Published" | "Implemented";
  description?: string;
}

export interface InvitedLecture {
  id?: string;
  title: string;
  event_name: string;
  organizer: string;
  venue: string;
  date: string;
  type: "Keynote" | "Invited Talk" | "Resource Person" | "Panelist" | "Guest Lecture";
  level: "International" | "National" | "State" | "Regional" | "Institute";
  api_score?: number;
}

// ============= Complete PBAS Form Data Structure =============

export interface PBASPartA {
  basic_info: BasicInfo;
  personal_info: PersonalInfo;
  qualifications: AcademicQualification[];
  research_degrees: ResearchDegree[];
  prior_appointments: PriorAppointment[];
  current_posts: CurrentPost[];
  teaching_experience: TeachingExperience;
  research_experience: ResearchExperience;
  specialization: Specialization;
  courses_fdp: Course_FDP[];
}

export interface PBASPartB {
  // Table 1: Teaching & Student Activities
  table1: {
    teaching_data: TeachingData;
    teaching_activities: TeachingActivity[];
    activity_data: ActivityData;
    admin_responsibilities: AdministrativeResponsibility[];
    examination_duties: ExaminationDuty[];
    student_activities: StudentActivity[];
  };
  // Table 2: Research & Academic Contributions
  table2: {
    researchPapers: ResearchPaper[];
    publications: Publication[];
    researchProjects: ResearchProject[];
    consultancyProjects: ConsultancyProject[];
    researchGuidance: ResearchGuidance[];
  };
  // Patents, Policy & Awards
  patents_policy_awards: (Patent | Award | PolicyDocument)[];
  patents: Patent[];
  awards: Award[];
  policy_documents: PolicyDocument[];
  // Invited Lectures
  invited_lectures: InvitedLecture[];
}

export interface PBASFormData {
  id?: string;
  user_id: string;
  academic_year: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  part_a: PBASPartA;
  part_b: PBASPartB;
  api_score_summary?: APIScoreSummary;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  hod_remarks?: string;
  admin_remarks?: string;
}

// ============= API Score Calculation =============

export interface APIScoreSummary {
  category_i_teaching: number;
  category_ii_activities: number;
  category_iii_research: number;
  total_score: number;
  minimum_required: number;
  eligibility_status: "Eligible" | "Not Eligible" | "Pending Review";
}

// ============= Analytics & Insights =============

export interface DepartmentAnalytics {
  department: string;
  total_faculty: number;
  total_publications: number;
  total_projects: number;
  total_patents: number;
  total_funding: number;
  avg_api_score: number;
  faculty_breakdown: {
    professors: number;
    associate_professors: number;
    assistant_professors: number;
  };
  yearly_trends: {
    year: string;
    publications: number;
    projects: number;
    patents: number;
  }[];
}

export interface FacultyAnalytics {
  user_id: string;
  name: string;
  department: string;
  designation: string;
  total_publications: number;
  total_citations: number;
  h_index?: number;
  total_projects: number;
  total_funding: number;
  total_patents: number;
  api_score: number;
  performance_trend: {
    year: string;
    score: number;
  }[];
  category_breakdown: {
    category: string;
    score: number;
  }[];
}

// ============= AI Insights =============

export interface AIInsight {
  id: string;
  type: "recommendation" | "analysis" | "warning" | "achievement";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "teaching" | "research" | "service" | "overall";
  created_at: string;
}

export interface AIAnalysisRequest {
  user_id: string;
  form_data: PBASFormData;
  analysis_type: "summary" | "recommendations" | "comparison" | "forecast";
}

export interface AIAnalysisResponse {
  insights: AIInsight[];
  summary: string;
  recommendations: string[];
  comparison_data?: {
    metric: string;
    user_value: number;
    department_avg: number;
    percentile: number;
  }[];
}

// ============= Appraisal Workflow =============

export interface Appraisal {
  id: string;
  user_id: string;
  title: string;
  academic_year: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  form_data: PBASFormData;
  self_assessment: Record<string, any>;
  teaching_activities: Record<string, any>;
  research_activities: Record<string, any>;
  service_activities: Record<string, any>;
  professional_development: Record<string, any>;
  goals_achievements: Record<string, any>;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  admin_comments?: AdminComment[];
  hod_comments?: HODComment[];
}

export interface AdminComment {
  id: string;
  appraisal_id: string;
  admin_id: string;
  comment: string;
  comment_type: "general" | "suggestion" | "concern" | "approval";
  created_at: string;
  admin?: User;
}

export interface HODComment {
  id: string;
  appraisal_id: string;
  hod_id: string;
  comment: string;
  recommendation: "approved" | "needs_revision" | "rejected";
  created_at: string;
  hod?: User;
}

// ============= Document Generation =============

export interface GeneratedDocument {
  id: string;
  user_id: string;
  document_type: "PBAS_Form" | "API_Summary" | "Appraisal_Report";
  file_url: string;
  file_name: string;
  generated_at: string;
  academic_year: string;
}

// ============= Event & Publication Types =============

export interface Event {
  id: string;
  user_id: string;
  title: string;
  event_type: "conference" | "workshop" | "seminar" | "training" | "other";
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  role?: "participant" | "speaker" | "organizer" | "reviewer";
  certificate_url?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// ============= Audit & Logging =============

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
}

// ============= Department =============

export interface Department {
  id: string;
  name: string;
  code: string;
  hod_id?: string;
  hod?: User;
  faculty_count?: number;
  created_at: string;
  updated_at: string;
}

// ============= Constants =============

export const DEPARTMENTS = [
  "Computer Engineering",
  "Information Technology",
  "Electronics & Telecommunication",
  "Electronics Engineering",
  "Instrumentation Engineering",
  "Artificial Intelligence & Data Science",
  "Artificial Intelligence & Machine Learning",
  "Computer Science & Engineering (Data Science)",
  "Master of Computer Applications (MCA)",
  "Basic Sciences & Humanities",
] as const;

export const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor (Senior Scale)",
  "Assistant Professor",
  "Lecturer",
  "HOD",
] as const;

export const ACADEMIC_LEVELS = [
  "Level 10",
  "Level 11",
  "Level 12",
  "Level 13",
  "Level 13A",
  "Level 14",
] as const;

export const NATURE_OF_APPOINTMENTS = [
  "Regular",
  "Fixed Term",
  "Temporary",
  "Adhoc",
  "Contract",
] as const;

export const GRADING_OPTIONS = ["Good", "Satisfactory", "Not Satisfactory"] as const;

export type Department_Type = typeof DEPARTMENTS[number];
export type Designation_Type = typeof DESIGNATIONS[number];
export type AcademicLevel_Type = typeof ACADEMIC_LEVELS[number];
