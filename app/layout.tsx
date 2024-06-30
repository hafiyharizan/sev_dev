import './globals.css';
import Navbar from './components/Navbar/index';
import Footer from './components/Footer/index';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'SEV',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
        </body>
    </html>
  )
}
