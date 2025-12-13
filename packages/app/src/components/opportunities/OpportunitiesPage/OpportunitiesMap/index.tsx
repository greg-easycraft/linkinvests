import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { Loader2, Map as MapIcon } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { BaseOpportunity, OpportunityType } from '@linkinvests/shared'
import type { MapBounds } from '@/schemas/filters.schema'
import { TYPE_COLORS, TYPE_LABELS } from '@/constants/opportunity-types'

interface OpportunitiesMapProps<T extends BaseOpportunity> {
  opportunities: Array<T>
  type?: OpportunityType
  isLoading: boolean
  selectedId?: string
  onSelect: (opportunity: T) => void
  onBoundsChange?: (bounds: MapBounds) => void
}

// Helper to get type from opportunity or fallback
const getOpportunityType = <T extends BaseOpportunity>(
  opportunity: T,
  fallbackType?: OpportunityType,
): OpportunityType => {
  if ('type' in opportunity && opportunity.type) {
    return opportunity.type as OpportunityType
  }
  return fallbackType!
}

export function OpportunitiesMap<T extends BaseOpportunity>({
  opportunities,
  type: fallbackType,
  isLoading,
  selectedId,
  onSelect,
  onBoundsChange,
}: OpportunitiesMapProps<T>): React.ReactElement {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Array<mapboxgl.Marker>>([])
  const markerElementsRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const [mapLoaded, setMapLoaded] = useState(false)
  const userInteractedRef = useRef(false)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousOpportunitiesRef = useRef<Array<T>>([])

  // Debounced bounds change handler
  const handleBoundsChange = useCallback(() => {
    if (!map.current || !onBoundsChange || !userInteractedRef.current) return

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (!map.current) return
      const bounds = map.current.getBounds()
      if (!bounds) return
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      })
    }, 400)
  }, [onBoundsChange])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN

    if (!mapboxToken) {
      console.error('VITE_MAPBOX_TOKEN is not set')
      return
    }

    mapboxgl.accessToken = mapboxToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.3522, 48.8566], // Paris
      zoom: 5,
    })

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    // Track user interaction (drag or zoom)
    map.current.on('dragstart', () => {
      userInteractedRef.current = true
    })
    map.current.on('zoomstart', () => {
      userInteractedRef.current = true
    })

    // Emit bounds change after user interaction
    map.current.on('moveend', handleBoundsChange)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      map.current?.remove()
      map.current = null
    }
  }, [handleBoundsChange])

  // Handle window resize events (e.g., when sidebar toggles)
  useEffect(() => {
    const handleResize = () => {
      if (map.current) {
        map.current.resize()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Create/update markers when opportunities change
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
    markerElementsRef.current.clear()

    if (opportunities.length === 0) return

    // Add new markers
    opportunities.forEach((opportunity) => {
      const type = getOpportunityType(opportunity, fallbackType)
      const color = TYPE_COLORS[type]

      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.backgroundColor = color
      el.style.width = '12px'
      el.style.height = '12px'
      el.style.borderRadius = '50%'
      el.style.border = '2px solid white'
      el.style.cursor = 'pointer'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
      el.style.transition = 'width 0.15s, height 0.15s, border 0.15s'

      // Store reference to element for selection styling
      markerElementsRef.current.set(opportunity.id, el)

      if (!map.current) return

      const marker = new mapboxgl.Marker(el)
        .setLngLat([opportunity.longitude, opportunity.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 15 }).setHTML(
            `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${opportunity.label}</div>
              <div style="font-size: 12px; color: #666;">${TYPE_LABELS[type]}</div>
              <div style="font-size: 12px; color: #666;">${opportunity.streetAddress ? `${opportunity.streetAddress}, ${opportunity.city}` : opportunity.city}</div>
            </div>
          `,
          ),
        )
        .addTo(map.current)

      el.addEventListener('click', () => {
        onSelect(opportunity)
      })

      markersRef.current.push(marker)
    })
  }, [opportunities, onSelect, mapLoaded, fallbackType])

  // Fit bounds only when opportunities actually change (not on selection)
  useEffect(() => {
    if (!map.current || !mapLoaded || opportunities.length === 0) return

    // Check if opportunities actually changed (not just a re-render)
    const prevIds = previousOpportunitiesRef.current.map((o) => o.id).join(',')
    const currIds = opportunities.map((o) => o.id).join(',')

    if (prevIds !== currIds) {
      const bounds = new mapboxgl.LngLatBounds()
      opportunities.forEach((opp) => {
        bounds.extend([opp.longitude, opp.latitude])
      })
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 })
      previousOpportunitiesRef.current = opportunities
    }
  }, [opportunities, mapLoaded])

  // Update marker styling when selection changes (without moving the map)
  useEffect(() => {
    markerElementsRef.current.forEach((el, id) => {
      if (id === selectedId) {
        el.style.width = '16px'
        el.style.height = '16px'
        el.style.border = '3px solid white'
      } else {
        el.style.width = '12px'
        el.style.height = '12px'
        el.style.border = '2px solid white'
      }
    })
  }, [selectedId])

  return (
    <div className="relative w-full h-full">
      {isLoading && <MapLoadingOverlay />}
      {mapLoaded && !isLoading && opportunities.length === 0 && (
        <MapEmptyState />
      )}
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-card text-card-foreground p-4 rounded-lg shadow-sm border">
        <div className="text-sm font-semibold mb-2">
          Types d&apos;opportunités
        </div>
        <div className="space-y-1">
          {Object.entries(TYPE_COLORS).map(([typeKey, color]) => (
            <div key={typeKey} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{TYPE_LABELS[typeKey as OpportunityType]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MapLoadingOverlay(): React.ReactElement {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  )
}

function MapEmptyState(): React.ReactElement {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
      <div className="text-center">
        <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          Aucune opportunité à afficher sur la carte
        </p>
      </div>
    </div>
  )
}
