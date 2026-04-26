"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import {
  generateAppraisalPDF,
  type AppraisalPDFData,
} from "@/lib/pdf-generator";
import { toast } from "@/hooks/use-toast";

interface PDFExportButtonProps {
  data: AppraisalPDFData;
  filename?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function PDFExportButton({
  data,
  filename = "appraisal-report",
  variant = "default",
  size = "default",
  className,
}: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    try {
      setIsGenerating(true);

      const options = {
        title: `Faculty Appraisal Report - ${data.faculty.name}`,
        author: "Shikshak Sarthi System",
        subject: `Appraisal for Academic Year ${data.appraisal.academicYear}`,
        creator: "Shikshak Sarthi Faculty Appraisal System",
      };

      await generateAppraisalPDF(data, options);

      toast({
        title: "PDF Generated",
        description: "Your appraisal report has been generated successfully.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Export Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}

interface ReportExportButtonProps {
  reportData: any;
  title: string;
  filters?: {
    year?: string;
    department?: string;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ReportExportButton({
  reportData,
  title,
  filters,
  variant = "outline",
  size = "default",
  className,
}: ReportExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const buildReportHTML = (
    data: any,
    reportTitle: string,
    reportFilters?: any,
  ): string => {
    const {
      totalAppraisals,
      submittedAppraisals,
      approvedAppraisals,
      pendingAppraisals,
      averageScore,
      totalFaculty,
      departmentStats,
      yearlyTrends,
    } = data;

    // Build department stats table
    const deptTableRows = (departmentStats || [])
      .map(
        (dept: any) => `
      <tr>
        <td>${dept.department || "Unknown"}</td>
        <td style="text-align: center;">${dept.count || 0}</td>
        <td style="text-align: center;">${dept.averageScore?.toFixed(2) || "N/A"}</td>
      </tr>
    `,
      )
      .join("");

    // Build yearly trends table
    const yearlyTableRows = (yearlyTrends || [])
      .map(
        (year: any) => `
      <tr>
        <td>${year.year || "N/A"}</td>
        <td style="text-align: center;">${year.count || 0}</td>
        <td style="text-align: center;">${year.averageScore?.toFixed(2) || "N/A"}</td>
      </tr>
    `,
      )
      .join("");

    // Build filter section
    const filterSection = reportFilters
      ? `
      <div class="filters-section">
        <h4>Report Filters</h4>
        <ul>
          ${reportFilters.year && reportFilters.year !== "all" ? `<li><strong>Academic Year:</strong> ${reportFilters.year}</li>` : ""}
          ${reportFilters.department && reportFilters.department !== "all" ? `<li><strong>Department:</strong> ${reportFilters.department}</li>` : ""}
        </ul>
      </div>
    `
      : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      padding: 20px;
      background: white;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #ff5c35;
    }
    .logo {
      max-height: 60px;
      max-width: 100px;
    }
    .college-info h1 {
      font-size: 20px;
      color: #1a1a2e;
      margin-bottom: 5px;
    }
    .college-info p {
      font-size: 12px;
      color: #666;
    }
    .report-title {
      text-align: center;
      margin-bottom: 30px;
    }
    .report-title h2 {
      font-size: 24px;
      color: #1a1a2e;
      margin-bottom: 10px;
    }
    .report-title p {
      color: #666;
      font-size: 14px;
    }
    .filters-section {
      background: #f0f8ff;
      border-left: 4px solid #2196F3;
      padding: 12px 16px;
      margin-bottom: 20px;
      border-radius: 4px;
      font-size: 12px;
    }
    .filters-section h4 {
      color: #1a1a2e;
      margin-bottom: 8px;
      font-weight: bold;
    }
    .filters-section ul {
      margin: 0;
      padding-left: 20px;
      list-style: none;
    }
    .filters-section li {
      margin: 4px 0;
      color: #555;
    }
    .filters-section strong {
      color: #1a1a2e;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #ff5c35;
    }
    .stat-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #1a1a2e;
    }
    .stat-subtext {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section h3 {
      background: #1a1a2e;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    th {
      background: #f0f0f0;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      border-bottom: 2px solid #ddd;
      font-size: 12px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #eee;
      font-size: 12px;
    }
    tr:last-child td {
      border-bottom: 2px solid #ddd;
    }
    tr:nth-child(even) {
      background: #fafafa;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      text-align: center;
      font-size: 10px;
      color: #999;
    }
    @media print {
      body { padding: 0; }
      .section { page-break-inside: avoid; }
      .header { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://vesit.ves.ac.in/navbar2024nobackground.png" alt="VESIT" class="logo" />
    <div class="college-info">
      <h1>Vivekanand Education Society's Institute of Technology</h1>
      <p>Chembur, Mumbai – 400 074 | Autonomous Institution</p>
    </div>
  </div>

  <div class="report-title">
    <h2>${reportTitle}</h2>
    <p>Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>

  ${filterSection}

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Total Appraisals</div>
      <div class="stat-value">${totalAppraisals || 0}</div>
      <div class="stat-subtext">Faculty appraisals in database</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Submitted</div>
      <div class="stat-value">${submittedAppraisals || 0}</div>
      <div class="stat-subtext">${totalAppraisals > 0 ? ((submittedAppraisals / totalAppraisals) * 100).toFixed(1) : 0}% completion</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Approved</div>
      <div class="stat-value">${approvedAppraisals || 0}</div>
      <div class="stat-subtext">Ready for review</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Pending</div>
      <div class="stat-value">${pendingAppraisals || 0}</div>
      <div class="stat-subtext">Awaiting submission</div>
    </div>
  </div>

  ${
    averageScore
      ? `
  <div class="stat-card" style="margin-bottom: 30px; border-left-color: #ffa500;">
    <div class="stat-label">Average Score</div>
    <div class="stat-value">${averageScore.toFixed(1)}/100</div>
    <div class="stat-subtext">Overall appraisal performance</div>
  </div>
  `
      : ""
  }

  ${
    departmentStats && departmentStats.length > 0
      ? `
  <div class="section">
    <h3>Department-wise Statistics</h3>
    <table>
      <thead>
        <tr>
          <th>Department</th>
          <th style="text-align: center;">Count</th>
          <th style="text-align: center;">Average Score</th>
        </tr>
      </thead>
      <tbody>
        ${deptTableRows}
      </tbody>
    </table>
  </div>
  `
      : ""
  }

  ${
    yearlyTrends && yearlyTrends.length > 0
      ? `
  <div class="section">
    <h3>Yearly Trends</h3>
    <table>
      <thead>
        <tr>
          <th>Academic Year</th>
          <th style="text-align: center;">Count</th>
          <th style="text-align: center;">Average Score</th>
        </tr>
      </thead>
      <tbody>
        ${yearlyTableRows}
      </tbody>
    </table>
  </div>
  `
      : ""
  }

  <div class="footer">
    <p>This is a system-generated report from Shikshak Sarthi PBAS Management Platform.</p>
    <p>For questions or clarifications, please contact the Administration.</p>
  </div>
</body>
</html>`;
  };

  const handleExport = async () => {
    try {
      setIsGenerating(true);

      const htmlContent = buildReportHTML(reportData, title, filters);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(htmlContent);
        win.document.close();
        setTimeout(() => {
          win.print();
          setTimeout(() => win.close(), 1000);
        }, 500);
      }

      toast({
        title: "Report Generated",
        description: "Your analytics report has been generated successfully.",
      });
    } catch (error) {
      console.error("Report generation error:", error);
      toast({
        title: "Export Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Export Report
        </>
      )}
    </Button>
  );
}
