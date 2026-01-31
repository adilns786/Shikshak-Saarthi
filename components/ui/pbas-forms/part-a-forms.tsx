"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  ChevronDown, 
  ChevronUp,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import {
  PersonalInfo,
  AcademicQualification,
  ResearchDegree,
  PriorAppointment,
  CurrentPost,
  TeachingExperience,
  Course_FDP,
  DEPARTMENTS,
  DESIGNATIONS,
  ACADEMIC_LEVELS,
  NATURE_OF_APPOINTMENTS,
} from "@/lib/pbas-types";

// ============= Personal Information Form =============
interface PersonalInfoFormProps {
  data: Partial<PersonalInfo>;
  onChange: (data: Partial<PersonalInfo>) => void;
  onSave?: () => void;
  loading?: boolean;
}

export function PersonalInfoForm({ data, onChange, onSave, loading }: PersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-accent" />
          Personal Information
        </CardTitle>
        <CardDescription>Basic personal and contact details</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <Label htmlFor="name">Name (in Block Letters) *</Label>
            <Input
              id="name"
              value={data.name || ""}
              onChange={(e) => handleChange("name", e.target.value.toUpperCase())}
              placeholder="DR. JOHN DOE"
              className="uppercase"
            />
          </div>

          {/* Department */}
          <div>
            <Label htmlFor="department">Department *</Label>
            <Select
              value={data.department || ""}
              onValueChange={(value) => handleChange("department", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Designation */}
          <div>
            <Label htmlFor="designation">Current Designation *</Label>
            <Select
              value={data.current_designation || ""}
              onValueChange={(value) => handleChange("current_designation", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Designation" />
              </SelectTrigger>
              <SelectContent>
                {DESIGNATIONS.map((desig) => (
                  <SelectItem key={desig} value={desig}>
                    {desig}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Academic Level */}
          <div>
            <Label htmlFor="academic_level">Academic Level *</Label>
            <Select
              value={data.academic_level || ""}
              onValueChange={(value) => handleChange("academic_level", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Last Promotion Date */}
          <div>
            <Label htmlFor="last_promotion_date">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date of Last Promotion
            </Label>
            <Input
              id="last_promotion_date"
              type="date"
              value={data.last_promotion_date || ""}
              onChange={(e) => handleChange("last_promotion_date", e.target.value)}
            />
          </div>

          {/* CAS Level */}
          <div>
            <Label htmlFor="cas_level">CAS Level Applied For</Label>
            <Select
              value={data.cas_level || ""}
              onValueChange={(value) => handleChange("cas_level", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select CAS Level" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Applied Designation */}
          <div>
            <Label htmlFor="applied_designation">Designation Applied For (CAS)</Label>
            <Input
              id="applied_designation"
              value={data.applied_designation || ""}
              onChange={(e) => handleChange("applied_designation", e.target.value)}
              placeholder="e.g., Associate Professor"
            />
          </div>

          {/* Eligibility Date */}
          <div>
            <Label htmlFor="eligibility_date">Date of Eligibility for Promotion</Label>
            <Input
              id="eligibility_date"
              type="date"
              value={data.eligibility_date || ""}
              onChange={(e) => handleChange("eligibility_date", e.target.value)}
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <Label htmlFor="address">
              <MapPin className="inline h-4 w-4 mr-1" />
              Address (with Pin Code) *
            </Label>
            <Textarea
              id="address"
              value={data.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Complete address with pin code"
              rows={3}
            />
          </div>

          {/* Pin Code */}
          <div>
            <Label htmlFor="pin_code">Pin Code</Label>
            <Input
              id="pin_code"
              value={data.pin_code || ""}
              onChange={(e) => handleChange("pin_code", e.target.value)}
              placeholder="400074"
              maxLength={6}
            />
          </div>

          {/* Mobile */}
          <div>
            <Label htmlFor="mobile">
              <Phone className="inline h-4 w-4 mr-1" />
              Mobile Number *
            </Label>
            <Input
              id="mobile"
              type="tel"
              value={data.mobile || ""}
              onChange={(e) => handleChange("mobile", e.target.value)}
              placeholder="+91-9876543210"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="faculty@vesit.ves.ac.in"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={data.date_of_birth || ""}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
            />
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={data.gender || ""}
              onValueChange={(value) => handleChange("gender", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={data.category || ""}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="OBC">OBC</SelectItem>
                <SelectItem value="SC">SC</SelectItem>
                <SelectItem value="ST">ST</SelectItem>
                <SelectItem value="NT">NT</SelectItem>
                <SelectItem value="VJNT">VJNT</SelectItem>
                <SelectItem value="EWS">EWS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {onSave && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============= Academic Qualifications Form =============
interface QualificationsFormProps {
  data: AcademicQualification[];
  onChange: (data: AcademicQualification[]) => void;
  onSave?: () => void;
  loading?: boolean;
}

export function QualificationsForm({ data, onChange, onSave, loading }: QualificationsFormProps) {
  const addQualification = () => {
    const newQual: AcademicQualification = {
      id: `qual-${Date.now()}`,
      examination: "",
      board_university: "",
      year_passing: "",
      percentage: "",
      division_class_grade: "",
      subject: "",
    };
    onChange([...data, newQual]);
  };

  const updateQualification = (index: number, field: keyof AcademicQualification, value: string) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeQualification = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const examOptions = ["S.S.C.", "H.S.C.", "Diploma", "B.E./B.Tech", "M.E./M.Tech", "B.Sc.", "M.Sc.", "B.C.A.", "M.C.A.", "Other"];

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-accent" />
              Academic Qualifications
            </CardTitle>
            <CardDescription>Qualifications from S.S.C. till Post-Graduation</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addQualification}>
            <Plus className="h-4 w-4 mr-2" />
            Add Qualification
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No qualifications added yet.</p>
            <Button variant="outline" className="mt-4" onClick={addQualification}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Qualification
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((qual, index) => (
              <motion.div
                key={qual.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-foreground">
                    Qualification #{index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQualification(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Examination</Label>
                    <Select
                      value={qual.examination}
                      onValueChange={(value) => updateQualification(index, "examination", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {examOptions.map((exam) => (
                          <SelectItem key={exam} value={exam}>
                            {exam}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Board/University</Label>
                    <Input
                      value={qual.board_university}
                      onChange={(e) => updateQualification(index, "board_university", e.target.value)}
                      placeholder="University of Mumbai"
                    />
                  </div>

                  <div>
                    <Label>Year of Passing</Label>
                    <Input
                      value={qual.year_passing}
                      onChange={(e) => updateQualification(index, "year_passing", e.target.value)}
                      placeholder="2015"
                      maxLength={4}
                    />
                  </div>

                  <div>
                    <Label>Percentage/CGPA</Label>
                    <Input
                      value={qual.percentage}
                      onChange={(e) => updateQualification(index, "percentage", e.target.value)}
                      placeholder="85% or 8.5 CGPA"
                    />
                  </div>

                  <div>
                    <Label>Division/Class/Grade</Label>
                    <Select
                      value={qual.division_class_grade}
                      onValueChange={(value) => updateQualification(index, "division_class_grade", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Class with Distinction">First Class with Distinction</SelectItem>
                        <SelectItem value="First Class">First Class</SelectItem>
                        <SelectItem value="Second Class">Second Class</SelectItem>
                        <SelectItem value="Pass Class">Pass Class</SelectItem>
                        <SelectItem value="Grade A">Grade A</SelectItem>
                        <SelectItem value="Grade B">Grade B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Subject/Specialization</Label>
                    <Input
                      value={qual.subject}
                      onChange={(e) => updateQualification(index, "subject", e.target.value)}
                      placeholder="Computer Science"
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============= Research Degrees Form =============
interface ResearchDegreesFormProps {
  data: ResearchDegree[];
  onChange: (data: ResearchDegree[]) => void;
  onSave?: () => void;
  loading?: boolean;
}

export function ResearchDegreesForm({ data, onChange, onSave, loading }: ResearchDegreesFormProps) {
  const addDegree = () => {
    const newDegree: ResearchDegree = {
      id: `rd-${Date.now()}`,
      degree_type: "Ph.D./D.Phil.",
      title: "",
      date_of_award: "",
      university: "",
      guide_name: "",
      registration_date: "",
    };
    onChange([...data, newDegree]);
  };

  const updateDegree = (index: number, field: keyof ResearchDegree, value: string) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeDegree = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Research Degrees
            </CardTitle>
            <CardDescription>M.Phil., Ph.D., D.Sc., D.Litt. and other research degrees</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addDegree}>
            <Plus className="h-4 w-4 mr-2" />
            Add Degree
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No research degrees added yet.</p>
            <Button variant="outline" className="mt-4" onClick={addDegree}>
              <Plus className="h-4 w-4 mr-2" />
              Add Research Degree
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((degree, index) => (
              <motion.div
                key={degree.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-foreground">
                    Research Degree #{index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDegree(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Degree Type</Label>
                    <Select
                      value={degree.degree_type}
                      onValueChange={(value) => updateDegree(index, "degree_type", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M.Phil.">M.Phil.</SelectItem>
                        <SelectItem value="Ph.D./D.Phil.">Ph.D./D.Phil.</SelectItem>
                        <SelectItem value="D.Sc./D.Litt.">D.Sc./D.Litt.</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>University</Label>
                    <Input
                      value={degree.university}
                      onChange={(e) => updateDegree(index, "university", e.target.value)}
                      placeholder="University of Mumbai"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Thesis Title</Label>
                    <Textarea
                      value={degree.title}
                      onChange={(e) => updateDegree(index, "title", e.target.value)}
                      placeholder="Title of thesis/dissertation"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Guide Name</Label>
                    <Input
                      value={degree.guide_name || ""}
                      onChange={(e) => updateDegree(index, "guide_name", e.target.value)}
                      placeholder="Dr. Guide Name"
                    />
                  </div>

                  <div>
                    <Label>Registration Date</Label>
                    <Input
                      type="date"
                      value={degree.registration_date || ""}
                      onChange={(e) => updateDegree(index, "registration_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Date of Award</Label>
                    <Input
                      type="date"
                      value={degree.date_of_award}
                      onChange={(e) => updateDegree(index, "date_of_award", e.target.value)}
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============= Employment History Form =============
interface EmploymentHistoryFormProps {
  priorAppointments: PriorAppointment[];
  currentPosts: CurrentPost[];
  onChangePrior: (data: PriorAppointment[]) => void;
  onChangeCurrent: (data: CurrentPost[]) => void;
  onSave?: () => void;
  loading?: boolean;
}

export function EmploymentHistoryForm({
  priorAppointments,
  currentPosts,
  onChangePrior,
  onChangeCurrent,
  onSave,
  loading,
}: EmploymentHistoryFormProps) {
  const [showPrior, setShowPrior] = useState(true);
  const [showCurrent, setShowCurrent] = useState(true);

  const addPriorAppointment = () => {
    const newAppt: PriorAppointment = {
      id: `prior-${Date.now()}`,
      designation: "",
      employer_name: "",
      essential_qualifications: "",
      nature_of_appointment: "Regular",
      nature_of_duties: "",
      date_of_joining: "",
      date_of_leaving: "",
      salary_with_grade: "",
      reason_of_leaving: "",
    };
    onChangePrior([...priorAppointments, newAppt]);
  };

  const addCurrentPost = () => {
    const newPost: CurrentPost = {
      id: `current-${Date.now()}`,
      designation: "",
      department: "",
      from_date: "",
      to_date: "",
      grade_pay_level: "",
    };
    onChangeCurrent([...currentPosts, newPost]);
  };

  const updatePriorAppointment = (index: number, field: keyof PriorAppointment, value: string) => {
    const updated = [...priorAppointments];
    updated[index] = { ...updated[index], [field]: value };
    onChangePrior(updated);
  };

  const updateCurrentPost = (index: number, field: keyof CurrentPost, value: string) => {
    const updated = [...currentPosts];
    updated[index] = { ...updated[index], [field]: value };
    onChangeCurrent(updated);
  };

  const removePriorAppointment = (index: number) => {
    onChangePrior(priorAppointments.filter((_, i) => i !== index));
  };

  const removeCurrentPost = (index: number) => {
    onChangeCurrent(currentPosts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Prior Appointments */}
      <Card className="shadow-lg">
        <CardHeader 
          className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-t-lg cursor-pointer"
          onClick={() => setShowPrior(!showPrior)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-accent" />
                Prior Appointments
              </CardTitle>
              <CardDescription>Employment held before joining this institution</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); addPriorAppointment(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
              {showPrior ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </CardHeader>
        {showPrior && (
          <CardContent className="p-6">
            {priorAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No prior appointments added.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {priorAppointments.map((appt, index) => (
                  <motion.div
                    key={appt.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium">Prior Appointment #{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePriorAppointment(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Designation</Label>
                        <Input
                          value={appt.designation}
                          onChange={(e) => updatePriorAppointment(index, "designation", e.target.value)}
                          placeholder="Assistant Professor"
                        />
                      </div>
                      <div>
                        <Label>Employer Name</Label>
                        <Input
                          value={appt.employer_name}
                          onChange={(e) => updatePriorAppointment(index, "employer_name", e.target.value)}
                          placeholder="Organization Name"
                        />
                      </div>
                      <div>
                        <Label>Nature of Appointment</Label>
                        <Select
                          value={appt.nature_of_appointment}
                          onValueChange={(value) => updatePriorAppointment(index, "nature_of_appointment", value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {NATURE_OF_APPOINTMENTS.map((nature) => (
                              <SelectItem key={nature} value={nature}>
                                {nature}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Date of Joining</Label>
                        <Input
                          type="date"
                          value={appt.date_of_joining}
                          onChange={(e) => updatePriorAppointment(index, "date_of_joining", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Date of Leaving</Label>
                        <Input
                          type="date"
                          value={appt.date_of_leaving}
                          onChange={(e) => updatePriorAppointment(index, "date_of_leaving", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Salary with Grade</Label>
                        <Input
                          value={appt.salary_with_grade}
                          onChange={(e) => updatePriorAppointment(index, "salary_with_grade", e.target.value)}
                          placeholder="Level 10"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label>Nature of Duties</Label>
                        <Textarea
                          value={appt.nature_of_duties}
                          onChange={(e) => updatePriorAppointment(index, "nature_of_duties", e.target.value)}
                          placeholder="Teaching, Research, Administration..."
                          rows={2}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label>Reason for Leaving</Label>
                        <Input
                          value={appt.reason_of_leaving}
                          onChange={(e) => updatePriorAppointment(index, "reason_of_leaving", e.target.value)}
                          placeholder="Better opportunity, Career growth, etc."
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Current Posts */}
      <Card className="shadow-lg">
        <CardHeader 
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-t-lg cursor-pointer"
          onClick={() => setShowCurrent(!showCurrent)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                Posts at Current Institution
              </CardTitle>
              <CardDescription>Positions held after joining this institution</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); addCurrentPost(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
              {showCurrent ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </CardHeader>
        {showCurrent && (
          <CardContent className="p-6">
            {currentPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No current posts added.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {currentPosts.map((post, index) => (
                  <motion.div
                    key={post.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-900/10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium">Position #{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCurrentPost(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label>Designation</Label>
                        <Select
                          value={post.designation}
                          onValueChange={(value) => updateCurrentPost(index, "designation", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {DESIGNATIONS.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Select
                          value={post.department}
                          onValueChange={(value) => updateCurrentPost(index, "department", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
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
                      <div>
                        <Label>From Date</Label>
                        <Input
                          type="date"
                          value={post.from_date}
                          onChange={(e) => updateCurrentPost(index, "from_date", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>To Date</Label>
                        <Input
                          type="date"
                          value={post.to_date}
                          onChange={(e) => updateCurrentPost(index, "to_date", e.target.value)}
                          placeholder="Present"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Grade Pay / Pay Matrix Level</Label>
                        <Select
                          value={post.grade_pay_level}
                          onValueChange={(value) => updateCurrentPost(index, "grade_pay_level", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Level" />
                          </SelectTrigger>
                          <SelectContent>
                            {ACADEMIC_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {onSave && (
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Employment History"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============= Teaching Experience Form =============
interface TeachingExperienceFormProps {
  data: TeachingExperience;
  onChange: (data: TeachingExperience) => void;
  onSave?: () => void;
  loading?: boolean;
}

export function TeachingExperienceForm({ data, onChange, onSave, loading }: TeachingExperienceFormProps) {
  const handleChange = (field: keyof TeachingExperience, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-accent" />
          Teaching Experience
        </CardTitle>
        <CardDescription>Period of teaching experience at various levels</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="pg_years">P.G. Classes (in Years)</Label>
            <Input
              id="pg_years"
              value={data.pg_years || ""}
              onChange={(e) => handleChange("pg_years", e.target.value)}
              placeholder="e.g., 5"
            />
          </div>
          <div>
            <Label htmlFor="ug_years">U.G. Classes (in Years)</Label>
            <Input
              id="ug_years"
              value={data.ug_years || ""}
              onChange={(e) => handleChange("ug_years", e.target.value)}
              placeholder="e.g., 10"
            />
          </div>
          <div>
            <Label htmlFor="total_years">Total Experience (in Years)</Label>
            <Input
              id="total_years"
              value={data.total_years || ""}
              onChange={(e) => handleChange("total_years", e.target.value)}
              placeholder="e.g., 15"
            />
          </div>
        </div>

        {onSave && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export all components
export {
  PersonalInfoForm as default,
};
