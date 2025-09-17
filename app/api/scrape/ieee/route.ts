import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Dummy IEEE Xplore data simulation
const generateIEEEData = (query: string) => {
  const titles = [
    "Advanced Signal Processing for Educational Applications",
    "Wireless Communication Systems in Smart Classrooms",
    "Digital Image Processing for Learning Assessment",
    "Network Security Protocols for Educational Platforms",
    "Embedded Systems Design for Interactive Learning",
    "VLSI Design Methodologies for Educational Tools",
    "Power Electronics Applications in Campus Infrastructure",
    "Control Systems for Automated Learning Environments",
    "Microprocessor-Based Educational Measurement Systems",
    "RF Circuit Design for Campus Communication Networks",
  ]

  const conferences = [
    "IEEE International Conference on Engineering Education",
    "IEEE Global Engineering Education Conference",
    "IEEE Frontiers in Education Conference",
    "IEEE International Conference on Teaching, Assessment and Learning",
    "IEEE Conference on Technology for Education",
    "IEEE International Conference on Advanced Learning Technologies",
  ]

  return Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, i) => ({
    title: titles[Math.floor(Math.random() * titles.length)],
    authors: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => `Author ${j + 1}`),
    venue: conferences[Math.floor(Math.random() * conferences.length)],
    year: 2019 + Math.floor(Math.random() * 5),
    doi: `10.1109/EXAMPLE.2023.${1000000 + i}`,
    url: `https://ieeexplore.ieee.org/document/${9000000 + i}`,
    abstract: `This IEEE paper explores ${query.toLowerCase()} methodologies with practical implementations in educational technology systems. The proposed approach shows measurable improvements in system performance and user engagement.`,
    keywords: ["Education", "Technology", "Engineering", "Innovation"],
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
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2500))

    const publications = generateIEEEData(query)

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
          url: pub.url,
          abstract: pub.abstract,
          source: "ieee_xplore",
          metadata: {
            doi: pub.doi,
            keywords: pub.keywords,
          },
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
      message: `Found ${publications.length} publications from IEEE Xplore`,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
