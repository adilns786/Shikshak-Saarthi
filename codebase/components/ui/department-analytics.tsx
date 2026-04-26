"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import {
  Download,
  Loader2,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Briefcase,
  Lightbulb,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

interface DepartmentAnalytics {
  department: string;
  periodFrom: number;
  periodTo: number;
  generatedAt: string;
  facultyCount: number;
  summary: {
    totalPublications: number;
    totalResearchPapers: number;
    totalPatents: number;
    totalProjects: number;
    totalGuidance: number;
    totalConsultancy: number;
    avgPublicationsPerFaculty: string;
    avgResearchPapersPerFaculty: string;
    avgPapersPerYear: string;
  };
  yearlyTrend: Array<{
    year: number;
    publications: number;
    researchPapers: number;
    patents: number;
    projects: number;
    consultancy: number;
    guidance: number;
    total: number;
  }>;
  facultyDetails: Array<{
    id: string;
    name: string;
    email: string;
    designation: string;
    publications: number;
    researchPapers: number;
    patents: number;
    projects: number;
    consultancy: number;
    guidance: number;
    total: number;
  }>;
}

interface Filters {
  yearFrom: number;
  yearTo: number;
  categories: string[];
}

interface DepartmentAnalyticsComponentProps {
  department: string;
}

const DEFAULT_CATEGORIES = ["publications", "research", "patents", "guidance", "consultancy"];

export const DepartmentAnalyticsComponent: React.FC<DepartmentAnalyticsComponentProps> = ({
  department,
}) => {
  const [analytics, setAnalytics] = useState<DepartmentAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    yearFrom: 2020,
    yearTo: new Date().getFullYear(),
    categories: DEFAULT_CATEGORIES,
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();
      const query = new URLSearchParams({
        department,
        yearFrom: String(filters.yearFrom),
        yearTo: String(filters.yearTo),
        categories: filters.categories.join(","),
        format: "json",
      });

      const response = await fetch(`/api/export/department-analytics?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      alert("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();
      const query = new URLSearchParams({
        department,
        yearFrom: String(filters.yearFrom),
        yearTo: String(filters.yearTo),
        categories: filters.categories.join(","),
        format: "csv",
      });

      const response = await fetch(`/api/export/department-analytics?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to export");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Department_Analytics_${department}_${filters.yearFrom}-${filters.yearTo}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const yearOptions = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => 2020 + i
  );

  if (!analytics && loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <Loader2 className="h-8 w-8 text-indigo-600" />
        </motion.div>
        <span className="ml-3 text-slate-600">Loading department analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card style={{ border: "1px solid var(--border-subtle)" }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" style={{ color: "var(--brand-primary)" }} />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Year Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-1)" }}>
                From Year
              </label>
              <select
                value={filters.yearFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, yearFrom: parseInt(e.target.value) }))
                }
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  background: "var(--surface-base)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-1)",
                }}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-1)" }}>
                To Year
              </label>
              <select
                value={filters.yearTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, yearTo: parseInt(e.target.value) }))
                }
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  background: "var(--surface-base)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-1)",
                }}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm font-medium mb-3 block" style={{ color: "var(--text-1)" }}>
              Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { id: "publications", label: "Publications", icon: BookOpen },
                { id: "research", label: "Research", icon: Lightbulb },
                { id: "patents", label: "Patents", icon: Award },
                { id: "projects", label: "Projects", icon: Briefcase },
                { id: "guidance", label: "Guidance", icon: Users },
                { id: "consultancy", label: "Consultancy", icon: FileText },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleCategory(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    filters.categories.includes(id)
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={fetchAnalytics}
              disabled={loading}
              className="gap-2"
              style={{ background: "var(--brand-primary)", color: "white" }}
            >
              <RefreshCw className="h-4 w-4" />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={exporting || !analytics}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {analytics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Faculty", value: analytics.facultyCount, color: "var(--brand-primary)" },
              {
                label: "Publications",
                value: analytics.summary.totalPublications,
                color: "var(--brand-purple)",
              },
              {
                label: "Research Papers",
                value: analytics.summary.totalResearchPapers,
                color: "var(--brand-accent)",
              },
              { label: "Patents", value: analytics.summary.totalPatents, color: "#f59e0b" },
              { label: "Projects", value: analytics.summary.totalProjects, color: "#10b981" },
              {
                label: "Guidance",
                value: analytics.summary.totalGuidance,
                color: "#06b6d4",
              },
            ].map(({ label, value, color }) => (
              <Card key={label} style={{ border: "1px solid var(--border-subtle)" }}>
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold" style={{ color }}>
                    {value}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                    {label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Yearly Trend */}
            <Card style={{ border: "1px solid var(--border-subtle)" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" style={{ color: "var(--brand-primary)" }} />
                  Yearly Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.yearlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="publications" stroke={COLORS[0]} />
                    <Line type="monotone" dataKey="researchPapers" stroke={COLORS[1]} />
                    <Line type="monotone" dataKey="patents" stroke={COLORS[2]} />
                    <Line type="monotone" dataKey="projects" stroke={COLORS[3]} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card style={{ border: "1px solid var(--border-subtle)" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" style={{ color: "var(--brand-primary)" }} />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Publications",
                          value: analytics.summary.totalPublications,
                        },
                        {
                          name: "Research Papers",
                          value: analytics.summary.totalResearchPapers,
                        },
                        { name: "Patents", value: analytics.summary.totalPatents },
                        { name: "Projects", value: analytics.summary.totalProjects },
                        { name: "Guidance", value: analytics.summary.totalGuidance },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Faculty Breakdown Table */}
          <Card style={{ border: "1px solid var(--border-subtle)" }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" style={{ color: "var(--brand-primary)" }} />
                Faculty-wise Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border-default)" }}>
                      <th className="text-left p-2" style={{ color: "var(--text-1)" }}>
                        Faculty Name
                      </th>
                      <th className="text-right p-2" style={{ color: "var(--text-1)" }}>
                        Pubs
                      </th>
                      <th className="text-right p-2" style={{ color: "var(--text-1)" }}>
                        Papers
                      </th>
                      <th className="text-right p-2" style={{ color: "var(--text-1)" }}>
                        Patents
                      </th>
                      <th className="text-right p-2" style={{ color: "var(--text-1)" }}>
                        Projects
                      </th>
                      <th className="text-right p-2" style={{ color: "var(--text-1)" }}>
                        Guidance
                      </th>
                      <th className="text-right p-2" style={{ color: "var(--text-1)" }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.facultyDetails.map((faculty) => (
                      <tr key={faculty.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td className="p-2" style={{ color: "var(--text-1)" }}>
                          <div className="font-medium">{faculty.name}</div>
                          <div className="text-xs" style={{ color: "var(--text-3)" }}>
                            {faculty.email}
                          </div>
                        </td>
                        <td className="text-right p-2" style={{ color: "var(--text-2)" }}>
                          {faculty.publications}
                        </td>
                        <td className="text-right p-2" style={{ color: "var(--text-2)" }}>
                          {faculty.researchPapers}
                        </td>
                        <td className="text-right p-2" style={{ color: "var(--text-2)" }}>
                          {faculty.patents}
                        </td>
                        <td className="text-right p-2" style={{ color: "var(--text-2)" }}>
                          {faculty.projects}
                        </td>
                        <td className="text-right p-2" style={{ color: "var(--text-2)" }}>
                          {faculty.guidance}
                        </td>
                        <td
                          className="text-right p-2 font-semibold"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          {faculty.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
