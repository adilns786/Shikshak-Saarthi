const formSchema = {
  "formMetadata": {
    "title": "Self-Assessment-Cum-Performance Appraisal Forms API-PBAS Proforma",
    "references": [
      "The Gazette of India: Extraordinary, Part III Section 4 dated 18th July, 2018",
      "Government of Maharashtra Misc. - 2018.CR 56/18/UNI1 date 8th March, 2019",
      "Government of Maharashtra Misc.- 2018.CR56/18/UNI I date 10th May, 2019"
    ]
  },
  "formHeader": {
    "fields": [
      {
        "id": "institute_name",
        "label": "Name of the Institute / College",
        "type": "text",
        "required": true
      },
      {
        "id": "department_name",
        "label": "Name of the Department",
        "type": "text",
        "required": true
      },
      {
        "id": "cas_promotion_stage",
        "label": "Under CAS Promotion for Stage/Level For",
        "type": "text",
        "required": true
      },
      {
        "id": "faculty_name",
        "label": "Faculty of",
        "type": "text",
        "required": true
      },
      {
        "id": "academic_year",
        "label": "ACADEMIC YEAR",
        "type": "text",
        "required": true
      }
    ]
  },
  "sections": [
    {
      "id": "part_a",
      "title": "PART A: GENERAL INFORMATION AND ACADEMIC BACKGROUND",
      "subsections": [
        {
          "id": "personal_info",
          "title": "Personal Information",
          "fields": [
            {
              "id": "name",
              "label": "Name (in Block Letters)",
              "type": "text",
              "required": true,
              "validation": "uppercase"
            },
            {
              "id": "department",
              "label": "Department",
              "type": "text",
              "required": true
            },
            {
              "id": "current_designation",
              "label": "Current Designation & Academic Level",
              "type": "text",
              "required": true
            },
            {
              "id": "date_last_promotion",
              "label": "Date of last Promotion Current position and Academic",
              "type": "date",
              "required": true
            },
            {
              "id": "current_level_cas",
              "label": "Level of an applicant under CAS",
              "type": "text",
              "required": true
            },
            {
              "id": "designation_applied",
              "label": "The designation and grade pay applied for under CAS",
              "type": "text",
              "required": true
            },
            {
              "id": "date_eligibility",
              "label": "Date of eligibility for promotion",
              "type": "date",
              "required": true
            },
            {
              "id": "address",
              "label": "Address (with Pin code)",
              "type": "textarea",
              "required": true
            },
            {
              "id": "telephone",
              "label": "Telephone/ Mobile No.",
              "type": "tel",
              "required": true
            },
            {
              "id": "email",
              "label": "E-mail",
              "type": "email",
              "required": true
            }
          ]
        },
        {
          "id": "academic_qualifications",
          "title": "Academic Qualifications (from S.S.C. till Post-Graduation)",
          "type": "table",
          "allowMultiple": true,
          "columns": [
            {
              "id": "examination",
              "label": "Examinations",
              "type": "text",
              "required": true
            },
            {
              "id": "board_university",
              "label": "Name of the Board/ University",
              "type": "text",
              "required": true
            },
            {
              "id": "year_passing",
              "label": "Year of Passing",
              "type": "number",
              "required": true
            },
            {
              "id": "percentage",
              "label": "Percentage Of Marks Obtained",
              "type": "number",
              "step": 0.01,
              "required": true
            },
            {
              "id": "division",
              "label": "Division I Class I Grade",
              "type": "text",
              "required": true
            },
            {
              "id": "subject",
              "label": "Subject",
              "type": "text",
              "required": true
            }
          ]
        },
        {
          "id": "research_degrees",
          "title": "Research Degree(s)",
          "type": "table",
          "allowMultiple": true,
          "columns": [
            {
              "id": "degree",
              "label": "Degrees",
              "type": "select",
              "options": ["M. Phil.", "Ph.D. / D. Phil.", "D.Sc. / D.Litt./ Any other"],
              "required": true
            },
            {
              "id": "title",
              "label": "Title",
              "type": "text",
              "required": true
            },
            {
              "id": "date_award",
              "label": "Date of Award",
              "type": "date",
              "required": true
            },
            {
              "id": "university",
              "label": "Name of University",
              "type": "text",
              "required": true
            }
          ]
        },
        {
          "id": "appointments_prior",
          "title": "Appointments held prior-joining this institution",
          "note": "(Please attach relevant certificates of service/ experience)",
          "type": "table",
          "allowMultiple": true,
          "columns": [
            {
              "id": "designation",
              "label": "Designation",
              "type": "text",
              "required": true
            },
            {
              "id": "employer",
              "label": "Name of Employer",
              "type": "text",
              "required": true
            },
            {
              "id": "essential_qualifications",
              "label": "Essential Qualifications for the Post at the time of Appointment",
              "type": "text",
              "required": true
            },
            {
              "id": "nature_appointment",
              "label": "Nature of Appointment (Regular/ Fixed term/ Temporary/ Adhoc)",
              "type": "select",
              "options": ["Regular", "Fixed term", "Temporary", "Adhoc"],
              "required": true
            },
            {
              "id": "nature_duties",
              "label": "Nature of Duties",
              "type": "text",
              "required": true
            },
            {
              "id": "date_joining",
              "label": "Date of Joining",
              "type": "date",
              "required": true
            },
            {
              "id": "date_leaving",
              "label": "Date of Leaving",
              "type": "date",
              "required": true
            },
            {
              "id": "salary_grade",
              "label": "Salary with Grade",
              "type": "text",
              "required": true
            },
            {
              "id": "reason_leaving",
              "label": "Reason of Leaving",
              "type": "text",
              "required": true
            }
          ]
        },
        {
          "id": "posts_current_institution",
          "title": "Posts Held after appointment at this Institution",
          "type": "table",
          "allowMultiple": true,
          "columns": [
            {
              "id": "designation",
              "label": "Designation",
              "type": "text",
              "required": true
            },
            {
              "id": "department",
              "label": "Department",
              "type": "text",
              "required": true
            },
            {
              "id": "date_joining",
              "label": "Date of Joining",
              "type": "date",
              "required": true
            },
            {
              "id": "grade_pay_from",
              "label": "Grade Pay/ Pay Matrix Level From",
              "type": "text",
              "required": true
            },
            {
              "id": "grade_pay_to",
              "label": "To",
              "type": "text",
              "required": true
            }
          ]
        },
        {
          "id": "teaching_experience",
          "title": "Teaching and Research Experience",
          "fields": [
            {
              "id": "pg_classes",
              "label": "Period of teaching experience: P.G. Classes (In Years)",
              "type": "number",
              "step": 0.5,
              "required": true
            },
            {
              "id": "ug_classes",
              "label": "U.G. Classes (In Years)",
              "type": "number",
              "step": 0.5,
              "required": true
            },
            {
              "id": "research_experience",
              "label": "Research Experience excluding Years Spent in M.Phil./Ph.D. (in Years)",
              "type": "number",
              "step": 0.5,
              "required": true
            },
            {
              "id": "specialization_fields",
              "label": "Fields of Specialization under the Subject / Discipline",
              "type": "textarea",
              "required": true
            }
          ]
        },
        {
          "id": "hrd_courses",
          "title": "Human Resource Development Center Orientation / Refresher Course / FDP/ MOOC/ One-Two week Course attended so far",
          "type": "table",
          "allowMultiple": true,
          "columns": [
            {
              "id": "course_name",
              "label": "Name of the Course",
              "type": "text",
              "required": true
            },
            {
              "id": "place",
              "label": "Place",
              "type": "text",
              "required": true
            },
            {
              "id": "duration",
              "label": "Duration",
              "type": "text",
              "required": true
            },
            {
              "id": "organizer",
              "label": "Name of Organizer",
              "type": "text",
              "required": true
            }
          ]
        }
      ],
      "signature": {
        "label": "Name & Signature of Teacher",
        "required": true
      }
    },
    {
      "id": "part_b",
      "title": "PART B: ACADEMIC PERFORMANCE INDICATORS (API)",
      "description": "Based on the teacher's self-assessment, API score are proposed for (1) teaching related activities; domain knowledge; (2) Involvement in University / College student's related activities / research activities. The minimum API score required by teachers from this category is different for different levels of promotion. The self-assessment score should be based on objectively verifiable records. It shall be finalized by the Screening cum Evaluation /Selection Committee. University may detail the activities, incase institutional specificities require, and adjust the weight ages without changing the minimum total API scores required under this category",
      "subsections": [
        {
          "id": "table1",
          "title": "Table 1: Assessment Criteria and Methodology for University/College Teachers",
          "tables": [
            {
              "id": "teaching_activities",
              "title": "1. Teaching",
              "type": "grading_table",
              "rows": [
                {
                  "id": "teaching_percentage",
                  "category": "Teaching",
                  "activity": "Teaching: (Number of classes taught/total classes assigned) x100% (Classes Taught includes sessions on tutorials, lab and other teaching related activities)",
                  "description": "(Teaching: Blackboard Teaching: ICT based Practical /Laboratory Tutorials /Assignments / Project, Field Work Group Discussion, Seminars Remedial! Teaching, Clarifying doubts within and outside the class hours Additional teaching to Support counseling and mentoring)",
                  "unit": "% of Teaching",
                  "grading_criteria": {
                    "good": "80% & Above",
                    "satisfactory": "Below 80% but 70% & Above",
                    "not_satisfactory": "Less than 70%"
                  },
                  "applicable_to": "For Assistant Professor/ Associate Professor/ Professor",
                  "fields": [
                    {
                      "id": "actual_class_spent",
                      "label": "Actual Class spent per Year",
                      "type": "number"
                    },
                    {
                      "id": "total_actual_hours",
                      "label": "Total Actual hours spent",
                      "type": "number"
                    },
                    {
                      "id": "self_appraisal_grading",
                      "label": "Self-Appraisal Grading",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    },
                    {
                      "id": "verified_api_grading",
                      "label": "Verified API Grading by Committee",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    }
                  ]
                }
              ]
            },
            {
              "id": "student_activities",
              "title": "2. Involvement in the University/ College students related activities/ research activities",
              "type": "grading_table",
              "grading_criteria": {
                "good": "80% & Above",
                "satisfactory": "Below 80% but 70% & Above",
                "not_satisfactory": "Less than 70%"
              },
              "applicable_to": "For Assistant Professor/ Associate Professor/ Professor",
              "rows": [
                {
                  "id": "admin_responsibilities",
                  "activity": "Administrative responsibilities such has Head, Chairperson /Dean/Director / IQAC Coordinator/different committees/Warden, etc.",
                  "fields": [
                    {
                      "id": "total_days_spent",
                      "label": "Total days Spent per year",
                      "type": "number"
                    },
                    {
                      "id": "self_appraisal_grading",
                      "label": "Self-Appraisal Grading",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    },
                    {
                      "id": "verified_api_grading",
                      "label": "Verified API Grading by Committee",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    }
                  ]
                },
                {
                  "id": "examination_duties",
                  "activity": "Examination and evaluation duties assigned by the college/ university or attending the examination paper evaluation",
                  "subactivities": [
                    "Question Paper Setting",
                    "Invigilation/Supervision",
                    "Flying Squad",
                    "CS/ACS/Custodian",
                    "CAP Director / Assistant Director",
                    "Unfair Menace Committee",
                    "Grievance Committee",
                    "Internal Assessment",
                    "External Assessment",
                    "Re-valuation",
                    "Result Preparation(College Level for Internal Assessment)",
                    "RRCIRAC Committee",
                    "MPhil.,Ph.D. Thesis evaluation/any other"
                  ],
                  "fields": [
                    {
                      "id": "total_days_spent",
                      "label": "Total days Spent per year",
                      "type": "number"
                    },
                    {
                      "id": "self_appraisal_grading",
                      "label": "Self-Appraisal Grading",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    },
                    {
                      "id": "verified_api_grading",
                      "label": "Verified API Grading by Committee",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    }
                  ]
                },
                {
                  "id": "student_cocurricular",
                  "activity": "Student related co-curricular, extension and field based activities such as student clubs, career counselling, study visits, student seminars and other events, cultural, sports, NCC, NSS and community services",
                  "fields": [
                    {
                      "id": "total_days_spent",
                      "label": "Total days Spent per year",
                      "type": "number"
                    },
                    {
                      "id": "self_appraisal_grading",
                      "label": "Self-Appraisal Grading",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    },
                    {
                      "id": "verified_api_grading",
                      "label": "Verified API Grading by Committee",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    }
                  ]
                },
                {
                  "id": "institutional_governance",
                  "activity": "Institutional! Governance/ Participation in State/Central bodies/Committee on education, Research and National development etc.(Govt. Nominee/Nodal officer/Enquiry committee member/inspection committee member/state Govt. Workshop committee/Govt. CAS Committee/Subject expect/",
                  "fields": [
                    {
                      "id": "total_days_spent",
                      "label": "Total days Spent per year",
                      "type": "number"
                    },
                    {
                      "id": "self_appraisal_grading",
                      "label": "Self-Appraisal Grading",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    },
                    {
                      "id": "verified_api_grading",
                      "label": "Verified API Grading by Committee",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    }
                  ]
                },
                {
                  "id": "organizing_events",
                  "activity": "Organizing seminars/ conferences/workshops, etc. and other college/university Activities",
                  "fields": [
                    {
                      "id": "total_days_spent",
                      "label": "Total days Spent per year",
                      "type": "number"
                    },
                    {
                      "id": "self_appraisal_grading",
                      "label": "Self-Appraisal Grading",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    },
                    {
                      "id": "verified_api_grading",
                      "label": "Verified API Grading by Committee",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    }
                  ]
                },
                {
                  "id": "phd_guidance",
                  "activity": "Evidence of actively involved in guiding Ph.D. students",
                  "fields": [
                    {
                      "id": "registered_candidates",
                      "label": "No. of Registered candidate",
                      "type": "number"
                    },
                    {
                      "id": "awarded_candidates",
                      "label": "No. of Awarded Candidates",
                      "type": "number"
                    },
                    {
                      "id": "self_appraisal_grading",
                      "label": "Self-Appraisal Grading",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    },
                    {
                      "id": "verified_api_grading",
                      "label": "Verified API Grading by Committee",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    }
                  ]
                },
                {
                  "id": "research_projects",
                  "activity": "Conducting Minor or Major Research Project sponsored by national or international agencies",
                  "fields": [
                    {
                      "id": "above_10_lacs",
                      "label": "Above 10 Lacs",
                      "type": "number"
                    },
                    {
                      "id": "below_10_lacs",
                      "label": "Below 10 lacs",
                      "type": "number"
                    },
                    {
                      "id": "self_appraisal_grading",
                      "label": "Self-Appraisal Grading",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    },
                    {
                      "id": "verified_api_grading",
                      "label": "Verified API Grading by Committee",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    }
                  ]
                },
                {
                  "id": "publication",
                  "activity": "At least one single or joint publication in peer-reviewed or UGC list of Journals",
                  "fields": [
                    {
                      "id": "self_appraisal_grading",
                      "label": "Self-Appraisal Grading",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    },
                    {
                      "id": "verified_api_grading",
                      "label": "Verified API Grading by Committee",
                      "type": "select",
                      "options": ["Good", "Satisfactory", "Not satisfactory"]
                    }
                  ]
                }
              ],
              "overall_grading": {
                "good": "Good in teaching and satisfactory or good in activity at S.No.2",
                "satisfactory": "Satisfactory in teaching and good or satisfactory in activity At S.No.2",
                "not_satisfactory": "If neither good nor satisfactory in overall grading"
              },
              "note": "For the purpose of assessing the grading of Activity at Serial No. 1 and Serial No.2, all such periods of duration which have been spent by the teacher on different kinds of paid leaves such as Maternity Leave, Child Care Leave, Study Leave, Medical Leave, Extraordinary Leave and Deputation shall be excluded from the grading assessment. The teacher shall be assessed for the remaining period of duration and the same shall be extrapolated for the entire period of assessment to arrive at the grading of the teacher. The teacher on such leaves or deputation as mentioned above shall not be put to any disadvantage for promotion under CAS due to his/her absence from his/her teaching responsibilities subject to the condition that such leave / deputation was undertaken with the prior approval of the competent authority following all procedures laid down in these regulations and as per the acts, statutes and ordinances of the parent institution"
            }
          ]
        },
        {
          "id": "table2",
          "title": "Table 2: Methodology for Institute Teachers for calculating Academic / Research Score",
          "description": "(Assessment must be based on evidence produced by the teacher such as: copy of publications, project sanction letter, utilization and completion certificates issued by the University and acknowledgements/or patent filing and approval letters, students' Ph.D. award letter, etc.)",
          "note": "Based on the teacher's self-assessment, API scores are proposed for research and academic contributions. The minimum API scores required for teachers from this category are different for different level so promotion in universities and colleges. These self-assessment score shall be based on verifiable records and shall be finalized by the screening cum evaluation committee for the promotion of Assistant Professor to higher grades and Selection Committee for the promotion of Assistant Professor to Associate Professor and Associate Professor to Professor and for direct recruitment of Associate Professor and Professor.",
          "categories": [
            {
              "id": "research_papers",
              "title": "(1) Research Papers in Peer-Reviewed or UGC listed Journals",
              "note": "(Please refer points as per UGC notification)",
              "type": "repeatable_table",
              "allowMultiple": true,
              "columns": [
                {
                  "id": "sr_no",
                  "label": "Sr. No.",
                  "type": "number",
                  "autoIncrement": true
                },
                {
                  "id": "title_paper",
                  "label": "Title Of paper",
                  "type": "text",
                  "required": true
                },
                {
                  "id": "journal_details",
                  "label": "Journal Name, Page nos., Vol. no., Issue no., Year of publication",
                  "type": "text",
                  "required": true
                },
                {
                  "id": "issn_isbn",
                  "label": "ISSN/ ISBN NO.",
                  "type": "text",
                  "required": true
                },
                {
                  "id": "impact_factor",
                  "label": "Impact Factor if any",
                  "type": "number",
                  "step": 0.001
                },
                {
                  "id": "no_coauthors",
                  "label": "No. of Co-Authors",
                  "type": "number"
                },
                {
                  "id": "author_type",
                  "label": "Whether Principal Author Supervisor Co-supervisor",
                  "type": "select",
                  "options": ["Principal Author", "Supervisor", "Co-supervisor", "Co-Author"]
                },
                {
                  "id": "self_appraisal_score",
                  "label": "Self-Appraisal Score",
                  "type": "number"
                },
                {
                  "id": "api_score_verified",
                  "label": "API Score Verified",
                  "type": "number"
                },
                {
                  "id": "page_no_documents",
                  "label": "Page No. Of Relevant Documents",
                  "type": "text"
                }
              ],
              "totalRow": {
                "label": "Total(1)",
                "sumColumns": ["self_appraisal_score", "api_score_verified"]
              }
            },
            {
              "id": "publications_other",
              "title": "(2) Publications (other than Research papers) (Books, Chapters in Books)",
              "subcategories": [
                {
                  "id": "books_published",
                  "title": "(2)(a)(I) Books Published with ISSN/ ISBN number",
                  "scoring": "International Publisher: 12 points per Book for Single Author; National Publisher: 10 points per Book for Single Author, etc. as per Appendix II Table 2 (GR: 8/3/19)",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "title_book",
                      "label": "Title of Book with no. of pages",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "publisher_details",
                      "label": "Publishers name with ISSN/ ISBN NO.",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "publisher_type",
                      "label": "International / National Publisher",
                      "type": "select",
                      "options": ["International", "National"]
                    },
                    {
                      "id": "no_coauthors",
                      "label": "No. of Co-Authors",
                      "type": "number"
                    },
                    {
                      "id": "author_type",
                      "label": "Whether Principal Author/ Co-Author",
                      "type": "select",
                      "options": ["Principal Author", "Co-Author"]
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub Total:(2)(a)(I)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                },
                {
                  "id": "chapters_edited_book",
                  "title": "(2)(a)(ii) Chapter in Edited Book with ISSN/ ISBN",
                  "scoring": "5 points per Chapter",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "title_chapter",
                      "label": "Title of Chapter with Page Nos.",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "book_name",
                      "label": "Name of Book",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "publisher_details",
                      "label": "Publisher Name & ISSN/ ISBN NO.",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "no_coauthors",
                      "label": "No. Of Co-Authors",
                      "type": "number"
                    },
                    {
                      "id": "author_type",
                      "label": "Whether Principal Author / Co-Author",
                      "type": "select",
                      "options": ["Principal Author", "Co-Author"]
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub Total:(2)(a)(ii)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                },
                {
                  "id": "editor_book",
                  "title": "(2)(a)(iii) Editor of Book with ISSN/ISBN number",
                  "scoring": "Editor of Book by international Publisher: 10 points per Book for Single Author; Editor of Book by National Publisher: 8 points per Book for Single Author",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "title_book",
                      "label": "Title of Book with Page Nos.",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "publisher_details",
                      "label": "Publisher Name & ISSN/ ISBN NO.",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "publisher_type",
                      "label": "International/ National Publisher",
                      "type": "select",
                      "options": ["International", "National"]
                    },
                    {
                      "id": "no_coauthors",
                      "label": "No. of Co-Authors",
                      "type": "number"
                    },
                    {
                      "id": "author_type",
                      "label": "Whether Principal Author/ Co-Author",
                      "type": "select",
                      "options": ["Principal Author", "Co-Author"]
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub Total (2)(a)(iii)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                },
                {
                  "id": "translation_works",
                  "title": "(2)(b) Translation works in Indian and Foreign Languages by qualified faculties",
                  "scoring": "3 points per Chapter or Research paper",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "original_title",
                      "label": "Original Title of Chapter or Research paper / Book with Page Nos. ISSN / ISBN NO.",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "original_author",
                      "label": "Name Of Original Author",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "translated_title",
                      "label": "Translated Title of Chapter or Research paper /Book with Page Nos. ISSN / ISBN NO.",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "no_translated_coauthors",
                      "label": "No. of Translated Co-Authors",
                      "type": "number"
                    },
                    {
                      "id": "author_type",
                      "label": "Whether Principal Author/ Co-Author",
                      "type": "select",
                      "options": ["Principal Author", "Co-Author"]
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub Total(2)(b)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                }
              ],
              "grandTotal": {
                "label": "Total(2): (2)(a)(i)+ (2)(a)(ii)+(2)(a)(iii)+(2)(b)",
                "sumColumns": ["self_appraisal_score", "api_score_verified"]
              }
            },
            {
              "id": "ict_pedagogy",
              "title": "(3) Creation of ICT mediated Teaching Learning pedagogy and content and development of new and innovative courses and curricula",
              "subcategories": [
                {
                  "id": "innovative_pedagogy",
                  "title": "(3)(a) Development of Innovative pedagogy",
                  "scoring": "5 points per innovative pedagogy",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "title_pedagogy",
                      "label": "Title of innovative pedagogy",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "sponsored_agency",
                      "label": "Sponsored Agency if any",
                      "type": "text"
                    },
                    {
                      "id": "teaching_environment",
                      "label": "Types of Teaching-Learning Environments",
                      "type": "select",
                      "options": ["Face-to-face", "Networked", "Open and distance", "Virtual"],
                      "allowMultiple": true
                    },
                    {
                      "id": "ict_resources",
                      "label": "Specify ICT's resources: web link: YouTube Videos-Audios / Smart Classroom/ Simulation Games/ Blogging/ Online Discussion Forums / Virtual Laboratories / Telecast / Picture/ Models /Charts if any",
                      "type": "textarea"
                    },
                    {
                      "id": "date_approval",
                      "label": "Date of Approval from Authority",
                      "type": "date"
                    },
                    {
                      "id": "date_implementation",
                      "label": "Date of Implementation",
                      "type": "date"
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub total(3)(a)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                },
                {
                  "id": "new_curricular",
                  "title": "(3)(b) Design of new curricular and courses",
                  "scoring": "02 points per curricula / Course",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "programme_name",
                      "label": "Name of Programme curricular introduced",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "title_curricular",
                      "label": "Title of new curricular and courses",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "ict_resources",
                      "label": "Specify ICTs resources: web link / Youtube link: Audio Video/ Telecast / Picture/ Models / Charts if any",
                      "type": "textarea"
                    },
                    {
                      "id": "date_approval",
                      "label": "Date of approval from authority",
                      "type": "date"
                    },
                    {
                      "id": "date_implementation",
                      "label": "Date of Implementation",
                      "type": "date"
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Subtotal(3)(b)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                },
                {
                  "id": "moocs",
                  "title": "(3)(c) MOOCs",
                  "subsubcategories": [
                    {
                      "id": "moocs_complete",
                      "title": "(3)(c)(i) Development of complete MOOCs in 4 quadrants (4 credit course)",
                      "scoring": "20 per curricula /Course (In case of MOOCs of lesser credits 05 marks/credit)",
                      "type": "repeatable_table",
                      "allowMultiple": true,
                      "columns": [
                        {
                          "id": "sr_no",
                          "label": "Sr. No.",
                          "type": "number",
                          "autoIncrement": true
                        },
                        {
                          "id": "programme_name",
                          "label": "Name of Programme where curricular introduced",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "course_credits",
                          "label": "Course Credits",
                          "type": "number"
                        },
                        {
                          "id": "title_mooc",
                          "label": "Title of new MOOC Curricular",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "ict_resources",
                          "label": "Specify ICTs resources: web link/ Youtube link: Audio Video/ Telecast/ Picture/ Models/Charts If any",
                          "type": "textarea"
                        },
                        {
                          "id": "date_approval",
                          "label": "Date of approval from authority if any",
                          "type": "date"
                        },
                        {
                          "id": "date_implementation",
                          "label": "Date Of Implementation",
                          "type": "date"
                        },
                        {
                          "id": "self_appraisal_score",
                          "label": "Self-Appraisal Score",
                          "type": "number"
                        },
                        {
                          "id": "api_score_verified",
                          "label": "API Score Verified",
                          "type": "number"
                        },
                        {
                          "id": "page_no_documents",
                          "label": "Page No. of Relevant Documents",
                          "type": "text"
                        }
                      ],
                      "totalRow": {
                        "label": "Subtotal(3)(c)(i)",
                        "sumColumns": ["self_appraisal_score", "api_score_verified"]
                      }
                    },
                    {
                      "id": "moocs_module",
                      "title": "(3)(c)(ii) MOOCs (developed in 4 quadrant) per module/ lecture",
                      "scoring": "5 points per module/lecture",
                      "type": "repeatable_table",
                      "allowMultiple": true,
                      "columns": [
                        {
                          "id": "sr_no",
                          "label": "Sr. No.",
                          "type": "number",
                          "autoIncrement": true
                        },
                        {
                          "id": "programme_course_name",
                          "label": "Name of Programme & Course where curricula introduced",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "course_credits",
                          "label": "Course Credits",
                          "type": "number"
                        },
                        {
                          "id": "title_mooc",
                          "label": "Title of new MOOC curricula",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "ict_resources",
                          "label": "Specify ICTs resources: web link / Youtube link: Audio Video / Telecast/ Picture/ Models/Charts If any",
                          "type": "textarea"
                        },
                        {
                          "id": "date_approval",
                          "label": "Date of approval from authority",
                          "type": "date"
                        },
                        {
                          "id": "date_implementation",
                          "label": "Date of Implementation",
                          "type": "date"
                        },
                        {
                          "id": "self_appraisal_score",
                          "label": "Self-Appraisal Score",
                          "type": "number"
                        },
                        {
                          "id": "api_score_verified",
                          "label": "API Score Verified",
                          "type": "number"
                        },
                        {
                          "id": "page_no_documents",
                          "label": "Page No. of Relevant Documents",
                          "type": "text"
                        }
                      ],
                      "totalRow": {
                        "label": "Subtotal(3)(c)(ii)",
                        "sumColumns": ["self_appraisal_score", "api_score_verified"]
                      }
                    },
                    {
                      "id": "moocs_content_writer",
                      "title": "(3)(c)(iii) Content writer/ subject matter expert for each module of MOOCs (at least one quadrant)",
                      "scoring": "2 points per Curricula/Course",
                      "type": "repeatable_table",
                      "allowMultiple": true,
                      "columns": [
                        {
                          "id": "sr_no",
                          "label": "Sr. No.",
                          "type": "number",
                          "autoIncrement": true
                        },
                        {
                          "id": "programme_course_name",
                          "label": "Name of Programme & Course where Content is introduced",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "course_credits",
                          "label": "Course Credits",
                          "type": "number"
                        },
                        {
                          "id": "title_content",
                          "label": "Title of new MOOC Content curricular",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "ict_resources",
                          "label": "Specify ICTs resources: web link/ Youtube link: Audio Video/ Telecast/",
                          "type": "textarea"
                        },
                        {
                          "id": "date_approval",
                          "label": "Date of approval from authority",
                          "type": "date"
                        },
                        {
                          "id": "date_implementation",
                          "label": "Date of Implementation",
                          "type": "date"
                        },
                        {
                          "id": "self_appraisal_score",
                          "label": "Self-Appraisal Score",
                          "type": "number"
                        },
                        {
                          "id": "api_score_verified",
                          "label": "API Score Verified",
                          "type": "number"
                        },
                        {
                          "id": "page_no_documents",
                          "label": "Page No. of Relevant Documents",
                          "type": "text"
                        }
                      ],
                      "totalRow": {
                        "label": "Subtotal(3)(c)(iii)",
                        "sumColumns": ["self_appraisal_score", "api_score_verified"]
                      }
                    },
                    {
                      "id": "moocs_coordinator",
                      "title": "(3)(c)(iv) Course Coordinator for MOOCs (4 credit course)",
                      "scoring": "8 Points per curricula / Course (In case of MOOCs of lesser credits 02 marks / credit)",
                      "type": "repeatable_table",
                      "allowMultiple": true,
                      "columns": [
                        {
                          "id": "sr_no",
                          "label": "Sr. No.",
                          "type": "number",
                          "autoIncrement": true
                        },
                        {
                          "id": "programme_course_name",
                          "label": "Name of Programme & Course",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "course_credits",
                          "label": "Course Credits",
                          "type": "number"
                        },
                        {
                          "id": "title_mooc",
                          "label": "Title of MOOC curricula",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "ict_resources",
                          "label": "Specify ICTs resources: web link / Youtube link: Audio Video/ Telecast/ Picture / Models / Charts if any",
                          "type": "textarea"
                        },
                        {
                          "id": "date_approval",
                          "label": "Date of approval from authority",
                          "type": "date"
                        },
                        {
                          "id": "date_implementation",
                          "label": "Date of Implementation",
                          "type": "date"
                        },
                        {
                          "id": "self_appraisal_score",
                          "label": "Self-Appraisal Score",
                          "type": "number"
                        },
                        {
                          "id": "api_score_verified",
                          "label": "API Score Verified",
                          "type": "number"
                        },
                        {
                          "id": "page_no_documents",
                          "label": "Page No. of Relevant Documents",
                          "type": "text"
                        }
                      ],
                      "totalRow": {
                        "label": "Sub Total (3)(c)(iv)",
                        "sumColumns": ["self_appraisal_score", "api_score_verified"]
                      }
                    }
                  ],
                  "grandTotal": {
                    "label": "Total(3)(c): (3)(c)(i)+(3)(c)(ii)+(3)(c)(iii)+(3)(c)(iv)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                },
                {
                  "id": "econtent",
                  "title": "(3)(d) E-Content",
                  "subsubcategories": [
                    {
                      "id": "econtent_complete",
                      "title": "(3)(d)(i) Development of e-Content in 4 quadrants for a complete course/e-book",
                      "scoring": "12 Points per curricula / Course",
                      "type": "repeatable_table",
                      "allowMultiple": true,
                      "columns": [
                        {
                          "id": "sr_no",
                          "label": "Sr. No.",
                          "type": "number",
                          "autoIncrement": true
                        },
                        {
                          "id": "title_econtent",
                          "label": "Title of e-Content course/ e-book with no. of pages",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "programme_course",
                          "label": "Name of Programme & Course to which Introduced",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "ict_resources",
                          "label": "Specify ICTs Resources: web link",
                          "type": "text"
                        },
                        {
                          "id": "peer_reviewed",
                          "label": "Whether Peer reviewed",
                          "type": "select",
                          "options": ["Yes", "No"]
                        },
                        {
                          "id": "no_coauthors",
                          "label": "No. of Co Authors",
                          "type": "number"
                        },
                        {
                          "id": "author_type",
                          "label": "Whether Principal Author / Co-Author",
                          "type": "select",
                          "options": ["Principal Author", "Co-Author"]
                        },
                        {
                          "id": "self_appraisal_score",
                          "label": "Self-Appraisal Score",
                          "type": "number"
                        },
                        {
                          "id": "api_score_verified",
                          "label": "API Score Verified",
                          "type": "number"
                        },
                        {
                          "id": "page_no_documents",
                          "label": "Page No. of Relevant Documents",
                          "type": "text"
                        }
                      ],
                      "totalRow": {
                        "label": "Sub Total:(3)(d)(i)",
                        "sumColumns": ["self_appraisal_score", "api_score_verified"]
                      }
                    },
                    {
                      "id": "econtent_module",
                      "title": "(3)(d)(ii) e-Content (developed in 4 quadrants per module / Course)",
                      "scoring": "5 points per Module / Course",
                      "type": "repeatable_table",
                      "allowMultiple": true,
                      "columns": [
                        {
                          "id": "sr_no",
                          "label": "Sr. No.",
                          "type": "number",
                          "autoIncrement": true
                        },
                        {
                          "id": "title_econtent",
                          "label": "Title of e content / e-module with no. of pages, ISSN/ISBN No. If any",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "programme_course",
                          "label": "Name of Programme & Course to which introduced",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "ict_resources",
                          "label": "Specify ICTs resources: web link",
                          "type": "text"
                        },
                        {
                          "id": "peer_reviewed",
                          "label": "Whether Peer reviewed",
                          "type": "select",
                          "options": ["Yes", "No"]
                        },
                        {
                          "id": "no_coauthors",
                          "label": "No. of Co-Authors",
                          "type": "number"
                        },
                        {
                          "id": "author_type",
                          "label": "Whether Principal Author/ Co-Author",
                          "type": "select",
                          "options": ["Principal Author", "Co-Author"]
                        },
                        {
                          "id": "self_appraisal_score",
                          "label": "Self-appraisal Score",
                          "type": "number"
                        },
                        {
                          "id": "api_score_verified",
                          "label": "API Score Verified",
                          "type": "number"
                        },
                        {
                          "id": "page_no_documents",
                          "label": "Page. No. of Relevant Documents",
                          "type": "text"
                        }
                      ],
                      "totalRow": {
                        "label": "Sub Total:(3)(d)(ii)",
                        "sumColumns": ["self_appraisal_score", "api_score_verified"]
                      }
                    },
                    {
                      "id": "econtent_contribution",
                      "title": "(3)(d)(iii) Contribution to development of e-Content module in complete course / paper / e–book (At least one quadrant)",
                      "scoring": "2 points per module / Course",
                      "type": "repeatable_table",
                      "allowMultiple": true,
                      "columns": [
                        {
                          "id": "sr_no",
                          "label": "Sr. No.",
                          "type": "number",
                          "autoIncrement": true
                        },
                        {
                          "id": "programme_course",
                          "label": "Name of Programme & Course where Content is introduced",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "course_credits",
                          "label": "Course Credits",
                          "type": "number"
                        },
                        {
                          "id": "title_content",
                          "label": "Title of new MOOC Content curricular",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "ict_resources",
                          "label": "Specify ICTs resources: web link / Youtube link: Audio Video/ Telecast/ Picture/ Models/Charts If any",
                          "type": "textarea"
                        },
                        {
                          "id": "date_approval",
                          "label": "Date of approval from authority",
                          "type": "date"
                        },
                        {
                          "id": "date_implementation",
                          "label": "Date of Implementation",
                          "type": "date"
                        },
                        {
                          "id": "self_appraisal_score",
                          "label": "Self-Appraisal Score",
                          "type": "number"
                        },
                        {
                          "id": "api_score_verified",
                          "label": "API Score Verified",
                          "type": "number"
                        },
                        {
                          "id": "page_no_documents",
                          "label": "Page No. of Relevant Documents",
                          "type": "text"
                        }
                      ],
                      "totalRow": {
                        "label": "Sub Total(3)(d)(iii)",
                        "sumColumns": ["self_appraisal_score", "api_score_verified"]
                      }
                    },
                    {
                      "id": "econtent_editor",
                      "title": "(3)(d)(iv) Editor of e-content for complete course/paper/e-book",
                      "scoring": "10 points per Course / paper",
                      "type": "repeatable_table",
                      "allowMultiple": true,
                      "columns": [
                        {
                          "id": "sr_no",
                          "label": "Sr. No.",
                          "type": "number",
                          "autoIncrement": true
                        },
                        {
                          "id": "title_econtent",
                          "label": "Title of e-Content Course with no. of pages, ISSN/ ISBN NO. If any",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "programme_course",
                          "label": "Name of Programme & Course to which introduced",
                          "type": "text",
                          "required": true
                        },
                        {
                          "id": "ict_resources",
                          "label": "Specify ICTs resources: web link",
                          "type": "text"
                        },
                        {
                          "id": "peer_reviewed",
                          "label": "Whether Peer reviewed",
                          "type": "select",
                          "options": ["Yes", "No"]
                        },
                        {
                          "id": "no_coeditors",
                          "label": "No. of Co-Editors",
                          "type": "number"
                        },
                        {
                          "id": "self_appraisal_score",
                          "label": "Self-Appraisal Score",
                          "type": "number"
                        },
                        {
                          "id": "api_score_verified",
                          "label": "API Score Verified",
                          "type": "number"
                        },
                        {
                          "id": "page_no_documents",
                          "label": "Page No. of Relevant Documents",
                          "type": "text"
                        }
                      ],
                      "totalRow": {
                        "label": "Sub Total:(3)(d)(iv)",
                        "sumColumns": ["self_appraisal_score", "api_score_verified"]
                      }
                    }
                  ],
                  "grandTotal": {
                    "label": "Total(3)(d): (3)(d)(i)+(3)(d)(ii)+(3)(d)(iii)+(3)(d)(iv)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                }
              ],
              "grandTotal": {
                "label": "Total(3): (3)(a)+(3)(b)+(3)(c)+ (3)(d)",
                "sumColumns": ["self_appraisal_score", "api_score_verified"]
              }
            },
            {
              "id": "research_score",
              "title": "(4) Research Score",
              "subcategories": [
                {
                  "id": "research_guidance",
                  "title": "(4)(a) Research Guidance",
                  "scoring": "Ph.D.: 10 points degree awarded & 05 per thesis submitted; M.Phil./P.G dissertation: 2 points per degree rewarded",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "rows": [
                    {
                      "id": "mphil_pg",
                      "label": "M.Phil. / P.G. Dissertation"
                    },
                    {
                      "id": "phd",
                      "label": "Ph.D."
                    }
                  ],
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "degree_type",
                      "label": "Sr. No.",
                      "type": "text",
                      "readonly": true
                    },
                    {
                      "id": "candidates_enrolled",
                      "label": "Number of Candidate Enrolled",
                      "type": "number"
                    },
                    {
                      "id": "thesis_submitted",
                      "label": "No. of Thesis Submitted with dates",
                      "type": "text"
                    },
                    {
                      "id": "degree_awarded",
                      "label": "No. of and date Degree Awarded with dates",
                      "type": "text"
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub Total:(4)(a)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                },
                {
                  "id": "projects_completed",
                  "title": "(4)(b) Research Projects Completed",
                  "scoring": "A: More than 10 lakhs (10 points per Project); B: Less than 10 lakhs (5 points per Project)",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "project_type",
                      "label": "Type of Project: A / B",
                      "type": "select",
                      "options": ["A (>10 lakhs)", "B (<10 lakhs)"]
                    },
                    {
                      "id": "title_project",
                      "label": "Title of Project",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "sponsored_agency",
                      "label": "Sponsored Agency",
                      "type": "text"
                    },
                    {
                      "id": "date_completion",
                      "label": "Date of Completion",
                      "type": "date"
                    },
                    {
                      "id": "copi",
                      "label": "Whether Co-PI",
                      "type": "select",
                      "options": ["Yes", "No"]
                    },
                    {
                      "id": "grant_received",
                      "label": "Grant Received (Rs)",
                      "type": "number"
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub Total:(4)(b)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                },
                {
                  "id": "projects_ongoing",
                  "title": "(4)(c) Research Projects Ongoing",
                  "scoring": "A: More than 10 lakhs (5 points per Project); B: Less than 10 lakhs (2 points per Project)",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "project_type",
                      "label": "Type of Project: A/B",
                      "type": "select",
                      "options": ["A (>10 lakhs)", "B (<10 lakhs)"]
                    },
                    {
                      "id": "title_project",
                      "label": "Title of Project",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "sponsored_agency",
                      "label": "Sponsored Agency",
                      "type": "text"
                    },
                    {
                      "id": "duration",
                      "label": "Duration of Project",
                      "type": "text"
                    },
                    {
                      "id": "date_starting",
                      "label": "Date of Starting",
                      "type": "date"
                    },
                    {
                      "id": "copi",
                      "label": "Whether Co-PI",
                      "type": "select",
                      "options": ["Yes", "No"]
                    },
                    {
                      "id": "grant_received",
                      "label": "Grant Received (Rs.)",
                      "type": "number"
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub Total :(4)(c)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                },
                {
                  "id": "consultancy",
                  "title": "(4)(d) Consultancy",
                  "scoring": "3 points per Consultancy Project",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "title_project",
                      "label": "Title of Consultancy Project",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "sponsored_agency",
                      "label": "Sponsored Agency",
                      "type": "text"
                    },
                    {
                      "id": "date_starting",
                      "label": "Date of Starting",
                      "type": "date"
                    },
                    {
                      "id": "amount_mobilized",
                      "label": "Amount Mobilized (Rs. Lakh)",
                      "type": "number",
                      "step": 0.01
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub Total:(4)(d)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                }
              ],
              "grandTotal": {
                "label": "Total(4): (4)(a)+(4)(b)+(4)(c)+(4)(d)",
                "sumColumns": ["self_appraisal_score", "api_score_verified"]
              }
            },
            {
              "id": "patents_policy_awards",
              "title": "(5) Patents / Policy Document / Awards / Fellowship",
              "subcategories": [
                {
                  "id": "patents",
                  "title": "(5)(a) Patents",
                  "scoring": "10 points per International Patent and 7 points per National Patent",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "title_patent",
                      "label": "Title of patent Project",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "patent_number",
                      "label": "Patent Number",
                      "type": "text"
                    },
                    {
                      "id": "sponsored_agency",
                      "label": "Sponsored Agency if any",
                      "type": "text"
                    },
                    {
                      "id": "date_award",
                      "label": "Date of Award",
                      "type": "date"
                    },
                    {
                      "id": "patent_type",
                      "label": "International/ National",
                      "type": "select",
                      "options": ["International", "National"]
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub Total:(5)(a)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                },
                {
                  "id": "policy_document",
                  "title": "(5)(b) Policy Document (Submitted to an international Body / Organization like UNO /UNESCO/World Bank/ International Monetary Fund etc. or Central Government or State Government)",
                  "scoring": "A: International (10 points per Policy Document); B: National (7 points per Policy Document); C: State (4 points per Policy Document)",
                  "note": "Marked with * for upper capping calculation",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "title_policy",
                      "label": "Title of Policy Document",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "submitted_agency",
                      "label": "Name of Submitted Agency",
                      "type": "text"
                    },
                    {
                      "id": "document_level",
                      "label": "International / National/ State Policy Document",
                      "type": "select",
                      "options": ["International", "National", "State"]
                    },
                    {
                      "id": "policy_number",
                      "label": "Policy Document Number",
                      "type": "text"
                    },
                    {
                      "id": "date_acceptance",
                      "label": "Date of Acceptance",
                      "type": "date"
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub Total:(5)(b)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                },
                {
                  "id": "awards_fellowship",
                  "title": "(5)(c) Awards / Fellowship",
                  "scoring": "A: International (7 points per Awards/Fellowship); B: National (5 points per Awards/Fellowship)",
                  "type": "repeatable_table",
                  "allowMultiple": true,
                  "columns": [
                    {
                      "id": "sr_no",
                      "label": "Sr. No.",
                      "type": "number",
                      "autoIncrement": true
                    },
                    {
                      "id": "name_award",
                      "label": "Name of Award/ Fellowship",
                      "type": "text",
                      "required": true
                    },
                    {
                      "id": "date_received",
                      "label": "Date of Received",
                      "type": "date"
                    },
                    {
                      "id": "award_level",
                      "label": "International/ National",
                      "type": "select",
                      "options": ["International", "National"]
                    },
                    {
                      "id": "awarding_body",
                      "label": "Name of Awardees Academic Body/ Association",
                      "type": "text"
                    },
                    {
                      "id": "self_appraisal_score",
                      "label": "Self-Appraisal Score",
                      "type": "number"
                    },
                    {
                      "id": "api_score_verified",
                      "label": "API Score Verified",
                      "type": "number"
                    },
                    {
                      "id": "page_no_documents",
                      "label": "Page No. of Relevant Documents",
                      "type": "text"
                    }
                  ],
                  "totalRow": {
                    "label": "Sub Total:(5)(c)",
                    "sumColumns": ["self_appraisal_score", "api_score_verified"]
                  }
                }
              ],
              "grandTotal": {
                "label": "Total(5): (5)(a)+(5)(b)+(5)(c)",
                "sumColumns": ["self_appraisal_score", "api_score_verified"]
              }
            },
            {
              "id": "invited_lectures",
              "title": "(6) Invited lectures /Resource Person /paper presentation in Seminars /Conferences/full paper in Conference Proceedings",
              "note": "(Paper presented in Seminars/ Conferences and also published as full paper in Conference Proceedings will be counted only once). Marked with * for upper capping calculation",
              "scoring": "International (Abroad): 7 points per Seminars /Conferences; International (within Country): 5 points per Seminars/Conferences; National: 3 points per Seminars /Conferences; State/University Level: 2 points per Seminars/Conferences",
              "type": "repeatable_table",
              "allowMultiple": true,
              "columns": [
                {
                  "id": "sr_no",
                  "label": "Sr. No.",
                  "type": "number",
                  "autoIncrement": true
                },
                {
                  "id": "title_presentation",
                  "label": "Title of Presentation in Academic Session",
                  "type": "text",
                  "required": true
                },
                {
                  "id": "title_conference",
                  "label": "Title of Conference / Seminar",
                  "type": "text",
                  "required": true
                },
                {
                  "id": "presentation_mode",
                  "label": "Mode of Presentation: Invited lectures / Resource Person / Paper presentation",
                  "type": "select",
                  "options": ["Invited lectures", "Resource Person", "Paper presentation"]
                },
                {
                  "id": "organizer",
                  "label": "Name of Organizer",
                  "type": "text"
                },
                {
                  "id": "conference_level",
                  "label": "Whether International (Abroad)/ International (within Country) /National /State / University Level",
                  "type": "select",
                  "options": ["International (Abroad)", "International (within Country)", "National", "State", "University Level"]
                },
                {
                  "id": "self_appraisal_score",
                  "label": "Self-Appraisal Score",
                  "type": "number"
                },
                {
                  "id": "api_score_verified",
                  "label": "API Score Verified",
                  "type": "number"
                },
                {
                  "id": "page_no_documents",
                  "label": "Page No. of Relevant Documents",
                  "type": "text"
                }
              ],
              "totalRow": {
                "label": "Total(6)",
                "sumColumns": ["self_appraisal_score", "api_score_verified"]
              }
            }
          ],
          "scoringNotes": [
            {
              "title": "Research Score Calculation",
              "content": "The Research score for research papers would be augmented as follows: Peer-Reviewed or UGC-listed Journals (Impact factor to be determined as per Thomson Reuters): i) Paper in refereed journals without impact factor-5 Points ii) Paper with impact factor less than 1 -10 Points iii) Paper with impact factor between 1 and 2 -15 Points iv) Paper with impact factor between 2 and 5 -20 Points v) Paper with impact factor between 5 and 10 – 25 Points vi) Paper with impact factor >10-30 Points"
            },
            {
              "title": "Multiple Authors",
              "content": "a) Two authors: 70% of total value of publication for each author. b) More than two authors: 70% of total value of publication for the First /Principal /Corresponding author and 30% of total value of publication for each of the joint authors."
            },
            {
              "title": "Joint Projects",
              "content": "Principal investigator and Co-investigator would get 50% each."
            },
            {
              "title": "Additional Notes",
              "content": "Paper presented if part of edited book or proceeding then it can be claimed only once. For joint supervision of research students, the formula shall be 70% of the total score for Supervisor and Co-supervisor. Supervisor and Co-supervisor, both shall get 7 marks each."
            },
            {
              "title": "Upper Capping Rule",
              "content": "*For the purpose of calculating research score of the teacher, the combined research score from the categories of 5(b).Policy Document and 6.Invited lectures/Resource Person /Paper presentation shall have an upper capping of thirty percent of the total research score of the teacher concerned. The research score shall be from the minimum of three categories out of six categories."
            }
          ],
          "summaryTable": {
            "title": "Summary of Table 2 - Academic / Research Score",
            "rows": [
              {
                "id": "research_papers_summary",
                "label": "(1) Research Papers in Peer-Reviewed or UGC listed Journals",
                "fields": [
                  {
                    "id": "self_appraisal_score",
                    "label": "Self-Appraisal Score",
                    "type": "number",
                    "readonly": true,
                    "calculateFrom": "research_papers"
                  },
                  {
                    "id": "api_score_verified",
                    "label": "API Score Verified by Committee",
                    "type": "number"
                  },
                  {
                    "id": "remarks",
                    "label": "Remarks",
                    "type": "text"
                  }
                ]
              },
              {
                "id": "publications_summary",
                "label": "(2) Publications (other than Research papers)",
                "fields": [
                  {
                    "id": "self_appraisal_score",
                    "label": "Self-Appraisal Score",
                    "type": "number",
                    "readonly": true,
                    "calculateFrom": "publications_other"
                  },
                  {
                    "id": "api_score_verified",
                    "label": "API Score Verified by Committee",
                    "type": "number"
                  },
                  {
                    "id": "remarks",
                    "label": "Remarks",
                    "type": "text"
                  }
                ]
              },
              {
                "id": "ict_summary",
                "label": "(3) Creation of ICT mediated Teaching Learning pedagogy and content and development of new and innovative courses And curricula",
                "fields": [
                  {
                    "id": "self_appraisal_score",
                    "label": "Self-Appraisal Score",
                    "type": "number",
                    "readonly": true,
                    "calculateFrom": "ict_pedagogy"
                  },
                  {
                    "id": "api_score_verified",
                    "label": "API Score Verified by Committee",
                    "type": "number"
                  },
                  {
                    "id": "remarks",
                    "label": "Remarks",
                    "type": "text"
                  }
                ]
              },
              {
                "id": "research_guidance_summary",
                "label": "(4) Research guidance / Projects Completed / Projects Ongoing /Consultancy",
                "fields": [
                  {
                    "id": "self_appraisal_score",
                    "label": "Self-Appraisal Score",
                    "type": "number",
                    "readonly": true,
                    "calculateFrom": "research_score"
                  },
                  {
                    "id": "api_score_verified",
                    "label": "API Score Verified by Committee",
                    "type": "number"
                  },
                  {
                    "id": "remarks",
                    "label": "Remarks",
                    "type": "text"
                  }
                ]
              },
              {
                "id": "patents_summary",
                "label": "(5) Patents /Policy Document / Awards / Fellowship",
                "fields": [
                  {
                    "id": "self_appraisal_score",
                    "label": "Self-Appraisal Score",
                    "type": "number",
                    "readonly": true,
                    "calculateFrom": "patents_policy_awards"
                  },
                  {
                    "id": "api_score_verified",
                    "label": "API Score Verified by Committee",
                    "type": "number"
                  },
                  {
                    "id": "remarks",
                    "label": "Remarks",
                    "type": "text"
                  }
                ]
              },
              {
                "id": "invited_lectures_summary",
                "label": "(6) Invited lectures / Resource Person / paper presentation in Seminars / Conferences/ full paper in Conference Proceedings",
                "fields": [
                  {
                    "id": "self_appraisal_score",
                    "label": "Self-Appraisal Score",
                    "type": "number",
                    "readonly": true,
                    "calculateFrom": "invited_lectures"
                  },
                  {
                    "id": "api_score_verified",
                    "label": "API Score Verified by Committee",
                    "type": "number"
                  },
                  {
                    "id": "remarks",
                    "label": "Remarks",
                    "type": "text"
                  }
                ]
              }
            ],
            "grandTotal": {
              "label": "Grand Total of Table 2",
              "sumColumns": ["self_appraisal_score", "api_score_verified"]
            }
          }
        }
      ]
    },
    {
      "id": "summary",
      "title": "IV SUMMARY OF API SCORES",
      "table": {
        "rows": [
          {
            "id": "table1_summary",
            "category": "Table 1",
            "criteria": "Activities: Over all Grading",
            "subcriteria": [
              "1. Teaching",
              "2. Involvement in the University/College students related activities/research activities"
            ],
            "fields": [
              {
                "id": "annual_api_score",
                "label": "Annual API Score",
                "type": "text"
              }
            ]
          },
          {
            "id": "table2_summary",
            "category": "Table 2",
            "criteria": "Academic/Research Score",
            "fields": [
              {
                "id": "annual_api_score",
                "label": "Annual API Score",
                "type": "number",
                "readonly": true,
                "calculateFrom": "table2_grand_total"
              }
            ]
          }
        ]
      }
    },
    {
      "id": "enclosures",
      "title": "List of Enclosures",
      "description": "(Please attach copies of certificates and/or letters sanction orders, papers etc. wherever Necessary)",
      "field": {
        "id": "enclosures_list",
        "type": "textarea",
        "rows": 10
      }
    }
  ],
  "undertakings": {
    "title": "UNDERTAKING",
    "content": "I Dr /Mr./Mrs.....................Under takes that the information provided is correct as per Institute Records and documents submitted by me to Proforma enclosed along with the duly filled in _____________ PBAS",
    "signatures": [
      {
        "id": "faculty_signature",
        "label": "Signature of the faculty with Designation",
        "fields": [
          {
            "id": "date",
            "label": "Date",
            "type": "date",
            "required": true
          },
          {
            "id": "place",
            "label": "Place",
            "type": "text",
            "required": true
          },
          {
            "id": "signature",
            "label": "Signature",
            "type": "signature",
            "required": true
          }
        ]
      },
      {
        "id": "hod_signature",
        "label": "Head of Department",
        "fields": [
          {
            "id": "date",
            "label": "Date",
            "type": "date",
            "required": true
          },
          {
            "id": "place",
            "label": "Place",
            "type": "text",
            "required": true
          },
          {
            "id": "signature",
            "label": "Signature",
            "type": "signature",
            "required": true
          }
        ]
      },
      {
        "id": "iqac_verification",
        "label": "Verified by IQAC",
        "fields": [
          {
            "id": "date",
            "label": "Date",
            "type": "date",
            "required": true
          },
          {
            "id": "place",
            "label": "Place",
            "type": "text",
            "required": true
          },
          {
            "id": "signature",
            "label": "Signature - Coordinator -IQAC",
            "type": "signature",
            "required": true
          }
        ]
      },
      {
        "id": "principal_signature",
        "label": "Signature of Director / Principal",
        "fields": [
          {
            "id": "signature",
            "label": "Signature",
            "type": "signature",
            "required": true
          }
        ]
      }
    ],
    "finalNote": "N.B.: The individual PBAS Performa duly filled along with all enclosures, submitted for CAS promotions will be verified by the institutes as necessary and placed before the Screening Cum Evaluation Committee or Selection Committee for Assessment Verification"
  },
  "validation": {
    "requiredFields": "all fields marked as required:true must be filled",
    "scoringRules": {
      "table1": "Grading based on percentage thresholds",
      "table2": "Points based on activity type and level",
      "upperCapping": "Categories 5(b) and 6 combined cannot exceed 30% of total research score",
      "minimumCategories": "Score must come from minimum 3 out of 6 categories in Table 2"
    }
  }
}



export default formSchema;