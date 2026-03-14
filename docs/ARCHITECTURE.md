# Architecture

## System Overview

AutoCert is a multi-tenant SaaS application built on Next.js 15 (App Router) with Supabase as the backend. It follows a layered architecture with clear separation between UI, business logic, and data access.

```
+------------------------------------------------------+
|                    Next.js App Router                 |
|  (auth-pages)  |  (marketing)  |  dashboard/[orgSlug] |
+------------------------------------------------------+
|                   React Components                    |
|  shared/ | ui/ | templates/ | recipients/ | certificate/ | distribute/
+------------------------------------------------------+
|                    React Hooks                        |
|  useBatchGeneration | useCertificateProcessor | ...   |
+------------------------------------------------------+
|                     Services                          |
|  certificate | text-sizing | email | storage | ...    |
+------------------------------------------------------+
|                   Repositories                        |
|  organization | event | template | recipient | ...    |
+------------------------------------------------------+
|                     Supabase                          |
|  Auth  |  PostgreSQL (RLS)  |  Storage (autocert)     |
+------------------------------------------------------+
|                  External Services                    |
|       Groq LLM  |  Gmail API  |  Resend              |
+------------------------------------------------------+
```

## Data Flow

```
User signs in
  -> Selects/creates Organization
    -> Creates Event
      -> Uploads Template image
        -> Configures text overlay (position, font, sizing)
      -> Uploads Recipients (CSV/XLSX)
        -> LLM auto-maps columns (Groq)
        -> User confirms mapping
      -> Generates Certificates (client-side Canvas)
        -> Batch render with async generator
        -> Upload to Supabase Storage
        -> Save records to generated_certificates table
      -> Distributes via Email
        -> Create email_jobs (pending)
        -> Process queue (self-invoking chain)
        -> Send via Gmail or Resend
```

## Layer Descriptions

### App Layer (Routes & Pages)

- `app/(auth-pages)/` -- Public auth routes: sign-in, sign-up, forgot-password
- `app/(marketing)/` -- Landing page
- `app/dashboard/[orgSlug]/` -- Authenticated dashboard with org context
  - `events/` -- Event list and CRUD
  - `events/[eventId]/` -- Event detail with tabs for templates, recipients, generate, distribute
- `app/api/` -- Server-side API routes for LLM mapping, email sending/processing, Gmail OAuth

### Components

Feature-based organization:
- `components/shared/` -- Sidebar, header, breadcrumbs, empty states
- `components/ui/` -- shadcn/ui primitives (Button, Dialog, Table, etc.)
- `components/templates/` -- Template card, upload dialog
- `components/recipients/` -- Recipient table, upload dialog, column mapping dialog
- `components/certificate/` -- Preview, editor, text controls, position controls, batch progress
- `components/distribute/` -- Email composer, delivery status, config form, send progress

### Hooks

Client-side React hooks that bridge components to services:
- `useBatchGeneration` -- Orchestrates batch certificate generation with progress tracking and cancellation
- `useCertificateProcessor` -- Generates single certificate previews via Canvas
- `useAutoTextSize` -- Debounced auto-fit text sizing computation
- `useImageUpload` -- Template image upload handling
- `useZipDownload` -- ZIP file generation via JSZip
- `useTextProperties` -- Text styling state management
- `useColumnMapping` -- Column mapping flow with LLM integration

### Services

Business logic layer. Services contain pure logic with no direct Supabase dependencies (except `storage.service.ts` which wraps Supabase Storage):
- `certificate.service.ts` -- Canvas-based certificate rendering (loadImage, resolveConfig, renderText, generateBatch)
- `text-sizing.service.ts` -- Auto-fit text algorithm (binary search + multi-line fallback)
- `email.service.ts` -- Email provider abstraction (GmailProvider, ResendProvider)
- `storage.service.ts` -- Supabase Storage operations (upload, getPublicUrl, list, delete)
- `xlsx-parser.service.ts` -- CSV/XLSX file parsing via SheetJS
- `column-mapping.service.ts` -- Client-side wrapper for the /api/map-columns endpoint

### Repositories

Data access layer. Each repository maps 1:1 to a Supabase table and exports CRUD functions that accept a `SupabaseClient` instance:
- `organization.repository.ts`
- `event.repository.ts`
- `template.repository.ts`
- `recipient.repository.ts`
- `generated-certificate.repository.ts`
- `email-config.repository.ts`
- `email-job.repository.ts`
- `column-mapping.repository.ts`

All repository functions take `supabase: SupabaseClient` as the first argument. This allows the same repository to be used from both server components (server client) and client components (browser client).

### Types

TypeScript interfaces in `types/` mirror the database schema:
- `organization.ts` -- Organization, OrgMember, OrgRole
- `event.ts` -- Event, CreateEventInput, UpdateEventInput
- `template.ts` -- Template, TemplateTextConfig, TemplateType
- `recipient.ts` -- Recipient, CreateRecipientInput
- `certificate.ts` -- GeneratedCertificate, CertificateStatus
- `email.ts` -- EmailConfig, EmailJob, EmailPayload, EmailProvider
- `column-mapping.ts` -- ColumnMapping, MappingResult, MapColumnsRequest/Response

## Supabase Integration

### Auth

- Email/password and Google OAuth via `@supabase/ssr`
- `middleware.ts` refreshes sessions and protects `/dashboard/**` routes
- Two client patterns (never mix):
  - **Browser client** (`lib/supabase/client.ts`): `createBrowserClient()` for client components
  - **Server client** (`lib/supabase/server.ts`): `createServerClient()` for server components and API routes

### Database

PostgreSQL with Row Level Security. All tables are org-scoped via `is_org_member()` helper function. See [DATABASE.md](./DATABASE.md) for full schema.

### Storage

Single bucket `autocert` with two path patterns:
- Templates: `templates/{orgSlug}/{eventId}/{filename}`
- Generated certificates: `certificates/{folderName}/{recipientName}.{format}`

## External Services

### Groq LLM

Used for intelligent column mapping when users upload CSV/XLSX files. The `/api/map-columns` route sends column headers and sample rows to Groq (Llama 3.3 70B) which returns a mapping of original headers to standard fields (firstName, lastName, email, fullName) with a confidence score.

### Gmail API

OAuth 2.0 integration for sending certificates via users' Gmail accounts. The OAuth flow stores tokens in `email_configs` and uses them to send emails with certificate attachments via the Gmail API.

### Resend

Alternative email provider. Users configure their Resend API key and domain in org settings. Emails are sent with certificate image attachments.

## Service/Repository Pattern

The codebase separates concerns into:

1. **Repositories** handle raw data access. They contain Supabase queries and return typed results. They have no business logic.
2. **Services** contain business logic. They may call repositories or external APIs. They are framework-agnostic where possible.
3. **Hooks** wire services to React state. They manage loading, error, and progress states.
4. **Components** render UI and call hooks. They contain no business logic.

This pattern keeps each layer testable in isolation and prevents Supabase client creation from leaking into business logic.
