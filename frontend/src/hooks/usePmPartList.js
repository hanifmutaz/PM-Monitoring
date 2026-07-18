// src/hooks/usePmPartList.js
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchPmPartList } from '../api/pmPartApi';

export function usePmPartList(params) {
  return useQuery({
    queryKey: ['pm-part', params],
    queryFn: () => fetchPmPartList(params),
    placeholderData: keepPreviousData,
  });
}
