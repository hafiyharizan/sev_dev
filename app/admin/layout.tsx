export const metadata = { title: 'Admin · Surau Elmina Valley', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-lightgrey text-darkpurple">{children}</div>;
}
