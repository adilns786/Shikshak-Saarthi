/**
 * Department Analytics Export Utilities
 * Handles PDF and CSV generation for department reports
 */

export interface DepartmentExportOptions {
  department: string;
  yearFrom: number;
  yearTo: number;
  categories: string[];
  format: "pdf" | "csv";
}

/**
 * Download CSV file for department analytics
 */
export async function downloadDepartmentAnalyticsCSV(
  options: DepartmentExportOptions,
  token: string
): Promise<void> {
  const query = new URLSearchParams({
    department: options.department,
    yearFrom: String(options.yearFrom),
    yearTo: String(options.yearTo),
    categories: options.categories.join(","),
    format: "csv",
  });

  const response = await fetch(`/api/export/department-analytics?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to export CSV");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Department_Analytics_${options.department}_${options.yearFrom}-${options.yearTo}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Download PDF report for department analytics
 */
export async function downloadDepartmentAnalyticsPDF(
  options: DepartmentExportOptions,
  token: string,
  serverUrl: string = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000"
): Promise<void> {
  try {
    // Try Python backend first
    const healthResp = await fetch(`${serverUrl}/health`, {
      signal: AbortSignal.timeout(2500),
    });

    if (healthResp.ok) {
      const resp = await fetch(`${serverUrl}/api/generate/report/department`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: options.department,
          year_from: options.yearFrom,
          year_to: options.yearTo,
          categories: options.categories,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (resp.ok) {
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Department_Report_${options.department.replace(/ /g, "_")}_${options.yearFrom}-${options.yearTo}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
    }
  } catch (e) {
    console.warn("Python backend unavailable, falling back to data export");
  }

  // Fallback: Fetch analytics and generate client-side report
  const analyticsQuery = new URLSearchParams({
    department: options.department,
    yearFrom: String(options.yearFrom),
    yearTo: String(options.yearTo),
    categories: options.categories.join(","),
    format: "json",
  });

  const analyticsResp = await fetch(
    `/api/export/department-analytics?${analyticsQuery}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!analyticsResp.ok) {
    throw new Error("Failed to fetch analytics for PDF generation");
  }

  const analytics = await analyticsResp.json();
  generateClientSidePDF(analytics);
}

/**
 * Generate PDF client-side using browser print
 */
function generateClientSidePDF(analytics: any): void {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Department Analytics Report - ${analytics.department}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; color: #333; }
        .container { max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; }
        header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; }
        h1 { font-size: 28px; color: #1f2937; margin-bottom: 5px; }
        .subtitle { color: #6b7280; font-size: 14px; }
        .metadata { display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; margin-top: 10px; }
        section { margin: 30px 0; }
        h2 { font-size: 18px; color: #1f2937; margin-bottom: 15px; border-left: 4px solid #4f46e5; padding-left: 10px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
        .summary-card { background: #f3f4f6; padding: 15px; border-radius: 8px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #4f46e5; }
        .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f3f4f6; padding: 10px; text-align: left; font-weight: 600; font-size: 12px; border-bottom: 2px solid #d1d5db; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        tr:nth-child(even) { background: #f9fafb; }
        .text-right { text-align: right; }
        .text-bold { font-weight: 600; }
        .page-break { page-break-after: always; }
        @media print {
          body { margin: 0; padding: 0; }
          .container { max-width: 100%; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Department Analytics Report</h1>
          <p class="subtitle">${analytics.department} Department</p>
          <div class="metadata">
            <span>Period: ${analytics.periodFrom} - ${analytics.periodTo}</span>
            <span>Generated: ${new Date(analytics.generatedAt).toLocaleDateString()}</span>
          </div>
        </header>

        <section>
          <h2>Summary Statistics</h2>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="stat-value">${analytics.facultyCount}</div>
              <div class="stat-label">Total Faculty</div>
            </div>
            <div class="summary-card">
              <div class="stat-value">${analytics.summary.totalPublications}</div>
              <div class="stat-label">Publications</div>
            </div>
            <div class="summary-card">
              <div class="stat-value">${analytics.summary.totalResearchPapers}</div>
              <div class="stat-label">Research Papers</div>
            </div>
            <div class="summary-card">
              <div class="stat-value">${analytics.summary.totalPatents}</div>
              <div class="stat-label">Patents</div>
            </div>
            <div class="summary-card">
              <div class="stat-value">${analytics.summary.totalProjects}</div>
              <div class="stat-label">Projects</div>
            </div>
            <div class="summary-card">
              <div class="stat-value">${analytics.summary.totalGuidance}</div>
              <div class="stat-label">Research Guidance</div>
            </div>
          </div>
        </section>

        <section>
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
              ${analytics.yearlyTrend
                .map(
                  (year: any) => `
                <tr>
                  <td>${year.year}</td>
                  <td class="text-right">${year.publications}</td>
                  <td class="text-right">${year.researchPapers}</td>
                  <td class="text-right">${year.patents}</td>
                  <td class="text-right">${year.projects}</td>
                  <td class="text-right">${year.consultancy}</td>
                  <td class="text-right">${year.guidance}</td>
                  <td class="text-right text-bold">${year.total}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </section>

        <section class="page-break">
          <h2>Faculty-wise Breakdown</h2>
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
              ${analytics.facultyDetails
                .map(
                  (faculty: any) => `
                <tr>
                  <td>
                    <strong>${faculty.name}</strong><br>
                    <small>${faculty.email}</small>
                  </td>
                  <td class="text-right">${faculty.publications}</td>
                  <td class="text-right">${faculty.researchPapers}</td>
                  <td class="text-right">${faculty.patents}</td>
                  <td class="text-right">${faculty.projects}</td>
                  <td class="text-right">${faculty.consultancy}</td>
                  <td class="text-right">${faculty.guidance}</td>
                  <td class="text-right text-bold">${faculty.total}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Performance Averages</h2>
          <table>
            <tbody>
              <tr>
                <td><strong>Average Publications per Faculty</strong></td>
                <td class="text-right">${analytics.summary.avgPublicationsPerFaculty}</td>
              </tr>
              <tr>
                <td><strong>Average Research Papers per Faculty</strong></td>
                <td class="text-right">${analytics.summary.avgResearchPapersPerFaculty}</td>
              </tr>
              <tr>
                <td><strong>Average Publications per Year</strong></td>
                <td class="text-right">${analytics.summary.avgPapersPerYear}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <script>
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
            setTimeout(() => window.close(), 500);
          }, 500);
        });
      </script>
    </body>
    </html>
  `;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
