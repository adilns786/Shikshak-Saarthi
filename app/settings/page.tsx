"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db as firestore } from "@/lib/firebase";
import {
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AppShell } from "@/components/ui/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// ThemeToggle imported from its component file
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  User,
  Lock,
  Bell,
  Palette,
  CheckCircle,
  Save,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  role: string;
  name?: string;
  full_name?: string;
  email: string;
  department?: string;
  phone?: string;
  designation?: string;
  employee_id?: string;
}

type Tab = "profile" | "password" | "notifications" | "appearance";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const FADE_IN = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0, 0, 0.2, 1] },
};

export default function SettingsPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const router = useRouter();
  const { toast } = useToast();

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    designation: "",
    employee_id: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [pwForm, setPwForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Notifications state
  const [notifs, setNotifs] = useState({
    emailAppraisal: true,
    emailDeadline: true,
    emailActivity: false,
    pushEnabled: true,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      try {
        const snap = await getDoc(doc(firestore, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data() as UserData;
          setUserData(data);
          setProfileForm({
            name: data.full_name ?? data.name ?? "",
            phone: data.phone ?? "",
            designation: data.designation ?? "",
            employee_id: data.employee_id ?? "",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  // ── Save profile ────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setSavingProfile(true);
    try {
      await updateDoc(doc(firestore, "users", user.uid), {
        full_name: profileForm.name,
        name: profileForm.name,
        phone: profileForm.phone,
        designation: profileForm.designation,
        employee_id: profileForm.employee_id,
        updated_at: new Date().toISOString(),
      });
      setUserData((prev) =>
        prev ? { ...prev, full_name: profileForm.name } : prev,
      );
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change password ─────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    if (pwForm.next !== pwForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (pwForm.next.length < 6) {
      toast({
        title: "Password too short (min 6 chars)",
        variant: "destructive",
      });
      return;
    }

    setSavingPw(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, pwForm.current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, pwForm.next);
      setPwForm({ current: "", next: "", confirm: "" });
      toast({
        title: "Password updated",
        description: "Your password has been changed.",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      toast({
        title: "Error",
        description: msg.includes("wrong-password")
          ? "Current password is incorrect."
          : msg,
        variant: "destructive",
      });
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--surface-base)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--brand-primary)" }}
        />
      </div>
    );
  }

  const displayName =
    userData?.full_name ?? userData?.name ?? userData?.email ?? "User";

  return (
    <AppShell
      user={
        userData
          ? {
              email: userData.email,
              name: displayName,
              role: userData.role as "faculty" | "hod" | "admin" | "misAdmin",
              department: userData.department,
            }
          : null
      }
    >
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <motion.div {...FADE_IN} className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--border-subtle)" }}
          >
            <Settings className="w-5 h-5" style={{ color: "var(--text-2)" }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-1)" }}
            >
              Settings
            </h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              Manage your account preferences
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar tabs */}
          <motion.nav
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="sm:w-44 shrink-0 flex sm:flex-col gap-1"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all duration-150"
                  style={
                    active
                      ? {
                          background: "var(--brand-primary-subtle)",
                          color: "var(--brand-primary)",
                        }
                      : {
                          color: "var(--text-2)",
                        }
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              );
            })}
          </motion.nav>

          {/* Content panel */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* ── Profile ── */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl p-6 space-y-5"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-1)",
                  }}
                >
                  <h2
                    className="text-base font-semibold"
                    style={{ color: "var(--text-1)" }}
                  >
                    Profile Information
                  </h2>

                  {/* Read-only fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label style={{ color: "var(--text-2)" }}>Email</Label>
                      <Input
                        value={userData?.email ?? ""}
                        disabled
                        className="h-10 opacity-60 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label style={{ color: "var(--text-2)" }}>
                        Department
                      </Label>
                      <Input
                        value={userData?.department ?? ""}
                        disabled
                        className="h-10 opacity-60 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Editable fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="s-name"
                        style={{ color: "var(--text-2)" }}
                      >
                        Full Name
                      </Label>
                      <Input
                        id="s-name"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="s-phone"
                        style={{ color: "var(--text-2)" }}
                      >
                        Phone
                      </Label>
                      <Input
                        id="s-phone"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                        className="h-10"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="s-designation"
                        style={{ color: "var(--text-2)" }}
                      >
                        Designation
                      </Label>
                      <Input
                        id="s-designation"
                        value={profileForm.designation}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            designation: e.target.value,
                          }))
                        }
                        className="h-10"
                        placeholder="Assistant Professor"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="s-empid"
                        style={{ color: "var(--text-2)" }}
                      >
                        Employee ID
                      </Label>
                      <Input
                        id="s-empid"
                        value={profileForm.employee_id}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            employee_id: e.target.value,
                          }))
                        }
                        className="h-10"
                        placeholder="EMP12345"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
                    style={{
                      background: "var(--brand-primary)",
                      color: "#fff",
                      boxShadow: "var(--glow-primary)",
                    }}
                  >
                    {savingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save changes
                  </button>
                </motion.div>
              )}

              {/* ── Password ── */}
              {activeTab === "password" && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl p-6 space-y-5"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-1)",
                  }}
                >
                  <h2
                    className="text-base font-semibold"
                    style={{ color: "var(--text-1)" }}
                  >
                    Change Password
                  </h2>

                  <div className="space-y-4 max-w-sm">
                    {[
                      {
                        id: "cur",
                        label: "Current password",
                        val: pwForm.current,
                        key: "current" as const,
                        show: showCurrent,
                        toggle: () => setShowCurrent((p) => !p),
                      },
                      {
                        id: "nxt",
                        label: "New password",
                        val: pwForm.next,
                        key: "next" as const,
                        show: showNext,
                        toggle: () => setShowNext((p) => !p),
                      },
                      {
                        id: "cnf",
                        label: "Confirm new password",
                        val: pwForm.confirm,
                        key: "confirm" as const,
                        show: showNext,
                        toggle: () => setShowNext((p) => !p),
                      },
                    ].map((fld) => (
                      <div key={fld.id} className="space-y-1.5">
                        <Label
                          htmlFor={fld.id}
                          style={{ color: "var(--text-2)" }}
                        >
                          {fld.label}
                        </Label>
                        <div className="relative">
                          <Input
                            id={fld.id}
                            type={fld.show ? "text" : "password"}
                            value={fld.val}
                            onChange={(e) =>
                              setPwForm((p) => ({
                                ...p,
                                [fld.key]: e.target.value,
                              }))
                            }
                            className="h-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={fld.toggle}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: "var(--text-3)" }}
                          >
                            {fld.show ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={savingPw}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
                    style={{
                      background: "var(--brand-primary)",
                      color: "#fff",
                      boxShadow: "var(--glow-primary)",
                    }}
                  >
                    {savingPw ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    Update password
                  </button>
                </motion.div>
              )}

              {/* ── Notifications ── */}
              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl p-6 space-y-5"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-1)",
                  }}
                >
                  <h2
                    className="text-base font-semibold"
                    style={{ color: "var(--text-1)" }}
                  >
                    Notification Preferences
                  </h2>

                  <div className="space-y-3">
                    {[
                      {
                        key: "emailAppraisal" as const,
                        label: "Appraisal status updates",
                        desc: "Get notified when your appraisal is approved or returned",
                      },
                      {
                        key: "emailDeadline" as const,
                        label: "Deadline reminders",
                        desc: "Reminder emails before submission deadlines",
                      },
                      {
                        key: "emailActivity" as const,
                        label: "Activity digest",
                        desc: "Weekly summary of your activity in the system",
                      },
                      {
                        key: "pushEnabled" as const,
                        label: "Browser notifications",
                        desc: "Real-time push notifications in the browser",
                      },
                    ].map((n) => (
                      <div
                        key={n.key}
                        className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: "var(--surface-base)" }}
                      >
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--text-1)" }}
                          >
                            {n.label}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-3)" }}
                          >
                            {n.desc}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setNotifs((p) => ({ ...p, [n.key]: !p[n.key] }))
                          }
                          className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4"
                          style={{
                            background: notifs[n.key]
                              ? "var(--brand-primary)"
                              : "var(--border-default)",
                          }}
                          role="switch"
                          aria-checked={notifs[n.key]}
                        >
                          <span
                            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                            style={{
                              left: notifs[n.key] ? "calc(100% - 22px)" : "2px",
                            }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      toast({
                        title: "Preferences saved",
                        description:
                          "Your notification settings have been updated.",
                      })
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
                    style={{
                      background: "var(--brand-primary)",
                      color: "#fff",
                      boxShadow: "var(--glow-primary)",
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save preferences
                  </button>
                </motion.div>
              )}

              {/* ── Appearance ── */}
              {activeTab === "appearance" && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl p-6 space-y-6"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-1)",
                  }}
                >
                  <h2
                    className="text-base font-semibold"
                    style={{ color: "var(--text-1)" }}
                  >
                    Appearance
                  </h2>

                  {/* Theme selector */}
                  <div>
                    <p
                      className="text-sm font-medium mb-3"
                      style={{ color: "var(--text-2)" }}
                    >
                      Theme
                    </p>
                    <div className="flex items-center gap-3">
                      <ThemeToggle />
                      <p className="text-sm" style={{ color: "var(--text-3)" }}>
                        Choose between Light, Dark, or System default
                      </p>
                    </div>
                  </div>

                  {/* Colour preview swatches */}
                  <div>
                    <p
                      className="text-sm font-medium mb-3"
                      style={{ color: "var(--text-2)" }}
                    >
                      Brand colours
                    </p>
                    <div className="flex gap-3">
                      {[
                        { label: "Primary", css: "var(--brand-primary)" },
                        { label: "Accent", css: "var(--brand-accent)" },
                        { label: "Purple", css: "var(--brand-purple)" },
                      ].map((sw) => (
                        <div
                          key={sw.label}
                          className="flex flex-col items-center gap-1.5"
                        >
                          <div
                            className="w-10 h-10 rounded-xl"
                            style={{ background: sw.css }}
                          />
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: "var(--text-3)" }}
                          >
                            {sw.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    Additional personalisation options (font size, density) will
                    be available in a future update.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
