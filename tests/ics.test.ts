import { describe, it, expect } from 'vitest';
import { buildIcs } from '@/lib/ics';

const base = { uid: 'abc@sev', title: 'Kuliah Maghrib', description: 'Akidah', durationMinutes: 60, location: 'Surau Elmina Valley' };

describe('buildIcs', () => {
  it('writes a timed event in UTC (19:24 Malaysia = 11:24 UTC), with CRLF line endings', () => {
    const ics = buildIcs({ ...base, startUtc: new Date('2026-11-11T11:24:00Z') });
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART:20261111T112400Z');
    expect(ics).toContain('DTEND:20261111T122400Z');
    expect(ics).toContain('LOCATION:Surau Elmina Valley');
    expect(ics).toContain('SUMMARY:Kuliah Maghrib');
    expect(ics.split('\r\n').length).toBeGreaterThan(8);
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n');
  });

  it('escapes commas, semicolons, backslashes and newlines in text fields', () => {
    const ics = buildIcs({ ...base, title: 'A, B; C\\D', description: 'baris 1\nbaris 2', startUtc: new Date('2026-11-11T11:24:00Z') });
    expect(ics).toContain('SUMMARY:A\\, B\\; C\\\\D');
    expect(ics).toContain('DESCRIPTION:baris 1\\nbaris 2');
  });

  it('writes an all-day event when the clock time is unknown', () => {
    const ics = buildIcs({ ...base, allDayDate: '2026-11-11' });
    expect(ics).toContain('DTSTART;VALUE=DATE:20261111');
    expect(ics).toContain('DTEND;VALUE=DATE:20261112');
  });

  it('rolls the all-day end date over a month end', () => {
    expect(buildIcs({ ...base, allDayDate: '2026-11-30' })).toContain('DTEND;VALUE=DATE:20261201');
  });
});
