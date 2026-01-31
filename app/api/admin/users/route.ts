import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return { auth: getAuth(), db: getFirestore() };
};

// Generate random password
const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      role,
      department,
      designation,
      employee_id,
      phone,
      password: customPassword,
    } = body;

    if (!email || !name || !role || !department) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validRoles = ["faculty", "hod", "admin", "misAdmin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const { auth, db } = initializeFirebaseAdmin();
    const password = customPassword || generatePassword();

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    // Create user document in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email,
      name,
      full_name: name,
      role,
      department,
      designation: designation || "Faculty",
      employee_id: employee_id || "",
      phone: phone || "",
      created_at: new Date().toISOString(),
      is_active: true,
    });

    return NextResponse.json({
      success: true,
      userId: userRecord.uid,
      email,
      temporaryPassword: password,
      message: `${role === "hod" ? "HOD" : "User"} account created successfully`,
    });
  } catch (error: unknown) {
    console.error("Create user error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create user";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, department, designation } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing required fields: userId, role" },
        { status: 400 }
      );
    }

    const validRoles = ["faculty", "hod", "admin", "misAdmin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const { db } = initializeFirebaseAdmin();

    const updateData: Record<string, unknown> = {
      role,
      updated_at: new Date().toISOString(),
    };

    if (department) updateData.department = department;
    if (designation) updateData.designation = designation;

    await db.collection("users").doc(userId).update(updateData);

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error: unknown) {
    console.error("Update user error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update user";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const { auth, db } = initializeFirebaseAdmin();

    // Delete from Firestore
    await db.collection("users").doc(userId).delete();

    // Delete from Firebase Auth
    try {
      await auth.deleteUser(userId);
    } catch (authError) {
      console.error("Error deleting auth user:", authError);
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete user error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
