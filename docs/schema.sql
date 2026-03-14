-- =============================================================================
-- AutoCert SaaS — Supabase PostgreSQL Schema
-- =============================================================================
-- Complete database schema for the AutoCert multi-tenant certificate generation
-- and distribution platform. Tables are ordered by foreign-key dependencies.
--
-- Requires: Supabase (auth.users), PostgreSQL 14+
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 1. organizations
-- ---------------------------------------------------------------------------
CREATE TABLE organizations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  slug       text        UNIQUE NOT NULL,
  logo_url   text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 2. org_members
-- ---------------------------------------------------------------------------
CREATE TABLE org_members (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  profile_id uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role       text        CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE (org_id, profile_id)
);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_org_members_org_id     ON org_members (org_id);
CREATE INDEX idx_org_members_profile_id ON org_members (profile_id);

-- ---------------------------------------------------------------------------
-- 3. events
-- ---------------------------------------------------------------------------
CREATE TABLE events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  name        text        NOT NULL,
  description text,
  event_date  date,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_events_org_id ON events (org_id);

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 4. templates
-- ---------------------------------------------------------------------------
CREATE TABLE templates (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid        NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  name         text        NOT NULL,
  type         text        CHECK (type IN ('participant', 'volunteer', 'speaker', 'custom')) DEFAULT 'participant',
  template_url text        NOT NULL,
  text_config  jsonb       DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_templates_event_id ON templates (event_id);

CREATE TRIGGER set_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 5. recipients
-- ---------------------------------------------------------------------------
CREATE TABLE recipients (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  first_name text        NOT NULL,
  last_name  text        NOT NULL,
  email      text,
  metadata   jsonb       DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_recipients_event_id ON recipients (event_id);

-- ---------------------------------------------------------------------------
-- 6. generated_certificates
-- ---------------------------------------------------------------------------
CREATE TABLE generated_certificates (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id  uuid        NOT NULL REFERENCES recipients (id) ON DELETE CASCADE,
  template_id   uuid        NOT NULL REFERENCES templates (id) ON DELETE CASCADE,
  image_url     text        NOT NULL,
  status        text        CHECK (status IN ('generated', 'sent', 'failed')) DEFAULT 'generated',
  sent_at       timestamptz,
  error_message text,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (recipient_id, template_id)
);

ALTER TABLE generated_certificates ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_generated_certificates_recipient_id ON generated_certificates (recipient_id);
CREATE INDEX idx_generated_certificates_template_id  ON generated_certificates (template_id);
CREATE INDEX idx_generated_certificates_status       ON generated_certificates (status);

-- ---------------------------------------------------------------------------
-- 7. email_configs
-- ---------------------------------------------------------------------------
CREATE TABLE email_configs (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  provider            text        CHECK (provider IN ('gmail', 'resend')) NOT NULL,
  gmail_access_token  text,
  gmail_refresh_token text,
  gmail_token_expiry  timestamptz,
  gmail_email         text,
  resend_api_key      text,
  resend_domain       text,
  resend_from_email   text,
  is_active           boolean     DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE (org_id, provider)
);

ALTER TABLE email_configs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_email_configs_org_id ON email_configs (org_id);

CREATE TRIGGER set_email_configs_updated_at
  BEFORE UPDATE ON email_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 8. email_jobs
-- ---------------------------------------------------------------------------
CREATE TABLE email_jobs (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                   uuid        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  generated_certificate_id uuid        NOT NULL REFERENCES generated_certificates (id) ON DELETE CASCADE,
  status                   text        CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'retrying')) DEFAULT 'pending',
  attempts                 int         DEFAULT 0,
  max_attempts             int         DEFAULT 3,
  last_error               text,
  scheduled_at             timestamptz DEFAULT now(),
  processed_at             timestamptz,
  created_at               timestamptz DEFAULT now()
);

ALTER TABLE email_jobs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_email_jobs_org_id                   ON email_jobs (org_id);
CREATE INDEX idx_email_jobs_generated_certificate_id ON email_jobs (generated_certificate_id);
CREATE INDEX idx_email_jobs_status                   ON email_jobs (status);

