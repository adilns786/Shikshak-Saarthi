"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function PatentsPolicyAwards() {
  const [entries, setEntries] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState("");
  const [newEntry, setNewEntry] = useState({
    title: "",
    category: "",
    year: "",
    status: "",
    recognition: "",
    score: "",
    verification: "",
    remarks: "",
  });
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // 🔹 Fetch user & data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      setUserId(user.uid);
      const userRef = doc(firestore, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setEntries(snap.data()?.part_b?.patents_policy_awards || []);
      } else {
        setEntries([]);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 🔹 Add Entry
  const addEntry = async () => {
    if (!newEntry.title || !newEntry.category) {
      alert("Please fill required fields (Title, Category).");
      return;
    }

    if (!userId) return;
    const updated = [...entries, newEntry];
    setEntries(updated);

    const userRef = doc(firestore, "users", userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      await updateDoc(userRef, {
        "part_b.patents_policy_awards": updated,
      });
    } else {
      await setDoc(userRef, {
        part_b: { patents_policy_awards: updated },
      });
    }

    setNewEntry({
      title: "",
      category: "",
      year: "",
      status: "",
      recognition: "",
      score: "",
      verification: "",
      remarks: "",
    });
  };

  // 🔹 Delete Entry
  const deleteEntry = async (index: number) => {
    if (!userId) return;
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);

    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, {
      "part_b.patents_policy_awards": updated,
    });
  };

  // 🔹 Generate AI Insights
  const generateInsights = () => {
    const total = entries.length;
    const patents = entries.filter((e) =>
      e.category.toLowerCase().includes("patent")
    ).length;
    const awards = entries.filter((e) =>
      e.category.toLowerCase().includes("award")
    ).length;
    const policies = entries.filter((e) =>
      e.category.toLowerCase().includes("policy")
    ).length;

    const insight = `
Summary of Recognitions:
--------------------------
Total Entries: ${total}
Patents: ${patents}
Awards: ${awards}
Policy Contributions: ${policies}

Insight:
${
  patents > awards
    ? "Strong focus on innovation and patents."
    : awards > patents
    ? "Excellent recognition through awards — consider focusing on innovation next."
    : "Balanced contributions across recognition types."
}
    `;
    setAiInsights(insight.trim());
  };

  // 🔹 UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Patents / Policy / Awards</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={generateInsights}>
            <Sparkles className="mr-2 h-4 w-4" /> Generate Insights
          </Button>
          <Button onClick={addEntry}>
            <Plus className="mr-2 h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>

      {/* Form */}
      <Card className="mb-10 shadow-md">
        <CardHeader>
          <CardTitle>Add New Record</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Title"
            value={newEntry.title}
            onChange={(e) =>
              setNewEntry({ ...newEntry, title: e.target.value })
            }
          />
          <Input
            placeholder="Category (Patent / Award / Policy)"
            value={newEntry.category}
            onChange={(e) =>
              setNewEntry({ ...newEntry, category: e.target.value })
            }
          />
          <Input
            placeholder="Year"
            value={newEntry.year}
            onChange={(e) => setNewEntry({ ...newEntry, year: e.target.value })}
          />
          <Input
            placeholder="Status (Granted / Applied / Received)"
            value={newEntry.status}
            onChange={(e) =>
              setNewEntry({ ...newEntry, status: e.target.value })
            }
          />
          <Input
            placeholder="Recognition (Institution / Govt. Body)"
            value={newEntry.recognition}
            onChange={(e) =>
              setNewEntry({ ...newEntry, recognition: e.target.value })
            }
          />
          <Input
            placeholder="Score (if applicable)"
            value={newEntry.score}
            onChange={(e) =>
              setNewEntry({ ...newEntry, score: e.target.value })
            }
          />
          <Input
            placeholder="Verification Status"
            value={newEntry.verification}
            onChange={(e) =>
              setNewEntry({ ...newEntry, verification: e.target.value })
            }
          />
          <Textarea
            placeholder="Remarks"
            className="col-span-2"
            value={newEntry.remarks}
            onChange={(e) =>
              setNewEntry({ ...newEntry, remarks: e.target.value })
            }
          />
        </CardContent>
      </Card>

      {/* Display Records */}
      <div className="grid md:grid-cols-2 gap-4">
        {entries.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{entry.title}</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteEntry(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>
                  <b>Category:</b> {entry.category}
                </p>
                <p>
                  <b>Year:</b> {entry.year}
                </p>
                <p>
                  <b>Status:</b> {entry.status}
                </p>
                <p>
                  <b>Recognition:</b> {entry.recognition}
                </p>
                <p>
                  <b>Score:</b> {entry.score || "—"}
                </p>
                <p>
                  <b>Verification:</b> {entry.verification || "—"}
                </p>
                <p>
                  <b>Remarks:</b> {entry.remarks || "—"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Insights Section */}
      {aiInsights && (
        <Card className="mt-10 border-l-4 border-primary shadow-sm bg-white">
          <CardHeader>
            <CardTitle>AI Generated Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-gray-800">
              {aiInsights}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
