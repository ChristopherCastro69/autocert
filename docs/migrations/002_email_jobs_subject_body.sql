-- Migration: Add subject and body columns to email_jobs
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE email_jobs ADD COLUMN subject text;
ALTER TABLE email_jobs ADD COLUMN body text;
