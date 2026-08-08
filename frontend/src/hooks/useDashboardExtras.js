// src/hooks/useDashboardExtras.js
import { useQuery } from '@tanstack/react-query';
import {
  fetchAttention,
  fetchUpcoming,
  fetchPartSummary,
  fetchLineSummary,
  fetchKetepatanAttention,
} from '../api/dashboardApi';

export function useDashboardAttention() {
  return useQuery({ queryKey: ['dashboard', 'attention'], queryFn: fetchAttention });
}

export function useDashboardUpcoming() {
  return useQuery({ queryKey: ['dashboard', 'upcoming'], queryFn: fetchUpcoming });
}

export function useDashboardPartSummary() {
  return useQuery({ queryKey: ['dashboard', 'part-summary'], queryFn: fetchPartSummary });
}

export function useDashboardLineSummary() {
  return useQuery({ queryKey: ['dashboard', 'line-summary'], queryFn: fetchLineSummary });
}

export function useDashboardKetepatanAttention() {
  return useQuery({ queryKey: ['dashboard', 'ketepatan-attention'], queryFn: fetchKetepatanAttention });
}