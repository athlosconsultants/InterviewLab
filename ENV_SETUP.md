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

### Admin Dashboard Authentication

```bash
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
```

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

## Important Notes

- Never commit `.env.local` to version control
- The `.gitignore` file already excludes `.env*` files
- Restart the dev server after changing environment variables
