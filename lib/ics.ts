export type IcsEvent = {
  uid: string; title: string; description: string; location: string; durationMinutes: number;
  startUtc?: Date;      // timed event
  allDayDate?: string;  // YYYY-MM-DD, used when the clock time is unknown
};

const esc = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const dateOnly = (iso: string) => iso.replace(/-/g, '');

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function buildIcs(e: IcsEvent): string {
  const when = e.allDayDate
    ? [`DTSTART;VALUE=DATE:${dateOnly(e.allDayDate)}`, `DTEND;VALUE=DATE:${dateOnly(nextDay(e.allDayDate))}`]
    : [`DTSTART:${stamp(e.startUtc!)}`, `DTEND:${stamp(new Date(e.startUtc!.getTime() + e.durationMinutes * 60_000))}`];
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Surau Elmina Valley//Jadual//MS',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${e.uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    ...when,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.description)}`,
    `LOCATION:${esc(e.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
