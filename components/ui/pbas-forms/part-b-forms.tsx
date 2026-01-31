"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  BookOpen,
  Briefcase,
  Award,
  Users,
  Lightbulb,
  Mic,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import {
  ResearchPaper,
  Publication,
  ResearchProject,
  ConsultancyProject,
  ResearchGuidance,
  Patent,
  Award as AwardType,
  InvitedLecture,
  GRADING_OPTIONS,
} from "@/lib/pbas-types";

// ============= Research Papers Form =============
interface ResearchPapersFormProps {
  data: ResearchPaper[];
  onChange: (data: ResearchPaper[]) => void;
  onSave?: () => void;
  loading?: boolean;
}

export function ResearchPapersForm({ data, onChange, onSave, loading }: ResearchPapersFormProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addPaper = () => {
    const newPaper: ResearchPaper = {
      id: `rp-${Date.now()}`,
      title: "",
      authors: [],
      journal_name: "",
      year: "",
      publication_type: "Journal",
      issn: "",
      volume: "",
      issue: "",
      page_numbers: "",
      impact_factor: undefined,
      indexed_in: [],
      doi: "",
      is_first_author: false,
      citations: 0,
    };
    onChange([...data, newPaper]);
    setExpandedIndex(data.length);
  };

  const updatePaper = (index: number, field: keyof ResearchPaper, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePaper = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const indexOptions = ["SCI", "SCIE", "Scopus", "UGC Care List", "Web of Science", "PubMed", "IEEE Xplore", "ACM Digital Library", "Google Scholar", "Other"];

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              Research Papers
            </CardTitle>
            <CardDescription>Journal articles, conference papers, and research publications</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addPaper}>
            <Plus className="h-4 w-4 mr-2" />
            Add Paper
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No research papers added yet.</p>
            <Button variant="outline" className="mt-4" onClick={addPaper}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Paper
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {data.map((paper, index) => (
                <motion.div
                  key={paper.id || index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Collapsed Header */}
                  <div
                    className="p-4 bg-muted/30 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {paper.title || `Paper #${index + 1}`}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {paper.journal_name || "No journal specified"} • {paper.year || "Year not set"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {paper.indexed_in && paper.indexed_in.length > 0 && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {paper.indexed_in[0]}
                        </span>
                      )}
                      {expandedIndex === index ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedIndex === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 border-t"
                    >
                      <div className="flex justify-end mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePaper(index)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label>Paper Title *</Label>
                          <Textarea
                            value={paper.title}
                            onChange={(e) => updatePaper(index, "title", e.target.value)}
                            placeholder="Full title of the research paper"
                            rows={2}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Authors (comma separated) *</Label>
                          <Input
                            value={paper.authors.join(", ")}
                            onChange={(e) => updatePaper(index, "authors", e.target.value.split(",").map(a => a.trim()))}
                            placeholder="John Doe, Jane Smith, Robert Brown"
                          />
                        </div>

                        <div>
                          <Label>Publication Type *</Label>
                          <Select
                            value={paper.publication_type}
                            onValueChange={(value) => updatePaper(index, "publication_type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Journal">Journal Article</SelectItem>
                              <SelectItem value="Conference">Conference Paper</SelectItem>
                              <SelectItem value="Book Chapter">Book Chapter</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Journal/Conference Name *</Label>
                          <Input
                            value={paper.journal_name}
                            onChange={(e) => updatePaper(index, "journal_name", e.target.value)}
                            placeholder="IEEE Transactions on..."
                          />
                        </div>

                        <div>
                          <Label>Year *</Label>
                          <Input
                            value={paper.year}
                            onChange={(e) => updatePaper(index, "year", e.target.value)}
                            placeholder="2024"
                            maxLength={4}
                          />
                        </div>

                        <div>
                          <Label>ISSN/ISBN</Label>
                          <Input
                            value={paper.issn || ""}
                            onChange={(e) => updatePaper(index, "issn", e.target.value)}
                            placeholder="XXXX-XXXX"
                          />
                        </div>

                        <div>
                          <Label>Volume</Label>
                          <Input
                            value={paper.volume || ""}
                            onChange={(e) => updatePaper(index, "volume", e.target.value)}
                            placeholder="Vol. 15"
                          />
                        </div>

                        <div>
                          <Label>Issue</Label>
                          <Input
                            value={paper.issue || ""}
                            onChange={(e) => updatePaper(index, "issue", e.target.value)}
                            placeholder="Issue 3"
                          />
                        </div>

                        <div>
                          <Label>Page Numbers</Label>
                          <Input
                            value={paper.page_numbers || ""}
                            onChange={(e) => updatePaper(index, "page_numbers", e.target.value)}
                            placeholder="pp. 123-145"
                          />
                        </div>

                        <div>
                          <Label>Impact Factor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={paper.impact_factor || ""}
                            onChange={(e) => updatePaper(index, "impact_factor", parseFloat(e.target.value))}
                            placeholder="3.5"
                          />
                        </div>

                        <div>
                          <Label>DOI</Label>
                          <div className="flex gap-2">
                            <Input
                              value={paper.doi || ""}
                              onChange={(e) => updatePaper(index, "doi", e.target.value)}
                              placeholder="10.1000/xyz123"
                            />
                            {paper.doi && (
                              <Button variant="outline" size="icon" asChild>
                                <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label>Citations</Label>
                          <Input
                            type="number"
                            value={paper.citations || 0}
                            onChange={(e) => updatePaper(index, "citations", parseInt(e.target.value))}
                            placeholder="0"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Indexed In</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {indexOptions.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  const current = paper.indexed_in || [];
                                  const updated = current.includes(opt)
                                    ? current.filter((i) => i !== opt)
                                    : [...current, opt];
                                  updatePaper(index, "indexed_in", updated);
                                }}
                                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                  (paper.indexed_in || []).includes(opt)
                                    ? "bg-accent text-white border-accent"
                                    : "bg-muted/50 text-foreground border-border hover:bg-muted"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={paper.is_first_author || false}
                              onChange={(e) => updatePaper(index, "is_first_author", e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">First Author</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={paper.is_corresponding_author || false}
                              onChange={(e) => updatePaper(index, "is_corresponding_author", e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">Corresponding Author</span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {onSave && data.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Papers"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============= Research Projects Form =============
interface ResearchProjectsFormProps {
  data: ResearchProject[];
  onChange: (data: ResearchProject[]) => void;
  onSave?: () => void;
  loading?: boolean;
}

export function ResearchProjectsForm({ data, onChange, onSave, loading }: ResearchProjectsFormProps) {
  const addProject = () => {
    const newProject: ResearchProject = {
      id: `proj-${Date.now()}`,
      title: "",
      funding_agency: "",
      amount: 0,
      duration: "",
      role: "PI",
      status: "Ongoing",
      start_date: "",
      project_type: "Major",
    };
    onChange([...data, newProject]);
  };

  const updateProject = (index: number, field: keyof ResearchProject, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeProject = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const fundingAgencies = [
    "DST (Department of Science and Technology)",
    "AICTE",
    "UGC",
    "DRDO",
    "ISRO",
    "DBT (Department of Biotechnology)",
    "MHRD",
    "CSIR",
    "Industry Sponsored",
    "Institute Funded",
    "Other",
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Research Projects
            </CardTitle>
            <CardDescription>Sponsored research and major/minor projects</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addProject}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No research projects added yet.</p>
            <Button variant="outline" className="mt-4" onClick={addProject}>
              <Plus className="h-4 w-4 mr-2" />
              Add Research Project
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((project, index) => (
              <motion.div
                key={project.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border rounded-lg bg-blue-50/30 dark:bg-blue-900/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Project #{index + 1}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === "Completed" 
                        ? "bg-green-100 text-green-700" 
                        : project.status === "Ongoing"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label>Project Title *</Label>
                    <Textarea
                      value={project.title}
                      onChange={(e) => updateProject(index, "title", e.target.value)}
                      placeholder="Full title of the research project"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Funding Agency *</Label>
                    <Select
                      value={project.funding_agency}
                      onValueChange={(value) => updateProject(index, "funding_agency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agency" />
                      </SelectTrigger>
                      <SelectContent>
                        {fundingAgencies.map((agency) => (
                          <SelectItem key={agency} value={agency}>
                            {agency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Amount (₹) *</Label>
                    <Input
                      type="number"
                      value={project.amount || ""}
                      onChange={(e) => updateProject(index, "amount", parseFloat(e.target.value))}
                      placeholder="1000000"
                    />
                  </div>

                  <div>
                    <Label>Project Type</Label>
                    <Select
                      value={project.project_type}
                      onValueChange={(value) => updateProject(index, "project_type", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Major">Major (Above 10 Lakhs)</SelectItem>
                        <SelectItem value="Minor">Minor (Below 10 Lakhs)</SelectItem>
                        <SelectItem value="Consultancy">Consultancy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Your Role</Label>
                    <Select
                      value={project.role}
                      onValueChange={(value) => updateProject(index, "role", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PI">Principal Investigator (PI)</SelectItem>
                        <SelectItem value="Co-PI">Co-Principal Investigator</SelectItem>
                        <SelectItem value="Consultant">Consultant</SelectItem>
                        <SelectItem value="Team Member">Team Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select
                      value={project.status}
                      onValueChange={(value) => updateProject(index, "status", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Duration</Label>
                    <Input
                      value={project.duration}
                      onChange={(e) => updateProject(index, "duration", e.target.value)}
                      placeholder="2 years"
                    />
                  </div>

                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={project.start_date}
                      onChange={(e) => updateProject(index, "start_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={project.end_date || ""}
                      onChange={(e) => updateProject(index, "end_date", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <Label>Outcomes/Deliverables</Label>
                    <Textarea
                      value={project.outcomes || ""}
                      onChange={(e) => updateProject(index, "outcomes", e.target.value)}
                      placeholder="Key outcomes, publications, prototypes, etc."
                      rows={2}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {onSave && data.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Projects"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============= Research Guidance Form =============
interface ResearchGuidanceFormProps {
  data: ResearchGuidance[];
  onChange: (data: ResearchGuidance[]) => void;
  onSave?: () => void;
  loading?: boolean;
}

export function ResearchGuidanceForm({ data, onChange, onSave, loading }: ResearchGuidanceFormProps) {
  const addGuidance = () => {
    const newGuidance: ResearchGuidance = {
      id: `guide-${Date.now()}`,
      student_name: "",
      degree: "Ph.D.",
      thesis_title: "",
      status: "Ongoing",
      registration_date: "",
      university: "",
      role: "Supervisor",
    };
    onChange([...data, newGuidance]);
  };

  const updateGuidance = (index: number, field: keyof ResearchGuidance, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeGuidance = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Research Guidance
            </CardTitle>
            <CardDescription>Ph.D., M.Phil., M.Tech students under supervision</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addGuidance}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No research students added yet.</p>
            <Button variant="outline" className="mt-4" onClick={addGuidance}>
              <Plus className="h-4 w-4 mr-2" />
              Add Research Student
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((student, index) => (
              <motion.div
                key={student.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border rounded-lg bg-purple-50/30 dark:bg-purple-900/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{student.student_name || `Student #${index + 1}`}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      student.status === "Awarded"
                        ? "bg-green-100 text-green-700"
                        : student.status === "Completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {student.status}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGuidance(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Student Name *</Label>
                    <Input
                      value={student.student_name}
                      onChange={(e) => updateGuidance(index, "student_name", e.target.value)}
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <Label>Enrollment Number</Label>
                    <Input
                      value={student.enrollment_number || ""}
                      onChange={(e) => updateGuidance(index, "enrollment_number", e.target.value)}
                      placeholder="PRN/Enrollment No."
                    />
                  </div>

                  <div>
                    <Label>Degree</Label>
                    <Select
                      value={student.degree}
                      onValueChange={(value) => updateGuidance(index, "degree", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ph.D.">Ph.D.</SelectItem>
                        <SelectItem value="M.Phil.">M.Phil.</SelectItem>
                        <SelectItem value="M.Tech">M.Tech</SelectItem>
                        <SelectItem value="M.E.">M.E.</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <Label>Thesis Title *</Label>
                    <Textarea
                      value={student.thesis_title}
                      onChange={(e) => updateGuidance(index, "thesis_title", e.target.value)}
                      placeholder="Title of thesis/dissertation"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>University</Label>
                    <Input
                      value={student.university}
                      onChange={(e) => updateGuidance(index, "university", e.target.value)}
                      placeholder="University of Mumbai"
                    />
                  </div>

                  <div>
                    <Label>Your Role</Label>
                    <Select
                      value={student.role}
                      onValueChange={(value) => updateGuidance(index, "role", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Co-Supervisor">Co-Supervisor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select
                      value={student.status}
                      onValueChange={(value) => updateGuidance(index, "status", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Registered">Registered</SelectItem>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Awarded">Awarded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Registration Date</Label>
                    <Input
                      type="date"
                      value={student.registration_date}
                      onChange={(e) => updateGuidance(index, "registration_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Award Date</Label>
                    <Input
                      type="date"
                      value={student.award_date || ""}
                      onChange={(e) => updateGuidance(index, "award_date", e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {onSave && data.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Research Guidance"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============= Patents Form =============
interface PatentsFormProps {
  data: Patent[];
  onChange: (data: Patent[]) => void;
  onSave?: () => void;
  loading?: boolean;
}

export function PatentsForm({ data, onChange, onSave, loading }: PatentsFormProps) {
  const addPatent = () => {
    const newPatent: Patent = {
      id: `pat-${Date.now()}`,
      title: "",
      filing_date: "",
      status: "Filed",
      country: "India",
      inventors: [],
    };
    onChange([...data, newPatent]);
  };

  const updatePatent = (index: number, field: keyof Patent, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePatent = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-green-500" />
              Patents
            </CardTitle>
            <CardDescription>Patents filed, published, or granted</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addPatent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patent
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No patents added yet.</p>
            <Button variant="outline" className="mt-4" onClick={addPatent}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Patent
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((patent, index) => (
              <motion.div
                key={patent.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border rounded-lg bg-green-50/30 dark:bg-green-900/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Patent #{index + 1}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      patent.status === "Granted"
                        ? "bg-green-100 text-green-700"
                        : patent.status === "Published"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {patent.status}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePatent(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Patent Title *</Label>
                    <Textarea
                      value={patent.title}
                      onChange={(e) => updatePatent(index, "title", e.target.value)}
                      placeholder="Title of the invention"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Patent Number</Label>
                    <Input
                      value={patent.patent_number || ""}
                      onChange={(e) => updatePatent(index, "patent_number", e.target.value)}
                      placeholder="Application/Grant number"
                    />
                  </div>

                  <div>
                    <Label>Country *</Label>
                    <Select
                      value={patent.country}
                      onValueChange={(value) => updatePatent(index, "country", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="PCT">PCT (International)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status *</Label>
                    <Select
                      value={patent.status}
                      onValueChange={(value) => updatePatent(index, "status", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Filed">Filed</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Granted">Granted</SelectItem>
                        <SelectItem value="Abandoned">Abandoned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Filing Date *</Label>
                    <Input
                      type="date"
                      value={patent.filing_date}
                      onChange={(e) => updatePatent(index, "filing_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Grant Date</Label>
                    <Input
                      type="date"
                      value={patent.grant_date || ""}
                      onChange={(e) => updatePatent(index, "grant_date", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Inventors (comma separated)</Label>
                    <Input
                      value={patent.inventors.join(", ")}
                      onChange={(e) => updatePatent(index, "inventors", e.target.value.split(",").map(i => i.trim()))}
                      placeholder="Dr. John Doe, Dr. Jane Smith"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {onSave && data.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Patents"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============= Invited Lectures Form =============
interface InvitedLecturesFormProps {
  data: InvitedLecture[];
  onChange: (data: InvitedLecture[]) => void;
  onSave?: () => void;
  loading?: boolean;
}

export function InvitedLecturesForm({ data, onChange, onSave, loading }: InvitedLecturesFormProps) {
  const addLecture = () => {
    const newLecture: InvitedLecture = {
      id: `lec-${Date.now()}`,
      title: "",
      event_name: "",
      organizer: "",
      venue: "",
      date: "",
      type: "Invited Talk",
      level: "National",
    };
    onChange([...data, newLecture]);
  };

  const updateLecture = (index: number, field: keyof InvitedLecture, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeLecture = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-amber-500" />
              Invited Lectures & Conference Presentations
            </CardTitle>
            <CardDescription>Keynotes, invited talks, panel discussions, guest lectures</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addLecture}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lecture
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No invited lectures added yet.</p>
            <Button variant="outline" className="mt-4" onClick={addLecture}>
              <Plus className="h-4 w-4 mr-2" />
              Add Invited Lecture
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((lecture, index) => (
              <motion.div
                key={lecture.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border rounded-lg bg-amber-50/30 dark:bg-amber-900/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Lecture #{index + 1}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lecture.level === "International"
                        ? "bg-purple-100 text-purple-700"
                        : lecture.level === "National"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {lecture.level}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLecture(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label>Lecture Title *</Label>
                    <Input
                      value={lecture.title}
                      onChange={(e) => updateLecture(index, "title", e.target.value)}
                      placeholder="Title of your talk/presentation"
                    />
                  </div>

                  <div>
                    <Label>Event Name *</Label>
                    <Input
                      value={lecture.event_name}
                      onChange={(e) => updateLecture(index, "event_name", e.target.value)}
                      placeholder="Conference/Workshop name"
                    />
                  </div>

                  <div>
                    <Label>Organizer</Label>
                    <Input
                      value={lecture.organizer}
                      onChange={(e) => updateLecture(index, "organizer", e.target.value)}
                      placeholder="Organizing institution"
                    />
                  </div>

                  <div>
                    <Label>Venue</Label>
                    <Input
                      value={lecture.venue}
                      onChange={(e) => updateLecture(index, "venue", e.target.value)}
                      placeholder="Location"
                    />
                  </div>

                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={lecture.date}
                      onChange={(e) => updateLecture(index, "date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Type</Label>
                    <Select
                      value={lecture.type}
                      onValueChange={(value) => updateLecture(index, "type", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Keynote">Keynote Address</SelectItem>
                        <SelectItem value="Invited Talk">Invited Talk</SelectItem>
                        <SelectItem value="Resource Person">Resource Person</SelectItem>
                        <SelectItem value="Panelist">Panelist</SelectItem>
                        <SelectItem value="Guest Lecture">Guest Lecture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Level</Label>
                    <Select
                      value={lecture.level}
                      onValueChange={(value) => updateLecture(index, "level", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="International">International</SelectItem>
                        <SelectItem value="National">National</SelectItem>
                        <SelectItem value="State">State</SelectItem>
                        <SelectItem value="Regional">Regional</SelectItem>
                        <SelectItem value="Institute">Institute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {onSave && data.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Lectures"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
