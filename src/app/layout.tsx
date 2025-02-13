import { Inter, Roboto_Mono } from 'next/font/google'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import './globals.css'
import dynamic from 'next/dynamic'
import { Analytics } from '@vercel/analytics/react'
import { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

// Load the ServiceWorkerRegistrator component dynamically on the client side only
const ServiceWorkerRegistrator = dynamic(() => import('../components/ServiceWorkerRegistrator'), { 
  ssr: false 
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Debattle - Modern Political Debate Platform',
    template: '%s | Debattle'
  },
  description: 'A fact-based platform for meaningful political debates and discussions.',
  keywords: [
    'debate',
    'politics',
    'discussion',
    'facts',
    'arguments',
    'political discourse',
    'democracy'
  ],
  authors: [{ name: 'Debattle Team' }],
  creator: 'Debattle Team',
  publisher: 'Debattle',
  robots: 'index, follow',
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'de-DE': '/de-DE',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://debattle.com',
    siteName: 'Debattle',
    title: 'Debattle - Modern Political Debate Platform',
    description: 'A fact-based platform for meaningful political debates and discussions.',
    images: [
      {
        url: 'https://debattle.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Debattle - Modern Political Debate Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@debattle',
    creator: '@debattle',
    title: 'Debattle - Modern Political Debate Platform',
    description: 'A fact-based platform for meaningful political debates and discussions.',
    images: ['https://debattle.com/twitter-image.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export function reportWebVitals(metric: any) {
  if (metric.label === 'web-vital' || metric.label === 'custom') {
    console.log(metric) // Send to your analytics service
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <Header />
          <ServiceWorkerRegistrator />
          {children}
          <Analytics 
            mode={'production'} 
            debug={false}
            beforeSend={(event) => {
              // Filter out sensitive information
              if (event.url) {
                const url = new URL(event.url)
                if (url.searchParams.has('token')) {
                  url.searchParams.delete('token')
                  event.url = url.toString()
                }
              }
              return event
            }}
          />
          <SpeedInsights 
            sampleRate={25}
            debug={false}
          />
        </Providers>
      </body>
    </html>
  )
} 