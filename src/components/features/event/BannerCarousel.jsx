import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../../utils/lib';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const DotButton = ({ selected, onClick }) => (
  <button
    className={cn(
      'h-2 w-2 rounded-full transition-all duration-300',
      selected
        ? 'bg-primary w-6'
        : 'bg-border-default hover:bg-border-default/80'
    )}
    type="button"
    onClick={onClick}
  />
);

const formatPrice = (price) =>
  price === 0 ? 'Miễn phí' : `${price.toLocaleString('vi-VN')} ₫`;

export default function BannerCarousel({ events }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );
  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

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

  const navigate = useNavigate();
  const handleClick = (eventId) => {
    navigate(`/event-detail/${eventId}`);
  };

  if (!events || events.length === 0) return null;

  return (
    <div>
      <h2 className="text-text-primary mb-6 text-3xl font-bold">
        Sự kiện nổi bật
      </h2>
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="-ml-4 flex">
            {events.map((event) => (
              <div
                className="flex-[0_0_100%] pl-4 sm:flex-[0_0_50%]"
                key={event.id}
              >
                <div
                  onClick={() => handleClick(event.id)}
                  // to={`/event-detail/${event.id}`}
                  className="group relative block aspect-[16/8] w-full cursor-pointer overflow-hidden rounded-2xl"
                >
                  <img
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={event.bannerImageUrl}
                    alt={event.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                  <div className="absolute bottom-0 left-0 w-full p-4 text-white lg:p-6">
                    <h2 className="mb-2 truncate text-xl font-bold lg:text-2xl">
                      {event.name}
                    </h2>
                    <div className="flex w-fit items-center rounded-lg bg-black/30 p-2 text-sm backdrop-blur-sm">
                      <span className="text-primary font-bold">
                        {formatPrice(event.lowestPrice)}
                      </span>
                      <span className="mx-3 h-4 border-l border-gray-400"></span>
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4">
          {/* <button
          onClick={scrollPrev}
          className="bg-background-secondary hover:bg-primary cursor-pointer rounded-full p-2 shadow-md transition-colors"
        >
          <ArrowLeft className="text-text-primary h-5 w-5" />
        </button> */}

          <div className="flex items-center justify-center gap-2">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                selected={index === selectedIndex}
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>

          {/* <button
          onClick={scrollNext}
          className="bg-background-secondary hover:bg-primary cursor-pointer rounded-full p-2 shadow-md transition-colors"
        >
          <ArrowRight className="text-text-primary h-5 w-5" />
        </button> */}
        </div>
      </div>
    </div>
  );
}
