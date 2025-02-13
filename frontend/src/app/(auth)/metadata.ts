import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Authentication | Debattle',
    template: '%s | Debattle Authentication'
  },
  description: 'Sign in or create an account to join Debattle - the modern political debate platform.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
} 