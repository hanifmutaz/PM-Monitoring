// src/hooks/useUsers.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser, updateUser } from '../api/usersApi';

export function useUsers(params) {
  return useQuery({ queryKey: ['users', params], queryFn: () => fetchUsers(params) });
}

export function useUserMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  const create = useMutation({ mutationFn: createUser, onSuccess: invalidate });
  const update = useMutation({ mutationFn: ({ id, payload }) => updateUser(id, payload), onSuccess: invalidate });

  return { create, update };
}
