import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, message } = await request.json();

    // Validate input
    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.error('[Report API] Missing SMTP configuration');
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Prepare email content
    const timestamp = new Date().toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      dateStyle: 'full',
      timeStyle: 'long',
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'support@theinterviewlab.io',
      subject: 'New Bug Report from InterviewLab',
      text: `
New Bug Report Received

From: ${email}
Submitted: ${timestamp}

Message:
${message}

---
This is an automated message from the InterviewLab bug reporting system.
      `.trim(),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Bug Report</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px 20px;">
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151; font-size: 14px;">From:</strong>
                <p style="margin: 5px 0; color: #1f2937; font-size: 16px;">${email}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151; font-size: 14px;">Submitted:</strong>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${timestamp}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151; font-size: 14px;">Message:</strong>
                <div style="margin: 10px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #3b82f6; border-radius: 4px;">
                  <p style="margin: 0; color: #1f2937; font-size: 15px; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                This is an automated message from the InterviewLab bug reporting system.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log('[Report API] Bug report sent successfully from:', email);

    return NextResponse.json(
      { success: true, message: 'Report submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Report API] Error:', error);
    return NextResponse.json(
      {
        error:
          'Failed to submit report. Please try again or email us directly.',
      },
      { status: 500 }
    );
  }
}
