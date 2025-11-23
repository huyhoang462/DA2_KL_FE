import React from 'react';
import { cn } from '../../../utils/lib';

export default function SearchSuggestions({
  list,
  onSelect,
  highlightedIndex,
}) {
  return (
    <div className="border-border-default bg-background-secondary absolute left-0 z-50 mt-2 w-full rounded-lg border shadow-lg">
      {list.map((item, index) => (
        <div
          key={item.id}
          onClick={() => onSelect(item.name)}
          className={cn(
            'text-text-primary cursor-pointer px-4 py-2 transition-colors',
            highlightedIndex === index ? 'bg-foreground' : 'hover:bg-foreground'
          )}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
