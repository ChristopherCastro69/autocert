# AutoCert

A multi-tenant SaaS application for bulk certificate generation and email distribution. Built for event organizers who need to create, personalize, and deliver certificates at scale.

## Features

- **Multi-organization support** -- Create and manage multiple organizations with role-based access (owner, admin, member)
- **Event management** -- Organize certificates by events (conferences, workshops, etc.)
- **Template upload** -- Upload certificate template images (PNG, JPEG) up to 10 MB
- **Visual text editor** -- Configure text overlay with live preview: position, font, size, color, alignment, bold/italic/underline, uppercase
- **Smart auto-fit text** -- Automatically sizes text to fit within a bounding box using binary search with multi-line fallback
- **Recipient management** -- Upload recipients via CSV/XLSX with LLM-powered column mapping (Groq), or add manually
- **Batch generation** -- Generate certificates for all recipients client-side using Canvas with progress tracking and cancellation
- **Email distribution** -- Send certificates via Gmail (OAuth 2.0) or Resend with queue-based processing, retry logic, and template variables
- **ZIP download** -- Download all generated certificates as a ZIP file

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Supabase (Auth, PostgreSQL with RLS, Storage)
- **LLM**: Groq (Llama 3.3 70B) for intelligent column mapping
- **Email**: Gmail API (OAuth 2.0) + Resend
- **UI**: shadcn/ui + Tailwind CSS + Radix UI
- **Rendering**: HTML Canvas API (client-side)
- **Testing**: Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### Setup

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd autocert
   npm install
   ```

2. Create `.env.local` with required environment variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   GROQ_API_KEY=your-groq-api-key
   CRON_SECRET=any-secret-string

   # Optional: Gmail OAuth
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback
   ```

3. Run the database schema in your Supabase SQL Editor:

   ```
   docs/schema.sql
   ```

4. Create a Supabase Storage bucket named `autocert` with public access.

5. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/                     # Next.js App Router (routes & pages)
  (auth-pages)/          # Auth routes (sign-in, sign-up, forgot-password)
  (marketing)/           # Landing page
  dashboard/[orgSlug]/   # Dashboard with org context
    events/[eventId]/    # Event detail (templates, recipients, generate, distribute)
  api/                   # API routes (map-columns, email, gmail-oauth)
components/              # React components (shared, ui, feature folders)
services/                # Business logic layer
repositories/            # Data access layer (Supabase queries)
types/                   # TypeScript interfaces
hooks/                   # React hooks
lib/                     # Clients, configs, utilities
docs/                    # Documentation
```

## Documentation

Detailed documentation is in the `docs/` directory:

- [Architecture](docs/ARCHITECTURE.md) -- System overview, layers, data flow
- [Database](docs/DATABASE.md) -- Schema, tables, RLS policies
- [Certificate Engine](docs/CERTIFICATE-ENGINE.md) -- Canvas rendering, auto-fit algorithm, batch generation
- [Email Setup](docs/EMAIL-SETUP.md) -- Gmail OAuth, Resend, queue processing
- [API Reference](docs/API.md) -- API routes with request/response formats
- [Deployment](docs/DEPLOYMENT.md) -- Vercel + Supabase deployment guide
