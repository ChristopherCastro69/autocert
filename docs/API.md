# API Reference

All API routes are under `/app/api/`. Server-side routes use the Supabase server client for authentication.

## POST /api/map-columns

Uses Groq LLM (Llama 3.3 70B) to intelligently map spreadsheet column headers to standard recipient fields.

### Request

```json
{
  "headers": ["Full Name", "Email Address", "Company"],
  "sampleRows": [
    { "Full Name": "John Doe", "Email Address": "john@example.com", "Company": "Acme" },
    { "Full Name": "Jane Smith", "Email Address": "jane@example.com", "Company": "Corp" }
  ]
}
```

| Field      | Type                        | Required | Description                |
|------------|-----------------------------|----------|----------------------------|
| headers    | string[]                    | Yes      | Column headers from file   |
| sampleRows | Record<string, string>[]    | Yes      | First few rows for context |

### Response

```json
{
  "mapping": {
    "firstName": null,
    "lastName": null,
    "email": "Email Address",
    "fullName": "Full Name"
  },
  "confidence": 0.95
}
```

| Field      | Type          | Description                                          |
|------------|---------------|------------------------------------------------------|
| mapping    | MappingResult | Maps standard fields to original column header names |
| confidence | number        | 0-1 confidence score from the LLM                   |

`MappingResult` fields: `firstName`, `lastName`, `email`, `fullName` -- each is a string (matching an original header) or null.

### Errors

- `400` -- No headers provided
- `500` -- LLM error or parsing failure

---

## POST /api/email/send

Creates email jobs for a batch of generated certificates and triggers processing.

### Request

```json
{
  "orgId": "uuid",
  "certificateIds": ["uuid-1", "uuid-2", "uuid-3"],
  "subject": "Your Certificate - {{firstName}}",
  "body": "<p>Hi {{firstName}}, here is your certificate.</p>"
}
```

| Field          | Type     | Required | Description                                  |
|----------------|----------|----------|----------------------------------------------|
| orgId          | string   | Yes      | Organization ID                              |
| certificateIds | string[] | Yes      | IDs from generated_certificates table        |
| subject        | string   | Yes      | Email subject (supports template variables)  |
| body           | string   | Yes      | Email body HTML (supports template variables)|

Template variables: `{{firstName}}`, `{{lastName}}`

### Response

```json
{
  "success": true,
  "jobCount": 3
}
```

### Errors

- `400` -- Missing required fields or no active email config for the org
- `500` -- Database error

---

## POST /api/email/process

Processes pending email jobs from the queue. Protected by `CRON_SECRET` header.

### Authentication

```
x-cron-secret: <value of CRON_SECRET env var>
```

Returns `401 Unauthorized` if the header is missing or incorrect.

### Request

No request body required. The endpoint fetches pending jobs from the database.

### Response

```json
{
  "processed": 20,
  "sent": 18,
  "failed": 2,
  "remaining": 45
}
```

| Field     | Type   | Description                              |
|-----------|--------|------------------------------------------|
| processed | number | Total jobs attempted in this batch       |
| sent      | number | Successfully sent                        |
| failed    | number | Failed (will retry or permanently failed)|
| remaining | number | Jobs still pending in queue              |

### Behavior

1. Fetches up to 20 (`EMAIL_BATCH_SIZE`) pending/retrying jobs
2. Processes each job (download cert, send email, update status)
3. If more jobs remain, self-invokes to continue processing
4. Returns `{ processed: 0, message: "No pending jobs" }` when queue is empty

---

## GET /api/auth/gmail/authorize

Initiates the Gmail OAuth 2.0 flow. Redirects to Google's consent screen.

### Query Parameters

| Param | Type   | Required | Description                    |
|-------|--------|----------|--------------------------------|
| orgId | string | Yes      | Organization ID (passed as state) |

### Behavior

1. Generates Google OAuth URL with `gmail.send` scope
2. Passes `orgId` as the OAuth `state` parameter
3. Redirects user to Google consent screen
4. Requests `access_type: "offline"` for refresh token

### Errors

- `400` -- Missing orgId

---

## GET /api/auth/gmail/callback

OAuth callback handler. Google redirects here after user consent.

### Query Parameters (set by Google)

| Param | Type   | Description                          |
|-------|--------|--------------------------------------|
| code  | string | Authorization code from Google       |
| state | string | The orgId passed during authorization|

### Behavior

1. Exchanges authorization code for access + refresh tokens
2. Fetches the authenticated Gmail address via token info
3. Upserts `email_configs` row for the org (creates or updates)
4. Redirects to `/dashboard/<orgSlug>/settings`

### Errors

- `400` -- Missing code or state parameter, or failed token exchange
- `500` -- OAuth callback processing failure
