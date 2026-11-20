import './globals.css';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'Surau Elmina Valley',
  description: 'Portal Rasmi Surau Elmina Valley',
}

const enableVercelInsights = process.env.VERCEL === '1';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms">
      <body className="antialiased">
        {children}
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
