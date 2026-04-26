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
  FileText,
  Filter,
  Building2,
  User,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

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
    transition: { duration: 0.4, delay: i * 0.07, ease: "easeOut" as const },
  }),
};

function prepareRowForExport(data: any): Record<string, string | number> {
  const partA = data.part_a ?? {};
  const partB = data.part_b ?? {};
  const personalIn = partA.personal_in ?? {};
  const experience = partA.teaching_research_experience ?? {};
  const table2 = partB.table2 ?? {};
  return {
    name: data.name ?? data.full_name ?? "",
    email: data.email ?? "",
    employee_id: data.employee_id ?? "",
    department: data.department ?? "",
    designation: data.designation ?? personalIn.current_designation ?? "",
    phone: data.phone ?? personalIn.telephone ?? "",
    role: data.role ?? "",
    address: personalIn.address ?? "",
    cas_stage:
      personalIn.level_cas ?? data.formHeader?.cas_promotion_stage ?? "",
    date_eligibility: personalIn.date_eligibility ?? "",
    ug_teaching_years: experience.ug_years ?? "",
    pg_teaching_years: experience.pg_years ?? "",
    research_years: experience.research_years ?? "",
    specialization: experience.specialization ?? "",
    academic_qualifications_count: (partA.academic_qualifications ?? []).length,
    research_degrees_count: (partA.research_degrees ?? []).length,
    fdp_courses_count: (partA.courses_fdp ?? []).length,
    research_papers_count: (table2.researchPapers ?? []).length,
    publications_count: (table2.publications ?? []).length,
    research_projects_count: (table2.researchProjects ?? []).length,
    consultancy_projects_count: (table2.consultancyProjects ?? []).length,
    ict_innovations_count: (table2.ictInnovations ?? []).length,
    research_guidance_count: (table2.researchGuidance ?? []).length,
    patents_awards_count: (partB.patents_policy_awards ?? []).length,
    invited_lectures_count: (partB.invited_lectures ?? []).length,
    research_paper_titles: (table2.researchPapers ?? [])
      .map((p: any) => p.title)
      .join("; "),
    publication_titles: (table2.publications ?? [])
      .map((p: any) => p.title)
      .join("; "),
    research_project_titles: (table2.researchProjects ?? [])
      .map((p: any) => p.title)
      .join("; "),
    patent_award_titles: (partB.patents_policy_awards ?? [])
      .map((p: any) => p.title)
      .join("; "),
  };
}

