import { monthGrid } from '@/lib/time/month';
import type { ProgramType, SessionView } from '@/lib/schedule';

export type PosterBlock = {
  colour: string; topic: string; kitab: string | null; speakerName: string | null; photoUrl: string | null; cancelled: boolean;
};
export type PosterCell = { date: string | null; day: number | null; blocks: PosterBlock[]; crowded: boolean };
export type PosterModel = { title: string; legend: { name: string; colour: string }[]; weeks: PosterCell[][] };

const MONTHS = ['JAN', 'FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL', 'OGO', 'SEP', 'OKT', 'NOV', 'DIS'];
const LIMITS = { topic: 22, kitab: 26, speaker: 28, fallback: 30 };

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

export function buildPosterModel(year: number, month: number, sessions: SessionView[], types: ProgramType[]): PosterModel {
  const byDate = new Map<string, SessionView[]>();
  for (const s of sessions) byDate.set(s.date, [...(byDate.get(s.date) ?? []), s]);

  const weeks = monthGrid(year, month).map((week) =>
    week.map((date): PosterCell => {
      if (!date) return { date: null, day: null, blocks: [], crowded: false };
      let shortened = false;
      const cut = (text: string, max: number) => {
        const out = truncate(text, max);
        if (out !== text) shortened = true;
        return out;
      };
      const blocks = (byDate.get(date) ?? []).map((s): PosterBlock => ({
        colour: s.type.colour,
        topic: s.topic ? cut(s.topic, LIMITS.topic) : truncate(s.type.name, LIMITS.fallback), // fallback name is not flagged
        kitab: s.kitab ? cut(s.kitab, LIMITS.kitab) : null,
        speakerName: s.speaker ? cut(s.speaker.name, LIMITS.speaker) : null,
        photoUrl: s.speaker?.photoUrl ?? null,
        cancelled: s.status === 'cancelled',
      }));
      return { date, day: Number(date.slice(8)), blocks, crowded: blocks.length > 2 || shortened };
    }),
  );

  return {
    title: `${MONTHS[month - 1]} ${year}`,
    legend: types.map((t) => ({ name: t.name, colour: t.colour })),
    weeks,
  };
}
