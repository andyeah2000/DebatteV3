import { Inter, Roboto_Mono } from 'next/font/google'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import './globals.css'
import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'

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

interface WebVitalsMetric {
  id: string
  name: string
  value: number
  label: 'web-vital' | 'custom'
  startTime: number
  duration: number
}

export function reportWebVitals(metric: WebVitalsMetric) {
  // Only log in development or if explicitly enabled
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') {
    // Log to console
    console.log({
      name: metric.name,
      value: metric.value,
      label: metric.label,
      id: metric.id,
    })
    
    // Here you could also send to your analytics service
    // Example: analytics.track('Web Vital', { ...metric })
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
          <AnalyticsProvider />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
} 