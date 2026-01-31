"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  BookOpen,
  Play,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  Users,
  BarChart3,
  Settings,
  Upload,
  Download,
  CheckCircle,
  Lightbulb,
  MessageCircle,
  Video,
  Keyboard,
  Search,
  Home,
  User,
  GraduationCap,
  Award,
  Briefcase,
  Bot,
} from "lucide-react";

// Walkthrough Step Interface
interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: "top" | "bottom" | "left" | "right";
  action?: string;
}

// Module Walkthrough Data
interface ModuleWalkthrough {
  id: string;
  title: string;
  description: string;
  icon: any;
  steps: WalkthroughStep[];
  estimatedTime: string;
}

const walkthroughs: ModuleWalkthrough[] = [
  {
    id: "dashboard",
    title: "Dashboard Overview",
    description: "Learn how to navigate and use the faculty dashboard effectively",
    icon: Home,
    estimatedTime: "3 min",
    steps: [
      {
        id: "dash-1",
        title: "Welcome to Your Dashboard",
        description: "This is your central hub for managing all your academic activities. You can see your profile summary, recent activities, and quick access to all modules.",
      },
      {
        id: "dash-2",
        title: "Quick Stats Cards",
        description: "At the top, you'll find quick statistics showing your publications, projects, API score, and pending tasks. These update in real-time.",
        target: "[data-tour='stats-cards']",
      },
      {
        id: "dash-3",
        title: "Navigation Menu",
        description: "Use the sidebar to navigate between different sections - Profile, Forms, Publications, Reports, and Settings.",
        target: "[data-tour='sidebar']",
      },
      {
        id: "dash-4",
        title: "Recent Activity",
        description: "The activity section shows your recent actions and any pending notifications or tasks that require your attention.",
        target: "[data-tour='recent-activity']",
      },
      {
        id: "dash-5",
        title: "AI Assistant",
        description: "Click the AI Assistant button at the bottom right for intelligent help with form filling and data analysis.",
        target: "[data-tour='ai-button']",
      },
    ],
  },
  {
    id: "profile",
    title: "Profile Management",
    description: "How to complete and update your faculty profile",
    icon: User,
    estimatedTime: "5 min",
    steps: [
      {
        id: "prof-1",
        title: "Personal Information",
        description: "Start by filling in your personal details - name, contact information, and department. This information is used across all your appraisal forms.",
      },
      {
        id: "prof-2",
        title: "Academic Qualifications",
        description: "Add your educational qualifications from SSC to PhD. Include all degrees, universities, years, and percentages.",
      },
      {
        id: "prof-3",
        title: "Research Degrees",
        description: "Document your research degrees including M.Phil, Ph.D., D.Sc., etc. Include thesis titles and awarding universities.",
      },
      {
        id: "prof-4",
        title: "Employment History",
        description: "Add your prior appointments and current position details for accurate experience calculation.",
      },
      {
        id: "prof-5",
        title: "Voice Input",
        description: "Use the microphone button next to text fields for voice input. Simply speak and your words will be transcribed automatically.",
      },
    ],
  },
  {
    id: "pbas-form",
    title: "PBAS Form Submission",
    description: "Complete guide to filling and submitting your PBAS appraisal form",
    icon: FileText,
    estimatedTime: "10 min",
    steps: [
      {
        id: "pbas-1",
        title: "Understanding PBAS",
        description: "Performance Based Appraisal System (PBAS) evaluates your academic contributions across teaching, research, and administrative duties.",
      },
      {
        id: "pbas-2",
        title: "Part A: General Information",
        description: "Part A contains your basic information, qualifications, and experience. Much of this is auto-filled from your profile.",
      },
      {
        id: "pbas-3",
        title: "Part B: Academic Performance",
        description: "Part B covers your research papers, publications, projects, patents, and lectures. Each entry contributes to your API score.",
      },
      {
        id: "pbas-4",
        title: "Adding Publications",
        description: "For each publication, include the title, journal name, ISSN, impact factor, and co-authors. The system auto-calculates API points.",
      },
      {
        id: "pbas-5",
        title: "Research Projects",
        description: "Document sponsored projects with funding details, duration, and your role. Both completed and ongoing projects count.",
      },
      {
        id: "pbas-6",
        title: "Saving Draft",
        description: "Your form auto-saves as you type. You can also click 'Save Draft' to ensure all data is preserved before submission.",
      },
      {
        id: "pbas-7",
        title: "Final Submission",
        description: "Review all sections before submitting. Once submitted, the form goes to your HOD for review. You'll receive email notifications for status updates.",
      },
    ],
  },
  {
    id: "publications",
    title: "Publications & Research",
    description: "Managing your research papers, books, and patents",
    icon: BookOpen,
    estimatedTime: "5 min",
    steps: [
      {
        id: "pub-1",
        title: "Adding Research Papers",
        description: "Click 'Add Publication' and select the paper type - Journal, Conference, or Book Chapter.",
      },
      {
        id: "pub-2",
        title: "Journal Details",
        description: "For journal papers, specify if it's SCI, Scopus, or UGC-listed. Include the impact factor for accurate API calculation.",
      },
      {
        id: "pub-3",
        title: "Auto-Fill from DOI",
        description: "Enter a DOI number and click 'Fetch' to automatically populate publication details from online databases.",
      },
      {
        id: "pub-4",
        title: "Co-Author Allocation",
        description: "Specify your position in the author list and number of authors for correct API score distribution.",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Reports",
    description: "Understanding your performance metrics and generating reports",
    icon: BarChart3,
    estimatedTime: "4 min",
    steps: [
      {
        id: "ana-1",
        title: "Performance Dashboard",
        description: "View your year-wise performance trends with interactive charts showing publications, projects, and API scores.",
      },
      {
        id: "ana-2",
        title: "Category Breakdown",
        description: "See how your contributions are distributed across research, teaching, and administrative categories.",
      },
      {
        id: "ana-3",
        title: "AI Insights",
        description: "Get AI-powered recommendations on areas for improvement and strategies to enhance your API score.",
      },
      {
        id: "ana-4",
        title: "Generating Reports",
        description: "Export your data as PDF reports suitable for submission or personal records. Choose from detailed or summary formats.",
      },
    ],
  },
];

// FAQ Data
const faqs = [
  {
    question: "How is my API score calculated?",
    answer: "API score is calculated based on UGC/AICTE guidelines. Points are awarded for publications (based on journal quality and authorship), research projects (based on funding and role), patents, PhD guidance, and academic contributions.",
  },
  {
    question: "Can I edit my form after submission?",
    answer: "Once submitted, the form is locked for review. If your HOD requests revisions, the form will be unlocked and you'll receive an email notification with specific feedback.",
  },
  {
    question: "What documents do I need to upload?",
    answer: "You should upload supporting documents for publications (first page or DOI proof), project sanction letters, patent certificates, and PhD scholar registration documents.",
  },
  {
    question: "How do I add a publication not found in databases?",
    answer: "For publications not in databases, manually fill all fields. Upload the first page of the publication as supporting evidence. The system will validate the entry during review.",
  },
  {
    question: "What happens if I miss the submission deadline?",
    answer: "Contact your HOD or the MIS admin for deadline extensions. Late submissions may be considered based on valid reasons but require approval from the competent authority.",
  },
  {
    question: "How can I track my submission status?",
    answer: "Go to Dashboard > My Appraisals to see all your submissions with current status. You'll also receive email notifications for any status changes.",
  },
  {
    question: "Is voice input available in all browsers?",
    answer: "Voice input works best in Chrome and Edge browsers. Safari has limited support. Make sure to allow microphone access when prompted.",
  },
];

// Video Tutorials
const videoTutorials = [
  {
    id: "intro",
    title: "Introduction to Shikshak Sarthi",
    duration: "5:30",
    thumbnail: "🎬",
  },
  {
    id: "profile-setup",
    title: "Setting Up Your Profile",
    duration: "8:15",
    thumbnail: "👤",
  },
  {
    id: "pbas-form",
    title: "Completing PBAS Form",
    duration: "12:45",
    thumbnail: "📝",
  },
  {
    id: "publications",
    title: "Adding Publications",
    duration: "6:20",
    thumbnail: "📚",
  },
  {
    id: "reports",
    title: "Generating Reports",
    duration: "4:10",
    thumbnail: "📊",
  },
];

// Help Page Component
export default function HelpPage() {
  const [activeWalkthrough, setActiveWalkthrough] = useState<ModuleWalkthrough | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("walkthroughs");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startWalkthrough = (walkthrough: ModuleWalkthrough) => {
    setActiveWalkthrough(walkthrough);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (activeWalkthrough && currentStep < activeWalkthrough.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setActiveWalkthrough(null);
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeWalkthrough = () => {
    setActiveWalkthrough(null);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
            <HelpCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          <p className="text-muted-foreground mt-2">
            Interactive guides, tutorials, and answers to common questions
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          className="relative max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4">
            <TabsTrigger value="walkthroughs" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Walkthroughs</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              <span className="hidden sm:inline">Shortcuts</span>
            </TabsTrigger>
          </TabsList>

          {/* Walkthroughs Tab */}
          <TabsContent value="walkthroughs">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {walkthroughs.map((walkthrough, index) => (
                <motion.div
                  key={walkthrough.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <walkthrough.icon className="h-6 w-6 text-accent" />
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {walkthrough.estimatedTime}
                        </span>
                      </div>
                      <CardTitle className="text-lg mt-3">{walkthrough.title}</CardTitle>
                      <CardDescription>{walkthrough.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{walkthrough.steps.length} steps</span>
                      </div>
                      <Button
                        className="w-full group"
                        onClick={() => startWalkthrough(walkthrough)}
                      >
                        <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Start Walkthrough
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <div className="space-y-4 max-w-3xl mx-auto">
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground pl-8">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {filteredFaqs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No matching questions found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {videoTutorials.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                      {video.thumbnail}
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-medium">{video.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Play className="h-3 w-3" />
                        {video.duration}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Keyboard Shortcuts Tab */}
          <TabsContent value="shortcuts">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription>
                  Navigate faster with these keyboard shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { keys: ["Ctrl", "S"], action: "Save current form" },
                      { keys: ["Ctrl", "Enter"], action: "Submit form" },
                      { keys: ["Ctrl", "/"], action: "Open search" },
                      { keys: ["Ctrl", "H"], action: "Open help" },
                      { keys: ["Ctrl", "B"], action: "Toggle sidebar" },
                      { keys: ["Ctrl", "+"], action: "Increase font size" },
                      { keys: ["Ctrl", "-"], action: "Decrease font size" },
                      { keys: ["Esc"], action: "Close dialog/modal" },
                      { keys: ["Tab"], action: "Navigate to next field" },
                      { keys: ["Shift", "Tab"], action: "Navigate to previous field" },
                    ].map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, i) => (
                            <span key={i} className="flex items-center">
                              <kbd className="px-2 py-1 text-xs bg-background rounded border font-mono">
                                {key}
                              </kbd>
                              {i < shortcut.keys.length - 1 && (
                                <span className="mx-1 text-muted-foreground">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {shortcut.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Support */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="max-w-lg mx-auto bg-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <Bot className="h-10 w-10 mx-auto mb-3 text-accent" />
              <h3 className="font-semibold mb-2">Still need help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI assistant is available 24/7 to answer your questions
              </p>
              <Button>
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with AI Assistant
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Walkthrough Modal */}
      <AnimatePresence>
        {activeWalkthrough && (
          <Dialog open={!!activeWalkthrough} onOpenChange={() => closeWalkthrough()}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <activeWalkthrough.icon className="h-5 w-5 text-accent" />
                    {activeWalkthrough.title}
                  </DialogTitle>
                  <span className="text-xs text-muted-foreground">
                    Step {currentStep + 1} of {activeWalkthrough.steps.length}
                  </span>
                </div>
              </DialogHeader>

              <div className="mt-4">
                {/* Progress Bar */}
                <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
                  <motion.div
                    className="h-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((currentStep + 1) / activeWalkthrough.steps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold">
                      {activeWalkthrough.steps[currentStep].title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeWalkthrough.steps[currentStep].description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {activeWalkthrough.steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStep
                            ? "bg-accent"
                            : index < currentStep
                            ? "bg-accent/50"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <Button onClick={nextStep}>
                    {currentStep === activeWalkthrough.steps.length - 1 ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Finish
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

// Exportable Walkthrough Component for inline use
export function InlineWalkthrough({
  steps,
  onComplete,
}: {
  steps: WalkthroughStep[];
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
    >
      <Card className="shadow-2xl border-2 border-accent/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">
              Tip {currentStep + 1} of {steps.length}
            </span>
            <Button variant="ghost" size="sm" onClick={onComplete}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <h4 className="font-semibold mb-2">{steps[currentStep].title}</h4>
          <p className="text-sm text-muted-foreground mb-4">
            {steps[currentStep].description}
          </p>
          <div className="flex justify-end">
            <Button size="sm" onClick={nextStep}>
              {currentStep === steps.length - 1 ? "Got it!" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
