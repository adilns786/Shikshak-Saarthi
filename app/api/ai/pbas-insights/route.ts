import { NextRequest, NextResponse } from "next/server";

interface PBASAnalysisRequest {
  profileData: any;
  analysisType?: "summary" | "recommendations" | "comparison" | "forecast";
}

interface Insight {
  id: string;
  type: "recommendation" | "analysis" | "warning" | "achievement";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "teaching" | "research" | "service" | "overall";
}

// Comprehensive analysis function for PBAS data
function generatePBASInsights(profileData: any): Insight[] {
  const insights: Insight[] = [];
  const partB = profileData?.part_b || profileData || {};
  const partA = profileData?.part_a || {};

  // Research Papers Analysis
  const researchPapers = partB?.table2?.researchPapers || [];
  const publications = partB?.table2?.publications || [];
  const totalPubs = researchPapers.length + publications.length;

  // Count indexed papers
  const sciPapers = researchPapers.filter((p: any) => 
    p.indexed_in?.some((i: string) => i.toLowerCase().includes('sci'))
  ).length;
  const scopusPapers = researchPapers.filter((p: any) => 
    p.indexed_in?.some((i: string) => i.toLowerCase().includes('scopus'))
  ).length;
  const ugcPapers = researchPapers.filter((p: any) => 
    p.indexed_in?.some((i: string) => i.toLowerCase().includes('ugc'))
  ).length;

  if (totalPubs === 0) {
    insights.push({
      id: `pub-warn-${Date.now()}`,
      type: "warning",
      title: "No Publications Found",
      description:
        "Publishing research is crucial for academic career progression. Start by documenting your work in peer-reviewed journals. For maximum API score, target SCI/Scopus indexed journals.",
      priority: "high",
      category: "research",
    });
  } else if (totalPubs < 3) {
    insights.push({
      id: `pub-rec-${Date.now()}`,
      type: "recommendation",
      title: "Boost Publication Output",
      description: `You have ${totalPubs} publication(s). For CAS Stage 13A to 14, you need at least 7 publications with 4 in peer-reviewed journals. Consider collaborative research to increase output.`,
      priority: "medium",
      category: "research",
    });
  } else if (totalPubs >= 5) {
    insights.push({
      id: `pub-ach-${Date.now()}`,
      type: "achievement",
      title: "Strong Publication Portfolio",
      description: `Excellent! You have ${totalPubs} publications (${sciPapers} SCI, ${scopusPapers} Scopus, ${ugcPapers} UGC Care). Continue maintaining this trajectory for career advancement.`,
      priority: "low",
      category: "research",
    });
  }

  // First Author Analysis
  const firstAuthorPapers = researchPapers.filter((p: any) => p.is_first_author).length;
  if (researchPapers.length > 0 && firstAuthorPapers === 0) {
    insights.push({
      id: `auth-rec-${Date.now()}`,
      type: "recommendation",
      title: "Lead Your Research",
      description:
        "Being the first author demonstrates research leadership. Aim to lead some research initiatives and publish as the primary author.",
      priority: "medium",
      category: "research",
    });
  }

  // Impact Factor Analysis
  const highImpactPapers = researchPapers.filter((p: any) => (p.impact_factor || 0) > 2).length;
  if (researchPapers.length > 3 && highImpactPapers === 0) {
    insights.push({
      id: `if-rec-${Date.now()}`,
      type: "recommendation",
      title: "Target High-Impact Journals",
      description:
        "Consider submitting to journals with higher impact factors (>2.0). Quality publications in top venues carry more weight in academic evaluations.",
      priority: "medium",
      category: "research",
    });
  }

  // Citation Analysis
  const totalCitations = researchPapers.reduce((sum: number, p: any) => sum + (p.citations || 0), 0);
  if (totalCitations > 50) {
    insights.push({
      id: `cite-ach-${Date.now()}`,
      type: "achievement",
      title: "Research Impact",
      description: `Your work has received ${totalCitations} citations. This indicates significant research impact in your field.`,
      priority: "low",
      category: "research",
    });
  }

  // Research Projects Analysis
  const projects = partB?.table2?.researchProjects || [];
  const consultancy = partB?.table2?.consultancyProjects || [];
  const totalProjects = projects.length + consultancy.length;

  const majorProjects = projects.filter((p: any) => p.project_type === "Major").length;
  const minorProjects = projects.filter((p: any) => p.project_type === "Minor").length;

  const totalFunding = projects.reduce((acc: number, p: any) => {
    return acc + (parseFloat(String(p.amount || 0).replace(/[^0-9.-]/g, "")) || 0);
  }, 0);

  if (totalProjects === 0) {
    insights.push({
      id: `proj-rec-${Date.now()}`,
      type: "recommendation",
      title: "Apply for Research Grants",
      description:
        "Research projects demonstrate your ability to conceptualize and execute funded research. Apply to DST, AICTE, UGC, or industry for project funding.",
      priority: "medium",
      category: "research",
    });
  } else {
    if (majorProjects > 0) {
      insights.push({
        id: `proj-ach-${Date.now()}`,
        type: "achievement",
        title: "Major Research Funding",
        description: `You have ${majorProjects} major project(s) (>₹10 Lakhs) with total funding of ₹${(totalFunding / 100000).toFixed(2)} Lakhs. This significantly strengthens your research profile.`,
        priority: "low",
        category: "research",
      });
    }
    if (consultancy.length > 0) {
      insights.push({
        id: `cons-ach-${Date.now()}`,
        type: "achievement",
        title: "Industry Connect",
        description: `You have ${consultancy.length} consultancy project(s). This demonstrates industry relevance and practical application of your expertise.`,
        priority: "low",
        category: "research",
      });
    }
  }

  // Patents Analysis
  const patents = partB?.patents || [];
  const grantedPatents = patents.filter((p: any) => p.status === "Granted").length;
  const publishedPatents = patents.filter((p: any) => p.status === "Published").length;

  if (patents.length > 0) {
    if (grantedPatents > 0) {
      insights.push({
        id: `pat-ach-${Date.now()}`,
        type: "achievement",
        title: "Patent Holder",
        description: `Excellent! You have ${grantedPatents} granted patent(s). This is a significant achievement demonstrating innovation and commercial potential.`,
        priority: "low",
        category: "research",
      });
    } else {
      insights.push({
        id: `pat-anal-${Date.now()}`,
        type: "analysis",
        title: "Patent Portfolio",
        description: `You have ${patents.length} patent(s) (${publishedPatents} published, ${patents.length - publishedPatents - grantedPatents} filed). Follow up on filed patents for grant.`,
        priority: "medium",
        category: "research",
      });
    }
  } else {
    insights.push({
      id: `pat-rec-${Date.now()}`,
      type: "recommendation",
      title: "Innovate and Patent",
      description:
        "Patents significantly boost your API score. Consider patenting your innovative research work. Design patents are a good starting point.",
      priority: "medium",
      category: "research",
    });
  }

  // Research Guidance Analysis
  const guidance = partB?.table2?.researchGuidance || [];
  const phdStudents = guidance.filter((g: any) => g.degree === "Ph.D.").length;
  const awardedPhDs = guidance.filter((g: any) => g.degree === "Ph.D." && g.status === "Awarded").length;
  const ongoingPhDs = guidance.filter((g: any) => g.degree === "Ph.D." && g.status === "Ongoing").length;

  if (phdStudents > 0) {
    insights.push({
      id: `guide-ach-${Date.now()}`,
      type: "achievement",
      title: "Research Mentorship",
      description: `You are supervising ${phdStudents} Ph.D. student(s) (${awardedPhDs} awarded, ${ongoingPhDs} ongoing). Each awarded Ph.D. contributes 30 points to your API score.`,
      priority: "low",
      category: "research",
    });
  } else {
    insights.push({
      id: `guide-rec-${Date.now()}`,
      type: "recommendation",
      title: "Guide Research Scholars",
      description:
        "If eligible as Ph.D. guide, consider taking research scholars. Ph.D. guidance is highly valued in CAS promotions.",
      priority: "medium",
      category: "research",
    });
  }

  // FDP/Professional Development Analysis
  const courses = partA?.courses_fdp || [];
  const recentCourses = courses.filter((c: any) => {
    const year = c.start_date ? new Date(c.start_date).getFullYear() : 0;
    return year >= new Date().getFullYear() - 2;
  });

  if (courses.length === 0) {
    insights.push({
      id: `fdp-warn-${Date.now()}`,
      type: "warning",
      title: "Professional Development Required",
      description:
        "Orientation/Refresher courses are mandatory for CAS promotions. Attend at least one FDP, STTP, or refresher course per year.",
      priority: "high",
      category: "teaching",
    });
  } else if (recentCourses.length === 0) {
    insights.push({
      id: `fdp-rec-${Date.now()}`,
      type: "recommendation",
      title: "Update Your Skills",
      description: `Your last FDP/course was over 2 years ago. Stay updated with emerging technologies and pedagogical methods through recent programs.`,
      priority: "medium",
      category: "teaching",
    });
  } else {
    const moocs = courses.filter((c: any) => c.type === "MOOC").length;
    insights.push({
      id: `fdp-anal-${Date.now()}`,
      type: "analysis",
      title: "Continuous Learning",
      description: `You have completed ${courses.length} professional development course(s) including ${recentCourses.length} in the last 2 years${moocs > 0 ? ` and ${moocs} MOOC(s)` : ""}.`,
      priority: "low",
      category: "teaching",
    });
  }

  // Invited Lectures Analysis
  const lectures = partB?.invited_lectures || [];
  const intlLectures = lectures.filter((l: any) => l.level === "International").length;
  const nationalLectures = lectures.filter((l: any) => l.level === "National").length;
  const keynotes = lectures.filter((l: any) => l.type === "Keynote").length;

  if (lectures.length > 0) {
    insights.push({
      id: `lec-ach-${Date.now()}`,
      type: "achievement",
      title: "Academic Recognition",
      description: `You have delivered ${lectures.length} invited lecture(s)${keynotes > 0 ? ` including ${keynotes} keynote(s)` : ""} (${intlLectures} International, ${nationalLectures} National). This reflects your expertise recognition.`,
      priority: "low",
      category: "service",
    });
  } else {
    insights.push({
      id: `lec-rec-${Date.now()}`,
      type: "recommendation",
      title: "Share Your Expertise",
      description:
        "Accept invitations to speak at conferences, FDPs, and workshops. This enhances visibility and contributes to your service profile.",
      priority: "medium",
      category: "service",
    });
  }

  // Awards Analysis
  const awards = partB?.awards || [];
  const nationalAwards = awards.filter((a: any) => a.category === "National" || a.category === "International").length;

  if (awards.length > 0) {
    insights.push({
      id: `award-ach-${Date.now()}`,
      type: "achievement",
      title: "Recognized Excellence",
      description: `You have received ${awards.length} award(s)${nationalAwards > 0 ? ` including ${nationalAwards} at national/international level` : ""}. These recognitions validate your contributions.`,
      priority: "low",
      category: "overall",
    });
  }

  // Teaching Analysis
  const teachingData = partB?.table1?.teaching_data || {};
  if (teachingData.self_appraisal_grading) {
    const grading = teachingData.self_appraisal_grading;
    if (grading === "Good") {
      insights.push({
        id: `teach-anal-${Date.now()}`,
        type: "analysis",
        title: "Teaching Performance",
        description:
          "Your self-assessed teaching grading is 'Good'. Maintain student feedback scores and documentation for verified grading.",
        priority: "low",
        category: "teaching",
      });
    }
  }

  // Administrative Duties
  const adminResp = partB?.table1?.admin_responsibilities || [];
  if (adminResp.length > 0) {
    insights.push({
      id: `admin-anal-${Date.now()}`,
      type: "analysis",
      title: "Administrative Contribution",
      description: `You have held ${adminResp.length} administrative position(s). Institutional service is valued and contributes to Category II API score.`,
      priority: "low",
      category: "service",
    });
  }

  // Overall API Score Estimation
  const estimatedScore = calculateEstimatedAPIScore(partA, partB);
  insights.push({
    id: `api-overall-${Date.now()}`,
    type: "analysis",
    title: "Estimated API Score",
    description: `Based on your current data, your estimated Category III API score is approximately ${estimatedScore} points. For Stage promotions, ensure you meet minimum requirements in all categories.`,
    priority: "medium",
    category: "overall",
  });

  return insights;
}

