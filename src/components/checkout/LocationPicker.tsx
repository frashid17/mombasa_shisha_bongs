'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation } from 'lucide-react'

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  initialLocation?: { lat: number; lng: number }
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  )
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isWithinMombasa, setIsWithinMombasa] = useState<boolean | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  // Mombasa boundaries (approximate)
  const MOMBASA_BOUNDS = {
    north: -4.0,
    south: -4.1,
    east: 39.8,
    west: 39.6,
  }

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        setLocation({ lat, lng })
        await checkLocationAndGetAddress(lat, lng)
        setLoading(false)
      },
      (err) => {
        setError('Unable to get your location. Please select on the map.')
        setLoading(false)
      }
    )
  }

  // Check if location is within Mombasa and get address
  const checkLocationAndGetAddress = async (lat: number, lng: number) => {
    try {
      // Check if within Mombasa bounds (client-side check first)
      const withinBounds =
        lat >= MOMBASA_BOUNDS.south &&
        lat <= MOMBASA_BOUNDS.north &&
        lng >= MOMBASA_BOUNDS.west &&
        lng <= MOMBASA_BOUNDS.east

      setIsWithinMombasa(withinBounds)

      // Get address from coordinates (reverse geocoding)
      const response = await fetch(`/api/location/geocode?lat=${lat}&lng=${lng}`)
      const data = await response.json()

      // Use server-side check result if available, otherwise use client-side
      const finalIsWithinMombasa = data.isWithinMombasa !== undefined ? data.isWithinMombasa : withinBounds
      setIsWithinMombasa(finalIsWithinMombasa)

      if (data.address) {
        setAddress(data.address)
        onLocationSelect({ lat, lng, address: data.address, isWithinMombasa: finalIsWithinMombasa })
      } else {
        const coordAddress = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
        setAddress(coordAddress)
        onLocationSelect({ lat, lng, address: coordAddress, isWithinMombasa: finalIsWithinMombasa })
      }
    } catch (err) {
      console.error('Error checking location:', err)
      // Fallback: use client-side bounds check
      const withinBounds =
        lat >= MOMBASA_BOUNDS.south &&
        lat <= MOMBASA_BOUNDS.north &&
        lng >= MOMBASA_BOUNDS.west &&
        lng <= MOMBASA_BOUNDS.east
      setIsWithinMombasa(withinBounds)
      const coordAddress = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
      setAddress(coordAddress)
      onLocationSelect({ lat, lng, address: coordAddress, isWithinMombasa: withinBounds })
    }
  }

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    // If no API key, use Leaflet (free alternative)
    if (!apiKey) {
      // Use Leaflet for free map
      const leafletScript = document.createElement('script')
      leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      leafletScript.onload = () => {
        const leafletCss = document.createElement('link')
        leafletCss.rel = 'stylesheet'
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(leafletCss)

        if (!mapRef.current) return

        const L = (window as any).L
        const center = location || [-4.0435, 39.6682]

        const map = L.map(mapRef.current).setView(center, 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map)

        const marker = L.marker(center, { draggable: true }).addTo(map)

        marker.on('dragend', async () => {
          const position = marker.getLatLng()
          const lat = position.lat
          const lng = position.lng
          setLocation({ lat, lng })
          await checkLocationAndGetAddress(lat, lng)
        })

        map.on('click', async (e: any) => {
          const lat = e.latlng.lat
          const lng = e.latlng.lng
          marker.setLatLng([lat, lng])
          setLocation({ lat, lng })
          await checkLocationAndGetAddress(lat, lng)
        })

        mapInstanceRef.current = map
        markerRef.current = marker

        if (location) {
          checkLocationAndGetAddress(location.lat, location.lng)
        }
      }
      document.head.appendChild(leafletScript)
      return
    }

    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      if (!mapRef.current) return

      // Default to Mombasa center if no location
      const center = location || { lat: -4.0435, lng: 39.6682 }

      const map = new (window as any).google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#1f2937' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca3af' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#1e3a8a' }],
          },
        ],
      })

      mapInstanceRef.current = map

      // Add marker
      const marker = new (window as any).google.maps.Marker({
        position: center,
        map,
        draggable: true,
        title: 'Drag to select delivery location',
      })

      markerRef.current = marker

      // Handle marker drag
      marker.addListener('dragend', async () => {
        const position = marker.getPosition()
        const lat = position.lat()
        const lng = position.lng()
        setLocation({ lat, lng })
        await checkLocationAndGetAddress(lat, lng)
      })

      // Handle map click
      map.addListener('click', async (e: any) => {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        marker.setPosition({ lat, lng })
        setLocation({ lat, lng })
        await checkLocationAndGetAddress(lat, lng)
      })

      // Get initial location if available
      if (location) {
        checkLocationAndGetAddress(location.lat, location.lng)
      }
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-white mb-2">
          Delivery Location *
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          {loading ? 'Getting location...' : 'Use My Location'}
        </button>
      </div>

      <div className="relative">
        <div ref={mapRef} className="w-full h-64 rounded-lg border border-gray-600" />
        {!location && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-lg">
            <p className="text-gray-400 text-sm">Click on map or use "Use My Location" to select</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {location && (
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">Selected Location:</p>
              <p className="text-gray-300 text-sm">{address || 'Location selected'}</p>
              <p className="text-gray-400 text-xs mt-1">
                Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
          </div>

          {isWithinMombasa !== null && (
            <div
              className={`rounded-lg p-3 ${
                isWithinMombasa
                  ? 'bg-green-900/20 border border-green-700'
                  : 'bg-yellow-900/20 border border-yellow-700'
              }`}
            >
              {isWithinMombasa ? (
                <p className="text-green-400 text-sm font-semibold">
                  ✓ Location is within Mombasa - Pay on Delivery available!
                </p>
              ) : (
                <p className="text-yellow-400 text-sm">
                  ⚠ Location is outside Mombasa. Pay on Delivery not available. Please use Mpesa payment.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

