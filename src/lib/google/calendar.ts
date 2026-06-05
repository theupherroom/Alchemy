const FREEBUSY_URL = "https://www.googleapis.com/calendar/v3/freeBusy";
const EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export type Busy = { start: string; end: string };

export async function getBusy(
  accessToken: string,
  fromIso: string,
  toIso: string,
): Promise<Busy[]> {
  const res = await fetch(FREEBUSY_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      timeMin: fromIso,
      timeMax: toIso,
      timeZone: "UTC",
      items: [{ id: "primary" }],
    }),
  });
  if (!res.ok) {
    throw new Error(`freebusy failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    calendars?: { primary?: { busy?: { start?: string; end?: string }[] } };
  };
  const busy = data.calendars?.primary?.busy ?? [];
  return busy
    .filter((b): b is { start: string; end: string } =>
      Boolean(b.start && b.end),
    )
    .map((b) => ({ start: b.start, end: b.end }));
}

export type CalendarEventInput = {
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
  generateMeet: boolean;
};

export type CreatedEvent = {
  id: string;
  meetLink: string | null;
};

type GoogleEventResponse = {
  id?: string;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: { entryPointType?: string; uri?: string }[];
  };
};

// Creates an event with NO attendees. The Meet link is generated on the first
// event (generateMeet: true) and copied into the description of the second.
export async function createEvent(
  accessToken: string,
  input: CalendarEventInput,
  knownMeetLink?: string,
): Promise<CreatedEvent> {
  const description = knownMeetLink
    ? `${input.description}\n\nJoin: ${knownMeetLink}`
    : input.description;

  const body: Record<string, unknown> = {
    summary: input.summary,
    description,
    start: { dateTime: input.startIso, timeZone: "UTC" },
    end: { dateTime: input.endIso, timeZone: "UTC" },
    attendees: [],
    reminders: { useDefault: true },
  };

  if (input.generateMeet) {
    body.conferenceData = {
      createRequest: {
        requestId: `alchemy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }

  const url = new URL(EVENTS_URL);
  if (input.generateMeet) url.searchParams.set("conferenceDataVersion", "1");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`event create failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as GoogleEventResponse;

  const meetLink =
    data.hangoutLink ??
    data.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === "video",
    )?.uri ??
    knownMeetLink ??
    null;

  return { id: data.id ?? "", meetLink };
}

// Patches an existing event's start/end time without recreating it. Used for
// rescheduling — preserves the same eventId, hangoutLink, and conferenceData
// so the Meet link stays stable across reschedules.
export async function updateEventTime(
  accessToken: string,
  eventId: string,
  startIso: string,
  endIso: string,
): Promise<void> {
  const url = new URL(`${EVENTS_URL}/${encodeURIComponent(eventId)}`);
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      start: { dateTime: startIso, timeZone: "UTC" },
      end: { dateTime: endIso, timeZone: "UTC" },
    }),
  });
  if (!res.ok) {
    throw new Error(`event update failed: ${res.status} ${await res.text()}`);
  }
}
