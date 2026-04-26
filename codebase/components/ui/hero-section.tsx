"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Shield,
  BarChart3,
} from "lucide-react";

const heroTexts = [
  "Automated PBAS Data Management System",
  "Streamlining PBAS Form Submissions",
  "Ensuring Transparency and Efficiency",
  "Empowering VESIT Faculty Excellence",
];

const features = [
  {
    icon: BookOpen,
    title: "Comprehensive Evaluation",
    description:
      "Multi-dimensional assessment covering teaching, research, and community service activities.",
    color: "var(--brand-primary)",
    bg: "var(--brand-primary-subtle)",
  },
  {
    icon: Users,
    title: "Collaborative Platform",
    description:
      "Seamless interaction between faculty, HODs, and administrators for transparent decision-making.",
    color: "var(--brand-accent)",
    bg: "var(--brand-accent-subtle)",
  },
  {
    icon: TrendingUp,
    title: "Data-Driven Insights",
    description:
      "Real-time analytics dashboards and AI-powered reports for informed institutional decisions.",
    color: "var(--brand-purple)",
    bg: "var(--brand-purple-subtle)",
  },
];

const stats = [
  { value: "500+", label: "Faculty Members" },
  { value: "8", label: "Departments" },
  { value: "98%", label: "Accuracy Rate" },
  { value: "3x", label: "Faster Submissions" },
];

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export function HeroSection() {
  return (
    /* Force light theme on the whole landing page regardless of OS preference */
    <div className="light-page min-h-screen" id="top">
      {/* â”€â”€ Nav bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-10 h-16"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px) saturate(1.8)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #ff5c35 0%, #c73210 100%)",
              boxShadow: "0 4px 14px rgba(255,92,53,0.35)",
            }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-gray-900">
              Shikshak Sarthi
            </p>
            <p className="text-[10px] text-gray-500 leading-none">
              PBAS Management Platform
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#stats" className="hover:text-gray-900 transition-colors">
            Stats
          </a>
          <a href="#roles" className="hover:text-gray-900 transition-colors">
            Roles
          </a>
        </nav>

        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
          style={{
            background: "#ff5c35",
            boxShadow: "0 4px 14px rgba(255,92,53,0.35)",
          }}
        >
          Sign in
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative pt-20 pb-16 px-6 sm:px-10 overflow-hidden">
        {/* Gradient blobs */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #ff5c35 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #7c5cfc 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "rgba(255,92,53,0.1)",
              color: "#ff5c35",
              border: "1px solid rgba(255,92,53,0.2)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            VESIT &middot; PBAS Data Management Platform
          </motion.div>

          {/* VESIT logo */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <img
              src="https://vesit.ves.ac.in/navbar2024nobackground.png"
              alt="VESIT Logo"
              className="h-16 w-auto mx-auto mb-6 object-contain"
            />
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            PBAS Data,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #ff5c35 0%, #e04020 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Simplified
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            The automated PBAS &amp; data management platform streamlines
            faculty data submission for VESIT &mdash; from PBAS forms to
            AI-powered insights &mdash; giving administrators real-time,
            transparent reports.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #ff5c35 0%, #c73210 100%)",
                boxShadow: "0 6px 20px rgba(255,92,53,0.4)",
              }}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-white transition-all hover:bg-gray-50 active:scale-[0.97]"
              style={{ border: "1px solid rgba(0,0,0,0.1)" }}
            >
              Learn more
            </a>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ Stats strip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="stats" className="py-12 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl"
            style={{ background: "rgba(0,0,0,0.06)" }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                variants={FADE_UP}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex flex-col items-center py-8 px-4 bg-white"
              >
                <span
                  className="text-4xl font-extrabold mb-1"
                  style={{ color: "#ff5c35" }}
                >
                  {s.value}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="features" className="py-16 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "#ff5c35" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Why Shikshak Sarthi?
            </motion.p>
            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Everything faculty need, in one place
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={FADE_UP}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="rounded-2xl p-6 bg-white hover-lift"
                style={{
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: f.bg }}
                >
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ Roles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="roles" className="py-16 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Designed for every role
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                role: "Faculty",
                color: "#ff5c35",
                bg: "rgba(255,92,53,0.08)",
                items: [
                  "Fill PBAS forms digitally",
                  "Log publications & seminars",
                  "Track submission status",
                  "Get AI assistance",
                ],
              },
              {
                icon: Shield,
                role: "HOD",
                color: "#00c48c",
                bg: "rgba(0,196,140,0.08)",
                items: [
                  "Review department faculty",
                  "Verify PBAS submissions",
                  "Analytics dashboard",
                  "Export reports",
                ],
              },
              {
                icon: BarChart3,
                role: "Administrator",
                color: "#7c5cfc",
                bg: "rgba(124,92,252,0.08)",
                items: [
                  "Manage all users & roles",
                  "Institution-wide analytics",
                  "Configure deadlines",
                  "Audit activity logs",
                ],
              },
            ].map((r, i) => (
              <motion.div
                key={r.role}
                custom={i}
                variants={FADE_UP}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="rounded-2xl p-6 bg-white"
                style={{
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: r.bg }}
                >
                  <r.icon className="w-6 h-6" style={{ color: r.color }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {r.role}
                </h3>
                <ul className="space-y-2">
                  {r.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-gray-500"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: r.color }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ CTA banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 px-6 sm:px-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl p-10 text-center text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #ff5c35 0%, #c73210 100%)",
              boxShadow: "0 20px 60px rgba(255,92,53,0.35)",
            }}
          >
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 pointer-events-none"
              style={{
                background: "rgba(255,255,255,0.4)",
                filter: "blur(40px)",
              }}
            />
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
            <p className="text-white/80 mb-7 max-w-md mx-auto">
              Sign in with your VESIT credentials and experience a smarter way
              to manage your PBAS data and faculty records.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-white text-gray-900 transition-all hover:bg-gray-50 active:scale-[0.97]"
            >
              Go to Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer
        className="py-8 px-6 sm:px-10 text-center text-sm text-gray-400"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        &copy; {new Date().getFullYear()} Vivekanand Education Society&apos;s
        Institute of Technology &mdash; Shikshak Sarthi
      </footer>
    </div>
  );
}
