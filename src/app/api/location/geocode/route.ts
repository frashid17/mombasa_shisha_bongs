import { NextRequest, NextResponse } from 'next/server'

// Mombasa boundaries
const MOMBASA_BOUNDS = {
  north: -4.0,
  south: -4.1,
  east: 39.8,
  west: 39.6,
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
  }

  try {
    // Check if within Mombasa bounds
    const isWithinMombasa =
      lat >= MOMBASA_BOUNDS.south &&
      lat <= MOMBASA_BOUNDS.north &&
      lng >= MOMBASA_BOUNDS.west &&
      lng <= MOMBASA_BOUNDS.east

    // Try to get address using Google Maps Geocoding API if key is available
    let address = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`

    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        )
        const geocodeData = await geocodeResponse.json()

        if (geocodeData.results && geocodeData.results.length > 0) {
          address = geocodeData.results[0].formatted_address
        }
      } catch (err) {
        console.error('Geocoding error:', err)
        // Fallback to coordinates if geocoding fails
      }
    }

    return NextResponse.json({
      lat,
      lng,
      address,
      isWithinMombasa,
    })
  } catch (error) {
    console.error('Location check error:', error)
    return NextResponse.json(
      { error: 'Failed to process location' },
      { status: 500 }
    )
  }
}

