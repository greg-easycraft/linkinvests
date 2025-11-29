"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "~/components/ui/button";
import { StreetView } from "./StreetView";
import type { Opportunity } from "@linkinvests/shared";

interface ImageCarouselProps {
  opportunity: Opportunity;
  className?: string;
}

// Type guard to check if opportunity has pictures
const hasPictureFields = (opportunity: Opportunity): opportunity is Extract<Opportunity, { mainPicture?: string; pictures?: string[] }> => {
  return 'mainPicture' in opportunity || 'pictures' in opportunity;
};

export function ImageCarousel({ opportunity, className = '' }: ImageCarouselProps): React.ReactElement {
  const options: EmblaOptionsType = { loop: true };
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Collect all available images
  const images: string[] = [];
  if (hasPictureFields(opportunity)) {
    if (opportunity.mainPicture) {
      images.push(opportunity.mainPicture);
    }
    if (opportunity.pictures) {
      images.push(...opportunity.pictures);
    }
  }

  // Always include StreetView + any available images
  const totalSlides = 1 + images.length; // 1 for StreetView + image count

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  return (
    <div className={`relative ${className}`}>
      {/* Main carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {/* StreetView slide */}
          <div className="flex-[0_0_100%] min-w-0">
            <StreetView
              address={opportunity.address ?? null}
              latitude={opportunity.latitude}
              longitude={opportunity.longitude}
            />
          </div>

          {/* Image slides */}
          {images.map((imageUrl, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 flex items-center justify-center">
              <img
                src={imageUrl}
                alt={`Property image ${index + 1}`}
                className="max-w-full max-h-[300px] w-auto h-auto rounded-lg shadow-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons - only show if there are multiple slides */}
      {totalSlides > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4 text-[#3E3E3E] hover:text-[#1F1F1F]" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4 text-[#3E3E3E] hover:text-[#1F1F1F]" />
          </Button>
        </>
      )}

      {/* Dots indicator - only show if there are multiple slides */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
