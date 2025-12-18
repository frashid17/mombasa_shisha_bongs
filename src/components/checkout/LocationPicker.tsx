'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, Loader2 } from 'lucide-react'

interface LocationData {
  lat: number
  lng: number
  address: string
  isWithinMombasa?: boolean
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void
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
  const mapTypeRef = useRef<'google' | 'leaflet' | null>(null)

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
      setError('Geolocation is not supported by your browser. Please select a location on the map.')
      return
    }

    setLoading(true)
    setError(null)

    // Request location with better options for mobile
    const options = {
      enableHighAccuracy: true, // Use GPS if available
      timeout: 15000, // 15 second timeout
      maximumAge: 0, // Don't use cached position
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        setLocation({ lat, lng })
        
        // Update marker position based on map type
        if (markerRef.current && mapTypeRef.current) {
          if (mapTypeRef.current === 'google') {
            // Google Maps
            markerRef.current.setPosition({ lat, lng })
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter({ lat, lng })
            }
          } else if (mapTypeRef.current === 'leaflet') {
            // Leaflet
            markerRef.current.setLatLng([lat, lng])
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom())
            }
          }
        }
        
        await checkLocationAndGetAddress(lat, lng)
        setLoading(false)
      },
      (err) => {
        // Don't show error for permission denied - map should still work
        // User can click on map to select location
        if (err.code === err.PERMISSION_DENIED) {
          setError(null) // Clear error - map is still usable
          setLoading(false)
          // Optionally show a non-blocking info message
          console.info('Location permission denied. You can still select a location by clicking on the map.')
        } else {
          let errorMessage = 'Unable to get your location. '
          
          // Provide more specific error messages for other errors
          switch (err.code) {
            case err.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable. Please click on the map to select a location.'
              break
            case err.TIMEOUT:
              errorMessage += 'Location request timed out. Please click on the map to select a location.'
              break
            default:
              errorMessage += 'Please click on the map to select a location.'
              break
          }
          
          setError(errorMessage)
          setLoading(false)
        }
      },
      options
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

    // Helper function to invalidate map size (for mobile)
    const invalidateMapSize = () => {
      if (mapInstanceRef.current && mapTypeRef.current) {
        if (mapTypeRef.current === 'leaflet') {
          mapInstanceRef.current.invalidateSize()
        } else if (mapTypeRef.current === 'google') {
          const google = (window as any).google
          if (google && google.maps && google.maps.event) {
            google.maps.event.trigger(mapInstanceRef.current, 'resize')
          }
        }
      }
    }

    // Add resize listener for mobile orientation changes
    const handleResize = () => {
      setTimeout(invalidateMapSize, 100)
    }
    
    // Store cleanup function
    let cleanupResize: (() => void) | null = null

    // Check if Google Maps is already loaded
    const isGoogleMapsLoaded = () => {
      return typeof (window as any).google !== 'undefined' && 
             typeof (window as any).google.maps !== 'undefined'
    }

    // Check if script is already in the DOM
    const isScriptLoaded = () => {
      return document.querySelector('script[src*="maps.googleapis.com"]') !== null
    }

    // Helper function to initialize Leaflet
    const initializeLeaflet = () => {
      if (mapTypeRef.current === 'leaflet' && mapInstanceRef.current) {
        // Already initialized
        return
      }

      // Check if Leaflet is already loaded (not just script tag exists)
      if (typeof (window as any).L !== 'undefined') {
        // Leaflet already loaded, just initialize map
        initLeafletMap()
        return
      }

      // Check if Leaflet script is already loading
      if (document.querySelector('script#leaflet-script')) {
        // Script is loading, wait for it
        const checkLeaflet = setInterval(() => {
          if (typeof (window as any).L !== 'undefined') {
            clearInterval(checkLeaflet)
            initLeafletMap()
          }
        }, 100)
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkLeaflet)
          if (typeof (window as any).L === 'undefined') {
            console.error('Leaflet failed to load after timeout')
          }
        }, 5000)
        return
      }

      // Use Leaflet for free map
      const leafletScript = document.createElement('script')
      leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      leafletScript.id = 'leaflet-script'
      leafletScript.onload = () => {
        // Check if Leaflet CSS is already loaded
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const leafletCss = document.createElement('link')
          leafletCss.rel = 'stylesheet'
          leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(leafletCss)
        }

        // Wait for CSS and ensure container is ready (longer delay for mobile)
        setTimeout(() => {
          if (!mapRef.current) return

          const L = (window as any).L
          if (!L) {
            console.error('Leaflet not loaded')
            return
          }

          const center = location || [-4.0435, 39.6682]

          const map = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: true,
            tap: true, // Enable touch events
            touchZoom: true,
            doubleClickZoom: true,
          }).setView(center, 13)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
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
          mapTypeRef.current = 'leaflet'

          // Force map to resize and render (multiple attempts for mobile)
          setTimeout(() => {
            map.invalidateSize()
          }, 200)
          setTimeout(() => {
            map.invalidateSize()
          }, 500)
          setTimeout(() => {
            map.invalidateSize()
          }, 1000)

          if (location) {
            checkLocationAndGetAddress(location.lat, location.lng)
          }
        }, 300) // Longer delay for mobile
      }
      document.head.appendChild(leafletScript)
    }

    // Helper function to initialize Leaflet map
    const initLeafletMap = () => {
      if (!mapRef.current) return

      const L = (window as any).L
      if (!L) {
        console.error('Leaflet not loaded')
        return
      }

      const center = location || [-4.0435, 39.6682]

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
        tap: true,
        touchZoom: true,
        doubleClickZoom: true,
      }).setView(center, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
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
      mapTypeRef.current = 'leaflet'

      setTimeout(() => map.invalidateSize(), 200)
      setTimeout(() => map.invalidateSize(), 500)
      setTimeout(() => map.invalidateSize(), 1000)

      if (location) {
        checkLocationAndGetAddress(location.lat, location.lng)
      }
    }

    // Helper function to initialize Google Map (when already loaded)
    const initializeGoogleMap = () => {
      if (!mapRef.current || !isGoogleMapsLoaded()) return

      try {
        const center = location || { lat: -4.0435, lng: 39.6682 }

        const map = new (window as any).google.maps.Map(mapRef.current, {
          center,
          zoom: 13,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy',
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

        const triggerResize = () => {
          const google = (window as any).google
          if (google && google.maps && google.maps.event) {
            google.maps.event.trigger(map, 'resize')
          }
        }
        
        setTimeout(triggerResize, 200)
        setTimeout(triggerResize, 500)
        setTimeout(triggerResize, 1000)

        const marker = new (window as any).google.maps.Marker({
          position: center,
          map,
          draggable: true,
          title: 'Drag to select delivery location',
        })

        markerRef.current = marker
        mapTypeRef.current = 'google'

        marker.addListener('dragend', async () => {
          const position = marker.getPosition()
          const lat = position.lat()
          const lng = position.lng()
          setLocation({ lat, lng })
          await checkLocationAndGetAddress(lat, lng)
        })

        map.addListener('click', async (e: any) => {
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()
          marker.setPosition({ lat, lng })
          setLocation({ lat, lng })
          await checkLocationAndGetAddress(lat, lng)
        })

        if (location) {
          checkLocationAndGetAddress(location.lat, location.lng)
        }
      } catch (error: any) {
        console.error('Google Maps initialization error:', error)
        if (error.message?.includes('InvalidKey') || error.message?.includes('InvalidKeyMapError')) {
          console.warn('Invalid Google Maps API key. Falling back to Leaflet.')
          initializeLeaflet()
        }
      }
    }

    // If no API key, use Leaflet (free alternative)
    if (!apiKey) {
      initializeLeaflet()
    } else if (isGoogleMapsLoaded()) {
      // Google Maps already loaded, just initialize
      initializeGoogleMap()
    } else if (!isScriptLoaded()) {
      // Load Google Maps script (only if not already loaded)
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.id = 'google-maps-script' // Prevent duplicates
      
      script.onload = () => {
        if (!mapRef.current) return

        // Check if Google Maps loaded successfully
        if (!isGoogleMapsLoaded()) {
          console.warn('Google Maps failed to load. Falling back to Leaflet.')
          initializeLeaflet()
          return
        }

        try {
          // Default to Mombasa center if no location
          const center = location || { lat: -4.0435, lng: 39.6682 }

          const map = new (window as any).google.maps.Map(mapRef.current, {
            center,
            zoom: 13,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            gestureHandling: 'greedy', // Better touch handling on mobile
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

          // Ensure map renders properly (multiple attempts for mobile)
          const triggerResize = () => {
            const google = (window as any).google
            if (google && google.maps && google.maps.event) {
              google.maps.event.trigger(map, 'resize')
            }
          }
          
          setTimeout(triggerResize, 200)
          setTimeout(triggerResize, 500)
          setTimeout(triggerResize, 1000)

          // Add marker
          const marker = new (window as any).google.maps.Marker({
            position: center,
            map,
            draggable: true,
            title: 'Drag to select delivery location',
          })

          markerRef.current = marker
          mapTypeRef.current = 'google'

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
        } catch (error: any) {
          console.error('Google Maps initialization error:', error)
          // If there's an error (e.g., invalid key), fallback to Leaflet
          if (error.message?.includes('InvalidKey') || error.message?.includes('InvalidKeyMapError')) {
            console.warn('Invalid Google Maps API key. Falling back to Leaflet.')
            initializeLeaflet()
          } else {
            // Other errors, also fallback
            console.warn('Google Maps error. Falling back to Leaflet.')
            initializeLeaflet()
          }
        }
      }

      script.onerror = () => {
        console.warn('Failed to load Google Maps script. Falling back to Leaflet.')
        initializeLeaflet()
      }

      // Add global error handler for Google Maps errors
      const originalError = window.onerror
      window.onerror = (message, source, lineno, colno, error) => {
        if (typeof message === 'string' && (message.includes('InvalidKey') || message.includes('InvalidKeyMapError'))) {
          console.warn('Google Maps API key error detected. Falling back to Leaflet.')
          initializeLeaflet()
          // Restore original error handler
          window.onerror = originalError
          return true
        }
        // Call original error handler if it exists
        if (originalError) {
          return originalError(message, source, lineno, colno, error)
        }
        return false
      }

      document.head.appendChild(script)
    } else if (isGoogleMapsLoaded()) {
      // Google Maps already loaded, just initialize the map
      initializeGoogleMap()
    }

    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
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
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg border border-gray-600 bg-gray-800"
          style={{ 
            minHeight: '256px', 
            height: '256px',
            width: '100%',
            position: 'relative', 
            zIndex: 0,
            touchAction: 'pan-x pan-y', // Enable touch gestures
          }}
        />
        {!location && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-lg pointer-events-none z-10">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Loading map...</p>
              <p className="text-gray-500 text-xs">Click on map or use "Use My Location" to select</p>
            </div>
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

