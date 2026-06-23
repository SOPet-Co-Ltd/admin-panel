import { sdk } from '@lib/client';
import { queryKeysFactory } from '@lib/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type PromotionSettingsResponse = {
  is_promotion_auto_apply: boolean;
};

export type UpdatePromotionSettingsInput = {
  is_promotion_auto_apply: boolean;
};

export const promotionSettingsQueryKeys = queryKeysFactory('promotion-settings');

export const usePromotionSettings = () => {
  return useQuery<PromotionSettingsResponse>({
    queryKey: promotionSettingsQueryKeys.all,
    queryFn: () =>
      sdk.client.fetch('/admin/promotion-settings', {
        method: 'GET'
      })
  });
};

export const useUpdatePromotionSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePromotionSettingsInput) =>
      sdk.client.fetch('/admin/promotion-settings', {
        method: 'POST',
        body: input
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionSettingsQueryKeys.all });
    }
  });
};
