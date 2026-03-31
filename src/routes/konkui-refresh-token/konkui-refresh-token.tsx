import { useEffect, useState } from 'react';

import {
  useForceRefreshKonkuiToken,
  useKonkuiTokenStatus,
  useRevealKonkuiToken,
  useSetKonkuiTokens,
  useUpdateKonkuiTokens
} from '@hooks/api/konkui-refresh-token';
import { Button, Container, FocusModal, Heading, Input, Label, Text, toast } from '@medusajs/ui';

import { formatDate } from '@/lib/date';

export const KonkuiRefreshTokenPage = () => {
  const { data: status, isLoading, refetch } = useKonkuiTokenStatus();

  const { mutateAsync: setTokens, isPending: isSetting } = useSetKonkuiTokens();
  const { mutateAsync: updateTokens, isPending: isUpdating } = useUpdateKonkuiTokens();
  const { mutateAsync: forceRefresh, isPending: isForcing } = useForceRefreshKonkuiToken();
  const { mutateAsync: revealToken, isPending: isRevealing } = useRevealKonkuiToken();

  const [refreshToken, setRefreshToken] = useState('');
  const [editRefreshToken, setEditRefreshToken] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showFullToken, setShowFullToken] = useState(false);
  const [revealedToken, setRevealedToken] = useState<string | null>(null);

  const isBusy = isSetting || isUpdating || isForcing || isRevealing || isLoading;

  useEffect(() => {
    // Token value changed (set/update/force-refresh), so reset any revealed state.
    setShowFullToken(false);
    setRevealedToken(null);
  }, [status?.token_updated_at]);

  const tokenExpiresAtLabel = status?.token_expires_at
    ? formatDate(new Date(status.token_expires_at), 'yyyy-MM-dd HH:mm:ss')
    : '-';

  const lastRefreshAttemptAtLabel = status?.last_refresh_attempt_at
    ? formatDate(new Date(status.last_refresh_attempt_at), 'yyyy-MM-dd HH:mm:ss')
    : '-';

  const handleSetToken = async () => {
    try {
      if (!refreshToken.trim()) {
        toast.error('Konkui token is required');

        return;
      }

      await setTokens({
        refreshToken: refreshToken.trim()
      });

      toast.success('Konkui token saved');
      setRefreshToken('');
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save token');
    }
  };

  const handleUpdateToken = async () => {
    try {
      if (!editRefreshToken.trim()) {
        toast.error('Konkui token is required');

        return;
      }

      await updateTokens({
        refreshToken: editRefreshToken.trim()
      });

      toast.success('Konkui token updated');
      setIsEditModalOpen(false);
      setEditRefreshToken('');
      setShowFullToken(false);
      setRevealedToken(null);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update token');
    }
  };

  const handleForceRefresh = async () => {
    try {
      const result = await forceRefresh();

      if (result?.refreshed) {
        toast.success('Konkui token refreshed');
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

  const handleToggleShowToken = async () => {
    if (!status?.hasToken) {
      toast.error('No token set');

      return;
    }

    if (showFullToken) {
      setShowFullToken(false);

      return;
    }

    try {
      const revealed = await revealToken();

      if (!revealed?.token) {
        toast.error('Token is not available to reveal');

        return;
      }

      setRevealedToken(revealed.token);
      setShowFullToken(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reveal token');
    }
  };

  return (
    <Container className="space-y-6 border-none p-0 shadow-none">
      <div className="border-b border-ui-border-base px-6 py-5">
        <Heading level="h2">Konkui Token</Heading>
        <Text
          size="small"
          className="mt-2 text-ui-fg-subtle"
        >
          Store your single Konkui token and force refresh when needed.
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
          ) : !status?.hasToken ? (
            <Text
              size="small"
              className="mt-2 text-ui-fg-subtle"
            >
              No Konkui token set yet.
            </Text>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                <div>
                  <Text
                    size="small"
                    className="text-ui-fg-subtle"
                  >
                    Token
                  </Text>
                  <div className="mt-2 w-full max-w-[720px] overflow-x-auto rounded-md border border-ui-border-base bg-ui-bg-subtle p-2">
                    <Text
                      size="small"
                      className="w-max whitespace-nowrap font-mono"
                    >
                      {showFullToken && revealedToken
                        ? revealedToken
                        : '*****************************************************************************************************************************************************'}
                    </Text>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => void handleToggleShowToken()}
                  isLoading={isRevealing}
                  disabled={isBusy}
                >
                  {showFullToken ? 'Hide token' : 'Show token'}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                <div>
                  <Text
                    size="small"
                    className="text-ui-fg-subtle"
                  >
                    Token expires at
                  </Text>
                  <Text
                    size="small"
                    className="mt-2"
                  >
                    {tokenExpiresAtLabel}
                  </Text>
                </div>

                <div>
                  <Text
                    size="small"
                    className="text-ui-fg-subtle"
                  >
                    Latest refresh attempt at
                  </Text>
                  <Text
                    size="small"
                    className="mt-2"
                  >
                    {lastRefreshAttemptAtLabel}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>

        {!status?.hasToken ? (
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
            <Heading level="h3">Set Token</Heading>
            <Text
              size="small"
              className="mt-2 text-ui-fg-subtle"
            >
              Paste your single Konkui token. Backend will refresh immediately and store the
              normalized token + expiry.
            </Text>

            <div className="mt-4 space-y-2">
              <Label htmlFor="konkui-token">Konkui Token</Label>
              <Input
                id="konkui-token"
                value={refreshToken}
                onChange={e => setRefreshToken(e.target.value)}
                placeholder="Paste Konkui token"
                disabled={isBusy}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => void handleSetToken()}
                isLoading={isSetting}
                disabled={isBusy || !refreshToken.trim()}
              >
                Set Token
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-5">
              <Heading level="h3">Actions</Heading>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditModalOpen(true);
                    setEditRefreshToken('');
                  }}
                  disabled={isBusy}
                >
                  Edit / Update Token
                </Button>

                <Button
                  onClick={() => void handleForceRefresh()}
                  isLoading={isForcing}
                  disabled={isBusy}
                >
                  Force Refresh
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>

      <FocusModal
        open={isEditModalOpen}
        onOpenChange={open => {
          setIsEditModalOpen(open);
          if (!open) {
            setEditRefreshToken('');
          }
        }}
        data-testid="konkui-token-edit-modal"
      >
        <FocusModal.Content>
          <FocusModal.Header>
            <Heading level="h3">Edit / Update Token</Heading>
          </FocusModal.Header>

          <FocusModal.Body className="space-y-4 px-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="konkui-token-edit">Konkui Token</Label>
              <Input
                id="konkui-token-edit"
                value={editRefreshToken}
                onChange={e => setEditRefreshToken(e.target.value)}
                placeholder="Paste new Konkui token"
                disabled={isBusy}
              />
            </div>

            <Text
              size="small"
              className="mt-2 text-ui-fg-subtle"
            >
              Backend will refresh immediately and overwrite the stored token + expiry.
            </Text>
          </FocusModal.Body>

          <FocusModal.Footer>
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>

            <Button
              onClick={() => void handleUpdateToken()}
              isLoading={isUpdating}
              disabled={isBusy || !editRefreshToken.trim()}
            >
              Update Token
            </Button>
          </FocusModal.Footer>
        </FocusModal.Content>
      </FocusModal>
    </Container>
  );
};

export const Component = KonkuiRefreshTokenPage;
