# Database Migrations

This directory contains SQL migration files for the InterviewLab database.

## How to Apply Migrations

### Initial Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run migrations in order:
   - `001_initial_schema.sql` - Core tables
   - `002_rls_policies.sql` - Row-Level Security policies
   - `003_storage_policies.sql` - Storage bucket policies
   - `004_update_reports_schema.sql` - Update reports table (NEW!)

### Latest Migration (004)

**⚠️ IMPORTANT:** If you've already run migrations 001-003, you MUST run migration 004:

```sql
-- Run this in Supabase SQL Editor
-- Migration: Update reports table to use single feedback JSONB column

ALTER TABLE reports ADD COLUMN IF NOT EXISTS feedback JSONB;
ALTER TABLE reports DROP COLUMN IF EXISTS overall;
ALTER TABLE reports DROP COLUMN IF EXISTS dimensions;
ALTER TABLE reports DROP COLUMN IF EXISTS tips;
ALTER TABLE reports DROP COLUMN IF EXISTS exemplars;

COMMENT ON COLUMN reports.feedback IS 'Complete interview feedback as JSON';
```

This migration:

- Adds a single `feedback` JSONB column
- Removes the old separate columns (`overall`, `dimensions`, `tips`, `exemplars`)
- Simplifies the schema to match our TypeScript types

### Verification

After running migration 004, verify it worked:

```sql
-- Check the reports table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reports';

-- You should see: id, session_id, user_id, feedback, pdf_key, created_at
```

## Storage Buckets

Don't forget to create the storage buckets (see `storage-buckets.md`):

- `uploads` (private)
- `audio` (private)
- `reports` (private)

Apply storage policies from `003_storage_policies.sql`.
