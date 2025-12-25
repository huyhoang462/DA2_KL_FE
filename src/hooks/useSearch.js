import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';
import {
  searchSuggestions,
  getPopularSearches,
} from '../services/searchService';

// Search history utilities
const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 5;

export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

export const addToSearchHistory = (query) => {
  if (!query.trim()) return;

  try {
    const history = getSearchHistory();
    const newHistory = [
      query,
      ...history.filter((item) => item !== query),
    ].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
};

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
};

export const removeFromHistory = (query) => {
  try {
    const history = getSearchHistory();
    const newHistory = history.filter((item) => item !== query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to remove from history:', error);
  }
};

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ keywords: [], events: [] });
  const [popularData, setPopularData] = useState({
    popularEvents: [],
    popularKeywords: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const debouncedQuery = useDebounce(query, 300);

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Fetch popular data when focused but no query
  useEffect(() => {
    if (showSuggestions && !query.trim()) {
      const fetchPopular = async () => {
        try {
          const data = await getPopularSearches();
          setPopularData(data);
        } catch (error) {
          console.error('Error fetching popular searches:', error);
        }
      };
      fetchPopular();
    }
  }, [showSuggestions, query]);

  // Fetch suggestions when typing
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ keywords: [], events: [] });
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const data = await searchSuggestions(debouncedQuery);
        setResults(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setResults({ keywords: [], events: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = (searchQuery) => {
    addToSearchHistory(searchQuery);
    setSearchHistory(getSearchHistory());
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
  };

  const handleRemoveFromHistory = (item) => {
    removeFromHistory(item);
    setSearchHistory(getSearchHistory());
  };

  return {
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
  };
};
