"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  Wifi,
  Users,
  FolderPlus,
  Briefcase,
  Lightbulb,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

type Row = { [k: string]: any };

// Submodule field definitions
const researchPaperFields = [
  { id: "title", label: "Title", type: "text", required: true },
  {
    id: "journal",
    label: "Journal / Conference",
    type: "text",
    required: true,
  },
  { id: "issn_isbn", label: "ISSN / ISBN", type: "text", required: false },
  { id: "year", label: "Year", type: "number", required: true },
  { id: "indexing", label: "Indexing / Impact", type: "text", required: false },
  {
    id: "author_status",
    label: "Author Status",
    type: "text",
    required: false,
  },
  { id: "doi", label: "DOI / Link", type: "text", required: false },
];

const publicationFields = [
  { id: "title", label: "Title", type: "text", required: true },
  { id: "publisher", label: "Publisher", type: "text", required: true },
  { id: "isbn", label: "ISBN", type: "text", required: false },
  { id: "year", label: "Year", type: "number", required: true },
  {
    id: "type",
    label: "Type (Book/Chapter/Translation)",
    type: "text",
    required: true,
  },
  {
    id: "authorship",
    label: "Authorship (Sole/Co-author/Editor)",
    type: "text",
    required: false,
  },
];

const ictFields = [
  {
    id: "innovation_type",
    label: "Type of Innovation",
    type: "text",
    required: true,
  },
  { id: "description", label: "Description", type: "text", required: true },
  { id: "platform", label: "Platform", type: "text", required: false },
  { id: "year", label: "Year", type: "number", required: true },
  { id: "impact", label: "Outcome / Impact", type: "text", required: false },
];

const guidanceFields = [
  {
    id: "type",
    label: "Type (Ph.D./M.Phil./P.G.)",
    type: "text",
    required: true,
  },
  { id: "scholar_name", label: "Scholar Name", type: "text", required: true },
  { id: "university", label: "University", type: "text", required: false },
  { id: "title", label: "Title of Research", type: "text", required: true },
  {
    id: "status",
    label: "Status (Ongoing/Completed)",
    type: "text",
    required: true,
  },
  {
    id: "year_completion",
    label: "Year of Completion",
    type: "number",
    required: false,
  },
];

const projectFields = [
  { id: "title", label: "Project Title", type: "text", required: true },
  { id: "agency", label: "Funding Agency", type: "text", required: false },
  { id: "amount", label: "Amount (₹)", type: "number", required: false },
  {
    id: "duration",
    label: "Duration (From–To)",
    type: "text",
    required: false,
  },
  { id: "role", label: "Role (PI/Co-PI)", type: "text", required: false },
  {
    id: "status",
    label: "Status (Ongoing/Completed)",
    type: "text",
    required: true,
  },
];

const consultancyFields = [
  { id: "title", label: "Consultancy Title", type: "text", required: true },
  {
    id: "client",
    label: "Client / Organization",
    type: "text",
    required: true,
  },
  { id: "amount", label: "Amount (₹)", type: "number", required: false },
  {
    id: "duration",
    label: "Duration (From–To)",
    type: "text",
    required: false,
  },
  { id: "role", label: "Role", type: "text", required: false },
  { id: "outcome", label: "Outcome", type: "text", required: false },
];

