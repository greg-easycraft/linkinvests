import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageCarouselMiniProps {
  mainPicture?: string
  pictures?: Array<string>
  alt: string
  className?: string
}

function getAllImages(
  mainPicture?: string,
  pictures?: Array<string>,
): Array<string> {
  const images: Array<string> = []

  // Add main picture first
  if (mainPicture) {
    images.push(mainPicture)
  }

  // Add additional pictures (excluding duplicates of mainPicture)
  if (pictures && pictures.length > 0) {
    pictures
      .filter((p) => p !== mainPicture)
      .forEach((url) => images.push(url))
  }

  return images
}

export function ImageCarouselMini({
  mainPicture,
  pictures,
  alt,
  className,
}: ImageCarouselMiniProps): React.ReactElement {
  const images = getAllImages(mainPicture, pictures)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const showNavigation = images.length > 1

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setImageError(false)
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setImageError(false)
  }

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setCurrentIndex(index)
    setImageError(false)
  }

  const currentImage = images[currentIndex]

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'w-full h-full flex items-center justify-center bg-muted',
          className,
        )}
      >
        <ImageOff className="h-12 w-12 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn('relative w-full h-full group', className)}>
      {imageError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted">
          <ImageOff className="h-12 w-12 mb-2" />
          <span className="text-sm">Image non disponible</span>
        </div>
      ) : (
        <img
          src={currentImage}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}

      {showNavigation && !imageError && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-90 transition-opacity cursor-pointer"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-90 transition-opacity cursor-pointer"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots indicator */}
          <div
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors cursor-pointer',
                  index === currentIndex ? 'bg-white' : 'bg-white/50',
                )}
                onClick={(e) => handleDotClick(e, index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
