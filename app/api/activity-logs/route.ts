import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase-admin";

/**
 * POST /api/activity-logs - Log a new activity
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

    // Get user data
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    // Parse request body
    const body = await request.json();
    const {
      action,
      description,
      resourceType,
      resourceId,
      metadata,
      userAgent,
    } = body;

    if (!action || !description) {
      return NextResponse.json(
        { error: "Missing required fields: action, description" },
        { status: 400 },
      );
    }

    // Get IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";

    // Create activity log
    const activityLog = {
      user_id: userId,
      user_email: userData?.email || decodedToken.email,
      user_name: userData?.name || userData?.full_name || "Unknown",
      user_role: userData?.role || "unknown",
      department: userData?.department,
      action,
      description,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      created_at: Timestamp.now(),
    };

    const docRef = await db.collection("activity_logs").add(activityLog);

    return NextResponse.json({
      success: true,
      id: docRef.id,
    });
  } catch (error: any) {
    console.error("Activity log error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log activity" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/activity-logs - Retrieve activity logs
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

    // Get user data to check role
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const userRole = userData?.role;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get("department");
    // Admins get higher limit; others capped at 100
    const requestedLimit = parseInt(searchParams.get("limit") || "50");
    const isAdminRole = userRole === "admin" || userRole === "misAdmin";
    const limit = isAdminRole
      ? Math.min(requestedLimit, 500)
      : Math.min(requestedLimit, 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query based on role
    let query = db.collection("activity_logs").orderBy("created_at", "desc");

    if (userRole === "faculty") {
      // Faculty can only see their own logs
      query = query.where("user_id", "==", userId);
    } else if (userRole === "hod") {
      // HOD can see their department's logs
      const userDept = userData?.department;
      if (userDept) {
        query = query.where("department", "==", userDept);
      }
    } else if (userRole !== "admin" && userRole !== "misAdmin") {
      // Only admin, misAdmin, hod, and faculty can access logs
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Apply additional filters
    if (department && (userRole === "admin" || userRole === "misAdmin")) {
      query = query.where("department", "==", department);
    }

    // Execute query
    const snapshot = await query.limit(limit).offset(offset).get();

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at:
        doc.data().created_at?.toDate?.()?.toISOString() ||
        doc.data().created_at,
    }));

    return NextResponse.json({
      success: true,
      logs,
      total: logs.length,
    });
  } catch (error: any) {
    console.error("Get activity logs error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve activity logs" },
      { status: 500 },
    );
  }
}
