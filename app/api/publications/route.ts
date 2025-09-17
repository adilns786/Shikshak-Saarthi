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
    const facultyId = searchParams.get("facultyId")
    const source = searchParams.get("source")
    const year = searchParams.get("year")

    let query = supabase.from("publications").select("*").order("year", { ascending: false })

    if (facultyId) {
      query = query.eq("faculty_id", facultyId)
    }

    if (source) {
      query = query.eq("source", source)
    }

    if (year) {
      query = query.eq("year", Number.parseInt(year))
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch publications" }, { status: 500 })
    }

    return NextResponse.json({ publications: data })
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

    const publication = await request.json()

    const { data, error } = await supabase
      .from("publications")
      .insert({
        faculty_id: user.id,
        ...publication,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create publication" }, { status: 500 })
    }

    return NextResponse.json({ publication: data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
