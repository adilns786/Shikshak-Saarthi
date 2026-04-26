/**
 * PDF Generation Utilities
 * Primary:  Python/ReportLab backend (VESIT branded, server-side)
 * Fallback: Browser print API
 */

const SERVER_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000"
    : "http://localhost:5000";

export interface PDFOptions {
  title: string;
  author: string;
  subject: string;
  creator: string;
}

export interface AppraisalPDFData {
  faculty: {
    name: string;
    department: string;
    designation: string;
    employeeId: string;
  };
  appraisal: {
    academicYear: string;
    status: string;
    createdAt: string;
    submittedAt?: string;
    teachingData: any;
    researchData: any;
    serviceData: any;
    llmAnalysis?: any;
  };
  publications: any[];
}

async function isServerAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${SERVER_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadFacultyPDFFromServer(
  uid: string,
  filters?: { year_from?: string; year_to?: string },
): Promise<void> {
  const params = new URLSearchParams();
  if (filters?.year_from) params.append("year_from", filters.year_from);
  if (filters?.year_to) params.append("year_to", filters.year_to);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${SERVER_URL}/api/generate/pdf/${uid}${qs}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "PDF generation failed on server");
  }
  triggerDownload(await res.blob(), `PBAS_Report_${uid}.pdf`);
}

export async function downloadDepartmentReportFromServer(payload: {
  department?: string;
  year_from?: string;
  year_to?: string;
  role?: string;
  uids?: string[];
}): Promise<void> {
  const res = await fetch(`${SERVER_URL}/api/generate/report/department`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(
      err.error || "Department report generation failed on server",
    );
  }
  const dept = payload.department?.replace(/\s+/g, "_") ?? "All";
  triggerDownload(await res.blob(), `Department_Report_${dept}.pdf`);
}

