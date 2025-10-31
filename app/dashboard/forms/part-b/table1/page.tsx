"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Plus, Lightbulb, X, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// Field definitions
const teachingFields = [
  { id: "activity_name", label: "Activity Name", type: "text", required: true },
  { id: "category", label: "Category", type: "text", required: true },
  { id: "unit_of_calculation", label: "Unit of Calculation", type: "text", required: true },
  { id: "actual_class_spent", label: "Actual Class Spent", type: "number", required: true },
  { id: "percent_teaching", label: "% Teaching", type: "number", required: false },
  {
    id: "self_appraisal",
    label: "Self-Appraisal",
    type: "select",
    options: ["Good", "Satisfactory", "Not satisfactory"],
    required: true,
  },
  {
    id: "verified_grading",
    label: "Verified Grading",
    type: "select",
    options: ["Good", "Satisfactory", "Not satisfactory"],
    required: false,
  },
];

const activityFields = [
  { id: "description", label: "Description", type: "text", required: true },
  { id: "activity_category", label: "Activity Category", type: "text", required: true },
  { id: "total_days", label: "Total Days", type: "number", required: true },
  {
    id: "self_appraisal",
    label: "Self-Appraisal",
    type: "select",
    options: ["Good", "Satisfactory", "Not satisfactory"],
    required: true,
  },
  {
    id: "verified_grading",
    label: "Verified Grading",
    type: "select",
    options: ["Good", "Satisfactory", "Not satisfactory"],
    required: false,
  },
];

interface SuggestedRow {
  data: any;
  source: 'teaching' | 'activities';
  applied: boolean;
}

