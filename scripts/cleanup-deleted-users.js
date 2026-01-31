/**
 * Clean up deleted users from Firebase
 * Run with: node scripts/cleanup-deleted-users.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDGQBmII23F0_FcapkfbkYlRPvPsWF0AoI",
  authDomain: "shikshak-sarthi.firebaseapp.com",
  projectId: "shikshak-sarthi",
  storageBucket: "shikshak-sarthi.firebasestorage.app",
  messagingSenderId: "288398474610",
  appId: "1:288398474610:web:2f6b5130055b0a3b821cd2",
  measurementId: "G-9WX81T1H88"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupDeletedUsers() {
  try {
    console.log('🔍 Checking for orphaned user data...\n');

    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    const deletedUsers = ['Riya Mehta']; // Add names of deleted users here
    let cleanedCount = 0;

    for (const userDoc of querySnapshot.docs) {
      const userData = userDoc.data();
      const userName = userData.name || userData.full_name || userData.email;
      
      if (deletedUsers.some(name => userName.includes(name))) {
        console.log(`🗑️  Removing: ${userName} (${userDoc.id})`);
        await deleteDoc(doc(db, 'users', userDoc.id));
        cleanedCount++;
      }
    }

    if (cleanedCount === 0) {
      console.log('✅ No orphaned data found. Database is clean!');
    } else {
      console.log(`\n✅ Cleaned up ${cleanedCount} orphaned user record(s).`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupDeletedUsers();
