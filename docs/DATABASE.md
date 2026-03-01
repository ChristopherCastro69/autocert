# Database Schema

AutoCert uses Supabase PostgreSQL with Row Level Security. All tables are org-scoped.

## ER Diagram

```
auth.users
    |
    | (profile_id)
    v
org_members >----< organizations
    |                   |
    |                   | (org_id)
    |                   v
    |             email_configs
    |                   |
    |                   | (org_id)
    |                   v
    |              email_jobs
    |
    | (org_id on organizations)
    v
  events
    |
    |--- (event_id) ---> templates
    |                        |
    |--- (event_id) ---> recipients
    |                        |
    |--- (event_id) ---> column_mappings
    |
    v
generated_certificates
    ^         ^
    |         |
    |  (template_id)
    |
 (recipient_id)
```

## Tables

### organizations

Top-level tenant. Every resource is scoped to an organization.

| Column     | Type        | Constraints                  |
|------------|-------------|------------------------------|
| id         | uuid        | PK, default gen_random_uuid  |
| name       | text        | NOT NULL                     |
| slug       | text        | UNIQUE, NOT NULL             |
| logo_url   | text        | nullable                     |
| created_at | timestamptz | default now()                |
| updated_at | timestamptz | default now(), auto-trigger  |

### org_members

Join table linking users to organizations with roles.

| Column     | Type        | Constraints                              |
|------------|-------------|------------------------------------------|
| id         | uuid        | PK, default gen_random_uuid              |
| org_id     | uuid        | FK -> organizations(id) ON DELETE CASCADE |
| profile_id | uuid        | FK -> auth.users(id) ON DELETE CASCADE   |
| role       | text        | CHECK ('owner', 'admin', 'member'), default 'member' |
| created_at | timestamptz | default now()                            |

Unique constraint: `(org_id, profile_id)`

### events

An event within an organization (e.g., a conference, workshop).

| Column      | Type        | Constraints                              |
|-------------|-------------|------------------------------------------|
| id          | uuid        | PK, default gen_random_uuid              |
| org_id      | uuid        | FK -> organizations(id) ON DELETE CASCADE |
| name        | text        | NOT NULL                                 |
| description | text        | nullable                                 |
| event_date  | date        | nullable                                 |
| created_at  | timestamptz | default now()                            |
| updated_at  | timestamptz | default now(), auto-trigger              |

### templates

Certificate template images with text overlay configuration.

| Column       | Type        | Constraints                          |
|--------------|-------------|--------------------------------------|
| id           | uuid        | PK, default gen_random_uuid          |
| event_id     | uuid        | FK -> events(id) ON DELETE CASCADE   |
| name         | text        | NOT NULL                             |
| type         | text        | CHECK ('participant', 'volunteer', 'speaker', 'custom'), default 'participant' |
| template_url | text        | NOT NULL                             |
| text_config  | jsonb       | default '{}'                         |
| created_at   | timestamptz | default now()                        |
| updated_at   | timestamptz | default now(), auto-trigger          |

The `text_config` JSONB column stores `TemplateTextConfig` (see [CERTIFICATE-ENGINE.md](./CERTIFICATE-ENGINE.md)).

### recipients

People who receive certificates for an event.

| Column     | Type        | Constraints                          |
|------------|-------------|--------------------------------------|
| id         | uuid        | PK, default gen_random_uuid          |
| event_id   | uuid        | FK -> events(id) ON DELETE CASCADE   |
| first_name | text        | NOT NULL                             |
| last_name  | text        | NOT NULL                             |
| email      | text        | nullable                             |
| metadata   | jsonb       | default '{}'                         |
| created_at | timestamptz | default now()                        |

### generated_certificates

Output of the certificate generation process. Links a recipient to a template with the rendered image.

