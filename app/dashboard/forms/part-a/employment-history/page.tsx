"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Plus, Check, Undo2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// ─── Field Definitions ──────────────────────────────
const priorFields = [
  { id: "designation", label: "Designation", type: "text", required: true },
  { id: "employer", label: "Employer", type: "text", required: true },
  { id: "nature", label: "Nature of Appointment", type: "text", required: true },
  { id: "duration", label: "Duration", type: "text", required: true },
  { id: "salary", label: "Salary", type: "text", required: true },
  { id: "reason_leaving", label: "Reason for Leaving", type: "text", required: true },
];

const postFields = [
  { id: "designation", label: "Designation", type: "text", required: true },
  { id: "department", label: "Department", type: "text", required: true },
  { id: "date_joining", label: "Date of Joining", type: "date", required: true },
  { id: "grade_pay", label: "Grade Pay From–To", type: "text", required: true },
];

// ─── Component ──────────────────────────────────────
export default function EmploymentHistoryModule() {
  const [priorAppointments, setPriorAppointments] = useState<any[]>([]);
  const [postsHeld, setPostsHeld] = useState<any[]>([]);
  const [suggestedPrior, setSuggestedPrior] = useState<any[]>([]);
  const [suggestedPosts, setSuggestedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // 🧠 Fetch Firestore & localStorage data
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

        const firestorePrior = docSnap.exists() ? docSnap.data()?.part_a?.employment?.prior || [] : [];
        const firestorePosts = docSnap.exists() ? docSnap.data()?.part_a?.employment?.posts || [] : [];

        const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");

        const localPrior = llmStorage["priorAppointments"] || [];
        const localPosts = llmStorage["postsHeld"] || [];

        // Identify suggested rows (not exact match with Firestore)
        const newPriorSuggestions = localPrior.filter(
          (row: any) => !firestorePrior.some((r: any) => JSON.stringify(r) === JSON.stringify(row))
        );
        const newPostSuggestions = localPosts.filter(
          (row: any) => !firestorePosts.some((r: any) => JSON.stringify(r) === JSON.stringify(row))
        );

        setPriorAppointments(firestorePrior);
        setPostsHeld(firestorePosts);
        setSuggestedPrior(newPriorSuggestions);
        setSuggestedPosts(newPostSuggestions);
      } catch (err) {
        console.error("Error fetching employment history:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 💾 Save handler (used for add/edit)
  const handleSave = async (
    row: any,
    section: "prior" | "posts",
    index?: number,
    closeModal?: () => void
  ) => {
    let updated: any[];
    if (section === "prior") {
      updated = [...priorAppointments];
      if (index !== undefined) updated[index] = row;
      else updated.push(row);
      setPriorAppointments(updated);
    } else {
      updated = [...postsHeld];
      if (index !== undefined) updated[index] = row;
      else updated.push(row);
      setPostsHeld(updated);
    }

    if (closeModal) closeModal();
    await saveToFirestore(section, updated);
  };

  // 🔁 Local + Firestore update
  const saveToFirestore = async (section: "prior" | "posts", updated: any[]) => {
    if (!userId) return;
    const userRef = doc(firestore, "users", userId);
    try {
      const key = section === "prior" ? "priorAppointments" : "postsHeld";
      const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");
      localStorage.setItem("llm", JSON.stringify({ ...llmStorage, [key]: updated }));
      await updateDoc(userRef, { [`part_a.employment.${section}`]: updated });
    } catch (err) {
      console.error("Error saving employment history:", err);
    }
  };

  // 🗑 Delete record
  const handleDelete = async (section: "prior" | "posts", index: number) => {
    let updated: any[];
    if (section === "prior") {
      updated = [...priorAppointments];
      updated.splice(index, 1);
      setPriorAppointments(updated);
    } else {
      updated = [...postsHeld];
      updated.splice(index, 1);
      setPostsHeld(updated);
    }
    await saveToFirestore(section, updated);
  };

  // ✅ Apply suggestion (adds new row)
  const handleApplySuggestion = (row: any, section: "prior" | "posts", index: number) => {
    if (section === "prior") {
      const updated = [...priorAppointments, row];
      setPriorAppointments(updated);
      const remaining = suggestedPrior.filter((_, i) => i !== index);
      setSuggestedPrior(remaining);
      saveToFirestore("prior", updated);
    } else {
      const updated = [...postsHeld, row];
      setPostsHeld(updated);
      const remaining = suggestedPosts.filter((_, i) => i !== index);
      setSuggestedPosts(remaining);
      saveToFirestore("posts", updated);
    }
  };

  // ↩️ Undo suggestion (restore from localStorage)
  const handleUndoSuggestion = (section: "prior" | "posts", index: number) => {
    if (section === "prior") {
      const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");
      setSuggestedPrior(llmStorage["priorAppointments"] || []);
    } else {
      const llmStorage = JSON.parse(localStorage.getItem("llm") || "{}");
      setSuggestedPosts(llmStorage["postsHeld"] || []);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg font-medium">
        Loading...
      </div>
    );

  // 🧱 Table Renderer
  const renderTable = (data: any[], fields: any[], section: "prior" | "posts") => (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-200 rounded-md mb-4">
        <thead>
          <tr className="bg-gray-100">
            {fields.map((f) => (
              <th key={f.id} className="px-4 py-2 border">
                {f.label}
              </th>
            ))}
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {fields.map((f) => (
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
                      <DialogTitle>Edit</DialogTitle>
                    </DialogHeader>
                    <EmploymentForm
                      initialData={row}
                      fields={fields}
                      onSave={(data, close) =>
                        handleSave(data, section, index, close)
                      }
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(section, index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // 🧩 Suggested rows display
  const renderSuggestions = (suggestions: any[], fields: any[], section: "prior" | "posts") =>
    suggestions.length > 0 && (
      <div className="mt-3 border border-yellow-300 rounded-lg bg-yellow-50 p-3">
        <h4 className="font-semibold text-yellow-700 mb-2">
          Suggested New {section === "prior" ? "Prior Appointments" : "Posts"} (from previous data)
        </h4>
        <table className="min-w-full table-auto border border-yellow-200">
          <thead>
            <tr className="bg-yellow-100">
              {fields.map((f) => (
                <th key={f.id} className="px-3 py-1 border text-sm">
                  {f.label}
                </th>
              ))}
              <th className="px-3 py-1 border text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((row, index) => (
              <tr key={index} className="bg-yellow-50">
                {fields.map((f) => (
                  <td key={f.id} className="px-3 py-1 border text-sm">
                    {row[f.id]}
                  </td>
                ))}
                <td className="px-3 py-1 border flex space-x-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApplySuggestion(row, section, index)}
                  >
                    <Check className="h-4 w-4 mr-1" /> Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUndoSuggestion(section, index)}
                  >
                    <Undo2 className="h-4 w-4 mr-1" /> Undo
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 space-y-6">
      <Card className="w-full max-w-5xl shadow-xl rounded-2xl">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <CardTitle className="text-2xl font-bold text-primary">
              Employment History
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ─── Prior Appointments ─── */}
          <div>
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-semibold">
                Appointments Prior to Current Institution
              </h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="flex items-center space-x-1">
                    <Plus className="h-4 w-4" /> Add New
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Prior Appointment</DialogTitle>
                  </DialogHeader>
                  <EmploymentForm
                    fields={priorFields}
                    onSave={(data, close) =>
                      handleSave(data, "prior", undefined, close)
                    }
                  />
                </DialogContent>
              </Dialog>
            </div>
            {renderTable(priorAppointments, priorFields, "prior")}
            {renderSuggestions(suggestedPrior, priorFields, "prior")}
          </div>

          {/* ─── Posts Held ─── */}
          <div>
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-semibold">
                Posts Held After Joining Institution
              </h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="flex items-center space-x-1">
                    <Plus className="h-4 w-4" /> Add New
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Post Held</DialogTitle>
                  </DialogHeader>
                  <EmploymentForm
                    fields={postFields}
                    onSave={(data, close) =>
                      handleSave(data, "posts", undefined, close)
                    }
                  />
                </DialogContent>
              </Dialog>
            </div>
            {renderTable(postsHeld, postFields, "posts")}
            {renderSuggestions(suggestedPosts, postFields, "posts")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Reusable Form ───────────────────────────────
function EmploymentForm({
  initialData = {},
  fields,
  onSave,
}: {
  initialData?: any;
  fields: any[];
  onSave: (data: any, closeModal: () => void) => void;
}) {
  const [form, setForm] = useState<any>({ ...initialData });

  const handleChange = (id: string, value: string | number) => {
    setForm((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent, close: () => void) => {
    e.preventDefault();
    onSave(form, close);
  };

  return (
    <DialogContent>
      <form onSubmit={(e) => handleSubmit(e, () => {})} className="space-y-4">
        {fields.map((f) => (
          <div key={f.id} className="flex flex-col">
            <label className="text-sm font-medium text-muted-foreground mb-1">
              {f.label}
            </label>
            <input
              type={f.type}
              required={f.required}
              value={form[f.id] || ""}
              onChange={(e) => handleChange(f.id, e.target.value)}
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
    </DialogContent>
  );
}
