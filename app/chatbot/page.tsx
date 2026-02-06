"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { gsap } from "gsap";

// Types
type Mapping = {
  id: string;
  value: string;
};

export default function LlmFormMapper() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [appliedIds, setAppliedIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // helper: persist a single mapping to localStorage key `llm`
  function persistOne(map: Mapping) {
    try {
      const raw = localStorage.getItem("llm");
      let store: Record<string, string> = raw ? JSON.parse(raw) : {};
      store[map.id] = map.value;
      localStorage.setItem("llm", JSON.stringify(store));
      setAppliedIds((s) => ({ ...s, [map.id]: true }));

      // tiny gsap pop animation on list
      const el = document.querySelector(`[data-id="${map.id}"]`);
      if (el) {
        gsap.fromTo(
          el,
          { scale: 0.96, boxShadow: "0 0 0 rgba(0,0,0,0)" },
          { scale: 1, boxShadow: "0 8px 20px rgba(0,0,0,0.08)", duration: 0.35 }
        );
      }
    } catch (err) {
      console.error("Error persisting to localStorage:", err);
      setError(
        "Failed to save to localStorage. Please check browser settings."
      );
    }
  }

  // apply all mappings
  function applyAll() {
    try {
      const raw = localStorage.getItem("llm");
      let store: Record<string, string> = raw ? JSON.parse(raw) : {};
      mappings.forEach((m) => (store[m.id] = m.value));
      localStorage.setItem("llm", JSON.stringify(store));
      const newApplied: Record<string, boolean> = {};
      mappings.forEach((m) => (newApplied[m.id] = true));
      setAppliedIds(newApplied);

      // gsap stagger highlight
      if (listRef.current) {
        gsap.fromTo(
          listRef.current.children,
          { y: 6, opacity: 0.6 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.06 }
        );
      }
      setError(null);
    } catch (err) {
      console.error("Error applying all mappings:", err);
      setError("Failed to save all mappings to localStorage.");
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

      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Received response from API:", data);
      // expect data.mappings to be array of {id, value}
      if (Array.isArray(data.mappings)) {
        setMappings(data.mappings);
        // animate in
        if (listRef.current) {
          gsap.fromTo(
            listRef.current.children,
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, stagger: 0.06 }
          );
        }
      } else {
        console.warn("Unexpected response from /api/map-fields", data);
        setError("Received unexpected response format from API.");
      }
    } catch (err) {
      console.error("Error fetching mappings:", err);
      setError(
        err instanceof Error
          ? `Failed to fetch mappings: ${err.message}`
          : "Failed to fetch mappings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function viewStored() {
    try {
      const raw = localStorage.getItem("llm") || "{}";
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, 2);
      alert(`Stored data in localStorage:\n\n${formatted}`);
    } catch (err) {
      console.error("Error reading localStorage:", err);
      setError("Failed to read from localStorage.");
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Form Mapper — LLM Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <textarea
              placeholder="Type a message to map to form fields..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full min-h-[120px] p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex gap-3">
              <Button onClick={() => submitMessage()} disabled={loading}>
                {loading ? "Mapping..." : "Map"}
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setMessage("");
                  setMappings([]);
                  setError(null);
                }}
              >
                Clear
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Enter a free-text sentence. The assistant will suggest field
              mappings. Click "Apply" to save each mapping to localStorage (key:{" "}
              <code>llm</code>).
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Suggested Mappings</h3>
        <div className="flex gap-2">
          <Button onClick={applyAll} disabled={mappings.length === 0}>
            Apply All
          </Button>
          <Button variant="outline" onClick={viewStored}>
            View Stored
          </Button>
        </div>
      </div>

      <div ref={listRef} className="grid gap-3">
        <AnimatePresence>
          {mappings.map((m, idx) => (
            <motion.div
              data-id={m.id}
              key={m.id + "-" + idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, delay: idx * 0.03 }}
              className="group relative border rounded-lg p-4 hover:shadow-md bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm text-muted-foreground">ID</span>
                    <strong className="font-mono text-sm">{m.id}</strong>
                  </div>
                  <div className="mt-2">
                    <div className="text-base font-medium">{m.value}</div>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => persistOne(m)}
                          disabled={Boolean(appliedIds[m.id])}
                        >
                          {appliedIds[m.id] ? "Applied" : "Apply"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Apply {m.id}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {mappings.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No mappings yet. Enter a message to get started.</p>
        </div>
      )}

      <div className="mt-6 text-sm text-muted-foreground">
        <p>
          Stored mappings are available in{" "}
          <code>localStorage.getItem('llm')</code> as a JSON object mapping IDs
          → values.
        </p>
      </div>
    </div>
  );
}
