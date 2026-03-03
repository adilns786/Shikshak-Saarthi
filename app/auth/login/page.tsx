"use client";

import { useState, useEffect } from "react";
import { auth, db as firestore } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  LogIn,
  CheckCircle,
  Users,
  Shield,
  Crown,
  GraduationCap,
  ArrowRight,
  BookOpen,
  BarChart3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const DEV_USERS = [
  {
    email: "d2022.darshan.khapekar@ves.ac.in",
    password: "123456789",
    role: "Faculty",
    icon: Users,
    color: "var(--brand-primary)",
    bg: "var(--brand-primary-subtle)",
  },
  {
    email: "admin@ves.ac.in",
    password: "123456789",
    role: "Admin",
    icon: Shield,
    color: "var(--brand-purple)",
    bg: "var(--brand-purple-subtle)",
  },
  {
    email: "nupur.giri@ves.ac.in",
    password: "123456789",
    role: "HOD",
    icon: Crown,
    color: "var(--brand-accent)",
    bg: "var(--brand-accent-subtle)",
  },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "PBAS Form Management",
    desc: "Streamlined data entry with intelligent form assistance",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    desc: "Get smart suggestions and analysis for your PBAS data",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    desc: "Visual dashboards for performance tracking and reporting",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("resetSuccess") === "true") setResetSuccess(true);
    } catch (_) {}
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(firestore, "users", user.uid));
          if (snap.exists()) {
            const data = snap.data();
            if (data.role === "misAdmin" || data.role === "admin") {
              router.replace("/admin/dashboard");
            } else if (data.role === "hod") {
              router.replace("/hod/dashboard");
            } else {
              router.replace("/dashboard");
            }
            return;
          }
        } catch (_) {}
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  const doLogin = async (em: string, pw: string) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, em, pw);
      const snap = await getDoc(doc(firestore, "users", cred.user.uid));
      if (!snap.exists()) {
        setError("User profile not found. Contact administration.");
        await auth.signOut();
        setLoading(false);
        return;
      }
      const data = snap.data();
      if (data.role === "misAdmin" || data.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.role === "hod") {
        router.push("/hod/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (
        msg.includes("invalid-credential") ||
        msg.includes("wrong-password")
      ) {
        setError("Invalid email or password.");
      } else if (msg.includes("user-not-found")) {
        setError("No account found with this email.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many failed attempts. Try again later.");
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && email && password) {
      doLogin(email, password);
    }
  };

  if (checkingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--surface-base)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--brand-primary)" }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--surface-base)" }}
    >
      {/* ── Left decorative panel ─────────────────────────── */}
      <motion.div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-10 overflow-hidden relative"
        style={{
          background:
            "linear-gradient(145deg, var(--brand-primary) 0%, #c73210 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Decorative blobs with optimized animation */}
        <motion.div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: "rgba(255,255,255,0.35)", filter: "blur(48px)" }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full opacity-15 pointer-events-none"
          style={{ background: "rgba(255,255,255,0.45)", filter: "blur(56px)" }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">
              Shikshak Sarthi
            </p>
            <p className="text-white/70 text-xs">
              PBAS Data Management Platform
            </p>
          </div>
        </motion.div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Welcome back to VESIT Faculty Portal
            </h2>
            <p className="text-white/75 text-base leading-relaxed">
              Your centralised hub for PBAS data management, research tracking,
              and professional development.
            </p>
          </motion.div>

          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="flex items-start gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.4 + i * 0.08,
                  duration: 0.4,
                }}
              >
                <div className="mt-0.5 w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <f.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-white/65 text-xs leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* VESIT watermark */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <img
            src="https://vesit.ves.ac.in/navbar2024nobackground.png"
            alt="VESIT"
            className="h-10 w-auto object-contain opacity-70"
          />
        </motion.div>
      </motion.div>

      {/* ── Right panel – form ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 overflow-y-auto">
        {/* Mobile logo */}
        <motion.div
          className="lg:hidden flex items-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--brand-primary)",
              boxShadow: "var(--glow-primary)",
            }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p
              className="font-bold text-base"
              style={{ color: "var(--text-1)" }}
            >
              Shikshak Sarthi
            </p>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              PBAS Data Management Platform
            </p>
          </div>
        </motion.div>

        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: "var(--text-1)" }}
            >
              Sign in
            </h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Reset success */}
          <AnimatePresence mode="wait">
            {resetSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
                style={{
                  background: "var(--success-bg)",
                  color: "var(--success)",
                }}
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                Password reset successful! You can now sign in.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: "var(--error-bg)",
                    color: "var(--error)",
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium"
                style={{ color: "var(--text-2)" }}
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@ves.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium"
                  style={{ color: "var(--text-2)" }}
                >
                  Password
                </Label>
                <Link
                  href="/auth/forgot"
                  className="text-xs font-medium hover:underline transition-colors"
                  style={{ color: "var(--brand-primary)" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                  style={{ color: "var(--text-3)" }}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "var(--brand-primary)",
                color: "#fff",
                boxShadow: "var(--glow-primary)",
              }}
              whileHover={
                !loading && email && password ? { scale: 1.01 } : undefined
              }
              whileTap={
                !loading && email && password ? { scale: 0.98 } : undefined
              }
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-5 h-5 rounded-full border-2 border-white/30"
                  style={{ borderTopColor: "#fff" }}
                />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full"
                style={{ borderTop: "1px solid var(--border-default)" }}
              />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-3 text-xs"
                style={{
                  background: "var(--surface-base)",
                  color: "var(--text-3)",
                }}
              >
                Quick login for testing
              </span>
            </div>
          </div>

          {/* Dev quick-login cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {DEV_USERS.map((u, index) => {
              const Icon = u.icon;
              return (
                <motion.button
                  key={u.email}
                  onClick={() => doLogin(u.email, u.password)}
                  disabled={loading}
                  className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: u.bg, borderColor: "transparent" }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (!loading) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        u.color;
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(0)";
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
                  whileTap={!loading ? { scale: 0.95 } : undefined}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: u.color }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: u.color }}
                  >
                    {u.role}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Sign-up link */}
          <motion.p
            className="mt-6 text-center text-sm"
            style={{ color: "var(--text-3)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold hover:underline transition-colors"
              style={{ color: "var(--brand-primary)" }}
            >
              Create account
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
