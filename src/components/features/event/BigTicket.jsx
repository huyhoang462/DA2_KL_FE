// src/components/features/event/BigTicket.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Tag } from 'lucide-react';
import Button from '../../../components/ui/Button';
import useUsdtVndRate from '../../../hooks/useUsdtVndRate';
import PriceDisplay from '../../ui/PriceDisplay';

export default function BigTicket({ event }) {
  const { data: exchangeRateVndPerUsdt } = useUsdtVndRate();
  const navigate = useNavigate();

  const getMinPrice = (shows) => {
    if (!shows || shows.length === 0) return 0;
    // An toàn: Tránh lỗi undefined khi map nếu show chưa có vé
    const allTickets = shows.flatMap((show) => show.tickets || []);
    if (allTickets.length === 0) return 0;
    return Math.min(...allTickets.map((ticket) => ticket.price));
  };

  const isEndEvent = useMemo(() => {
    console.log('Calculating isEndEvent, shows:', event.shows);
    return (
      event?.shows?.filter(
        (show) => show.status === 'pending' || show.status === 'ongoing'
      ).length === 0
    );
  }, [event.shows]);

  const minPrice = getMinPrice(event.shows);
  const hasMultipleShows = event.shows && event.shows.length > 1;

  const formattedDate = new Date(event.startDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleScrollToShowtimes = () => {
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const getSingleShowId = () => {
    if (event.shows && event.shows.length === 1) {
      return event.shows[0]._id || event.shows[0].id;
    }
    return null;
  };

  // Hàm helper để render Category an toàn, chống Crash React
  const getCategoryName = () => {
    if (!event.category) return 'Sự kiện';
    if (typeof event.category === 'string') return event.category;
    return event.category.name || 'Sự kiện';
  };

  return (
    <div className="w-full">
      <div className="group border-border-default bg-background-secondary relative flex flex-col overflow-hidden rounded-3xl md:min-h-[280px] md:flex-row lg:min-h-[300px]">
        {/* ── LEFT: Banner image ─────────────────────────────── */}
        {/* FIX: Thêm overflow-hidden và isolate để chặn ảnh tràn đè lên các UI khác khi hover */}
        <div className="border-border-default relative isolate z-0 h-56 w-full flex-shrink-0 overflow-hidden rounded-3xl border-2 md:absolute md:inset-y-0 md:left-0 md:h-full md:w-[55%] lg:w-[60%]">
          <img
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={event.bannerImageUrl}
            alt={event.name}
          />
        </div>

        {/* ── Perforated divider (desktop only) ──────────────── */}
        <div className="pointer-events-none absolute inset-y-0 z-20 hidden shadow-sm transition-shadow hover:shadow-md md:left-[55%] md:block lg:left-[60%]">
          {/* Dashed line */}
          <div className="absolute inset-y-0 left-[-3px] w-1.5 bg-[repeating-linear-gradient(to_bottom,var(--color-background-primary)_0,var(--color-background-primary)_8px,transparent_8px,transparent_16px)]" />
          {/* Top notch */}
          <div className="border-border-default bg-background-primary absolute -top-5 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full border" />
          {/* Bottom notch */}
          <div className="border-border-default bg-background-primary absolute -bottom-5 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full border" />
        </div>

        {/* ── Mobile perforated divider ──────────────────────── */}
        <div className="pointer-events-none absolute inset-x-0 top-56 z-20 block md:hidden">
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, var(--color-border-default) 0, var(--color-border-default) 8px, transparent 8px, transparent 16px)',
            }}
          />
          {/* Left notch */}
          <div className="border-border-default bg-background-primary absolute top-1/2 left-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border" />
          {/* Right notch */}
          <div className="border-border-default bg-background-primary absolute top-1/2 right-0 h-10 w-10 translate-x-1/2 -translate-y-1/2 rounded-full border" />
        </div>

        {/* ── RIGHT: Content ─────────────────────────────────── */}
        <div className="border-border-default relative z-10 flex flex-1 flex-col justify-between rounded-3xl border-2 p-6 md:ml-[55%] md:p-7 lg:ml-[60%] lg:p-8">
          {/* Top: tên sự kiện */}
          <div>
            <h1 className="text-text-primary line-clamp-3 min-h-[2.5em] text-xl leading-tight font-black md:text-2xl lg:text-3xl">
              {event.name}
            </h1>

            {/* Info rows */}
            <div className="mt-5 flex flex-col gap-3.5">
              {/* Date */}
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl">
                  {/* FIX ICON: Sử dụng kích thước chính xác h-[18px] w-[18px] vì Tailwind không có h-4.5 */}
                  <Calendar className="text-primary h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-text-secondary text-[10px] font-bold tracking-widest uppercase">
                    Thời gian
                  </p>
                  <p className="text-text-primary mt-0.5 text-sm font-semibold md:text-base">
                    {formattedDate}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl">
                  <MapPin className="text-primary h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-text-secondary text-[10px] font-bold tracking-widest uppercase">
                    Địa điểm
                  </p>
                  <p className="text-text-primary mt-0.5 line-clamp-2 min-h-[2.5em] text-sm font-semibold md:text-base">
                    {event.location?.address || 'Sự kiện Online'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: giá + CTA */}
          <div className="border-border-subtle mt-6 border-t pt-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              {/* Price */}
              {minPrice > 0 ? (
                <div>
                  <p className="text-text-secondary mb-1 text-xs font-semibold tracking-wider uppercase">
                    Giá vé từ
                  </p>
                  <PriceDisplay
                    amountUsdt={minPrice}
                    rateVndPerUsdt={exchangeRateVndPerUsdt}
                    layout="stacked"
                    vndWrapper="plain"
                    usdtClassName="text-2xl font-black text-primary md:text-3xl"
                    vndClassName="text-sm font-medium text-text-secondary mt-0.5"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-text-secondary mb-1 text-xs font-semibold tracking-wider uppercase">
                    Giá vé
                  </p>
                  <p className="text-success text-2xl font-black">Miễn phí</p>
                </div>
              )}

              {/* CTA Button */}
              {hasMultipleShows ? (
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleScrollToShowtimes}
                >
                  Chọn suất diễn
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={isEndEvent}
                  onClick={() =>
                    navigate(`/select-tickets/${event.id}/${getSingleShowId()}`)
                  }
                >
                  {isEndEvent ? 'Sự kiện đã kết thúc' : '  Mua vé ngay'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
