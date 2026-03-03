"use client";

import React, { useState, useRef } from "react";
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
  Settings2,
  TrendingUp,
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
    id: "publications",
    label: "Publications",
    icon: BookOpen,
    description: "Research papers, books, conferences",
    defaultEnabled: true,
  },
  {
    id: "appraisals",
    label: "Appraisal Summary",
    icon: FileText,
    description: "PBAS scores and HOD feedback",
    defaultEnabled: true,
  },
  {
    id: "research",
    label: "Research Projects",
    icon: TrendingUp,
    description: "Funded projects and consultancy",
    defaultEnabled: true,
  },
  {
    id: "activities",
    label: "Academic Activities",
    icon: Calendar,
    description: "Seminars, workshops, FDPs",
    defaultEnabled: false,
  },
  {
    id: "stats",
    label: "Performance Stats",
    icon: BarChart3,
    description: "Charts and performance metrics",
    defaultEnabled: true,
  },
  {
    id: "timeline",
    label: "Activity Timeline",
    icon: Clock,
    description: "Chronological activity log",
    defaultEnabled: false,
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
      className="flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 text-left w-full"
      style={{
        borderColor: enabled ? "var(--brand-primary)" : "var(--border-default)",
        background: enabled ? "var(--brand-primary-subtle)" : "transparent",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: enabled ? "var(--brand-primary)" : "var(--border-subtle)",
          color: enabled ? "white" : "var(--text-3)",
        }}
      >
        <section.icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
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
  const oneYearAgo = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate(),
  );

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const [params, setParams] = useState<ExportParams>({
    fromDate: fmt(oneYearAgo),
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
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Not authenticated");

    // Build query
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

    // Dynamically import jsPDF + html2canvas to avoid SSR
    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.default;
    const { default: html2canvas } = await import("html2canvas");

    const data: any = await resp.json();
    await buildPDFFromData(
      data,
      params,
      jsPDF,
      html2canvas,
      targetName || "Faculty Report",
    );
  }

  async function generateCSV() {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Not authenticated");

    const query = new URLSearchParams({
      fromDate: params.fromDate,
      toDate: params.toDate,
      sections: params.sections.join(","),
      ...(targetUserId ? { userId: targetUserId } : {}),
      ...(params.department ? { department: params.department } : {}),
    });

    const endpoint =
      targetUserId || !department
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
        <>
          {/* Scrim */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: "var(--surface-overlay)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg rounded-3xl overflow-hidden"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-4)",
              maxHeight: "90svh",
              display: "flex",
              flexDirection: "column",
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-9 h-1 rounded-full"
                style={{ background: "var(--border-strong)" }}
              />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 pb-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--brand-primary-subtle)" }}
                >
                  <Download
                    className="w-5 h-5"
                    style={{ color: "var(--brand-primary)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--text-1)" }}
                  >
                    Export Report
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    {targetName
                      ? `for ${targetName}`
                      : "Customise what to include"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[var(--border-subtle)] text-[var(--text-3)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
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
                      className="flex-1 py-2 rounded-xl text-sm font-semibold border transition-all duration-150"
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
                <div className="flex gap-2 mt-2 flex-wrap">
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
                      className="px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
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
        </>
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

async function buildPDFFromData(
  data: any,
  params: ExportParams,
  jsPDF: any,
  html2canvas: any,
  title: string,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const marginX = 20;
  const contentW = pageW - marginX * 2;
  let y = 20;

  const LINE = 6;
  const SECTION_H = 8;

  function checkPage(needed = 20) {
    if (y + needed > 280) {
      doc.addPage();
      y = 20;
    }
  }

  // ── Cover Page ───────────────────────────────────────────────
  // Orange header bar
  doc.setFillColor(255, 92, 53);
  doc.rect(0, 0, pageW, 50, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Shikshak Sarthi", marginX, 22);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Faculty Appraisal System — Performance Report", marginX, 32);
  doc.setFontSize(9);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    marginX,
    42,
  );

  y = 65;

  // Subject line
  doc.setTextColor(17, 17, 17);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(title, marginX, y);
  y += LINE * 2;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(136, 136, 136);
  doc.text(`Period: ${params.fromDate} → ${params.toDate}`, marginX, y);
  y += LINE;
  doc.text(`Sections: ${params.sections.join(", ")}`, marginX, y);
  y += LINE * 2;

  // Horizontal rule
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, pageW - marginX, y);
  y += LINE * 1.5;

  const d = data?.data ?? data;

  // ── Helper to write a titled section ─────────────────────────
  function sectionHeader(label: string) {
    checkPage(18);
    doc.setFillColor(255, 245, 240);
    doc.rect(marginX, y - 4, contentW, 10, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 92, 53);
    doc.text(label, marginX + 3, y + 2);
    y += 10;
    doc.setTextColor(17, 17, 17);
  }

  function labelValue(
    label: string,
    value: string | number | undefined,
    indent = 0,
  ) {
    checkPage(LINE + 2);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(85, 85, 85);
    doc.text(String(label), marginX + indent, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 17, 17);
    const valStr = String(value ?? "—");
    const lines = doc.splitTextToSize(valStr, contentW - 60 - indent);
    doc.text(lines, marginX + 60 + indent, y);
    y += LINE * Math.max(1, lines.length);
  }

  // ── Profile Section ───────────────────────────────────────────
  if (params.sections.includes("profile") && d) {
    sectionHeader("🎓 Faculty Profile");
    const profile = Array.isArray(d) ? d[0] : d;
    labelValue("Name", profile?.name ?? profile?.full_name);
    labelValue("Email", profile?.email);
    labelValue("Department", profile?.department);
    labelValue("Designation", profile?.designation);
    labelValue("Employee ID", profile?.employee_id);
    y += LINE;
  }

  // ── Stats Section ─────────────────────────────────────────────
  if (params.sections.includes("stats") && d) {
    sectionHeader("📊 Performance Statistics");
    const profile = Array.isArray(d) ? d[0] : d;
    const partB = profile?.part_b ?? {};
    const papers = (partB?.table2?.researchPapers ?? []).length;
    const pubs = (partB?.table2?.publications ?? []).length;
    const projects = (partB?.table2?.researchProjects ?? []).length;
    const patents = (partB?.patents_policy_awards ?? []).length;
    const lectures = (partB?.invited_lectures ?? []).length;

    labelValue("Research Papers", papers);
    labelValue("Other Publications", pubs);
    labelValue("Research Projects", projects);
    labelValue("Patents / Awards", patents);
    labelValue("Invited Lectures", lectures);
    y += LINE;
  }

  // ── Publications Section ──────────────────────────────────────
  if (params.sections.includes("publications") && d) {
    sectionHeader("📚 Publications");
    const profile = Array.isArray(d) ? d[0] : d;
    const papers = profile?.part_b?.table2?.researchPapers ?? [];
    if (papers.length === 0) {
      doc.setFontSize(8.5);
      doc.setTextColor(136, 136, 136);
      doc.text("No publications found in the selected period.", marginX, y);
      y += LINE;
    } else {
      papers.slice(0, 20).forEach((p: any, i: number) => {
        checkPage(LINE * 3);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(17, 17, 17);
        const titleLines = doc.splitTextToSize(
          `${i + 1}. ${p.title ?? "Untitled"}`,
          contentW,
        );
        doc.text(titleLines, marginX, y);
        y += LINE * titleLines.length;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(136, 136, 136);
        doc.text(
          `   ${p.journal ?? p.conference ?? ""} • ${p.year ?? ""}`,
          marginX,
          y,
        );
        y += LINE * 0.8;
      });
      if (papers.length > 20) {
        doc.setFontSize(8);
        doc.setTextColor(136, 136, 136);
        doc.text(`… and ${papers.length - 20} more publications`, marginX, y);
        y += LINE;
      }
    }
    y += LINE * 0.5;
  }

  // ── Research Projects ─────────────────────────────────────────
  if (params.sections.includes("research") && d) {
    sectionHeader("🔬 Research Projects");
    const profile = Array.isArray(d) ? d[0] : d;
    const projects = profile?.part_b?.table2?.researchProjects ?? [];
    if (projects.length === 0) {
      doc.setFontSize(8.5);
      doc.setTextColor(136, 136, 136);
      doc.text("No research projects found.", marginX, y);
      y += LINE;
    } else {
      projects.slice(0, 15).forEach((p: any, i: number) => {
        checkPage(LINE * 2);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(17, 17, 17);
        doc.text(`${i + 1}. ${p.title ?? "Untitled"}`, marginX, y, {
          maxWidth: contentW,
        });
        y += LINE;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(136, 136, 136);
        doc.text(
          `   Funding: ${p.fundingAgency ?? "—"} | Amount: ${p.amount ?? "—"} | Status: ${p.status ?? "—"}`,
          marginX,
          y,
          { maxWidth: contentW },
        );
        y += LINE * 0.8;
      });
    }
    y += LINE * 0.5;
  }

  // ── Academic Activities ───────────────────────────────────────
  if (params.sections.includes("activities") && d) {
    sectionHeader("🎤 Academic Activities");
    const profile = Array.isArray(d) ? d[0] : d;
    const lectures = profile?.part_b?.invited_lectures ?? [];
    const courses = profile?.part_a?.courses_fdp ?? [];
    labelValue("FDPs / Courses Attended", courses.length);
    labelValue("Invited Lectures", lectures.length);
    y += LINE;
  }

  // ── Summary Page ──────────────────────────────────────────────
  if (params.includeSummary) {
    doc.addPage();
    y = 20;
    doc.setFillColor(255, 92, 53);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", marginX, 12);
    y = 30;
    doc.setTextColor(17, 17, 17);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `This report was generated by Shikshak Sarthi for the period ${params.fromDate} to ${params.toDate}.\n` +
        `It includes ${params.sections.length} section(s): ${params.sections.join(", ")}.`,
      marginX,
      y,
      { maxWidth: contentW },
    );
  }

  // Footer on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(170, 170, 170);
    doc.text("Shikshak Sarthi © VESIT", marginX, 290);
    doc.text(`Page ${i} of ${totalPages}`, pageW - marginX, 290, {
      align: "right",
    });
  }

  doc.save(`report_${title.replace(/\s+/g, "_")}_${params.fromDate}.pdf`);
}
