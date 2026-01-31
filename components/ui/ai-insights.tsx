"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Bot,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Target,
  Award,
  BookOpen,
  Briefcase,
  RefreshCw,
} from "lucide-react";

interface AIInsight {
  id: string;
  type: "recommendation" | "analysis" | "warning" | "achievement";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "teaching" | "research" | "service" | "overall";
  icon?: any;
}

interface ProfileData {
  name?: string;
  department?: string;
  designation?: string;
  part_a?: any;
  part_b?: any;
}

interface AIInsightsProps {
  profileData: ProfileData;
  className?: string;
}

const typeIcons = {
  recommendation: Lightbulb,
  analysis: TrendingUp,
  warning: AlertCircle,
  achievement: Award,
};

const priorityColors = {
  high: "border-red-200 bg-red-50 dark:bg-red-900/20",
  medium: "border-amber-200 bg-amber-50 dark:bg-amber-900/20",
  low: "border-green-200 bg-green-50 dark:bg-green-900/20",
};

const categoryIcons = {
  teaching: BookOpen,
  research: Briefcase,
  service: Target,
  overall: Sparkles,
};

export function AIInsights({ profileData, className = "" }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    generateInsights();
  }, [profileData]);

  const generateInsights = async () => {
    setLoading(true);
    
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newInsights: AIInsight[] = [];
    const partB = profileData.part_b || {};
    const partA = profileData.part_a || {};

    // Analyze research papers
    const researchPapers = partB.table2?.researchPapers || [];
    const publications = partB.table2?.publications || [];
    const totalPubs = researchPapers.length + publications.length;

    if (totalPubs === 0) {
      newInsights.push({
        id: "pub-1",
        type: "warning",
        title: "No Publications Found",
        description:
          "Start documenting your research papers and publications to improve your API score. Consider targeting Q1/Q2 journals in your field.",
        priority: "high",
        category: "research",
      });
    } else if (totalPubs < 3) {
      newInsights.push({
        id: "pub-2",
        type: "recommendation",
        title: "Increase Publication Output",
        description: `You have ${totalPubs} publication(s). Consider collaborative research to boost your publication count. Target 3-5 publications per year for optimal API score.`,
        priority: "medium",
        category: "research",
      });
    } else {
      newInsights.push({
        id: "pub-3",
        type: "achievement",
        title: "Strong Publication Record",
        description: `Great job! You have ${totalPubs} publications. Focus on high-impact journals to maximize your citations.`,
        priority: "low",
        category: "research",
      });
    }

    // Analyze research projects
    const projects = partB.table2?.researchProjects || [];
    const consultancy = partB.table2?.consultancyProjects || [];
    const totalProjects = projects.length + consultancy.length;

    if (totalProjects === 0) {
      newInsights.push({
        id: "proj-1",
        type: "recommendation",
        title: "Apply for Research Grants",
        description:
          "Consider applying for research projects from agencies like DST, AICTE, UGC, or industry consultancy to strengthen your profile.",
        priority: "medium",
        category: "research",
      });
    } else {
      const totalFunding = projects.reduce((acc: number, p: any) => {
        return acc + (parseFloat(String(p.amount).replace(/[^0-9.-]/g, "")) || 0);
      }, 0);

      if (totalFunding > 1000000) {
        newInsights.push({
          id: "proj-2",
          type: "achievement",
          title: "Major Research Funding",
          description: `Excellent! You have secured ₹${(totalFunding / 100000).toFixed(2)} Lakhs in research funding. This significantly boosts your API score.`,
          priority: "low",
          category: "research",
        });
      }
    }

    // Analyze patents
    const patents = partB.patents || partB.patents_policy_awards?.filter((p: any) => p.type === "patent") || [];
    if (patents.length > 0) {
      newInsights.push({
        id: "pat-1",
        type: "achievement",
        title: "Innovation Leader",
        description: `You have ${patents.length} patent(s). This demonstrates strong innovation capabilities and significantly contributes to your API score.`,
        priority: "low",
        category: "research",
      });
    } else {
      newInsights.push({
        id: "pat-2",
        type: "recommendation",
        title: "Consider Filing Patents",
        description:
          "Transform your research innovations into patents. The institute's IPR cell can help with the filing process.",
        priority: "medium",
        category: "research",
      });
    }

    // Analyze FDP/Courses
    const courses = partA.courses_fdp || [];
    if (courses.length === 0) {
      newInsights.push({
        id: "fdp-1",
        type: "warning",
        title: "Professional Development Gap",
        description:
          "Attend at least one FDP, STTP, or refresher course annually. This is mandatory for CAS promotions.",
        priority: "high",
        category: "teaching",
      });
    } else {
      newInsights.push({
        id: "fdp-2",
        type: "analysis",
        title: "Professional Development",
        description: `You have completed ${courses.length} course(s)/FDP(s). Continue exploring new teaching methodologies and emerging technologies.`,
        priority: "low",
        category: "teaching",
      });
    }

    // Analyze research guidance
    const guidance = partB.table2?.researchGuidance || [];
    const phdStudents = guidance.filter((g: any) => g.degree === "Ph.D.").length;
    if (phdStudents > 0) {
      newInsights.push({
        id: "guide-1",
        type: "achievement",
        title: "Ph.D. Supervision",
        description: `You are guiding ${phdStudents} Ph.D. student(s). This significantly contributes to your research API score.`,
        priority: "low",
        category: "research",
      });
    }

    // Analyze invited lectures
    const lectures = partB.invited_lectures || [];
    if (lectures.length > 0) {
      const internationalLectures = lectures.filter((l: any) => l.level === "International").length;
      newInsights.push({
        id: "lec-1",
        type: "analysis",
        title: "Academic Visibility",
        description: `You have delivered ${lectures.length} invited lecture(s)${
          internationalLectures > 0 ? `, including ${internationalLectures} at international level` : ""
        }. This enhances your academic reputation.`,
        priority: "low",
        category: "service",
      });
    }

    // Overall recommendation
    newInsights.push({
      id: "overall-1",
      type: "recommendation",
      title: "API Score Optimization",
      description:
        "Balance your contributions across teaching (Category I), co-curricular activities (Category II), and research (Category III) for comprehensive career growth.",
      priority: "medium",
      category: "overall",
    });

    setInsights(newInsights);
    setLoading(false);
  };

  const regenerateInsights = async () => {
    setGenerating(true);
    await generateInsights();
    setGenerating(false);
  };

  return (
    <Card className={`shadow-lg ${className}`}>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-6 w-6 text-purple-500" />
            </motion.div>
            <div>
              <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
              <CardDescription>
                Personalized recommendations for your academic growth
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={regenerateInsights}
            disabled={generating}
            className="bg-white/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Bot className="h-12 w-12 text-purple-500" />
            </motion.div>
            <p className="text-sm text-muted-foreground mt-4">
              Analyzing your profile...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {insights.map((insight, index) => {
                const TypeIcon = typeIcons[insight.type];
                const CategoryIcon = categoryIcons[insight.category];

                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${priorityColors[insight.priority]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            insight.type === "achievement"
                              ? "bg-green-100 text-green-600"
                              : insight.type === "warning"
                              ? "bg-red-100 text-red-600"
                              : insight.type === "recommendation"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <TypeIcon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">
                            {insight.title}
                          </h4>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              insight.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : insight.priority === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {insight.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <CategoryIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground capitalize">
                            {insight.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export a simpler version for inline use
export function AIInsightBadge({
  insight,
}: {
  insight: {
    type: "positive" | "warning" | "neutral";
    text: string;
  };
}) {
  const colors = {
    positive: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    neutral: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const icons = {
    positive: CheckCircle,
    warning: AlertCircle,
    neutral: Lightbulb,
  };

  const Icon = icons[insight.type];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${colors[insight.type]}`}
    >
      <Icon className="h-3 w-3" />
      {insight.text}
    </div>
  );
}
