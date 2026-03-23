import { sdk } from '@lib/client';
import { queryKeysFactory } from '@lib/query-key-factory';
import { useMutation, useQuery } from '@tanstack/react-query';

export type KonkuiTokenStatusResponse = {
  configured: boolean;
  hasRefreshToken: boolean;
  hasAccessToken: boolean;
  access_token_expires_at: number | null;
  refresh_token_updated_at: number | null;
  last_refresh_attempt_at: number | null;
  metadata: Record<string, unknown> | null;
};

export type SetOrUpdateKonkuiTokensInput = {
  refreshToken: string;
  accessToken?: string | null;
  accessTokenExpiresAt?: number | null;
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
      const payload = {
        refreshToken: input.refreshToken,
        accessToken: input.accessToken ?? null,
        accessTokenExpiresAt: input.accessTokenExpiresAt ?? null
      };

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
      const payload = {
        refreshToken: input.refreshToken,
        accessToken: input.accessToken ?? null,
        accessTokenExpiresAt: input.accessTokenExpiresAt ?? null
      };

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
