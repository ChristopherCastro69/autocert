# CLAUDE.md

## Project Overview

AutoCert is a multi-tenant SaaS application for bulk certificate generation and distribution, built on Next.js 15 (App Router) with Supabase. Organizations create events, upload certificate templates, add recipients via CSV/XLSX (with LLM-powered column mapping), generate personalized certificates client-side using Canvas, and distribute them via Gmail or Resend.

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm start          # Start production server
npm run test       # Run tests (vitest)
npm run test:watch # Run tests in watch mode
npm run lint       # ESLint
```

## Folder Structure

```
app/
  (auth-pages)/          # Sign-in, sign-up, forgot-password
  (marketing)/           # Landing page
  dashboard/             # Authenticated dashboard layout
    [orgSlug]/           # Org overview, settings
      events/            # Event list
        [eventId]/       # Event detail: templates, recipients, generate, distribute
  api/                   # API routes
    map-columns/         # POST - Groq LLM column mapping
    email/send/          # POST - Create email jobs
    email/process/       # POST - Process email queue (CRON_SECRET protected)
    auth/gmail/          # GET authorize + callback for Gmail OAuth

components/
  shared/                # Sidebar, header, breadcrumbs, empty states
  ui/                    # shadcn/ui primitives
  templates/             # Template card, upload dialog
  recipients/            # Recipient table, upload, column mapping
  certificate/           # Preview, editor, text/position controls, batch progress
  distribute/            # Email composer, delivery status, config form

services/                # Business logic (no direct DB access except storage)
  certificate.service    # Canvas rendering: loadImage, resolveConfig, renderText, generateBatch
  text-sizing.service    # Auto-fit text: binary search + multi-line fallback
  email.service          # Provider abstraction: GmailProvider, ResendProvider
  storage.service        # Supabase Storage wrapper
  xlsx-parser.service    # CSV/XLSX parsing via SheetJS
  column-mapping.service # Client-side /api/map-columns caller

repositories/            # Data access layer (Supabase queries, 1:1 with tables)
  organization, event, template, recipient, generated-certificate,
  email-config, email-job, column-mapping

types/                   # TypeScript interfaces mirroring DB schema
hooks/                   # React hooks bridging components to services
lib/                     # Supabase clients, Groq, Gmail, Resend, constants, utils
docs/                    # Detailed documentation
```

## Database Schema

9 tables, all with RLS via `is_org_member()`:

| Table                    | Description                                      |
|--------------------------|--------------------------------------------------|
| `organizations`          | Multi-tenant orgs with slug                      |
| `org_members`            | User-org membership with roles (owner/admin/member) |
| `events`                 | Events within an org                             |
| `templates`              | Certificate template images + text_config (JSONB)|
| `recipients`             | People receiving certificates for an event       |
| `generated_certificates` | Rendered certificate images (recipient + template)|
| `email_configs`          | Per-org email provider config (Gmail/Resend)     |
| `email_jobs`             | Email delivery queue with retry logic            |
| `column_mappings`        | LLM-generated column mappings from file uploads  |

Full schema: `docs/schema.sql`. Documentation: `docs/DATABASE.md`.

## Service/Repository Pattern

- **Repositories** -- Pure data access. Each maps to one Supabase table. All functions take `SupabaseClient` as first arg, enabling use from both server and client contexts.
- **Services** -- Business logic. Framework-agnostic where possible. Call repositories or external APIs.
- **Hooks** -- Wire services to React state (loading, error, progress).
- **Components** -- Render UI, call hooks. No business logic.

## Key Hooks

| Hook                     | Purpose                                          |
|--------------------------|--------------------------------------------------|
| `useBatchGeneration`     | Orchestrates batch cert generation with progress + cancel |
| `useCertificateProcessor`| Generates single certificate previews            |
| `useAutoTextSize`        | Debounced auto-fit text sizing                   |
| `useImageUpload`         | Template image upload handling                   |
| `useZipDownload`         | ZIP generation via JSZip                         |
| `useTextProperties`      | Text styling state management                    |
| `useColumnMapping`       | Column mapping flow with LLM                    |

## Certificate Engine

- Client-side Canvas rendering at native template resolution
- Percentage-based positioning (resolution-independent)
- Auto-fit text sizing: binary search for largest single-line fit, vertical clamp, multi-line fallback (split at nearest space to midpoint)
- Async generator for batch processing with `requestAnimationFrame` UI yielding
- Outputs PNG or JPEG with configurable quality

Details: `docs/CERTIFICATE-ENGINE.md`

## Email System

- Two providers: Gmail (OAuth 2.0) and Resend (API key)
- Queue-based: `/api/email/send` creates jobs, `/api/email/process` processes them
- Self-invoking chain pattern for Vercel serverless (processes batches of 20)
- Retry with linear backoff (attempts * 5s), max 3 attempts
- Template variables: `{{firstName}}`, `{{lastName}}`

Details: `docs/EMAIL-SETUP.md`

## Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Groq LLM (required for column mapping)
GROQ_API_KEY=

# Gmail OAuth (optional, for Gmail email provider)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Email processing (required for email distribution)
CRON_SECRET=
```

## Conventions

- **Path alias**: `@/*` maps to project root
- **Styling**: Tailwind CSS with HSL custom properties, `tailwindcss-animate`, dark mode via `next-themes`
- **Fonts**: `@fontsource` (Poppins, Roboto, Pacifico) for certificate text rendering
- **UI components**: shadcn/ui (Radix-based), added via CLI
- **Supabase clients**: Browser client (`lib/supabase/client.ts`) for client components, Server client (`lib/supabase/server.ts`) for server components/API routes. Never mix them.
- **Max template size**: 10 MB
- **Max recipients per upload**: 5,000
