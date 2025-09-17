// PDF generation utilities using browser APIs
export interface PDFOptions {
  title: string
  author: string
  subject: string
  creator: string
}

export interface AppraisalPDFData {
  faculty: {
    name: string
    department: string
    designation: string
    employeeId: string
  }
  appraisal: {
    academicYear: string
    status: string
    createdAt: string
    submittedAt?: string
    teachingData: any
    researchData: any
    serviceData: any
    llmAnalysis?: any
  }
  publications: any[]
}

export const generateAppraisalPDF = async (data: AppraisalPDFData, options: PDFOptions) => {
  // Create a new window for PDF generation
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Unable to open print window. Please allow popups.")
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${options.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
          background: white;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #2B2D42;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #2B2D42;
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .header h2 {
          color: #8D99AE;
          font-size: 18px;
          font-weight: normal;
        }
        
        .faculty-info {
          background: #EDF2F4;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .faculty-info h3 {
          color: #2B2D42;
          margin-bottom: 15px;
          font-size: 18px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-weight: bold;
          color: #2B2D42;
          margin-bottom: 5px;
        }
        
        .info-value {
          color: #666;
        }
        
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section h3 {
          color: #2B2D42;
          font-size: 18px;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #EDF2F4;
        }
        
        .subsection {
          margin-bottom: 20px;
        }
        
        .subsection h4 {
          color: #8D99AE;
          font-size: 14px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .data-list {
          list-style: none;
          padding-left: 0;
        }
        
        .data-list li {
          padding: 8px 0;
          border-bottom: 1px solid #EDF2F4;
        }
        
        .data-list li:last-child {
          border-bottom: none;
        }
        
        .score-badge {
          display: inline-block;
          background: #2B2D42;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          margin-left: 10px;
        }
        
        .publications-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        
        .publications-table th,
        .publications-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #EDF2F4;
        }
        
        .publications-table th {
          background: #2B2D42;
          color: white;
          font-weight: bold;
        }
        
        .publications-table tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .analysis-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #EF233C;
        }
        
        .recommendations {
          margin-top: 15px;
        }
        
        .recommendations ul {
          padding-left: 20px;
        }
        
        .recommendations li {
          margin-bottom: 8px;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #EDF2F4;
          text-align: center;
          color: #8D99AE;
          font-size: 12px;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 15mm;
          }
          
          .header {
            page-break-after: avoid;
          }
          
          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Faculty Appraisal Report</h1>
        <h2>Academic Year ${data.appraisal.academicYear}</h2>
      </div>
      
      <div class="faculty-info">
        <h3>Faculty Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">${data.faculty.name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Employee ID:</span>
            <span class="info-value">${data.faculty.employeeId}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Department:</span>
            <span class="info-value">${data.faculty.department}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Designation:</span>
            <span class="info-value">${data.faculty.designation}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h3>Teaching Performance</h3>
        <div class="subsection">
          <h4>Courses Taught</h4>
          <ul class="data-list">
            ${data.appraisal.teachingData?.courses_taught?.map((course: string) => `<li>${course}</li>`).join("") || "<li>No data available</li>"}
          </ul>
        </div>
        <div class="subsection">
          <h4>Student Feedback</h4>
          <p>Average Rating: <span class="score-badge">${data.appraisal.teachingData?.student_feedback || "N/A"}/5.0</span></p>
        </div>
        <div class="subsection">
          <h4>Teaching Innovations</h4>
          <p>${data.appraisal.teachingData?.innovations || "No innovations reported"}</p>
        </div>
      </div>
      
      <div class="section">
        <h3>Research Performance</h3>
        <div class="subsection">
          <h4>Research Metrics</h4>
          <ul class="data-list">
            <li>Publications: ${data.appraisal.researchData?.publications_count || 0}</li>
            <li>Grants Received: ${data.appraisal.researchData?.grants_received || 0}</li>
            <li>Conferences Attended: ${data.appraisal.researchData?.conferences_attended || 0}</li>
          </ul>
        </div>
        
        ${
          data.publications.length > 0
            ? `
        <div class="subsection">
          <h4>Publications</h4>
          <table class="publications-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Venue</th>
                <th>Year</th>
                <th>Citations</th>
              </tr>
            </thead>
            <tbody>
              ${data.publications
                .map(
                  (pub) => `
                <tr>
                  <td>${pub.title}</td>
                  <td>${pub.venue}</td>
                  <td>${pub.year}</td>
                  <td>${pub.citations || 0}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }
      </div>
      
      <div class="section">
        <h3>Service Performance</h3>
        <div class="subsection">
          <h4>Committee Memberships</h4>
          <ul class="data-list">
            ${data.appraisal.serviceData?.committees?.map((committee: string) => `<li>${committee}</li>`).join("") || "<li>No committee memberships reported</li>"}
          </ul>
        </div>
        <div class="subsection">
          <h4>Administrative Roles</h4>
          <ul class="data-list">
            ${data.appraisal.serviceData?.administrative_roles?.map((role: string) => `<li>${role}</li>`).join("") || "<li>No administrative roles reported</li>"}
          </ul>
        </div>
        <div class="subsection">
          <h4>Outreach Activities</h4>
          <p>Number of activities: ${data.appraisal.serviceData?.outreach_activities || 0}</p>
        </div>
      </div>
      
      ${
        data.appraisal.llmAnalysis
          ? `
      <div class="section">
        <h3>AI Analysis & Recommendations</h3>
        <div class="analysis-section">
          <p><strong>Overall Score:</strong> <span class="score-badge">${data.appraisal.llmAnalysis.overall_score}/100</span></p>
          
          <div class="subsection">
            <h4>Key Insights</h4>
            <ul>
              ${data.appraisal.llmAnalysis.insights?.map((insight: string) => `<li>${insight}</li>`).join("") || "<li>No insights available</li>"}
            </ul>
          </div>
          
          <div class="subsection">
            <h4>Strengths</h4>
            <ul>
              ${data.appraisal.llmAnalysis.strengths?.map((strength: string) => `<li>${strength}</li>`).join("") || "<li>No strengths identified</li>"}
            </ul>
          </div>
          
          <div class="recommendations">
            <h4>Recommendations for Improvement</h4>
            <ul>
              ${data.appraisal.llmAnalysis.recommendations?.map((rec: string) => `<li>${rec}</li>`).join("") || "<li>No recommendations available</li>"}
            </ul>
          </div>
          
          <div class="subsection">
            <h4>Summary</h4>
            <p>${data.appraisal.llmAnalysis.summary || "No summary available"}</p>
          </div>
        </div>
      </div>
      `
          : ""
      }
      
      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} by Shikshak Sarthi Faculty Appraisal System</p>
        <p>This is a computer-generated document and does not require a signature.</p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load
  await new Promise((resolve) => {
    printWindow.onload = resolve
    setTimeout(resolve, 1000) // Fallback timeout
  })

  // Trigger print dialog
  printWindow.print()

  // Close the window after printing
  setTimeout(() => {
    printWindow.close()
  }, 1000)
}

