+"use client";

import { Inter, Roboto_Mono } from 'next/font/google'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import './globals.css'
import { useEffect } from 'react'

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

function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen bg-white dark:bg-secondary-900">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
} 