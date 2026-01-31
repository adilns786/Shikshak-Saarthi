/**
 * Create/Update Dev Users in Firebase
 *
 * This script creates or updates the 3 dev users in Firebase Auth and Firestore
 * Run with: node scripts/create-dev-users.js
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin with your existing project
const firebaseConfig = {
  projectId: "shikshak-sarthi",
  // Will use Application Default Credentials or service account file
};

// Try to initialize Firebase Admin
try {
  // Option 1: Try to use service account file
  try {
    const serviceAccount = require("../firebaseServiceAccount.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✓ Firebase Admin initialized with service account file");
  } catch (fileError) {
    // Option 2: Try with Application Default Credentials
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
    console.log("✓ Firebase Admin initialized with default credentials");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error.message);
  console.log("\nPlease either:");
  console.log(
    "1. Download service account from Firebase Console and save as firebaseServiceAccount.json",
  );
  console.log("2. Set up Application Default Credentials");
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

const DEV_USERS = [
  //   {
  //     email: 'darshan.khapekar@ves.ac.in',
  //     password: '123456789',
  //     name: 'Darshan Khapekar',
  //     role: 'faculty',
  //     department: 'Computer',
  //     designation: 'Assistant Professor',
  //     employee_id: 'FAC001',
  //   },
  {
    email: "admin@ves.ac.in",
    password: "123456789",
    name: "Admin User",
    role: "misAdmin",
    department: "Computer",
    designation: "Administrator",
    employee_id: "ADM001",
  },
  {
    email: "nupur.giri@ves.ac.in",
    password: "123456789",
    name: "Nupur Giri",
    role: "hod",
    department: "Computer",
    designation: "Head of Department",
    employee_id: "HOD001",
  },
];

async function createOrUpdateUser(userData) {
  try {
    console.log(`\n📝 Processing: ${userData.email}...`);

    let userRecord;
    let isExisting = false;

    // Check if user exists
    try {
      userRecord = await auth.getUserByEmail(userData.email);
      isExisting = true;
      console.log(`   ℹ️  User exists in Auth (${userRecord.uid})`);

      // Update password
      await auth.updateUser(userRecord.uid, {
        password: userData.password,
        displayName: userData.name,
        emailVerified: true,
      });
      console.log(`   ✓ Password updated to: ${userData.password}`);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // Create new user
        userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.name,
          emailVerified: true,
        });
        console.log(`   ✓ Created new Auth user (${userRecord.uid})`);
      } else {
        throw error;
      }
    }

    // Create/update Firestore document
    const userDoc = {
      email: userData.email,
      name: userData.name,
      full_name: userData.name,
      role: userData.role,
      department: userData.department,
      designation: userData.designation,
      employee_id: userData.employee_id,
      phone: "",
      created_at: isExisting
        ? admin.firestore.FieldValue.serverTimestamp()
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    };

    await db
      .collection("users")
      .doc(userRecord.uid)
      .set(userDoc, { merge: true });
    console.log(
      `   ✓ Firestore document ${isExisting ? "updated" : "created"}`,
    );

    console.log(`   ✅ SUCCESS: ${userData.role.toUpperCase()} account ready`);
    console.log(`   📧 Email: ${userData.email}`);
    console.log(`   🔑 Password: ${userData.password}`);

    return { success: true, uid: userRecord.uid, isExisting };
  } catch (error) {
    console.error(`   ❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   Create/Update Dev Users in Firebase  ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`\nProject: shikshak-sarthi`);
  console.log(`Creating/Updating ${DEV_USERS.length} dev users...\n`);

  const results = [];

  for (const userData of DEV_USERS) {
    const result = await createOrUpdateUser(userData);
    results.push({ email: userData.email, role: userData.role, ...result });
  }

  console.log("\n╔════════════════════════════════════════╗");
  console.log("║            Summary                      ║");
  console.log("╚════════════════════════════════════════╝");

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const updated = results.filter((r) => r.success && r.isExisting).length;
  const created = results.filter((r) => r.success && !r.isExisting).length;

  console.log(`\n✅ Successful: ${successful}/${results.length}`);
  console.log(`   📝 Created: ${created}`);
  console.log(`   🔄 Updated: ${updated}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }

  if (failed > 0) {
    console.log("\n❌ Failed users:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.email}: ${r.error}`);
      });
  }

  console.log("\n╔════════════════════════════════════════╗");
  console.log("║        Dev Users Ready! 🎉             ║");
  console.log("╚════════════════════════════════════════╝");
  console.log("\nYou can now login with:\n");

  results
    .filter((r) => r.success)
    .forEach((r) => {
      console.log(`${r.role.toUpperCase().padEnd(10)} ${r.email}`);
    });

  console.log("\nPassword for all: 123456789");
  console.log("════════════════════════════════════════\n");

  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
