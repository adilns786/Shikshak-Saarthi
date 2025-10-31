"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import {
  onAuthStateChanged,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  BookOpen,
  Calendar,
  LogOut,
  Key,
  Lightbulb,
  User,
  Award,
  Briefcase,
  GraduationCap,
  Clock,
  Bot,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import GeneratePBASButton from "@/components/generatePbas";

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
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Enhanced color palette
  const DONUT_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];
  const BAR_COLOR = "#6366f1";

  const computeMetrics = (profileData: any) => {
    if (!profileData) return null;

    const researchPapers = profileData.part_b?.table2?.researchPapers ?? [];
    const publications = profileData.part_b?.table2?.publications ?? [];
    const patents = profileData.part_b?.patents_policy_awards ?? [];
    const lectures = profileData.part_b?.invited_lectures ?? [];
    const courses = profileData.part_a?.courses_fdp ?? [];
    const researchProjects = profileData.part_b?.table2?.researchProjects ?? [];
    const consultancyProjects =
      profileData.part_b?.table2?.consultancyProjects ?? [];
    const guidance = profileData.part_b?.table2?.researchGuidance ?? [];

    const totalResearchPapers = researchPapers.length;
    const totalPublications = publications.length;
    const totalPatents = patents.length;
    const totalLectures = lectures.length;
    const totalCourses = courses.length;
    const totalResearchProjects = researchProjects.length;
    const totalConsultancy = consultancyProjects.length;
    const totalGuidance = guidance.length;

    const categoryCounts = {
      "Research Papers": totalResearchPapers,
      Publications: totalPublications,
      "Patents & Awards": totalPatents,
      "Invited Lectures": totalLectures,
      Projects: totalResearchProjects + totalConsultancy,
    };

    const yearCounts: Record<string, number> = {};
    const safeGetYear = (item: any) => {
      if (!item) return null;
      if (item.year) return String(item.year);
      if (item.date_of_award) {
        const y = new Date(item.date_of_award).getFullYear();
        if (!Number.isNaN(y)) return String(y);
      }
      if (item.year_passing) return String(item.year_passing);
      if (item.date) {
        const y = new Date(item.date).getFullYear();
        if (!Number.isNaN(y)) return String(y);
      }
      return null;
    };
    const pushToYear = (y: string | null) => {
      if (!y) return;
      yearCounts[y] = (yearCounts[y] || 0) + 1;
    };

    researchPapers.forEach((p: any) => pushToYear(safeGetYear(p)));
    publications.forEach((p: any) => pushToYear(safeGetYear(p)));
    researchProjects.forEach((p: any) => pushToYear(safeGetYear(p)));
    consultancyProjects.forEach((p: any) => pushToYear(safeGetYear(p)));

    const yearData = Object.keys(yearCounts)
      .map((y) => ({ year: y, count: yearCounts[y] }))
      .sort((a, b) => Number(a.year) - Number(b.year));

    const totalOutputs =
      totalResearchPapers +
      totalPublications +
      totalPatents +
      totalLectures +
      totalResearchProjects +
      totalConsultancy;

    let topCategory = "None";
    {
      const entries = Object.entries(categoryCounts);
      entries.sort((a, b) => b[1] - a[1]);
      if (entries.length > 0) topCategory = entries[0][0];
    }

    let mostProductiveYear: string | null = null;
    if (yearData.length > 0) {
      const sortedByCount = [...yearData].sort((a, b) => b.count - a.count);
      mostProductiveYear = sortedByCount[0].year;
    }

    const parseAmount = (v: any) => {
      if (!v && v !== 0) return 0;
      if (typeof v === "number") return v;
      const s = String(v).replace(/[^0-9.-]+/g, "");
      const n = parseFloat(s);
      return Number.isNaN(n) ? 0 : n;
    };
    const totalGrantAmount =
      researchProjects.reduce(
        (acc: number, p: any) => acc + parseAmount(p.amount),
        0
      ) +
      consultancyProjects.reduce(
        (acc: number, p: any) => acc + parseAmount(p.amount),
        0
      );

    return {
      totals: {
        totalResearchPapers,
        totalPublications,
        totalPatents,
        totalLectures,
        totalCourses,
        totalResearchProjects,
        totalConsultancy,
        totalGuidance,
        totalOutputs,
        totalGrantAmount,
      },
      categoryCounts,
      yearData,
      topCategory,
      mostProductiveYear,
    };
  };

  useEffect(() => {
    const cachedProfile = localStorage.getItem("pbas_profile");
    const cachedMetrics = localStorage.getItem("pbas_metrics");
    if (cachedProfile) {
      try {
        const p = JSON.parse(cachedProfile);
        setProfile(p);
        if (cachedMetrics) setMetrics(JSON.parse(cachedMetrics));
        setLoading(false);
      } catch {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (!userDoc.exists()) {
          await signOut(auth);
          router.replace("/auth/login");
          return;
        }
        const liveProfile = userDoc.data();
        setProfile(liveProfile || {});
        const liveMetrics = computeMetrics(liveProfile);
        setMetrics(liveMetrics);
        try {
          localStorage.setItem("pbas_profile", JSON.stringify(liveProfile));
          localStorage.setItem("pbas_metrics", JSON.stringify(liveMetrics));
        } catch {}
        setLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err);
        await signOut(auth);
        router.replace("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const tmp: string[] = [];
    if (!metrics) {
      setInsights([
        "No academic data found yet — start adding research, publications or projects to get rich insights.",
      ]);
      return;
    }
    const { totals, topCategory, mostProductiveYear } = metrics as any;
    tmp.push(
      `You have recorded ${totals.totalOutputs} academic outputs (papers, publications, patents, lectures, projects).`
    );
    if (totals.totalOutputs > 0)
      tmp.push(`Top contribution area: ${topCategory}.`);
    if (totals.totalGuidance > 0)
      tmp.push(`Guided students: ${totals.totalGuidance}.`);
    else
      tmp.push(
        "No research guidance recorded — consider adding guided students."
      );
    if (mostProductiveYear)
      tmp.push(`Most productive year: ${mostProductiveYear}.`);
    if (totals.totalGrantAmount > 0)
      tmp.push(
        `Total recorded funding: ₹ ${totals.totalGrantAmount.toFixed(2)}.`
      );
    if (totals.totalPublications < 2)
      tmp.push(
        "Consider publishing more peer-reviewed articles to strengthen your profile."
      );
    if (totals.totalCourses < 1)
      tmp.push(
        "Attend/organize at least one FDP/course this year for teaching credentials."
      );

    setInsights(tmp);
  }, [metrics]);

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password mismatch!");
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user || !profile?.email) return;
      const credential = EmailAuthProvider.credential(
        profile.email,
        passwordForm.oldPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);
      alert("Password updated successfully!");
      setShowPasswordModal(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      try {
        localStorage.removeItem("pbas_profile");
        localStorage.removeItem("pbas_metrics");
      } catch {}
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error updating password");
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-700">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const yearChartData =
    metrics?.yearData && metrics.yearData.length > 0
      ? metrics.yearData.map((d: any) => ({ year: d.year, count: d.count }))
      : [{ year: new Date().getFullYear().toString(), count: 0 }];

  const donutData = metrics
    ? Object.entries(metrics.categoryCounts)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const quickActions = [
    {
      title: "Profile",
      subtitle: "Profile Details",
      href: "/dashboard/forms/profile",
      icon: User,
    },
    {
      title: "Faculty Details",
      subtitle: "Personal & Contact Information",
      href: "/dashboard/forms/part-a/personal-info",
      icon: Briefcase,
    },
    {
      title: "Qualifications",
      subtitle: "Academic Qualifications",
      href: "/dashboard/forms/part-a/qualifications",
      icon: GraduationCap,
    },
    {
      title: "Research Degrees",
      subtitle: "Research Qualifications",
      href: "/dashboard/forms/part-a/research",
      icon: Award,
    },
    {
      title: "Employment History",
      subtitle: "Past Employment Info",
      href: "/dashboard/forms/part-a/employment-history",
      icon: Briefcase,
    },
    {
      title: "Teaching Experience",
      subtitle: "Teaching Details",
      href: "/dashboard/forms/part-a/teaching-experience",
      icon: BookOpen,
    },
    {
      title: "Courses & FDP",
      subtitle: "Refresher & MOOCs",
      href: "/dashboard/forms/part-a/courses_fdp",
      icon: Clock,
    },
    {
      title: "Research & Academic",
      subtitle: "Self & Verified Contributions",
      href: "/dashboard/forms/part-b/table2",
      icon: FileText,
    },
    {
      title: "Patents & Awards",
      subtitle: "Assessment Overview",
      href: "/dashboard/forms/part-b/patents_policy_awards",
      icon: Award,
    },
    {
      title: "Lectures & Talks",
      subtitle: "Conference and Presentations",
      href: "/dashboard/forms/part-b/invited_lectures",
      icon: Calendar,
    },
  ];

  const totals = metrics?.totals ?? {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back,{" "}
                {profile?.personal_in?.name ?? profile?.name ?? "Faculty"}!
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <p className="text-slate-600">
                  {profile?.formHeader?.department_name ??
                    profile?.department ??
                    ""}
                </p>
                {profile?.formHeader?.academic_year && (
                  <>
                    <span className="text-slate-400">•</span>
                    <p className="text-slate-600">
                      {profile.formHeader.academic_year}
                    </p>
                  </>
                )}
              </div>
              {profile?.formHeader?.cas_promotion_stage && (
                <div className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-medium">
                  {profile.formHeader.cas_promotion_stage}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <GeneratePBASButton userId={auth.currentUser?.uid ?? ""} />
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(true)}
                className="shadow-sm"
              >
                <Key className="mr-2 h-4 w-4" /> Change Password
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await signOut(auth);
                  router.replace("/auth/login");
                }}
                className="shadow-sm"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                Research Papers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {totals.totalResearchPapers ?? 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Peer-reviewed papers
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                Publications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {totals.totalPublications ?? 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">Books & chapters</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
                Patents & Awards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {totals.totalPatents ?? 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">Recognitions</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                Invited Lectures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {totals.totalLectures ?? 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Talks & presentations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Academic Output Timeline
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Year-wise contribution breakdown
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yearChartData}
                    margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Outputs"
                      fill={BAR_COLOR}
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Category Distribution
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Contribution by category
              </p>
            </CardHeader>
            <CardContent>
              {donutData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {donutData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={50}
                        iconType="circle"
                        wrapperStyle={{ fontSize: "13px", paddingTop: "20px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-slate-400">
                  <p>No data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-amber-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Insights & Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <a
                  key={idx}
                  href={action.href}
                  className="group block p-4 border border-slate-200 rounded-xl bg-white hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <Icon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-900">
                      {action.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 pl-11">
                    {action.subtitle}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating AI Button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full shadow-xl h-14 px-6 bg-indigo-600 hover:bg-indigo-700 text-white"
        onClick={() => router.push("/chatbot")}
      >
        <Bot className="h-5 w-5 mr-2" />
        <span className="font-medium">AI Assistant</span>
      </Button>

      {/* Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordChange();
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Old Password
              </label>
              <input
                type="password"
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    oldPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                New Password
              </label>
              <input
                type="password"
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Password</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
