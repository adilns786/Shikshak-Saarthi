"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db as firestore } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { AppShell } from "@/components/ui/app-shell";
import { motion } from "framer-motion";
import {
  Download,
  FileSpreadsheet,
  Users,
  Activity,
  BarChart3,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  role: string;
  name?: string;
  full_name?: string;
  email: string;
  department?: string;
}

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  format: string;
  roles: string[];
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: "faculty-data",
    title: "All Faculty Data",
    description:
      "Export all faculty profiles, designations, and department info",
    icon: Users,
    color: "var(--brand-primary)",
    bg: "var(--brand-primary-subtle)",
    format: "CSV",
    roles: ["admin", "misAdmin", "hod"],
  },
  {
    id: "activity-logs",
    title: "Activity Logs",
    description: "Export system data ingestion and activity logs",
    icon: Activity,
    color: "var(--brand-accent)",
    bg: "var(--brand-accent-subtle)",
    format: "CSV",
    roles: ["admin", "misAdmin"],
  },
  {
    id: "analytics",
    title: "Analytics Report",
    description: "Export department-wise performance analytics and statistics",
    icon: BarChart3,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    format: "CSV",
    roles: ["admin", "misAdmin", "hod"],
  },
  {
    id: "my-data",
    title: "My PBAS Data",
    description: "Export your own PBAS forms, publications, and research data",
    icon: FileSpreadsheet,
    color: "var(--brand-primary)",
    bg: "var(--brand-primary-subtle)",
    format: "CSV",
    roles: ["faculty", "hod", "admin", "misAdmin"],
  },
];

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0, 0, 0.2, 1] },
  }),
};

/**
 * Flatten a faculty user record into a clean CSV-friendly row,
 * extracting the most useful fields from nested part_a / part_b objects.
 */
function prepareRowForExport(data: any): Record<string, string | number> {
  const partA = data.part_a ?? {};
  const partB = data.part_b ?? {};
  const personalIn = partA.personal_in ?? {};
  const experience = partA.teaching_research_experience ?? {};
  const table2 = partB.table2 ?? {};

  return {
    // Identity
    name: data.name ?? data.full_name ?? "",
    email: data.email ?? "",
    employee_id: data.employee_id ?? "",
    department: data.department ?? "",
    designation: data.designation ?? personalIn.current_designation ?? "",
    phone: data.phone ?? personalIn.telephone ?? "",
    role: data.role ?? "",

    // Part A – Qualifications
    address: personalIn.address ?? "",
    cas_stage:
      personalIn.level_cas ?? data.formHeader?.cas_promotion_stage ?? "",
    date_eligibility: personalIn.date_eligibility ?? "",
    ug_teaching_years: experience.ug_years ?? "",
    pg_teaching_years: experience.pg_years ?? "",
    research_years: experience.research_years ?? "",
    specialization: experience.specialization ?? "",

    // Academic qualifications count
    academic_qualifications_count: (partA.academic_qualifications ?? []).length,
    research_degrees_count: (partA.research_degrees ?? []).length,
    fdp_courses_count: (partA.courses_fdp ?? []).length,

    // Part B – Research outputs
    research_papers_count: (table2.researchPapers ?? []).length,
    publications_count: (table2.publications ?? []).length,
    research_projects_count: (table2.researchProjects ?? []).length,
    consultancy_projects_count: (table2.consultancyProjects ?? []).length,
    ict_innovations_count: (table2.ictInnovations ?? []).length,
    research_guidance_count: (table2.researchGuidance ?? []).length,
    patents_awards_count: (partB.patents_policy_awards ?? []).length,
    invited_lectures_count: (partB.invited_lectures ?? []).length,

    // Research paper titles
    research_paper_titles: (table2.researchPapers ?? [])
      .map((p: any) => p.title)
      .join("; "),

    // Publication titles
    publication_titles: (table2.publications ?? [])
      .map((p: any) => p.title)
      .join("; "),

    // Project titles
    research_project_titles: (table2.researchProjects ?? [])
      .map((p: any) => p.title)
      .join("; "),

    // Patent/award titles
    patent_award_titles: (partB.patents_policy_awards ?? [])
      .map((p: any) => p.title)
      .join("; "),
  };
}

