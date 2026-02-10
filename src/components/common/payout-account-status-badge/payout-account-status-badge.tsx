import { StatusCell } from '@components/table/table-cells/common/status-cell';
import type { VendorSellerPayoutAccount } from '@custom-types/seller';

export const PayoutAccountStatusBadge = ({
  payoutAccount,
  'data-testid': dataTestId
}: {
  payoutAccount?: VendorSellerPayoutAccount | null;
  'data-testid'?: string;
}) => {
  if (!payoutAccount) {
    return (
      <StatusCell
        color="grey"
        data-testid={dataTestId}
      >
        Not connected
      </StatusCell>
    );
  }

  switch (payoutAccount.status) {
    case 'pending':
      return (
        <StatusCell
          color="orange"
          data-testid={dataTestId}
        >
          Pending
        </StatusCell>
      );
    case 'active':
      return (
        <StatusCell
          color="green"
          data-testid={dataTestId}
        >
          Connected
        </StatusCell>
      );
    case 'disabled':
      return (
        <StatusCell
          color="red"
          data-testid={dataTestId}
        >
          Disabled
        </StatusCell>
      );
    default:
      return (
        <StatusCell
          color="grey"
          data-testid={dataTestId}
        >
          {payoutAccount.status || 'Not connected'}
        </StatusCell>
      );
  }
};
