import { CLSMetric, FCPMetric, FIDMetric, LCPMetric, TTFBMetric } from 'web-vitals'

type WebVitalsMetric = CLSMetric | FCPMetric | FIDMetric | LCPMetric | TTFBMetric

export function reportWebVitals(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric)
  }

  // Send to Vercel Analytics
  const body = {
    dsn: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: 'unknown'
  }

  if (navigator.connection) {
    // @ts-ignore
    body.speed = navigator.connection.effectiveType
  }

  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: 'application/x-www-form-urlencoded'
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/vitals', blob)
  } else {
    fetch('/vitals', {
      body: blob,
      method: 'POST',
      credentials: 'omit',
      keepalive: true
    })
  }
} 