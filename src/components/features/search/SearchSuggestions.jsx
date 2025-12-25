import React from 'react';
import { Search, Calendar, Clock, TrendingUp, X, Tag } from 'lucide-react';
import { cn } from '../../../utils/lib';

const KeywordItem = ({ item, isHighlighted, onSelect }) => (
  <div
    onClick={() => onSelect(item)}
    className={cn(
      'flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors',
      isHighlighted ? 'bg-primary/10' : 'hover:bg-background-primary'
    )}
  >
    <Search className="text-text-secondary h-4 w-4 flex-shrink-0" />
    <span className="text-text-primary">{item.value}</span>
  </div>
);

const EventItem = ({ item, isHighlighted, onSelect }) => {
  const event = item.value;
  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    return price === 0 ? 'Miễn phí' : `${price.toLocaleString('vi-VN')} ₫`;
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className={cn(
        'flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors',
        isHighlighted ? 'bg-primary/10' : 'hover:bg-background-primary'
      )}
    >
      <img
        src={event.bannerImageUrl}
        alt={event.name}
        className="h-14 w-20 flex-shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-text-primary truncate text-sm font-semibold">
          {event.name}
        </p>
        <div className="text-text-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(event.startDate).toLocaleDateString('vi-VN')}
          </span>
          <span className="text-primary font-medium">
            {formatPrice(event.lowestPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

const HistoryItem = ({ query, onSelect, onRemove, isHighlighted }) => (
  <div
    className={cn(
      'group flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors',
      isHighlighted ? 'bg-primary/10' : 'hover:bg-background-primary'
    )}
  >
    <div
      onClick={() => onSelect(query)}
      className="flex flex-1 items-center gap-3"
    >
      <Clock className="text-text-secondary h-4 w-4 flex-shrink-0" />
      <span className="text-text-primary">{query}</span>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove(query);
      }}
      className="text-text-secondary hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  </div>
);

const PopularKeywordChip = ({ keyword, onClick }) => (
  <button
    onClick={() => onClick(keyword.keyword)}
    className="bg-background-primary border-border-default hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
  >
    <Tag className="h-3 w-3" />
    {keyword.keyword}
    <span className="text-text-secondary text-[10px]">({keyword.count})</span>
  </button>
);

const SectionTitle = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between px-4 py-2">
    <div className="flex items-center gap-2">
      <Icon className="text-text-secondary h-4 w-4" />
      <h3 className="text-text-secondary text-xs font-semibold tracking-wide uppercase">
        {title}
      </h3>
    </div>
    {action}
  </div>
);

export default function SearchSuggestions({
  onSelect,
  highlightedIndex,
  flatSuggestions,
  searchHistory = [],
  popularEvents = [],
  popularKeywords = [],
  onClearHistory,
  onRemoveHistory,
  hasQuery = false,
}) {
  const renderItem = (item, index) => {
    const isHighlighted = highlightedIndex === index;

    if (item.type === 'keyword') {
      return (
        <KeywordItem
          key={`kw-${item.value}-${index}`}
          item={item}
          isHighlighted={isHighlighted}
          onSelect={onSelect}
        />
      );
    }

    if (item.type === 'event') {
      return (
        <EventItem
          key={`evt-${item.value._id}`}
          item={item}
          isHighlighted={isHighlighted}
          onSelect={onSelect}
        />
      );
    }

    return null;
  };

  // Show search results when user is typing
  if (hasQuery && flatSuggestions.length > 0) {
    const hasKeywords = flatSuggestions.some((item) => item.type === 'keyword');
    const hasEvents = flatSuggestions.some((item) => item.type === 'event');

    return (
      <div className="border-border-default bg-background-secondary absolute top-full left-1/2 z-50 mt-2 w-full min-w-[500px] -translate-x-1/2 overflow-hidden rounded-xl border shadow-xl">
        <div className="max-h-[70vh] overflow-y-auto">
          {hasKeywords && (
            <div className="border-border-default border-b py-2">
              <SectionTitle icon={Search} title="Gợi ý từ khóa" />
              <div className="py-1">
                {flatSuggestions
                  .filter((item) => item.type === 'keyword')
                  .map((item, index) => renderItem(item, index))}
              </div>
            </div>
          )}

          {hasEvents && (
            <div className="py-2">
              <SectionTitle icon={TrendingUp} title="Sự kiện phù hợp" />
              <div className="py-1">
                {flatSuggestions
                  .filter((item) => item.type === 'event')
                  .map((item, index) => renderItem(item, index))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show popular content when focused but no query
  if (!hasQuery) {
    return (
      <div className="border-border-default bg-background-secondary absolute top-full left-1/2 z-50 mt-2 w-full min-w-[500px] -translate-x-1/2 overflow-hidden rounded-xl border shadow-xl">
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="border-border-default border-b py-2">
              <SectionTitle
                icon={Clock}
                title="Lịch sử tìm kiếm"
                action={
                  <button
                    onClick={onClearHistory}
                    className="text-text-secondary hover:text-destructive text-xs font-medium transition-colors"
                  >
                    Xóa tất cả
                  </button>
                }
              />
              <div className="py-1">
                {searchHistory.map((query, index) => (
                  <HistoryItem
                    key={`history-${index}`}
                    query={query}
                    onSelect={(q) => onSelect({ type: 'keyword', value: q })}
                    onRemove={onRemoveHistory}
                    isHighlighted={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Popular Events */}
          {popularEvents.length > 0 && (
            <div className="border-border-default border-b py-2">
              <SectionTitle icon={TrendingUp} title="Sự kiện phổ biến" />
              <div className="py-1">
                {popularEvents.slice(0, 3).map((event) => (
                  <EventItem
                    key={event.id || event._id}
                    item={{ type: 'event', value: event }}
                    isHighlighted={false}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Popular Keywords */}
          {popularKeywords.length > 0 && (
            <div className="py-3">
              <SectionTitle icon={Tag} title="Từ khóa phổ biến" />
              <div className="flex flex-wrap gap-2 px-4 py-2">
                {popularKeywords.slice(0, 8).map((keyword, index) => (
                  <PopularKeywordChip
                    key={`popular-${index}`}
                    keyword={keyword}
                    onClick={(kw) => onSelect({ type: 'keyword', value: kw })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
