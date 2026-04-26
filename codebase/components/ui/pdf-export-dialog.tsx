"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import {
  Download,
  X,
  Calendar,
  FileText,
  BarChart3,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  Loader2,
  TrendingUp,
  Award,
  Briefcase,
  Radio,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Types ─────────────────────────────────────────────────── */

interface ExportSection {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  defaultEnabled: boolean;
}

interface ExportParams {
  fromDate: string;
  toDate: string;
  sections: string[];
  department?: string;
  format: "pdf" | "csv";
  includeCharts: boolean;
  includeSummary: boolean;
}

const SECTIONS: ExportSection[] = [
  {
    id: "profile",
    label: "Faculty Profile",
    icon: Users,
    description: "Personal and contact info",
    defaultEnabled: true,
  },
  {
    id: "research-papers",
    label: "Research Papers",
    icon: BookOpen,
    description: "Journal articles and conference papers",
    defaultEnabled: true,
  },
  {
    id: "publications",
    label: "Publications (Books/Chapters)",
    icon: BookOpen,
    description: "Books and book chapters",
    defaultEnabled: true,
  },
  {
    id: "patents",
    label: "Patents & Awards",
    icon: Award,
    description: "Patent filings and intellectual property",
    defaultEnabled: true,
  },
  {
    id: "research-projects",
    label: "Research Projects",
    icon: TrendingUp,
    description: "Funded research projects",
    defaultEnabled: true,
  },
  {
    id: "consultancy",
    label: "Consultancy Projects",
    icon: Briefcase,
    description: "Consultancy and advisory work",
    defaultEnabled: true,
  },
  {
    id: "guidance",
    label: "Research Guidance",
    icon: Users,
    description: "Student supervision and guidance",
    defaultEnabled: true,
  },
  {
    id: "lectures",
    label: "Invited Lectures",
    icon: Radio,
    description: "Seminars, workshops, conferences",
    defaultEnabled: true,
  },
  {
    id: "teaching",
    label: "Teaching Data",
    icon: GraduationCap,
    description: "Teaching hours and FDP participation",
    defaultEnabled: false,
  },
  {
    id: "appraisals",
    label: "Appraisal Summary",
    icon: FileText,
    description: "PBAS scores and HOD feedback",
    defaultEnabled: false,
  },
  {
    id: "stats",
    label: "Visual Analytics",
    icon: BarChart3,
    description: "Charts and performance diagrams",
    defaultEnabled: true,
  },
];

