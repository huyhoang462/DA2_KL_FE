import React, { useMemo, useState } from 'react';
import { Search, LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../../hooks/useSearch';
import useClickOutside from '../../../hooks/useClickOutside';
import SearchSuggestions from './SearchSuggestions';

const SearchBar = () => {
  const {
    query,
    setQuery,
    results,
    isLoading,
    showSuggestions,
    setShowSuggestions,
  } = useSearch();
  const navigate = useNavigate();

  const flatSuggestions = useMemo(() => {
    const keywordItems = results.keywords.map((kw) => ({
      type: 'keyword',
      value: kw,
    }));
    const eventItems = results.events.map((evt) => ({
      type: 'event',
      value: evt,
    }));
    return [...keywordItems, ...eventItems];
  }, [results]);

  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchContainerRef = useClickOutside(() => {
    setShowSuggestions(false);
  });

  const handleSelect = (item) => {
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    if (item.type === 'keyword') {
      setQuery(item.value);
      navigate(`/search?query=${item.value.trim()}`);
    } else if (item.type === 'event') {
      navigate(`/event-detail/${item.value._id}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    navigate(`/search?query=${query.trim()}`);
  };

  const handleKeyDown = (e) => {
    if (flatSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % flatSuggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(
          (prev) => (prev - 1 + flatSuggestions.length) % flatSuggestions.length
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && flatSuggestions[highlightedIndex]) {
          handleSelect(flatSuggestions[highlightedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative hidden md:block" ref={searchContainerRef}>
      <form onSubmit={handleSubmit}>
        <Search className="text-text-placeholder absolute top-1/2 left-3 z-10 h-5 w-5 -translate-y-1/2" />
        {isLoading && (
          <LoaderCircle className="text-text-placeholder absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 animate-spin" />
        )}
        <input
          type="text"
          placeholder="Tìm kiếm sự kiện..."
          value={query}
          spellCheck={false}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.keywords.length > 0 || results.events.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="border-border-default bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary focus:ring-primary w-64 rounded-full border py-2 pr-10 pl-10 transition focus:ring-2 focus:outline-none lg:w-96"
        />
      </form>

      {showSuggestions &&
        (results.keywords.length > 0 || results.events.length > 0) && (
          <SearchSuggestions
            onSelect={handleSelect}
            highlightedIndex={highlightedIndex}
            flatSuggestions={flatSuggestions}
          />
        )}
    </div>
  );
};

export default React.memo(SearchBar);
