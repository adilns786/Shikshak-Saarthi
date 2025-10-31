
import { NextRequest, NextResponse } from "next/server";

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
} from "docx";
import { doc as firestoreDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Helper function to safely get nested values
const get = (obj: any, path: string, defaultValue: any = "") => {
  try {
    const value = path.split(".").reduce((acc, part) => acc?.[part], obj);
    return value !== undefined && value !== null ? value : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper to create table cell
const createCell = (text: string, options: any = {}) => {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: String(text || ""), size: 20 })],
        alignment: options.alignment || AlignmentType.LEFT,
      }),
    ],
    width: options.width || { size: 100, type: WidthType.AUTO },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    },
  });
};

// Helper to create header row
const createHeaderRow = (headers: string[]) => {
  return new TableRow({
    children: headers.map((h) =>
      createCell(h, {
        width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
      })
    ),
  });
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch data from Firebase
    const userRef = firestoreDoc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    
    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = userSnap.data();

    const partA = get(data, "part_a", {});
    const partB = get(data, "part_b", {});
    const formHeader = get(data, "formHeader", {});
    const personalInfo = get(partA, "personal_in", {});

    // Create document sections
    const sections: any[] = [];

    // Title
    sections.push(
      new Paragraph({
        text: "Self-Assessment-Cum-Performance Appraisal Forms",
        heading: "Heading1",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "API-PBAS Proforma",
        heading: "Heading1",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    // Header Information
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Name of the Institute / College: ",
            bold: true,
          }),
          new TextRun(get(formHeader, "institute_name", "")),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Name of the Department: ", bold: true }),
          new TextRun(get(formHeader, "department_name", "")),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Under CAS Promotion for Stage/Level: ",
            bold: true,
          }),
          new TextRun(get(formHeader, "cas_promotion_stage", "")),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Faculty of: ", bold: true }),
          new TextRun(get(formHeader, "faculty_name", "")),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "ACADEMIC YEAR: ", bold: true }),
          new TextRun(get(formHeader, "academic_year", "")),
        ],
        spacing: { after: 400 },
      })
    );

    // PART A: GENERAL INFORMATION
    sections.push(
      new Paragraph({
        text: "PART A: GENERAL INFORMATION AND ACADEMIC BACKGROUND",
        heading: "Heading2",
        spacing: { before: 200, after: 200 },
      })
    );

    // Personal Information
    const personalInfoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("1. Name (in Block Letters)", {
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            createCell(get(personalInfo, "name", ""), {
              width: { size: 70, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            createCell("2. Department"),
            createCell(get(personalInfo, "department", "")),
          ],
        }),
        new TableRow({
          children: [
            createCell("3. Current Designation & Academic Level"),
            createCell(get(personalInfo, "current_designation", "")),
          ],
        }),
        new TableRow({
          children: [
            createCell("4. Date of last Promotion"),
            createCell(get(personalInfo, "date_last_promotion", "")),
          ],
        }),
        new TableRow({
          children: [
            createCell("5. Level of an applicant under CAS"),
            createCell(get(personalInfo, "level_cas", "")),
          ],
        }),
        new TableRow({
          children: [
            createCell(
              "6. The designation and grade pay applied for under CAS"
            ),
            createCell(get(personalInfo, "designation_applied", "")),
          ],
        }),
        new TableRow({
          children: [
            createCell("7. Date of eligibility for promotion"),
            createCell(get(personalInfo, "date_eligibility", "")),
          ],
        }),
        new TableRow({
          children: [
            createCell("8. Address"),
            createCell(get(personalInfo, "address", "")),
          ],
        }),
        new TableRow({
          children: [
            createCell("Telephone/Mobile No."),
            createCell(get(personalInfo, "telephone", "")),
          ],
        }),
        new TableRow({
          children: [
            createCell("E-mail"),
            createCell(get(personalInfo, "email", "")),
          ],
        }),
      ],
    });
    sections.push(personalInfoTable);

    // Academic Qualifications
    sections.push(
      new Paragraph({
        text: "9. Academic Qualifications (from S.S.C. till Post-Graduation):",
        bold: true,
        spacing: { before: 300, after: 200 },
      })
    );

    const qualifications = get(partA, "academic_qualifications", []);
    const qualRows = [
      createHeaderRow([
        "Examinations",
        "Board/University",
        "Year of Passing",
        "Percentage",
        "Division/Class",
        "Subject",
      ]),
    ];

    qualifications.forEach((qual: any) => {
      qualRows.push(
        new TableRow({
          children: [
            createCell(get(qual, "examination", "")),
            createCell(get(qual, "board_university", "")),
            createCell(get(qual, "year_passing", "")),
            createCell(get(qual, "percentage", "")),
            createCell(get(qual, "class_division", "")),
            createCell(get(qual, "subject", "")),
          ],
        })
      );
    });

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: qualRows,
      })
    );

    // Research Degrees
    sections.push(
      new Paragraph({
        text: "10. Research Degree(s):",
        bold: true,
        spacing: { before: 300, after: 200 },
      })
    );

    const researchDegrees = get(partA, "research_degrees", []);
    const degreeRows = [
      createHeaderRow([
        "Degrees",
        "Title",
        "Date of Award",
        "Name of University",
      ]),
    ];

    researchDegrees.forEach((deg: any) => {
      degreeRows.push(
        new TableRow({
          children: [
            createCell(get(deg, "degree", "")),
            createCell(get(deg, "title", "")),
            createCell(get(deg, "date_award", "")),
            createCell(get(deg, "university", "")),
          ],
        })
      );
    });

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: degreeRows,
      })
    );

    // Prior Employment
    sections.push(
      new Paragraph({
        text: "11. Appointments held prior to joining this institution:",
        bold: true,
        spacing: { before: 300, after: 200 },
      })
    );

    const priorEmployment = get(partA, "employment.prior", []);
    const priorRows = [
      createHeaderRow([
        "Designation",
        "Employer",
        "Nature",
        "Duration",
        "Salary",
        "Reason of Leaving",
      ]),
    ];

    priorEmployment.forEach((emp: any) => {
      priorRows.push(
        new TableRow({
          children: [
            createCell(get(emp, "designation", "")),
            createCell(get(emp, "employer", "")),
            createCell(get(emp, "nature", "")),
            createCell(get(emp, "duration", "")),
            createCell(get(emp, "salary", "")),
            createCell(get(emp, "reason_leaving", "")),
          ],
        })
      );
    });

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: priorRows,
      })
    );

    // Current Posts
    sections.push(
      new Paragraph({
        text: "12. Posts Held after appointment at this Institution:",
        bold: true,
        spacing: { before: 300, after: 200 },
      })
    );

    const currentPosts = get(partA, "employment.posts", []);
    const postRows = [
      createHeaderRow([
        "Designation",
        "Department",
        "Date of Joining",
        "Grade Pay",
      ]),
    ];

    currentPosts.forEach((post: any) => {
      postRows.push(
        new TableRow({
          children: [
            createCell(get(post, "designation", "")),
            createCell(get(post, "department", "")),
            createCell(get(post, "date_joining", "")),
            createCell(get(post, "grade_pay", "")),
          ],
        })
      );
    });

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: postRows,
      })
    );

    // Teaching Experience
    const teachingExp = get(partA, "teaching_research_experience", {});
    sections.push(
      new Paragraph({
        text: "13. Period of teaching experience:",
        bold: true,
        spacing: { before: 300, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "P.G. Classes (In Years): ", bold: true }),
          new TextRun(get(teachingExp, "pg_years", "")),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "U.G. Classes (In Years): ", bold: true }),
          new TextRun(get(teachingExp, "ug_years", "")),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "14. Research Experience (in Years): ",
            bold: true,
          }),
          new TextRun(get(teachingExp, "research_years", "")),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "15. Fields of Specialization: ", bold: true }),
          new TextRun(get(teachingExp, "specialization", "")),
        ],
        spacing: { after: 300 },
      })
    );

    // Courses/FDP
    sections.push(
      new Paragraph({
        text: "16. Courses/FDP attended:",
        bold: true,
        spacing: { before: 300, after: 200 },
      })
    );

    const courses = get(partA, "courses_fdp", []);
    const courseRows = [
      createHeaderRow(["Name of Course", "Place", "Duration", "Organizer"]),
    ];

    courses.forEach((course: any) => {
      courseRows.push(
        new TableRow({
          children: [
            createCell(get(course, "name", "")),
            createCell(get(course, "place", "")),
            createCell(get(course, "duration", "")),
            createCell(get(course, "organizer", "")),
          ],
        })
      );
    });

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: courseRows,
      })
    );

    // PART B: Teaching Activities
    sections.push(
      new Paragraph({
        text: "PART B: ACADEMIC PERFORMANCE INDICATORS (API)",
        heading: "Heading2",
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: "Table 1: Teaching Activities",
        bold: true,
        spacing: { before: 200, after: 200 },
      })
    );

    const teaching = get(partA, "teaching_student_assessment.teaching", []);
    const teachingRows = [
      createHeaderRow([
        "Activity Name",
        "Category",
        "Unit",
        "Actual Hours",
        "% Teaching",
        "Self-Appraisal",
        "Verified",
      ]),
    ];

    teaching.forEach((t: any) => {
      teachingRows.push(
        new TableRow({
          children: [
            createCell(get(t, "activity_name", "")),
            createCell(get(t, "category", "")),
            createCell(get(t, "unit_of_calculation", "")),
            createCell(get(t, "actual_class_spent", "")),
            createCell(get(t, "percent_teaching", "")),
            createCell(get(t, "self_appraisal", "")),
            createCell(get(t, "verified_grading", "")),
          ],
        })
      );
    });

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: teachingRows,
      })
    );

    // Student Activities
    sections.push(
      new Paragraph({
        text: "Student Related Activities:",
        bold: true,
        spacing: { before: 300, after: 200 },
      })
    );

    const activities = get(partA, "teaching_student_assessment.activities", []);
    const activityRows = [
      createHeaderRow([
        "Description",
        "Category",
        "Total Days",
        "Self-Appraisal",
        "Verified",
      ]),
    ];

    activities.forEach((a: any) => {
      activityRows.push(
        new TableRow({
          children: [
            createCell(get(a, "description", "")),
            createCell(get(a, "activity_category", "")),
            createCell(get(a, "total_days", "")),
            createCell(get(a, "self_appraisal", "")),
            createCell(get(a, "verified_grading", "")),
          ],
        })
      );
    });

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: activityRows,
      })
    );

    // Table 2: Research Activities
    sections.push(
      new Paragraph({
        text: "Table 2: Research and Academic Contributions",
        bold: true,
        spacing: { before: 400, after: 200 },
      })
    );

    // Publications
    const publications = get(partB, "table2.publications", []);
    if (publications.length > 0) {
      sections.push(
        new Paragraph({
          text: "Publications:",
          bold: true,
          spacing: { before: 200, after: 100 },
        })
      );

      const pubRows = [
        createHeaderRow([
          "Title",
          "Publisher",
          "Year",
          "ISBN",
          "Authorship",
          "Type",
        ]),
      ];

      publications.forEach((pub: any) => {
        pubRows.push(
          new TableRow({
            children: [
              createCell(get(pub, "title", "")),
              createCell(get(pub, "publisher", "")),
              createCell(get(pub, "year", "")),
              createCell(get(pub, "isbn", "")),
              createCell(get(pub, "authorship", "")),
              createCell(get(pub, "type", "")),
            ],
          })
        );
      });

      sections.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: pubRows,
        })
      );
    }

    // Research Papers
    const researchPapers = get(partB, "table2.researchPapers", []);
    if (researchPapers.length > 0) {
      sections.push(
        new Paragraph({
          text: "Research Papers:",
          bold: true,
          spacing: { before: 200, after: 100 },
        })
      );

      const paperRows = [createHeaderRow(["Title", "Journal", "ISSN", "Year"])];

      researchPapers.forEach((paper: any) => {
        paperRows.push(
          new TableRow({
            children: [
              createCell(get(paper, "title", "")),
              createCell(get(paper, "journal", "")),
              createCell(get(paper, "issn", "")),
              createCell(get(paper, "year", "")),
            ],
          })
        );
      });

      sections.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: paperRows,
        })
      );
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="PBAS_${userId}_${Date.now()}.docx"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating DOCX:", error);
    return NextResponse.json(
      { error: "Failed to generate document", details: error.message },
      { status: 500 }
    );
  }
}

// ============================================
// FILE 2: components/GeneratePBASButton.tsx
// ============================================
// 'use client';

// import { useState } from 'react';

// interface GeneratePBASButtonProps {
//   userId: string;
// }

// export default function GeneratePBASButton({ userId }: GeneratePBASButtonProps) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleGenerateDoc = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch('/api/generate-pbas', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ userId }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to generate document');
//       }

//       // Get the blob
//       const blob = await response.blob();

//       // Create download link
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `PBAS_${userId}_${Date.now()}.docx`;
//       document.body.appendChild(a);
//       a.click();

//       // Cleanup
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);

//     } catch (err: any) {
//       console.error('Error:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-2">
//       <button
//         onClick={handleGenerateDoc}
//         disabled={loading}
//         className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
//       >
//         {loading ? 'Generating...' : 'Generate PBAS Document'}
//       </button>

//       {error && (
//         <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//           {error}
//         </div>
//       )}
//     </div>
//   );
// }
