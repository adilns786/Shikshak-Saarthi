const form_llm = [
  {
    "id": "institute_name",
    "label": "Name of the Institute / College",
    "type": "text",
    "sample": "e.g., Mumbai University"
  },
  {
    "id": "department_name",
    "label": "Name of the Department",
    "type": "text",
    "sample": "e.g., Computer Science"
  },
  {
    "id": "cas_promotion_stage",
    "label": "Under CAS Promotion for Stage/Level For",
    "type": "text",
    "sample": "e.g., Stage 2 to 3"
  },
  {
    "id": "faculty_name",
    "label": "Faculty of",
    "type": "text",
    "sample": "e.g., Science and Technology"
  },
  {
    "id": "academic_year",
    "label": "ACADEMIC YEAR",
    "type": "text",
    "sample": "e.g., 2023-2024"
  },
  {
    "id": "name",
    "label": "Name (in Block Letters)",
    "type": "text",
    "sample": "e.g., JOHN DOE",
    "group": "personal_info"
  },
  {
    "id": "department",
    "label": "Department",
    "type": "text",
    "sample": "e.g., Computer Science",
    "group": "personal_info"
  },
  {
    "id": "current_designation",
    "label": "Current Designation & Academic Level",
    "type": "text",
    "sample": "e.g., Assistant Professor, Level 10",
    "group": "personal_info"
  },
  {
    "id": "date_last_promotion",
    "label": "Date of last Promotion Current position and Academic",
    "type": "date",
    "sample": "e.g., 2020-05-15",
    "group": "personal_info"
  },
  {
    "id": "current_level_cas",
    "label": "Level of an applicant under CAS",
    "type": "text",
    "sample": "e.g., Level 10",
    "group": "personal_info"
  },
  {
    "id": "designation_applied",
    "label": "The designation and grade pay applied for under CAS",
    "type": "text",
    "sample": "e.g., Associate Professor, Level 12",
    "group": "personal_info"
  },
  {
    "id": "date_eligibility",
    "label": "Date of eligibility for promotion",
    "type": "date",
    "sample": "e.g., 2023-06-01",
    "group": "personal_info"
  },
  {
    "id": "address",
    "label": "Address (with Pin code)",
    "type": "textarea",
    "sample": "e.g., 123 Main St, Mumbai, Maharashtra, 400001",
    "group": "personal_info"
  },
  {
    "id": "telephone",
    "label": "Telephone/ Mobile No.",
    "type": "tel",
    "sample": "e.g., +91 9876543210",
    "group": "personal_info"
  },
  {
    "id": "email",
    "label": "E-mail",
    "type": "email",
    "sample": "e.g., john.doe@example.com",
    "group": "personal_info"
  },
  {
    "id": "examination",
    "label": "Examinations",
    "type": "text",
    "sample": "e.g., SSC",
    "group": "academic_qualifications"
  },
  {
    "id": "board_university",
    "label": "Name of the Board/ University",
    "type": "text",
    "sample": "e.g., Maharashtra State Board",
    "group": "academic_qualifications"
  },
  {
    "id": "year_passing",
    "label": "Year of Passing",
    "type": "number",
    "sample": "e.g., 2005",
    "group": "academic_qualifications"
  },
  {
    "id": "percentage",
    "label": "Percentage Of Marks Obtained",
    "type": "number",
    "sample": "e.g., 85.5",
    "group": "academic_qualifications"
  },
  {
    "id": "division",
    "label": "Division I Class I Grade",
    "type": "text",
    "sample": "e.g., First Class",
    "group": "academic_qualifications"
  },
  {
    "id": "subject",
    "label": "Subject",
    "type": "text",
    "sample": "e.g., Mathematics",
    "group": "academic_qualifications"
  },
  {
    "id": "degree",
    "label": "Degrees",
    "type": "select",
    "options": ["M. Phil.", "Ph.D. / D. Phil.", "D.Sc. / D.Litt./ Any other"],
    "sample": "e.g., Ph.D.",
    "group": "research_degrees"
  },
  {
    "id": "title",
    "label": "Title",
    "type": "text",
    "sample": "e.g., Advanced Algorithms in Computer Science",
    "group": "research_degrees"
  },
  {
    "id": "date_award",
    "label": "Date of Award",
    "type": "date",
    "sample": "e.g., 2018-12-20",
    "group": "research_degrees"
  },
  {
    "id": "university",
    "label": "Name of University",
    "type": "text",
    "sample": "e.g., University of Mumbai",
    "group": "research_degrees"
  },
  {
    "id": "designation",
    "label": "Designation",
    "type": "text",
    "sample": "e.g., Lecturer",
    "group": "appointments_prior"
  },
  {
    "id": "employer",
    "label": "Name of Employer",
    "type": "text",
    "sample": "e.g., XYZ College",
    "group": "appointments_prior"
  },
  {
    "id": "essential_qualifications",
    "label": "Essential Qualifications for the Post at the time of Appointment",
    "type": "text",
    "sample": "e.g., M.Sc. in Computer Science",
    "group": "appointments_prior"
  },
  {
    "id": "nature_appointment",
    "label": "Nature of Appointment (Regular/ Fixed term/ Temporary/ Adhoc)",
    "type": "select",
    "options": ["Regular", "Fixed term", "Temporary", "Adhoc"],
    "sample": "e.g., Regular",
    "group": "appointments_prior"
  },
  {
    "id": "nature_duties",
    "label": "Nature of Duties",
    "type": "text",
    "sample": "e.g., Teaching and Research",
    "group": "appointments_prior"
  },
  {
    "id": "date_joining",
    "label": "Date of Joining",
    "type": "date",
    "sample": "e.g., 2015-07-01",
    "group": "appointments_prior"
  },
  {
    "id": "date_leaving",
    "label": "Date of Leaving",
    "type": "date",
    "sample": "e.g., 2018-06-30",
    "group": "appointments_prior"
  },
  {
    "id": "salary_grade",
    "label": "Salary with Grade",
    "type": "text",
    "sample": "e.g., Level 10",
    "group": "appointments_prior"
  },
  {
    "id": "reason_leaving",
    "label": "Reason of Leaving",
    "type": "text",
    "sample": "e.g., Career Growth",
    "group": "appointments_prior"
  },
  {
    "id": "designation",
    "label": "Designation",
    "type": "text",
    "sample": "e.g., Assistant Professor",
    "group": "posts_current_institution"
  },
  {
    "id": "department",
    "label": "Department",
    "type": "text",
    "sample": "e.g., Computer Science",
    "group": "posts_current_institution"
  },
  {
    "id": "date_joining",
    "label": "Date of Joining",
    "type": "date",
    "sample": "e.g., 2018-07-01",
    "group": "posts_current_institution"
  },
  {
    "id": "grade_pay_from",
    "label": "Grade Pay/ Pay Matrix Level From",
    "type": "text",
    "sample": "e.g., Level 10",
    "group": "posts_current_institution"
  },
  {
    "id": "grade_pay_to",
    "label": "To",
    "type": "text",
    "sample": "e.g., Level 12",
    "group": "posts_current_institution"
  },
  {
    "id": "pg_classes",
    "label": "Period of teaching experience: P.G. Classes (In Years)",
    "type": "number",
    "sample": "e.g., 5",
    "group": "teaching_experience"
  },
  {
    "id": "ug_classes",
    "label": "U.G. Classes (In Years)",
    "type": "number",
    "sample": "e.g., 3",
    "group": "teaching_experience"
  },
  {
    "id": "research_experience",
    "label": "Research Experience excluding Years Spent in M.Phil./Ph.D. (in Years)",
    "type": "number",
    "sample": "e.g., 2",
    "group": "teaching_experience"
  },
  {
    "id": "specialization_fields",
    "label": "Fields of Specialization under the Subject / Discipline",
    "type": "textarea",
    "sample": "e.g., Artificial Intelligence, Machine Learning",
    "group": "teaching_experience"
  },
  {
    "id": "course_name",
    "label": "Name of the Course",
    "type": "text",
    "sample": "e.g., Advanced Data Structures",
    "group": "hrd_courses"
  },
  {
    "id": "place",
    "label": "Place",
    "type": "text",
    "sample": "e.g., Mumbai",
    "group": "hrd_courses"
  },
  {
    "id": "duration",
    "label": "Duration",
    "type": "text",
    "sample": "e.g., 5 days",
    "group": "hrd_courses"
  },
  {
    "id": "organizer",
    "label": "Name of Organizer",
    "type": "text",
    "sample": "e.g., IIT Bombay",
    "group": "hrd_courses"
  },
  {
    "id": "actual_class_spent",
    "label": "Actual Class spent per Year",
    "type": "number",
    "sample": "e.g., 120",
    "group": "teaching_activities"
  },
  {
    "id": "total_actual_hours",
    "label": "Total Actual hours spent",
    "type": "number",
    "sample": "e.g., 150",
    "group": "teaching_activities"
  },
  {
    "id": "self_appraisal_grading",
    "label": "Self-Appraisal Grading",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "teaching_activities"
  },
  {
    "id": "verified_api_grading",
    "label": "Verified API Grading by Committee",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "teaching_activities"
  },
  {
    "id": "total_days_spent",
    "label": "Total days Spent per year",
    "type": "number",
    "sample": "e.g., 30",
    "group": "admin_responsibilities"
  },
  {
    "id": "self_appraisal_grading",
    "label": "Self-Appraisal Grading",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "admin_responsibilities"
  },
  {
    "id": "verified_api_grading",
    "label": "Verified API Grading by Committee",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "admin_responsibilities"
  },
  {
    "id": "total_days_spent",
    "label": "Total days Spent per year",
    "type": "number",
    "sample": "e.g., 15",
    "group": "examination_duties"
  },
  {
    "id": "self_appraisal_grading",
    "label": "Self-Appraisal Grading",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "examination_duties"
  },
  {
    "id": "verified_api_grading",
    "label": "Verified API Grading by Committee",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "examination_duties"
  },
  {
    "id": "total_days_spent",
    "label": "Total days Spent per year",
    "type": "number",
    "sample": "e.g., 10",
    "group": "student_cocurricular"
  },
  {
    "id": "self_appraisal_grading",
    "label": "Self-Appraisal Grading",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "student_cocurricular"
  },
  {
    "id": "verified_api_grading",
    "label": "Verified API Grading by Committee",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "student_cocurricular"
  },
  {
    "id": "total_days_spent",
    "label": "Total days Spent per year",
    "type": "number",
    "sample": "e.g., 5",
    "group": "institutional_governance"
  },
  {
    "id": "self_appraisal_grading",
    "label": "Self-Appraisal Grading",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "institutional_governance"
  },
  {
    "id": "verified_api_grading",
    "label": "Verified API Grading by Committee",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "institutional_governance"
  },
  {
    "id": "total_days_spent",
    "label": "Total days Spent per year",
    "type": "number",
    "sample": "e.g., 8",
    "group": "organizing_events"
  },
  {
    "id": "self_appraisal_grading",
    "label": "Self-Appraisal Grading",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "organizing_events"
  },
  {
    "id": "verified_api_grading",
    "label": "Verified API Grading by Committee",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "organizing_events"
  },
  {
    "id": "registered_candidates",
    "label": "No. of Registered candidate",
    "type": "number",
    "sample": "e.g., 5",
    "group": "phd_guidance"
  },
  {
    "id": "awarded_candidates",
    "label": "No. of Awarded Candidates",
    "type": "number",
    "sample": "e.g., 2",
    "group": "phd_guidance"
  },
  {
    "id": "self_appraisal_grading",
    "label": "Self-Appraisal Grading",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "phd_guidance"
  },
  {
    "id": "verified_api_grading",
    "label": "Verified API Grading by Committee",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "phd_guidance"
  },
  {
    "id": "above_10_lacs",
    "label": "Above 10 Lacs",
    "type": "number",
    "sample": "e.g., 2",
    "group": "research_projects"
  },
  {
    "id": "below_10_lacs",
    "label": "Below 10 lacs",
    "type": "number",
    "sample": "e.g., 1",
    "group": "research_projects"
  },
  {
    "id": "self_appraisal_grading",
    "label": "Self-Appraisal Grading",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "research_projects"
  },
  {
    "id": "verified_api_grading",
    "label": "Verified API Grading by Committee",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "research_projects"
  },
  {
    "id": "self_appraisal_grading",
    "label": "Self-Appraisal Grading",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "publication"
  },
  {
    "id": "verified_api_grading",
    "label": "Verified API Grading by Committee",
    "type": "select",
    "options": ["Good", "Satisfactory", "Not satisfactory"],
    "sample": "e.g., Good",
    "group": "publication"
  },
  {
    "id": "title_paper",
    "label": "Title Of paper",
    "type": "text",
    "sample": "e.g., Advances in AI",
    "group": "research_papers"
  },
  {
    "id": "journal_details",
    "label": "Journal Name, Page nos., Vol. no., Issue no., Year of publication",
    "type": "text",
    "sample": "e.g., Journal of AI, pp. 1-10, Vol. 5, Issue 2, 2023",
    "group": "research_papers"
  },
  {
    "id": "issn_isbn",
    "label": "ISSN/ ISBN NO.",
    "type": "text",
    "sample": "e.g., 1234-5678",
    "group": "research_papers"
  },
  {
    "id": "impact_factor",
    "label": "Impact Factor if any",
    "type": "number",
    "sample": "e.g., 2.5",
    "group": "research_papers"
  },
  {
    "id": "no_coauthors",
    "label": "No. of Co-Authors",
    "type": "number",
    "sample": "e.g., 2",
    "group": "research_papers"
  },
  {
    "id": "author_type",
    "label": "Whether Principal Author Supervisor Co-supervisor",
    "type": "select",
    "options": ["Principal Author", "Supervisor", "Co-supervisor", "Co-Author"],
    "sample": "e.g., Principal Author",
    "group": "research_papers"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 10",
    "group": "research_papers"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 10",
    "group": "research_papers"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. Of Relevant Documents",
    "type": "text",
    "sample": "e.g., 5",
    "group": "research_papers"
  },
  {
    "id": "title_book",
    "label": "Title of Book with no. of pages",
    "type": "text",
    "sample": "e.g., Advanced AI, 300 pages",
    "group": "books_published"
  },
  {
    "id": "publisher_details",
    "label": "Publishers name with ISSN/ ISBN NO.",
    "type": "text",
    "sample": "e.g., Springer, ISBN 978-3-16-148410-0",
    "group": "books_published"
  },
  {
    "id": "publisher_type",
    "label": "International / National Publisher",
    "type": "select",
    "options": ["International", "National"],
    "sample": "e.g., International",
    "group": "books_published"
  },
  {
    "id": "no_coauthors",
    "label": "No. of Co-Authors",
    "type": "number",
    "sample": "e.g., 1",
    "group": "books_published"
  },
  {
    "id": "author_type",
    "label": "Whether Principal Author / Co-Author",
    "type": "select",
    "options": ["Principal Author", "Co-Author"],
    "sample": "e.g., Principal Author",
    "group": "books_published"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 12",
    "group": "books_published"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 12",
    "group": "books_published"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 6",
    "group": "books_published"
  },
  {
    "id": "title_chapter",
    "label": "Title of Chapter with Page Nos.",
    "type": "text",
    "sample": "e.g., Chapter 1: Introduction, pp. 1-20",
    "group": "chapters_edited_book"
  },
  {
    "id": "book_name",
    "label": "Name of Book",
    "type": "text",
    "sample": "e.g., Advanced AI",
    "group": "chapters_edited_book"
  },
  {
    "id": "publisher_details",
    "label": "Publisher Name & ISSN/ ISBN NO.",
    "type": "text",
    "sample": "e.g., Springer, ISBN 978-3-16-148410-0",
    "group": "chapters_edited_book"
  },
  {
    "id": "no_coauthors",
    "label": "No. Of Co-Authors",
    "type": "number",
    "sample": "e.g., 1",
    "group": "chapters_edited_book"
  },
  {
    "id": "author_type",
    "label": "Whether Principal Author / Co-Author",
    "type": "select",
    "options": ["Principal Author", "Co-Author"],
    "sample": "e.g., Principal Author",
    "group": "chapters_edited_book"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 5",
    "group": "chapters_edited_book"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 5",
    "group": "chapters_edited_book"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 7",
    "group": "chapters_edited_book"
  },
  {
    "id": "title_pedagogy",
    "label": "Title of innovative pedagogy",
    "type": "text",
    "sample": "e.g., Interactive AI Labs",
    "group": "innovative_pedagogy"
  },
  {
    "id": "sponsored_agency",
    "label": "Sponsored Agency if any",
    "type": "text",
    "sample": "e.g., UGC",
    "group": "innovative_pedagogy"
  },
  {
    "id": "teaching_environment",
    "label": "Types of Teaching-Learning Environments",
    "type": "select",
    "options": ["Face-to-face", "Networked", "Open and distance", "Virtual"],
    "sample": "e.g., Virtual",
    "group": "innovative_pedagogy"
  },
  {
    "id": "ict_resources",
    "label": "Specify ICT's resources: web link: YouTube Videos-Audios / Smart Classroom/ Simulation Games/ Blogging/ Online Discussion Forums / Virtual Laboratories / Telecast / Picture/ Models /Charts if any",
    "type": "textarea",
    "sample": "e.g., YouTube Videos, Virtual Laboratories",
    "group": "innovative_pedagogy"
  },
  {
    "id": "date_approval",
    "label": "Date of Approval from Authority",
    "type": "date",
    "sample": "e.g., 2023-01-15",
    "group": "innovative_pedagogy"
  },
  {
    "id": "date_implementation",
    "label": "Date of Implementation",
    "type": "date",
    "sample": "e.g., 2023-02-01",
    "group": "innovative_pedagogy"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 5",
    "group": "innovative_pedagogy"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 5",
    "group": "innovative_pedagogy"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 8",
    "group": "innovative_pedagogy"
  },
  {
    "id": "programme_name",
    "label": "Name of Programme curricular introduced",
    "type": "text",
    "sample": "e.g., M.Tech in AI",
    "group": "new_curricular"
  },
  {
    "id": "title_curricular",
    "label": "Title of new curricular and courses",
    "type": "text",
    "sample": "e.g., Advanced Machine Learning",
    "group": "new_curricular"
  },
  {
    "id": "ict_resources",
    "label": "Specify ICTs resources: web link / Youtube link: Audio Video/ Telecast / Picture/ Models / Charts if any",
    "type": "textarea",
    "sample": "e.g., YouTube link, Models",
    "group": "new_curricular"
  },
  {
    "id": "date_approval",
    "label": "Date of approval from authority",
    "type": "date",
    "sample": "e.g., 2023-03-10",
    "group": "new_curricular"
  },
  {
    "id": "date_implementation",
    "label": "Date of Implementation",
    "type": "date",
    "sample": "e.g., 2023-04-01",
    "group": "new_curricular"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 2",
    "group": "new_curricular"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 2",
    "group": "new_curricular"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 9",
    "group": "new_curricular"
  },
  {
    "id": "programme_name",
    "label": "Name of Programme where curricular introduced",
    "type": "text",
    "sample": "e.g., M.Tech in AI",
    "group": "moocs_complete"
  },
  {
    "id": "course_credits",
    "label": "Course Credits",
    "type": "number",
    "sample": "e.g., 4",
    "group": "moocs_complete"
  },
  {
    "id": "title_mooc",
    "label": "Title of new MOOC Curricular",
    "type": "text",
    "sample": "e.g., Advanced AI",
    "group": "moocs_complete"
  },
  {
    "id": "ict_resources",
    "label": "Specify ICTs resources: web link/ Youtube link: Audio Video/ Telecast/ Picture/ Models/Charts If any",
    "type": "textarea",
    "sample": "e.g., YouTube link, Models",
    "group": "moocs_complete"
  },
  {
    "id": "date_approval",
    "label": "Date of approval from authority if any",
    "type": "date",
    "sample": "e.g., 2023-05-15",
    "group": "moocs_complete"
  },
  {
    "id": "date_implementation",
    "label": "Date Of Implementation",
    "type": "date",
    "sample": "e.g., 2023-06-01",
    "group": "moocs_complete"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 20",
    "group": "moocs_complete"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 20",
    "group": "moocs_complete"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 10",
    "group": "moocs_complete"
  },
  {
    "id": "programme_course_name",
    "label": "Name of Programme & Course where curricula introduced",
    "type": "text",
    "sample": "e.g., M.Tech in AI, Advanced AI",
    "group": "moocs_module"
  },
  {
    "id": "course_credits",
    "label": "Course Credits",
    "type": "number",
    "sample": "e.g., 4",
    "group": "moocs_module"
  },
  {
    "id": "title_mooc",
    "label": "Title of new MOOC curricula",
    "type": "text",
    "sample": "e.g., Advanced AI Module 1",
    "group": "moocs_module"
  },
  {
    "id": "ict_resources",
    "label": "Specify ICTs resources: web link / Youtube link: Audio Video/ Telecast/ Picture/ Models/Charts If any",
    "type": "textarea",
    "sample": "e.g., YouTube link, Models",
    "group": "moocs_module"
  },
  {
    "id": "date_approval",
    "label": "Date of approval from authority",
    "type": "date",
    "sample": "e.g., 2023-07-10",
    "group": "moocs_module"
  },
  {
    "id": "date_implementation",
    "label": "Date of Implementation",
    "type": "date",
    "sample": "e.g., 2023-08-01",
    "group": "moocs_module"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 5",
    "group": "moocs_module"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 5",
    "group": "moocs_module"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 11",
    "group": "moocs_module"
  },
  {
    "id": "programme_course_name",
    "label": "Name of Programme & Course where Content is introduced",
    "type": "text",
    "sample": "e.g., M.Tech in AI, Advanced AI",
    "group": "moocs_content_writer"
  },
  {
    "id": "course_credits",
    "label": "Course Credits",
    "type": "number",
    "sample": "e.g., 4",
    "group": "moocs_content_writer"
  },
  {
    "id": "title_content",
    "label": "Title of new MOOC Content curricular",
    "type": "text",
    "sample": "e.g., Advanced AI Content",
    "group": "moocs_content_writer"
  },
  {
    "id": "ict_resources",
    "label": "Specify ICTs resources: web link/ Youtube link: Audio Video/ Telecast/ Picture/ Models/Charts If any",
    "type": "textarea",
    "sample": "e.g., YouTube link, Models",
    "group": "moocs_content_writer"
  },
  {
    "id": "date_approval",
    "label": "Date of approval from authority",
    "type": "date",
    "sample": "e.g., 2023-09-15",
    "group": "moocs_content_writer"
  },
  {
    "id": "date_implementation",
    "label": "Date of Implementation",
    "type": "date",
    "sample": "e.g., 2023-10-01",
    "group": "moocs_content_writer"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 2",
    "group": "moocs_content_writer"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 2",
    "group": "moocs_content_writer"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 12",
    "group": "moocs_content_writer"
  },
  {
    "id": "programme_course_name",
    "label": "Name of Programme & Course",
    "type": "text",
    "sample": "e.g., M.Tech in AI, Advanced AI",
    "group": "moocs_coordinator"
  },
  {
    "id": "course_credits",
    "label": "Course Credits",
    "type": "number",
    "sample": "e.g., 4",
    "group": "moocs_coordinator"
  },
  {
    "id": "title_mooc",
    "label": "Title of MOOC curricula",
    "type": "text",
    "sample": "e.g., Advanced AI MOOC",
    "group": "moocs_coordinator"
  },
  {
    "id": "ict_resources",
    "label": "Specify ICTs resources: web link / Youtube link: Audio Video/ Telecast/ Picture/ Models / Charts if any",
    "type": "textarea",
    "sample": "e.g., YouTube link, Models",
    "group": "moocs_coordinator"
  },
  {
    "id": "date_approval",
    "label": "Date of approval from authority",
    "type": "date",
    "sample": "e.g., 2023-11-10",
    "group": "moocs_coordinator"
  },
  {
    "id": "date_implementation",
    "label": "Date of Implementation",
    "type": "date",
    "sample": "e.g., 2023-12-01",
    "group": "moocs_coordinator"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 8",
    "group": "moocs_coordinator"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 8",
    "group": "moocs_coordinator"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 13",
    "group": "moocs_coordinator"
  },
  {
    "id": "title_econtent",
    "label": "Title of e-Content course/ e-book with no. of pages",
    "type": "text",
    "sample": "e.g., Advanced AI e-Book, 200 pages",
    "group": "econtent_complete"
  },
  {
    "id": "programme_course",
    "label": "Name of Programme & Course to which Introduced",
    "type": "text",
    "sample": "e.g., M.Tech in AI, Advanced AI",
    "group": "econtent_complete"
  },
  {
    "id": "ict_resources",
    "label": "Specify ICTs Resources: web link",
    "type": "text",
    "sample": "e.g., www.example.com/ai-ebook",
    "group": "econtent_complete"
  },
  {
    "id": "peer_reviewed",
    "label": "Whether Peer reviewed",
    "type": "select",
    "options": ["Yes", "No"],
    "sample": "e.g., Yes",
    "group": "econtent_complete"
  },
  {
    "id": "no_coauthors",
    "label": "No. of Co Authors",
    "type": "number",
    "sample": "e.g., 1",
    "group": "econtent_complete"
  },
  {
    "id": "author_type",
    "label": "Whether Principal Author / Co-Author",
    "type": "select",
    "options": ["Principal Author", "Co-Author"],
    "sample": "e.g., Principal Author",
    "group": "econtent_complete"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 12",
    "group": "econtent_complete"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 12",
    "group": "econtent_complete"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 14",
    "group": "econtent_complete"
  },
  {
    "id": "title_econtent",
    "label": "Title of e content / e-module with no. of pages, ISSN/ISBN No. If any",
    "type": "text",
    "sample": "e.g., AI Module, 50 pages, ISBN 978-3-16-148410-0",
    "group": "econtent_module"
  },
  {
    "id": "programme_course",
    "label": "Name of Programme & Course to which introduced",
    "type": "text",
    "sample": "e.g., M.Tech in AI, Advanced AI",
    "group": "econtent_module"
  },
  {
    "id": "ict_resources",
    "label": "Specify ICTs resources: web link",
    "type": "text",
    "sample": "e.g., www.example.com/ai-module",
    "group": "econtent_module"
  },
  {
    "id": "peer_reviewed",
    "label": "Whether Peer reviewed",
    "type": "select",
    "options": ["Yes", "No"],
    "sample": "e.g., Yes",
    "group": "econtent_module"
  },
  {
    "id": "no_coauthors",
    "label": "No. of Co-Authors",
    "type": "number",
    "sample": "e.g., 1",
    "group": "econtent_module"
  },
  {
    "id": "author_type",
    "label": "Whether Principal Author/ Co-Author",
    "type": "select",
    "options": ["Principal Author", "Co-Author"],
    "sample": "e.g., Principal Author",
    "group": "econtent_module"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-appraisal Score",
    "type": "number",
    "sample": "e.g., 5",
    "group": "econtent_module"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 5",
    "group": "econtent_module"
  },
  {
    "id": "page_no_documents",
    "label": "Page. No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 15",
    "group": "econtent_module"
  },
  {
    "id": "programme_course",
    "label": "Name of Programme & Course where Content is introduced",
    "type": "text",
    "sample": "e.g., M.Tech in AI, Advanced AI",
    "group": "econtent_contribution"
  },
  {
    "id": "course_credits",
    "label": "Course Credits",
    "type": "number",
    "sample": "e.g., 4",
    "group": "econtent_contribution"
  },
  {
    "id": "title_content",
    "label": "Title of new MOOC Content curricular",
    "type": "text",
    "sample": "e.g., Advanced AI Content",
    "group": "econtent_contribution"
  },
  {
    "id": "ict_resources",
    "label": "Specify ICTs resources: web link / Youtube link: Audio Video/ Telecast/ Picture/ Models/Charts If any",
    "type": "textarea",
    "sample": "e.g., YouTube link, Models",
    "group": "econtent_contribution"
  },
  {
    "id": "date_approval",
    "label": "Date of approval from authority",
    "type": "date",
    "sample": "e.g., 2024-01-10",
    "group": "econtent_contribution"
  },
  {
    "id": "date_implementation",
    "label": "Date of Implementation",
    "type": "date",
    "sample": "e.g., 2024-02-01",
    "group": "econtent_contribution"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 2",
    "group": "econtent_contribution"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 2",
    "group": "econtent_contribution"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 16",
    "group": "econtent_contribution"
  },
  {
    "id": "title_econtent",
    "label": "Title of e-Content Course with no. of pages, ISSN/ ISBN NO. If any",
    "type": "text",
    "sample": "e.g., Advanced AI e-Course, 150 pages, ISBN 978-3-16-148410-0",
    "group": "econtent_editor"
  },
  {
    "id": "programme_course",
    "label": "Name of Programme & Course to which introduced",
    "type": "text",
    "sample": "e.g., M.Tech in AI, Advanced AI",
    "group": "econtent_editor"
  },
  {
    "id": "ict_resources",
    "label": "Specify ICTs resources: web link",
    "type": "text",
    "sample": "e.g., www.example.com/ai-ecourse",
    "group": "econtent_editor"
  },
  {
    "id": "peer_reviewed",
    "label": "Whether Peer reviewed",
    "type": "select",
    "options": ["Yes", "No"],
    "sample": "e.g., Yes",
    "group": "econtent_editor"
  },
  {
    "id": "no_coeditors",
    "label": "No. of Co-Editors",
    "type": "number",
    "sample": "e.g., 1",
    "group": "econtent_editor"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 10",
    "group": "econtent_editor"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 10",
    "group": "econtent_editor"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 17",
    "group": "econtent_editor"
  },
  {
    "id": "candidates_enrolled",
    "label": "Number of Candidate Enrolled",
    "type": "number",
    "sample": "e.g., 5",
    "group": "research_guidance"
  },
  {
    "id": "thesis_submitted",
    "label": "No. of Thesis Submitted with dates",
    "type": "text",
    "sample": "e.g., 2 (2023-05-10, 2023-06-15)",
    "group": "research_guidance"
  },
  {
    "id": "degree_awarded",
    "label": "No. of and date Degree Awarded with dates",
    "type": "text",
    "sample": "e.g., 1 (2023-07-20)",
    "group": "research_guidance"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 10",
    "group": "research_guidance"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 10",
    "group": "research_guidance"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 18",
    "group": "research_guidance"
  },
  {
    "id": "project_type",
    "label": "Type of Project: A / B",
    "type": "select",
    "options": ["A (>10 lakhs)", "B (<10 lakhs)"],
    "sample": "e.g., A (>10 lakhs)",
    "group": "projects_completed"
  },
  {
    "id": "title_project",
    "label": "Title of Project",
    "type": "text",
    "sample": "e.g., AI for Social Good",
    "group": "projects_completed"
  },
  {
    "id": "sponsored_agency",
    "label": "Sponsored Agency",
    "type": "text",
    "sample": "e.g., UGC",
    "group": "projects_completed"
  },
  {
    "id": "date_completion",
    "label": "Date of Completion",
    "type": "date",
    "sample": "e.g., 2023-08-30",
    "group": "projects_completed"
  },
  {
    "id": "copi",
    "label": "Whether Co-PI",
    "type": "select",
    "options": ["Yes", "No"],
    "sample": "e.g., No",
    "group": "projects_completed"
  },
  {
    "id": "grant_received",
    "label": "Grant Received (Rs)",
    "type": "number",
    "sample": "e.g., 1500000",
    "group": "projects_completed"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 10",
    "group": "projects_completed"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 10",
    "group": "projects_completed"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 19",
    "group": "projects_completed"
  },
  {
    "id": "project_type",
    "label": "Type of Project: A/B",
    "type": "select",
    "options": ["A (>10 lakhs)", "B (<10 lakhs)"],
    "sample": "e.g., A (>10 lakhs)",
    "group": "projects_ongoing"
  },
  {
    "id": "title_project",
    "label": "Title of Project",
    "type": "text",
    "sample": "e.g., AI in Healthcare",
    "group": "projects_ongoing"
  },
  {
    "id": "sponsored_agency",
    "label": "Sponsored Agency",
    "type": "text",
    "sample": "e.g., DST",
    "group": "projects_ongoing"
  },
  {
    "id": "duration",
    "label": "Duration of Project",
    "type": "text",
    "sample": "e.g., 2 years",
    "group": "projects_ongoing"
  },
  {
    "id": "date_starting",
    "label": "Date of Starting",
    "type": "date",
    "sample": "e.g., 2023-09-01",
    "group": "projects_ongoing"
  },
  {
    "id": "copi",
    "label": "Whether Co-PI",
    "type": "select",
    "options": ["Yes", "No"],
    "sample": "e.g., No",
    "group": "projects_ongoing"
  },
  {
    "id": "grant_received",
    "label": "Grant Received (Rs.)",
    "type": "number",
    "sample": "e.g., 2000000",
    "group": "projects_ongoing"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 5",
    "group": "projects_ongoing"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 5",
    "group": "projects_ongoing"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 20",
    "group": "projects_ongoing"
  },
  {
    "id": "title_project",
    "label": "Title of Consultancy Project",
    "type": "text",
    "sample": "e.g., AI Consultancy for XYZ Corp",
    "group": "consultancy"
  },
  {
    "id": "sponsored_agency",
    "label": "Sponsored Agency",
    "type": "text",
    "sample": "e.g., XYZ Corp",
    "group": "consultancy"
  },
  {
    "id": "date_starting",
    "label": "Date of Starting",
    "type": "date",
    "sample": "e.g., 2023-10-01",
    "group": "consultancy"
  },
  {
    "id": "amount_mobilized",
    "label": "Amount Mobilized (Rs. Lakh)",
    "type": "number",
    "sample": "e.g., 5",
    "group": "consultancy"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 3",
    "group": "consultancy"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 3",
    "group": "consultancy"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 21",
    "group": "consultancy"
  },
  {
    "id": "title_patent",
    "label": "Title of patent Project",
    "type": "text",
    "sample": "e.g., AI-Based Diagnostic Tool",
    "group": "patents"
  },
  {
    "id": "patent_number",
    "label": "Patent Number",
    "type": "text",
    "sample": "e.g., IN123456",
    "group": "patents"
  },
  {
    "id": "sponsored_agency",
    "label": "Sponsored Agency if any",
    "type": "text",
    "sample": "e.g., DST",
    "group": "patents"
  },
  {
    "id": "date_award",
    "label": "Date of Award",
    "type": "date",
    "sample": "e.g., 2023-11-15",
    "group": "patents"
  },
  {
    "id": "patent_type",
    "label": "International/ National",
    "type": "select",
    "options": ["International", "National"],
    "sample": "e.g., National",
    "group": "patents"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 7",
    "group": "patents"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 7",
    "group": "patents"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 22",
    "group": "patents"
  },
  {
    "id": "title_policy",
    "label": "Title of Policy Document",
    "type": "text",
    "sample": "e.g., National AI Policy",
    "group": "policy_document"
  },
  {
    "id": "submitted_agency",
    "label": "Name of Submitted Agency",
    "type": "text",
    "sample": "e.g., NITI Aayog",
    "group": "policy_document"
  },
  {
    "id": "document_level",
    "label": "International / National/ State Policy Document",
    "type": "select",
    "options": ["International", "National", "State"],
    "sample": "e.g., National",
    "group": "policy_document"
  },
  {
    "id": "policy_number",
    "label": "Policy Document Number",
    "type": "text",
    "sample": "e.g., POL/2023/001",
    "group": "policy_document"
  },
  {
    "id": "date_acceptance",
    "label": "Date of Acceptance",
    "type": "date",
    "sample": "e.g., 2023-12-20",
    "group": "policy_document"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 4",
    "group": "policy_document"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 4",
    "group": "policy_document"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 23",
    "group": "policy_document"
  },
  {
    "id": "name_award",
    "label": "Name of Award/ Fellowship",
    "type": "text",
    "sample": "e.g., National Science Award",
    "group": "awards_fellowship"
  },
  {
    "id": "date_received",
    "label": "Date of Received",
    "type": "date",
    "sample": "e.g., 2024-01-10",
    "group": "awards_fellowship"
  },
  {
    "id": "award_level",
    "label": "International/ National",
    "type": "select",
    "options": ["International", "National"],
    "sample": "e.g., National",
    "group": "awards_fellowship"
  },
  {
    "id": "awarding_body",
    "label": "Name of Awardees Academic Body/ Association",
    "type": "text",
    "sample": "e.g., Indian Science Congress",
    "group": "awards_fellowship"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 5",
    "group": "awards_fellowship"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 5",
    "group": "awards_fellowship"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 24",
    "group": "awards_fellowship"
  },
  {
    "id": "title_presentation",
    "label": "Title of Presentation in Academic Session",
    "type": "text",
    "sample": "e.g., Future of AI in Education",
    "group": "invited_lectures"
  },
  {
    "id": "title_conference",
    "label": "Title of Conference / Seminar",
    "type": "text",
    "sample": "e.g., International AI Conference 2024",
    "group": "invited_lectures"
  },
  {
    "id": "presentation_mode",
    "label": "Mode of Presentation: Invited lectures / Resource Person / Paper presentation",
    "type": "select",
    "options": ["Invited lectures", "Resource Person", "Paper presentation"],
    "sample": "e.g., Invited lectures",
    "group": "invited_lectures"
  },
  {
    "id": "organizer",
    "label": "Name of Organizer",
    "type": "text",
    "sample": "e.g., IEEE",
    "group": "invited_lectures"
  },
  {
    "id": "conference_level",
    "label": "Whether International (Abroad)/ International (within Country) /National /State / University Level",
    "type": "select",
    "options": [
      "International (Abroad)",
      "International (within Country)",
      "National",
      "State",
      "University Level"
    ],
    "sample": "e.g., International (Abroad)",
    "group": "invited_lectures"
  },
  {
    "id": "self_appraisal_score",
    "label": "Self-Appraisal Score",
    "type": "number",
    "sample": "e.g., 7",
    "group": "invited_lectures"
  },
  {
    "id": "api_score_verified",
    "label": "API Score Verified",
    "type": "number",
    "sample": "e.g., 7",
    "group": "invited_lectures"
  },
  {
    "id": "page_no_documents",
    "label": "Page No. of Relevant Documents",
    "type": "text",
    "sample": "e.g., 25",
    "group": "invited_lectures"
  },
  {
    "id": "enclosures_list",
    "label": "List of Enclosures",
    "type": "textarea",
    "sample": "e.g., Certificates, Letters, Sanction Orders, Papers"
  },
  {
    "id": "faculty_signature_date",
    "label": "Signature of the faculty with Designation - Date",
    "type": "date",
    "sample": "e.g., 2024-05-01"
  },
  {
    "id": "faculty_signature_place",
    "label": "Signature of the faculty with Designation - Place",
    "type": "text",
    "sample": "e.g., Mumbai"
  },
  {
    "id": "faculty_signature_signature",
    "label": "Signature of the faculty with Designation - Signature",
    "type": "signature"
  },
  {
    "id": "hod_signature_date",
    "label": "Head of Department - Date",
    "type": "date",
    "sample": "e.g., 2024-05-02"
  },
  {
    "id": "hod_signature_place",
    "label": "Head of Department - Place",
    "type": "text",
    "sample": "e.g., Mumbai"
  },
  {
    "id": "hod_signature_signature",
    "label": "Head of Department - Signature",
    "type": "signature"
  },
  {
    "id": "iqac_verification_date",
    "label": "Verified by IQAC - Date",
    "type": "date",
    "sample": "e.g., 2024-05-03"
  },
  {
    "id": "iqac_verification_place",
    "label": "Verified by IQAC - Place",
    "type": "text",
    "sample": "e.g., Mumbai"
  },
  {
    "id": "iqac_verification_signature",
    "label": "Verified by IQAC - Signature - Coordinator -IQAC",
    "type": "signature"
  },
  {
    "id": "principal_signature_signature",
    "label": "Signature of Director / Principal - Signature",
    "type": "signature"
  }
];

export default form_llm;