export default function ExportPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      try {
        const snap = await getDoc(doc(firestore, "users", user.uid));
        if (snap.exists()) {
          setUserData(snap.data() as UserData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  const handleExport = async (option: ExportOption) => {
    if (!userData) return;
    setExporting(option.id);

    try {
      const token = await auth.currentUser?.getIdToken();
      let url = "";

      switch (option.id) {
        case "faculty-data":
          url = userData.department
            ? `/api/export/department?department=${encodeURIComponent(userData.department)}`
            : "/api/export/department";
          break;
        case "activity-logs":
          url = "/api/activity-logs?limit=200&format=csv";
          break;
        case "analytics":
          url = userData.department
            ? `/api/export/department?department=${encodeURIComponent(userData.department)}`
            : "/api/export/department";
          break;
        case "my-data":
          url = `/api/export/faculty?userId=${auth.currentUser?.uid}`;
          break;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);

      const json = await res.json();

      // Normalise response into an array of records
      let rawData: any[] = [];
      if (Array.isArray(json.data)) {
        rawData = json.data;
      } else if (json.data && typeof json.data === "object") {
        rawData = [json.data];
      } else if (Array.isArray(json.logs)) {
        rawData = json.logs;
      } else if (Array.isArray(json.faculty)) {
        rawData = json.faculty;
      }

      if (rawData.length === 0) {
        toast({
          title: "No data",
          description: "Nothing to export yet.",
          variant: "destructive",
        });
        return;
      }

      // Flatten and prepare each row properly
      const preparedData = rawData.map((row) => prepareRowForExport(row));

      // Build CSV
      const allKeys = Array.from(
        new Set(preparedData.flatMap((r) => Object.keys(r))),
      );
      const header = allKeys.map((k) => `"${k}"`).join(",");
      const rows = preparedData.map((row) =>
        allKeys
          .map((k) => {
            const v = row[k] ?? "";
            return `"${String(v).replace(/"/g, '""')}"`;
          })
          .join(","),
      );
      const csv = [header, ...rows].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `${option.id}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(href);

      setDone((prev) => [...prev, option.id]);
      toast({
        title: "Exported!",
        description: `${option.title} downloaded as CSV.`,
      });
    } catch (err: unknown) {
      toast({
        title: "Export failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--surface-base)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--brand-primary)" }}
        />
      </div>
    );
  }

  const visibleOptions = EXPORT_OPTIONS.filter((o) =>
    o.roles.includes(userData?.role ?? ""),
  );

  const displayName =
    userData?.full_name ?? userData?.name ?? userData?.email ?? "User";

  return (
    <AppShell
      user={
        userData
          ? {
              email: userData.email,
              name: displayName,
              role: userData.role as "faculty" | "hod" | "admin" | "misAdmin",
              department: userData.department,
            }
          : null
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--brand-primary-subtle)",
              }}
            >
              <Download
                className="w-5 h-5"
                style={{ color: "var(--brand-primary)" }}
              />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--text-1)" }}
              >
                Export Data
              </h1>
              <p className="text-sm" style={{ color: "var(--text-3)" }}>
                Download reports and data as CSV files
              </p>
            </div>
          </div>
        </motion.div>

        {/* Export cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleOptions.map((option, i) => {
            const Icon = option.icon;
            const isExporting = exporting === option.id;
            const isDone = done.includes(option.id);

            return (
              <motion.div
                key={option.id}
                custom={i}
                variants={FADE_UP}
                initial="hidden"
                animate="show"
                className="rounded-2xl p-5 flex flex-col gap-4 hover-lift"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-1)",
                }}
              >
                {/* Icon + badge */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: option.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: option.color }} />
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--border-subtle)",
                      color: "var(--text-3)",
                    }}
                  >
                    {option.format}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3
                    className="font-semibold text-sm mb-1"
                    style={{ color: "var(--text-1)" }}
                  >
                    {option.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--text-3)" }}
                  >
                    {option.description}
                  </p>
                </div>

                {/* Button */}
                <button
                  onClick={() => handleExport(option)}
                  disabled={isExporting}
                  className="w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
                  style={{
                    background: isDone ? "var(--success-bg)" : option.bg,
                    color: isDone ? "var(--success)" : option.color,
                    border: `1px solid ${isDone ? "var(--success)" : option.color}20`,
                  }}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Exporting…
                    </>
                  ) : isDone ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      Export {option.format}
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Info note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl px-5 py-4 text-sm flex items-start gap-3"
          style={{
            background: "var(--border-subtle)",
            color: "var(--text-3)",
          }}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            All exports are in CSV format, compatible with Microsoft Excel,
            Google Sheets, and other spreadsheet applications. Data is exported
            based on your access level and department.
          </p>
        </motion.div>
      </div>
    </AppShell>
  );
}
