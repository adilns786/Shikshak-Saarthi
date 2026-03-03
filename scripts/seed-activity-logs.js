/**
 * Activity Logs Seed Script
 *
 * Seeds sample activity logs for development/testing.
 * Uses the same dev users created by seed-dev-users.js.
 *
 * Run: node scripts/seed-activity-logs.js
 */

const admin = require("firebase-admin");

try {
  let serviceAccount;
  try {
    serviceAccount = require("../firebaseServiceAccount.json");
  } catch {
    serviceAccount = require("../_server/firebaseConfig.json");
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✓ Firebase Admin initialized");
} catch (error) {
  console.log("Note: No Firebase service account JSON found.");
  process.exit(1);
}

const db = admin.firestore();

// ── Dev users (must match seed-dev-users.js) ──────────────────────────────
const USERS = [
  {
    email: "darshan.khapekar@ves.ac.in",
    name: "Darshan Khapekar",
    role: "faculty",
    department: "Computer",
    uid: null, // resolved at runtime
  },
  {
    email: "admin@ves.ac.in",
    name: "Admin User",
    role: "misAdmin",
    department: "Computer",
    uid: null,
  },
  {
    email: "nupur.giri@ves.ac.in",
    name: "Nupur Giri",
    role: "hod",
    department: "Computer",
    uid: null,
  },
];

// ── System and Data Ingestion Actions ─────────────────────────────────

const SYSTEM_ACTIONS = [
  {
    action: "DATA_IMPORT",
    description: "System imported PBAS Part A personal & academic data",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 1 },
  },
  {
    action: "DATA_IMPORT",
    description: "System imported PBAS Part B research papers (4 records)",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 4 },
  },
  {
    action: "DATA_IMPORT",
    description: "System imported PBAS Part B publications (2 records)",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 2 },
  },
  {
    action: "DATA_IMPORT",
    description: "System imported PBAS Part B research projects (2 records)",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 2 },
  },
  {
    action: "DATA_IMPORT",
    description: "System imported PBAS part B consultancy projects",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 2 },
  },
  {
    action: "DATA_IMPORT",
    description: "System imported PBAS Part B ICT innovations",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 1 },
  },
  {
    action: "DATA_IMPORT",
    description:
      "System imported PBAS Part B research student guidance (5 records)",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 5 },
  },
  {
    action: "DATA_IMPORT",
    description: "System imported PBAS patents and awards (3 records)",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 3 },
  },
  {
    action: "DATA_IMPORT",
    description: "System imported PBAS invited lectures and talks (3 records)",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 3 },
  },
  {
    action: "DATA_IMPORT",
    description: "System imported academic qualifications (4 records)",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 4 },
  },
  {
    action: "DATA_IMPORT",
    description: "System imported research degrees (1 record - Ph.D)",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 1 },
  },
  {
    action: "DATA_IMPORT",
    description: "System imported FDP and professional development (5 courses)",
    resourceType: "data_ingestion",
    metadata: { source: "system_ingest", records: 5 },
  },
  {
    action: "DATABASE_SYNC",
    description: "System synchronized PBAS database with master records",
    resourceType: "system",
    metadata: { status: "success" },
  },
  {
    action: "DATA_VALIDATION",
    description: "System validated all PBAS records for data integrity",
    resourceType: "system",
    metadata: { records_validated: 1, issues_found: 0 },
  },
  {
    action: "SYSTEM_INIT",
    description: "System initialized PBAS data management platform",
    resourceType: "system",
    metadata: { version: "1.0", status: "ready" },
  },
];

// Legacy user actions (not in use - kept for reference)
const FACULTY_ACTIONS = [
  {
    action: "LOGIN",
    description: "User logged into the system",
    resourceType: "auth",
  },
  {
    action: "FORM_SAVE",
    description: "Saved PBAS Part-A personal information form",
    resourceType: "form",
    resourceId: "part-a-personal-info",
  },
  {
    action: "FORM_SAVE",
    description: "Saved PBAS Part-B teaching workload data",
    resourceType: "form",
    resourceId: "part-b-teaching",
  },
  {
    action: "PUBLICATION_ADD",
    description:
      "Added new research publication: Machine Learning in Education",
    resourceType: "publication",
  },
  {
    action: "PBAS_SUBMIT",
    description: "Submitted PBAS data for academic year 2024-25",
    resourceType: "form",
    resourceId: "PBAS-2024-001",
  },
  {
    action: "PROFILE_UPDATE",
    description: "Updated profile photo and contact information",
    resourceType: "profile",
  },
  {
    action: "FORM_VIEW",
    description: "Viewed PBAS form submission history",
    resourceType: "form",
  },
  {
    action: "REPORT_GENERATE",
    description: "Generated annual PBAS performance report PDF",
    resourceType: "report",
  },
  {
    action: "PASSWORD_CHANGE",
    description: "Changed account password",
    resourceType: "auth",
  },
  {
    action: "PUBLICATION_ADD",
    description: "Added journal publication: Deep Learning Applications",
    resourceType: "publication",
  },
  {
    action: "LOGOUT",
    description: "User logged out of the system",
    resourceType: "auth",
  },
  {
    action: "AI_QUERY",
    description: "Used AI Assistant for PBAS form guidance",
    resourceType: "ai",
  },
  {
    action: "FORM_SAVE",
    description: "Saved Part-B research papers and publications",
    resourceType: "form",
    resourceId: "part-b-table2",
  },
  {
    action: "DATA_EXPORT",
    description: "Exported personal PBAS data as CSV",
    resourceType: "export",
  },
];

