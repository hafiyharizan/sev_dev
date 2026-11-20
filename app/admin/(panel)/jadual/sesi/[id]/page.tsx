import { notFound } from 'next/navigation';
import { getSessionForEdit } from '@/lib/data/schedule-admin';
import { listProgramTypes, listSpeakers } from '@/lib/data/schedule';
import { todayMY } from '@/lib/time/clock';
import SessionForm from '../SessionForm';

export const dynamic = 'force-dynamic';

export default async function SessionPage({ params, searchParams }: { params: { id: string }; searchParams: { tarikh?: string } }) {
  const isNew = params.id === 'baru';
  const [session, types, speakers] = await Promise.all([
    isNew ? null : getSessionForEdit(params.id),
    listProgramTypes(),
    listSpeakers({ activeOnly: true }),
  ]);
  if (!isNew && !session) notFound();
  const defaultDate = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.tarikh ?? '') ? searchParams.tarikh! : todayMY();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isNew ? 'Sesi baharu' : 'Sunting sesi'}</h1>
      <SessionForm session={session} types={types} speakers={speakers} defaultDate={defaultDate} />
    </div>
  );
}
