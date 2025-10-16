"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
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
} from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 Check login + redirect based on role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("👀 Dashboard Auth listener:", user ? user.uid : "none");

      if (!user) {
        console.log("❌ No user, redirecting to login");
        window.location.href = "/auth/login";
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (!userDoc.exists()) {
          console.warn("⚠️ No Firestore record found for user");
          await signOut(auth);
          window.location.href = "/auth/login";
          return;
        }

        const data = userDoc.data();
        console.log("✅ Dashboard loaded for role:", data.role);

        setProfile(data);

        if (data.role === "misAdmin") {
          console.log("🔁 Redirecting to /admin");
          window.location.href = "/admin";
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("💥 Error fetching user data:", err);
        await signOut(auth);
        window.location.href = "/auth/login";
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/login");
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-medium">
        Loading Dashboard...
      </div>
    );
  }

  const { name, role } = profile;

  // Mock stats for now (replace with Firestore data if needed)
  const totalAppraisals = 10;
  const draftAppraisals = 3;
  const submittedAppraisals = 4;
  const approvedAppraisals = 3;
  const currentYearPublications = 2;
  const events = 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">
            Welcome back, {name}!
          </h1>
          <p className="text-muted-foreground mt-1 capitalize">Role: {role}</p>
        </div>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Total Appraisals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalAppraisals}</p>
            <p className="text-muted-foreground text-sm">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Publications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{currentYearPublications}</p>
            <p className="text-muted-foreground text-sm">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Events Attended</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{events}</p>
            <p className="text-muted-foreground text-sm">
              Conferences & Workshops
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Approval Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalAppraisals > 0
                ? `${Math.round((approvedAppraisals / totalAppraisals) * 100)}%`
                : "0%"}
            </p>
            <p className="text-muted-foreground text-sm">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Appraisal Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Appraisal Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {draftAppraisals}
              </p>
              <p className="text-sm text-muted-foreground">Draft</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {submittedAppraisals}
              </p>
              <p className="text-sm text-muted-foreground">Submitted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {approvedAppraisals}
              </p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Progress</span>
              <span>
                {Math.round((approvedAppraisals / totalAppraisals) * 100)}%
              </span>
            </div>
            <Progress
              value={(approvedAppraisals / totalAppraisals) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* <Button
            className="w-full justify-start bg-transparent"
            variant="outline"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Appraisal
          </Button>
          <Button
            className="w-full justify-start bg-transparent"
            variant="outline"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Manage Publications
          </Button>
          <Button
            className="w-full justify-start bg-transparent"
            variant="outline"
          >
            <Clock className="mr-2 h-4 w-4" />
            Update Profile
          </Button> */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[
              {
                title: "Profile",
                subtitle: "Profile Details",
                href: "dashboard/forms/profile",
              },
              {
                title: "Faculty Details",
                subtitle: "Personal & Contact Information",
                href: "dashboard/forms/part-a/personal-info",
              },
              {
                title: "Qualifications",
                subtitle: "Academic Qualifications",
                href: "dashboard/forms/part-a/qualifications",
              },
              {
                title: "Research Degrees",
                subtitle: "Information about research-based qualifications",
                href: "dashboard/forms/part-a/research",
              },
              {
                title: "Employment History",
                subtitle: "Information about employment history",
                href: "dashboard/forms/part-a/employment-history",
              },
              {
                title: "Teaching Experience",
                subtitle: "Information about teaching experience",
                href: "dashboard/forms/part-a/teaching-experience",
              },
              {
                title: "Courses and FDP Module",
                subtitle:
                  "faculty development, refresher courses, orientation, MOOCs, etc",
                href: "dashboard/forms/part-a/courses_fdp",
              },
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block p-4 border rounded-lg hover:shadow-lg transition-shadow"
              >
                <h2 className="text-lg font-semibold text-primary">
                  {item.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.subtitle}
                </p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
