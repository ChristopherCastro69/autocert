# PizzaPy SMTP Email Configuration

## Overview

AutoCert can send certificates as `PizzaPy Cebu <info@pizzapy.ph>` using Gmail's "Send As" alias feature. Gmail routes outgoing mail through the PizzaPy SMTP server automatically — no direct SMTP credentials are needed in AutoCert.

## How It Works

```
AutoCert → Gmail API (OAuth) → Gmail "Send As" alias → mail.pizzapy.ph SMTP → recipient
```

1. AutoCert sends via the **Gmail API** using OAuth tokens from `topitops123@gmail.com`
2. When the `From` header is set to `info@pizzapy.ph`, Gmail recognizes it as a configured "Send As" alias
3. Gmail relays the email through `mail.pizzapy.ph:465` (SSL) automatically
4. The recipient sees the email from `PizzaPy Cebu <info@pizzapy.ph>`

## Current Gmail "Send As" Configuration

| Field          | Value                          |
|----------------|--------------------------------|
| Display Name   | PizzaPy Cebu                   |
| Email          | info@pizzapy.ph                |
| SMTP Server    | mail.pizzapy.ph                |
| Port           | 465 (SSL)                      |
| Username       | info@pizzapy.ph (assumed)      |
| Authentication | Password (stored in Gmail)     |

This was configured in: **Gmail → Settings → Accounts and Import → Send mail as**

## Gmail Account Access

- **Primary Gmail**: `topitops123@gmail.com`
- **Google Cloud Project ID**: `599362094643`
- **OAuth Client**: `AutoCert` (Web application)
- **OAuth Scopes**: `gmail.send`, `gmail.settings.basic`
- **Redirect URI**: `http://localhost:3000/api/auth/gmail/callback`

## Setup Steps (Already Done)

1. Gmail account `topitops123@gmail.com` was configured with "Send mail as" for `info@pizzapy.ph`
2. SMTP credentials for `mail.pizzapy.ph` were entered in Gmail settings (password stored by Gmail)
3. Gmail OAuth app "AutoCert" was created in Google Cloud Console
4. Gmail API was enabled in the Google Cloud project
5. OAuth consent screen was configured

## How AutoCert Uses This

1. User connects Gmail via OAuth on the **Distribute → Email Settings** page
2. AutoCert fetches available "Send As" aliases via `gmail.settings.sendAs.list`
3. User picks `info@pizzapy.ph` from the **From** dropdown in the email composer
4. AutoCert creates email jobs with `from_email = "info@pizzapy.ph"`
5. The process route sets the `From` header, and Gmail handles SMTP relay

## If SMTP Password Is Lost

The SMTP password for `info@pizzapy.ph` is stored inside Gmail and cannot be retrieved. If Gmail loses the alias or it needs to be reconfigured:

1. Go to the **hosting control panel** for `pizzapy.ph` (cPanel, Plesk, or similar)
2. Navigate to **Email Accounts**
3. Reset the password for `info@pizzapy.ph`
4. Re-add the "Send As" alias in Gmail with the new password:
   - Gmail → Settings → Accounts and Import → "Add another email address"
   - Enter: `PizzaPy Cebu`, `info@pizzapy.ph`
   - SMTP: `mail.pizzapy.ph`, port `465`, SSL
   - Username: `info@pizzapy.ph`, Password: (new password)

## Hosting Provider Info

- **Domain**: pizzapy.ph
- **Mail server**: mail.pizzapy.ph
- **Type**: Free hosting with SMTP (shared hosting)
- **Access**: Check domain registrar or hosting provider dashboard for cPanel/email management

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Send As" alias not showing in AutoCert | Reconnect Gmail (Email Settings → Connect Gmail) to refresh OAuth scope |
| Emails bouncing from info@pizzapy.ph | Check if SMTP alias is still active in Gmail → Settings → Accounts and Import |
| "Gmail configuration is incomplete" | Reconnect Gmail — the `gmail_email` field may be null in the database |
| "Gmail API has not been used" | Enable Gmail API in Google Cloud Console → APIs & Services → Library |
| "redirect_uri_mismatch" | Ensure `GOOGLE_REDIRECT_URI` in `.env.local` matches Google Cloud Console |
