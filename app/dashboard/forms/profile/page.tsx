"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const profileFields = [
  {
    id: "institute_name",
    label: "Name of the Institute / College",
    type: "text",
    required: true,
  },
  {
    id: "department_name",
    label: "Name of the Department",
    type: "text",
    required: true,
  },
  {
    id: "cas_promotion_stage",
    label: "Under CAS Promotion for Stage/Level For",
    type: "text",
    required: true,
  },
  { id: "faculty_name", label: "Faculty of", type: "text", required: true },
  { id: "academic_year", label: "ACADEMIC YEAR", type: "text", required: true },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      setUserId(user.uid);

      try {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile({});
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (id: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      await setDoc(doc(firestore, "users", userId), profile, { merge: true });
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-medium">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-col space-y-4">
          <Button
            variant="outline"
            size="sm"
            className="w-fit flex items-center space-x-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <CardTitle className="text-2xl font-bold text-primary">
            Profile
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {profileFields.map((field) => (
            <div key={field.id} className="flex flex-col">
              <label className="text-sm font-medium text-muted-foreground mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                required={field.required}
                value={profile[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={!editing}
                className={`p-2 border rounded-md ${
                  editing
                    ? "border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    : "border-gray-200 bg-gray-100"
                }`}
              />
            </div>
          ))}

          <div className="flex space-x-2 mt-4">
            {editing ? (
              <>
                <Button variant="default" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="default" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
