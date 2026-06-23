import { sdk } from '@lib/client';
import { queryKeysFactory } from '@lib/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type OmiseWebhookForwardUrl = {
  id: string;
  url: string;
  label: string | null;
  is_active: boolean;
  last_forwarded_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

export type OmiseWebhookForwardUrlListResponse = {
  forward_urls: OmiseWebhookForwardUrl[];
};

export type CreateOmiseWebhookForwardUrlInput = {
  url: string;
  label?: string | null;
};

export type UpdateOmiseWebhookForwardUrlInput = {
  id: string;
  url?: string;
  label?: string | null;
  is_active?: boolean;
};

export const omiseWebhookForwardUrlsQueryKeys = queryKeysFactory('omise-webhook-forward-urls');

export const useOmiseWebhookForwardUrls = () => {
  return useQuery<OmiseWebhookForwardUrlListResponse>({
    queryKey: omiseWebhookForwardUrlsQueryKeys.all,
    queryFn: () =>
      sdk.client.fetch('/admin/omise-webhook-forward-urls', {
        method: 'GET'
      })
  });
};

export const useCreateOmiseWebhookForwardUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOmiseWebhookForwardUrlInput) =>
      sdk.client.fetch('/admin/omise-webhook-forward-urls', {
        method: 'POST',
        body: input
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: omiseWebhookForwardUrlsQueryKeys.all
      });
    }
  });
};

export const useUpdateOmiseWebhookForwardUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateOmiseWebhookForwardUrlInput) =>
      sdk.client.fetch(`/admin/omise-webhook-forward-urls/${id}`, {
        method: 'PATCH',
        body: input
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: omiseWebhookForwardUrlsQueryKeys.all
      });
    }
  });
};

export const useDeleteOmiseWebhookForwardUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/omise-webhook-forward-urls/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: omiseWebhookForwardUrlsQueryKeys.all
      });
    }
  });
};
