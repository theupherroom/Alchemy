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

## Sender configuration (optional)

By default Supabase sends from `noreply@mail.supabase.io`. For production
deliverability you should configure custom SMTP:

1. Go to **Authentication → Emails → SMTP Settings**.
2. Configure your SMTP provider (Resend, Postmark, SES, etc.).
3. Set **Sender email** to something like `connect@alchemy.upherroom.com`.
4. Verify the domain in your SMTP provider before turning custom SMTP on.

## After pasting — sanity check

1. Sign up with a fresh email.
2. Open the confirmation email in a desktop client AND on mobile (the
   templates are tested down to 320px wide).
3. Confirm the link works and redirects back to `/auth/callback?next=/onboarding`.
