// src/components/features/event/BigTicket.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import Button from '../../../components/ui/Button';
import useUsdtVndRate from '../../../hooks/useUsdtVndRate';
import PriceDisplay from '../../ui/PriceDisplay';

export default function BigTicket({ event }) {
  const { data: exchangeRateVndPerUsdt } = useUsdtVndRate();
  const navigate = useNavigate();

  const getMinPrice = (shows) => {
    if (!shows || shows.length === 0) return 0;
    const allTickets = shows.flatMap((show) => show.tickets);
    if (allTickets.length === 0) return 0;
    return Math.min(...allTickets.map((ticket) => ticket.price));
  };

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

  return (
    <div className="w-full">
      {/* Khối bọc ngoài cùng: Xử lý viền và cắt 1 nửa hình tròn */}
      <div className="group border-border-default bg-background-secondary relative flex transform-gpu flex-col overflow-hidden rounded-3xl shadow-sm transition-shadow hover:shadow-md md:flex-row">
        {/* --- KHỐI TRÁI (Ảnh Banner) --- */}
        {/* FIX: Thêm overflow-hidden vào ĐÂY để ảnh không bị tràn ra khi scale */}
        <div className="bg-foreground relative h-60 w-full flex-shrink-0 overflow-hidden md:h-auto md:w-[55%] lg:w-[60%]">
          <img
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={event.bannerImageUrl}
            alt={event.name}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
        </div>

        {/* --- KHỐI PHẢI (Thông tin) --- */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-6 md:p-8 lg:p-10">
          <div>
            <h1 className="text-text-primary line-clamp-3 text-2xl leading-tight font-black md:text-3xl lg:text-4xl">
              {event.name}
            </h1>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
                  <Calendar className="text-primary h-5 w-5" />
                </div>
                <div className="flex flex-col justify-center pt-0.5">
                  <span className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Thời gian
                  </span>
                  <span className="text-text-primary text-sm font-bold md:text-base">
                    {formattedDate}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
                  <MapPin className="text-primary h-5 w-5" />
                </div>
                <div className="flex flex-col justify-center pt-0.5">
                  <span className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Địa điểm
                  </span>
                  <span className="text-text-primary line-clamp-2 text-sm font-bold md:text-base">
                    {event.location?.address || 'Sự kiện Online'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-border-subtle mt-8 border-t pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:flex-col lg:flex-row">
              {minPrice > 0 ? (
                <div>
                  <div className="text-text-secondary mb-1 text-sm font-bold">
                    Giá vé từ
                  </div>
                  <PriceDisplay
                    amountUsdt={minPrice}
                    rateVndPerUsdt={exchangeRateVndPerUsdt}
                    layout="stacked"
                    vndWrapper="plain"
                    usdtClassName="text-2xl font-black text-primary md:text-3xl"
                    vndClassName="text-sm font-semibold text-text-secondary md:text-base"
                  />
                </div>
              ) : (
                <div className="text-success text-lg font-bold">Miễn phí</div>
              )}

              {hasMultipleShows ? (
                <Button
                  className="w-full shadow-sm hover:-translate-y-0.5 sm:w-auto md:w-full lg:w-auto"
                  size="lg"
                  onClick={handleScrollToShowtimes}
                >
                  Chọn suất diễn
                </Button>
              ) : (
                <Button
                  className="w-full shadow-sm hover:-translate-y-0.5 sm:w-auto md:w-full lg:w-auto"
                  size="lg"
                  onClick={() =>
                    navigate(`/select-tickets/${event.id}/${getSingleShowId()}`)
                  }
                >
                  Mua vé ngay
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="border-background-primary absolute top-6 bottom-6 z-20 hidden w-0 border-l-2 border-dashed md:left-[55%] md:block lg:left-[60%]" />

        <div className="border-border-default bg-background-primary absolute top-0 z-20 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border md:left-[55%] md:block lg:left-[60%]" />

        <div className="border-border-default bg-background-primary absolute bottom-0 z-20 hidden h-12 w-12 -translate-x-1/2 translate-y-1/2 rounded-full border md:left-[55%] md:block lg:left-[60%]" />

        {/* 2. GIAO DIỆN MOBILE (nhỏ hơn md) */}
        {/* Nét đứt ngang thụt vào left-6, right-6 */}
        <div className="border-border-default absolute top-60 right-6 left-6 z-20 block h-0 border-t-[1.5px] border-dashed md:hidden" />

        <div className="border-border-default bg-background-primary absolute top-60 left-0 z-20 block h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border md:hidden" />

        <div className="border-border-default bg-background-primary absolute top-60 right-0 z-20 block h-12 w-12 translate-x-1/2 -translate-y-1/2 rounded-full border md:hidden" />
      </div>
    </div>
  );
}
