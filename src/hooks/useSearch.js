import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';
import { searchSuggestions } from '../services/searchService';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ keywords: [], events: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ keywords: [], events: [] });
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const data = await searchSuggestions(debouncedQuery);
        setResults(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    showSuggestions,
    setShowSuggestions,
  };
};
