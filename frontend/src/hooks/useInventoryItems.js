// src/hooks/useInventoryItems.js
import { useQuery } from '@tanstack/react-query';
import { fetchInventoryItems } from '../api/inventoryApi';

export function useInventoryItems(params) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => fetchInventoryItems(params),
  });
}
