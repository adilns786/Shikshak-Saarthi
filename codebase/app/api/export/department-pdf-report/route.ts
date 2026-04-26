import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";

/**
 * POST /api/export/department-pdf-report
 * Generate PDF report for entire department with analytics
 * Request body:
 * {
 *   department: string,
 *   yearFrom: number,
 *   yearTo: number,
 *   categories: string[],
 *   includeCharts: boolean,
 *   includeSummary: boolean
 * }
 */
export async function POST(request: NextRequest) {
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
        { error: "Only HOD and Admin can generate department reports" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      department: requestedDepartment,
      yearFrom = 2020,
      yearTo = new Date().getFullYear(),
      categories = ["publications", "research", "patents", "guidance"],
      includeCharts = true,
      includeSummary = true,
    } = body;

    let targetDepartment = userDepartment;
    if (requestedDepartment) {
      if (userRole === "hod" && requestedDepartment !== userDepartment) {
        return NextResponse.json(
          { error: "HOD can only generate reports for their own department" },
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

    // Delegate to Python backend if available
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

    try {
      const resp = await fetch(`${SERVER_URL}/api/generate/report/department`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: targetDepartment,
          year_from: yearFrom,
          year_to: yearTo,
          categories,
          include_charts: includeCharts,
          include_summary: includeSummary,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (resp.ok) {
        const pdf = await resp.blob();
        return new NextResponse(pdf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="Department_Report_${targetDepartment.replace(/ /g, "_")}_${yearFrom}-${yearTo}.pdf"`,
          },
        });
      }
    } catch (e) {
      console.warn("Python backend unavailable, will use fallback");
    }

    // Fallback: Return analytics data for client-side PDF generation
    const analyticsResp = await fetch(
      `${request.nextUrl.origin}/api/export/department-analytics?department=${targetDepartment}&yearFrom=${yearFrom}&yearTo=${yearTo}&categories=${categories.join(",")}&format=json`,
      {
        headers: {
          Authorization: `Bearer ${await auth.createCustomToken(userId)}`,
        },
      }
    );

    if (!analyticsResp.ok) {
      throw new Error("Failed to fetch analytics");
    }

    const analytics = await analyticsResp.json();

    return NextResponse.json({
      success: true,
      analytics,
      message: "Use client-side PDF generation with this data",
    });
  } catch (error: any) {
    console.error("Department PDF report error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
