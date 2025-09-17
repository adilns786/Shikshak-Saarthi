import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const academicYear = searchParams.get("academic_year")

    // Get user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    let query = supabase
      .from("appraisals")
      .select(`
        *,
        profiles!appraisals_faculty_id_fkey (
          full_name,
          department,
          designation
        )
      `)
      .order("created_at", { ascending: false })

    // If not admin, only show user's own appraisals
    if (profile?.role !== "admin") {
      query = query.eq("faculty_id", user.id)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (academicYear) {
      query = query.eq("academic_year", academicYear)
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch appraisals" }, { status: 500 })
    }

    return NextResponse.json({ appraisals: data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appraisalData = await request.json()

    const { data, error } = await supabase
      .from("appraisals")
      .insert({
        faculty_id: user.id,
        ...appraisalData,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create appraisal" }, { status: 500 })
    }

    return NextResponse.json({ appraisal: data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
