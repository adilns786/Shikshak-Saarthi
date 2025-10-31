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

export default function InvitedLectures() {
  const [entries, setEntries] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState("");
  const [newEntry, setNewEntry] = useState({
    type: "",
    title: "",
    event: "",
    level: "",
    year: "",
    organizer: "",
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
        setEntries(snap.data()?.part_b?.invited_lectures || []);
      } else {
        setEntries([]);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 🔹 Add Entry
  const addEntry = async () => {
    if (!newEntry.type || !newEntry.title) {
      alert("Please fill required fields (Type, Title).");
      return;
    }

    if (!userId) return;
    const updated = [...entries, newEntry];
    setEntries(updated);

    const userRef = doc(firestore, "users", userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      await updateDoc(userRef, {
        "part_b.invited_lectures": updated,
      });
    } else {
      await setDoc(userRef, {
        part_b: { invited_lectures: updated },
      });
    }

    // Reset form
    setNewEntry({
      type: "",
      title: "",
      event: "",
      level: "",
      year: "",
      organizer: "",
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
      "part_b.invited_lectures": updated,
    });
  };

  // 🔹 Generate AI Insights
  const generateInsights = () => {
    const total = entries.length;
    const invited = entries.filter((e) => e.type === "Invited Lecture").length;
    const resource = entries.filter((e) => e.type === "Resource Person").length;
    const paper = entries.filter((e) => e.type === "Paper Presentation").length;
    const international = entries.filter(
      (e) => e.level === "International"
    ).length;
    const national = entries.filter((e) => e.level === "National").length;
    const state = entries.filter((e) => e.level === "State").length;

    const insight = `
Summary of Academic Engagements:
--------------------------------
Total Entries: ${total}
Invited Lectures: ${invited}
Resource Person Roles: ${resource}
Paper Presentations: ${paper}

Level of Engagement:
International: ${international}
National: ${national}
State: ${state}

Insight:
${
  international > national
    ? "Strong international participation observed."
    : national > international
    ? "You have substantial national-level contributions — consider expanding internationally."
    : "Balanced academic engagement across all levels."
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
          <h1 className="text-2xl font-bold">
            Lectures & Conference Presentations
          </h1>
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
          <select
            className="border rounded-md p-2"
            value={newEntry.type}
            onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
          >
            <option value="">Select Type</option>
            <option value="Invited Lecture">Invited Lecture</option>
            <option value="Resource Person">Resource Person</option>
            <option value="Paper Presentation">Paper Presentation</option>
          </select>

          <Input
            placeholder="Title / Topic"
            value={newEntry.title}
            onChange={(e) =>
              setNewEntry({ ...newEntry, title: e.target.value })
            }
          />

          <Input
            placeholder="Event / Conference Name"
            value={newEntry.event}
            onChange={(e) =>
              setNewEntry({ ...newEntry, event: e.target.value })
            }
          />

          <select
            className="border rounded-md p-2"
            value={newEntry.level}
            onChange={(e) =>
              setNewEntry({ ...newEntry, level: e.target.value })
            }
          >
            <option value="">Select Level</option>
            <option value="International">International</option>
            <option value="National">National</option>
            <option value="State">State</option>
          </select>

          <Input
            placeholder="Year"
            value={newEntry.year}
            onChange={(e) => setNewEntry({ ...newEntry, year: e.target.value })}
          />

          <Input
            placeholder="Organizer / Institution"
            value={newEntry.organizer}
            onChange={(e) =>
              setNewEntry({ ...newEntry, organizer: e.target.value })
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
            placeholder="Verification Status (Verified / Pending)"
            value={newEntry.verification}
            onChange={(e) =>
              setNewEntry({ ...newEntry, verification: e.target.value })
            }
          />

          <Textarea
            placeholder="Remarks / Additional Details"
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
                  <b>Type:</b> {entry.type}
                </p>
                <p>
                  <b>Event:</b> {entry.event}
                </p>
                <p>
                  <b>Level:</b> {entry.level}
                </p>
                <p>
                  <b>Year:</b> {entry.year}
                </p>
                <p>
                  <b>Organizer:</b> {entry.organizer}
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
