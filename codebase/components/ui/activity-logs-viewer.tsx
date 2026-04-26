"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Input } from "./input";
import { Download, RefreshCw, Search, Filter, Calendar } from "lucide-react";
import { exportActivityLogs } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";
import type { ActivityLog } from "@/lib/types";

interface ActivityLogsViewerProps {
  department?: string;
  showFilters?: boolean;
  maxHeight?: string;
}

export function ActivityLogsViewer({
  department,
  showFilters = true,
  maxHeight = "600px",
}: ActivityLogsViewerProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        throw new Error("Not authenticated");
      }

      const token = await user.getIdToken();
      const url = department
        ? `/api/activity-logs?department=${encodeURIComponent(department)}&limit=50`
        : "/api/activity-logs?limit=50";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activity logs");
      }

      const result = await response.json();
      setLogs(result.logs || []);
    } catch (error: any) {
      console.error("Fetch logs error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load activity logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [department]);

  const handleExport = () => {
    exportActivityLogs(filteredLogs);
    toast({
      title: "Success",
      description: "Activity logs exported successfully",
    });
  };

  // Filter logs based on search and action
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = !selectedAction || log.action === selectedAction;

    return matchesSearch && matchesAction;
  });

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>
              {department ? `${department} Department` : "All Activity"}
              {" - "}
              {filteredLogs.length} of {logs.length} logs
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchLogs}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              disabled={filteredLogs.length === 0}
            >
              <Download className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={selectedAction || ""}
              onChange={(e) => setSelectedAction(e.target.value || null)}
              className="px-3 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action.replace(/_/g, " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div style={{ height: maxHeight, overflowY: "auto" }} className="pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-2 opacity-50" />
              <p>No activity logs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          log.timestamp || log.created_at,
                        ).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{log.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span className="font-medium">{log.user_name}</span>
                      <span>•</span>
                      <span>{log.user_email}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {log.user_role}
                      </Badge>
                      {log.department && (
                        <>
                          <span>•</span>
                          <span>{log.department}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
