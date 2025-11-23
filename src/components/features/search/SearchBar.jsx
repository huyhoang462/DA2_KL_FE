import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';

import { useNavigate } from 'react-router-dom';
import SearchSuggestions from './SearchSuggestions';

const searchService = {
  getSuggestions: async (query) => {
    console.log(`[MOCK] Fetching suggestions for: ${query}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const mockData = [
      { id: '1', name: 'Đại nhạc hội mùa hè' },
      { id: '2', name: 'Workshop làm gốm' },
      { id: '3', name: 'Hội thảo AI & Blockchain' },
      { id: '4', name: 'Sự kiện âm nhạc ngoài trời' },
    ];
    return mockData.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  },
};

const SearchBar = () => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedValue = useDebounce(value, 300);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (!debouncedValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const data = await searchService.getSuggestions(debouncedValue);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [debouncedValue]);

  const handleKeyDown = useCallback(
    (e) => {
      if (suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex !== -1) {
          handleSelectSuggestion(suggestions[highlightedIndex].name);
        } else {
          onSubmit(e);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
      }
    },
    [suggestions, highlightedIndex]
  );

  const handleSelectSuggestion = useCallback(
    (selectedValue) => {
      setValue(selectedValue);
      navigate(`/search?query=${selectedValue.trim()}`);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    },
    [navigate]
  );

  const onSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;

    navigate(`/search?query=${value.trim()}`);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative hidden md:block">
      <form onSubmit={onSubmit}>
        <Search className="text-text-placeholder absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm sự kiện..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          className="border-border-default bg-background-secondary text-text-primary placeholder-text-placeholder focus:border-primary focus:ring-primary w-64 rounded-full border py-2 pr-4 pl-10 transition focus:ring-2 focus:outline-none lg:w-96"
        />
      </form>

      {/* Chỉ hiển thị SearchSuggestions khi showSuggestions là true */}
      {showSuggestions && suggestions.length > 0 && (
        <SearchSuggestions
          list={suggestions}
          onSelect={handleSelectSuggestion}
          highlightedIndex={highlightedIndex}
        />
      )}
    </div>
  );
};

export default React.memo(SearchBar);