function buildHTMLReport(data: AppraisalPDFData, options: PDFOptions): string {
  const pubRows = data.publications
    .map(
      (p) =>
        `<tr><td>${p.title}</td><td>${p.venue}</td><td>${p.year}</td><td>${p.citations || 0}</td></tr>`,
    )
    .join("");
  const pubTable =
    data.publications.length > 0
      ? `<table><thead><tr><th>Title</th><th>Venue</th><th>Year</th><th>Citations</th></tr></thead><tbody>${pubRows}</tbody></table>`
      : "";
  const ai = data.appraisal.llmAnalysis;
  const aiSection = ai
    ? `<div class="section"><h3>AI Analysis</h3><div class="analysis-section"><p><strong>Score:</strong> <span class="score-badge">${ai.overall_score}/100</span></p><p style="margin-top:8px">${ai.summary || ""}</p></div></div>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${options.title}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Times New Roman',serif; line-height:1.6; color:#333; max-width:210mm; margin:0 auto; padding:20mm; background:white; }
.page-header { display:flex; align-items:center; gap:16px; padding-bottom:16px; margin-bottom:24px; border-bottom:3px solid #ff5c35; }
.college-info h2 { font-size:15px; color:#1a1a2e; font-weight:700; }
.college-info p { font-size:11px; color:#555; }
.report-title { text-align:center; margin-bottom:24px; }
.report-title h1 { color:#1a1a2e; font-size:22px; margin-bottom:6px; }
.report-title h2 { color:#555; font-size:16px; font-weight:normal; }
.faculty-info { background:#f4f4f6; padding:16px; border-radius:8px; margin-bottom:24px; }
.faculty-info h3 { color:#1a1a2e; font-size:15px; margin-bottom:12px; }
.info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.info-label { font-weight:bold; color:#1a1a2e; font-size:11px; }
.info-value { color:#555; font-size:11px; }
.section { margin-bottom:22px; page-break-inside:avoid; }
.section h3 { background:#1a1a2e; color:white; font-size:13px; padding:7px 12px; border-radius:4px; margin-bottom:12px; }
.section h4 { color:#555; font-size:11px; margin-bottom:6px; text-transform:uppercase; letter-spacing:1px; }
table { width:100%; border-collapse:collapse; margin-top:8px; font-size:10px; }
th { background:#1a1a2e; color:white; padding:6px 8px; text-align:left; }
td { padding:5px 8px; border-bottom:1px solid #eee; }
tr:nth-child(even) td { background:#fafafa; }
.score-badge { display:inline-block; background:#ff5c35; color:white; padding:3px 10px; border-radius:12px; font-weight:bold; font-size:11px; margin-left:6px; }
.analysis-section { background:#fff5f2; padding:16px; border-radius:6px; border-left:4px solid #ff5c35; }
.page-footer { margin-top:40px; padding-top:16px; border-top:2px solid #eee; text-align:center; color:#888; font-size:10px; }
@media print { body { padding:12mm; } .section { page-break-inside:avoid; } }
</style></head><body>
<div class="page-header">
  <img src="https://vesit.ves.ac.in/navbar2024nobackground.png" alt="VESIT" style="height:48px;object-fit:contain;" />
  <div class="college-info">
    <h2>Vivekanand Education Society's Institute of Technology</h2>
    <p>Chembur, Mumbai &ndash; 400 074 | Autonomous Institution</p>
  </div>
</div>
<div class="report-title"><h1>Faculty Appraisal Report</h1><h2>Academic Year ${data.appraisal.academicYear}</h2></div>
<div class="faculty-info"><h3>Faculty Information</h3><div class="info-grid">
  <div><span class="info-label">Name:</span><br><span class="info-value">${data.faculty.name}</span></div>
  <div><span class="info-label">Employee ID:</span><br><span class="info-value">${data.faculty.employeeId}</span></div>
  <div><span class="info-label">Department:</span><br><span class="info-value">${data.faculty.department}</span></div>
  <div><span class="info-label">Designation:</span><br><span class="info-value">${data.faculty.designation}</span></div>
</div></div>
<div class="section"><h3>Teaching Performance</h3>
  <h4>Courses Taught</h4>
  <ul style="padding-left:18px;font-size:11px;margin-bottom:10px;">${data.appraisal.teachingData?.courses_taught?.map((c: string) => `<li>${c}</li>`).join("") || "<li>No data</li>"}</ul>
  <h4>Student Feedback</h4>
  <p style="font-size:11px;">Avg Rating: <span class="score-badge">${data.appraisal.teachingData?.student_feedback || "N/A"}/5.0</span></p>
</div>
<div class="section"><h3>Research Performance</h3>
  <ul style="padding-left:18px;font-size:11px;margin-bottom:10px;">
    <li>Publications: ${data.appraisal.researchData?.publications_count || 0}</li>
    <li>Grants: ${data.appraisal.researchData?.grants_received || 0}</li>
    <li>Conferences: ${data.appraisal.researchData?.conferences_attended || 0}</li>
  </ul>
  ${pubTable}
</div>
${aiSection}
<div class="page-footer">
  <p>Generated on ${new Date().toLocaleDateString()} &mdash; Shikshak Sarthi &middot; VESIT PBAS Management Platform</p>
  <p>This is a computer-generated document.</p>
</div>
</body></html>`;
}

export const generateAppraisalPDF = async (
  data: AppraisalPDFData,
  options: PDFOptions,
  uid?: string,
): Promise<void> => {
  if (uid) {
    const serverOk = await isServerAvailable();
    if (serverOk) {
      await downloadFacultyPDFFromServer(uid);
      return;
    }
  }
  const printWindow = window.open("", "_blank");
  if (!printWindow)
    throw new Error("Unable to open print window. Please allow popups.");
  printWindow.document.write(buildHTMLReport(data, options));
  printWindow.document.close();
  await new Promise<void>((resolve) => {
    printWindow.onload = () => resolve();
    setTimeout(resolve, 1000);
  });
  printWindow.print();
  setTimeout(() => printWindow.close(), 1500);
};
