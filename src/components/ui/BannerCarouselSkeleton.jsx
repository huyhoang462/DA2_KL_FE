import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const SkeletonBar = ({ className }) => (
  <div className={`animate-pulse rounded bg-gray-300 ${className}`} />
);

const SkeletonCarouselItem = () => (
  <div className="flex-[0_0_100%] pl-4 sm:flex-[0_0_50%]">
    <div className="relative block aspect-[16/8] w-full animate-pulse overflow-hidden rounded-2xl bg-gray-200">
      <div className="absolute bottom-0 left-0 w-full p-4 lg:p-6">
        <SkeletonBar className="mb-3 h-6 w-3/4 lg:h-7" />

        <SkeletonBar className="h-8 w-2/3" />
      </div>
    </div>
  </div>
);

export default function BannerCarouselSkeleton() {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="-ml-4 flex">
          <SkeletonCarouselItem />
          <SkeletonCarouselItem />
        </div>
      </div>

      <div className="absolute -bottom-12 left-1/2 flex -translate-x-1/2 items-center gap-4">
        <div className="bg-background-secondary cursor-not-allowed rounded-full p-2 opacity-50 shadow-md">
          <ArrowLeft className="text-text-secondary h-5 w-5" />
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="bg-primary h-2 w-2 rounded-full transition-all"></div>
          <div className="bg-border-default h-2 w-2 rounded-full transition-all"></div>
        </div>

        <div className="bg-background-secondary cursor-not-allowed rounded-full p-2 opacity-50 shadow-md">
          <ArrowRight className="text-text-secondary h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
