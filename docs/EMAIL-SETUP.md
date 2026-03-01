# Email Setup

AutoCert supports two email providers for certificate distribution: **Gmail** (OAuth 2.0) and **Resend** (API key). Each organization configures one active provider in their org settings.

## Gmail OAuth Setup

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Gmail API** under APIs & Services > Library
4. Go to APIs & Services > Credentials
5. Create an **OAuth 2.0 Client ID** (Web application)
6. Add authorized redirect URI: `https://yourdomain.com/api/auth/gmail/callback`
   - For local dev: `http://localhost:3000/api/auth/gmail/callback`
7. Copy the Client ID and Client Secret

### 2. Configure OAuth Consent Screen

1. Go to APIs & Services > OAuth consent screen
2. Set user type to **External** (or Internal for Workspace)
3. Add the scope: `https://www.googleapis.com/auth/gmail.send`
4. Add test users if in testing mode

### 3. Environment Variables

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/gmail/callback
```

### 4. OAuth Flow

```
User clicks "Connect Gmail" in org settings
  -> GET /api/auth/gmail/authorize?orgId=<orgId>
    -> Redirect to Google OAuth consent screen
      -> User grants gmail.send permission
        -> Google redirects to /api/auth/gmail/callback?code=<code>&state=<orgId>
          -> Exchange code for tokens
          -> Store tokens in email_configs table
          -> Redirect to /dashboard/<orgSlug>/settings
```

The `state` parameter carries the `orgId` through the OAuth flow. On callback, tokens (access + refresh) are stored in `email_configs` along with the authenticated Gmail address.

## Resend Setup

### 1. Create Account

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys and create a new key
3. Go to Domains and add + verify your sending domain

### 2. Configure in App

Users enter the following in their org settings:
- **API Key**: The Resend API key
- **From Email**: e.g., `certificates@yourdomain.com` (must be on a verified domain)

These are stored in the `email_configs` table.

### 3. Environment Variables

No server-side env vars needed for Resend. API keys are stored per-org in the database.

## Queue-Based Email Sending

Email sending uses a job queue pattern to handle large batches reliably.

### Architecture

```
POST /api/email/send
  -> Validate org has active email config
  -> Create email_jobs (one per certificate, status: pending)
  -> Fire-and-forget POST to /api/email/process
  -> Return { success: true, jobCount }

POST /api/email/process (protected by CRON_SECRET)
  -> Fetch up to EMAIL_BATCH_SIZE (20) pending/retrying jobs
  -> For each job:
     1. Mark as "processing"
     2. Load certificate + recipient data
     3. Load org email config
     4. Create email provider (Gmail or Resend)
     5. Download certificate image
     6. Replace template variables ({{firstName}}, {{lastName}})
     7. Send email with certificate attachment
     8. Mark as "sent" or "retrying"/"failed"
  -> Check if more jobs remain
  -> If yes, fire-and-forget POST to /api/email/process (self-invoke)
  -> Return { processed, sent, failed, remaining }
```

### Self-Invoking Chain Pattern

The `/api/email/process` endpoint processes a batch of jobs, then checks if more remain. If so, it fires a new HTTP request to itself. This creates a chain of serverless invocations that processes the entire queue without exceeding Vercel's function timeout.

```
/api/email/process (batch 1: jobs 1-20)
  -> self-invokes /api/email/process (batch 2: jobs 21-40)
    -> self-invokes /api/email/process (batch 3: jobs 41-60)
      -> no more jobs, chain ends
```

The initial trigger is a fire-and-forget call from `/api/email/send`. The `CRON_SECRET` header prevents unauthorized invocation.

### Retry with Exponential Backoff

Failed jobs are retried up to `EMAIL_MAX_ATTEMPTS` (3) times:

1. On failure, job status becomes `retrying` and `attempts` increments
2. On the next processing cycle, retrying jobs are skipped if insufficient time has elapsed:
   ```
   delayMs = attempts * 5000
   ```
   - 1st retry: 5s delay
   - 2nd retry: 10s delay
3. If `attempts >= max_attempts`, job status becomes `failed` and the generated certificate is marked as failed

### Template Variables

Email subject and body support these variables:
- `{{firstName}}` -- Recipient's first name
- `{{lastName}}` -- Recipient's last name

### Constants

```typescript
EMAIL_BATCH_SIZE = 20;    // Jobs per invocation
EMAIL_MAX_ATTEMPTS = 3;   // Max retries before permanent failure
```

## Environment Variables

| Variable              | Required For | Description                       |
|-----------------------|--------------|-----------------------------------|
| GOOGLE_CLIENT_ID      | Gmail        | OAuth 2.0 client ID               |
| GOOGLE_CLIENT_SECRET  | Gmail        | OAuth 2.0 client secret           |
| GOOGLE_REDIRECT_URI   | Gmail        | OAuth callback URL                 |
| CRON_SECRET           | Email queue  | Secret for /api/email/process auth |
