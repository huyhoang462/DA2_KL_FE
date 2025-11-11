
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay'; 
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../../utils/lib'

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    weekday: 'long',
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const DotButton = ({ selected, onClick }) => (
  <button
    className={cn(
      'h-2 w-2 rounded-full transition-all duration-300',
      selected ? 'w-6 bg-primary' : 'bg-border-default hover:bg-border-default/80'
    )}
    type="button"
    onClick={onClick}
  />
);

const formatPrice = (price) => (price === 0 ? "Miễn phí" : `${price.toLocaleString('vi-VN')} ₫`);

export default function BannerCarousel({ events }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
      loop: true, 
      align: 'start',
      
  }, [Autoplay({ delay: 4000, stopOnInteraction: false })]); 
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);
  
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    }

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onInit); 
    
    onInit(); 

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onInit);
    };
  }, [emblaApi]);

  if (!events || events.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {events.map((event) => (
            
            
            
            <div className="flex-[0_0_100%] sm:flex-[0_0_50%] pl-4" key={event.id}>
              <Link to={`/event/${event.id}`} className="block relative aspect-[16/8] w-full rounded-2xl overflow-hidden group">
                <img
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={event.bannerImageUrl}
                  alt={event.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-4 lg:p-6 text-white w-full">
                  <h2 className=" text-xl lg:text-2xl font-bold truncate mb-2">{event.name}</h2>
                  <div className="flex items-center text-sm bg-black/30 backdrop-blur-sm p-2 rounded-lg w-fit">
                    <span className="font-bold text-primary">{formatPrice(event.lowestPrice)}</span>
                    <span className="mx-3 border-l border-gray-400 h-4"></span>
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button onClick={scrollPrev} className="bg-background-secondary cursor-pointer hover:bg-primary p-2 rounded-full shadow-md  transition-colors">
          <ArrowLeft className="h-5 w-5 text-text-primary" />
        </button>

        <div className="flex items-center justify-center gap-2">
            {scrollSnaps.map((_, index) => (
                <DotButton
                key={index}
                selected={index === selectedIndex}
                onClick={() => scrollTo(index)}
                />
            ))}
        </div>

        <button onClick={scrollNext} className="bg-background-secondary p-2 rounded-full shadow-md cursor-pointer hover:bg-primary transition-colors">
          <ArrowRight className="h-5 w-5 text-text-primary" />
        </button>
      </div>
    </div>
  );
}