import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Dummy Google Scholar data simulation
const generateScholarData = (query: string) => {
  const titles = [
    "Machine Learning Applications in Educational Assessment",
    "Deep Learning for Academic Performance Prediction",
    "Natural Language Processing in Educational Technology",
    "Computer Vision Applications in Learning Analytics",
    "Artificial Intelligence in Personalized Learning Systems",
    "Data Mining Techniques for Student Behavior Analysis",
    "Blockchain Technology in Academic Credential Verification",
    "IoT Applications in Smart Campus Management",
    "Cloud Computing Solutions for Educational Institutions",
    "Cybersecurity Frameworks for E-Learning Platforms",
  ]

  const authors = [
    "Dr. Priya Sharma",
    "Prof. Rajesh Kumar",
    "Dr. Anita Singh",
    "Prof. Vikram Patel",
    "Dr. Sunita Gupta",
    "Prof. Amit Verma",
  ]

  const venues = [
    "IEEE Transactions on Education",
    "Computers & Education",
    "Educational Technology Research",
    "Journal of Educational Computing Research",
    "International Conference on Educational Technology",
    "ACM Transactions on Computing Education",
  ]

  return Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
    title: titles[Math.floor(Math.random() * titles.length)],
    authors: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      () => authors[Math.floor(Math.random() * authors.length)],
    ),
    venue: venues[Math.floor(Math.random() * venues.length)],
    year: 2020 + Math.floor(Math.random() * 4),
    citations: Math.floor(Math.random() * 100),
    url: `https://scholar.google.com/citations?view_op=view_citation&hl=en&user=example&citation_for_view=example:${i}`,
    abstract: `This paper presents a comprehensive study on ${query.toLowerCase()} with applications in educational technology. The research demonstrates significant improvements in learning outcomes through innovative methodological approaches.`,
  }))
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

    const { query, facultyId } = await request.json()

    if (!query || !facultyId) {
      return NextResponse.json({ error: "Query and facultyId are required" }, { status: 400 })
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const publications = generateScholarData(query)

    // Store scraped data in database
    const { data, error } = await supabase
      .from("publications")
      .insert(
        publications.map((pub) => ({
          faculty_id: facultyId,
          title: pub.title,
          authors: pub.authors,
          venue: pub.venue,
          year: pub.year,
          citations: pub.citations,
          url: pub.url,
          abstract: pub.abstract,
          source: "google_scholar",
        })),
      )
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save publications" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      publications: data,
      message: `Found ${publications.length} publications from Google Scholar`,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
