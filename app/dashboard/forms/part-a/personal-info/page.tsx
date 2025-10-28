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
  { id: "current_designation", label: "Current Designation & Academic Level", type: "text", required: true },
  { id: "date_last_promotion", label: "Date of Last Promotion", type: "date", required: true },
  { id: "level_cas", label: "Level under CAS", type: "text", required: true },
  { id: "designation_applied", label: "Designation applied for", type: "text", required: true },
  { id: "date_eligibility", label: "Date of Eligibility for Promotion", type: "date", required: true },
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
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});

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
        const data = docSnap.exists() ? docSnap.data()?.part_a?.personal_in || {} : {};
        const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");

        // Auto-fill empty fields from localStorage
        const filledData: Record<string, any> = { ...data };
        const suggestionData: Record<string, string> = {};
        personalContactFields.forEach((field) => {
          if (!data[field.id] && llmStorage[field.id]) {
            filledData[field.id] = llmStorage[field.id];
          } else if (data[field.id] && llmStorage[field.id] && data[field.id] !== llmStorage[field.id]) {
            suggestionData[field.id] = llmStorage[field.id];
          }
        });

        setPersonalIn(filledData);
        setSuggestions(suggestionData);
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

  const handleApplySuggestion = (id: string) => {
    setPersonalIn((prev: any) => ({ ...prev, [id]: suggestions[id] }));
    setSuggestions((prev) => {
      const newS = { ...prev };
      delete newS[id];
      return newS;
    });
  };

  const handleUndoSuggestion = (id: string) => {
    setSuggestions((prev) => {
      const newS = { ...prev, [id]: JSON.parse(localStorage.getItem("llm") || "{}")[id] };
      return newS;
    });
  };

  const handleApplyAll = () => {
    const allSuggestions = { ...suggestions };
    setPersonalIn((prev) => ({ ...prev, ...allSuggestions }));
    setSuggestions({});
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      const userRef = doc(firestore, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, { "part_a.personal_in": personalIn });
      } else {
        await setDoc(userRef, { part_a: { personal_in: personalIn } });
      }

      // Save updated values in localStorage as well
      localStorage.setItem("llm", JSON.stringify({ ...(JSON.parse(localStorage.getItem("llm") || "{}")), ...personalIn }));

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
            Personal & Contact Information
          </CardTitle>
          {hasSuggestions && editing && (
            <Button variant="default" size="sm" onClick={handleApplyAll}>
              Apply All Suggestions
            </Button>
          )}
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

              {/* Show suggestion if exists */}
              {editing && suggestions[field.id] && (
                <div className="flex items-center justify-between mt-1 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                  <span className="text-sm text-yellow-800">
                    Suggested: {suggestions[field.id]}
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="default" onClick={() => handleApplySuggestion(field.id)}>
                      Apply
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleUndoSuggestion(field.id)}>
                      Undo
                    </Button>
                  </div>
                </div>
              )}
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
