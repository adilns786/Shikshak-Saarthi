"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { gsap } from "gsap";
import { auth, db as firestore } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { AppShell } from "@/components/ui/app-shell";
import { Bot, Send, RotateCcw, Eye, CheckCircle, Sparkles } from "lucide-react";

// Types
type Mapping = {
  id: string;
  value: string;
};

interface UserData {
  role: string;
  name?: string;
  full_name?: string;
  email: string;
  department?: string;
}

export default function LlmFormMapper() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [appliedIds, setAppliedIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(firestore, "users", user.uid));
        if (snap.exists()) setUserData(snap.data() as UserData);
      } catch {}
    });
    return () => unsub();
  }, []);

  function persistOne(map: Mapping) {
    try {
      const raw = localStorage.getItem("llm");
      const store: Record<string, string> = raw ? JSON.parse(raw) : {};
      store[map.id] = map.value;
      localStorage.setItem("llm", JSON.stringify(store));
      setAppliedIds((s) => ({ ...s, [map.id]: true }));
      const el = document.querySelector(`[data-id="${map.id}"]`);
      if (el) {
        gsap.fromTo(
          el,
          { scale: 0.97 },
          { scale: 1, duration: 0.3, ease: "back.out(1.4)" },
        );
      }
    } catch {
      setError("Failed to save to localStorage.");
    }
  }

  function applyAll() {
    try {
      const raw = localStorage.getItem("llm");
      const store: Record<string, string> = raw ? JSON.parse(raw) : {};
      mappings.forEach((m) => (store[m.id] = m.value));
      localStorage.setItem("llm", JSON.stringify(store));
      const newApplied: Record<string, boolean> = {};
      mappings.forEach((m) => (newApplied[m.id] = true));
      setAppliedIds(newApplied);
      if (listRef.current) {
        gsap.fromTo(
          listRef.current.children,
          { y: 4, opacity: 0.7 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.05 },
        );
      }
      setError(null);
    } catch {
      setError("Failed to save all mappings.");
    }
  }

  async function submitMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setMappings([]);
    setAppliedIds({});
    setError(null);
    try {
      const res = await fetch("/api/map-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.mappings)) {
        setMappings(data.mappings);
        if (listRef.current) {
          gsap.fromTo(
            listRef.current.children,
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, stagger: 0.06 },
          );
        }
      } else {
        setError("Unexpected response format from API.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch mappings.",
      );
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--brand-primary-subtle)" }}
          >
            <Bot
              className="w-5 h-5"
              style={{ color: "var(--brand-primary)" }}
            />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-1)" }}
            >
              AI Form Assistant
            </h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              Describe your data and get automatic field mappings
            </p>
          </div>
        </motion.div>

        {/* Input card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.07 }}
          className="rounded-2xl p-5 space-y-4"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles
              className="w-4 h-4"
              style={{ color: "var(--brand-primary)" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-2)" }}
            >
              Describe your information
            </span>
          </div>
          <textarea
            placeholder="e.g. I published a research paper titled 'Deep Learning for NLP' in IEEE Transactions in 2024..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitMessage();
              }
            }}
            className="w-full min-h-[120px] p-3 rounded-xl text-sm resize-none border-0 outline-none"
            style={{
              background: "var(--surface-base)",
              color: "var(--text-1)",
              border: "1px solid var(--border-default)",
            }}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => submitMessage()}
              disabled={loading || !message.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
              style={{
                background: "var(--brand-primary)",
                boxShadow: "var(--glow-primary)",
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4 rounded-full border-2 border-transparent"
                  style={{ borderTopColor: "#fff" }}
                />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? "Mappingâ€¦" : "Map Fields"}
            </button>
            <button
              onClick={() => {
                setMessage("");
                setMappings([]);
                setError(null);
                setAppliedIds({});
              }}
              className="p-2.5 rounded-xl transition-colors hover:opacity-70"
              style={{
                color: "var(--text-3)",
                background: "var(--border-subtle)",
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              Enter to submit Â· Shift+Enter for new line
            </p>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results header */}
        {(mappings.length > 0 || loading) && (
          <div className="flex items-center justify-between">
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-2)" }}
            >
              Suggested Mappings
              {mappings.length > 0 && (
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: "var(--brand-primary-subtle)",
                    color: "var(--brand-primary)",
                  }}
                >
                  {mappings.length}
                </span>
              )}
            </h3>
            {mappings.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={applyAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "var(--brand-primary)" }}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Apply All
                </button>
                <button
                  onClick={() => {
                    const raw = localStorage.getItem("llm") || "{}";
                    alert(
                      `Stored data:\n\n${JSON.stringify(JSON.parse(raw), null, 2)}`,
                    );
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                  style={{
                    background: "var(--border-subtle)",
                    color: "var(--text-2)",
                  }}
                >
                  <Eye className="w-3.5 h-3.5" /> View Stored
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mapping cards */}
        <div ref={listRef} className="space-y-3">
          <AnimatePresence>
            {mappings.map((m, idx) => (
              <motion.div
                data-id={m.id}
                key={m.id + "-" + idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.28 }}
                className="group rounded-2xl p-4 hover-lift"
                style={{
                  background: "var(--surface-1)",
                  border: `1px solid ${appliedIds[m.id] ? "var(--success)" : "var(--border-subtle)"}`,
                  boxShadow: "var(--shadow-1)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono"
                        style={{
                          background: "var(--border-subtle)",
                          color: "var(--text-3)",
                        }}
                      >
                        {m.id}
                      </span>
                      {appliedIds[m.id] && (
                        <span
                          className="flex items-center gap-1 text-[10px] font-semibold"
                          style={{ color: "var(--success)" }}
                        >
                          <CheckCircle className="w-3 h-3" /> Applied
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-1)" }}
                    >
                      {m.value}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => persistOne(m)}
                          disabled={Boolean(appliedIds[m.id])}
                          className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                          style={
                            appliedIds[m.id]
                              ? {
                                  background: "var(--success-bg)",
                                  color: "var(--success)",
                                }
                              : {
                                  background: "var(--brand-primary-subtle)",
                                  color: "var(--brand-primary)",
                                }
                          }
                        >
                          {appliedIds[m.id] ? "Applied" : "Apply"}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save {m.id} to localStorage</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {mappings.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-10 text-center"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Bot
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "var(--text-4)" }}
            />
            <p className="font-medium" style={{ color: "var(--text-2)" }}>
              No mappings yet
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
              Enter a description above and the AI will suggest form field
              mappings.
            </p>
          </motion.div>
        )}

        <p
          className="text-xs text-center pb-4"
          style={{ color: "var(--text-4)" }}
        >
          Mappings are saved to <code>localStorage["llm"]</code> and applied to
          PBAS forms automatically.
        </p>
      </div>
    </AppShell>
  );
}
