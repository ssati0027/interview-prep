import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Providers } from './provoiders'
import './globals.css'

export const metadata: Metadata = {
  title: 'Senior Java Engineer — Interview Roadmap',
  description: '170+ topics to master for senior Java MNC interviews at Google, Amazon & Walmart',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