/* ─── Section Toggle ─────────────────────────────────────────── */
function SectionToggle({
  section,
  enabled,
  onToggle,
}: {
  section: ExportSection;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-150 text-left w-full"
      style={{
        borderColor: enabled ? "var(--brand-primary)" : "var(--border-default)",
        background: enabled ? "var(--brand-primary-subtle)" : "transparent",
      }}
    >
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: enabled ? "var(--brand-primary)" : "var(--border-subtle)",
          color: enabled ? "white" : "var(--text-3)",
        }}
      >
        <section.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs sm:text-sm font-semibold"
          style={{ color: "var(--text-1)" }}
        >
          {section.label}
        </p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          {section.description}
        </p>
      </div>
      <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150"
        style={{
          borderColor: enabled
            ? "var(--brand-primary)"
            : "var(--border-strong)",
          background: enabled ? "var(--brand-primary)" : "transparent",
        }}
      >
        {enabled && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

/* ─── Main Dialog ────────────────────────────────────────────── */
interface PdfExportDialogProps {
  open: boolean;
  onClose: () => void;
  /** The UID to export (defaults to current user) */
  targetUserId?: string;
  targetName?: string;
  department?: string;
  role?: string;
}

export function PdfExportDialog({
  open,
  onClose,
  targetUserId,
  targetName,
  department,
  role,
}: PdfExportDialogProps) {
  const today = new Date();
  const defaultStart = new Date(2020, 0, 1); // January 1, 2020

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const [params, setParams] = useState<ExportParams>({
    fromDate: fmt(defaultStart),
    toDate: fmt(today),
    sections: SECTIONS.filter((s) => s.defaultEnabled).map((s) => s.id),
    department: department,
    format: "pdf",
    includeCharts: true,
    includeSummary: true,
  });
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState<"params" | "confirm">("params");

  function toggleSection(id: string) {
    setParams((p) => ({
      ...p,
      sections: p.sections.includes(id)
        ? p.sections.filter((s) => s !== id)
        : [...p.sections, id],
    }));
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      if (params.format === "pdf") {
        await generatePDF();
      } else {
        await generateCSV();
      }
    } catch (e) {
      console.error("Export error:", e);
      alert("Export failed. Please try again.");
    } finally {
      setGenerating(false);
      onClose();
    }
  }

  async function generatePDF() {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const SERVER_URL =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

    // For department analytics PDF export
    if (department) {
      const yearFrom = parseInt(params.fromDate.slice(0, 4)) || 2020;
      const yearTo = parseInt(params.toDate.slice(0, 4)) || new Date().getFullYear();

      try {
        // Try Python backend first
        const healthResp = await fetch(`${SERVER_URL}/health`, {
          signal: AbortSignal.timeout(2500),
        });

        if (healthResp.ok) {
          const resp = await fetch(`${SERVER_URL}/api/generate/report/department`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              department,
              year_from: yearFrom,
              year_to: yearTo,
              categories: params.sections,
            }),
            signal: AbortSignal.timeout(30000),
          });

          if (resp.ok) {
            const blob = await resp.blob();
            const href = URL.createObjectURL(blob);
            const fname = `Department_Report_${department.replace(/\s+/g, "_")}_${yearFrom}-${yearTo}.pdf`;
            Object.assign(document.createElement("a"), {
              href,
              download: fname,
            }).click();
            URL.revokeObjectURL(href);
            return;
          }
        }
      } catch (e) {
        console.warn("Python backend unavailable for PDF");
      }

      // Fallback: Generate analytics and client-side PDF
      try {
        const token = await user.getIdToken();
        const analyticsQuery = new URLSearchParams({
          department,
          yearFrom: String(yearFrom),
          yearTo: String(yearTo),
          categories: params.sections.join(","),
          format: "json",
        });

        const resp = await fetch(
          `/api/export/department-analytics?${analyticsQuery}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!resp.ok) throw new Error(await resp.text());
        const analytics = await resp.json();
        buildDepartmentPrintHTML(analytics);
        return;
      } catch (e) {
        console.error("Failed to generate department PDF:", e);
        throw e;
      }
    }

    // Original faculty PDF export logic
    try {
      const healthResp = await fetch(`${SERVER_URL}/health`, {
        signal: AbortSignal.timeout(2500),
      });

      if (healthResp.ok) {
        const uid = targetUserId || user.uid;
        const yearFrom = params.fromDate.slice(0, 4);
        const yearTo = params.toDate.slice(0, 4);
        const qs = new URLSearchParams();
        if (yearFrom) qs.append("year_from", yearFrom);
        if (yearTo) qs.append("year_to", yearTo);

        const endpoint = department
          ? `${SERVER_URL}/api/generate/report/department`
          : `${SERVER_URL}/api/generate/pdf/${uid}${qs.toString() ? "?" + qs : ""}`;

        const fetchOpts: RequestInit = department
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                department,
                year_from: yearFrom,
                year_to: yearTo,
              }),
            }
          : {};

        const resp = await fetch(endpoint, fetchOpts);
        if (!resp.ok) throw new Error(await resp.text());

        const blob = await resp.blob();
        const href = URL.createObjectURL(blob);
        const fname = department
          ? `${department.replace(/\s+/g, "_")}_Report.pdf`
          : `PBAS_Report_${targetName?.replace(/\s+/g, "_") || uid}.pdf`;
        Object.assign(document.createElement("a"), {
          href,
          download: fname,
        }).click();
        URL.revokeObjectURL(href);
        return;
      }
    } catch {
      /* server offline — fall through to browser print */
    }

    // Fallback: fetch data from Next.js API and open browser print dialog
    const token = await user.getIdToken();
    const query = new URLSearchParams({
      fromDate: params.fromDate,
      toDate: params.toDate,
      sections: params.sections.join(","),
      includeCharts: String(params.includeCharts),
      includeSummary: String(params.includeSummary),
      ...(targetUserId ? { userId: targetUserId } : {}),
      ...(params.department ? { department: params.department } : {}),
    });
    const resp = await fetch(`/api/export/pdf?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error(await resp.text());
    const data: any = await resp.json();
    const html = buildPrintHTML(data, targetName || "Faculty Report", params.sections);
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => {
        w.print();
        setTimeout(() => w.close(), 1500);
      }, 800);
    }
  }

  async function generateCSV() {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Not authenticated");

    // For department CSV export using analytics
    if (department) {
      const yearFrom = parseInt(params.fromDate.slice(0, 4)) || 2020;
      const yearTo = parseInt(params.toDate.slice(0, 4)) || new Date().getFullYear();
      
      const query = new URLSearchParams({
        department,
        yearFrom: String(yearFrom),
        yearTo: String(yearTo),
        categories: params.sections.join(","),
        format: "csv",
      });

      const resp = await fetch(
        `/api/export/department-analytics?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!resp.ok) throw new Error(await resp.text());

      const csv = await resp.text();
      downloadFile(
        csv,
        "text/csv",
        `Department_Analytics_${department}_${yearFrom}-${yearTo}.csv`
      );
      return;
    }

    // For individual faculty CSV export
    const query = new URLSearchParams({
      fromDate: params.fromDate,
      toDate: params.toDate,
      sections: params.sections.join(","),
      ...(targetUserId ? { userId: targetUserId } : {}),
    });

    const endpoint = targetUserId
      ? `/api/export/faculty?${query}`
      : `/api/export/department?${query}`;

    const resp = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error(await resp.text());

    const data: any = await resp.json();
    const csv = jsonToCSV(data.data ?? data);
    downloadFile(
      csv,
      "text/csv",
      `report_${params.fromDate}_${params.toDate}.csv`,
    );
  }

  return (
    <AnimatePresence>
      {open && (
        /* Centered overlay — flex centers the dialog on all screen sizes */
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "var(--surface-overlay)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Dialog */}
          <motion.div
            className="rounded-2xl overflow-hidden w-full"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-4)",
              maxHeight: "calc(100dvh - 2rem)",
              maxWidth: "32rem",
              display: "flex",
              flexDirection: "column",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--brand-primary-subtle)" }}
                >
                  <Download
                    className="w-5 h-5"
                    style={{ color: "var(--brand-primary)" }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--text-1)" }}
                  >
                    Export Report
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--text-3)" }}
                  >
                    {targetName
                      ? `for ${targetName}`
                      : "Customise what to include"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[var(--border-subtle)] text-[var(--text-3)] flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              {/* Info Box */}
              <div
                className="p-3 rounded-lg text-xs"
                style={{
                  background: "var(--brand-primary-subtle)",
                  border: "1px solid var(--brand-primary)",
                  color: "var(--text-1)",
                }}
              >
                <p className="font-semibold mb-1">📋 What's Included:</p>
                <ul style={{ fontSize: "11px", color: "var(--text-2)" }}>
                  <li>✓ Complete faculty profile & qualifications</li>
                  <li>✓ All research papers, publications & patents</li>
                  <li>✓ Projects, consultancy & guidance details</li>
                  <li>✓ Invited lectures & academic activities</li>
                  <li>✓ Teaching hours & FDP participation</li>
                  <li>✓ Performance statistics (2020–{new Date().getFullYear()})</li>
                </ul>
              </div>

              {/* Format selector */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-3)" }}
                >
                  Format
                </p>
                <div className="flex gap-2">
                  {(["pdf", "csv"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setParams((p) => ({ ...p, format: f }))}
                      className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold border transition-all duration-150 whitespace-nowrap"
                      style={{
                        borderColor:
                          params.format === f
                            ? "var(--brand-primary)"
                            : "var(--border-default)",
                        background:
                          params.format === f
                            ? "var(--brand-primary)"
                            : "transparent",
                        color: params.format === f ? "white" : "var(--text-2)",
                      }}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-3)" }}
                >
                  Date Range
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "From", key: "fromDate" as const },
                    { label: "To", key: "toDate" as const },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label
                        className="text-xs mb-1 block"
                        style={{ color: "var(--text-3)" }}
                      >
                        {label}
                      </label>
                      <input
                        type="date"
                        value={params[key]}
                        max={fmt(today)}
                        onChange={(e) =>
                          setParams((p) => ({ ...p, [key]: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl text-sm border"
                        style={{
                          background: "var(--surface-base)",
                          borderColor: "var(--border-default)",
                          color: "var(--text-1)",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Quick ranges */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[
                    { label: "Last 3M", months: 3 },
                    { label: "Last 6M", months: 6 },
                    { label: "Last 1Y", months: 12 },
                    { label: "Last 3Y", months: 36 },
                  ].map(({ label, months }) => (
                    <button
                      key={label}
                      onClick={() => {
                        const d = new Date();
                        d.setMonth(d.getMonth() - months);
                        setParams((p) => ({
                          ...p,
                          fromDate: fmt(d),
                          toDate: fmt(today),
                        }));
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                      style={{
                        borderColor: "var(--border-default)",
                        color: "var(--text-3)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-3)" }}
                  >
                    Sections ({params.sections.length}/{SECTIONS.length})
                  </p>
                  <button
                    onClick={() =>
                      setParams((p) => ({
                        ...p,
                        sections:
                          p.sections.length === SECTIONS.length
                            ? []
                            : SECTIONS.map((s) => s.id),
                      }))
                    }
                    className="text-xs font-semibold"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    {params.sections.length === SECTIONS.length
                      ? "None"
                      : "All"}
                  </button>
                </div>
                <div className="space-y-2">
                  {SECTIONS.map((s) => (
                    <SectionToggle
                      key={s.id}
                      section={s}
                      enabled={params.sections.includes(s.id)}
                      onToggle={() => toggleSection(s.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Options (PDF-only) */}
              {params.format === "pdf" && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-3)" }}
                  >
                    PDF Options
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        key: "includeCharts" as const,
                        label: "Include charts & graphs",
                      },
                      {
                        key: "includeSummary" as const,
                        label: "Include executive summary",
                      },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <button
                          role="switch"
                          aria-checked={params[key]}
                          onClick={() =>
                            setParams((p) => ({ ...p, [key]: !p[key] }))
                          }
                          className="relative w-10 h-5 rounded-full transition-colors duration-200"
                          style={{
                            background: params[key]
                              ? "var(--brand-primary)"
                              : "var(--border-strong)",
                          }}
                        >
                          <span
                            className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                            style={{
                              transform: params[key]
                                ? "translateX(20px)"
                                : "translateX(0)",
                            }}
                          />
                        </button>
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-2)" }}
                        >
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-4 flex gap-3"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={generating}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={generating || params.sections.length === 0}
                onClick={handleGenerate}
                style={{
                  background: "var(--brand-primary)",
                  color: "white",
                  boxShadow: "var(--glow-primary)",
                }}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export {params.format.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Trigger Button ─────────────────────────────────────────── */
interface ExportReportButtonProps {
  targetUserId?: string;
  targetName?: string;
  department?: string;
  role?: string;
  variant?: "button" | "icon";
  label?: string;
}

export function ExportReportButton({
  targetUserId,
  targetName,
  department,
  role,
  variant = "button",
  label = "Export Report",
}: ExportReportButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant === "icon" ? "ghost" : "outline"}
        size={variant === "icon" ? "icon" : "sm"}
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        {variant === "button" && label}
      </Button>
      <PdfExportDialog
        open={open}
        onClose={() => setOpen(false)}
        targetUserId={targetUserId}
        targetName={targetName}
        department={department}
        role={role}
      />
    </>
  );
}

/* ─── Helpers ────────────────────────────────────────────────── */

function jsonToCSV(data: any): string {
  if (Array.isArray(data) && data.length > 0) {
    const keys = Object.keys(data[0]);
    const header = keys.join(",");
    const rows = data.map((row) =>
      keys
        .map((k) => {
          const v = row[k];
          const str =
            typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(","),
    );
    return [header, ...rows].join("\n");
  }
  // Single object
  const flat = flattenObject(data);
  const rows = Object.entries(flat).map(
    ([k, v]) => `"${k}","${String(v ?? "").replace(/"/g, '""')}"`,
  );
  return ["Field,Value", ...rows].join("\n");
}

