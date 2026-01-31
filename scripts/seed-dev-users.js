/**
 * Firebase Dev Users Seed Script
 * 
 * Creates 3 development users:
 * 1. darshan.khapekar@ves.ac.in - Faculty - Computer - 123456789
 * 2. admin@ves.ac.in - Admin - Computer - 123456789
 * 3. nupur.giri@ves.ac.in - HOD - Computer - 123456789
 * 
 * Run this script using Node.js:
 * node scripts/seed-dev-users.js
 */

const admin = require('firebase-admin');

// Use your existing Firebase project configuration
const firebaseConfig = {
  projectId: "shikshak-sarthi",
  // Add your service account credentials here or use the JSON file
};

// Initialize Firebase Admin
// Option 1: Using service account file
try {
  const serviceAccount = require('../firebaseServiceAccount.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✓ Firebase Admin initialized with service account file');
} catch (error) {
  // Option 2: Using environment variables or default credentials
  console.log('Note: firebaseServiceAccount.json not found. Make sure to set up Firebase Admin credentials.');
  console.log('Download from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key');
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

const DEV_USERS = [
  {
    email: 'darshan.khapekar@ves.ac.in',
    password: '123456789',
    name: 'Darshan Khapekar',
    role: 'faculty',
    department: 'Computer',
    designation: 'Assistant Professor',
    employee_id: 'FAC001',
  },
  {
    email: 'admin@ves.ac.in',
    password: '123456789',
    name: 'Admin User',
    role: 'misAdmin',
    department: 'Computer',
    designation: 'Administrator',
    employee_id: 'ADM001',
  },
  {
    email: 'nupur.giri@ves.ac.in',
    password: '123456789',
    name: 'Nupur Giri',
    role: 'hod',
    department: 'Computer',
    designation: 'Head of Department',
    employee_id: 'HOD001',
  },
];

async function createDevUser(userData) {
  try {
    console.log(`\nCreating user: ${userData.email}...`);

    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(userData.email);
      console.log(`User already exists in Auth. Updating password...`);
      
      // Update password
      await auth.updateUser(userRecord.uid, {
        password: userData.password,
        displayName: userData.name,
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.name,
          emailVerified: true, // Mark as verified for dev
        });
        console.log(`✓ Created Auth user: ${userRecord.uid}`);
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
      phone: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    };

    await db.collection('users').doc(userRecord.uid).set(userDoc, { merge: true });
    console.log(`✓ Created/Updated Firestore document`);
    console.log(`✓ User ready: ${userData.email} (${userData.role})`);
    console.log(`  Password: ${userData.password}`);

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    console.error(`✗ Error creating user ${userData.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function seedDevUsers() {
  console.log('========================================');
  console.log('Firebase Dev Users Seed Script');
  console.log('========================================');
  console.log(`Creating ${DEV_USERS.length} development users...`);

  const results = [];

  for (const userData of DEV_USERS) {
    const result = await createDevUser(userData);
    results.push({ email: userData.email, ...result });
  }

  console.log('\n========================================');
  console.log('Seed Summary:');
  console.log('========================================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✓ Successful: ${successful}`);
  console.log(`✗ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed users:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.email}: ${r.error}`);
    });
  }

  console.log('\n========================================');
  console.log('Dev Users Ready!');
  console.log('========================================');
  console.log('You can now login with:');
  DEV_USERS.forEach(user => {
    console.log(`\n${user.role.toUpperCase()}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
  });
  console.log('\n========================================');

  process.exit(0);
}

// Run the seed script
seedDevUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
