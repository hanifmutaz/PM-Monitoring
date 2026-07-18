// src/api/dashboardApi.js
import apiClient from './client';

export async function fetchSummary() {
  const { data } = await apiClient.get('/dashboard/summary');
  return data.data;
}

export async function fetchAttention() {
  const { data } = await apiClient.get('/dashboard/attention');
  return data.data;
}

export async function fetchUpcoming() {
  const { data } = await apiClient.get('/dashboard/upcoming');
  return data.data;
}

export async function fetchSyncStatus() {
  const { data } = await apiClient.get('/dashboard/sync-status');
  return data.data;
}
