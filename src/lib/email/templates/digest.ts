// Weekly digest email — top-3 AI-scored suggestions for the recipient.
// Aliases only, mission-first, single CTA back to /dashboard.

type DigestSuggestion = {
  alias: string;
  sector: string;
  reach: string;
  mission: string;
  score: number;
  rationale: string;
};

type DigestVars = {
  recipientAlias: string;
  suggestions: DigestSuggestion[];
  appUrl: string;
};

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderDigestEmail(vars: DigestVars): string {
  const e = (s: string) => escape(s);
  const cardsHtml = vars.suggestions
    .map(
      (s) => `
        <tr>
          <td style="padding:16px 24px;background:#ffffff;border:1px solid #e4d9cf;border-radius:14px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <p style="margin:0;font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:22px;color:#2a1f1c;letter-spacing:-0.02em;">${e(s.alias)}</p>
                  <p style="margin:2px 0 0 0;font-size:12px;color:#6b5d58;">${e(s.sector)} · ${e(s.reach)}</p>
                </td>
                <td align="right">
                  <span style="display:inline-block;padding:4px 10px;border-radius:9999px;background:#8052a3;color:#ffffff;font-family:'JetBrains Mono','SF Mono',Consolas,monospace;font-size:11px;">${s.score}% match</span>
                </td>
              </tr>
              <tr><td colspan="2" style="padding:10px 0 0 0;font-size:14px;color:#2a1f1c;line-height:1.55;">${e(s.mission)}</td></tr>
              <tr><td colspan="2" style="padding:8px 0 0 0;font-size:12px;color:#6b5d58;font-style:italic;line-height:1.55;">${e(s.rationale)}</td></tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:12px;"></td></tr>
      `,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light only" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your alchemy digest</title>
</head>
<body style="margin:0;padding:0;background:#fdfbf7;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#2a1f1c;line-height:1.55;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fdfbf7;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;">
          <tr>
            <td style="padding:0 8px 24px 8px;font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:22px;color:#2a1f1c;">alchemy</td>
          </tr>
          <tr>
            <td style="padding:0 8px 8px 8px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#6b5d58;">Weekly digest</p>
              <h1 style="margin:8px 0 0 0;font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:34px;line-height:1.05;letter-spacing:-0.02em;color:#2a1f1c;">Hi ${e(vars.recipientAlias)},</h1>
              <p style="margin:14px 0 0 0;font-size:15px;color:#2a1f1c;">Three new alignments we'd back this week — ranked by mission, partnership type, and complementarity.</p>
            </td>
          </tr>
          <tr><td style="padding:24px 0 0 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${cardsHtml}</table>
          </td></tr>
          <tr><td style="padding:8px 8px 0 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:9999px;background:#8052a3;">
              <a href="${e(vars.appUrl)}/dashboard" style="display:inline-block;padding:12px 22px;font-weight:500;font-size:13px;color:#ffffff;text-decoration:none;border-radius:9999px;">Open the dashboard</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="padding:24px 8px 0 8px;font-size:12px;color:#6b5d58;">
            Not for you? <a href="${e(vars.appUrl)}/settings/notifications" style="color:#8052a3;">Manage notifications</a>.
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
