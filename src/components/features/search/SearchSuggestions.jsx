// src/components/shared/SearchSuggestions.jsx (Phiên bản nâng cấp)

import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { cn } from '../../../utils/lib';

const KeywordItem = ({ item, isHighlighted, onSelect }) => (
  <div
    onClick={() => onSelect(item)}
    className={cn(
      'flex cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors',
      isHighlighted ? 'bg-foreground' : 'hover:bg-foreground'
    )}
  >
    <Search className="text-text-secondary h-4 w-4" />
    <span className="text-text-primary">{item.value}</span>
  </div>
);

const EventItem = ({ item, isHighlighted, onSelect }) => (
  <div
    onClick={() => onSelect(item)}
    className={cn(
      'flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors',
      isHighlighted ? 'bg-foreground' : 'hover:bg-foreground'
    )}
  >
    <img
      src={item.value.bannerImageUrl}
      alt={item.value.name}
      className="h-12 w-16 rounded object-cover"
    />
    <div>
      <p className="text-text-primary text-sm font-semibold">
        {item.value.name}
      </p>
      <p className="text-text-secondary flex items-center gap-1 text-xs">
        <Calendar className="h-3 w-3" />
        {new Date(item.value.startDate).toLocaleDateString('vi-VN')}
      </p>
    </div>
  </div>
);

export default function SearchSuggestions({
  onSelect,
  highlightedIndex,
  flatSuggestions,
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

  return (
    <div className="border-border-default bg-background-secondary absolute left-0 z-50 mt-2 w-full overflow-hidden rounded-lg border shadow-lg">
      <div className="max-h-[60vh] overflow-y-auto">
        {/* Render từng item trong mảng phẳng */}
        {flatSuggestions.map((item, index) => renderItem(item, index))}
      </div>
    </div>
  );
}
