'use client'

import { Analytics, AnalyticsProps } from '@vercel/analytics/react'
import { useMemo } from 'react'

export function AnalyticsProvider() {
  const config = useMemo<AnalyticsProps>(() => ({
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    debug: process.env.NODE_ENV === 'development',
    beforeSend: (event) => {
      if (!event?.url) return event

      try {
        const url = new URL(event.url)
        if (url.searchParams.has('token')) {
          url.searchParams.delete('token')
          return { ...event, url: url.toString() }
        }
      } catch (e) {
        console.error('Error processing analytics URL:', e)
      }

      return event
    }
  }), [])

  return <Analytics {...config} />
} 