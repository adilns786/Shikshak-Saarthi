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
  DialogClose,
} from "@/components/ui/dialog";

// Fields for Courses & FDP
const courseFields = [
  { id: "name", label: "Name of Course", type: "text", required: true },
  { id: "place", label: "Place", type: "text", required: true },
  { id: "duration", label: "Duration", type: "text", required: true },
  { id: "organizer", label: "Organizer", type: "text", required: true },
];

export default function CoursesFDPModule() {
  const [courses, setCourses] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // 🧠 Load Firestore + localStorage
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
        const data = docSnap.exists() ? docSnap.data()?.part_a?.courses_fdp || [] : [];
        const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");
        const localCourses = llmStorage.courses_fdp || [];

        const existingCourses = [...data];
        const suggestedCourses: any[] = [];

        // Detect differences or new suggestions
        localCourses.forEach((localCourse: any) => {
          const match = existingCourses.find(
            (c) =>
              c.name === localCourse.name &&
              c.place === localCourse.place &&
              c.duration === localCourse.duration &&
              c.organizer === localCourse.organizer
          );
          if (!match) {
            suggestedCourses.push(localCourse);
          }
        });

        setCourses(existingCourses);
        setSuggestions(suggestedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 💾 Save or update course
  const handleSave = async (row: any, index?: number, closeModal?: () => void) => {
    let updatedCourses = [...courses];
    if (index !== undefined) {
      updatedCourses[index] = row;
    } else {
      updatedCourses.push(row);
    }
    setCourses(updatedCourses);
    if (closeModal) closeModal();

    if (!userId) return;
    const userRef = doc(firestore, "users", userId);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        await updateDoc(userRef, { "part_a.courses_fdp": updatedCourses });
      } else {
        await setDoc(userRef, { part_a: { courses_fdp: updatedCourses } });
      }

      // 💾 Save to localStorage
      const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");
      localStorage.setItem(
        "llm",
        JSON.stringify({
          ...llmStorage,
          courses_fdp: updatedCourses,
        })
      );
    } catch (err) {
      console.error("Error saving course:", err);
    }
  };

  // 🧹 Delete a course
  const handleDelete = async (index: number) => {
    const updatedCourses = [...courses];
    updatedCourses.splice(index, 1);
    setCourses(updatedCourses);

    if (!userId) return;
    const userRef = doc(firestore, "users", userId);
    try {
      await updateDoc(userRef, { "part_a.courses_fdp": updatedCourses });
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  };

  // ✅ Apply a suggested new course
  const handleApplySuggestion = (index: number) => {
    const newRow = suggestions[index];
    setCourses((prev) => [...prev, newRow]);
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  // ❌ Undo a suggestion (remove it)
  const handleUndoSuggestion = (index: number) => {
    const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");
    const localCourses = llmStorage.courses_fdp || [];
    const newSuggestions = [...suggestions];
    if (localCourses[index]) newSuggestions.push(localCourses[index]);
    setSuggestions(newSuggestions);
  };

  // ⚡ Apply all suggestions at once
  const handleApplyAll = () => {
    setCourses((prev) => [...prev, ...suggestions]);
    setSuggestions([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-medium">
        Loading...
      </div>
    );
  }

  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-4xl shadow-xl rounded-2xl">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <CardTitle className="text-2xl font-bold text-primary">
              Courses & FDP
            </CardTitle>
          </div>

          <div className="flex space-x-2">
            {hasSuggestions && (
              <Button variant="default" size="sm" onClick={handleApplyAll}>
                Apply All Suggestions
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" /> Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Course / FDP</DialogTitle>
                </DialogHeader>
                <CourseForm
                  onSave={(data, close) => handleSave(data, undefined, close)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {courses.length === 0 && suggestions.length === 0 ? (
            <p className="text-muted-foreground">No courses added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200 rounded-md">
                <thead>
                  <tr className="bg-gray-100">
                    {courseFields.map((f) => (
                      <th key={f.id} className="px-4 py-2 border">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Existing rows */}
                  {courses.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {courseFields.map((f) => (
                        <td key={f.id} className="px-4 py-2 border">
                          {row[f.id]}
                        </td>
                      ))}
                      <td className="px-4 py-2 border flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Course / FDP</DialogTitle>
                            </DialogHeader>
                            <CourseForm
                              initialData={row}
                              onSave={(data, close) =>
                                handleSave(data, index, close)
                              }
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {/* Suggested new rows */}
                  {suggestions.map((row, index) => (
                    <tr key={`suggest-${index}`} className="bg-yellow-50 border-t-2 border-yellow-300">
                      {courseFields.map((f) => (
                        <td key={f.id} className="px-4 py-2 border text-yellow-800">
                          {row[f.id]}
                        </td>
                      ))}
                      <td className="px-4 py-2 border flex space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApplySuggestion(index)}
                        >
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUndoSuggestion(index)}
                        >
                          Undo
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

// Reusable Course Form (for Add/Edit)
function CourseForm({
  initialData = {},
  onSave,
}: {
  initialData?: any;
  onSave: (data: any, closeModal?: () => void) => void;
}) {
  const [form, setForm] = useState<any>({
    name: "",
    place: "",
    duration: "",
    organizer: "",
    ...initialData,
  });

  const handleChange = (id: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {courseFields.map((field) => (
        <div key={field.id} className="flex flex-col">
          <label className="text-sm font-medium text-muted-foreground mb-1">
            {field.label}
          </label>
          <input
            type={field.type}
            required={field.required}
            value={form[field.id] || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      ))}
      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button type="submit" variant="default">
            Save
          </Button>
        </DialogClose>
      </div>
    </form>
  );
}
