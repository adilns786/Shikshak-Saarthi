/**
 * CSV Export Utilities
 * Provides functions to export various data types to CSV format
 */

export interface CSVExportOptions {
  filename: string;
  includeTimestamp?: boolean;
}

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return "";
  }

  // Get all unique keys from all objects
  const keys = Array.from(
    new Set(data.flatMap((obj) => Object.keys(flattenObject(obj)))),
  );

  // Create header row
  const header = keys.join(",");

  // Create data rows
  const rows = data.map((obj) => {
    const flatObj = flattenObject(obj);
    return keys
      .map((key) => {
        const value = flatObj[key];
        return formatCSVValue(value);
      })
      .join(",");
  });

  return [header, ...rows].join("\n");
}

/**
 * Flatten nested objects for CSV export
 */
function flattenObject(obj: any, prefix = ""): Record<string, any> {
  return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (obj[key] === null || obj[key] === undefined) {
      acc[prefixedKey] = "";
    } else if (
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key]) &&
      !(obj[key] instanceof Date)
    ) {
      Object.assign(acc, flattenObject(obj[key], prefixedKey));
    } else if (Array.isArray(obj[key])) {
      acc[prefixedKey] = obj[key].join("; ");
    } else {
      acc[prefixedKey] = obj[key];
    }

    return acc;
  }, {});
}

/**
 * Format value for CSV (escape commas, quotes, newlines)
 */
function formatCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Check if value needs to be quoted
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Download CSV file in the browser
 */
export function downloadCSV(
  csvContent: string,
  options: CSVExportOptions,
): void {
  const { filename, includeTimestamp = true } = options;

  const timestamp = includeTimestamp
    ? `_${new Date().toISOString().split("T")[0]}`
    : "";

  const finalFilename = `${filename}${timestamp}.csv`;

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", finalFilename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export faculty data to CSV
 */
export function exportFacultyData(facultyData: any): void {
  const exportData = prepareFacultyDataForExport(facultyData);
  const csvContent = convertToCSV([exportData]);
  downloadCSV(csvContent, { filename: "my_faculty_data" });
}

/**
 * Export department data to CSV
 */
export function exportDepartmentData(departmentData: any[]): void {
  const exportData = departmentData.map(prepareFacultyDataForExport);
  const csvContent = convertToCSV(exportData);
  downloadCSV(csvContent, { filename: "department_data" });
}

/**
 * Export activity logs to CSV
 */
export function exportActivityLogs(logs: any[]): void {
  const csvContent = convertToCSV(logs);
  downloadCSV(csvContent, { filename: "activity_logs" });
}

/**
 * Prepare faculty data for export
 */
function prepareFacultyDataForExport(data: any): any {
  return {
    // Basic Info
    name: data.name || data.full_name || "",
    email: data.email || "",
    employee_id: data.employee_id || "",
    department: data.department || "",
    designation: data.designation || "",
    phone: data.phone || "",

    // Part A - Personal Details
    date_of_birth: data.part_a?.date_of_birth || "",
    gender: data.part_a?.gender || "",
    address: data.part_a?.address || "",

    // Part B - Academic Activities
    teaching_hours: data.part_b?.teaching_hours || 0,
    courses_taught: data.part_b?.courses_taught || "",

    // Research Papers
    total_research_papers: data.part_b?.table2?.researchPapers?.length || 0,
    research_paper_titles:
      data.part_b?.table2?.researchPapers
        ?.map((p: any) => p.title)
        .join("; ") || "",

    // Publications
    total_publications: data.part_b?.table2?.publications?.length || 0,
    publication_titles:
      data.part_b?.table2?.publications?.map((p: any) => p.title).join("; ") ||
      "",

    // Patents
    total_patents: data.part_b?.patents_policy_awards?.length || 0,
    patent_titles:
      data.part_b?.patents_policy_awards?.map((p: any) => p.title).join("; ") ||
      "",

    // Books
    total_books: data.part_b?.books?.length || 0,
    book_titles: data.part_b?.books?.map((b: any) => b.title).join("; ") || "",

    // Professional Development
    conferences_attended:
      data.part_b?.fdp_training_conferences?.filter(
        (e: any) => e.type === "conference",
      )?.length || 0,
    workshops_attended:
      data.part_b?.fdp_training_conferences?.filter(
        (e: any) => e.type === "workshop",
      )?.length || 0,

    // Timestamps
    created_at: data.created_at || "",
    updated_at: data.updated_at || "",
  };
}
