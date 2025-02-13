import { Inter, Roboto_Mono } from 'next/font/google'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import './globals.css'
import dynamic from 'next/dynamic'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

// Load the ServiceWorkerRegistrator component dynamically on the client side only
const ServiceWorkerRegistrator = dynamic(() => import('../components/ServiceWorkerRegistrator'), { 
  ssr: false 
});

export const metadata = {
  title: 'Debattle',
  description: 'A fact-based platform for meaningful political debates and discussions.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}>
        <Providers>
          <Header />
          <ServiceWorkerRegistrator />
          {children}
        </Providers>
      </body>
    </html>
  )
} 