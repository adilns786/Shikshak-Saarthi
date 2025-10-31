"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// Fields for Teaching & Research Experience
const experienceFields = [
  { id: "pg_classes", label: "P.G. Classes (Years)", type: "number", required: true },
  { id: "ug_classes", label: "U.G. Classes (Years)", type: "number", required: true },
  { id: "research_experience", label: "Research Experience (Years)", type: "number", required: true },
  { id: "specialization_fields", label: "Field of Specialization", type: "text", required: true },
];

export default function TeachingResearchExperience() {
  const [experience, setExperience] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
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
        const data = docSnap.exists() ? docSnap.data()?.part_a?.teaching_research_experience || {} : {};

        const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");
        const sug: Record<string, string> = {};
        const mergedData: any = { ...data };

        experienceFields.forEach((field) => {
          if (!mergedData[field.id] && llmStorage[field.id]) {
            mergedData[field.id] = llmStorage[field.id];
          } else if (mergedData[field.id] && llmStorage[field.id] && mergedData[field.id] !== llmStorage[field.id]) {
            sug[field.id] = llmStorage[field.id];
          }
        });

        setExperience(mergedData);
        setSuggestions(sug);
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
    // Remove suggestion if user changes value manually
    if (suggestions[id]) {
      setSuggestions((prev) => {
        const newS = { ...prev };
        delete newS[id];
        return newS;
      });
    }
  };

  const handleApplySuggestion = (id: string) => {
    setExperience((prev: any) => ({ ...prev, [id]: suggestions[id] }));
    setSuggestions((prev) => {
      const newS = { ...prev };
      delete newS[id];
      return newS;
    });
  };

  const handleUndoSuggestion = (id: string) => {
    const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");
    setSuggestions((prev) => ({ ...prev, [id]: llmStorage[id] }));
  };

  const handleApplyAll = () => {
    setExperience((prev: any) => ({ ...prev, ...suggestions }));
    setSuggestions({});
  };

  const handleSave = async () => {
    if (!userId) return;

    const userRef = doc(firestore, "users", userId);
    try {
      await updateDoc(userRef, { "part_a.teaching_research_experience": experience });
      setEditing(false);

      // Update localStorage
      const llm = JSON.parse(localStorage.getItem("llm") || "{}");
      experienceFields.forEach((field) => {
        if (experience[field.id]) llm[field.id] = experience[field.id];
      });
      localStorage.setItem("llm", JSON.stringify(llm));

      alert("Teaching & Research Experience saved successfully!");
    } catch (err) {
      console.error("Error saving experience:", err);
      alert("Failed to save experience");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-lg font-medium">Loading...</div>;
  }

  const hasSuggestions = Object.keys(suggestions).length > 0;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl">
        <CardHeader className="flex flex-col space-y-4">
          <Button variant="outline" size="sm" className="w-fit flex items-center space-x-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> <span>Back</span>
          </Button>
          <CardTitle className="text-2xl font-bold text-primary">Teaching & Research Experience</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {hasSuggestions && (
            <Button variant="default" size="sm" onClick={handleApplyAll}>
              Apply All Suggestions
            </Button>
          )}

          {experienceFields.map((field) => (
            <div key={field.id} className="flex flex-col">
              <label className="text-sm font-medium text-muted-foreground mb-1">{field.label}</label>
              <input
                type={field.type}
                required={field.required}
                value={experience[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={!editing}
                className={`p-2 border rounded-md ${
                  editing ? "border-primary focus:outline-none focus:ring-2 focus:ring-primary" : "border-gray-200 bg-gray-100"
                }`}
              />
              {suggestions[field.id] && (
                <div className="flex items-center justify-between mt-1 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                  <span className="text-sm text-yellow-800">Suggested: {suggestions[field.id]}</span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="default" onClick={() => handleApplySuggestion(field.id)}>Apply</Button>
                    <Button size="sm" variant="outline" onClick={() => handleUndoSuggestion(field.id)}>Undo</Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex space-x-2 mt-4">
            {editing ? (
              <>
                <Button variant="default" onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </>
            ) : (
              <Button variant="default" onClick={() => setEditing(true)}>Edit</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
