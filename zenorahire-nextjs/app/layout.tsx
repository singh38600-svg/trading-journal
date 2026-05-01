import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zenora Hire – World-Class Recruitment Consultancy',
  description: 'We connect exceptional talent with visionary companies. Executive search, IT recruitment, and HR consulting.',
  keywords: 'recruitment, hiring, talent, executive search, IT recruitment, HR consulting',
  openGraph: {
    title: 'Zenora Hire',
    description: 'World-class recruitment consultancy',
    url: 'https://zenorahire.com',
    siteName: 'Zenora Hire',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  )
}
