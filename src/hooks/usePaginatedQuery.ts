import { useState, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  refetch: () => void;
}

export function usePaginatedLeads(options: PaginationOptions = {}): PaginatedResult<any> {
  const { pageSize: initialPageSize = 25, initialPage = 1 } = options;
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-leads-paginated', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Get total count
      const { count, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Get page data
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) throw error;
      
      return { data: data || [], totalCount: count || 0 };
    },
    placeholderData: keepPreviousData,
  });

  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages || 1)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) setPage(p => p + 1);
  }, [page, totalPages]);

  const previousPage = useCallback(() => {
    if (page > 1) setPage(p => p - 1);
  }, [page]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1); // Reset to first page when changing page size
  }, []);

  return {
    data: data?.data || [],
    totalCount: data?.totalCount || 0,
    page,
    pageSize,
    totalPages,
    isLoading,
    isFetching,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    refetch,
  };
}

export function usePaginatedConversations(options: PaginationOptions = {}): PaginatedResult<any> {
  const { pageSize: initialPageSize = 25, initialPage = 1 } = options;
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-conversations-paginated', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { count, error: countError } = await supabase
        .from('chat_conversations')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          leads (full_name, email, phone)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) throw error;
      
      return { data: data || [], totalCount: count || 0 };
    },
    placeholderData: keepPreviousData,
  });

  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages || 1)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) setPage(p => p + 1);
  }, [page, totalPages]);

  const previousPage = useCallback(() => {
    if (page > 1) setPage(p => p - 1);
  }, [page]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  return {
    data: data?.data || [],
    totalCount: data?.totalCount || 0,
    page,
    pageSize,
    totalPages,
    isLoading,
    isFetching,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    refetch,
  };
}

export function usePaginatedCallLogs(options: PaginationOptions = {}): PaginatedResult<any> {
  const { pageSize: initialPageSize = 25, initialPage = 1 } = options;
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-call-logs-paginated', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { count, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .not('confirmation_call_status', 'eq', 'pending');
      
      if (countError) throw countError;
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .not('confirmation_call_status', 'eq', 'pending')
        .order('confirmation_call_time', { ascending: false, nullsFirst: false })
        .range(from, to);
        
      if (error) throw error;
      
      return { data: data || [], totalCount: count || 0 };
    },
    placeholderData: keepPreviousData,
  });

  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages || 1)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) setPage(p => p + 1);
  }, [page, totalPages]);

  const previousPage = useCallback(() => {
    if (page > 1) setPage(p => p - 1);
  }, [page]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  return {
    data: data?.data || [],
    totalCount: data?.totalCount || 0,
    page,
    pageSize,
    totalPages,
    isLoading,
    isFetching,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    refetch,
  };
}
