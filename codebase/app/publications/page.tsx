"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { AppShell } from "@/components/ui/app-shell";
import { motion } from "framer-motion";
import {
  BookOpen,
  ExternalLink,
  CalendarDays,
  Award,
  Filter,
} from "lucide-react";

interface UserData {
  role: string;
  name?: string;
  full_name?: string;
  email: string;
  department?: string;
}

interface Publication {
  id: string;
  title?: string;
  journal?: string;
  year?: string | number;
  type?: string;
  authors?: string;
  doi?: string;
  publisher?: string;
  conference?: string;
}

function mapTable2Rows(raw: Record<string, unknown>[], prefix: string): Publication[] {
  return raw.map((p, idx) => {
    const title = (p.title ?? p.paper_title ?? p.book_title) as string | undefined;
    const journal = (p.journal_name ??
      p.conference_name ??
      p.publisher ??
      p.journal ??
      p.conference) as string | undefined;
    const inferredType = (p.type ??
      (p.publisher ? "book" : p.journal_name || p.journal ? "journal" : "conference")) as
      | string
      | undefined;

    return {
      id: `${prefix}-${idx}`,
      title,
      journal,
      year: (p.year ?? p.year_of_publication) as string | number | undefined,
      type: inferredType,
      authors: (p.authors ?? p.authorship) as string | undefined,
      doi: (p.doi ?? p.link) as string | undefined,
      publisher: p.publisher as string | undefined,
      conference: p.conference as string | undefined,
    };
  });
}

function toRowArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).filter(
      (v) => !!v && typeof v === "object",
    ) as Record<string, unknown>[];
  }
  return [];
}

function publicationKey(p: Record<string, unknown>): string {
  const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();
  return [
    norm(p.title ?? p.paper_title ?? p.book_title),
    norm(
      p.journal_name ?? p.conference_name ?? p.publisher ?? p.journal ?? p.conference,
    ),
    norm(p.year ?? p.year_of_publication),
    norm(p.type),
    norm(p.doi ?? p.link),
    norm(p.isbn),
  ].join("|");
}

async function fetchLegacyRowsForUser(uid: string): Promise<Record<string, unknown>[]> {
  const merged = new Map<string, Record<string, unknown>>();
  const addRows = (rows: Record<string, unknown>[]) => {
    rows.forEach((row) => {
      const key = publicationKey(row);
      if (!merged.has(key)) merged.set(key, row);
    });
  };

  const userKeyCandidates = ["user_id", "userId", "uid", "faculty_id"];

  // Legacy case: document id itself equals firebase uid
  try {
    const byId = await getDoc(doc(firestore, "pbas_forms", uid));
    if (byId.exists()) {
      const data = byId.data();
      const rows = [
        ...toRowArray(
          data.part_b?.table2?.researchPapers ?? data.part_b?.table2?.research_papers,
        ),
        ...toRowArray(
          data.part_b?.table2?.publications ??
            data.part_b?.table2?.publication ??
            data.part_b?.table2?.booksPublications,
        ),
      ];
      addRows(rows);
    }
  } catch {
    // optional fallback path
  }

  for (const key of userKeyCandidates) {
    try {
      const qSnap = await getDocs(
        query(collection(firestore, "pbas_forms"), where(key, "==", uid)),
      );
      qSnap.docs.forEach((d) => {
        const data = d.data();
        const rows = [
          ...toRowArray(
            data.part_b?.table2?.researchPapers ??
              data.part_b?.table2?.research_papers,
          ),
          ...toRowArray(
            data.part_b?.table2?.publications ??
              data.part_b?.table2?.publication ??
              data.part_b?.table2?.booksPublications,
          ),
        ];
        addRows(rows);
      });
    } catch {
      // missing index/rules for a key should not block others
    }
  }

  // Legacy standalone collection for publication docs
  for (const key of userKeyCandidates) {
    try {
      const qSnap = await getDocs(
        query(collection(firestore, "publications"), where(key, "==", uid)),
      );
      qSnap.docs.forEach((d) => {
        addRows([d.data() as Record<string, unknown>]);
      });
    } catch {
      // optional collection
    }
  }

  return [...merged.values()];
}

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  journal: { color: "var(--brand-primary)", bg: "var(--brand-primary-subtle)" },
  conference: {
    color: "var(--brand-purple)",
    bg: "var(--brand-purple-subtle)",
  },
  book: { color: "var(--brand-accent)", bg: "var(--brand-accent-subtle)" },
  patent: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
};