function flattenObject(obj: any, prefix = ""): Record<string, any> {
  return Object.keys(obj || {}).reduce((acc: Record<string, any>, k) => {
    const key = prefix ? `${prefix}.${k}` : k;
    const v = obj[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(acc, flattenObject(v, key));
    } else {
      acc[key] = Array.isArray(v) ? v.length : v;
    }
    return acc;
  }, {});
}

function downloadFile(content: string, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Build a branded HTML string for the browser print fallback - COMPREHENSIVE VERSION */
function buildPrintHTML(data: any, title: string, selectedSections: string[] = []): string {
  const d = data?.data ?? data;
  const profile = Array.isArray(d) ? d[0] : d;
  const partA = profile?.part_a ?? {};
  const partB = profile?.part_b ?? {};
  
  const papers = partB?.table2?.researchPapers ?? [];
  const pubs = partB?.table2?.publications ?? [];
  const projects = partB?.table2?.researchProjects ?? [];
  const consultancy = partB?.table2?.consultancyProjects ?? [];
  const patents = partB?.patents_policy_awards ?? [];
  const lectures = partB?.invited_lectures ?? [];
  const guidance = partB?.table2?.researchGuidance ?? [];
  const teaching = partB?.teaching_data ?? {};
  const courses = partB?.courses_fdp ?? [];

  // Helper: Generate ASCII bar chart
  const generateBarChart = (data: Array<{label: string, value: number}>) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const scale = 20 / maxVal;
    return data.map(d => {
      const barLen = Math.round(d.value * scale);
      const bar = "█".repeat(barLen) + "░".repeat(20 - barLen);
      return `${d.label.padEnd(15)} │ ${bar} ${d.value}`;
    }).join("\n");
  };

  // Helper: Generate SVG pie chart data
  const generatePieChart = (data: Array<{label: string, value: number}>) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return "";
    
    let html = `<div style="margin:10px 0;"><svg width="200" height="120" viewBox="0 0 200 120">`;
    let currentAngle = -90;
    
    data.forEach((d, i) => {
      const percentage = (d.value / total) * 100;
      const angle = (percentage / 100) * 360;
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444"];
      
      const x1 = 100 + 40 * Math.cos((currentAngle * Math.PI) / 180);
      const y1 = 60 + 40 * Math.sin((currentAngle * Math.PI) / 180);
      const endAngle = currentAngle + angle;
      const x2 = 100 + 40 * Math.cos((endAngle * Math.PI) / 180);
      const y2 = 60 + 40 * Math.sin((endAngle * Math.PI) / 180);
      
      const largeArc = angle > 180 ? 1 : 0;
      html += `<path d="M 100 60 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${colors[i % colors.length]}" stroke="#fff" stroke-width="1"/>`;
      
      currentAngle = endAngle;
    });
    
    html += `</svg></div><div style="font-size:8px;margin-top:5px;">`;
    data.forEach((d, i) => {
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444"];
      const pct = ((d.value / total) * 100).toFixed(1);
      html += `<div>■ ${d.label}: ${d.value} (${pct}%)</div>`;
    });
    html += `</div>`;
    return html;
  };

  const renderDetailedTable = (items: any[], title: string, fields: any[]) => {
    if (items.length === 0) return "";
    
    return `<h3>${title} (${items.length})</h3>
    <table>
      <thead><tr>${fields.map(f => `<th style="font-size:8px">${f.label}</th>`).join("")}</tr></thead>
      <tbody>
        ${items.map((item, idx) => `
          <tr>
            ${fields.map(f => {
              let val = item[f.key];
              if (Array.isArray(val)) val = val.join("; ");
              if (typeof val === "object") val = JSON.stringify(val);
              return `<td style="font-size:8px">${val ?? "—"}</td>`;
            }).join("")}
          </tr>
        `).join("")}
      </tbody>
    </table>`;
  };

  const shouldInclude = (section: string) => selectedSections.length === 0 || selectedSections.includes(section);

  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Times New Roman',serif;color:#111;padding:15mm;background:#fff;line-height:1.4}
      .hdr{background:linear-gradient(135deg, #1f2937 0%, #374151 100%);color:#fff;padding:20px;margin:-15mm -15mm 25px;display:flex;align-items:center;gap:20px;border-bottom:3px solid #f59e0b}
      .hdr img{height:50px;object-fit:contain;filter:brightness(1.1)}
      .hdr-text h1{font-size:16px;font-weight:700;margin:0;letter-spacing:0.5px}
      .hdr-text p{font-size:9px;opacity:.95;margin:3px 0 0;font-style:italic}
      h2{font-size:14px;font-weight:700;margin:18px 0 10px;border-bottom:2px solid #1f2937;padding-bottom:6px;color:#1f2937}
      h3{background:#1f2937;color:#fff;font-size:10px;padding:7px 10px;margin:12px 0 8px;font-weight:700;border-radius:3px}
      table{width:100%;border-collapse:collapse;font-size:8px;margin-bottom:12px}
      th{background:#374151;color:#fff;padding:6px 8px;text-align:left;font-weight:700;font-size:8px}
      td{padding:5px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top}
      tr:nth-child(even) td{background:#f9fafb}
      .kv{display:grid;grid-template-columns:110px 1fr;gap:10px;font-size:9px;margin-bottom:5px;padding:5px 0}
      .kv b{color:#374151;font-weight:600}
      .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
      .stat-card{background:#f0f9ff;border-left:4px solid #3b82f6;padding:10px;border-radius:2px}
      .stat-card h4{color:#1e40af;font-size:9px;margin:0 0 3px}
      .stat-card .value{font-size:16px;font-weight:700;color:#1f2937}
      .chart-section{margin:15px 0;padding:10px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:3px}
      .footer{margin-top:25px;padding:15px;border-top:2px solid #1f2937;background:#f9fafb;font-size:8px;color:#666;text-align:center;border-radius:3px}
      .page-break{page-break-after:always;margin:20px 0}
      pre{background:#f3f4f6;padding:8px;font-size:7px;overflow-x:auto;border:1px solid #d1d5db;border-radius:2px;margin:8px 0}
      @media print{body{padding:10mm}.hdr{margin:-10mm -10mm 20px}}
    </style>
  </head>
  <body>
    <div class="hdr">
      <img src="https://vesit.ves.ac.in/navbar2024nobackground.png" alt="VESIT" />
      <div class="hdr-text">
        <h1>Vivekanand Education Society's Institute of Technology</h1>
        <p>Chembur, Mumbai – 400 074  |  Autonomous Institution | PBAS Report</p>
      </div>
    </div>

    ${shouldInclude("profile") ? `
    <h2>Faculty Profile</h2>
    <div class="kv"><b>Name:</b><span>${profile?.name ?? profile?.full_name ?? "—"}</span></div>
    <div class="kv"><b>Email:</b><span>${profile?.email ?? "—"}</span></div>
    <div class="kv"><b>Department:</b><span>${profile?.department ?? "—"}</span></div>
    <div class="kv"><b>Designation:</b><span>${profile?.designation ?? "—"}</span></div>
    <div class="kv"><b>Specialization:</b><span>${profile?.specialization ?? "—"}</span></div>
    ${partA?.academicQualifications ? `<div class="kv"><b>Qualifications:</b><span>${Array.isArray(partA.academicQualifications) ? partA.academicQualifications.map((q:any) => q.qualification).join("; ") : "—"}</span></div>` : ""}
    ` : ""}

    ${shouldInclude("stats") ? `
    <h2>Research Summary & Analytics (2020–${new Date().getFullYear()})</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <h4>Research Papers</h4>
        <div class="value">${papers.length}</div>
      </div>
      <div class="stat-card" style="border-left-color:#10b981;background:#f0fdf4">
        <h4>Publications</h4>
        <div class="value">${pubs.length}</div>
      </div>
      <div class="stat-card" style="border-left-color:#f59e0b;background:#fef3c7">
        <h4>Patents</h4>
        <div class="value">${patents.length}</div>
      </div>
      <div class="stat-card" style="border-left-color:#ec4899;background:#fce7f3">
        <h4>Projects</h4>
        <div class="value">${projects.length + consultancy.length}</div>
      </div>
      <div class="stat-card" style="border-left-color:#a855f7;background:#f3e8ff">
        <h4>Guidance</h4>
        <div class="value">${guidance.length}</div>
      </div>
      <div class="stat-card" style="border-left-color:#06b6d4;background:#ecfdf5">
        <h4>Lectures</h4>
        <div class="value">${lectures.length}</div>
      </div>
    </div>

    <div class="chart-section">
      <h3>Research Output Distribution</h3>
      ${generatePieChart([
        { label: "Papers", value: papers.length },
        { label: "Publications", value: pubs.length },
        { label: "Patents", value: patents.length },
        { label: "Projects", value: projects.length },
        { label: "Guidance", value: guidance.length },
        { label: "Lectures", value: lectures.length }
      ])}
    </div>
    ` : ""}

    ${shouldInclude("research-papers") && papers.length > 0 ? renderDetailedTable(papers, "Research Papers", [
      { key: "year", label: "Year" },
      { key: "title", label: "Title" },
      { key: "journal", label: "Journal/Conference" },
      { key: "authors", label: "Authors" },
      { key: "indexing", label: "Indexing" },
      { key: "doi", label: "DOI" }
    ]) : ""}

    ${shouldInclude("publications") && pubs.length > 0 ? renderDetailedTable(pubs, "Publications (Books/Book Chapters)", [
      { key: "year", label: "Year" },
      { key: "title", label: "Title" },
      { key: "publisher", label: "Publisher" },
      { key: "authors", label: "Authors" },
      { key: "pages", label: "Pages" },
      { key: "isbn", label: "ISBN" }
    ]) : ""}

    ${shouldInclude("patents") && patents.length > 0 ? renderDetailedTable(patents, "Patents & Awards", [
      { key: "year", label: "Year" },
      { key: "title", label: "Title" },
      { key: "type", label: "Type" },
      { key: "inventors", label: "Inventors" },
      { key: "patentNo", label: "Patent No." },
      { key: "status", label: "Status" }
    ]) : ""}

    ${shouldInclude("research-projects") && projects.length > 0 ? renderDetailedTable(projects, "Research Projects", [
      { key: "year", label: "Year" },
      { key: "title", label: "Title" },
      { key: "fundingAgency", label: "Funding Agency" },
      { key: "amount", label: "Amount (₹)" },
      { key: "duration", label: "Duration" },
      { key: "status", label: "Status" }
    ]) : ""}

    ${shouldInclude("consultancy") && consultancy.length > 0 ? renderDetailedTable(consultancy, "Consultancy Projects", [
      { key: "year", label: "Year" },
      { key: "title", label: "Title" },
      { key: "agency", label: "Agency" },
      { key: "amount", label: "Amount (₹)" },
      { key: "duration", label: "Duration" },
      { key: "status", label: "Status" }
    ]) : ""}

    ${shouldInclude("guidance") && guidance.length > 0 ? renderDetailedTable(guidance, "Research Guidance & Supervision", [
      { key: "year", label: "Year" },
      { key: "title", label: "Thesis Title" },
      { key: "studentName", label: "Student Name" },
      { key: "level", label: "Level" },
      { key: "status", label: "Status" }
    ]) : ""}

    ${shouldInclude("lectures") && lectures.length > 0 ? renderDetailedTable(lectures, "Invited Lectures & Seminars", [
      { key: "year", label: "Year" },
      { key: "title", label: "Title" },
      { key: "event", label: "Event/Conference" },
      { key: "venue", label: "Venue" },
      { key: "country", label: "Country" }
    ]) : ""}

    ${shouldInclude("teaching") ? `
    <h2>Teaching Activities</h2>
    <div class="kv"><b>Classroom Hours:</b><span>${teaching?.classroomHours ?? "—"}</span></div>
    <div class="kv"><b>Lab/Practicals:</b><span>${teaching?.laboratoriesHours ?? "—"}</span></div>
    <div class="kv"><b>Practicum/Clinical:</b><span>${teaching?.practicumHours ?? "—"}</span></div>
    ${courses.length > 0 ? renderDetailedTable(courses, "FDP & Courses", [
      { key: "year", label: "Year" },
      { key: "title", label: "Course/FDP" },
      { key: "duration", label: "Duration" },
      { key: "organization", label: "Organizer" },
      { key: "type", label: "Type" }
    ]) : ""}
    ` : ""}

    <div class="footer">
      <p><strong>VESIT PBAS Management Platform - Shikshak Sarthi</strong></p>
      <p>Report Generated: ${new Date().toLocaleDateString("en-IN", {year: "numeric",month: "long",day: "numeric"})} at ${new Date().toLocaleTimeString("en-IN")}</p>
      <p>Period: 2020–${new Date().getFullYear()} | Confidential – For Authorized Use Only</p>
    </div>
  </body>
  </html>`;
}

/** Build branded HTML for department analytics print */
function buildDepartmentPrintHTML(analytics: any): void {
  const yearlyData = (analytics.yearlyTrend || [])
    .map(
      (y: any) =>
        `<tr><td>${y.year}</td><td style="text-align:right">${y.publications}</td><td style="text-align:right">${y.researchPapers}</td><td style="text-align:right">${y.patents}</td><td style="text-align:right">${y.projects}</td><td style="text-align:right">${y.consultancy}</td><td style="text-align:right">${y.guidance}</td><td style="text-align:right"><b>${y.total}</b></td></tr>`
    )
    .join("");

  const facultyData = (analytics.facultyDetails || [])
    .map(
      (f: any) =>
        `<tr><td><b>${f.name}</b><br/><small>${f.email}</small></td><td style="text-align:right">${f.publications}</td><td style="text-align:right">${f.researchPapers}</td><td style="text-align:right">${f.patents}</td><td style="text-align:right">${f.projects}</td><td style="text-align:right">${f.consultancy}</td><td style="text-align:right">${f.guidance}</td><td style="text-align:right"><b>${f.total}</b></td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Department Analytics Report - ${analytics.department}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; color: #333; padding: 20mm; background: #fff; }
    .header { background: #1a1a2e; color: #fff; padding: 16px 20px; margin: -20mm -20mm 20px; }
    .header img { height: 40px; object-fit: contain; margin-bottom: 10px; }
    .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 2px; }
    .header p { font-size: 12px; opacity: 0.85; }
    .metadata { display: flex; justify-content: space-between; font-size: 11px; color: #666; margin: 10px 0; }
    h2 { font-size: 18px; font-weight: 700; margin: 20px 0 10px; border-left: 4px solid #1a1a2e; padding-left: 10px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
    .summary-card { background: #f5f5f5; padding: 12px; border-left: 3px solid #1a1a2e; }
    .summary-card .value { font-size: 24px; font-weight: bold; color: #1a1a2e; }
    .summary-card .label { font-size: 10px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 15px; }
    th { background: #1a1a2e; color: #fff; padding: 6px 8px; text-align: left; font-weight: 700; }
    td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
    tr:nth-child(even) td { background: #f9f9f9; }
    .text-right { text-align: right; }
    .page-break { page-break-after: always; }
    .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9px; color: #888; text-align: center; }
    @media print { body { padding: 10mm; } .header { margin: -10mm -10mm 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://vesit.ves.ac.in/navbar2024nobackground.png" alt="VESIT"/>
    <h1>Department Analytics Report</h1>
    <p>${analytics.department} Department</p>
    <div class="metadata">
      <span>Period: ${analytics.periodFrom} - ${analytics.periodTo}</span>
      <span>Generated: ${new Date(analytics.generatedAt).toLocaleDateString()}</span>
    </div>
  </div>

  <h2>Summary Statistics</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="value">${analytics.facultyCount}</div>
      <div class="label">Total Faculty</div>
    </div>
    <div class="summary-card">
      <div class="value">${analytics.summary.totalPublications}</div>
      <div class="label">Publications</div>
    </div>
    <div class="summary-card">
      <div class="value">${analytics.summary.totalResearchPapers}</div>
      <div class="label">Research Papers</div>
    </div>
    <div class="summary-card">
      <div class="value">${analytics.summary.totalPatents}</div>
      <div class="label">Patents</div>
    </div>
    <div class="summary-card">
      <div class="value">${analytics.summary.totalProjects}</div>
      <div class="label">Projects</div>
    </div>
    <div class="summary-card">
      <div class="value">${analytics.summary.totalGuidance}</div>
      <div class="label">Research Guidance</div>
    </div>
  </div>

  <h2>Yearly Trends</h2>
  <table>
    <thead>
      <tr>
        <th>Year</th>
        <th class="text-right">Publications</th>
        <th class="text-right">Papers</th>
        <th class="text-right">Patents</th>
        <th class="text-right">Projects</th>
        <th class="text-right">Consultancy</th>
        <th class="text-right">Guidance</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${yearlyData}
    </tbody>
  </table>

  <h2 class="page-break">Faculty-wise Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Faculty Name</th>
        <th class="text-right">Publications</th>
        <th class="text-right">Papers</th>
        <th class="text-right">Patents</th>
        <th class="text-right">Projects</th>
        <th class="text-right">Consultancy</th>
        <th class="text-right">Guidance</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${facultyData}
    </tbody>
  </table>

  <h2>Performance Metrics</h2>
  <table>
    <tbody>
      <tr>
        <td><b>Avg Publications per Faculty</b></td>
        <td class="text-right">${analytics.summary.avgPublicationsPerFaculty}</td>
      </tr>
      <tr>
        <td><b>Avg Research Papers per Faculty</b></td>
        <td class="text-right">${analytics.summary.avgResearchPapersPerFaculty}</td>
      </tr>
      <tr>
        <td><b>Avg Publications per Year</b></td>
        <td class="text-right">${analytics.summary.avgPapersPerYear}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">This report was generated by Shikshak Sarthi · VESIT PBAS Management Platform</div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
        setTimeout(() => window.close(), 500);
      }, 500);
    });
  </script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
