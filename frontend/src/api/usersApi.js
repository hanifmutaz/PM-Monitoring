// src/api/usersApi.js
import apiClient from './client';

export async function fetchUsers(params) {
  const { data } = await apiClient.get('/users', { params });
  return data.data;
}

export async function createUser(payload) {
  const { data } = await apiClient.post('/users', payload);
  return data.data;
}

export async function updateUser(id, payload) {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data.data;
}
