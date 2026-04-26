import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";

/**
 * GET /api/export/department-analytics
 * Export department analytics with filtering by year range and categories
 * Query params:
 *  - department: Department name (required for HOD, optional for Admin)
 *  - yearFrom: Start year (default: 2020)
 *  - yearTo: End year (default: current year)
 *  - categories: Comma-separated list (publications,research,patents,guidance,etc.)
 *  - format: "csv" or "json" (default: "json")
 */
export async function GET(request: NextRequest) {
  try {
    const { auth, db } = initAdmin();

    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decodedToken;

    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Get user data
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const userRole = userData?.role;
    const userDepartment = userData?.department;

    // Check permissions
    if (!["admin", "hod", "misAdmin"].includes(userRole)) {
      return NextResponse.json(
        { error: "Only HOD and Admin can access department analytics" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const requestedDepartment = searchParams.get("department");
    const yearFromParam = searchParams.get("yearFrom") || "2020";
    const yearToParam = searchParams.get("yearTo") || String(new Date().getFullYear());
    const categoriesParam = searchParams.get("categories") || "publications,research,patents,guidance";
    const format = (searchParams.get("format") || "json") as "csv" | "json";

    const yearFrom = parseInt(yearFromParam);
    const yearTo = parseInt(yearToParam);
    const categories = categoriesParam.split(",").map(c => c.trim());

    let targetDepartment = userDepartment;

    // If requesting another department's data, check if user is admin
    if (requestedDepartment && requestedDepartment !== userDepartment) {
      if (userRole !== "admin" && userRole !== "misAdmin") {
        return NextResponse.json(
          { error: "HOD can only access their own department analytics" },
          { status: 403 }
        );
      }
      targetDepartment = requestedDepartment;
    }

    if (!targetDepartment) {
      return NextResponse.json(
        { error: "Department not specified" },
        { status: 400 }
      );
    }

    // Get all faculty in the department
    const usersSnapshot = await db
      .collection("users")
      .where("department", "==", targetDepartment)
      .where("role", "in", ["faculty", "hod"])
      .get();

    // Process analytics
    const analytics = {
      department: targetDepartment,
      periodFrom: yearFrom,
      periodTo: yearTo,
      generatedAt: new Date().toISOString(),
      facultyCount: usersSnapshot.size,
      summary: {
        totalPublications: 0,
        totalResearchPapers: 0,
        totalPatents: 0,
        totalProjects: 0,
        totalGuidance: 0,
        totalConsultancy: 0,
        avgPublicationsPerFaculty: "0",
        avgResearchPapersPerFaculty: "0",
        avgPapersPerYear: "0",
      },
      byYear: {} as Record<number, any>,
      byCategory: {} as Record<string, any>,
      facultyDetails: [] as any[],
      yearlyTrend: [] as any[],
    };

    // Initialize yearly data
    for (let year = yearFrom; year <= yearTo; year++) {
      analytics.byYear[year] = {
        publications: 0,
        researchPapers: 0,
        patents: 0,
        projects: 0,
        consultancy: 0,
        guidance: 0,
        facultyCount: 0,
      };
    }

    // Process each faculty member
    usersSnapshot.forEach((doc) => {
      const faculty = doc.data();
      const facultyId = doc.id;

      // Extract data from PBAS forms
      const publications = faculty.part_b?.table2?.publications || [];
      const researchPapers = faculty.part_b?.table2?.researchPapers || [];
      const patents = faculty.part_b?.patents_policy_awards || [];
      const researchProjects = faculty.part_b?.table2?.researchProjects || [];
      const consultancyProjects = faculty.part_b?.table2?.consultancyProjects || [];
      const researchGuidance = faculty.part_b?.table2?.researchGuidance || [];

      // Filter by year
      const filterByYear = (items: any[]) =>
        items.filter((item) => {
          const year = parseInt(item.year) || new Date().getFullYear();
          return year >= yearFrom && year <= yearTo;
        });

      const filteredPubs = filterByYear(publications);
      const filteredPapers = filterByYear(researchPapers);
      const filteredPatents = filterByYear(patents);
      const filteredProjects = filterByYear(researchProjects);
      const filteredConsultancy = filterByYear(consultancyProjects);
      const filteredGuidance = filterByYear(researchGuidance);

      // Update summary
      const pubCount = filteredPubs.length;
      const paperCount = filteredPapers.length;
      const patentCount = filteredPatents.length;
      const projectCount = filteredProjects.length;
      const consultancyCount = filteredConsultancy.length;
      const guidanceCount = filteredGuidance.length;

      analytics.summary.totalPublications += pubCount;
      analytics.summary.totalResearchPapers += paperCount;
      analytics.summary.totalPatents += patentCount;
      analytics.summary.totalProjects += projectCount;
      analytics.summary.totalGuidance += guidanceCount;
      analytics.summary.totalConsultancy += consultancyCount;

      // Update yearly breakdown
      [
        ...filteredPubs,
        ...filteredPapers,
        ...filteredPatents,
        ...filteredProjects,
        ...filteredConsultancy,
        ...filteredGuidance,
      ].forEach((item) => {
        const year = parseInt(item.year) || new Date().getFullYear();
        if (analytics.byYear[year]) {
          if (filteredPubs.includes(item)) analytics.byYear[year].publications++;
          if (filteredPapers.includes(item)) analytics.byYear[year].researchPapers++;
          if (filteredPatents.includes(item)) analytics.byYear[year].patents++;
          if (filteredProjects.includes(item)) analytics.byYear[year].projects++;
          if (filteredConsultancy.includes(item)) analytics.byYear[year].consultancy++;
          if (filteredGuidance.includes(item)) analytics.byYear[year].guidance++;
        }
      });

      // Update category breakdown
      if (categories.includes("publications")) {
        analytics.byCategory.publications =
          (analytics.byCategory.publications || 0) + pubCount;
      }
      if (categories.includes("research")) {
        analytics.byCategory.researchPapers =
          (analytics.byCategory.researchPapers || 0) + paperCount;
        analytics.byCategory.researchProjects =
          (analytics.byCategory.researchProjects || 0) + projectCount;
      }
      if (categories.includes("patents")) {
        analytics.byCategory.patents = (analytics.byCategory.patents || 0) + patentCount;
      }
      if (categories.includes("guidance")) {
        analytics.byCategory.guidance = (analytics.byCategory.guidance || 0) + guidanceCount;
      }
      if (categories.includes("consultancy")) {
        analytics.byCategory.consultancy =
          (analytics.byCategory.consultancy || 0) + consultancyCount;
      }

      // Faculty details
      analytics.facultyDetails.push({
        id: facultyId,
        name: faculty.name || faculty.full_name || "Unknown",
        email: faculty.email,
        designation: faculty.designation,
        specialization: faculty.specialization,
        publications: pubCount,
        researchPapers: paperCount,
        patents: patentCount,
        projects: projectCount,
        consultancy: consultancyCount,
        guidance: guidanceCount,
        total:
          pubCount + paperCount + patentCount + projectCount + consultancyCount + guidanceCount,
        details: {
          publications: filteredPubs.map((p) => ({
            title: p.title,
            year: p.year,
            authors: p.authors,
          })),
          researchPapers: filteredPapers.map((p) => ({
            title: p.title,
            year: p.year,
            authors: p.authors,
          })),
          patents: filteredPatents.map((p) => ({
            title: p.title,
            year: p.year,
          })),
          projects: filteredProjects.map((p) => ({
            title: p.title,
            year: p.year,
            fundingAgency: p.fundingAgency,
          })),
          consultancy: filteredConsultancy.map((p) => ({
            title: p.title,
            year: p.year,
          })),
          guidance: filteredGuidance.map((p) => ({
            title: p.title,
            level: p.level,
          })),
        },
      });
    });

    // Sort faculty by total output
    analytics.facultyDetails.sort((a, b) => b.total - a.total);

    // Build yearly trend
    for (let year = yearFrom; year <= yearTo; year++) {
      const data = analytics.byYear[year];
      analytics.yearlyTrend.push({
        year,
        publications: data.publications,
        researchPapers: data.researchPapers,
        patents: data.patents,
        projects: data.projects,
        consultancy: data.consultancy,
        guidance: data.guidance,
        total:
          data.publications +
          data.researchPapers +
          data.patents +
          data.projects +
          data.consultancy +
          data.guidance,
      });
    }

    // Calculate averages
    analytics.summary.avgPublicationsPerFaculty =
      analytics.facultyCount > 0
        ? (analytics.summary.totalPublications / analytics.facultyCount).toFixed(2)
        : "0";
    analytics.summary.avgResearchPapersPerFaculty =
      analytics.facultyCount > 0
        ? (analytics.summary.totalResearchPapers / analytics.facultyCount).toFixed(2)
        : "0";
    analytics.summary.avgPapersPerYear =
      (yearTo - yearFrom + 1) > 0
        ? (
            (analytics.summary.totalPublications +
              analytics.summary.totalResearchPapers) /
            (yearTo - yearFrom + 1)
          ).toFixed(2)
        : "0";

    if (format === "csv") {
      const csv = convertAnalyticsToCSV(analytics);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="Department_Analytics_${targetDepartment}_${yearFrom}-${yearTo}.csv"`,
        },
      });
    }

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error("Department analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

function convertAnalyticsToCSV(data: any): string {
  const lines: string[] = [];

  // Header
  lines.push(`Department Analytics Report`);
  lines.push(`Department: ${data.department}`);
  lines.push(`Period: ${data.periodFrom} - ${data.periodTo}`);
  lines.push(`Generated: ${data.generatedAt}`);
  lines.push("");

  // Summary
  lines.push("SUMMARY");
  lines.push(`Faculty Count,${data.facultyCount}`);
  lines.push(`Total Publications,${data.summary.totalPublications}`);
  lines.push(`Total Research Papers,${data.summary.totalResearchPapers}`);
  lines.push(`Total Patents,${data.summary.totalPatents}`);
  lines.push(`Total Projects,${data.summary.totalProjects}`);
  lines.push(`Total Guidance,${data.summary.totalGuidance}`);
  lines.push(`Total Consultancy,${data.summary.totalConsultancy}`);
  lines.push(`Avg Publications/Faculty,${data.summary.avgPublicationsPerFaculty}`);
  lines.push("");

  // Yearly trend
  lines.push("YEARLY TREND");
  lines.push("Year,Publications,Research Papers,Patents,Projects,Consultancy,Guidance,Total");
  data.yearlyTrend.forEach((year: any) => {
    lines.push(
      `${year.year},${year.publications},${year.researchPapers},${year.patents},${year.projects},${year.consultancy},${year.guidance},${year.total}`
    );
  });
  lines.push("");

  // Faculty details
  lines.push("FACULTY-WISE BREAKDOWN");
  lines.push(
    "Faculty Name,Email,Designation,Publications,Research Papers,Patents,Projects,Consultancy,Guidance,Total"
  );
  data.facultyDetails.forEach((faculty: any) => {
    const row = [
      faculty.name,
      faculty.email,
      faculty.designation || "",
      faculty.publications,
      faculty.researchPapers,
      faculty.patents,
      faculty.projects,
      faculty.consultancy,
      faculty.guidance,
      faculty.total,
    ];
    lines.push(row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","));
  });

  return lines.join("\n");
}
