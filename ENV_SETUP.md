# Environment Variables Setup

This document outlines the environment variables required for InterviewLab.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Supabase Configuration

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Site Configuration

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### OpenAI Configuration

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Cartesia.ai TTS Configuration

```bash
CARTESIA_API_KEY=your-cartesia-api-key-here
CARTESIA_MODEL=sonic-3
CARTESIA_VOICE_ID=694f9389-aac1-45b6-b726-9d9369183238
CARTESIA_VERSION=2025-04-16
```

**Important:** Cartesia.ai is used for text-to-speech voice generation. Get your API key from [cartesia.ai](https://cartesia.ai).

- `CARTESIA_MODEL`: The TTS model to use (default: sonic-3)
- `CARTESIA_VOICE_ID`: The voice ID for the interviewer (default: professional neutral voice)
- `CARTESIA_VERSION`: API version (default: 2025-04-16)

### Admin Dashboard Authentication

```bash
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
```

### Super Admin Configuration

```bash
SUPER_ADMIN_EMAILS=email1@example.com,email2@example.com
```

**Super Admin Privileges:**

- Unlimited free assessments (no 7-day cooldown)
- Full access to all premium features without payment
- No rate limiting or usage restrictions
- Bypass all entitlement checks

**Format:** Comma-separated list of email addresses (case-insensitive)

**Example:** `SUPER_ADMIN_EMAILS=a.j.szymanski1999@gmail.com,admin@theinterviewlab.io`

**Important:** Choose a strong password for production. The admin dashboard at `/admin/*` is protected by these credentials.

### Cron Job Security

```bash
CRON_SECRET=your-random-secret-string-here
```

**Important:** Generate a random secret for production. This protects the `/api/regenerate-preview-questions` endpoint from unauthorized access. Only Vercel Cron jobs with this secret can trigger question regeneration.

**Generating a secure secret:**

```bash
openssl rand -base64 32
# Or use: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## How to Get API Keys

### Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select an existing one
3. Go to Settings → API
4. Copy the Project URL, anon public key, and service role key

### OpenAI

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### Cartesia.ai

1. Go to [cartesia.ai](https://cartesia.ai)
2. Sign up for an account
3. Navigate to your API dashboard
4. Create a new API key
5. Copy the API key
6. (Optional) Browse the voice library to find different voice IDs if you want to change the default voice

## Important Notes

- Never commit `.env.local` to version control
- The `.gitignore` file already excludes `.env*` files
- Restart the dev server after changing environment variables
