import { useMemo } from 'react';

import { createColumnHelper } from '@tanstack/react-table';

import { PayoutAccountStatusBadge } from '../../../components/common/payout-account-status-badge';
import { SellerStatusBadge } from '../../../components/common/seller-status-badge';
import { formatDate } from '../../../lib/date';
import { VendorSeller } from '../../../types';

const columnHelper = createColumnHelper<VendorSeller>();

export const useSellersTableColumns = () => {
  return useMemo(
    () => [
      columnHelper.display({
        id: 'email',
        header: 'Email',
        cell: ({ row }) => row.original.email
      }),
      columnHelper.display({
        id: 'name',
        header: 'Name',
        cell: ({ row }) => row.original.name
      }),
      columnHelper.display({
        id: 'store_status',
        header: 'Account Status',
        cell: ({ row }) => <SellerStatusBadge status={row.original.store_status || '-'} />
      }),
      columnHelper.display({
        id: 'payout_account',
        header: 'Stripe',
        cell: ({ row }) => (
          <PayoutAccountStatusBadge
            payoutAccount={row.original.payout_account}
            data-testid={`seller-list-payout-status-${row.original.id}`}
          />
        )
      }),
      columnHelper.display({
        id: 'created_at',
        header: 'Created',
        cell: ({ row }) => formatDate(row.original.created_at)
      })
    ],
    []
  );
};
