import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query';

import { sdk } from '../../lib/client';
import { queryKeysFactory } from '../../lib/query-key-factory';

export type AdminVendorPayoutAccount = {
  id: string;
  seller_id: string;
  seller_name?: string | null;
  seller_email?: string | null;
  omise_recipient_id?: string | null;
  status: string;
  account_type?: 'individual' | 'corporation';
  account_name?: string | null;
  bank_brand?: string | null;
  bank_last4?: string | null;
  failure_reason?: string | null;
  activated_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export const payoutAccountQueryKeys = queryKeysFactory('payout_accounts');

export const usePayoutAccounts = (
  query?: Record<string, string | number | undefined>,
  options?: Omit<
    UseQueryOptions<
      { payout_accounts: AdminVendorPayoutAccount[]; count: number },
      Error,
      { payout_accounts: AdminVendorPayoutAccount[]; count: number },
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...other } = useQuery<
    { payout_accounts: AdminVendorPayoutAccount[]; count: number },
    Error,
    { payout_accounts: AdminVendorPayoutAccount[]; count: number }
  >({
    queryKey: payoutAccountQueryKeys.list(query),
    queryFn: () =>
      sdk.client.fetch('/admin/vendor-payout-accounts', {
        method: 'GET',
        query
      }),
    ...options
  });

  return {
    payoutAccounts: data?.payout_accounts,
    count: data?.count,
    ...other
  };
};

export const useVerifyRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sellerId: string) =>
      sdk.client.fetch(`/admin/vendor-payout-accounts/${sellerId}/verify`, {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutAccountQueryKeys.list() });
    }
  });
};