-- ---------------------------------------------------------------------------
-- 9. column_mappings
-- ---------------------------------------------------------------------------
CREATE TABLE column_mappings (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         uuid        NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  original_headers text[]      NOT NULL,
  mapping          jsonb       NOT NULL,
  confirmed        boolean     DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE column_mappings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_column_mappings_event_id ON column_mappings (event_id);

-- ===========================================================================
-- Row Level Security Policies
-- ===========================================================================
-- All policies ensure the authenticated user is a member of the relevant
-- organization (resolved through the FK chain for nested tables).
-- ===========================================================================

-- Helper: check org membership for the current user
-- Used in policy expressions as: is_org_member(some_org_id)
CREATE OR REPLACE FUNCTION is_org_member(check_org_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = check_org_id
      AND profile_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- organizations --------------------------------------------------------
CREATE POLICY "org_members can select their organizations"
  ON organizations FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "org_members can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);  -- membership row created immediately after

CREATE POLICY "org_members can update their organizations"
  ON organizations FOR UPDATE
  USING (is_org_member(id));

CREATE POLICY "org_members can delete their organizations"
  ON organizations FOR DELETE
  USING (is_org_member(id));

-- ---- org_members ----------------------------------------------------------
CREATE POLICY "org_members can view fellow members"
  ON org_members FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "org_members can insert members"
  ON org_members FOR INSERT
  WITH CHECK (is_org_member(org_id) OR profile_id = auth.uid());

CREATE POLICY "org_members can update members"
  ON org_members FOR UPDATE
  USING (is_org_member(org_id));

CREATE POLICY "org_members can delete members"
  ON org_members FOR DELETE
  USING (is_org_member(org_id));

-- ---- events ---------------------------------------------------------------
CREATE POLICY "org_members can select events"
  ON events FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "org_members can insert events"
  ON events FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "org_members can update events"
  ON events FOR UPDATE
  USING (is_org_member(org_id));

CREATE POLICY "org_members can delete events"
  ON events FOR DELETE
  USING (is_org_member(org_id));

-- ---- templates ------------------------------------------------------------
CREATE POLICY "org_members can select templates"
  ON templates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = templates.event_id AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can insert templates"
  ON templates FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events WHERE events.id = templates.event_id AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can update templates"
  ON templates FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = templates.event_id AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can delete templates"
  ON templates FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = templates.event_id AND is_org_member(events.org_id)
  ));

-- ---- recipients -----------------------------------------------------------
CREATE POLICY "org_members can select recipients"
  ON recipients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = recipients.event_id AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can insert recipients"
  ON recipients FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events WHERE events.id = recipients.event_id AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can update recipients"
  ON recipients FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = recipients.event_id AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can delete recipients"
  ON recipients FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = recipients.event_id AND is_org_member(events.org_id)
  ));

-- ---- generated_certificates -----------------------------------------------
CREATE POLICY "org_members can select generated_certificates"
  ON generated_certificates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recipients
    JOIN events ON events.id = recipients.event_id
    WHERE recipients.id = generated_certificates.recipient_id
      AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can insert generated_certificates"
  ON generated_certificates FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM recipients
    JOIN events ON events.id = recipients.event_id
    WHERE recipients.id = generated_certificates.recipient_id
      AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can update generated_certificates"
  ON generated_certificates FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM recipients
    JOIN events ON events.id = recipients.event_id
    WHERE recipients.id = generated_certificates.recipient_id
      AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can delete generated_certificates"
  ON generated_certificates FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM recipients
    JOIN events ON events.id = recipients.event_id
    WHERE recipients.id = generated_certificates.recipient_id
      AND is_org_member(events.org_id)
  ));

-- ---- email_configs --------------------------------------------------------
CREATE POLICY "org_members can select email_configs"
  ON email_configs FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "org_members can insert email_configs"
  ON email_configs FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "org_members can update email_configs"
  ON email_configs FOR UPDATE
  USING (is_org_member(org_id));

CREATE POLICY "org_members can delete email_configs"
  ON email_configs FOR DELETE
  USING (is_org_member(org_id));

-- ---- email_jobs -----------------------------------------------------------
CREATE POLICY "org_members can select email_jobs"
  ON email_jobs FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "org_members can insert email_jobs"
  ON email_jobs FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "org_members can update email_jobs"
  ON email_jobs FOR UPDATE
  USING (is_org_member(org_id));

CREATE POLICY "org_members can delete email_jobs"
  ON email_jobs FOR DELETE
  USING (is_org_member(org_id));

-- ---- column_mappings ------------------------------------------------------
CREATE POLICY "org_members can select column_mappings"
  ON column_mappings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = column_mappings.event_id AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can insert column_mappings"
  ON column_mappings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events WHERE events.id = column_mappings.event_id AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can update column_mappings"
  ON column_mappings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = column_mappings.event_id AND is_org_member(events.org_id)
  ));

CREATE POLICY "org_members can delete column_mappings"
  ON column_mappings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = column_mappings.event_id AND is_org_member(events.org_id)
  ));