// Estimate API score based on PBAS data
function calculateEstimatedAPIScore(partA: any, partB: any): number {
  let score = 0;

  // Research Papers (10-15 points each based on indexing)
  const papers = partB?.table2?.researchPapers || [];
  papers.forEach((p: any) => {
    let paperScore = 10;
    if (p.indexed_in?.includes("SCI") || p.indexed_in?.includes("SCIE")) paperScore = 15;
    else if (p.indexed_in?.includes("Scopus")) paperScore = 12;
    if (p.is_first_author) paperScore += 2;
    score += paperScore;
  });

  // Publications (10-30 points)
  const pubs = partB?.table2?.publications || [];
  pubs.forEach((p: any) => {
    if (p.type === "Book") score += 30;
    else if (p.type === "Chapter") score += 10;
    else score += 10;
  });

  // Research Projects (Major: 30, Minor: 15)
  const projects = partB?.table2?.researchProjects || [];
  projects.forEach((p: any) => {
    if (p.project_type === "Major") score += 30;
    else score += 15;
  });

  // Patents (30 for granted, 15 for filed)
  const patents = partB?.patents || [];
  patents.forEach((p: any) => {
    if (p.status === "Granted") score += 30;
    else if (p.status === "Published") score += 20;
    else score += 10;
  });

  // Research Guidance (30 per awarded PhD)
  const guidance = partB?.table2?.researchGuidance || [];
  guidance.forEach((g: any) => {
    if (g.degree === "Ph.D." && g.status === "Awarded") score += 30;
    else if (g.degree === "Ph.D.") score += 10;
  });

  // Invited Lectures (10-20 based on level)
  const lectures = partB?.invited_lectures || [];
  lectures.forEach((l: any) => {
    if (l.level === "International") score += 20;
    else if (l.level === "National") score += 15;
    else score += 10;
  });

  return Math.round(score);
}

