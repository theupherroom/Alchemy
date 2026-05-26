# Alchemy email templates (Supabase Auth)

Supabase sends transactional emails (confirm signup, magic link, password
reset, etc.) using built-in HTML templates. To match Alchemy's brand, paste
the templates from this folder into the Supabase dashboard.

## Where to paste

1. Open the Supabase dashboard for the Alchemy project.
2. Go to **Authentication → Emails → Email Templates**.
3. For each template:
   - **Confirm signup** — paste `confirm-signup.html` into the body
   - **Magic link** — paste `magic-link.html`
   - **Reset password** — paste `reset-password.html`
   - **Change email address** — paste `change-email.html` (optional)
4. Save each one.

> **Subject lines** are configured separately above each template body. See the
> `<!-- subject: … -->` comment at the top of each file for the recommended
> subject line.

## Variables Supabase substitutes

The templates use Go-style template tags. Supabase substitutes these at send time:

| Tag | Meaning |
|---|---|
| `{{ .ConfirmationURL }}` | Full link the user clicks (already includes the token + redirect) |
| `{{ .Token }}` | 6-digit OTP code (alternative to clicking the link) |
| `{{ .Email }}` | The recipient's email address |
| `{{ .SiteURL }}` | The Site URL from your Supabase project settings |
| `{{ .RedirectTo }}` | The post-confirmation redirect URL |

## Sender configuration — recommended before pilot

By default Supabase sends from `noreply@mail.supabase.io` which lands in
spam more often than not. Route auth emails through Resend with custom SMTP:

### Step 1 — verify a sending domain in Resend
1. In Resend: **Domains → Add domain**, e.g. `alchemy.theupherroom.com`.
2. Resend will give you DNS records (typically 3): one TXT for SPF, one TXT for
   DKIM, one MX or CNAME for tracking. Add them at your DNS host
   (Cloudflare / Vercel DNS / wherever theupherroom.com is managed).
3. Click **Verify**. This usually takes 5–60 minutes.

### Step 2 — create an SMTP credential in Resend
1. **API Keys → Create SMTP credentials** with full-access scope.
2. Resend gives you: host `smtp.resend.com`, port `465`, user `resend`,
   password = the API key.

### Step 3 — wire SMTP into Supabase
1. Supabase dashboard: **Authentication → Emails → SMTP Settings**.
2. Toggle **Enable Custom SMTP** on.
3. Fill in:
   - Sender email: `connect@alchemy.theupherroom.com`
   - Sender name: `Alchemy`
   - Host: `smtp.resend.com`
   - Port: `465`
   - User: `resend`
   - Password: (the API key from step 2)
4. Save and send yourself a test email from **Authentication → Users → invite**.

### Step 4 — set `RESEND_FROM_ADDRESS` env var
On Vercel, set `RESEND_FROM_ADDRESS=connect@alchemy.theupherroom.com` so the
intro emails and weekly digest also send from the verified domain.

## After pasting — sanity check

1. Sign up with a fresh email.
2. Open the confirmation email in a desktop client AND on mobile (the
   templates are tested down to 320px wide).
3. Confirm the link works and redirects back to `/auth/callback?next=/onboarding`.
