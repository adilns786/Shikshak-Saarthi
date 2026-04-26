"use client";

import { useState } from "react";
import { auth, db as firestore } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  CheckCircle,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const DEPARTMENTS = [
  "Electronics & Computer Science",
  "Computer",
  "Automation & Robotics",
  "Electronics and Telecommunication",
  "Information Technology",
  "AI and Data Science",
  "Humanities and Applied Sciences(FE)",
];

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "faculty",
    department: "",
    employeeId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }
    if (!formData.department) {
      setError("Please select a department.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      await setDoc(doc(firestore, "users", userCredential.user.uid), {
        email: formData.email,
        name: formData.fullName,
        full_name: formData.fullName,
        role: formData.role,
        department: formData.department,
        employee_id: formData.employeeId || "",
        designation: "Faculty",
        phone: "",
        created_at: new Date().toISOString(),
        is_active: true,
      });

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      if (msg.includes("email-already-in-use")) {
        setError("This email is already registered.");
      } else if (msg.includes("invalid-email")) {
        setError("Invalid email address.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--surface-base)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 px-6"
        >
          <div
            className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: "var(--success-bg)" }}
          >
            <CheckCircle
              className="w-10 h-10"
              style={{ color: "var(--success)" }}
            />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
            Account Created!
          </h2>
          <p style={{ color: "var(--text-3)" }}>Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--surface-base)" }}
    >
      {/* â”€â”€ Left panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10 overflow-hidden relative"
        style={{
          background:
            "linear-gradient(145deg, var(--brand-primary) 0%, #c73210 100%)",
        }}
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: "rgba(255,255,255,0.35)", filter: "blur(48px)" }}
        />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">
              Shikshak Sarthi
            </p>
            <p className="text-white/70 text-xs">Faculty Appraisal System</p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Join VESIT Faculty Portal
          </h2>
          <p className="text-white/75 text-sm leading-relaxed">
            Create your account to start managing your performance appraisal,
            publications, and professional development activities.
          </p>
          <div className="space-y-3 pt-2">
            {[
              "Access PBAS form management",
              "Track research publications",
              "Monitor appraisal status",
              "Get AI-powered assistance",
            ].map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <CheckCircle className="w-4 h-4 text-white/80 shrink-0" />
                <span className="text-white/75 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <img
            src="https://vesit.ves.ac.in/navbar2024nobackground.png"
            alt="VESIT"
            className="h-10 w-auto object-contain opacity-70"
          />
        </div>
      </motion.div>

      {/* â”€â”€ Right panel â€“ form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--brand-primary)",
              boxShadow: "var(--glow-primary)",
            }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <p className="font-bold text-base" style={{ color: "var(--text-1)" }}>
            Shikshak Sarthi
          </p>
        </div>

        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
            style={{ color: "var(--text-3)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>

          <div className="mb-6">
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: "var(--text-1)" }}
            >
              Create account
            </h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
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
                htmlFor="fullName"
                className="text-sm font-medium"
                style={{ color: "var(--text-2)" }}
              >
                Full name *
              </Label>
              <Input
                id="fullName"
                placeholder="Dr. John Doe"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="signup-email"
                className="text-sm font-medium"
                style={{ color: "var(--text-2)" }}
              >
                Email address *
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="your.email@ves.ac.in"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="department"
                className="text-sm font-medium"
                style={{ color: "var(--text-2)" }}
              >
                Department *
              </Label>
              <Select
                value={formData.department}
                onValueChange={(v) => handleInputChange("department", v)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="employeeId"
                className="text-sm font-medium"
                style={{ color: "var(--text-2)" }}
              >
                Employee ID
              </Label>
              <Input
                id="employeeId"
                placeholder="EMP12345 (optional)"
                value={formData.employeeId}
                onChange={(e) =>
                  handleInputChange("employeeId", e.target.value)
                }
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="signup-password"
                className="text-sm font-medium"
                style={{ color: "var(--text-2)" }}
              >
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                  disabled={isLoading}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-3)" }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium"
                style={{ color: "var(--text-2)" }}
              >
                Confirm password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required
                  disabled={isLoading}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-3)" }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-2"
              style={{
                background: "var(--brand-primary)",
                color: "#fff",
                boxShadow: "var(--glow-primary)",
              }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-5 h-5 rounded-full border-2 border-white/30"
                  style={{ borderTopColor: "#fff" }}
                />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create account
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </>
              )}
            </button>
          </form>

          <p
            className="mt-5 text-center text-sm"
            style={{ color: "var(--text-3)" }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold hover:underline"
              style={{ color: "var(--brand-primary)" }}
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
