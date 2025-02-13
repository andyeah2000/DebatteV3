export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function ApiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 