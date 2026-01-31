import { NextRequest, NextResponse } from "next/server";

// Email notification types
type NotificationType = 
  | "account_created"
  | "hod_account_created"
  | "form_submitted"
  | "form_approved"
  | "form_rejected"
  | "form_revision_requested"
  | "reminder";

interface NotificationRequest {
  recipientEmail: string;
  recipientName: string;
  type: NotificationType;
  data?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationRequest = await request.json();
    const { recipientEmail, recipientName, type, data } = body;

    if (!recipientEmail || !recipientName || !type) {
      return NextResponse.json(
        { error: "Missing required fields: recipientEmail, recipientName, type" },
        { status: 400 }
      );
    }

    // Generate email content based on type
    const emailContent = generateEmailContent(type, recipientName, data);

    // Try to send email if Resend is configured
    let emailSent = false;
    
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Shikshak Sarthi <noreply@shikshaksarthi.in>",
          to: recipientEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        
        emailSent = true;
      } catch (sendError) {
        console.log("Email sending failed:", sendError);
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? "Email sent successfully" : "Email service not configured",
      emailSent,
    });
  } catch (error: unknown) {
    console.error("Send notification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send notification";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function generateEmailContent(
  type: NotificationType,
  recipientName: string,
  data?: Record<string, string>
): { subject: string; html: string } {
  const templates: Record<NotificationType, { subject: string; content: string; icon: string; color: string }> = {
    account_created: {
      subject: "Welcome to Shikshak Sarthi!",
      content: `Your faculty account has been created successfully. You can now log in with your credentials.`,
      icon: "👋",
      color: "#10b981",
    },
    hod_account_created: {
      subject: "HOD Account Created - Shikshak Sarthi",
      content: `You have been assigned as Head of Department${data?.department ? ` for ${data.department}` : ""}. You now have access to review and manage faculty appraisals.`,
      icon: "👑",
      color: "#f59e0b",
    },
    form_submitted: {
      subject: "PBAS Form Submitted Successfully",
      content: `Your PBAS form has been submitted and is now pending review by your HOD.`,
      icon: "📋",
      color: "#3b82f6",
    },
    form_approved: {
      subject: "PBAS Form Approved!",
      content: `Congratulations! Your PBAS form has been approved.`,
      icon: "✅",
      color: "#10b981",
    },
    form_rejected: {
      subject: "PBAS Form Requires Attention",
      content: `Your PBAS form requires revision. Please check the comments and resubmit.`,
      icon: "⚠️",
      color: "#ef4444",
    },
    form_revision_requested: {
      subject: "Revision Requested for PBAS Form",
      content: `Your HOD has requested revisions to your PBAS form. Please review the feedback and update accordingly.`,
      icon: "📝",
      color: "#f59e0b",
    },
    reminder: {
      subject: "Reminder: PBAS Form Submission",
      content: `This is a reminder to submit your PBAS form before the deadline.`,
      icon: "⏰",
      color: "#6366f1",
    },
  };

  const template = templates[type];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <tr>
                <td style="background: linear-gradient(135deg, #2b2d42 0%, #1a1a2e 100%); padding: 40px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 16px;">${template.icon}</div>
                  <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Shikshak Sarthi</h1>
                  <p style="color: #8d99ae; margin: 8px 0 0;">Faculty Appraisal System</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #1e293b; font-size: 22px; margin: 0 0 16px;">Hello, ${recipientName}!</h2>
                  <p style="color: #64748b; font-size: 16px; line-height: 1.6;">${template.content}</p>
                  
                  ${data?.tempPassword ? `
                  <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0;">
                    <p style="color: #475569; font-size: 14px; margin: 0 0 12px;"><strong>Your temporary password:</strong></p>
                    <code style="background-color: #e2e8f0; padding: 8px 16px; border-radius: 6px; font-size: 18px; color: #1e293b;">${data.tempPassword}</code>
                    <p style="color: #64748b; font-size: 12px; margin: 16px 0 0;">Please change this password after your first login.</p>
                  </div>
                  ` : ""}
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login" 
                       style="display: inline-block; background-color: ${template.color}; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                      Go to Dashboard
                    </a>
                  </div>
                  
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                  <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                    © 2024 Shikshak Sarthi - VESIT Faculty Appraisal System<br>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/help" style="color: #64748b;">Need help?</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject: template.subject, html };
}
