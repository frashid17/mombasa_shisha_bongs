import { NextRequest, NextResponse } from 'next/server'

// Mombasa boundaries (approximate)
const MOMBASA_BOUNDS = {
  north: -4.0,
  south: -4.1,
  east: 39.8,
  west: 39.6,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lat, lng } = body

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

    // Check if within Mombasa bounds
    const isWithinMombasa =
      lat >= MOMBASA_BOUNDS.south &&
      lat <= MOMBASA_BOUNDS.north &&
      lng >= MOMBASA_BOUNDS.west &&
      lng <= MOMBASA_BOUNDS.east

    return NextResponse.json({
      isWithinMombasa,
      message: isWithinMombasa
        ? 'Location is within Mombasa. Pay on Delivery is available.'
        : 'Location is outside Mombasa. Pay on Delivery is not available.',
    })
  } catch (error) {
    console.error('Location check error:', error)
    return NextResponse.json({ error: 'Failed to check location' }, { status: 500 })
  }
}

