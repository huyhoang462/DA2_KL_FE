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
    popularData,
    isLoading,
    showSuggestions,
    setShowSuggestions,
    searchHistory,
    handleSearch,
    handleClearHistory,
    handleRemoveFromHistory,
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
    setHighlightedIndex(-1);
  });

  const handleSelect = (item) => {
    setShowSuggestions(false);
    setHighlightedIndex(-1);

    if (item.type === 'keyword') {
      const searchQuery = item.value;
      setQuery(searchQuery);
      handleSearch(searchQuery);
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    } else if (item.type === 'event') {
      const eventId = item.value.id || item.value._id;
      navigate(`/event-detail/${eventId}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchQuery = query.trim();
    if (!searchQuery) return;

    setShowSuggestions(false);
    handleSearch(searchQuery);
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const itemCount = query.trim() ? flatSuggestions.length : 0;
    if (itemCount === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + itemCount) % itemCount);
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
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const shouldShowSuggestions =
    showSuggestions &&
    (query.trim()
      ? results.keywords.length > 0 || results.events.length > 0
      : searchHistory.length > 0 ||
        popularData.popularEvents?.length > 0 ||
        popularData.popularKeywords?.length > 0);

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
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="border-border-default bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary focus:ring-primary w-64 rounded-full border py-2 pr-10 pl-10 transition focus:ring-2 focus:outline-none lg:w-96"
        />
      </form>

      {shouldShowSuggestions && (
        <SearchSuggestions
          onSelect={handleSelect}
          highlightedIndex={highlightedIndex}
          flatSuggestions={flatSuggestions}
          searchHistory={searchHistory}
          popularEvents={popularData.popularEvents || []}
          popularKeywords={popularData.popularKeywords || []}
          onClearHistory={handleClearHistory}
          onRemoveHistory={handleRemoveFromHistory}
          hasQuery={query.trim().length > 0}
        />
      )}
    </div>
  );
};

export default React.memo(SearchBar);