const HOD_ACTIONS = [
  {
    action: "LOGIN",
    description: "HOD logged into dashboard",
    resourceType: "auth",
  },
  {
    action: "PBAS_REVIEW",
    description: "Reviewed faculty PBAS submission: Darshan Khapekar (2024-25)",
    resourceType: "form",
    resourceId: "PBAS-2024-001",
  },
  {
    action: "DATA_EXPORT",
    description: "Exported department faculty PBAS data CSV",
    resourceType: "export",
  },
  {
    action: "USER_VIEW",
    description: "Viewed faculty PBAS list for Computer department",
    resourceType: "user",
  },
  {
    action: "REPORT_VIEW",
    description: "Viewed analytics dashboard for Q3 2024",
    resourceType: "report",
  },
  {
    action: "FORM_VIEW",
    description: "Reviewed incomplete PBAS submissions",
    resourceType: "form",
  },
  {
    action: "LOGOUT",
    description: "HOD logged out",
    resourceType: "auth",
  },
  {
    action: "AI_QUERY",
    description: "Generated AI insights report for department",
    resourceType: "ai",
  },
];

const ADMIN_ACTIONS = [
  {
    action: "LOGIN",
    description: "Admin logged into control panel",
    resourceType: "auth",
  },
  {
    action: "USER_CREATE",
    description: "Created new faculty account: sneha.naik@ves.ac.in",
    resourceType: "user",
  },
  {
    action: "USER_ROLE_UPDATE",
    description: "Updated user role to HOD: nupur.giri@ves.ac.in",
    resourceType: "user",
  },
  {
    action: "DATA_EXPORT",
    description: "Exported all faculty PBAS data across departments",
    resourceType: "export",
  },
  {
    action: "SYSTEM_CONFIG",
    description: "Updated PBAS submission deadline to March 31, 2025",
    resourceType: "config",
  },
  {
    action: "ACTIVITY_LOGS_VIEW",
    description: "Viewed system-wide activity logs",
    resourceType: "logs",
  },
  {
    action: "USER_DEACTIVATE",
    description: "Deactivated user account: retired.faculty@ves.ac.in",
    resourceType: "user",
  },
  {
    action: "REPORT_GENERATE",
    description: "Generated institution-wide PBAS summary report",
    resourceType: "report",
  },
  {
    action: "DATA_IMPORT",
    description: "Imported PBAS data for 12 faculty from CSV file",
    resourceType: "import",
  },
  {
    action: "LOGOUT",
    description: "Admin logged out",
    resourceType: "auth",
  },
];

// ── Helper: random date in last N days ───────────────────────────────────
function randomDate(daysBack = 30) {
  const now = Date.now();
  const offset = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
}

// ── Resolve UIDs from Auth ────────────────────────────────────────────────
async function resolveUids() {
  for (const user of USERS) {
    try {
      const record = await admin.auth().getUserByEmail(user.email);
      user.uid = record.uid;
      console.log(`✓ Resolved UID for ${user.email}: ${user.uid}`);
    } catch {
      console.warn(`⚠ Could not resolve UID for ${user.email}. Skipping.`);
    }
  }
}

// ── Seed a batch of logs for a user ──────────────────────────────────────
async function seedLogsForUser(user, actions) {
  if (!user.uid) return;

  const batch = db.batch();
  for (const actionTemplate of actions) {
    const logRef = db.collection("activity_logs").doc();
    const ts = randomDate(45);
    batch.set(logRef, {
      user_id: user.uid,
      user_email: user.email,
      user_name: user.name,
      user_role: user.role,
      department: user.department,
      action: actionTemplate.action,
      description: actionTemplate.description,
      resource_type: actionTemplate.resourceType || null,
      resource_id: actionTemplate.resourceId || null,
      metadata: {},
      ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      timestamp: ts.toISOString(),
      created_at: admin.firestore.Timestamp.fromDate(ts),
    });
  }
  await batch.commit();
  console.log(`✓ Seeded ${actions.length} logs for ${user.email}`);
}

// ── Main ──────────────────────────────────────────────────────────────────
async function seedActivityLogs() {
  console.log("========================================");
  console.log("PBAS Activity Logs Seed Script");
  console.log("========================================\n");

  // Seed system logs (not tied to specific users)
  const batch = db.batch();
  for (const actionTemplate of SYSTEM_ACTIONS) {
    const logRef = db.collection("activity_logs").doc();
    const ts = randomDate(60);
    batch.set(logRef, {
      user_id: "system",
      user_email: "system@shikshak-sarthi.local",
      user_name: "PBAS System",
      user_role: "system",
      department: null,
      action: actionTemplate.action,
      description: actionTemplate.description,
      resource_type: actionTemplate.resourceType || null,
      resource_id: null,
      metadata: actionTemplate.metadata || {},
      ip_address: "127.0.0.1",
      user_agent: "PBAS-System/1.0",
      timestamp: ts.toISOString(),
      created_at: admin.firestore.Timestamp.fromDate(ts),
    });
  }
  await batch.commit();

  console.log(`✓ Seeded ${SYSTEM_ACTIONS.length} system data ingestion logs`);
  console.log("\n========================================");
  console.log(`✓ Activity logs seed completed`);
  console.log("========================================\n");

  process.exit(0);
}

seedActivityLogs().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