| Column        | Type        | Constraints                              |
|---------------|-------------|------------------------------------------|
| id            | uuid        | PK, default gen_random_uuid              |
| recipient_id  | uuid        | FK -> recipients(id) ON DELETE CASCADE   |
| template_id   | uuid        | FK -> templates(id) ON DELETE CASCADE    |
| image_url     | text        | NOT NULL                                 |
| status        | text        | CHECK ('generated', 'sent', 'failed'), default 'generated' |
| sent_at       | timestamptz | nullable                                 |
| error_message | text        | nullable                                 |
| created_at    | timestamptz | default now()                            |

Unique constraint: `(recipient_id, template_id)`

### email_configs

Per-org email provider configuration. Supports Gmail OAuth and Resend.

| Column              | Type        | Constraints                              |
|---------------------|-------------|------------------------------------------|
| id                  | uuid        | PK, default gen_random_uuid              |
| org_id              | uuid        | FK -> organizations(id) ON DELETE CASCADE |
| provider            | text        | CHECK ('gmail', 'resend'), NOT NULL      |
| gmail_access_token  | text        | nullable                                 |
| gmail_refresh_token | text        | nullable                                 |
| gmail_token_expiry  | timestamptz | nullable                                 |
| gmail_email         | text        | nullable                                 |
| resend_api_key      | text        | nullable                                 |
| resend_domain       | text        | nullable                                 |
| resend_from_email   | text        | nullable                                 |
| is_active           | boolean     | default false                            |
| created_at          | timestamptz | default now()                            |
| updated_at          | timestamptz | default now(), auto-trigger              |

Unique constraint: `(org_id, provider)`

### email_jobs

Queue table for email delivery. Each row represents one email to send.

| Column                    | Type        | Constraints                                      |
|---------------------------|-------------|--------------------------------------------------|
| id                        | uuid        | PK, default gen_random_uuid                      |
| org_id                    | uuid        | FK -> organizations(id) ON DELETE CASCADE         |
| generated_certificate_id  | uuid        | FK -> generated_certificates(id) ON DELETE CASCADE |
| status                    | text        | CHECK ('pending', 'processing', 'sent', 'failed', 'retrying'), default 'pending' |
| attempts                  | int         | default 0                                        |
| max_attempts              | int         | default 3                                        |
| last_error                | text        | nullable                                         |
| scheduled_at              | timestamptz | default now()                                    |
| processed_at              | timestamptz | nullable                                         |
| created_at                | timestamptz | default now()                                    |

### column_mappings

Stores the LLM-generated column mapping from a recipient file upload.

| Column           | Type        | Constraints                          |
|------------------|-------------|--------------------------------------|
| id               | uuid        | PK, default gen_random_uuid          |
| event_id         | uuid        | FK -> events(id) ON DELETE CASCADE   |
| original_headers | text[]      | NOT NULL                             |
| mapping          | jsonb       | NOT NULL                             |
| confirmed        | boolean     | default false                        |
| created_at       | timestamptz | default now()                        |

## Row Level Security

All tables have RLS enabled. Policies use the `is_org_member(org_id)` helper function:

```sql
CREATE OR REPLACE FUNCTION is_org_member(check_org_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = check_org_id
      AND profile_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Policy Strategy

Every table has SELECT, INSERT, UPDATE, and DELETE policies.

**Direct org tables** (organizations, org_members, email_configs, email_jobs):
- Policies check `is_org_member(org_id)` directly

**Event-scoped tables** (events):
- Policies check `is_org_member(org_id)` on the event's org_id

**Nested tables** (templates, recipients, column_mappings):
- Policies join through `events` to resolve `org_id`, then check `is_org_member(events.org_id)`

**Deeply nested tables** (generated_certificates):
- Policies join through `recipients -> events` to resolve `org_id`

**Special case** -- `organizations INSERT`:
- Uses `WITH CHECK (true)` because the org_members row is created immediately after the organization

### Indexes

All foreign key columns are indexed. `generated_certificates` has an additional index on `status` for email processing queries. `email_jobs` has indexes on `org_id`, `generated_certificate_id`, and `status`.

## Auto-Updated Timestamps

Tables with `updated_at` use a trigger:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Applied to: `organizations`, `events`, `templates`, `email_configs`.
