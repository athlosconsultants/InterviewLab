# Email Configuration Setup

## Overview

The bug reporting feature uses Nodemailer to send email notifications to the support team when users submit problem reports.

## Required Environment Variables

Add the following variables to your `.env.local` file:

```bash
# SMTP Configuration for Bug Reports
SMTP_HOST=smtp.zoho.eu
SMTP_PORT=465
SMTP_USER=support@theinterviewlab.io
SMTP_PASS=your_app_password_here
```

## Getting Your SMTP Credentials

### Using Zoho Mail

1. **Log in to Zoho Mail** with your support@theinterviewlab.io account

2. **Generate an App Password**:
   - Go to Settings → Security → App Passwords
   - Generate a new app password for "InterviewLab Bug Reports"
   - Copy the generated password

3. **Update .env.local**:
   - Paste the app password as the value for `SMTP_PASS`

### SMTP Settings for Zoho EU

- **Host**: `smtp.zoho.eu`
- **Port**: `465` (SSL)
- **Security**: SSL/TLS
- **Authentication**: Required

## Testing the Email Configuration

1. **Start your development server**:

   ```bash
   pnpm dev
   ```

2. **Navigate to the Report page**:

   ```
   http://localhost:3000/report
   ```

3. **Submit a test report**:
   - Enter your email
   - Write a test message
   - Click "Submit Report"

4. **Check the support@theinterviewlab.io inbox**:
   - You should receive an email with the report
   - Subject: "New Bug Report from InterviewLab"

## Email Template

The bug report emails are formatted with:

- Clean HTML template with gradient header
- Reporter's email address
- Timestamp (Australia/Sydney timezone)
- Full message content
- Styled with the InterviewLab brand colors

## Troubleshooting

### Common Issues

**Error: "Email service is not configured"**

- Check that all SMTP environment variables are set in `.env.local`
- Restart your development server after adding env variables

**Error: "Authentication failed"**

- Verify your app password is correct
- Make sure you're using an app password, not your regular account password
- Check that the SMTP_USER email matches your Zoho account

**Error: "Connection timeout"**

- Verify SMTP_HOST is correct (`smtp.zoho.eu`)
- Verify SMTP_PORT is `465`
- Check your firewall/network settings

**Emails not being received**

- Check spam/junk folder
- Verify the "to" address in the API route (`support@theinterviewlab.io`)
- Check Zoho's sending limits

## Security Notes

- **Never commit** your `.env.local` file to git
- Use app-specific passwords, not your main email password
- The SMTP credentials are only used server-side (API routes)
- Client code never sees these credentials

## Production Deployment

For production (Vercel/Netlify):

1. Add the SMTP environment variables in your hosting platform's dashboard
2. Ensure they match your production email service
3. Test the bug reporting feature after deployment
4. Monitor your email service for rate limits

## Rate Limiting

Consider implementing rate limiting on the `/api/report` endpoint to prevent spam:

- Limit submissions per IP address
- Limit submissions per email address
- Add CAPTCHA for additional protection

## Alternative Email Services

If you switch from Zoho, update the SMTP settings accordingly:

### Gmail

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=465
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### AWS SES

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=465
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## Support

For issues with email configuration, contact the development team or check the Nodemailer documentation at https://nodemailer.com/
