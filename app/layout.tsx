import './globals.css';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';
import MotionProvider from './components/MotionProvider';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Surau Elmina Valley',
  description: 'Portal Rasmi Surau Elmina Valley',
  icons: { apple: '/icons/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'SEV', statusBarStyle: 'default' as const },
}

export const viewport = { themeColor: '#00224A' };

const enableVercelInsights = process.env.VERCEL === '1';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms">
      <body className="antialiased">
        <MotionProvider>{children}</MotionProvider>
        {enableVercelInsights ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  )
}