export default function TeachingStudentAssessmentModule() {
  const [teachingRows, setTeachingRows] = useState<any[]>([]);
  const [activityRows, setActivityRows] = useState<any[]>([]);
  const [suggestedTeachingRows, setSuggestedTeachingRows] = useState<SuggestedRow[]>([]);
  const [suggestedActivityRows, setSuggestedActivityRows] = useState<SuggestedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // Load data and apply LLM suggestions
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
        
        // Get localStorage data
        const llmData = JSON.parse(localStorage.getItem("llm") || "{}");
        const llmTeaching = llmData.teaching_assessment?.teaching || [];
        const llmActivities = llmData.teaching_assessment?.activities || [];

        if (docSnap.exists()) {
          const data = docSnap.data();
          const firestoreTeaching = data?.part_a?.teaching_student_assessment?.teaching || [];
          const firestoreActivities = data?.part_a?.teaching_student_assessment?.activities || [];

          setTeachingRows(firestoreTeaching);
          setActivityRows(firestoreActivities);

          // Generate suggestions for teaching rows
          const teachingSuggestions: SuggestedRow[] = [];
          llmTeaching.forEach((llmRow: any) => {
            // Check if this row exists in Firestore (by comparing key fields)
            const existsInFirestore = firestoreTeaching.some((fsRow: any) => 
              fsRow.activity_name === llmRow.activity_name && 
              fsRow.category === llmRow.category
            );
            
            // If not in Firestore, suggest it
            if (!existsInFirestore) {
              teachingSuggestions.push({
                data: llmRow,
                source: 'teaching',
                applied: false
              });
            }
          });
          setSuggestedTeachingRows(teachingSuggestions);

          // Generate suggestions for activity rows
          const activitySuggestions: SuggestedRow[] = [];
          llmActivities.forEach((llmRow: any) => {
            const existsInFirestore = firestoreActivities.some((fsRow: any) => 
              fsRow.description === llmRow.description && 
              fsRow.activity_category === llmRow.activity_category
            );
            
            if (!existsInFirestore) {
              activitySuggestions.push({
                data: llmRow,
                source: 'activities',
                applied: false
              });
            }
          });
          setSuggestedActivityRows(activitySuggestions);

        } else {
          // No Firestore data, use all localStorage as suggestions
          setTeachingRows([]);
          setActivityRows([]);
          
          setSuggestedTeachingRows(
            llmTeaching.map((row: any) => ({ data: row, source: 'teaching' as const, applied: false }))
          );
          setSuggestedActivityRows(
            llmActivities.map((row: any) => ({ data: row, source: 'activities' as const, applied: false }))
          );
        }
      } catch (err) {
        console.error("Error fetching assessment:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const saveToFirestore = (teaching: any[], activities: any[]) => {
    if (!userId) return;
    const userRef = doc(firestore, "users", userId);
    getDoc(userRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          updateDoc(userRef, {
            "part_a.teaching_student_assessment": {
              teaching,
              activities,
            },
          });
        } else {
          setDoc(userRef, {
            part_a: { teaching_student_assessment: { teaching, activities } },
          });
        }
      })
      .catch((err) => console.error("Error saving assessment:", err));
  };

  const saveToLocalStorage = (teaching: any[], activities: any[]) => {
    try {
      const llmData = JSON.parse(localStorage.getItem("llm") || "{}");
      llmData.teaching_assessment = {
        teaching,
        activities,
      };
      localStorage.setItem("llm", JSON.stringify(llmData));
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }
  };

  const handleSaveTeaching = (
    row: any,
    index?: number,
    closeModal?: () => void
  ) => {
    const updated = [...teachingRows];
    if (index !== undefined) updated[index] = row;
    else updated.push(row);
    setTeachingRows(updated);
    saveToFirestore(updated, activityRows);
    saveToLocalStorage(updated, activityRows);
    if (closeModal) closeModal();
  };

  const handleSaveActivity = (
    row: any,
    index?: number,
    closeModal?: () => void
  ) => {
    const updated = [...activityRows];
    if (index !== undefined) updated[index] = row;
    else updated.push(row);
    setActivityRows(updated);
    saveToFirestore(teachingRows, updated);
    saveToLocalStorage(teachingRows, updated);
    if (closeModal) closeModal();
  };

  const handleDeleteTeaching = (index: number) => {
    const updated = [...teachingRows];
    updated.splice(index, 1);
    setTeachingRows(updated);
    saveToFirestore(updated, activityRows);
    saveToLocalStorage(updated, activityRows);
  };

  const handleDeleteActivity = (index: number) => {
    const updated = [...activityRows];
    updated.splice(index, 1);
    setActivityRows(updated);
    saveToFirestore(teachingRows, updated);
    saveToLocalStorage(teachingRows, updated);
  };

  // Apply a suggested teaching row
  const applySuggestedTeachingRow = (index: number) => {
    const suggestion = suggestedTeachingRows[index];
    const updated = [...teachingRows, suggestion.data];
    setTeachingRows(updated);
    saveToFirestore(updated, activityRows);
    
    // Mark as applied
    const updatedSuggestions = [...suggestedTeachingRows];
    updatedSuggestions[index].applied = true;
    setSuggestedTeachingRows(updatedSuggestions);
  };

  // Undo applied teaching suggestion
  const undoSuggestedTeachingRow = (index: number) => {
    const suggestion = suggestedTeachingRows[index];
    
    // Remove from teaching rows
    const updated = teachingRows.filter(row => 
      !(row.activity_name === suggestion.data.activity_name && 
        row.category === suggestion.data.category)
    );
    setTeachingRows(updated);
    saveToFirestore(updated, activityRows);
    
    // Mark as not applied
    const updatedSuggestions = [...suggestedTeachingRows];
    updatedSuggestions[index].applied = false;
    setSuggestedTeachingRows(updatedSuggestions);
  };

  // Remove suggestion
  const removeSuggestedTeachingRow = (index: number) => {
    const updatedSuggestions = [...suggestedTeachingRows];
    updatedSuggestions.splice(index, 1);
    setSuggestedTeachingRows(updatedSuggestions);
  };

  // Apply a suggested activity row
  const applySuggestedActivityRow = (index: number) => {
    const suggestion = suggestedActivityRows[index];
    const updated = [...activityRows, suggestion.data];
    setActivityRows(updated);
    saveToFirestore(teachingRows, updated);
    
    const updatedSuggestions = [...suggestedActivityRows];
    updatedSuggestions[index].applied = true;
    setSuggestedActivityRows(updatedSuggestions);
  };

  // Undo applied activity suggestion
  const undoSuggestedActivityRow = (index: number) => {
    const suggestion = suggestedActivityRows[index];
    
    const updated = activityRows.filter(row => 
      !(row.description === suggestion.data.description && 
        row.activity_category === suggestion.data.activity_category)
    );
    setActivityRows(updated);
    saveToFirestore(teachingRows, updated);
    
    const updatedSuggestions = [...suggestedActivityRows];
    updatedSuggestions[index].applied = false;
    setSuggestedActivityRows(updatedSuggestions);
  };

  // Remove activity suggestion
  const removeSuggestedActivityRow = (index: number) => {
    const updatedSuggestions = [...suggestedActivityRows];
    updatedSuggestions.splice(index, 1);
    setSuggestedActivityRows(updatedSuggestions);
  };

  // Apply all suggestions
  const applyAllSuggestions = () => {
    // Apply all teaching suggestions
    const newTeachingRows = [...teachingRows];
    suggestedTeachingRows.forEach((suggestion) => {
      if (!suggestion.applied) {
        newTeachingRows.push(suggestion.data);
      }
    });
    
    // Apply all activity suggestions
    const newActivityRows = [...activityRows];
    suggestedActivityRows.forEach((suggestion) => {
      if (!suggestion.applied) {
        newActivityRows.push(suggestion.data);
      }
    });
    
    setTeachingRows(newTeachingRows);
    setActivityRows(newActivityRows);
    saveToFirestore(newTeachingRows, newActivityRows);
    
    // Mark all as applied
    setSuggestedTeachingRows(suggestedTeachingRows.map(s => ({ ...s, applied: true })));
    setSuggestedActivityRows(suggestedActivityRows.map(s => ({ ...s, applied: true })));
  };

  const totalSuggestions = suggestedTeachingRows.filter(s => !s.applied).length + 
                          suggestedActivityRows.filter(s => !s.applied).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-7xl">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <CardTitle className="text-2xl font-bold text-primary">
              Teaching & Student Activity Assessment
            </CardTitle>
          </div>
          {totalSuggestions > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={applyAllSuggestions}
              className="flex items-center space-x-2 bg-amber-50 border-amber-300 hover:bg-amber-100"
            >
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span>Apply All {totalSuggestions} Suggestions</span>
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {/* Teaching Suggestions */}
          {suggestedTeachingRows.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">
                  Suggested Teaching Activities ({suggestedTeachingRows.filter(s => !s.applied).length})
                </h3>
              </div>
              <div className="space-y-2">
                {suggestedTeachingRows.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border ${
                      suggestion.applied
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-amber-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Activity:</span>{' '}
                          {suggestion.data.activity_name}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>{' '}
                          {suggestion.data.category}
                        </div>
                        <div>
                          <span className="font-medium">Hours:</span>{' '}
                          {suggestion.data.actual_class_spent}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {suggestion.applied ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => undoSuggestedTeachingRow(index)}
                              className="bg-white"
                            >
                              Undo
                            </Button>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </>
                        ) : (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => applySuggestedTeachingRow(index)}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              Apply
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSuggestedTeachingRow(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teaching Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">1. Teaching</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Teaching Activity</DialogTitle>
                  </DialogHeader>
                  <AssessmentForm
                    fields={teachingFields}
                    onSave={(data, close) =>
                      handleSaveTeaching(data, undefined, close)
                    }
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-md">
                <thead className="bg-gray-100">
                  <tr>
                    {teachingFields.map((f) => (
                      <th key={f.id} className="px-4 py-2 border text-sm">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-4 py-2 border text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachingRows.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {teachingFields.map((f) => (
                        <td key={f.id} className="px-4 py-2 border text-sm">
                          {row[f.id]}
                        </td>
                      ))}
                      <td className="px-4 py-2 border">
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Teaching Activity</DialogTitle>
                              </DialogHeader>
                              <AssessmentForm
                                fields={teachingFields}
                                initialData={row}
                                onSave={(data, close) =>
                                  handleSaveTeaching(data, index, close)
                                }
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTeaching(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Suggestions */}
          {suggestedActivityRows.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">
                  Suggested Activities ({suggestedActivityRows.filter(s => !s.applied).length})
                </h3>
              </div>
              <div className="space-y-2">
                {suggestedActivityRows.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border ${
                      suggestion.applied
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-amber-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Description:</span>{' '}
                          {suggestion.data.description}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>{' '}
                          {suggestion.data.activity_category}
                        </div>
                        <div>
                          <span className="font-medium">Days:</span>{' '}
                          {suggestion.data.total_days}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {suggestion.applied ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => undoSuggestedActivityRow(index)}
                              className="bg-white"
                            >
                              Undo
                            </Button>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </>
                        ) : (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => applySuggestedActivityRow(index)}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              Apply
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSuggestedActivityRow(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">2. Activities</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Activity</DialogTitle>
                  </DialogHeader>
                  <AssessmentForm
                    fields={activityFields}
                    onSave={(data, close) =>
                      handleSaveActivity(data, undefined, close)
                    }
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-md">
                <thead className="bg-gray-100">
                  <tr>
                    {activityFields.map((f) => (
                      <th key={f.id} className="px-4 py-2 border text-sm">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-4 py-2 border text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activityRows.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {activityFields.map((f) => (
                        <td key={f.id} className="px-4 py-2 border text-sm">
                          {row[f.id]}
                        </td>
                      ))}
                      <td className="px-4 py-2 border">
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Activity</DialogTitle>
                              </DialogHeader>
                              <AssessmentForm
                                fields={activityFields}
                                initialData={row}
                                onSave={(data, close) =>
                                  handleSaveActivity(data, index, close)
                                }
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteActivity(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable modal form
function AssessmentForm({
  fields,
  initialData = {},
  onSave,
}: {
  fields: any[];
  initialData?: any;
  onSave: (data: any, closeModal?: () => void) => void;
}) {
  const [form, setForm] = useState<any>({ ...initialData });

  const handleChange = (id: string, value: string | number) => {
    setForm((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent, close?: () => void) => {
    e.preventDefault();
    onSave(form, close);
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
      {fields.map((f) => (
        <div key={f.id} className="flex flex-col">
          <label className="text-sm font-medium text-muted-foreground mb-1">
            {f.label}
          </label>
          {f.type === "select" ? (
            <select
              required={f.required}
              value={form[f.id] || ""}
              onChange={(e) => handleChange(f.id, e.target.value)}
              className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select</option>
              {f.options?.map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={f.type}
              required={f.required}
              value={form[f.id] || ""}
              onChange={(e) => handleChange(f.id, e.target.value)}
              className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
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