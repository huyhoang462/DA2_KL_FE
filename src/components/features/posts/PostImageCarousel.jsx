import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/lib';

const DotButton = ({ selected, onClick }) => (
  <button
    className={cn(
      'h-1.5 w-1.5 rounded-full transition-all duration-300',
      selected ? 'w-4 bg-primary' : 'bg-white/60 hover:bg-white'
    )}
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  />
);

export default function PostImageCarousel({ images, onClick }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback((e) => {
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e) => {
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onInit);
    onInit();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onInit);
    };
  }, [emblaApi]);

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <button 
        type="button" 
        onClick={onClick} 
        disabled={!onClick}
        className={cn("w-full mt-3 rounded-xl overflow-hidden text-left border border-border-subtle hover:border-primary/30 transition shadow-sm", !onClick && "cursor-default")}
      >
        <img
          src={images[0]}
          alt="Post"
          className="w-full object-cover aspect-video"
        />
      </button>
    );
  }

  return (
    <div 
        className={cn("relative mt-3 w-full rounded-xl overflow-hidden border border-border-subtle group hover:border-primary/30 transition shadow-sm", onClick && "cursor-pointer")} 
        onClick={onClick}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((img, idx) => (
            <div className="flex-[0_0_100%] min-w-0" key={idx}>
              <img
                src={img}
                alt={`Post ${idx + 1}`}
                className="w-full object-cover aspect-video"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Prev/Next Buttons */}
      <button
        type="button"
        onClick={scrollPrev}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-opacity duration-300 z-10",
          selectedIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'
        )}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={scrollNext}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-opacity duration-300 z-10",
          selectedIndex === images.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 bg-black/20 px-2 py-1.5 rounded-full backdrop-blur-sm z-10">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            selected={index === selectedIndex}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
