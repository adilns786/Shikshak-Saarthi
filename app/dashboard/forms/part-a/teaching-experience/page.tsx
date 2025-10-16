"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// Fields for Teaching & Research Experience
const experienceFields = [
  {
    id: "pg_years",
    label: "P.G. Classes (Years)",
    type: "number",
    required: true,
  },
  {
    id: "ug_years",
    label: "U.G. Classes (Years)",
    type: "number",
    required: true,
  },
  {
    id: "research_years",
    label: "Research Experience (Years)",
    type: "number",
    required: true,
  },
  {
    id: "specialization",
    label: "Field of Specialization",
    type: "text",
    required: true,
  },
];

export default function TeachingResearchExperience() {
  const [experience, setExperience] = useState<any>({});
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
          const data = docSnap.data();
          setExperience(data?.part_a?.teaching_research_experience || {});
        } else {
          setExperience({});
        }
      } catch (err) {
        console.error("Error fetching experience:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (id: string, value: string | number) => {
    setExperience((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!userId) return;

    const userRef = doc(firestore, "users", userId);
    try {
      await updateDoc(userRef, {
        "part_a.teaching_research_experience": experience,
      });
      setEditing(false);
      alert("Teaching & Research Experience saved successfully!");
    } catch (err) {
      console.error("Error saving experience:", err);
      alert("Failed to save experience");
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
            Teaching & Research Experience
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {experienceFields.map((field) => (
            <div key={field.id} className="flex flex-col">
              <label className="text-sm font-medium text-muted-foreground mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                required={field.required}
                value={experience[field.id] || ""}
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
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
