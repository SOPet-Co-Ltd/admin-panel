import { sdk } from '@lib/client';
import { queryKeysFactory } from '@lib/query-key-factory';
import { useMutation, useQuery } from '@tanstack/react-query';

export type KonkuiTokenStatusResponse = {
  configured: boolean;
  hasToken: boolean;
  token_preview: string | null;
  token_expires_at: number | null;
  token_updated_at: number | null;
  last_refresh_attempt_at: number | null;
};

export type SetOrUpdateKonkuiTokensInput = {
  refreshToken: string;
};

export type ForceRefreshKonkuiTokenResponse = Partial<KonkuiTokenStatusResponse> & {
  refreshed: boolean;
  reason?: string;
};

export const konkuiRefreshTokenQueryKeys = queryKeysFactory('konkui-refresh-token');

export const useKonkuiTokenStatus = () => {
  return useQuery<KonkuiTokenStatusResponse>({
    queryKey: konkuiRefreshTokenQueryKeys.all,
    queryFn: () =>
      sdk.client.fetch('/admin/konkui-refresh-token', {
        method: 'GET'
      })
  });
};

export const useSetKonkuiTokens = () => {
  return useMutation({
    mutationFn: (input: SetOrUpdateKonkuiTokensInput) => {
      const payload = { refreshToken: input.refreshToken };

      return sdk.client.fetch('/admin/konkui-refresh-token/set', {
        method: 'POST',
        body: payload
      });
    }
  });
};

export const useUpdateKonkuiTokens = () => {
  return useMutation({
    mutationFn: (input: SetOrUpdateKonkuiTokensInput) => {
      const payload = { refreshToken: input.refreshToken };

      return sdk.client.fetch('/admin/konkui-refresh-token/update', {
        method: 'POST',
        body: payload
      });
    }
  });
};

export const useForceRefreshKonkuiToken = () => {
  return useMutation<ForceRefreshKonkuiTokenResponse, unknown, void>({
    mutationFn: () =>
      sdk.client.fetch('/admin/konkui-refresh-token/force-refresh', {
        method: 'POST'
      })
  });
};

export type KonkuiTokenRevealResponse = {
  token: string | null;
};

export const useRevealKonkuiToken = () => {
  return useMutation<KonkuiTokenRevealResponse, unknown, void>({
    mutationFn: () =>
      sdk.client.fetch('/admin/konkui-refresh-token/token', {
        method: 'GET'
      })
  });
};
