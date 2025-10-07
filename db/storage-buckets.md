# Supabase Storage Buckets

This document describes the storage buckets configured in Supabase for InterviewLab.

## Buckets

### 1. `uploads`

- **Purpose:** User-uploaded documents (CVs, job specifications, supporting documents)
- **Privacy:** Private (requires authentication)
- **Content Types:** PDF, DOCX, TXT, and other document formats

### 2. `audio`

- **Purpose:** Audio files for questions (TTS) and user answers (recordings)
- **Privacy:** Private (requires authentication)
- **Content Types:** MP3, WAV, WebM, and other audio formats

### 3. `reports`

- **Purpose:** Generated PDF reports with interview feedback and analysis
- **Privacy:** Private (requires authentication)
- **Content Types:** PDF

## Security

All buckets are configured as **private** by default. Access is controlled through:

- Row-Level Security (RLS) policies (to be configured in future tasks)
- Supabase Auth integration
- User-specific access tokens

## Usage

Files are referenced in the database tables via their `storage_key` field, which contains the full path to the file in the respective bucket.

Example storage key format: `{bucket_name}/{user_id}/{file_name}`
