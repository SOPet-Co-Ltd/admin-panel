import { useMemo, useState } from 'react';

import {
  useForceRefreshKonkuiToken,
  useKonkuiTokenStatus,
  useSetKonkuiTokens,
  useUpdateKonkuiTokens
} from '@hooks/api/konkui-refresh-token';
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  StatusBadge,
  Table,
  Text,
  toast
} from '@medusajs/ui';

import { formatDate } from '@/lib/date';

const parseEpochMsOrDate = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const asNumber = Number(trimmed);
  if (Number.isFinite(asNumber)) {
    return asNumber;
  }

  const parsed = Date.parse(trimmed);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  throw new Error('accessTokenExpiresAt must be a valid epoch(ms) number or date string');
};

export const KonkuiRefreshTokenPage = () => {
  const { data: status, isLoading, refetch } = useKonkuiTokenStatus();

  const { mutateAsync: setTokens, isPending: isSetting } = useSetKonkuiTokens();
  const { mutateAsync: updateTokens, isPending: isUpdating } = useUpdateKonkuiTokens();
  const { mutateAsync: forceRefresh, isPending: isForcing } = useForceRefreshKonkuiToken();

  const [refreshToken, setRefreshToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [accessTokenExpiresAt, setAccessTokenExpiresAt] = useState('');

  const isBusy = isSetting || isUpdating || isForcing || isLoading;

  const formattedStatus = useMemo(() => {
    if (!status) {
      return null;
    }

    return {
      ...status,
      accessTokenExpiresAtLabel: status.access_token_expires_at
        ? formatDate(new Date(status.access_token_expires_at), 'yyyy-MM-dd HH:mm:ss')
        : '-',
      refreshTokenUpdatedAtLabel: status.refresh_token_updated_at
        ? formatDate(new Date(status.refresh_token_updated_at), 'yyyy-MM-dd HH:mm:ss')
        : '-',
      lastRefreshAttemptAtLabel: status.last_refresh_attempt_at
        ? formatDate(new Date(status.last_refresh_attempt_at), 'yyyy-MM-dd HH:mm:ss')
        : '-'
    };
  }, [status]);

  const handleSetToken = async () => {
    try {
      if (!refreshToken.trim()) {
        toast.error('refreshToken is required');

        return;
      }

      const expiresAtMs = accessTokenExpiresAt.trim()
        ? parseEpochMsOrDate(accessTokenExpiresAt)
        : null;

      await setTokens({
        refreshToken: refreshToken.trim(),
        accessToken: accessToken.trim() || null,
        accessTokenExpiresAt: expiresAtMs
      });

      toast.success('Konkui tokens saved');
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save tokens');
    }
  };

  const handleUpdateToken = async () => {
    try {
      if (!refreshToken.trim()) {
        toast.error('refreshToken is required');

        return;
      }

      const expiresAtMs = accessTokenExpiresAt.trim()
        ? parseEpochMsOrDate(accessTokenExpiresAt)
        : null;

      await updateTokens({
        refreshToken: refreshToken.trim(),
        accessToken: accessToken.trim() || null,
        accessTokenExpiresAt: expiresAtMs
      });

      toast.success('Konkui tokens replaced');
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to replace tokens');
    }
  };

  const handleForceRefresh = async () => {
    try {
      const result = await forceRefresh();

      if (result?.refreshed) {
        toast.success('Konkui access token refreshed');
      } else {
        toast.error(
          result?.reason ? `Force refresh failed: ${result?.reason}` : 'Force refresh failed'
        );
      }

      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to force refresh');
    }
  };

  return (
    <Container className="space-y-6 p-0">
      <div className="border-b border-ui-border-base px-6 py-5">
        <Heading level="h2">Konkui Tokens</Heading>
        <Text
          size="small"
          className="mt-2 text-ui-fg-subtle"
        >
          Set/update Konkui refresh tokens and force a refresh of the access token.
        </Text>
      </div>

      <Container className="space-y-6 px-6 pb-6 pt-5">
        <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
          <Heading level="h3">Current Status</Heading>

          {isLoading ? (
            <Text
              size="small"
              className="mt-2"
            >
              Loading...
            </Text>
          ) : !status || !status.configured ? (
            <Text
              size="small"
              className="mt-2 text-ui-fg-subtle"
            >
              No Konkui token set yet.
            </Text>
          ) : (
            <Table className="mt-4">
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    <Text size="small">Refresh token</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {formattedStatus?.hasRefreshToken ? (
                      <StatusBadge color="green">Present</StatusBadge>
                    ) : (
                      <StatusBadge color="red">Missing</StatusBadge>
                    )}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <Text size="small">Access token</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {formattedStatus?.hasAccessToken ? (
                      <StatusBadge color="green">Present</StatusBadge>
                    ) : (
                      <StatusBadge color="grey">Missing</StatusBadge>
                    )}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <Text size="small">Access token expires at</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">{formattedStatus?.accessTokenExpiresAtLabel ?? '-'}</Text>
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <Text size="small">Refresh token updated at</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">{formattedStatus?.refreshTokenUpdatedAtLabel ?? '-'}</Text>
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <Text size="small">Last refresh attempt at</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">{formattedStatus?.lastRefreshAttemptAtLabel ?? '-'}</Text>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
            <Heading level="h3">Set / Update Tokens</Heading>
            <Text
              size="small"
              className="mt-2 text-ui-fg-subtle"
            >
              Refresh token is required. Access token + expiry are optional but useful for
              previewing refresh window.
            </Text>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="konkui-refresh-token">Refresh Token</Label>
                <Input
                  id="konkui-refresh-token"
                  value={refreshToken}
                  onChange={e => setRefreshToken(e.target.value)}
                  placeholder="Paste Konkui refresh token"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="konkui-access-token">Access Token (optional)</Label>
                <Input
                  id="konkui-access-token"
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                  placeholder="Paste current access token (optional)"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="konkui-access-token-expires-at">
                  Access Token Expires At (optional)
                </Label>
                <Input
                  id="konkui-access-token-expires-at"
                  value={accessTokenExpiresAt}
                  onChange={e => setAccessTokenExpiresAt(e.target.value)}
                  placeholder="Epoch(ms) or ISO date string (e.g. 1712345678901 or 2026-01-01T00:00:00Z)"
                  disabled={isBusy}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => void handleSetToken()}
                isLoading={isSetting}
                disabled={isBusy}
              >
                Set Token
              </Button>
              <Button
                variant="secondary"
                onClick={() => void handleUpdateToken()}
                isLoading={isUpdating}
                disabled={isBusy}
              >
                Update Token
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
            <Heading level="h3">Force Refresh</Heading>
            <Text
              size="small"
              className="mt-2 text-ui-fg-subtle"
            >
              Calls Konkui refresh immediately (bypasses the automatic refresh window).
            </Text>

            <div className="mt-4">
              <Button
                onClick={() => void handleForceRefresh()}
                isLoading={isForcing}
                disabled={isBusy || !status?.hasRefreshToken}
              >
                Force Refresh Token
              </Button>
              {!status?.hasRefreshToken && (
                <Text
                  size="small"
                  className="mt-2 text-ui-fg-subtle"
                >
                  Set/update a refresh token first.
                </Text>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Container>
  );
};

export const Component = KonkuiRefreshTokenPage;
