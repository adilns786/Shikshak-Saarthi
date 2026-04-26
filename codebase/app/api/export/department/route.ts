import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";

/**
 * GET /api/export/department - Export department data (HOD and Admin only)
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
    if (userRole !== "hod" && userRole !== "admin" && userRole !== "misAdmin") {
      return NextResponse.json(
        { error: "Only HOD and Admin can export department data" },
        { status: 403 },
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const requestedDepartment = searchParams.get("department");

    let targetDepartment = userDepartment;

    // If requesting another department's data, check if user is admin
    if (requestedDepartment && requestedDepartment !== userDepartment) {
      if (userRole !== "admin" && userRole !== "misAdmin") {
        return NextResponse.json(
          { error: "HOD can only export their own department data" },
          { status: 403 },
        );
      }
      targetDepartment = requestedDepartment;
    }

    if (!targetDepartment) {
      return NextResponse.json(
        { error: "Department not specified" },
        { status: 400 },
      );
    }

    // Get all users in the department
    const usersSnapshot = await db
      .collection("users")
      .where("department", "==", targetDepartment)
      .get();

    const departmentData = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: departmentData,
      department: targetDepartment,
      count: departmentData.length,
      exportType: "department",
    });
  } catch (error: any) {
    console.error("Export department data error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export department data" },
      { status: 500 },
    );
  }
}
