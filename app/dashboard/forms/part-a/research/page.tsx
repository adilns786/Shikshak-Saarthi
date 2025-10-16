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

// Fields for research degrees
const researchFields = [
  { id: "degree", label: "Degree", type: "text", required: true },
  { id: "title", label: "Title", type: "text", required: true },
  { id: "date_award", label: "Date of Award", type: "date", required: true },
  { id: "university", label: "University", type: "text", required: true },
];

export default function ResearchDegreesTable() {
  const [degrees, setDegrees] = useState<any[]>([]);
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
          setDegrees(data?.part_a?.research_degrees || []);
        } else {
          setDegrees([]);
        }
      } catch (err) {
        console.error("Error fetching research degrees:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async (row: any, index?: number) => {
    let updatedDegrees = [...degrees];

    if (index !== undefined) {
      updatedDegrees[index] = row;
    } else {
      updatedDegrees.push(row);
    }

    setDegrees(updatedDegrees);

    if (!userId) return;
    const userRef = doc(firestore, "users", userId);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        await updateDoc(userRef, { "part_a.research_degrees": updatedDegrees });
      } else {
        await setDoc(userRef, { part_a: { research_degrees: updatedDegrees } });
      }
    } catch (err) {
      console.error("Error saving research degrees:", err);
    }
  };

  const handleDelete = async (index: number) => {
    const updatedDegrees = [...degrees];
    updatedDegrees.splice(index, 1);
    setDegrees(updatedDegrees);

    if (!userId) return;
    const userRef = doc(firestore, "users", userId);
    try {
      await updateDoc(userRef, { "part_a.research_degrees": updatedDegrees });
    } catch (err) {
      console.error("Error deleting research degree:", err);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-4xl shadow-xl rounded-2xl">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <CardTitle className="text-2xl font-bold text-primary">
              Research Degrees
            </CardTitle>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" /> <span>Add New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Research Degree</DialogTitle>
              </DialogHeader>
              <ResearchForm onSave={handleSave} />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {degrees.length === 0 ? (
            <p className="text-muted-foreground">
              No research degrees added yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200 rounded-md">
                <thead>
                  <tr className="bg-gray-100">
                    {researchFields.map((f) => (
                      <th key={f.id} className="px-4 py-2 border">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {degrees.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {researchFields.map((f) => (
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
                              <DialogTitle>Edit Research Degree</DialogTitle>
                            </DialogHeader>
                            <ResearchForm
                              initialData={row}
                              onSave={(data) => handleSave(data, index)}
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
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable form component for modal
function ResearchForm({
  initialData = {},
  onSave,
}: {
  initialData?: any;
  onSave: (data: any) => void;
}) {
  const [form, setForm] = useState<any>({
    degree: "",
    title: "",
    date_award: "",
    university: "",
    ...initialData,
  });

  const handleChange = (id: string, value: string | number) => {
    setForm((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {researchFields.map((field) => (
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
        <Button type="submit" variant="default">
          Save
        </Button>
      </div>
    </form>
  );
}