export default function ResearchAcademicContributions() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [researchPapers, setResearchPapers] = useState<Row[]>([]);
  const [publications, setPublications] = useState<Row[]>([]);
  const [ictInnovations, setIctInnovations] = useState<Row[]>([]);
  const [researchGuidance, setResearchGuidance] = useState<Row[]>([]);
  const [researchProjects, setResearchProjects] = useState<Row[]>([]);
  const [consultancyProjects, setConsultancyProjects] = useState<Row[]>([]);

  const [insights, setInsights] = useState<string[]>([]);

  // load from firestore + cache
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      setUserId(user.uid);

      // try local cache first
      const cached = localStorage.getItem("part_b_table2_v1");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setResearchPapers(parsed.researchPapers || []);
          setPublications(parsed.publications || []);
          setIctInnovations(parsed.ictInnovations || []);
          setResearchGuidance(parsed.researchGuidance || []);
          setResearchProjects(parsed.researchProjects || []);
          setConsultancyProjects(parsed.consultancyProjects || []);
          setLoading(false);
        } catch (err) {
          console.warn("cache parse failed, fetching from db");
        }
      }

      // always fetch fresh (but cache reduces perceived slowness)
      try {
        const docRef = doc(firestore, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const tbl = data?.part_b?.table2 || {};
          const rp = tbl.researchPapers || [];
          const pub = tbl.publications || [];
          const ict = tbl.ictInnovations || [];
          const guide = tbl.researchGuidance || [];
          const proj = tbl.researchProjects || [];
          const cons = tbl.consultancyProjects || [];

          setResearchPapers(rp);
          setPublications(pub);
          setIctInnovations(ict);
          setResearchGuidance(guide);
          setResearchProjects(proj);
          setConsultancyProjects(cons);

          localStorage.setItem(
            "part_b_table2_v1",
            JSON.stringify({
              researchPapers: rp,
              publications: pub,
              ictInnovations: ict,
              researchGuidance: guide,
              researchProjects: proj,
              consultancyProjects: cons,
            })
          );
        } else {
          // initialize empty structure in DB if needed
          await setDoc(docRef, { part_b: { table2: {} } }, { merge: true });
        }
      } catch (err) {
        console.error("Failed to fetch table2:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // simple AI insights (client-side heuristics)
  useEffect(() => {
    const s: string[] = [];
    const pubsLast3Years = publications.filter((p) => {
      const y = Number(p.year);
      return y && y >= new Date().getFullYear() - 3;
    }).length;
    if (publications.length === 0)
      s.push(
        "No publications recorded yet. Consider adding books/chapters if available."
      );
    else
      s.push(
        `Total publications: ${publications.length}. ${pubsLast3Years} in last 3 years.`
      );

    if (researchPapers.length === 0)
      s.push(
        "No research papers found. Adding peer-reviewed papers increases research score."
      );
    else
      s.push(
        `Research papers: ${researchPapers.length} (check indexing/DOI fields for completeness).`
      );

    if (researchProjects.length === 0)
      s.push(
        "No research projects recorded. Consider applying for funded projects to increase research output."
      );
    else {
      const ongoing = researchProjects.filter(
        (r) => (r.status || "").toLowerCase() === "ongoing"
      ).length;
      if (ongoing > 0)
        s.push(
          `${ongoing} ongoing research project(s). Make sure to document milestones.`
        );
    }

    if (
      researchGuidance.some((rg) =>
        (rg.type || "").toLowerCase().includes("ph.d")
      )
    ) {
      const phds = researchGuidance.filter((rg) =>
        (rg.type || "").toLowerCase().includes("ph.d")
      ).length;
      s.push(`You have guided ${phds} Ph.D. candidate(s).`);
    }

    setInsights(s);
  }, [publications, researchPapers, researchProjects, researchGuidance]);

  // utility: save all submodules to firestore and cache
  const saveAll = async (overrides?: Partial<Record<string, Row[]>>) => {
    if (!userId) return;
    const payload = {
      researchPapers: overrides?.researchPapers ?? researchPapers,
      publications: overrides?.publications ?? publications,
      ictInnovations: overrides?.ictInnovations ?? ictInnovations,
      researchGuidance: overrides?.researchGuidance ?? researchGuidance,
      researchProjects: overrides?.researchProjects ?? researchProjects,
      consultancyProjects:
        overrides?.consultancyProjects ?? consultancyProjects,
    };

    // optimistic cache update
    localStorage.setItem("part_b_table2_v1", JSON.stringify(payload));

    try {
      const userRef = doc(firestore, "users", userId);
      await updateDoc(userRef, { "part_b.table2": payload });
    } catch (err) {
      // if update fails, try setDoc
      try {
        const userRef = doc(firestore, "users", userId);
        await setDoc(userRef, { part_b: { table2: payload } }, { merge: true });
      } catch (e) {
        console.error("Failed to write table2 to firestore:", e);
      }
    }
  };

  // Generic handlers for add/edit/delete per submodule
  // They mutate local state and call saveAll()
  const addRow = (which: string, row: Row) => {
    switch (which) {
      case "researchPapers":
        setResearchPapers((prev) => {
          const n = [...prev, row];
          saveAll({ researchPapers: n });
          return n;
        });
        break;
      case "publications":
        setPublications((prev) => {
          const n = [...prev, row];
          saveAll({ publications: n });
          return n;
        });
        break;
      case "ictInnovations":
        setIctInnovations((prev) => {
          const n = [...prev, row];
          saveAll({ ictInnovations: n });
          return n;
        });
        break;
      case "researchGuidance":
        setResearchGuidance((prev) => {
          const n = [...prev, row];
          saveAll({ researchGuidance: n });
          return n;
        });
        break;
      case "researchProjects":
        setResearchProjects((prev) => {
          const n = [...prev, row];
          saveAll({ researchProjects: n });
          return n;
        });
        break;
      case "consultancyProjects":
        setConsultancyProjects((prev) => {
          const n = [...prev, row];
          saveAll({ consultancyProjects: n });
          return n;
        });
        break;
      default:
        break;
    }
  };

  const editRow = (which: string, index: number, row: Row) => {
    switch (which) {
      case "researchPapers":
        setResearchPapers((prev) => {
          const n = prev.slice();
          n[index] = row;
          saveAll({ researchPapers: n });
          return n;
        });
        break;
      case "publications":
        setPublications((prev) => {
          const n = prev.slice();
          n[index] = row;
          saveAll({ publications: n });
          return n;
        });
        break;
      case "ictInnovations":
        setIctInnovations((prev) => {
          const n = prev.slice();
          n[index] = row;
          saveAll({ ictInnovations: n });
          return n;
        });
        break;
      case "researchGuidance":
        setResearchGuidance((prev) => {
          const n = prev.slice();
          n[index] = row;
          saveAll({ researchGuidance: n });
          return n;
        });
        break;
      case "researchProjects":
        setResearchProjects((prev) => {
          const n = prev.slice();
          n[index] = row;
          saveAll({ researchProjects: n });
          return n;
        });
        break;
      case "consultancyProjects":
        setConsultancyProjects((prev) => {
          const n = prev.slice();
          n[index] = row;
          saveAll({ consultancyProjects: n });
          return n;
        });
        break;
      default:
        break;
    }
  };

  const deleteRow = (which: string, index: number) => {
    switch (which) {
      case "researchPapers":
        setResearchPapers((prev) => {
          const n = prev.slice();
          n.splice(index, 1);
          saveAll({ researchPapers: n });
          return n;
        });
        break;
      case "publications":
        setPublications((prev) => {
          const n = prev.slice();
          n.splice(index, 1);
          saveAll({ publications: n });
          return n;
        });
        break;
      case "ictInnovations":
        setIctInnovations((prev) => {
          const n = prev.slice();
          n.splice(index, 1);
          saveAll({ ictInnovations: n });
          return n;
        });
        break;
      case "researchGuidance":
        setResearchGuidance((prev) => {
          const n = prev.slice();
          n.splice(index, 1);
          saveAll({ researchGuidance: n });
          return n;
        });
        break;
      case "researchProjects":
        setResearchProjects((prev) => {
          const n = prev.slice();
          n.splice(index, 1);
          saveAll({ researchProjects: n });
          return n;
        });
        break;
      case "consultancyProjects":
        setConsultancyProjects((prev) => {
          const n = prev.slice();
          n.splice(index, 1);
          saveAll({ consultancyProjects: n });
          return n;
        });
        break;
      default:
        break;
    }
  };

  // render helper: table per submodule
  const SubmoduleTable = ({
    title,
    icon: Icon,
    fields,
    rows,
    which,
  }: {
    title: string;
    icon: any;
    fields: { id: string; label: string; type: string; required?: boolean }[];
    rows: Row[];
    which: string;
  }) => {
    const [openAdd, setOpenAdd] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingData, setEditingData] = useState<Row | null>(null);

    return (
      <Card className="mb-6">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle>{title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={openAdd} onOpenChange={setOpenAdd}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setOpenAdd(true)}
                  variant="default"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add {title}</DialogTitle>
                </DialogHeader>
                <GenericForm
                  fields={fields}
                  initialData={{}}
                  onSave={(data, close) => {
                    addRow(which, data);
                    if (close) close();
                    setOpenAdd(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">No records yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200 rounded-md">
                <thead>
                  <tr className="bg-gray-100">
                    {fields.map((f) => (
                      <th key={f.id} className="px-4 py-2 border text-left">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {fields.map((f) => (
                        <td key={f.id} className="px-4 py-2 border">
                          {String(r[f.id] ?? "")}
                        </td>
                      ))}
                      <td className="px-4 py-2 border flex space-x-2">
                        <Dialog
                          open={editingIndex === idx}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingIndex(null);
                              setEditingData(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingIndex(idx);
                                setEditingData(rows[idx]);
                              }}
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit {title}</DialogTitle>
                            </DialogHeader>
                            <GenericForm
                              fields={fields}
                              initialData={editingData || {}}
                              onSave={(data, close) => {
                                editRow(which, idx, data);
                                if (close) close();
                                setEditingIndex(null);
                                setEditingData(null);
                              }}
                            />
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteRow(which, idx)}
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
    );
  };

  // Generic form component used inside Dialogs
  function GenericForm({
    fields,
    initialData = {},
    onSave,
  }: {
    fields: { id: string; label: string; type: string; required?: boolean }[];
    initialData?: Row;
    onSave: (data: Row, closeModal?: () => void) => void;
  }) {
    const [form, setForm] = useState<Row>({ ...initialData });

    useEffect(() => setForm({ ...initialData }), [initialData]);

    const handleChange = (id: string, value: any) =>
      setForm((prev) => ({ ...prev, [id]: value }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Basic validation for required fields
      for (const f of fields) {
        if (f.required && (form[f.id] === undefined || form[f.id] === "")) {
          alert(`Please fill ${f.label}`);
          return;
        }
      }
      onSave(form, () => {
        /* DialogClose wrapper will close */
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => (
          <div key={f.id} className="flex flex-col">
            <label className="text-sm font-medium text-muted-foreground mb-1">
              {f.label}
            </label>
            {f.type === "text" || f.type === "number" ? (
              <input
                type={f.type}
                value={form[f.id] ?? ""}
                onChange={(e) =>
                  handleChange(
                    f.id,
                    f.type === "number"
                      ? Number(e.target.value)
                      : e.target.value
                  )
                }
                className="p-2 border rounded-md"
              />
            ) : (
              <input
                type="text"
                value={form[f.id] ?? ""}
                onChange={(e) => handleChange(f.id, e.target.value)}
                className="p-2 border rounded-md"
              />
            )}
          </div>
        ))}

        <div className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit">Save</Button>
          </DialogClose>
        </div>
      </form>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading Research & Contributions...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-muted/10 to-background space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">
          Research & Academic Contributions
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SubmoduleTable
            title="Research Papers (Peer-reviewed / UGC)"
            icon={FileText}
            fields={researchPaperFields}
            rows={researchPapers}
            which="researchPapers"
          />
          <SubmoduleTable
            title="Publications (Books / Chapters / Translations)"
            icon={BookOpen}
            fields={publicationFields}
            rows={publications}
            which="publications"
          />
          <SubmoduleTable
            title="ICT & Curriculum Innovation"
            icon={Wifi}
            fields={ictFields}
            rows={ictInnovations}
            which="ictInnovations"
          />
          <SubmoduleTable
            title="Research Guidance (Ph.D., M.Phil., P.G.)"
            icon={Users}
            fields={guidanceFields}
            rows={researchGuidance}
            which="researchGuidance"
          />
          <SubmoduleTable
            title="Research Projects (Completed / Ongoing)"
            icon={FolderPlus}
            fields={projectFields}
            rows={researchProjects}
            which="researchProjects"
          />
          <SubmoduleTable
            title="Consultancy Projects"
            icon={Briefcase}
            fields={consultancyFields}
            rows={consultancyProjects}
            which="consultancyProjects"
          />
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" /> Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No insights available.
                </p>
              ) : (
                <ul className="list-disc pl-5 space-y-2">
                  {insights.map((s, i) => (
                    <li key={i} className="text-sm">
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 text-xs text-muted-foreground">
                Tip: Keep ISSN/DOI and funding amounts filled — they'll help
                automated scoring.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div>
                  <strong>Research papers:</strong> {researchPapers.length}
                </div>
                <div>
                  <strong>Publications:</strong> {publications.length}
                </div>
                <div>
                  <strong>ICT innovations:</strong> {ictInnovations.length}
                </div>
                <div>
                  <strong>Research guidance:</strong> {researchGuidance.length}
                </div>
                <div>
                  <strong>Research projects:</strong> {researchProjects.length}
                </div>
                <div>
                  <strong>Consultancies:</strong> {consultancyProjects.length}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => {
                  // refresh from firestore
                  if (!userId) return;
                  setLoading(true);
                  getDoc(doc(firestore, "users", userId))
                    .then((snap) => {
                      if (snap.exists()) {
                        const t = snap.data()?.part_b?.table2 || {};
                        setResearchPapers(t.researchPapers || []);
                        setPublications(t.publications || []);
                        setIctInnovations(t.ictInnovations || []);
                        setResearchGuidance(t.researchGuidance || []);
                        setResearchProjects(t.researchProjects || []);
                        setConsultancyProjects(t.consultancyProjects || []);
                        localStorage.setItem(
                          "part_b_table2_v1",
                          JSON.stringify(t)
                        );
                      }
                    })
                    .catch((err) => console.error(err))
                    .finally(() => setLoading(false));
                }}
              >
                Refresh from DB
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  // clear cache
                  localStorage.removeItem("part_b_table2_v1");
                  alert(
                    "Local cache cleared. Refresh page to re-fetch from DB."
                  );
                }}
              >
                Clear Cache
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
