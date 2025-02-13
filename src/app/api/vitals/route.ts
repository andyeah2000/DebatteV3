import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  
  try {
    // Parse the URLSearchParams string back into an object
    const searchParams = new URLSearchParams(body)
    const vitalsData = Object.fromEntries(searchParams.entries())

    // Log vitals data to your analytics service
    console.log('Web Vitals:', vitalsData)

    // You can send this data to any analytics service
    // For now, we'll just return a success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing vitals:', error)
    return NextResponse.json({ error: 'Failed to process vitals' }, { status: 500 })
  }
} 