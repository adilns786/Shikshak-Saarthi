-- SQL Schema updates for HOD role support
-- Run this after 001_create_tables.sql

-- Add HOD role to users table
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('faculty', 'hod', 'admin', 'misAdmin'));

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  hod_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  description TEXT,
  established_year INTEGER,
  faculty_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert VESIT departments
INSERT INTO public.departments (name, code, description) VALUES
('Undergraduate', 'UG', 'Undergraduate Department'),
('Electronics & Computer Science', 'ECS', 'Department of Electronics & Computer Science'),
('Computer', 'COMP', 'Department of Computer'),
('Automation & Robotics', 'AR', 'Department of Automation & Robotics'),
('Electronics and Telecommunication', 'EXTC', 'Department of Electronics and Telecommunication'),
('Information Technology', 'IT', 'Department of Information Technology'),
('AI and Data Science', 'AIDS', 'Department of AI and Data Science'),
('Humanities and Applied Sciences(FE)', 'HAS', 'Department of Humanities and Applied Sciences'),
('Electronics', 'ELEX', 'Department of Electronics'),
('Instrumentation', 'INST', 'Department of Instrumentation')
ON CONFLICT (name) DO NOTHING;

-- Create PBAS forms table with comprehensive structure
CREATE TABLE IF NOT EXISTS public.pbas_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  
  -- Part A: General Information
  part_a JSONB DEFAULT '{}'::jsonb,
  
  -- Part B: Academic Performance Indicators
  part_b JSONB DEFAULT '{}'::jsonb,
  
  -- API Score Summary
  api_score_summary JSONB DEFAULT '{}'::jsonb,
  
  -- Workflow fields
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  hod_reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Review comments
  hod_remarks TEXT,
  admin_remarks TEXT,
  
  -- Reviewers
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  hod_reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one form per user per academic year
  UNIQUE(user_id, academic_year)
);

-- Create HOD comments table
CREATE TABLE IF NOT EXISTS public.hod_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pbas_form_id UUID NOT NULL REFERENCES public.pbas_forms(id) ON DELETE CASCADE,
  hod_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  recommendation TEXT CHECK (recommendation IN ('approved', 'needs_revision', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create department analytics view
CREATE OR REPLACE VIEW public.department_analytics AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  d.code as department_code,
  COUNT(DISTINCT u.id) as total_faculty,
  COUNT(DISTINCT pf.id) FILTER (WHERE pf.status = 'submitted') as submitted_forms,
  COUNT(DISTINCT pf.id) FILTER (WHERE pf.status = 'approved') as approved_forms,
  COUNT(DISTINCT pf.id) FILTER (WHERE pf.status = 'draft') as pending_forms,
  AVG((pf.api_score_summary->>'total_score')::numeric) FILTER (WHERE pf.api_score_summary IS NOT NULL) as avg_api_score
FROM public.departments d
LEFT JOIN public.users u ON u.department = d.name AND u.role IN ('faculty', 'hod')
LEFT JOIN public.pbas_forms pf ON pf.user_id = u.id
GROUP BY d.id, d.name, d.code;

-- Create faculty research summary view
CREATE OR REPLACE VIEW public.faculty_research_summary AS
SELECT 
  u.id as user_id,
  u.full_name as faculty_name,
  u.department,
  u.designation,
  COALESCE(
    (SELECT COUNT(*) FROM jsonb_array_elements(pf.part_b->'table2'->'researchPapers')),
    0
  ) as research_papers_count,
  COALESCE(
    (SELECT COUNT(*) FROM jsonb_array_elements(pf.part_b->'table2'->'publications')),
    0
  ) as publications_count,
  COALESCE(
    (SELECT COUNT(*) FROM jsonb_array_elements(pf.part_b->'table2'->'researchProjects')),
    0
  ) as projects_count,
  COALESCE(
    (SELECT COUNT(*) FROM jsonb_array_elements(pf.part_b->'patents')),
    0
  ) as patents_count,
  COALESCE(
    (pf.api_score_summary->>'total_score')::numeric,
    0
  ) as api_score
FROM public.users u
LEFT JOIN public.pbas_forms pf ON pf.user_id = u.id
WHERE u.role IN ('faculty', 'hod');

-- Enable RLS on new tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pbas_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hod_comments ENABLE ROW LEVEL SECURITY;

-- Policies for departments
CREATE POLICY "Departments are viewable by everyone" 
ON public.departments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins can modify departments" 
ON public.departments FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'misAdmin')
  )
);

-- Policies for PBAS forms
CREATE POLICY "Users can view their own PBAS forms" 
ON public.pbas_forms FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND (
      u.role IN ('admin', 'misAdmin')
      OR (u.role = 'hod' AND u.department = (
        SELECT department FROM public.users WHERE id = pbas_forms.user_id
      ))
    )
  )
);

CREATE POLICY "Users can insert their own PBAS forms" 
ON public.pbas_forms FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own PBAS forms" 
ON public.pbas_forms FOR UPDATE 
TO authenticated 
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.role IN ('admin', 'misAdmin', 'hod')
  )
);

-- Policies for HOD comments
CREATE POLICY "HOD comments are viewable by form owner and HODs/admins" 
ON public.hod_comments FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.pbas_forms pf 
    WHERE pf.id = hod_comments.pbas_form_id 
    AND (
      pf.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('admin', 'misAdmin', 'hod')
      )
    )
  )
);

CREATE POLICY "HODs can insert comments" 
ON public.hod_comments FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.role IN ('hod', 'admin', 'misAdmin')
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_pbas_forms_user_id ON public.pbas_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_pbas_forms_status ON public.pbas_forms(status);
CREATE INDEX IF NOT EXISTS idx_pbas_forms_academic_year ON public.pbas_forms(academic_year);

-- Function to update faculty count in departments
CREATE OR REPLACE FUNCTION update_department_faculty_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old department count if department changed
  IF TG_OP = 'UPDATE' AND OLD.department IS DISTINCT FROM NEW.department THEN
    UPDATE public.departments 
    SET faculty_count = (
      SELECT COUNT(*) FROM public.users 
      WHERE department = OLD.department AND role IN ('faculty', 'hod')
    )
    WHERE name = OLD.department;
  END IF;
  
  -- Update new department count
  IF NEW.department IS NOT NULL THEN
    UPDATE public.departments 
    SET faculty_count = (
      SELECT COUNT(*) FROM public.users 
      WHERE department = NEW.department AND role IN ('faculty', 'hod')
    )
    WHERE name = NEW.department;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for faculty count update
DROP TRIGGER IF EXISTS trigger_update_faculty_count ON public.users;
CREATE TRIGGER trigger_update_faculty_count
AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_department_faculty_count();

-- Function to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS update_pbas_forms_updated_at ON public.pbas_forms;
CREATE TRIGGER update_pbas_forms_updated_at
BEFORE UPDATE ON public.pbas_forms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
