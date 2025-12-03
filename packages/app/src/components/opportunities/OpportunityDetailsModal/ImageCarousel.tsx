import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Opportunity, Auction, Listing } from '@/types'

interface ImageCarouselProps {
  opportunity: Opportunity
}

function hasPictures(
  opportunity: Opportunity,
): opportunity is Auction | Listing {
  return 'pictures' in opportunity || 'mainPicture' in opportunity
}

function getImages(opportunity: Opportunity): string[] {
  if (!hasPictures(opportunity)) return []

  const images: string[] = []
  if (opportunity.mainPicture) {
    images.push(opportunity.mainPicture)
  }
  if (opportunity.pictures) {
    images.push(...opportunity.pictures.filter((p) => p !== opportunity.mainPicture))
  }
  return images
}

function getStreetViewUrl(opportunity: Opportunity): string {
  const { latitude, longitude } = opportunity
  return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${latitude},${longitude}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`
}

export function ImageCarousel({
  opportunity,
}: ImageCarouselProps): React.ReactElement {
  const images = getImages(opportunity)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const hasImages = images.length > 0
  const showNavigation = images.length > 1

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setImageError(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setImageError(false)
  }

  const currentImage = hasImages ? images[currentIndex] : getStreetViewUrl(opportunity)

  return (
    <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
      {imageError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <ImageOff className="h-12 w-12 mb-2" />
          <span className="text-sm">Image non disponible</span>
        </div>
      ) : (
        <img
          src={currentImage}
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

      {!hasImages && !imageError && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Vue Street View
        </div>
      )}
    </div>
  )
}
