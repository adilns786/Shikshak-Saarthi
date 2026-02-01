"use client";

import { useState, useEffect } from "react";
import { auth, db as firestore } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, LogIn, CheckCircle, Users, Shield, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Dev Users for Testing
const DEV_USERS = [
  {
    email: "d2022.darshan.khapekar@ves.ac.in",
    password: "123456789",
    role: "Faculty",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
  },
  {
    email: "admin@ves.ac.in",
    password: "123456789",
    role: "Admin",
    icon: Shield,
    color: "from-purple-500 to-pink-500",
  },
  {
    email: "nupur.giri@ves.ac.in",
    password: "123456789",
    role: "HOD",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
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
    // read url params on client without using next/navigation hooks (avoids SSR/suspense issues)
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("resetSuccess") === "true") setResetSuccess(true);
    } catch (e) {
      // ignore during prerender
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("✅ User already logged in:", data?.role);
            // Don't redirect here to prevent loop
          }
        } catch (err) {
          console.error("Error:", err);
        }
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(firestore, "users", user.uid));

      if (!userDoc.exists()) {
        setError("User profile not found. Please contact administration.");
        await auth.signOut();
        return;
      }

      const userData = userDoc.data();
      console.log("✅ Login successful, role:", userData.role);

      if (userData.role === "misAdmin" || userData.role === "admin") {
        router.push("/admin/appraisals");
      } else if (userData.role === "hod") {
        router.push("/hod/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      if (errorMessage.includes("auth/invalid-credential") || errorMessage.includes("auth/wrong-password")) {
        setError("Invalid email or password");
      } else if (errorMessage.includes("auth/user-not-found")) {
        setError("No account found with this email");
      } else if (errorMessage.includes("auth/too-many-requests")) {
        setError("Too many failed attempts. Please try again later");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 border-4 border-t-transparent border-blue-400 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white space-y-6 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="h-16 w-16 text-yellow-400 mb-4" />
          </motion.div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Shikshak Sarthi
          </h1>
          <p className="text-xl text-gray-300">Faculty Performance Appraisal System</p>
          <div className="space-y-3">
            {[
              "Streamlined PBAS Form Management",
              "AI-Powered Insights",
              "Real-time Analytics",
              "Secure & Reliable",
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * index + 0.5 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-bold text-white">Welcome Back</CardTitle>
              <CardDescription className="text-gray-300">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3 flex items-start gap-2"
                >
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-300">
                    Password reset successful! You can now login with your new password.
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-300"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@ves.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Link
                    href="/auth/forgot"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-6 rounded-lg shadow-lg transform transition-all hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-5 w-5 border-2 border-t-transparent border-white rounded-full"
                    />
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              {/* Quick Login Buttons */}
              <div className="mt-6">
                <p className="text-xs text-center text-gray-400 mb-3">Quick Login (Testing):</p>
                <div className="grid grid-cols-3 gap-2">
                  {DEV_USERS.map((user, index) => {
                    const Icon = user.icon;
                    return (
                      <motion.button
                        key={user.email}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={async () => {
                          setEmail(user.email);
                          setPassword(user.password);
                          setLoading(true);
                          try {
                            const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
                            const userDoc = await getDoc(doc(firestore, "users", userCredential.user.uid));
                            if (userDoc.exists()) {
                              const userData = userDoc.data();
                              if (userData.role === "misAdmin" || userData.role === "admin") {
                                router.push("/admin/appraisals");
                              } else if (userData.role === "hod") {
                                router.push("/hod/dashboard");
                              } else {
                                router.push("/dashboard");
                              }
                            }
                          } catch (err: unknown) {
                            const errorMessage = err instanceof Error ? err.message : "Login failed";
                            setError(errorMessage);
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className={`p-3 rounded-lg bg-gradient-to-r ${user.color} hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-2 rounded-full bg-white/20">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-xs font-medium text-white">{user.role}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
