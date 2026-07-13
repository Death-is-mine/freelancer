import type { Metadata } from 'next'
/* eslint-disable @next/next/google-font-display, @next/next/no-page-custom-font */
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const AgentationWrapper = dynamic(() =>
  import('@/components/AgentationWrapper').then((m) => m.AgentationWrapper),
)

export const metadata: Metadata = {
  title: 'FreelanceOS',
  description: 'Freelancer CRM built with Google Workspace',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-background text-on-surface`}>
        {children}
        <AgentationWrapper />
      </body>
    </html>
  )
}
