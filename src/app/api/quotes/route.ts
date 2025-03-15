import { getQuotes } from '@/lib/db'
import { NextResponse } from 'next/server'

export type QuoteType = {
  id: number
  text: string
  author: string | null
}

// Disable caching
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET() {
  try {
    console.log('API Route: Fetching quotes from database...')
    
    const quotes = await getQuotes()
    
    console.log(`API Route: Successfully fetched ${Array.isArray(quotes) ? quotes.length : 0} quotes`)
    
    // Set appropriate headers to prevent caching
    return NextResponse.json(quotes, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('API Route: Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes', details: String(error) },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    )
  }
}