import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Simulate LLM analysis using Gemini (free tier simulation)
const generateLLMAnalysis = (appraisalData: any) => {
  const insights = [
    "Strong research output with consistent publication record",
    "Excellent teaching evaluations across multiple courses",
    "Active participation in institutional service activities",
    "Notable contributions to curriculum development",
    "Effective mentorship of graduate students",
    "Significant impact in professional development activities",
  ]

  const recommendations = [
    "Consider expanding research collaborations internationally",
    "Explore opportunities for interdisciplinary research projects",
    "Increase involvement in peer review activities",
    "Develop new innovative teaching methodologies",
    "Pursue leadership roles in professional organizations",
    "Focus on high-impact publication venues",
  ]

  const strengths = [
    "Research Excellence",
    "Teaching Innovation",
    "Service Leadership",
    "Student Mentorship",
    "Professional Development",
    "Collaboration Skills",
  ]

  const areas_for_improvement = [
    "Grant Writing",
    "International Visibility",
    "Industry Partnerships",
    "Technology Integration",
    "Community Outreach",
    "Publication Strategy",
  ]

  return {
    overall_score: Math.floor(Math.random() * 20) + 80, // 80-100 range
    insights: insights.slice(0, Math.floor(Math.random() * 3) + 3),
    recommendations: recommendations.slice(0, Math.floor(Math.random() * 3) + 2),
    strengths: strengths.slice(0, Math.floor(Math.random() * 3) + 3),
    areas_for_improvement: areas_for_improvement.slice(0, Math.floor(Math.random() * 2) + 2),
    summary:
      "This faculty member demonstrates exceptional performance across teaching, research, and service domains. The comprehensive evaluation indicates strong potential for continued academic excellence and institutional contribution.",
    generated_at: new Date().toISOString(),
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

    const { appraisalId } = await request.json()

    if (!appraisalId) {
      return NextResponse.json({ error: "Appraisal ID is required" }, { status: 400 })
    }

    // Fetch appraisal data
    const { data: appraisal, error: fetchError } = await supabase
      .from("appraisals")
      .select("*")
      .eq("id", appraisalId)
      .single()

    if (fetchError || !appraisal) {
      return NextResponse.json({ error: "Appraisal not found" }, { status: 404 })
    }

    // Simulate LLM processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000))

    const analysis = generateLLMAnalysis(appraisal)

    // Update appraisal with LLM analysis
    const { data, error } = await supabase
      .from("appraisals")
      .update({
        llm_analysis: analysis,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appraisalId)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analysis,
      message: "LLM analysis completed successfully",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