export default function ExportPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  // PDF filter state - Default: 2020 to current year
  const currentYear = new Date().getFullYear();
  const [yearFrom, setYearFrom] = useState("2020");
  const [yearTo, setYearTo] = useState(String(currentYear));
  const [pdfRole, setPdfRole] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState<"faculty" | "dept" | null>(
    null,
  );
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      setUserId(user.uid);
      try {
        const snap = await getDoc(doc(firestore, "users", user.uid));
        if (snap.exists()) setUserData(snap.data() as UserData);
      } catch {
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    fetch(`${SERVER_URL}/health`, { signal: AbortSignal.timeout(3000) })
      .then((r) => setServerOnline(r.ok))
      .catch(() => setServerOnline(false));
  }, []);

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
      let rawData: any[] = [];
      if (Array.isArray(json.data)) rawData = json.data;
      else if (json.data && typeof json.data === "object")
        rawData = [json.data];
      else if (Array.isArray(json.logs)) rawData = json.logs;
      else if (Array.isArray(json.faculty)) rawData = json.faculty;

      if (rawData.length === 0) {
        toast({
          title: "No data",
          description: "Nothing to export yet.",
          variant: "destructive",
        });
        return;
      }
      const preparedData = rawData.map((row) => prepareRowForExport(row));
      const allKeys = Array.from(
        new Set(preparedData.flatMap((r) => Object.keys(r))),
      );
      const header = allKeys.map((k) => `"${k}"`).join(",");
      const rows = preparedData.map((row) =>
        allKeys
          .map((k) => `"${String(row[k] ?? "").replace(/"/g, '""')}"`)
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

  const handleFacultyPDF = async () => {
    if (!serverOnline) {
      toast({
        title: "Server offline",
        description: "Python PDF server is not running.",
        variant: "destructive",
      });
      return;
    }
    setGeneratingPdf("faculty");
    try {
      const params = new URLSearchParams();
      if (yearFrom) params.append("year_from", yearFrom);
      if (yearTo) params.append("year_to", yearTo);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${SERVER_URL}/api/generate/pdf/${userId}${qs}`);
      if (!res.ok)
        throw new Error((await res.json()).error || "PDF generation failed");
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), {
        href,
        download: `My_PBAS_Report.pdf`,
      }).click();
      URL.revokeObjectURL(href);
      toast({
        title: "PDF downloaded!",
        description: "Your PBAS report has been generated.",
      });
    } catch (err: any) {
      toast({
        title: "PDF failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleDeptPDF = async () => {
    if (!serverOnline) {
      toast({
        title: "Server offline",
        description: "Python PDF server is not running.",
        variant: "destructive",
      });
      return;
    }
    setGeneratingPdf("dept");
    try {
      const body: Record<string, string> = {};
      if (userData?.department) body.department = userData.department;
      if (yearFrom) body.year_from = yearFrom;
      if (yearTo) body.year_to = yearTo;
      if (pdfRole) body.role = pdfRole;
      const res = await fetch(`${SERVER_URL}/api/generate/report/department`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Report generation failed");
      const blob = await res.blob();
      const dept = (userData?.department ?? "Dept").replace(/\s+/g, "_");
      const href = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), {
        href,
        download: `${dept}_Report.pdf`,
      }).click();
      URL.revokeObjectURL(href);
      toast({
        title: "Report downloaded!",
        description: "Department PDF report generated.",
      });
    } catch (err: any) {
      toast({
        title: "Report failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(null);
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

  const role = userData?.role ?? "";
  const isHodOrAdmin =
    role === "hod" || role === "admin" || role === "misAdmin";
  const visibleOptions = EXPORT_OPTIONS.filter((o) => o.roles.includes(role));
  const displayName =
    userData?.full_name ?? userData?.name ?? userData?.email ?? "User";

  return (
    <AppShell
      user={
        userData
          ? {
              email: userData.email,
              name: displayName,
              role: role as any,
              department: userData.department,
            }
          : null
      }
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--brand-primary-subtle)" }}
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
                Download reports and data files
              </p>
            </div>
          </div>
        </motion.div>

        {/* â”€â”€ PDF Reports (HOD / Admin) â”€â”€ */}
        {isHodOrAdmin && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText
                className="w-4 h-4"
                style={{ color: "var(--brand-primary)" }}
              />
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--text-1)" }}
              >
                PDF Reports
              </h2>
              {/* Server status pill */}
              <span
                className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${serverOnline ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}
              >
                {serverOnline === null
                  ? "Checking serverâ€¦"
                  : serverOnline
                    ? "PDF Server Online"
                    : "PDF Server Offline"}
              </span>
            </div>

            {/* Filters row */}
            <div
              className="rounded-2xl p-5 mb-4 space-y-4"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Filter
                  className="w-4 h-4"
                  style={{ color: "var(--text-3)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-2)" }}
                >
                  Filter options (applied to all PDF exports)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Year From */}
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs font-medium"
                    style={{ color: "var(--text-3)" }}
                  >
                    Year From
                  </label>
                  <div
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <Calendar
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: "var(--text-3)" }}
                    />
                    <input
                      type="number"
                      placeholder="2020"
                      value={yearFrom}
                      onChange={(e) => setYearFrom(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                      style={{ color: "var(--text-1)" }}
                    />
                  </div>
                </div>

                {/* Year To */}
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs font-medium"
                    style={{ color: "var(--text-3)" }}
                  >
                    Year To
                  </label>
                  <div
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <Calendar
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: "var(--text-3)" }}
                    />
                    <input
                      type="number"
                      placeholder={String(new Date().getFullYear())}
                      value={yearTo}
                      onChange={(e) => setYearTo(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                      style={{ color: "var(--text-1)" }}
                    />
                  </div>
                </div>

                {/* Role filter (dept report) */}
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs font-medium"
                    style={{ color: "var(--text-3)" }}
                  >
                    Role (dept report)
                  </label>
                  <select
                    value={pdfRole}
                    onChange={(e) => setPdfRole(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-1)",
                    }}
                  >
                    <option value="">All roles</option>
                    <option value="faculty">Faculty only</option>
                    <option value="hod">HOD only</option>
                  </select>
                </div>

                {/* Department (read-only) */}
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs font-medium"
                    style={{ color: "var(--text-3)" }}
                  >
                    Department
                  </label>
                  <div
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <Building2
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: "var(--text-3)" }}
                    />
                    <span
                      className="text-sm truncate"
                      style={{ color: "var(--text-2)" }}
                    >
                      {userData?.department || "All departments"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF action cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* My PDF Report */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl p-5 flex flex-col gap-4"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--brand-primary-subtle)" }}
                  >
                    <User
                      className="w-5 h-5"
                      style={{ color: "var(--brand-primary)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-1)" }}
                    >
                      My PBAS PDF Report
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-3)" }}
                    >
                      VESIT-branded PDF with your complete PBAS data, charts,
                      and summary.
                      {yearFrom && yearTo
                        ? ` Filtered: ${yearFrom}â€“${yearTo}.`
                        : ""}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleFacultyPDF}
                  disabled={!serverOnline || generatingPdf === "faculty"}
                  className="w-full btn-primary"
                  size="sm"
                >
                  {generatingPdf === "faculty" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                      Generatingâ€¦
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 mr-2" />
                      Download My PDF
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Department PDF Report */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl p-5 flex flex-col gap-4"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--brand-accent-subtle)" }}
                  >
                    <Building2
                      className="w-5 h-5"
                      style={{ color: "var(--brand-accent)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-1)" }}
                    >
                      Department Analytics PDF
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-3)" }}
                    >
                      Full department report with faculty-wise breakdown,
                      charts, and summaries.
                      {yearFrom && yearTo
                        ? ` Filtered: ${yearFrom} – ${yearTo}.`
                        : ""}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleDeptPDF}
                  disabled={!serverOnline || generatingPdf === "dept"}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  {generatingPdf === "dept" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                      Generatingâ€¦
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3.5 h-3.5 mr-2" />
                      Download Dept Report
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </section>
        )}

        {/* â”€â”€ My own PDF (faculty) â”€â”€ */}
        {role === "faculty" && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText
                className="w-4 h-4"
                style={{ color: "var(--brand-primary)" }}
              />
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--text-1)" }}
              >
                PDF Report
              </h2>
              <span
                className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${serverOnline ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}
              >
                {serverOnline === null
                  ? "Checkingâ€¦"
                  : serverOnline
                    ? "Server Online"
                    : "Server Offline"}
              </span>
            </div>

            {/* Year filter */}
            <div
              className="rounded-2xl p-5 mb-4"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Filter
                  className="w-4 h-4"
                  style={{ color: "var(--text-3)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-2)" }}
                >
                  Filter by year range (optional)
                </span>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label
                    className="text-xs font-medium"
                    style={{ color: "var(--text-3)" }}
                  >
                    From
                  </label>
                  <input
                    type="number"
                    placeholder="2020"
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-1)",
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label
                    className="text-xs font-medium"
                    style={{ color: "var(--text-3)" }}
                  >
                    To
                  </label>
                  <input
                    type="number"
                    placeholder={String(new Date().getFullYear())}
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-1)",
                    }}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleFacultyPDF}
              disabled={!serverOnline || generatingPdf === "faculty"}
              className="btn-primary"
              size="sm"
            >
              {generatingPdf === "faculty" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  Generatingâ€¦
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  Download My PBAS PDF
                </>
              )}
            </Button>
          </section>
        )}

        {/* â”€â”€ CSV Exports â”€â”€ */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet
              className="w-4 h-4"
              style={{ color: "var(--brand-accent)" }}
            />
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--text-1)" }}
            >
              CSV Exports
            </h2>
          </div>
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
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: option.bg }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: option.color }}
                      />
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
                        Exporting...
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
        </section>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl px-5 py-4 text-sm flex items-start gap-3"
          style={{ background: "var(--border-subtle)", color: "var(--text-3)" }}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            CSV exports are compatible with Excel and Google Sheets. PDF reports
            are generated server-side with VESIT branding and require the Python
            server to be running.
          </p>
        </motion.div>
      </div>
    </AppShell>
  );
}
