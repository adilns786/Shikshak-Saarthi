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
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  BookOpen,
  Calendar,
  TrendingUp,
  LogOut,
  PlusCircle,
  Clock,
  Key,
  Lightbulb,
  User,
  Award,
  Briefcase,
  GraduationCap,
  Bot
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [insights, setInsights] = useState<string[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const router = useRouter();

  // Load user profile and stats
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      try {
        const cachedProfile = localStorage.getItem("profile");
        const cachedStats = localStorage.getItem("dashboardStats");

        if (cachedProfile) setProfile(JSON.parse(cachedProfile));
        if (cachedStats) setStats(JSON.parse(cachedStats));

        if (!cachedProfile || !cachedStats) {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (!userDoc.exists()) {
            await signOut(auth);
            window.location.href = "/auth/login";
            return;
          }
          const data = userDoc.data();
          setProfile(data);

          // Extract stats from DB
          const teaching =
            data.part_a?.teaching_student_assessment?.teaching || [];
          const activities =
            data.part_a?.teaching_student_assessment?.activities || [];
          const publications = data.part_a?.research?.publications || [];
          const events = data.part_a?.events || [];

          const newStats = {
            totalAppraisals: teaching.length + activities.length,
            draftAppraisals:
              teaching.filter((t: any) => t.status === "draft").length +
              activities.filter((a: any) => a.status === "draft").length,
            submittedAppraisals:
              teaching.filter((t: any) => t.status === "submitted").length +
              activities.filter((a: any) => a.status === "submitted").length,
            approvedAppraisals:
              teaching.filter((t: any) => t.status === "approved").length +
              activities.filter((a: any) => a.status === "approved").length,
            totalPublications: publications.length,
            totalEvents: events.length,
            totalTeachingHours: teaching.reduce(
              (acc: number, t: any) => acc + Number(t.actual_class_spent || 0),
              0
            ),
            totalActivities: activities.length,
            expectedTeachingHours: 120,
          };

          setStats(newStats);
          localStorage.setItem("profile", JSON.stringify(data));
          localStorage.setItem("dashboardStats", JSON.stringify(newStats));
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        await signOut(auth);
        window.location.href = "/auth/login";
      }
    });

    return () => unsubscribe();
  }, []);

  // AI Insights
  useEffect(() => {
    const tmp: string[] = [];
    if (stats.draftAppraisals > 0)
      tmp.push(`You have ${stats.draftAppraisals} draft appraisals pending.`);
    if (stats.totalTeachingHours < stats.expectedTeachingHours)
      tmp.push(
        `Teaching hours (${stats.totalTeachingHours}) below target (${stats.expectedTeachingHours}).`
      );
    if (stats.totalActivities < 5)
      tmp.push(
        "Consider participating in more activities for better appraisal score."
      );
    setInsights(tmp);
  }, [stats]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/login");
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return alert("New password mismatch!");

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

  const { name, role } = profile;
  const {
    totalAppraisals,
    draftAppraisals,
    submittedAppraisals,
    approvedAppraisals,
    totalPublications,
    totalEvents,
    totalTeachingHours,
    totalActivities,
    expectedTeachingHours,
  } = stats;

  // Quick Actions
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
      title: "Teaching & Student Activity Assessment",
      subtitle: "Self & Verified Grading",
      href: "/dashboard/forms/part-b/table1",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Welcome back, {name}!
          </h1>
          <p className="text-muted-foreground mt-1 capitalize">Role: {role}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
            <Key className="mr-2 h-4 w-4" /> Change Password
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>
      <Button
        variant="default"
        className="fixed bottom-6 right-6 rounded-full shadow-xl flex items-center space-x-2 hover:bg-primary hover:text-white transition"
        onClick={() => router.push("/chatbot")}
      >
        <Bot className="h-5 w-5" />
        <span>AI Assistant</span>
      </Button>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" /> Total Appraisals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalAppraisals}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" /> Publications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPublications}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" /> Events Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalEvents}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalAppraisals > 0
                ? `${Math.round((approvedAppraisals / totalAppraisals) * 100)}%`
                : "0%"}
            </p>
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

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" /> Insights &
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.length === 0 ? (
            <p className="text-muted-foreground">
              You're up to date! Great job.
            </p>
          ) : (
            insights.map((insight, idx) => (
              <p key={idx} className="text-sm text-primary">
                • {insight}
              </p>
            ))
          )}
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
