# Authentication Setup Guide

## Overview

This project implements robust Supabase authentication with automatic fallback for in-app browsers (TikTok, Instagram, Facebook, etc.).

## Features

- **OTP-Only Authentication**: Secure 6-digit code verification for all users
- **Universal Compatibility**: Works in all browsers (standard and in-app)
- **Robust Fallback**: Multiple strategies in callback route
- **User-Friendly Errors**: Helpful guidance when auth fails
- **Branded Email**: Professional email template with InterviewLab branding

## Supabase Email Template Configuration

### Required Setup

You must configure your Supabase email templates to support both magic links and OTP codes.

#### 1. OTP Email Template

Go to: **Supabase Dashboard → Authentication → Email Templates → Magic Link**

**We have created a professional, branded OTP-only email template for you!**

📧 **Full template location**: `docs/SUPABASE_EMAIL_TEMPLATE_OTP.html`

The template includes:

- ✨ Beautiful cyan-to-blue gradient design matching the app
- 🎨 InterviewLab branding with logo
- 📱 Mobile-responsive layout
- 🔐 Large, clear 6-digit code display
- ⏰ Security notes and expiration warning
- 💼 Professional styling with gradient orb background

**To use it:**

1. Open `docs/SUPABASE_EMAIL_TEMPLATE_OTP.html`
2. Copy the entire HTML content
3. Paste it into your Supabase Magic Link email template
4. Ensure your Supabase Site URL is set to `https://theinterviewlab.io`
5. Save and test!

**Note:** The template uses `{{ .SiteURL }}/logo.png` which will automatically resolve to `https://theinterviewlab.io/logo.png`

#### 2. Email Template Variables

- `{{ .Token }}` - 6-digit OTP code (required)
- `{{ .SiteURL }}` - Your site URL
- `{{ .TokenHash }}` - Token hash (for advanced use)

**Note**: `{{ .ConfirmationURL }}` (magic link) is not used in the OTP-only template.

### Template Customization Tips

1. **Styling**: Use inline CSS for email compatibility
2. **Branding**: Add your logo and brand colors
3. **Clear Instructions**: Explain both methods
4. **Expiration**: Clearly state expiration times
5. **Support**: Include support email link

## Auth Flow

### OTP Authentication Flow (Universal)

1. User enters email on `/sign-in`
2. System sends email with 6-digit OTP code
3. User receives branded email with code
4. User enters code in verification UI
5. Code verified via Supabase
6. Device fingerprint bound to account
7. Session created, user redirected to app

**Benefits of OTP-Only:**
- Works reliably in all browsers (standard and in-app)
- No magic link callback complexity
- Better security with short-lived codes
- Consistent user experience

### Callback Route Strategies

The `/auth/callback` route tries multiple strategies in order:

1. **Code Exchange**: `exchangeCodeForSession(code)` - Primary method
2. **Direct Token**: `setSession({ access_token, refresh_token })` - Fallback
3. **Session Check**: `getSession()` - Check for existing session
4. **Error Redirect**: If all fail, redirect to error page

## Testing

### Test In-App Browser Detection

```javascript
// In browser console
console.log(navigator.userAgent);
```

Supported patterns:

- `fban` / `fbav` - Facebook
- `instagram` - Instagram
- `tiktok` - TikTok
- `snapchat` - Snapchat
- `line` - LINE
- `micromessenger` - WeChat
- `twitter` - Twitter/X

### Test OTP Flow

1. Modify user agent in dev tools:

   ```
   Chrome DevTools → Network Conditions → User Agent → Custom:
   Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Instagram
   ```

2. Navigate to `/sign-in`
3. Should see OTP UI automatically

### Test Magic Link Flow

1. Use standard user agent
2. Navigate to `/sign-in`
3. Should see magic link UI
4. Check email for clickable link

## Security Considerations

### Token Expiration

- Magic links: 5 minutes (Supabase default)
- OTP codes: 5 minutes (Supabase default)
- Sessions: 1 hour (refresh tokens handle renewal)

### Rate Limiting

Supabase provides built-in rate limiting:

- Email sends: 4 per hour per email
- OTP verification attempts: Limited by Supabase

### PKCE Flow

The auth implementation uses PKCE (Proof Key for Code Exchange) automatically via Supabase SSR package.

## Troubleshooting

### Email Deliverability Issues

1. Check Supabase email settings are configured
2. Verify sender email is authenticated
3. Check spam/junk folders
4. Ensure email template includes `{{ .Token }}`

### OTP Codes Not Working

1. Check Supabase email template includes `{{ .Token }}`
2. Verify OTP verification call: `verifyOtp({ email, token, type: 'email' })`
3. Check for typos in 6-digit code
4. Ensure code hasn't expired (5 minutes)

### Session Issues

1. Check cookies are enabled
2. Verify Supabase URL and anon key are correct
3. Clear browser cookies and try again
4. Check device fingerprint binding completes

### Callback Errors

Check server logs for detailed error messages:

- Code exchange failures
- Token setting failures
- Session check failures

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## File Structure

```
lib/
  browser-detection.ts        # In-app browser detection
  supabase-client.ts          # Browser client
  supabase-server.ts          # Server client

app/(auth)/
  sign-in/page.tsx            # Login page with OTP support

app/auth/
  callback/route.ts           # Hardened callback with fallbacks
  auth-code-error/page.tsx    # User-friendly error page

app/actions/
  auth.ts                     # Server actions (signOut)
```

## Support

For issues:

1. Check Supabase logs in dashboard
2. Review browser console for errors
3. Test with different browsers
4. Contact support at support@theinterviewlab.io
