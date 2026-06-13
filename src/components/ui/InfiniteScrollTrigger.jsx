// src/components/ui/InfiniteScrollTrigger.jsx
import { useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function InfiniteScrollTrigger({
  onIntersect,
  hasMore,
  isLoading,
}) {
  const triggerRef = useRef(null);

  useEffect(() => {
    // Nếu không còn data hoặc đang tải thì không gắn observer
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Nếu cái "bẫy" lọt vào khung hình (viewport)
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      // rootMargin: '200px' nghĩa là kích hoạt trước khi cuộn chạm đáy 200px (để tải mượt hơn)
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => {
      if (triggerRef.current) observer.unobserve(triggerRef.current);
    };
  }, [hasMore, isLoading, onIntersect]);

  if (!hasMore) return null;

  return (
    <div ref={triggerRef} className="flex w-full justify-center py-6">
      {isLoading && <LoadingSpinner size="md" className="text-primary" />}
    </div>
  );
}
