"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestore as db } from "@/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PatentsPolicyAwards() {
  const [entries, setEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({
    type: "",
    title: "",
    year: "",
    status: "",
    details: "",
  });
  const [aiInsights, setAiInsights] = useState<string>("");

  const router = useRouter();
  const collectionRef = collection(db, "part_b_patents_policy_awards");

  // Fetch Data
  const fetchEntries = async () => {
    const snapshot = await getDocs(collectionRef);
    setEntries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Add Entry
  const addEntry = async () => {
    if (!newEntry.title || !newEntry.type)
      return alert("Please fill all mandatory fields");
    await addDoc(collectionRef, newEntry);
    setNewEntry({ type: "", title: "", year: "", status: "", details: "" });
    fetchEntries();
  };

  // Delete Entry
  const removeEntry = async (id: string) => {
    await deleteDoc(doc(db, "part_b_patents_policy_awards", id));
    fetchEntries();
  };

  // Generate AI Insights (Mock)
  const generateInsights = async () => {
    const total = entries.length;
    const patents = entries.filter((e) => e.type === "Patent").length;
    const awards = entries.filter((e) => e.type === "Award").length;
    const policies = entries.filter((e) => e.type === "Policy Document").length;

    setAiInsights(
      `Based on your data:
- Total Entries: ${total}
- Patents: ${patents}
- Awards: ${awards}
- Policy Documents: ${policies}

Insight: You have a strong record in ${
        patents > awards && patents > policies
          ? "innovation (Patents)"
          : awards > patents && awards > policies
          ? "academic recognition (Awards)"
          : "policy contribution (Documents)"
      }. Keep focusing on diversifying across all categories.`
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            Patents, Policy & Awards Module
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={generateInsights}>
            <Sparkles className="mr-2 h-4 w-4" /> Generate AI Insights
          </Button>
          <Button onClick={addEntry}>Add Record</Button>
        </div>
      </div>

      {/* Entry Form */}
      <Card className="mb-8 shadow-md">
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
            <option value="Patent">Patent (International/National)</option>
            <option value="Policy Document">Policy Document</option>
            <option value="Award">Award/Fellowship</option>
          </select>
          <Input
            placeholder="Title"
            value={newEntry.title}
            onChange={(e) =>
              setNewEntry({ ...newEntry, title: e.target.value })
            }
          />
          <Input
            placeholder="Year"
            value={newEntry.year}
            onChange={(e) => setNewEntry({ ...newEntry, year: e.target.value })}
          />
          <Input
            placeholder="Status (Granted/Published/etc.)"
            value={newEntry.status}
            onChange={(e) =>
              setNewEntry({ ...newEntry, status: e.target.value })
            }
          />
          <Textarea
            placeholder="Details / Description"
            className="col-span-2"
            value={newEntry.details}
            onChange={(e) =>
              setNewEntry({ ...newEntry, details: e.target.value })
            }
          />
        </CardContent>
      </Card>

      {/* Display Entries */}
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition">
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {entry.type}: {entry.title}
                </CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeEntry(entry.id)}
                >
                  Delete
                </Button>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-1">
                <p>
                  <b>Year:</b> {entry.year || "—"}
                </p>
                <p>
                  <b>Status:</b> {entry.status || "—"}
                </p>
                <p>
                  <b>Details:</b> {entry.details || "—"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <Card className="mt-10 p-6 bg-white shadow-md border-l-4 border-blue-400">
          <CardTitle className="flex items-center mb-3 text-blue-600">
            <Sparkles className="mr-2 h-5 w-5" /> AI Insights
          </CardTitle>
          <pre className="text-gray-800 whitespace-pre-wrap">{aiInsights}</pre>
        </Card>
      )}
    </div>
  );
}