export default function PublicationsPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      try {
        const snap = await getDoc(doc(firestore, "users", user.uid));
        const userDocData = snap.exists() ? snap.data() : null;
        if (userDocData) {
          setUserData(userDocData as UserData);
        }

        // Primary source: same location used by /dashboard/forms/part-b/table2
        const table2 = userDocData?.part_b?.table2 ?? {};
        const partBOtherPublications = toRowArray(userDocData?.part_b?.publications_other);
        const table2Rows = [
          ...toRowArray(table2.researchPapers ?? table2.research_papers),
          ...toRowArray(
            table2.publications ??
              table2.publication ??
              table2.booksPublications,
          ),
          ...partBOtherPublications,
        ];

        if (table2Rows.length > 0) {
          setPublications(mapTable2Rows(table2Rows, `users-${user.uid}`));
        } else {
          // Legacy fallback for older records / alternate collections
          try {
            const raw = await fetchLegacyRowsForUser(user.uid);
            setPublications(mapTable2Rows(raw, `legacy-${user.uid}`));
          } catch {
            /* optional */
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--surface-base)" }}
      >
        <div className="w-full max-w-3xl px-6 space-y-4">
          <div className="w-40 h-6 rounded-xl skeleton-shimmer" />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 space-y-3"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="w-3/4 h-5 rounded-lg skeleton-shimmer" />
              <div className="w-1/2 h-3.5 rounded-lg skeleton-shimmer" />
              <div className="w-24 h-3 rounded-lg skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayName =
    userData?.full_name ?? userData?.name ?? userData?.email ?? "User";
  const filtered =
    filter === "all"
      ? publications
      : publications.filter((p) => (p.type ?? "").toLowerCase() === filter);
  const types = Array.from(
    new Set(publications.map((p) => (p.type ?? "other").toLowerCase())),
  );
  const cardStyle = {
    background: "var(--surface-1)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-1)",
  };

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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--brand-primary-subtle)" }}
            >
              <BookOpen
                className="w-5 h-5"
                style={{ color: "var(--brand-primary)" }}
              />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--text-1)" }}
              >
                Publications
              </h1>
              <p className="text-sm" style={{ color: "var(--text-3)" }}>
                {publications.length} total records
              </p>
            </div>
          </div>
          <a
            href="/dashboard/forms/part-b/table2"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "var(--brand-primary)",
              boxShadow: "var(--glow-primary)",
            }}
          >
            Add <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>

        {/* Filter chips */}
        {types.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <Filter className="w-4 h-4" style={{ color: "var(--text-3)" }} />
            {["all", ...types].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                style={
                  filter === t
                    ? { background: "var(--brand-primary)", color: "#fff" }
                    : {
                        background: "var(--border-subtle)",
                        color: "var(--text-2)",
                      }
                }
              >
                {t}
              </button>
            ))}
          </motion.div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-10 text-center"
            style={cardStyle}
          >
            <Award
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "var(--text-4)" }}
            />
            <p className="font-medium" style={{ color: "var(--text-2)" }}>
              No publications found
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
              Add your research papers via the PBAS Forms.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((pub, i) => {
              const tc = TYPE_COLORS[(pub.type ?? "").toLowerCase()] ?? {
                color: "var(--text-2)",
                bg: "var(--border-subtle)",
              };
              return (
                <motion.div
                  key={pub.id}
                  custom={i}
                  variants={FADE_UP}
                  initial="hidden"
                  animate="show"
                  className="rounded-2xl p-5 hover-lift"
                  style={cardStyle}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: tc.bg, color: tc.color }}
                        >
                          {pub.type ?? "paper"}
                        </span>
                        {pub.year && (
                          <span
                            className="flex items-center gap-1 text-[11px]"
                            style={{ color: "var(--text-3)" }}
                          >
                            <CalendarDays className="w-3 h-3" /> {pub.year}
                          </span>
                        )}
                      </div>
                      <h3
                        className="text-sm font-semibold leading-snug"
                        style={{ color: "var(--text-1)" }}
                      >
                        {pub.title || "Untitled"}
                      </h3>
                      {pub.journal && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: "var(--text-3)" }}
                        >
                          {pub.journal}
                        </p>
                      )}
                      {pub.authors && (
                        <p
                          className="text-xs mt-0.5 italic"
                          style={{ color: "var(--text-4)" }}
                        >
                          {pub.authors}
                        </p>
                      )}
                    </div>
                    {pub.doi && (
                      <a
                        href={
                          pub.doi.startsWith("http")
                            ? pub.doi
                            : `https://doi.org/${pub.doi}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-1.5 rounded-lg transition-colors hover:opacity-70"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
