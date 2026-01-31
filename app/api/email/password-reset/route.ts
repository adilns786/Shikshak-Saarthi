import { NextRequest, NextResponse } from "next/server";

// Email API for password reset notifications
// Note: To enable actual email sending, install resend: pnpm add resend
// And set RESEND_API_KEY and RESEND_FROM_EMAIL in .env

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Try to send email if Resend is configured
    let emailSent = false;
    
    if (process.env.RESEND_API_KEY) {
      try {
        // Dynamic import to avoid build errors when resend is not installed
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Shikshak Sarthi <noreply@shikshaksarthi.in>",
          to: email,
          subject: "Password Reset Request - Shikshak Sarthi",
          html: getPasswordResetEmailTemplate(),
        });
        
        emailSent = true;
      } catch (sendError) {
        console.log("Email sending failed (Resend may not be installed):", sendError);
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? "Password reset notification sent" 
        : "Password reset initiated via Firebase",
      emailSent,
    });
  } catch (error: unknown) {
    console.error("Password reset email error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function getPasswordResetEmailTemplate(): string {
  return `
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
                  <h1 style="color: #ffffff; font-size: 24px; margin: 0;">🔐 Password Reset</h1>
                  <p style="color: #8d99ae; margin: 8px 0 0;">Shikshak Sarthi</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #1e293b; font-size: 22px; margin: 0 0 16px; text-align: center;">Password Reset Requested</h2>
                  <p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center;">
                    We received a request to reset your password. Check your email for the Firebase reset link.
                  </p>
                  <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="color: #92400e; font-size: 14px; margin: 0;">
                      ⚠️ If you didn't request this, please ignore this email.
                    </p>
                  </div>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                  <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                    © 2024 Shikshak Sarthi - VESIT Faculty Appraisal System
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
}
