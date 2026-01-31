"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  FileText,
  BookOpen,
  Briefcase,
  Award,
  Users,
  Lightbulb,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Zap,
} from "lucide-react";

interface AnalyticsViewProps {
  profileData: any;
  departmentData?: any[];
}

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"];

export function AnalyticsView({ profileData, departmentData }: AnalyticsViewProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedView, setSelectedView] = useState<string>("overview");
  
  const partB = profileData?.part_b || profileData || {};
  const partA = profileData?.part_a || {};

  // Aggregate data for charts
  const researchPapers = partB?.table2?.researchPapers || [];
  const publications = partB?.table2?.publications || [];
  const projects = partB?.table2?.researchProjects || [];
  const consultancy = partB?.table2?.consultancyProjects || [];
  const patents = partB?.patents || [];
  const guidance = partB?.table2?.researchGuidance || [];
  const lectures = partB?.invited_lectures || [];
  const courses = partA?.courses_fdp || [];

  // Year-wise publication data
  const yearData = researchPapers.reduce((acc: any, paper: any) => {
    const year = paper.year || "Unknown";
    if (!acc[year]) {
      acc[year] = { papers: 0, citations: 0 };
    }
    acc[year].papers++;
    acc[year].citations += paper.citations || 0;
    return acc;
  }, {});

  const yearChartData = Object.entries(yearData)
    .map(([year, data]: [string, any]) => ({
      year,
      papers: data.papers,
      citations: data.citations,
    }))
    .sort((a, b) => a.year.localeCompare(b.year));

  // Category distribution
  const categoryData = [
    { name: "Research Papers", value: researchPapers.length, color: "#4f46e5" },
    { name: "Publications", value: publications.length, color: "#10b981" },
    { name: "Projects", value: projects.length + consultancy.length, color: "#f59e0b" },
    { name: "Patents", value: patents.length, color: "#ef4444" },
    { name: "Invited Lectures", value: lectures.length, color: "#8b5cf6" },
  ].filter(item => item.value > 0);

  // Indexing distribution
  const indexingData: { [key: string]: number } = {};
  researchPapers.forEach((paper: any) => {
    (paper.indexed_in || []).forEach((index: string) => {
      indexingData[index] = (indexingData[index] || 0) + 1;
    });
  });
  const indexingChartData = Object.entries(indexingData).map(([name, value]) => ({ name, value }));

  // Project funding data
  const fundingByAgency: { [key: string]: number } = {};
  projects.forEach((project: any) => {
    const agency = project.funding_agency || "Unknown";
    const amount = parseFloat(String(project.amount || 0).replace(/[^0-9.-]/g, "")) || 0;
    fundingByAgency[agency] = (fundingByAgency[agency] || 0) + amount;
  });
  const fundingChartData = Object.entries(fundingByAgency)
    .map(([name, value]) => ({ name: name.split("(")[0].trim(), value: value / 100000 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Radar chart data for overall performance
  const maxValues = { papers: 10, projects: 5, patents: 3, guidance: 5, lectures: 10, courses: 10 };
  const radarData = [
    { subject: "Publications", A: Math.min(100, ((researchPapers.length + publications.length) / maxValues.papers) * 100), fullMark: 100 },
    { subject: "Projects", A: Math.min(100, ((projects.length + consultancy.length) / maxValues.projects) * 100), fullMark: 100 },
    { subject: "Patents", A: Math.min(100, (patents.length / maxValues.patents) * 100), fullMark: 100 },
    { subject: "Guidance", A: Math.min(100, (guidance.length / maxValues.guidance) * 100), fullMark: 100 },
    { subject: "Lectures", A: Math.min(100, (lectures.length / maxValues.lectures) * 100), fullMark: 100 },
    { subject: "FDP/Courses", A: Math.min(100, (courses.length / maxValues.courses) * 100), fullMark: 100 },
  ];

  // Calculate API Score breakdown
  const calculateAPIScore = () => {
    let categoryI = 0;
    let categoryII = 0;
    let categoryIII = 0;

    // Category III: Research
    researchPapers.forEach((p: any) => {
      let score = 10;
      if (p.indexed_in?.includes("SCI") || p.indexed_in?.includes("SCIE")) score = 15;
      else if (p.indexed_in?.includes("Scopus")) score = 12;
      if (p.is_first_author) score += 2;
      categoryIII += score;
    });

    publications.forEach((p: any) => {
      if (p.type === "Book") categoryIII += 30;
      else categoryIII += 10;
    });

    projects.forEach((p: any) => {
      if (p.project_type === "Major") categoryIII += 30;
      else categoryIII += 15;
    });

    patents.forEach((p: any) => {
      if (p.status === "Granted") categoryIII += 30;
      else if (p.status === "Published") categoryIII += 20;
      else categoryIII += 10;
    });

    guidance.forEach((g: any) => {
      if (g.degree === "Ph.D." && g.status === "Awarded") categoryIII += 30;
      else if (g.degree === "Ph.D.") categoryIII += 10;
    });

    // Category II: Extension & Service
    lectures.forEach((l: any) => {
      if (l.level === "International") categoryII += 20;
      else if (l.level === "National") categoryII += 15;
      else categoryII += 10;
    });

    courses.forEach(() => {
      categoryII += 10;
    });

    // Category I: Teaching (placeholder)
    categoryI = 80; // Default score based on teaching hours

    return { categoryI, categoryII, categoryIII, total: categoryI + categoryII + categoryIII };
  };

  const apiScore = calculateAPIScore();

  const apiScoreData = [
    { name: "Category I\n(Teaching)", value: apiScore.categoryI, target: 125, color: "#4f46e5" },
    { name: "Category II\n(Extension)", value: apiScore.categoryII, target: 75, color: "#10b981" },
    { name: "Category III\n(Research)", value: apiScore.categoryIII, target: 200, color: "#f59e0b" },
  ];

  // Research status breakdown
  const phdStatus = guidance.filter((g: any) => g.degree === "Ph.D.").reduce((acc: any, g: any) => {
    acc[g.status] = (acc[g.status] || 0) + 1;
    return acc;
  }, {});
  const guidanceStatusData = Object.entries(phdStatus).map(([name, value]) => ({ name, value }));

  // Patent status breakdown
  const patentStatus = patents.reduce((acc: any, p: any) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  const patentStatusData = Object.entries(patentStatus).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive view of your academic performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {yearChartData.map((d) => (
                <SelectItem key={d.year} value={d.year}>{d.year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-xl border"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-indigo-500" />
            <span className="text-xs text-muted-foreground">Papers</span>
          </div>
          <p className="text-2xl font-bold">{researchPapers.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl border"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Publications</span>
          </div>
          <p className="text-2xl font-bold">{publications.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Projects</span>
          </div>
          <p className="text-2xl font-bold">{projects.length + consultancy.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Patents</span>
          </div>
          <p className="text-2xl font-bold">{patents.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Ph.D. Guidance</span>
          </div>
          <p className="text-2xl font-bold">{guidance.filter((g: any) => g.degree === "Ph.D.").length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-cyan-500" />
            <span className="text-xs text-muted-foreground">API Score</span>
          </div>
          <p className="text-2xl font-bold">{apiScore.total}</p>
        </motion.div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Year-wise Publications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Publication Timeline
            </CardTitle>
            <CardDescription>Year-wise research output and citations</CardDescription>
          </CardHeader>
          <CardContent>
            {yearChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="papers" name="Papers" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="citations" name="Citations" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No publication data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-emerald-500" />
              Output Distribution
            </CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              Performance Profile
            </CardTitle>
            <CardDescription>Multi-dimensional performance view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.5}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* API Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-500" />
              API Score Breakdown
            </CardTitle>
            <CardDescription>Score vs. Target for CAS promotion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apiScoreData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Your Score" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="target" name="Target" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal Indexing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Journal Indexing</CardTitle>
          </CardHeader>
          <CardContent>
            {indexingChartData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={indexingChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {indexingChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                No indexed papers
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Funding */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Funding (₹ Lakhs)</CardTitle>
          </CardHeader>
          <CardContent>
            {fundingChartData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fundingChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => [`₹${value} L`, "Funding"]} />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                No project funding data
              </div>
            )}
          </CardContent>
        </Card>

        {/* PhD Guidance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ph.D. Guidance Status</CardTitle>
          </CardHeader>
          <CardContent>
            {guidanceStatusData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={guidanceStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {guidanceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                No Ph.D. guidance data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Key Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Citations</p>
              <p className="text-xl font-bold">{researchPapers.reduce((sum: number, p: any) => sum + (p.citations || 0), 0)}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">First Author Papers</p>
              <p className="text-xl font-bold">{researchPapers.filter((p: any) => p.is_first_author).length}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">SCI/Scopus Papers</p>
              <p className="text-xl font-bold">
                {researchPapers.filter((p: any) => 
                  p.indexed_in?.some((i: string) => i.toLowerCase().includes('sci') || i.toLowerCase().includes('scopus'))
                ).length}
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Major Projects</p>
              <p className="text-xl font-bold">{projects.filter((p: any) => p.project_type === "Major").length}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Granted Patents</p>
              <p className="text-xl font-bold">{patents.filter((p: any) => p.status === "Granted").length}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Awarded Ph.D.s</p>
              <p className="text-xl font-bold">{guidance.filter((g: any) => g.status === "Awarded" && g.degree === "Ph.D.").length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsView;