export const generateReportsPDF = async (reportData: any, options: PDFOptions) => {
  // Similar implementation for reports PDF generation
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Unable to open print window. Please allow popups.")
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${options.title}</title>
      <style>
        /* Similar styles as above but optimized for reports */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
          background: white;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #2B2D42;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #2B2D42;
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: #EDF2F4;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #2B2D42;
          margin-bottom: 5px;
        }
        
        .stat-label {
          color: #8D99AE;
          font-size: 14px;
        }
        
        .chart-placeholder {
          background: #f8f9fa;
          border: 2px dashed #8D99AE;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8D99AE;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Faculty Appraisal Analytics Report</h1>
        <h2>Generated on ${new Date().toLocaleDateString()}</h2>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${reportData.totalAppraisals || 0}</div>
          <div class="stat-label">Total Appraisals</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${reportData.submittedAppraisals || 0}</div>
          <div class="stat-label">Submitted</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${reportData.approvedAppraisals || 0}</div>
          <div class="stat-label">Approved</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${reportData.averageScore || 0}</div>
          <div class="stat-label">Average Score</div>
        </div>
      </div>
      
      <div class="chart-placeholder">
        Chart visualization would appear here in a full implementation
      </div>
      
      <div class="footer">
        <p>Generated by Shikshak Sarthi Faculty Appraisal System</p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()

  await new Promise((resolve) => {
    printWindow.onload = resolve
    setTimeout(resolve, 1000)
  })

  printWindow.print()

  setTimeout(() => {
    printWindow.close()
  }, 1000)
}
