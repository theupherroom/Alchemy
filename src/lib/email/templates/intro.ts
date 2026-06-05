// Plain-HTML email template. No React-Email dependency — kept inline so
// rendering works in any environment without extra build steps.
// Anonymity rule: aliases only, never real names, organizations, or websites.

type IntroEmailVars = {
  recipientAlias: string;
  otherAlias: string;
  otherMission: string;
  otherSector: string;
  otherReach: string;
  otherOffers: string;
  otherNeeds: string;
  meetingTime: string;
  meetLink: string;
  rationale: string;
};

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderIntroEmail(vars: IntroEmailVars): string {
  const e = (s: string) => escape(s);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>Alchemy intro</title>
  </head>
  <body style="margin:0;padding:0;background:#fdfbf7;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#2a1f1c;line-height:1.55;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fdfbf7;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e4d9cf;">
            <tr>
              <td style="padding:40px 36px 16px 36px;">
                <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6b5d58;">A confirmed alchemy match</p>
                <h1 style="margin:0;font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:32px;line-height:1.05;letter-spacing:-0.02em;color:#2a1f1c;">Hi ${e(vars.recipientAlias)},</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 36px 24px 36px;">
                <p style="margin:0;font-size:16px;color:#2a1f1c;">
                  You and another leader on Alchemy are aligned — and your intro meeting is already on your calendar.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 16px 36px;">
                <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6b5d58;">You matched because</p>
                <p style="margin:0;font-size:15px;color:#2a1f1c;">${e(vars.rationale)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 36px 0 36px;">
                <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6b5d58;">${e(vars.otherAlias)}</p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#6b5d58;width:90px;">Mission</td>
                    <td style="padding:6px 0;font-size:13px;color:#2a1f1c;">${e(vars.otherMission)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#6b5d58;">Sector</td>
                    <td style="padding:6px 0;font-size:13px;color:#2a1f1c;">${e(vars.otherSector)} · ${e(vars.otherReach)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#6b5d58;">Offers</td>
                    <td style="padding:6px 0;font-size:13px;color:#2a1f1c;">${e(vars.otherOffers)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#6b5d58;">Needs</td>
                    <td style="padding:6px 0;font-size:13px;color:#2a1f1c;">${e(vars.otherNeeds)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px;">
                <div style="background:#f5dde3;border-radius:12px;padding:18px 20px;">
                  <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a86878;">Your meeting</p>
                  <p style="margin:0;font-size:16px;color:#21172f;">${e(vars.meetingTime)}</p>
                  ${vars.meetLink
                    ? `<p style="margin:12px 0 0 0;"><a href="${e(vars.meetLink)}" style="display:inline-block;background:#8052a3;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:9999px;font-size:14px;font-weight:500;">Open Google Meet</a></p>`
                    : ""}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 36px 36px;">
                <p style="margin:0;font-size:14px;color:#6b5d58;">
                  You'll find out who they are when you show up. For now — let the mission lead.
                </p>
                <p style="margin:24px 0 0 0;font-size:12px;color:#6b5d58;">
                  Alchemy<br />A tool of The UpHer Room
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
