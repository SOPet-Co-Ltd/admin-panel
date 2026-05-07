import { PayoutAccountStatusBadge } from '@components/common/payout-account-status-badge';
import { usePayoutAccounts, useVerifyRecipient } from '@hooks/api/payout-accounts';
import { formatDate } from '@lib/date';
import { Badge, Button, Container, Heading, Table, Text, toast } from '@medusajs/ui';
import { useNavigate } from 'react-router-dom';

export const PayoutAccounts = () => {
  const navigate = useNavigate();
  const { payoutAccounts, isLoading, refetch } = usePayoutAccounts({
    limit: 100
  });
  const { mutateAsync: verifyRecipient, isPending: isVerifying } = useVerifyRecipient();

  const handleVerify = async (sellerId: string) => {
    try {
      await verifyRecipient(sellerId);
      toast.success('Recipient verified');
      await refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify recipient';
      toast.error(message);
    }
  };

  return (
    <Container data-testid="payout-account-list-container">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Payout Accounts</Heading>
          <Text
            size="small"
            className="text-ui-fg-subtle"
          >
            View vendor recipient status and trigger verify actions.
          </Text>
        </div>
      </div>

      <div className="px-6 pb-6">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Seller</Table.HeaderCell>
              <Table.HeaderCell>Recipient</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Bank</Table.HeaderCell>
              <Table.HeaderCell>Last Updated</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell colSpan={6}>Loading...</Table.Cell>
              </Table.Row>
            ) : !payoutAccounts?.length ? (
              <Table.Row>
                <Table.Cell colSpan={6}>No payout accounts found</Table.Cell>
              </Table.Row>
            ) : (
              payoutAccounts.map(account => (
                <Table.Row key={account.id}>
                  <Table.Cell>
                    <button
                      type="button"
                      className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                      onClick={() => navigate(`/sellers/${account.seller_id}`)}
                    >
                      {account.seller_name || account.seller_email || account.seller_id}
                    </button>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Text size="small">{account.omise_recipient_id || '-'}</Text>
                      {account.account_type && <Badge size="2xsmall">{account.account_type}</Badge>}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <PayoutAccountStatusBadge
                      payoutAccount={{ id: account.id, status: account.status }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {account.bank_brand
                      ? `${account.bank_brand} •••• ${account.bank_last4 || '-'}`
                      : '-'}
                  </Table.Cell>
                  <Table.Cell>
                    {account.updated_at ? formatDate(account.updated_at) : '-'}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleVerify(account.seller_id)}
                        isLoading={isVerifying}
                        disabled={isVerifying}
                      >
                        Verify
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </Container>
  );
};
