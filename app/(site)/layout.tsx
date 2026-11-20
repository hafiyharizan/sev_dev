import Navbar from '../components/Navbar/index';
import Footer from '../components/Footer/index';
import BottomNav from '../components/BottomNav';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pb-16 md:pb-0">
        {children}
        <Footer />
      </div>
      <BottomNav />
    </>
  );
}
