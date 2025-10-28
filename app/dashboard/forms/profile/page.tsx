"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// ===== Basic Details Module (formHeader) =====
const basicDetailsFields = [
  { id: "institute_name", label: "Name of the Institute / College", type: "text", required: true },
  { id: "department_name", label: "Name of the Department", type: "text", required: true },
  { id: "cas_promotion_stage", label: "Under CAS Promotion for Stage/Level For", type: "text", required: true },
  { id: "faculty_name", label: "Faculty of", type: "text", required: true },
  { id: "academic_year", label: "Academic Year", type: "text", required: true },
];

export default function BasicDetailsModule() {
  const [formHeader, setFormHeader] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user and formHeader
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
        const data = docSnap.exists() ? docSnap.data()?.formHeader || {} : {};
        const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");

        const filledData: Record<string, any> = { ...data };
        const suggestionData: Record<string, string> = {};

        basicDetailsFields.forEach((field) => {
          if (!data[field.id] && llmStorage[field.id]) {
            filledData[field.id] = llmStorage[field.id]; // auto-fill empty
          } else if (data[field.id] && llmStorage[field.id] && data[field.id] !== llmStorage[field.id]) {
            suggestionData[field.id] = llmStorage[field.id]; // suggestion
          }
        });

        setFormHeader(filledData);
        setSuggestions(suggestionData);
      } catch (err) {
        console.error("Error fetching formHeader:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (id: string, value: string) => {
    setFormHeader((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleApplySuggestion = (id: string) => {
    setFormHeader((prev: any) => ({ ...prev, [id]: suggestions[id] }));
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
    setFormHeader((prev) => ({ ...prev, ...suggestions }));
    setSuggestions({});
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      const userRef = doc(firestore, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, { formHeader });
      } else {
        await setDoc(userRef, { formHeader });
      }

      // Save updated values to localStorage
      localStorage.setItem("llm", JSON.stringify({ ...(JSON.parse(localStorage.getItem("llm") || "{}")), ...formHeader }));

      setEditing(false);
      alert("Basic details saved successfully!");
    } catch (err) {
      console.error("Error saving formHeader:", err);
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

  const hasSuggestions = Object.keys(suggestions).length > 0;

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
            Basic Details (Form Header)
          </CardTitle>
          {hasSuggestions && editing && (
            <Button variant="default" size="sm" onClick={handleApplyAll}>
              Apply All Suggestions
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {basicDetailsFields.map((field) => (
            <div key={field.id} className="flex flex-col">
              <label className="text-sm font-medium text-muted-foreground mb-1">{field.label}</label>
              <input
                type={field.type}
                required={field.required}
                value={formHeader[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={!editing}
                className={`p-2 border rounded-md ${
                  editing
                    ? "border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    : "border-gray-200 bg-gray-100"
                }`}
              />

              {/* Suggested value */}
              {editing && suggestions[field.id] && (
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
              <Button variant="default" onClick={() => setEditing(true)}>Edit Details</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
