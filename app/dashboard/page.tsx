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

/**
 * Final Dashboard
 * - gradient background
 * - caching via localStorage (profile + metrics)
 * - live refresh from Firestore
 * - all original features preserved
 */

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

  // Colors
  const DONUT_COLORS = ["#3b82f6", "#f97316", "#10b981", "#8b5cf6", "#ef4444"];
  const BAR_COLORS = { bar: "#4F46E5" };

  // Helper: compute metrics from profile
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
      "Patents / Awards": totalPatents,
      "Invited Lectures": totalLectures,
      "Projects (R+C)": totalResearchProjects + totalConsultancy,
    };

    // Build year counts
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

  // Load from cache (instant) then fetch live
  useEffect(() => {
    const cachedProfile = localStorage.getItem("pbas_profile");
    const cachedMetrics = localStorage.getItem("pbas_metrics");
    if (cachedProfile) {
      try {
        const p = JSON.parse(cachedProfile);
        setProfile(p);
        if (cachedMetrics) setMetrics(JSON.parse(cachedMetrics));
        setLoading(false);
      } catch {
        // ignore parse errors
      }
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
        // cache
        try {
          localStorage.setItem("pbas_profile", JSON.stringify(liveProfile));
          localStorage.setItem("pbas_metrics", JSON.stringify(liveMetrics));
        } catch {
          // storage may be full — ignore
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err);
        await signOut(auth);
        router.replace("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Derive insights when metrics change
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

  // Password change handler (uses reauth)
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
      // Clear cached profile/metrics to force refresh (optional)
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
      <div className="flex items-center justify-center h-screen text-lg font-medium">
        Loading Dashboard...
      </div>
    );
  }

  // Prepare chart data
  const yearChartData =
    metrics?.yearData && metrics.yearData.length > 0
      ? metrics.yearData.map((d: any) => ({ year: d.year, count: d.count }))
      : [{ year: new Date().getFullYear().toString(), count: 0 }];

  const donutData = metrics
    ? Object.entries(metrics.categoryCounts).map(([name, value]) => ({
        name,
        value,
      }))
    : [{ name: "No data", value: 1 }];

  // Quick actions
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
      title: "Research & Academic Contribution",
      subtitle: "Self & Verified Contributions",
      href: "/dashboard/forms/part-b/table2",
      icon: FileText,
    },
    {
      title: "Patents, Policy, and Awards",
      subtitle: "Assessment Overview",
      href: "/dashboard/forms/part-b/patents_policy_awards",
      icon: FileText,
    },
    {
      title: "Lectures & Presentations",
      subtitle: "Conference and Talks",
      href: "/dashboard/forms/part-b/invited_lectures",
      icon: FileText,
    },
  ];

  const totals = metrics?.totals ?? {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Welcome back,{" "}
            {profile?.personal_in?.name ?? profile?.name ?? "Faculty"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile?.formHeader?.department_name ?? profile?.department ?? ""}{" "}
            {profile?.formHeader?.academic_year
              ? `• ${profile.formHeader.academic_year}`
              : ""}
          </p>
          {profile?.formHeader?.cas_promotion_stage && (
            <div className="mt-2 inline-block px-2 py-1 rounded bg-primary/10 text-primary text-sm">
              {profile.formHeader.cas_promotion_stage}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Keep GeneratePBASButton as-is and styled to match */}
          <div>
            <GeneratePBASButton userId={auth.currentUser?.uid ?? ""} />
          </div>

          <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
            <Key className="mr-2 h-4 w-4" /> Change Password
          </Button>

          <Button
            variant="destructive"
            onClick={async () => {
              await signOut(auth);
              router.replace("/auth/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      {/* Floating chatbot button */}
      <Button
        variant="default"
        className="fixed bottom-6 right-6 rounded-full shadow-xl flex items-center space-x-2 hover:bg-primary hover:text-white transition"
        onClick={() => router.push("/chatbot")}
      >
        <Bot className="h-5 w-5" />
        <span>AI Assistant</span>
      </Button>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" /> Research Papers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totals.totalResearchPapers ?? 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Peer-reviewed papers recorded
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" /> Publications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totals.totalPublications ?? 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Books / Chapters / Other publications
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" /> Patents & Awards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.totalPatents ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Recognitions recorded
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" /> Invited Lectures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.totalLectures ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Talks & presentations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yearly Bar */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Academic Output — Year wise</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Outputs"
                  barSize={28}
                  radius={[6, 6, 0, 0]}
                  fill={BAR_COLORS.bar}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donut with labels */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col lg:flex-row items-center gap-4">
            <div className="w-full lg:w-2/3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={80}
                    dataKey="value"
                    label={(entry: any) => `${entry.name}: ${entry.value}`}
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full lg:w-1/3 space-y-2">
              {donutData.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        background: DONUT_COLORS[i % DONUT_COLORS.length],
                        borderRadius: 3,
                      }}
                    />
                    <div className="text-sm">{d.name}</div>
                  </div>
                  <div className="font-medium">{d.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <a
                key={idx}
                href={action.href}
                className="block p-4 border rounded-lg bg-white hover:bg-primary/5 transition-colors shadow hover:shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{action.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {action.subtitle}
                </p>
              </a>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" /> Insights &
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.map((insight, idx) => (
            <p key={idx} className="text-sm text-primary">
              • {insight}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-lg">
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
            <div className="flex flex-col">
              <label>Old Password</label>
              <input
                type="password"
                required
                className="p-2 border rounded-md"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    oldPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col">
              <label>New Password</label>
              <input
                type="password"
                required
                className="p-2 border rounded-md"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col">
              <label>Confirm New Password</label>
              <input
                type="password"
                required
                className="p-2 border rounded-md"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
