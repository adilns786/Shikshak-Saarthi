"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db as firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("✅ Admin page mounted");

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("👀 Auth state changed:", currentUser?.email || "No user");

      if (!currentUser) {
        console.log("⛔ No logged-in user. Redirecting to /auth/login");
        router.replace("/auth/login");
        return;
      }

      try {
        const userRef = doc(firestore, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.log("⚠️ No user record found in Firestore");
          router.replace("/auth/login");
          return;
        }

        const data = userSnap.data();
        console.log("🔹 User data:", data);

        if (data.role !== "misAdmin") {
          console.log("🚫 Not an admin. Redirecting to /dashboard");
          router.replace("/dashboard");
          return;
        }

        setUser(currentUser);
        setUserData(data);

        // Fetch all users if MIS Admin
        const usersSnapshot = await getDocs(collection(firestore, "users"));
        setAllUsers(
          usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("🔥 Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading Admin Dashboard...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        No access. Redirecting...
      </div>
    );
  }

  const facultyCount = allUsers.filter((u) => u.role === "faculty").length;
  const adminCount = allUsers.filter((u) => u.role === "misAdmin").length;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-lg p-6">
        <CardHeader>
          <CardTitle>Welcome, MIS Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-700">
            Logged in as: <b>{userData?.name}</b> ({user?.email})
          </p>

          <div className="space-y-2 text-sm">
            <p>Total Users: {allUsers.length}</p>
            <p>Faculty: {facultyCount}</p>
            <p>Admins: {adminCount}</p>
          </div>

          <Button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 mt-6"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
