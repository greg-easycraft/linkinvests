import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import type { Auction, Listing, Opportunity } from '@linkinvests/shared'
import { Button } from '@/components/ui/button'

interface ImageCarouselProps {
  opportunity: Opportunity
}

interface CarouselImage {
  url: string
  isStreetView: boolean
}

function hasPictures(opportunity: Opportunity): boolean {
  const opp = opportunity as Auction | Listing
  return (
    Boolean(opp.mainPicture) ||
    (Array.isArray(opp.pictures) && opp.pictures.length > 0)
  )
}

function getStreetViewUrl(opportunity: Opportunity): string {
  const { latitude, longitude } = opportunity
  return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${latitude},${longitude}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`
}

function getAllImages(opportunity: Opportunity): Array<CarouselImage> {
  const images: Array<CarouselImage> = []

  // Always add Street View as first image
  images.push({
    url: getStreetViewUrl(opportunity),
    isStreetView: true,
  })

  // Add property images if available
  if (hasPictures(opportunity)) {
    const opp = opportunity as Auction | Listing
    if (opp.mainPicture) {
      images.push({ url: opp.mainPicture, isStreetView: false })
    }
    if (opp.pictures && opp.pictures.length > 0) {
      opp.pictures
        .filter((p) => p !== opp.mainPicture)
        .forEach((url) => images.push({ url, isStreetView: false }))
    }
  }

  return images
}

export function ImageCarousel({
  opportunity,
}: ImageCarouselProps): React.ReactElement {
  const images = getAllImages(opportunity)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const showNavigation = images.length > 1

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setImageError(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setImageError(false)
  }

  const currentImage = images[currentIndex]

  return (
    <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
      {imageError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <ImageOff className="h-12 w-12 mb-2" />
          <span className="text-sm">Image non disponible</span>
        </div>
      ) : (
        <img
          src={currentImage.url}
          alt={opportunity.label}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}

      {showNavigation && !imageError && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => {
                  setCurrentIndex(index)
                  setImageError(false)
                }}
              />
            ))}
          </div>
        </>
      )}

      {currentImage.isStreetView && !imageError && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Vue Street View
        </div>
      )}
    </div>
  )
}
