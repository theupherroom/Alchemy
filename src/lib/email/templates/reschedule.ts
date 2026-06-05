// Reschedule notification email. Sent to the OTHER party (the one who didn't
// click Reschedule) so they know the time changed without relying on Google's
// own calendar notification. Aliases-only, anonymity preserved.

type RescheduleEmailVars = {
  recipientAlias: string;
  initiatorAlias: string;
  newMeetingTime: string;
  meetLink: string;
  remaining: number; // reschedules left for this meeting
};

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderRescheduleEmail(vars: RescheduleEmailVars): string {
  const e = (s: string) => escape(s);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your alchemy meeting moved</title>
  </head>
  <body style="margin:0;padding:0;background:#fbf6f3;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#4b3621;line-height:1.55;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fbf6f3;">
      <tr>
        <td align="center" style="padding:56px 16px 24px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;">
            <tr>
              <td style="padding:0 8px 24px 8px;font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:22px;color:#4b3621;">
                alchemy
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 16px 48px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:20px;border:1px solid #e8dccf;overflow:hidden;">
            <tr>
              <td style="padding:48px 40px 8px 40px;">
                <p style="margin:0 0 12px 0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#a86618;">
                  Meeting moved
                </p>
                <h1 style="margin:0;font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:36px;line-height:1.05;letter-spacing:-0.02em;color:#4b3621;">
                  ${e(vars.recipientAlias)},<br/>${e(vars.initiatorAlias)} rescheduled.
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 0 40px;">
                <p style="margin:0;font-size:16px;color:#4b3621;">
                  Your intro meeting has been moved to a new time on both your
                  calendars. The Google Meet link is unchanged.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0 40px;">
                <div style="background:#fbe4d5;border-radius:12px;padding:18px 20px;">
                  <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#7a2f00;">
                    New time
                  </p>
                  <p style="margin:0;font-size:17px;color:#4b3621;font-weight:500;">
                    ${e(vars.newMeetingTime)}
                  </p>
                  ${
                    vars.meetLink
                      ? `<p style="margin:14px 0 0 0;"><a href="${e(vars.meetLink)}" style="display:inline-block;background:#d35400;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:9999px;font-size:14px;font-weight:500;">Open Google Meet</a></p>`
                      : ""
                  }
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0 40px;">
                <p style="margin:0;font-size:13px;color:#7c6856;">
                  Your calendar event has already been updated — no action
                  needed unless the new time doesn&apos;t work, in which case
                  you can reschedule from
                  <a href="https://alchemy.theupherroom.com/matches" style="color:#d35400;">your matches page</a>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0 40px;">
                <div style="height:1px;background:#fbe4d5;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 8px 40px;">
                <p style="margin:0;font-size:12px;line-height:1.55;color:#7c6856;">
                  ${
                    vars.remaining > 0
                      ? `${vars.remaining} reschedule${vars.remaining === 1 ? "" : "s"} remaining for this meeting.`
                      : "This meeting has used both of its reschedules. The next time stands."
                  }
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 48px 40px;">
                <p style="margin:0;font-size:12px;color:#7c6856;">
                  ${e(vars.initiatorAlias)} stays anonymous to you until you both
                  join the meeting. Identity reveal happens on camera.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 16px 56px 16px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7c6856;">
          alchemy &nbsp;·&nbsp; a tool of The UpHer Room Inc.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
