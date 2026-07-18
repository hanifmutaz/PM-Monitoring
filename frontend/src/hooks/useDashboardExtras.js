// src/hooks/useDashboardExtras.js
import { useQuery } from '@tanstack/react-query';
import { fetchAttention, fetchUpcoming } from '../api/dashboardApi';

export function useDashboardAttention() {
  return useQuery({ queryKey: ['dashboard', 'attention'], queryFn: fetchAttention });
}

export function useDashboardUpcoming() {
  return useQuery({ queryKey: ['dashboard', 'upcoming'], queryFn: fetchUpcoming });
}
