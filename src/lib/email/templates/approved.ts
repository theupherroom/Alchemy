type ApprovedEmailVars = {
  alias: string;
  appUrl: string;
};

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderApprovedEmail(vars: ApprovedEmailVars): string {
  const e = (s: string) => escape(s);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your alchemy profile is live</title>
  </head>
  <body style="margin:0;padding:0;background:#fdfbf7;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#2a1f1c;line-height:1.55;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fdfbf7;">
      <tr>
        <td align="center" style="padding:56px 16px 24px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;">
            <tr>
              <td style="padding:0 8px 24px 8px;font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:22px;color:#2a1f1c;">
                alchemy
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 16px 48px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:20px;border:1px solid #e4d9cf;overflow:hidden;">
            <tr>
              <td style="padding:48px 40px 8px 40px;">
                <p style="margin:0 0 12px 0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#2f7c4b;">
                  You&apos;re in
                </p>
                <h1 style="margin:0;font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:38px;line-height:1.05;letter-spacing:-0.02em;color:#2a1f1c;">
                  ${e(vars.alias)},<br/>your profile is live.
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 0 40px;">
                <p style="margin:0;font-size:16px;color:#2a1f1c;">
                  We&apos;ve approved your profile. From now on you appear in
                  other members&apos; browse and suggestion feeds, and you can
                  request to connect with anyone whose mission resonates.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 8px 40px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:9999px;background:#6f2cc3;">
                      <a href="${e(vars.appUrl)}/dashboard"
                         style="display:inline-block;padding:14px 28px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-weight:500;font-size:14px;color:#ffffff;text-decoration:none;border-radius:9999px;">
                        Open your dashboard
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0 40px;">
                <div style="height:1px;background:#f5dde3;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 8px 40px;">
                <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#a86878;">
                  A reminder
                </p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#2a1f1c;">
                  Your real name and organization stay hidden behind
                  <span style="font-family:'JetBrains Mono',monospace;color:#3a1e7d;">${e(vars.alias)}</span>
                  until the moment your first intro meeting begins. Lead with
                  the mission. The rest follows.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 48px 40px;">
                <p style="margin:0;font-size:12px;color:#6b5d58;">
                  Questions? Reply to this email or write to
                  <a href="mailto:hello@theupherroom.com" style="color:#6f2cc3;">hello@theupherroom.com</a>.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 16px 56px 16px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6b5d58;">
          alchemy &nbsp;·&nbsp; a tool of The UpHer Room Inc.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
