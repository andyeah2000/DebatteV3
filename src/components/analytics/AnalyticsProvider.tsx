'use client'

import { Analytics } from '@vercel/analytics/react'

// Client-side URL sanitization
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    if (urlObj.searchParams.has('token')) {
      urlObj.searchParams.delete('token')
      return urlObj.toString()
    }
    return url
  } catch (e) {
    console.error('Error sanitizing URL:', e)
    return url
  }
}

export function AnalyticsProvider() {
  return (
    <Analytics
      mode={process.env.NODE_ENV === 'production' ? 'production' : 'development'}
      debug={process.env.NODE_ENV === 'development'}
      beforeSend={(event) => {
        if (!event) return null
        return {
          ...event,
          url: event.url ? sanitizeUrl(event.url) : event.url
        }
      }}
    />
  )
} 