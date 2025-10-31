"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Fields for academic qualifications
const academicFields = [
  { id: "examination", label: "Examination", type: "text", required: true },
  { id: "board_university", label: "Board / University", type: "text", required: true },
  { id: "year_passing", label: "Year of Passing", type: "number", required: true },
  { id: "percentage", label: "Percentage", type: "number", required: true },
  { id: "division", label: "Class / Division", type: "text", required: true },
  { id: "subject", label: "Subject", type: "text", required: true },
];

export default function AcademicQualificationsTable() {
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<any | null>(null); // for modal
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
        const data = docSnap.exists() ? docSnap.data()?.part_a?.academic_qualifications || [] : [];

        // Merge suggestions from localStorage
        const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");
        const updatedData = data.map((row: any) => {
          const rowCopy = { ...row };
          academicFields.forEach((field) => {
            if (!rowCopy[field.id] && llmStorage[field.id]) {
              rowCopy[field.id] = llmStorage[field.id];
            }
          });
          return rowCopy;
        });

        setQualifications(updatedData);
      } catch (err) {
        console.error("Error fetching academic qualifications:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async (row: any, index?: number) => {
    let updatedQualifications = [...qualifications];
    if (index !== undefined) {
      updatedQualifications[index] = row;
    } else {
      updatedQualifications.push(row);
    }
    setQualifications(updatedQualifications);
    setEditingRow(null);

    if (!userId) return;
    const userRef = doc(firestore, "users", userId);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        await updateDoc(userRef, { "part_a.academic_qualifications": updatedQualifications });
      } else {
        await setDoc(userRef, { part_a: { academic_qualifications: updatedQualifications } });
      }

      // Update localStorage with new entries
      const llm = JSON.parse(localStorage.getItem("llm") || "{}");
      updatedQualifications.forEach((row) => {
        academicFields.forEach((field) => {
          if (row[field.id]) llm[field.id] = row[field.id];
        });
      });
      localStorage.setItem("llm", JSON.stringify(llm));
    } catch (err) {
      console.error("Error saving academic qualifications:", err);
    }
  };

  const handleDelete = async (index: number) => {
    const updatedQualifications = [...qualifications];
    updatedQualifications.splice(index, 1);
    setQualifications(updatedQualifications);

    if (!userId) return;
    const userRef = doc(firestore, "users", userId);
    try {
      await updateDoc(userRef, { "part_a.academic_qualifications": updatedQualifications });
    } catch (err) {
      console.error("Error deleting qualification:", err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-lg font-medium">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-4xl shadow-xl rounded-2xl">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <CardTitle className="text-2xl font-bold text-primary">Academic Qualifications</CardTitle>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="flex items-center space-x-1">
                <Plus className="h-4 w-4" /> <span>Add New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Academic Qualification</DialogTitle>
              </DialogHeader>
              <AcademicForm onSave={handleSave} />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {qualifications.length === 0 ? (
            <p className="text-muted-foreground">No academic qualifications added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200 rounded-md">
                <thead>
                  <tr className="bg-gray-100">
                    {academicFields.map((f) => (
                      <th key={f.id} className="px-4 py-2 border">{f.label}</th>
                    ))}
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {qualifications.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {academicFields.map((f) => (
                        <td key={f.id} className="px-4 py-2 border">{row[f.id]}</td>
                      ))}
                      <td className="px-4 py-2 border flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Edit</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Academic Qualification</DialogTitle>
                            </DialogHeader>
                            <AcademicForm
                              initialData={row}
                              onSave={(data) => handleSave(data, index)}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// AcademicForm with suggestions
function AcademicForm({ initialData = {}, onSave }: { initialData?: any; onSave: (data: any) => void; }) {
  const [form, setForm] = useState<any>({
    examination: "",
    board_university: "",
    year_passing: "",
    percentage: "",
    class_division: "",
    subject: "",
    ...initialData,
  });
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});

  // Initialize suggestions from localStorage
  useEffect(() => {
    const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");
    const sug: Record<string, string> = {};
    academicFields.forEach((field) => {
      if (!form[field.id] && llmStorage[field.id]) {
        setForm((prev: any) => ({ ...prev, [field.id]: llmStorage[field.id] }));
      } else if (form[field.id] && llmStorage[field.id] && form[field.id] !== llmStorage[field.id]) {
        sug[field.id] = llmStorage[field.id];
      }
    });
    setSuggestions(sug);
  }, [initialData]);

  const handleChange = (id: string, value: string | number) => {
    setForm((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleApplySuggestion = (id: string) => {
    setForm((prev: any) => ({ ...prev, [id]: suggestions[id] }));
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
    setForm((prev: any) => ({ ...prev, ...suggestions }));
    setSuggestions({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const hasSuggestions = Object.keys(suggestions).length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hasSuggestions && (
        <Button variant="default" size="sm" onClick={handleApplyAll}>
          Apply All Suggestions
        </Button>
      )}

      {academicFields.map((field) => (
        <div key={field.id} className="flex flex-col">
          <label className="text-sm font-medium text-muted-foreground mb-1">{field.label}</label>
          <input
            type={field.type}
            required={field.required}
            value={form[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
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

      <div className="flex justify-end space-x-2">
        <Button type="submit" variant="default">Save</Button>
      </div>
    </form>
  );
}
