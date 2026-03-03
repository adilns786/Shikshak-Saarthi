import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";

/**
 * GET /api/export/faculty - Export faculty's own data
 * GET /api/export/faculty?userId=xxx - Export specific user data (admin only)
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

    const currentUserId = decodedToken.uid;

    // Get current user data
    const currentUserDoc = await db
      .collection("users")
      .doc(currentUserId)
      .get();
    if (!currentUserDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserData = currentUserDoc.data();
    const currentUserRole = currentUserData?.role;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const requestedUserId = searchParams.get("userId");

    let targetUserId = currentUserId;

    // If requesting another user's data, check permissions
    if (requestedUserId && requestedUserId !== currentUserId) {
      if (currentUserRole !== "admin" && currentUserRole !== "misAdmin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      targetUserId = requestedUserId;
    }

    // Get target user data
    const userDoc = await db.collection("users").doc(targetUserId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    // Return user data
    return NextResponse.json({
      success: true,
      data: userData,
      exportType: "faculty",
    });
  } catch (error: any) {
    console.error("Export faculty data error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export data" },
      { status: 500 },
    );
  }
}
