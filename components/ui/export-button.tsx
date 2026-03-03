"use client";

import { useState } from "react";
import { Button } from "./button";
import { Download, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { exportFacultyData, exportDepartmentData } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  type: "faculty" | "department";
  userId?: string;
  department?: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ExportButton({
  type,
  userId,
  department,
  label,
  variant = "outline",
  size = "default",
  className = "",
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setLoading(true);

      // Get auth token
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to export data",
          variant: "destructive",
        });
        return;
      }

      const token = await user.getIdToken();

      if (type === "faculty") {
        // Export faculty data
        const url = userId
          ? `/api/export/faculty?userId=${userId}`
          : "/api/export/faculty";

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch faculty data");
        }

        const result = await response.json();
        exportFacultyData(result.data);

        toast({
          title: "Success",
          description: "Faculty data exported successfully",
        });
      } else if (type === "department") {
        // Export department data
        const url = department
          ? `/api/export/department?department=${encodeURIComponent(department)}`
          : "/api/export/department";

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch department data");
        }

        const result = await response.json();
        exportDepartmentData(result.data);

        toast({
          title: "Success",
          description: `Department data exported successfully (${result.count} records)`,
        });
      }
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultLabel =
    type === "faculty" ? "Export My Data" : "Export Department Data";

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {label || defaultLabel}
        </>
      )}
    </Button>
  );
}
