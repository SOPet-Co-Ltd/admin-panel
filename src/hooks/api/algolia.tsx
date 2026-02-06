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

/** MercurJS full product sync (published products). Run this first. */
export const useSyncAlgoliaFull = () => {
  return useMutation({
    mutationFn: () =>
      sdk.client.fetch('/admin/algolia', {
        method: 'POST'
      })
  });
};

/** Custom tags sync for all published products. Run after full sync. */
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

export type AlgoliaDiagnostics = {
  total: number;
  byStatus: Record<string, number>;
  withoutSalesChannel: number;
  publishedCount: number;
  algoliaRecordCount: number | null;
  syncHint?: string;
};

export const useAlgoliaDiagnostics = (enabled = true) => {
  return useQuery<AlgoliaDiagnostics>({
    queryKey: [...algoliaQueryKeys.all, 'diagnostics'],
    queryFn: () => sdk.client.fetch('/admin/algolia/diagnostics', { method: 'GET' }),
    enabled: enabled
  });
};
