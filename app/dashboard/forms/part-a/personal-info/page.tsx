"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// ===== Personal & Contact Information Fields (part_a.personal_in) =====
const personalContactFields = [
  { id: "name", label: "Name (Block Letters)", type: "text", required: true },
  { id: "department", label: "Department", type: "text", required: true },
  {
    id: "current_designation",
    label: "Current Designation & Academic Level",
    type: "text",
    required: true,
  },
  {
    id: "date_last_promotion",
    label: "Date of Last Promotion",
    type: "date",
    required: true,
  },
  { id: "level_cas", label: "Level under CAS", type: "text", required: true },
  {
    id: "designation_applied",
    label: "Designation applied for",
    type: "text",
    required: true,
  },
  {
    id: "date_eligibility",
    label: "Date of Eligibility for Promotion",
    type: "date",
    required: true,
  },
  { id: "address", label: "Address", type: "text", required: true },
  { id: "telephone", label: "Telephone", type: "tel", required: true },
  { id: "email", label: "Email", type: "email", required: true },
];

export default function PersonalContactModule() {
  const [personalIn, setPersonalIn] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user and part_a.personal_in
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
          const data = docSnap.data();
          setPersonalIn(data?.part_a?.personal_in || {});
        } else {
          setPersonalIn({});
        }
      } catch (err) {
        console.error("Error fetching personal info:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (id: string, value: string) => {
    setPersonalIn((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      const userRef = doc(firestore, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // update nested path part_a.personal_in
        await updateDoc(userRef, { "part_a.personal_in": personalIn });
      } else {
        // create new document with nested path
        await setDoc(userRef, { part_a: { personal_in: personalIn } });
      }

      setEditing(false);
      alert("Personal & Contact Information saved successfully!");
    } catch (err) {
      console.error("Error saving personal info:", err);
      alert("Failed to save details");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-medium">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl">
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
            Personal & Contact Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {personalContactFields.map((field) => (
            <div key={field.id} className="flex flex-col">
              <label className="text-sm font-medium text-muted-foreground mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                required={field.required}
                value={personalIn[field.id] || ""}
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
                Edit Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
