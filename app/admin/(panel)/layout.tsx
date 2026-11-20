import { BottomTabs, SideNav } from '@/app/components/admin/AdminNav';
import { logout } from './actions';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-linegrey bg-white px-4 py-3">
        <span className="font-bold text-navyblue">SEV Admin</span>
        <form action={logout}>
          <button type="submit" className="min-h-[44px] px-3 text-sm underline">Log keluar</button>
        </form>
      </header>
      <div className="flex flex-1">
        <SideNav />
        <main className="flex-1 p-4 pb-24 md:pb-4">{children}</main>
      </div>
      <BottomTabs />
    </div>
  );
}
