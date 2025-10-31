import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebaseConfig";

export async function GET() {
  try {
    // Replace with your known single UID
    const userUid = "PBcdi3vSP8PgvDiDlMWzIbD9Jq63"; 

    // Reference to that single user's document
    const docRef = doc(firestore, "users", userUid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "User document not found" },
        { status: 404 }
      );
    }

    // Return document data as JSON
    return NextResponse.json({
      id: docSnap.id,
      ...docSnap.data(),
    });
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data", details: error.message },
      { status: 500 }
    );
  }
}