// Generate summary
function generateSummary(profileData: any): string {
  const partB = profileData?.part_b || profileData || {};
  const partA = profileData?.part_a || {};

  const papers = partB?.table2?.researchPapers?.length || 0;
  const pubs = partB?.table2?.publications?.length || 0;
  const projects = (partB?.table2?.researchProjects?.length || 0) + (partB?.table2?.consultancyProjects?.length || 0);
  const patents = partB?.patents?.length || 0;
  const guidance = partB?.table2?.researchGuidance?.length || 0;
  const lectures = partB?.invited_lectures?.length || 0;
  const courses = partA?.courses_fdp?.length || 0;

  const estimatedScore = calculateEstimatedAPIScore(partA, partB);

  return `Your academic profile includes ${papers + pubs} publication(s), ${projects} research project(s), ${patents} patent(s), ${guidance} research student(s) under supervision, ${lectures} invited lecture(s), and ${courses} professional development course(s). Your estimated Category III API score is approximately ${estimatedScore} points. ${
    estimatedScore >= 300 ? "Your research profile is strong for higher academic positions." : 
    estimatedScore >= 150 ? "Your profile is developing well. Continue adding quality research outputs." :
    "Focus on building your research portfolio for career advancement."
  }`;
}

// Generate recommendations
function generateRecommendations(profileData: any): string[] {
  const recommendations: string[] = [];
  const partB = profileData?.part_b || profileData || {};
  const partA = profileData?.part_a || {};

  const papers = partB?.table2?.researchPapers || [];
  const projects = partB?.table2?.researchProjects || [];
  const patents = partB?.patents || [];
  const courses = partA?.courses_fdp || [];

  if (papers.length < 5) {
    recommendations.push("Publish 2-3 papers per year in SCI/Scopus/UGC Care indexed journals.");
  }
  if (projects.length === 0) {
    recommendations.push("Apply for funded research projects from DST, AICTE, UGC, or industry.");
  }
  if (patents.length === 0) {
    recommendations.push("Consider filing patents for your innovative research work.");
  }
  if (courses.length < 2) {
    recommendations.push("Attend at least one FDP/STTP per year for continuous learning.");
  }
  
  recommendations.push("Collaborate on interdisciplinary research for broader impact.");
  recommendations.push("Present at national and international conferences.");
  recommendations.push("Consider writing textbooks or contributing book chapters.");
  recommendations.push("Apply for national/state awards in your area of expertise.");

  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    const body: PBASAnalysisRequest = await request.json();
    const { profileData, analysisType } = body;

    const insights = generatePBASInsights(profileData);
    const summary = generateSummary(profileData);
    const recommendations = generateRecommendations(profileData);

    // Comparison with department averages
    const partB = profileData?.part_b || profileData || {};
    const comparisonData = [
      {
        metric: "Publications",
        user_value: (partB?.table2?.researchPapers?.length || 0) + (partB?.table2?.publications?.length || 0),
        department_avg: 5,
        percentile: Math.min(100, Math.round((((partB?.table2?.researchPapers?.length || 0) + (partB?.table2?.publications?.length || 0)) / 7) * 100)),
      },
      {
        metric: "Projects",
        user_value: (partB?.table2?.researchProjects?.length || 0),
        department_avg: 2,
        percentile: Math.min(100, Math.round(((partB?.table2?.researchProjects?.length || 0) / 3) * 100)),
      },
      {
        metric: "Patents",
        user_value: partB?.patents?.length || 0,
        department_avg: 1,
        percentile: Math.min(100, Math.round(((partB?.patents?.length || 0) / 2) * 100)),
      },
      {
        metric: "PhD Guidance",
        user_value: partB?.table2?.researchGuidance?.filter((g: any) => g.degree === "Ph.D.").length || 0,
        department_avg: 1,
        percentile: Math.min(100, Math.round(((partB?.table2?.researchGuidance?.filter((g: any) => g.degree === "Ph.D.").length || 0) / 2) * 100)),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        insights,
        summary,
        recommendations,
        comparison_data: comparisonData,
        generated_at: new Date().toISOString(),
        model: "PBAS-Analyzer-v1 (Local)",
      },
    });
  } catch (error: any) {
    console.error("PBAS Analysis Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate PBAS analysis",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "PBAS AI Analysis API",
    description: "Generate AI-powered insights for faculty PBAS data",
    usage: {
      method: "POST",
      body: {
        profileData: "Faculty profile data object containing part_a and part_b",
        analysisType: "Optional: summary | recommendations | comparison | forecast",
      },
    },
    features: [
      "Research publication analysis",
      "Project funding insights",
      "Patent portfolio assessment",
      "Research guidance evaluation",
      "Professional development tracking",
      "API score estimation",
      "Personalized recommendations",
    ],
  });
}
