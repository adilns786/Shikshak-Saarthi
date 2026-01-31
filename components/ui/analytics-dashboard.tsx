"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PieChartIcon,
  Activity,
  Target,
  Award,
  BookOpen,
  Briefcase,
  Users,
  Download,
  Calendar,
} from "lucide-react";

const CHART_COLORS = [
  "#ef233c",
  "#2b2d42",
  "#8d99ae",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
];

interface AnalyticsDashboardProps {
  profileData: any;
  className?: string;
}

export function AnalyticsDashboard({ profileData, className = "" }: AnalyticsDashboardProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [chartView, setChartView] = useState<"overview" | "research" | "teaching" | "comparison">("overview");

  // Compute analytics data
  const analyticsData = useMemo(() => {
    if (!profileData) return null;

    const partB = profileData.part_b || {};
    const partA = profileData.part_a || {};

    // Research metrics
    const researchPapers = partB.table2?.researchPapers || [];
    const publications = partB.table2?.publications || [];
    const researchProjects = partB.table2?.researchProjects || [];
    const consultancyProjects = partB.table2?.consultancyProjects || [];
    const patents = partB.patents || partB.patents_policy_awards?.filter((p: any) => p.type === "patent") || [];
    const awards = partB.awards || partB.patents_policy_awards?.filter((p: any) => p.type === "award") || [];
    const invitedLectures = partB.invited_lectures || [];
    const guidance = partB.table2?.researchGuidance || [];
    const courses = partA.courses_fdp || [];

    // Calculate totals
    const totalPublications = researchPapers.length + publications.length;
    const totalProjects = researchProjects.length + consultancyProjects.length;
    const totalPatents = patents.length;
    const totalAwards = awards.length;
    const totalLectures = invitedLectures.length;
    const totalGuidance = guidance.length;
    const totalCourses = courses.length;

    // Calculate funding
    const researchFunding = researchProjects.reduce((acc: number, p: any) => {
      return acc + (parseFloat(String(p.amount || 0).replace(/[^0-9.-]/g, "")) || 0);
    }, 0);
    const consultancyFunding = consultancyProjects.reduce((acc: number, p: any) => {
      return acc + (parseFloat(String(p.amount || 0).replace(/[^0-9.-]/g, "")) || 0);
    }, 0);
    const totalFunding = researchFunding + consultancyFunding;

    // Year-wise breakdown
    const yearData: Record<string, { publications: number; projects: number; lectures: number }> = {};
    
    const extractYear = (item: any) => {
      if (!item) return null;
      if (item.year) return String(item.year);
      if (item.date_of_award) return String(new Date(item.date_of_award).getFullYear());
      if (item.date) return String(new Date(item.date).getFullYear());
      if (item.start_date) return String(new Date(item.start_date).getFullYear());
      return null;
    };

    [...researchPapers, ...publications].forEach((item) => {
      const year = extractYear(item);
      if (year) {
        if (!yearData[year]) yearData[year] = { publications: 0, projects: 0, lectures: 0 };
        yearData[year].publications++;
      }
    });

    [...researchProjects, ...consultancyProjects].forEach((item) => {
      const year = extractYear(item);
      if (year) {
        if (!yearData[year]) yearData[year] = { publications: 0, projects: 0, lectures: 0 };
        yearData[year].projects++;
      }
    });

    invitedLectures.forEach((item: any) => {
      const year = extractYear(item);
      if (year) {
        if (!yearData[year]) yearData[year] = { publications: 0, projects: 0, lectures: 0 };
        yearData[year].lectures++;
      }
    });

    const yearlyTrends = Object.entries(yearData)
      .map(([year, data]) => ({ year, ...data }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));

    // Category distribution for pie chart
    const categoryData = [
      { name: "Research Papers", value: researchPapers.length, color: CHART_COLORS[0] },
      { name: "Publications", value: publications.length, color: CHART_COLORS[1] },
      { name: "Projects", value: totalProjects, color: CHART_COLORS[2] },
      { name: "Patents", value: totalPatents, color: CHART_COLORS[3] },
      { name: "Awards", value: totalAwards, color: CHART_COLORS[4] },
      { name: "Lectures", value: totalLectures, color: CHART_COLORS[5] },
    ].filter((item) => item.value > 0);

    // API Score breakdown (simulated based on typical PBAS scoring)
    const apiScoreData = {
      categoryI: Math.min(100, (courses.length * 10) + (partB.table1?.teaching_data ? 50 : 0)),
      categoryII: Math.min(100, (partB.table1?.admin_responsibilities?.length || 0) * 10 + 
                          (partB.table1?.examination_duties?.length || 0) * 5),
      categoryIII: Math.min(300, 
        researchPapers.length * 15 + 
        publications.length * 10 + 
        totalProjects * 20 + 
        totalPatents * 30 + 
        guidance.length * 25
      ),
    };

    // Radar chart data for profile completeness
    const profileRadarData = [
      { subject: "Publications", A: Math.min(100, totalPublications * 20), fullMark: 100 },
      { subject: "Projects", A: Math.min(100, totalProjects * 25), fullMark: 100 },
      { subject: "Patents", A: Math.min(100, totalPatents * 33), fullMark: 100 },
      { subject: "Guidance", A: Math.min(100, totalGuidance * 25), fullMark: 100 },
      { subject: "FDP/Courses", A: Math.min(100, totalCourses * 20), fullMark: 100 },
      { subject: "Lectures", A: Math.min(100, totalLectures * 20), fullMark: 100 },
    ];

    return {
      totals: {
        totalPublications,
        totalProjects,
        totalPatents,
        totalAwards,
        totalLectures,
        totalGuidance,
        totalCourses,
        totalFunding,
        researchFunding,
        consultancyFunding,
      },
      yearlyTrends,
      categoryData,
      apiScoreData,
      profileRadarData,
    };
  }, [profileData]);

  if (!analyticsData) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No data available for analytics</p>
        </CardContent>
      </Card>
    );
  }

  const { totals, yearlyTrends, categoryData, apiScoreData, profileRadarData } = analyticsData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* View Selector */}
      <div className="flex flex-wrap gap-2 bg-muted/50 p-1 rounded-lg w-fit">
        {["overview", "research", "teaching", "comparison"].map((view) => (
          <button
            key={view}
            onClick={() => setChartView(view as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
              chartView === view
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          title="Publications"
          value={totals.totalPublications}
          icon={BookOpen}
          color="text-red-500"
          bgColor="bg-red-50"
        />
        <StatCard
          title="Projects"
          value={totals.totalProjects}
          icon={Briefcase}
          color="text-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Patents"
          value={totals.totalPatents}
          icon={Award}
          color="text-green-500"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Ph.D. Guidance"
          value={totals.totalGuidance}
          icon={Users}
          color="text-purple-500"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Lectures"
          value={totals.totalLectures}
          icon={Activity}
          color="text-amber-500"
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Total Funding"
          value={`₹${(totals.totalFunding / 100000).toFixed(1)}L`}
          icon={Target}
          color="text-cyan-500"
          bgColor="bg-cyan-50"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yearly Trends */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Yearly Academic Output
            </CardTitle>
            <CardDescription>Publications, Projects & Lectures by Year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={yearlyTrends.length > 0 ? yearlyTrends : [{ year: "2025", publications: 0, projects: 0, lectures: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="publications" name="Publications" fill="#ef233c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projects" name="Projects" fill="#2b2d42" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="lectures" name="Lectures" stroke="#10b981" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-accent" />
              Research Output Distribution
            </CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completeness Radar */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Profile Strength Analysis
            </CardTitle>
            <CardDescription>Multi-dimensional performance view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={profileRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Your Score"
                    dataKey="A"
                    stroke="#ef233c"
                    fill="#ef233c"
                    fillOpacity={0.5}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* API Score Breakdown */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              API Score Breakdown
            </CardTitle>
            <CardDescription>Category-wise API score estimation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <APIScoreBar
                label="Category I (Teaching)"
                score={apiScoreData.categoryI}
                maxScore={100}
                color="bg-blue-500"
              />
              <APIScoreBar
                label="Category II (Co-Curricular)"
                score={apiScoreData.categoryII}
                maxScore={100}
                color="bg-green-500"
              />
              <APIScoreBar
                label="Category III (Research)"
                score={apiScoreData.categoryIII}
                maxScore={300}
                color="bg-purple-500"
              />
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Total Estimated API Score</span>
                  <span className="text-2xl font-bold text-accent">
                    {apiScoreData.categoryI + apiScoreData.categoryII + apiScoreData.categoryIII}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funding Breakdown */}
      {totals.totalFunding > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Funding Analysis</CardTitle>
            <CardDescription>Research vs Consultancy funding breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { category: "Research Projects", amount: totals.researchFunding / 100000 },
                    { category: "Consultancy", amount: totals.consultancyFunding / 100000 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis label={{ value: "Amount (Lakhs)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => [`₹${value} Lakhs`, "Amount"]} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#ef233c"
                    fill="url(#colorAmount)"
                  />
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef233c" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef233c" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Analytics Report
        </Button>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  bgColor: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`p-4 rounded-lg ${bgColor} border border-border/50`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-white shadow-sm`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function APIScoreBar({
  label,
  score,
  maxScore,
  color,
}: {
  label: string;
  score: number;
  maxScore: number;
  color: string;
}) {
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {score} / {maxScore}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}

export function TrendIndicator({ value, previousValue }: { value: number; previousValue: number }) {
  const change = value - previousValue;
  const percentChange = previousValue > 0 ? ((change / previousValue) * 100).toFixed(1) : 0;

  if (change > 0) {
    return (
      <span className="inline-flex items-center text-green-600 text-xs">
        <TrendingUp className="h-3 w-3 mr-1" />
        +{percentChange}%
      </span>
    );
  } else if (change < 0) {
    return (
      <span className="inline-flex items-center text-red-600 text-xs">
        <TrendingDown className="h-3 w-3 mr-1" />
        {percentChange}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-muted-foreground text-xs">
      <Minus className="h-3 w-3 mr-1" />
      No change
    </span>
  );
}
