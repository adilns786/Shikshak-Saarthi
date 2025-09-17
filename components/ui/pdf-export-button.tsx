"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText, Loader2 } from "lucide-react"
import { generateAppraisalPDF, type AppraisalPDFData } from "@/lib/pdf-generator"
import { toast } from "@/hooks/use-toast"

interface PDFExportButtonProps {
  data: AppraisalPDFData
  filename?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function PDFExportButton({
  data,
  filename = "appraisal-report",
  variant = "default",
  size = "default",
  className,
}: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleExport = async () => {
    try {
      setIsGenerating(true)

      const options = {
        title: `Faculty Appraisal Report - ${data.faculty.name}`,
        author: "Shikshak Sarthi System",
        subject: `Appraisal for Academic Year ${data.appraisal.academicYear}`,
        creator: "Shikshak Sarthi Faculty Appraisal System",
      }

      await generateAppraisalPDF(data, options)

      toast({
        title: "PDF Generated",
        description: "Your appraisal report has been generated successfully.",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isGenerating} variant={variant} size={size} className={className}>
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  )
}

interface ReportExportButtonProps {
  reportData: any
  title: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function ReportExportButton({
  reportData,
  title,
  variant = "outline",
  size = "default",
  className,
}: ReportExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleExport = async () => {
    try {
      setIsGenerating(true)

      // Import the reports PDF generator
      const { generateReportsPDF } = await import("@/lib/pdf-generator")

      const options = {
        title: title,
        author: "Shikshak Sarthi System",
        subject: "Faculty Appraisal Analytics Report",
        creator: "Shikshak Sarthi Faculty Appraisal System",
      }

      await generateReportsPDF(reportData, options)

      toast({
        title: "Report Generated",
        description: "Your analytics report has been generated successfully.",
      })
    } catch (error) {
      console.error("Report generation error:", error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isGenerating} variant={variant} size={size} className={className}>
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Export Report
        </>
      )}
    </Button>
  )
}
