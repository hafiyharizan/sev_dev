import { listLinks } from '@/lib/data/links';
import { LINK_CATEGORIES } from '@/lib/links';
import { safe } from '@/lib/safe';

export const metadata = { title: 'Borang & Pautan · Surau Elmina Valley' };
export const revalidate = 3600;

export default async function Borang() {
  const links = await safe(listLinks(), []);
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 lg:px-8">
      <h1 className="text-4xl font-bold">Borang & Pautan</h1>
      {links.length === 0 ? <p>Tiada pautan lagi.</p> : null}
      {LINK_CATEGORIES.map((cat) => {
        const group = links.filter((l) => l.category === cat);
        if (group.length === 0) return null;
        return (
          <section key={cat}>
            <h2 className="mb-3 text-xl font-semibold">{cat}</h2>
            <ul className="space-y-3">
              {group.map((l) => (
                <li key={l.id}>
                  <a href={l.url} className="block min-h-[44px] rounded-2xl bg-white p-4 shadow-sm"
                    {...(l.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    <span className="font-semibold">{l.title}</span>
                    {l.description ? <span className="block text-sm text-darkgrey">{l.description}</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
