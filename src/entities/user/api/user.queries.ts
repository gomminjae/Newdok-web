import { queryOptions } from '@tanstack/react-query';
import { userApi } from './user.api';

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

export const userQueries = {
  profile: () =>
    queryOptions({
      queryKey: userKeys.profile(),
      queryFn: ({ signal }) => userApi.getProfile(signal),
    }),
};
