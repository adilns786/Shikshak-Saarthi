import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";

/**
 * GET /api/export/pdf
 * Query params:
 *   userId?      – target user (admin only; defaults to current user)
 *   department?  – filter by department (hod/admin only)
 *   fromDate     – ISO date string  e.g. 2025-01-01
 *   toDate       – ISO date string  e.g. 2025-12-31
 *   sections     – comma-separated section IDs
 *   includeCharts – boolean string
 *   includeSummary – boolean string
 *
 * Returns JSON payload that the client-side PDF builder uses.
 */
export async function GET(request: NextRequest) {
  try {
    const { auth, db } = initAdmin();

    // ── Auth ─────────────────────────────────────────────────────
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const currentUid = decoded.uid;
    const currentUserDoc = await db.collection("users").doc(currentUid).get();
    if (!currentUserDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = currentUserDoc.data()!;
    const currentRole = currentUser.role as string;

    // ── Query params ─────────────────────────────────────────────
    const sp = request.nextUrl.searchParams;
    const fromDate = sp.get("fromDate") || "";
    const toDate = sp.get("toDate") || "";
    const sections = (sp.get("sections") || "").split(",").filter(Boolean);
    const reqUserId = sp.get("userId");
    const reqDept = sp.get("department");

    // ── Permission checks ────────────────────────────────────────
    let targetUserId: string | null = null;
    let targetDept: string | null = null;

    if (reqUserId && reqUserId !== currentUid) {
      if (currentRole !== "admin" && currentRole !== "misAdmin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      targetUserId = reqUserId;
    } else if (reqDept) {
      if (
        currentRole !== "admin" &&
        currentRole !== "misAdmin" &&
        !(currentRole === "hod" && reqDept === currentUser.department)
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      targetDept = reqDept;
    } else {
      targetUserId = currentUid;
    }

    // ── Fetch data ────────────────────────────────────────────────
    let payload: any;

    if (targetDept) {
      // Department-level export
      const usersSnap = await db
        .collection("users")
        .where("department", "==", targetDept)
        .get();

      const users = await Promise.all(
        usersSnap.docs.map(async (userDoc) => {
          const userData = { id: userDoc.id, ...userDoc.data() };
          return enrichUser(db, userData, sections, fromDate, toDate);
        }),
      );

      payload = {
        type: "department",
        department: targetDept,
        fromDate,
        toDate,
        sections,
        data: users,
        generatedAt: new Date().toISOString(),
        stats: computeDeptStats(users),
      };
    } else {
      // Single user export
      const uid = targetUserId!;
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userData = { id: uid, ...userDoc.data() };
      const enriched = await enrichUser(
        db,
        userData,
        sections,
        fromDate,
        toDate,
      );

      payload = {
        type: "faculty",
        fromDate,
        toDate,
        sections,
        data: enriched,
        generatedAt: new Date().toISOString(),
        stats: computeUserStats(enriched),
      };
    }

    return NextResponse.json({ success: true, ...payload });
  } catch (err: any) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate export data" },
      { status: 500 },
    );
  }
}

/* ─── Helpers ────────────────────────────────────────────────── */

async function enrichUser(
  db: any,
  userData: any,
  sections: string[],
  fromDate: string,
  toDate: string,
): Promise<any> {
  const uid = userData.id;
  const enriched: any = { ...userData };

  // Filter part_b data by date range if dates provided
  if (fromDate && toDate && enriched.part_b) {
    enriched.part_b = filterByDateRange(enriched.part_b, fromDate, toDate);
  }

  // Fetch publications from Firestore if section requested
  if (sections.includes("publications")) {
    try {
      let pubQuery = db.collection("publications").where("user_id", "==", uid);

      const pubSnap = await pubQuery.get();
      enriched.publications_collection = pubSnap.docs.map((d: any) => ({
        id: d.id,
        ...d.data(),
      }));
    } catch {}
  }

  // Fetch appraisals summary
  if (sections.includes("appraisals")) {
    try {
      const appraisalSnap = await db
        .collection("appraisals")
        .where("user_id", "==", uid)
        .orderBy("created_at", "desc")
        .limit(5)
        .get();
      enriched.appraisals_summary = appraisalSnap.docs.map((d: any) => ({
        id: d.id,
        ...d.data(),
      }));
    } catch {}
  }

  return enriched;
}

function filterByDateRange(partB: any, from: string, to: string): any {
  if (!from || !to) return partB;
  const fromTs = new Date(from).getTime();
  const toTs = new Date(to).getTime();

  function inRange(item: any): boolean {
    const yr = Number(item?.year ?? item?.publicationYear ?? 0);
    if (!yr) return true; // keep if no year
    const d = new Date(yr, 0, 1).getTime();
    return d >= fromTs && d <= toTs;
  }

  const result = { ...partB };
  if (result.table2) {
    result.table2 = { ...result.table2 };
    for (const key of [
      "researchPapers",
      "publications",
      "researchProjects",
      "consultancyProjects",
    ] as const) {
      if (Array.isArray(result.table2[key])) {
        result.table2[key] = result.table2[key].filter(inRange);
      }
    }
  }
  return result;
}

function computeUserStats(user: any) {
  const pb = user?.part_b ?? {};
  return {
    papers: (pb?.table2?.researchPapers ?? []).length,
    pubs: (pb?.table2?.publications ?? []).length,
    projects: (pb?.table2?.researchProjects ?? []).length,
    consultancy: (pb?.table2?.consultancyProjects ?? []).length,
    patents: (pb?.patents_policy_awards ?? []).length,
    lectures: (pb?.invited_lectures ?? []).length,
    guidance: (pb?.table2?.researchGuidance ?? []).length,
  };
}

function computeDeptStats(users: any[]) {
  return {
    totalFaculty: users.length,
    totalPapers: users.reduce(
      (s, u) => s + (u?.part_b?.table2?.researchPapers ?? []).length,
      0,
    ),
    totalPubs: users.reduce(
      (s, u) => s + (u?.part_b?.table2?.publications ?? []).length,
      0,
    ),
    totalProjects: users.reduce(
      (s, u) => s + (u?.part_b?.table2?.researchProjects ?? []).length,
      0,
    ),
    totalPatents: users.reduce(
      (s, u) => s + (u?.part_b?.patents_policy_awards ?? []).length,
      0,
    ),
  };
}
