import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { BlockedLoginsResponse, BlockedLoginsFilters } from '../types/blocked-logins';
import { getBlockedLogins } from '../services/blocked-logins.service';

export function useBlockedLogins(initialPage: number = 1, perPage: number = 50) {
  const [data, setData] = useState<BlockedLoginsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [filters, setFilters] = useState<BlockedLoginsFilters>({
    username: '',
    result: '',
    ip: '',
    start_date: '',
    end_date: '',
  });

  const [debouncedFilters] = useDebounce(filters, 500);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getBlockedLogins(currentPage, perPage, debouncedFilters);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch blocked logins');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLogs();
  }, [currentPage, perPage, debouncedFilters, refreshCounter]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const refresh = () => {
    // Force a re-fetch by incrementing the refresh counter
    setRefreshCounter((prev) => prev + 1);
  };

  const updateFilters = (newFilters: Partial<BlockedLoginsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ username: '', result: '', ip: '', start_date: '', end_date: '' });
    setCurrentPage(1);
  };

  return {
    data,
    isLoading,
    error,
    currentPage,
    filters,
    goToPage,
    refresh,
    updateFilters,
    clearFilters,
  };
}
