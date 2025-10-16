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

// Teaching Section Fields
const teachingFields = [
  { id: "category", label: "Category", type: "text", required: true },
  {
    id: "activity_name",
    label: "Name of Activity",
    type: "text",
    required: true,
  },
  {
    id: "unit_of_calculation",
    label: "Unit of Calculation",
    type: "text",
    required: true,
  },
  {
    id: "self_appraisal",
    label: "Self-Appraisal Grading",
    type: "select",
    options: ["Good", "Satisfactory", "Not Satisfactory"],
    required: true,
  },
  {
    id: "verified_grading",
    label: "Verified API Grading by Committee",
    type: "select",
    options: ["Good", "Satisfactory", "Not Satisfactory"],
    required: true,
  },
  {
    id: "actual_class_spent",
    label: "Actual Class Spent per Year",
    type: "number",
    required: true,
  },
  {
    id: "percent_teaching",
    label: "% of Teaching",
    type: "number",
    required: true,
  },
];

// Activities Section Fields
const activityFields = [
  {
    id: "activity_category",
    label: "Activity Category",
    type: "text",
    required: true,
  },
  {
    id: "description",
    label: "Description of Activity",
    type: "text",
    required: true,
  },
  {
    id: "total_days",
    label: "Total Days Spent per Year",
    type: "number",
    required: true,
  },
  {
    id: "self_appraisal",
    label: "Self-Appraisal Grading",
    type: "select",
    options: ["Good", "Satisfactory", "Not Satisfactory"],
    required: true,
  },
  {
    id: "verified_grading",
    label: "Verified API Grading by Committee",
    type: "select",
    options: ["Good", "Satisfactory", "Not Satisfactory"],
    required: true,
  },
];

export default function TeachingStudentAssessmentModule() {
  const [teachingRows, setTeachingRows] = useState<any[]>([]);
  const [activityRows, setActivityRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
          setTeachingRows(
            data?.part_a?.teaching_student_assessment?.teaching || []
          );
          setActivityRows(
            data?.part_a?.teaching_student_assessment?.activities || []
          );
        } else {
          setTeachingRows([]);
          setActivityRows([]);
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
    if (closeModal) closeModal();
  };

  const handleDeleteTeaching = (index: number) => {
    const updated = [...teachingRows];
    updated.splice(index, 1);
    setTeachingRows(updated);
    saveToFirestore(updated, activityRows);
  };

  const handleDeleteActivity = (index: number) => {
    const updated = [...activityRows];
    updated.splice(index, 1);
    setActivityRows(updated);
    saveToFirestore(teachingRows, updated);
  };

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
        </CardHeader>

        <CardContent>
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

            <table className="min-w-full border border-gray-300 rounded-md">
              <thead className="bg-gray-100">
                <tr>
                  {teachingFields.map((f) => (
                    <th key={f.id} className="px-4 py-2 border">
                      {f.label}
                    </th>
                  ))}
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachingRows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {teachingFields.map((f) => (
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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

            <table className="min-w-full border border-gray-300 rounded-md">
              <thead className="bg-gray-100">
                <tr>
                  {activityFields.map((f) => (
                    <th key={f.id} className="px-4 py-2 border">
                      {f.label}
                    </th>
                  ))}
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activityRows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {activityFields.map((f) => (
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
