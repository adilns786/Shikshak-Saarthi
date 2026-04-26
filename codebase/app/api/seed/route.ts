import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

const seedData = {
  departments: [
    "Computer Science",
    "Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Management Studies",
  ],

  sampleFaculty: [
    {
      email: "dr.sharma@university.edu",
      full_name: "Dr. Priya Sharma",
      department: "Computer Science",
      designation: "Associate Professor",
      employee_id: "CS001",
    },
    {
      email: "prof.kumar@university.edu",
      full_name: "Prof. Rajesh Kumar",
      department: "Electronics Engineering",
      designation: "Professor",
      employee_id: "EE001",
    },
    {
      email: "dr.singh@university.edu",
      full_name: "Dr. Anita Singh",
      department: "Mathematics",
      designation: "Assistant Professor",
      employee_id: "MA001",
    },
  ],

  samplePublications: [
    {
      title: "Machine Learning Applications in Educational Assessment",
      authors: ["Dr. Priya Sharma", "Prof. Vikram Patel"],
      venue: "IEEE Transactions on Education",
      year: 2023,
      citations: 45,
      source: "google_scholar",
    },
    {
      title: "Advanced Signal Processing for Smart Classrooms",
      authors: ["Prof. Rajesh Kumar", "Dr. Sunita Gupta"],
      venue: "IEEE International Conference on Engineering Education",
      year: 2023,
      citations: 32,
      source: "ieee_xplore",
    },
  ],
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication and admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const results = {
      departments: 0,
      faculty: 0,
      publications: 0,
      appraisals: 0,
    }

    // Seed departments
    for (const dept of seedData.departments) {
      const { error } = await supabase.from("departments").upsert({ name: dept }, { onConflict: "name" })

      if (!error) results.departments++
    }

    // Create sample faculty profiles (this would normally be done through auth signup)
    for (const faculty of seedData.sampleFaculty) {
      // In a real scenario, these would be created through the signup process
      // For demo purposes, we'll create profile entries
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("email", faculty.email).single()

      if (!existingProfile) {
        // Create a dummy user ID for demo purposes
        const dummyUserId = `demo-${faculty.employee_id.toLowerCase()}`

        const { error } = await supabase.from("profiles").insert({
          id: dummyUserId,
          email: faculty.email,
          full_name: faculty.full_name,
          department: faculty.department,
          designation: faculty.designation,
          employee_id: faculty.employee_id,
          role: "faculty",
        })

        if (!error) {
          results.faculty++

          // Add sample publications for this faculty
          for (const pub of seedData.samplePublications) {
            if (pub.authors.includes(faculty.full_name)) {
              await supabase.from("publications").insert({
                faculty_id: dummyUserId,
                title: pub.title,
                authors: pub.authors,
                venue: pub.venue,
                year: pub.year,
                citations: pub.citations,
                source: pub.source,
              })
              results.publications++
            }
          }

          // Create a sample appraisal
          const { data: appraisal } = await supabase
            .from("appraisals")
            .insert({
              faculty_id: dummyUserId,
              academic_year: "2023-24",
              status: "submitted",
              teaching_data: {
                courses_taught: ["CS101", "CS201"],
                student_feedback: 4.5,
                innovations: "Implemented flipped classroom methodology",
              },
              research_data: {
                publications_count: 2,
                grants_received: 1,
                conferences_attended: 3,
              },
              service_data: {
                committees: ["Academic Committee", "Examination Committee"],
                administrative_roles: ["Course Coordinator"],
                outreach_activities: 2,
              },
            })
            .select()
            .single()

          if (appraisal) results.appraisals++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seed data created successfully",
      results,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 })
  }
}
