import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Debates | Debattle',
  description: 'Browse and participate in meaningful political debates.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function DebatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 