import type { AlgoliaStatus } from '@custom-types/algolia';
import { sdk } from '@lib/client';
import { queryKeysFactory } from '@lib/query-key-factory';
import { useMutation, useQuery } from '@tanstack/react-query';

export const algoliaQueryKeys = queryKeysFactory('algolia');

export const useAlgolia = () => {
  return useQuery<AlgoliaStatus>({
    queryKey: ['algolia'],
    queryFn: () => sdk.client.fetch('/admin/algolia', { method: 'GET' })
  });
};

export const useSyncAlgolia = () => {
  return useMutation({
    mutationFn: () =>
      sdk.client.fetch('/admin/algolia/sync/all', {
        method: 'POST'
      })
  });
};

export const useSyncAlgoliaProduct = () => {
  return useMutation({
    mutationFn: (productId: string) =>
      sdk.client.fetch(`/admin/algolia/sync/product/${productId}`, {
        method: 'POST'
      })
  });
};
