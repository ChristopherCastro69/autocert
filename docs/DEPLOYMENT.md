# Deployment

## Vercel

### 1. Connect Repository

1. Import your GitHub repository on [vercel.com](https://vercel.com)
2. Framework preset: **Next.js** (auto-detected)
3. Build command: `npm run build`
4. Output directory: `.next` (default)

### 2. Environment Variables

Set these in Vercel project settings (Settings > Environment Variables):

| Variable                         | Required | Description                                     |
|----------------------------------|----------|-------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`       | Yes      | Supabase project URL                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Yes      | Supabase anonymous (public) key                 |
| `GROQ_API_KEY`                   | Yes      | Groq API key for LLM column mapping             |
| `GOOGLE_CLIENT_ID`               | Gmail    | Google OAuth client ID                          |
| `GOOGLE_CLIENT_SECRET`           | Gmail    | Google OAuth client secret                      |
| `GOOGLE_REDIRECT_URI`            | Gmail    | Must match your Vercel domain: `https://yourdomain.com/api/auth/gmail/callback` |
| `CRON_SECRET`                    | Yes      | Secret string for email processing endpoint auth |

### 3. Deploy

Push to your main branch or trigger a manual deploy. Vercel handles the build automatically.

## Supabase

### 1. Create Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Note the project URL and anon key from Settings > API

### 2. Run Schema

1. Go to SQL Editor in the Supabase dashboard
2. Paste and run the contents of `docs/schema.sql`
3. This creates all tables, indexes, RLS policies, and trigger functions

### 3. Configure Storage

1. Go to Storage in the Supabase dashboard
2. Create a new bucket named `autocert`
3. Set the bucket to **public** (certificates need public URLs for email attachments)
4. Add a storage policy to allow authenticated users to upload/read/delete:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'autocert');

-- Allow public read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'autocert');

-- Allow authenticated users to delete their files
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'autocert');
```

### 4. Configure Auth

1. Go to Authentication > Providers
2. Enable **Email** provider (enabled by default)
3. Optionally enable **Google** OAuth:
   - Set Google Client ID and Client Secret
   - Add redirect URL: `https://yourdomain.com/auth/callback`

### 5. Configure Realtime (Optional)

If you want real-time updates on email job status, enable Realtime for the `email_jobs` and `generated_certificates` tables.

## Post-Deployment Checklist

- [ ] Supabase project created and schema.sql executed
- [ ] Storage bucket `autocert` created with public access
- [ ] Storage policies applied
- [ ] All environment variables set in Vercel
- [ ] `GOOGLE_REDIRECT_URI` matches your production domain
- [ ] Supabase Auth providers configured
- [ ] Test sign-up and sign-in flow
- [ ] Test creating an organization
- [ ] Test uploading a template image
- [ ] Test uploading a CSV with recipients
- [ ] Test generating certificates
- [ ] Test email sending (Gmail or Resend)
- [ ] Verify `CRON_SECRET` is set (required for email processing)

## Local Development

```bash
# Clone and install
git clone <repo-url>
cd autocert
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and API keys

# Start dev server
npm run dev
```

The dev server runs at `http://localhost:3000`.

For Gmail OAuth in development, set `GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback` and add this URL to your Google Cloud Console authorized redirect URIs.
