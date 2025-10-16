# Authentication Setup Guide

## Overview

This project implements robust Supabase authentication with automatic fallback for in-app browsers (TikTok, Instagram, Facebook, etc.).

## Features

- **Smart Browser Detection**: Automatically detects in-app browsers
- **Dual Auth Methods**:
  - Magic links for standard browsers
  - 6-digit OTP codes for in-app browsers
- **Robust Fallback**: Multiple strategies in callback route
- **User-Friendly Errors**: Helpful guidance when auth fails

## Supabase Email Template Configuration

### Required Setup

You must configure your Supabase email templates to support both magic links and OTP codes.

#### 1. Magic Link / OTP Email Template

Go to: **Supabase Dashboard → Authentication → Email Templates → Magic Link**

Update the template to include BOTH:

```html
<h2>Sign in to InterviewLab</h2>

<!-- For standard browsers (magic link) -->
<p>Click the link below to sign in:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>

<!-- For in-app browsers (OTP code) -->
<p>Or use this 6-digit code:</p>
<h1
  style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; margin: 20px 0;"
>
  {{ .Token }}
</h1>

<p><small>This code expires in 5 minutes.</small></p>
```

#### 2. Email Template Variables

- `{{ .ConfirmationURL }}` - Magic link for standard browsers
- `{{ .Token }}` - 6-digit OTP code for in-app browsers
- `{{ .SiteURL }}` - Your site URL
- `{{ .TokenHash }}` - Token hash (for advanced use)

### Template Customization Tips

1. **Styling**: Use inline CSS for email compatibility
2. **Branding**: Add your logo and brand colors
3. **Clear Instructions**: Explain both methods
4. **Expiration**: Clearly state expiration times
5. **Support**: Include support email link

## Auth Flow

### Standard Browser Flow

1. User enters email on `/sign-in`
2. Receives email with magic link
3. Clicks link → redirected to `/auth/callback`
4. Callback route exchanges code for session
5. User redirected to app

### In-App Browser Flow

1. User enters email on `/sign-in` (in-app detected)
2. Receives email with 6-digit OTP code
3. Enters code in verification UI
4. Code verified client-side
5. Session created, user redirected to app

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

### Magic Links Not Working

1. Check Supabase email template includes `{{ .ConfirmationURL }}`
2. Verify `emailRedirectTo` points to `/auth/callback`
3. Check Site URL in Supabase settings
4. Ensure redirect URL is whitelisted

### OTP Codes Not Working

1. Check Supabase email template includes `{{ .Token }}`
2. Verify OTP verification call: `verifyOtp({ email, token, type: 'email' })`
3. Check for typos in 6-digit code
4. Ensure code hasn't expired (5 minutes)

### In-App Browser Not Detected

1. Check user agent in console: `navigator.userAgent`
2. Update detection patterns in `lib/browser-detection.ts`
3. Clear browser cache and test again

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
