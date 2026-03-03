/**
 * Activity Logger Utility
 * Logs user activities to Firestore for audit trails
 */

import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db as firestore } from "./firebase";
import type { ActivityLog } from "./types";

export interface LogActivityParams {
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  department?: string;
  action: string;
  description: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log a user activity to Firestore
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const activityLog: Omit<ActivityLog, "id" | "created_at"> = {
      user_id: params.userId,
      user_email: params.userEmail,
      user_name: params.userName,
      user_role: params.userRole,
      department: params.department,
      action: params.action,
      description: params.description,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      metadata: params.metadata,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
      timestamp: new Date().toISOString(),
    };

    await addDoc(collection(firestore, "activity_logs"), {
      ...activityLog,
      created_at: Timestamp.now(),
    });

    console.log("✅ Activity logged:", params.action);
  } catch (error) {
    console.error("❌ Failed to log activity:", error);
    // Don't throw error - logging should not break the main flow
  }
}

/**
 * Client-side activity logger with automatic user detection
 */
export async function logClientActivity(
  action: string,
  description: string,
  options?: {
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
  },
): Promise<void> {
  try {
    // Get IP and user agent from client
    const userAgent = navigator.userAgent;

    // Call API to log activity
    await fetch("/api/activity-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        description,
        resourceType: options?.resourceType,
        resourceId: options?.resourceId,
        metadata: options?.metadata,
        userAgent,
      }),
    });
  } catch (error) {
    console.error("❌ Failed to log client activity:", error);
  }
}

/**
 * Activity action constants
 */
export const ACTIVITY_ACTIONS = {
  // Authentication
  LOGIN: "login",
  LOGOUT: "logout",
  REGISTER: "register",
  PASSWORD_RESET: "password_reset",
  PASSWORD_CHANGE: "password_change",

  // User Management
  USER_CREATE: "user_create",
  USER_UPDATE: "user_update",
  USER_DELETE: "user_delete",
  USER_VIEW: "user_view",

  // PBAS Forms
  FORM_CREATE: "form_create",
  FORM_UPDATE: "form_update",
  FORM_SUBMIT: "form_submit",
  FORM_VIEW: "form_view",
  FORM_DELETE: "form_delete",
  FORM_APPROVE: "form_approve",
  FORM_REJECT: "form_reject",

  // Publications
  PUBLICATION_ADD: "publication_add",
  PUBLICATION_UPDATE: "publication_update",
  PUBLICATION_DELETE: "publication_delete",
  PUBLICATION_VIEW: "publication_view",

  // Reports & Exports
  REPORT_GENERATE: "report_generate",
  DATA_EXPORT: "data_export",
  LOGS_VIEW: "logs_view",

  // Dashboard
  DASHBOARD_VIEW: "dashboard_view",
  PROFILE_VIEW: "profile_view",

  // AI/Chatbot
  AI_QUERY: "ai_query",
  CHATBOT_USE: "chatbot_use",
} as const;

/**
 * Get client IP address (from request headers in API routes)
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return real || "unknown";
}
