"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Loader2,
  RefreshCw,
  BookOpen,
  Users,
  Award,
} from "lucide-react";

interface AIInsight {
  category: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  suggestedAction?: string;
}

interface AIAnalysis {
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  insights: AIInsight[];
  recommendations: string[];
  predictedGrowth: number;
  peerComparison: string;
}

interface AIInsightsModalProps {
  facultyData: any;
  children?: React.ReactNode;
}

export function AIInsightsModal({
  facultyData,
  children,
}: AIInsightsModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate AI analysis (in production, this would call an actual AI API)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock insights based on faculty data
      const mockAnalysis: AIAnalysis = {
        overallScore: Math.floor(Math.random() * 30) + 70,
        strengths: [
          "Strong publication record in peer-reviewed journals",
          "Active participation in faculty development programs",
          "Consistent student feedback scores above department average",
          "Innovative teaching methodologies implementation",
        ],
        areasForImprovement: [
          "Consider increasing industry collaboration projects",
          "Explore more international conference participation",
          "Develop more interdisciplinary research connections",
        ],
        insights: [
          {
            category: "Research",
            title: "Publication Trend Analysis",
            description:
              "Your publication count has increased by 20% compared to last year. Consider targeting high-impact factor journals for greater visibility.",
            priority: "high",
            actionable: true,
            suggestedAction:
              "Submit at least 2 papers to SCI-indexed journals this semester",
          },
          {
            category: "Teaching",
            title: "Student Engagement",
            description:
              "Your interactive teaching approach has resulted in higher student satisfaction. Continue implementing innovative pedagogical methods.",
            priority: "medium",
            actionable: true,
            suggestedAction:
              "Document your teaching innovations for best practices sharing",
          },
          {
            category: "Service",
            title: "Committee Participation",
            description:
              "Active involvement in institutional committees enhances your profile. Balance this with research activities.",
            priority: "low",
            actionable: false,
          },
          {
            category: "Development",
            title: "Professional Growth",
            description:
              "Participation in FDPs shows commitment to continuous learning. Consider organizing workshops to share knowledge.",
            priority: "medium",
            actionable: true,
            suggestedAction: "Propose a department-level workshop this quarter",
          },
        ],
        recommendations: [
          "Pursue a funded research project from AICTE or UGC",
          "Mentor junior faculty members to build leadership skills",
          "Develop an online course on your area of expertise",
          "Collaborate with industry partners for consultancy projects",
          "Write a textbook or contribute chapters to edited volumes",
        ],
        predictedGrowth: Math.floor(Math.random() * 20) + 10,
        peerComparison:
          "You are performing above average compared to peers in your department with similar experience.",
      };

      setAnalysis(mockAnalysis);
    } catch (err: any) {
      setError(err.message || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Research":
        return <BookOpen className="h-4 w-4" />;
      case "Teaching":
        return <Users className="h-4 w-4" />;
      case "Service":
        return <Award className="h-4 w-4" />;
      case "Development":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            className="gap-2 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200"
          >
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="text-purple-700">AI Insights</span>
            <Sparkles className="h-3 w-3 text-purple-500" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-purple-600" />
            AI-Powered Performance Insights
            <Badge variant="outline" className="ml-2 text-xs">
              Powered by AI
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {!analysis && !loading && (
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <Brain className="h-20 w-20 text-purple-600 relative" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Get AI-Powered Insights
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Our AI analyzes your performance data to provide personalized
              recommendations and insights for your professional growth.
            </p>
            <Button
              onClick={generateInsights}
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="h-4 w-4" />
              Generate Insights
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <Loader2 className="h-20 w-20 text-purple-600 relative animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Analyzing Your Performance...
            </h3>
            <p className="text-muted-foreground">
              AI is processing your data to generate personalized insights
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={generateInsights} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">
                      Overall Performance Score
                    </h3>
                    <p className="text-sm text-purple-700">
                      Based on comprehensive analysis of your activities
                    </p>
                  </div>
                  <div className="relative">
                    <div className="text-5xl font-bold text-purple-600">
                      {analysis.overallScore}
                    </div>
                    <div className="text-sm text-purple-500 text-center">
                      / 100
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-700">
                    Predicted Growth: +{analysis.predictedGrowth}% this year
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Areas for Improvement */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                    <Target className="h-5 w-5" />
                    Areas for Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.areasForImprovement.map((area, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Detailed Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.insights.map((insight, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(insight.category)}
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                        </div>
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority} priority
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      {insight.actionable && insight.suggestedAction && (
                        <div className="flex items-start gap-2 p-2 bg-purple-50 rounded-md">
                          <Target className="h-4 w-4 text-purple-600 mt-0.5" />
                          <div>
                            <span className="text-xs font-medium text-purple-700">
                              Suggested Action:
                            </span>
                            <p className="text-sm text-purple-600">
                              {insight.suggestedAction}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {analysis.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </div>
                      <span className="text-sm text-blue-900">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Peer Comparison */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">
                    Peer Comparison
                  </h4>
                  <p className="text-sm text-green-700">
                    {analysis.peerComparison}
                  </p>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-center">
              <Button
                onClick={generateInsights}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Analysis
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
