import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from '@tanstack/react-query';

import { sdk } from '../../lib/client';
import { queryKeysFactory } from '../../lib/query-key-factory';
import { AdminOrderReturnRequest, AdminUpdateOrderReturnRequest } from '../../types';

export const returnRequestsQueryKeys = queryKeysFactory('return-request');

export const useReturnRequests = (
  query?: Record<string, unknown>,
  options?: Omit<
    UseQueryOptions<
      unknown,
      Error,
      { order_return_request: AdminOrderReturnRequest[]; count?: number },
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...other } = useQuery({
    queryKey: returnRequestsQueryKeys.list(query),
    queryFn: () =>
      sdk.client.fetch('/admin/return-request', {
        method: 'GET',
        query
      }),
    ...options
  });

  return { ...data, ...other };
};

export const useReviewReturnRequest = (
  options: UseMutationOptions<
    { orderReturnRequest?: AdminOrderReturnRequest },
    Error,
    { id: string; payload: AdminUpdateOrderReturnRequest }
  >
) => {
  return useMutation({
    mutationFn: ({ id, payload }) =>
      sdk.client.fetch(`/admin/return-request/${id}`, {
        method: 'POST',
        body: payload
      }),
    ...options
  });
};
