import { useCallback, useEffect, useState } from 'react';

import { ActionMenu } from '@components/common/action-menu';
import {
  useCreateOmiseWebhookForwardUrl,
  useDeleteOmiseWebhookForwardUrl,
  useOmiseWebhookForwardUrls,
  useUpdateOmiseWebhookForwardUrl,
  type OmiseWebhookForwardUrl
} from '@hooks/api/omise-webhook-forward-urls';
import { PencilSquare, Trash } from '@medusajs/icons';
import {
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Switch,
  Table,
  Text,
  toast,
  usePrompt
} from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

import { formatDate } from '@/lib/date';

type EditFormProps = {
  entry: OmiseWebhookForwardUrl;
  onDismiss: () => void;
  onSuccess: () => void;
};

const EditForwardUrlForm = ({ entry, onDismiss, onSuccess }: EditFormProps) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState(entry.url);
  const [label, setLabel] = useState(entry.label ?? '');
  const { mutateAsync: updateForwardUrl, isPending } = useUpdateOmiseWebhookForwardUrl();

  useEffect(() => {
    setUrl(entry.url);
    setLabel(entry.label ?? '');
  }, [entry]);

  const handleSave = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast.error(t('omiseWebhookForwardUrls.toast.urlRequired'));
      return;
    }

    try {
      await updateForwardUrl({
        id: entry.id,
        url: trimmedUrl,
        label: label.trim() || null
      });
      toast.success(t('omiseWebhookForwardUrls.toast.updateSuccess'));
      onSuccess();
      onDismiss();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('omiseWebhookForwardUrls.toast.updateError'));
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="edit-omise-forward-url">{t('omiseWebhookForwardUrls.add.urlLabel')}</Label>
        <Input
          id="edit-omise-forward-url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder={t('omiseWebhookForwardUrls.add.urlPlaceholder')}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-y-2">
        <Label htmlFor="edit-omise-forward-label">
          {t('omiseWebhookForwardUrls.add.labelLabel')}
        </Label>
        <Input
          id="edit-omise-forward-label"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder={t('omiseWebhookForwardUrls.add.labelPlaceholder')}
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onDismiss}
          disabled={isPending}
        >
          {t('omiseWebhookForwardUrls.edit.cancel')}
        </Button>
        <Button
          type="button"
          onClick={() => void handleSave()}
          isLoading={isPending}
        >
          {t('omiseWebhookForwardUrls.edit.save')}
        </Button>
      </div>
    </div>
  );
};

function truncateError(error: string | null, maxLength = 80): string {
  if (!error?.trim()) {
    return '—';
  }
  const trimmed = error.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 3)}...`;
}

export const OmiseWebhookForwardUrlsPage = () => {
  const { t } = useTranslation();
  const prompt = usePrompt();

  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [editEntry, setEditEntry] = useState<OmiseWebhookForwardUrl | null>(null);

  const { data, isLoading, isError, error, refetch } = useOmiseWebhookForwardUrls();
  const { mutateAsync: createForwardUrl, isPending: isCreating } =
    useCreateOmiseWebhookForwardUrl();
  const { mutateAsync: updateForwardUrl, isPending: isUpdating } =
    useUpdateOmiseWebhookForwardUrl();
  const { mutateAsync: deleteForwardUrl, isPending: isDeleting } =
    useDeleteOmiseWebhookForwardUrl();

  const forwardUrls = data?.forward_urls ?? [];
  const isBusy = isLoading || isCreating || isUpdating || isDeleting;

  const handleAdd = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast.error(t('omiseWebhookForwardUrls.toast.urlRequired'));
      return;
    }

    try {
      await createForwardUrl({
        url: trimmedUrl,
        label: label.trim() || null
      });
      setUrl('');
      setLabel('');
      toast.success(t('omiseWebhookForwardUrls.toast.createSuccess'));
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('omiseWebhookForwardUrls.toast.createError'));
    }
  };

  const handleToggleActive = async (entry: OmiseWebhookForwardUrl, checked: boolean) => {
    try {
      await updateForwardUrl({
        id: entry.id,
        is_active: checked
      });
      toast.success(
        checked
          ? t('omiseWebhookForwardUrls.toast.activateSuccess')
          : t('omiseWebhookForwardUrls.toast.deactivateSuccess')
      );
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('omiseWebhookForwardUrls.toast.updateError'));
    }
  };

  const handleDelete = useCallback(
    async (entry: OmiseWebhookForwardUrl) => {
      const ok = await prompt({
        title: t('omiseWebhookForwardUrls.delete.title'),
        description: t('omiseWebhookForwardUrls.delete.description'),
        confirmText: t('omiseWebhookForwardUrls.delete.confirm'),
        cancelText: t('omiseWebhookForwardUrls.delete.cancel')
      });

      if (!ok) {
        return;
      }

      try {
        await deleteForwardUrl(entry.id);
        toast.success(t('omiseWebhookForwardUrls.toast.deleteSuccess'));
        await refetch();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : t('omiseWebhookForwardUrls.toast.deleteError')
        );
      }
    },
    [deleteForwardUrl, prompt, refetch, t]
  );

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">{t('omiseWebhookForwardUrls.domain')}</Heading>
        <Text
          size="small"
          className="mt-1 text-ui-fg-subtle"
        >
          {t('omiseWebhookForwardUrls.subtitle')}
        </Text>
      </div>

      <div className="space-y-4 px-6 py-6">
        <section className="rounded-lg border border-ui-border-base p-6">
          <Heading
            level="h2"
            className="mb-2"
          >
            {t('omiseWebhookForwardUrls.add.title')}
          </Heading>
          <Text
            size="small"
            className="mb-4 text-ui-fg-subtle"
          >
            {t('omiseWebhookForwardUrls.add.subtitle')}
          </Text>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="omise-forward-url">{t('omiseWebhookForwardUrls.add.urlLabel')}</Label>
              <Input
                id="omise-forward-url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t('omiseWebhookForwardUrls.add.urlPlaceholder')}
                disabled={isBusy}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Label htmlFor="omise-forward-label">
                {t('omiseWebhookForwardUrls.add.labelLabel')}
              </Label>
              <Input
                id="omise-forward-label"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder={t('omiseWebhookForwardUrls.add.labelPlaceholder')}
                disabled={isBusy}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={() => void handleAdd()}
              isLoading={isCreating}
              disabled={isBusy}
            >
              {t('omiseWebhookForwardUrls.add.submit')}
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-ui-border-base p-6">
          <Heading
            level="h2"
            className="mb-4"
          >
            {t('omiseWebhookForwardUrls.list.title')}
          </Heading>

          {isLoading && (
            <Text
              size="small"
              className="text-ui-fg-muted"
            >
              {t('omiseWebhookForwardUrls.loading')}
            </Text>
          )}

          {isError && (
            <Text
              size="small"
              className="text-ui-fg-error"
            >
              {error?.message ?? t('omiseWebhookForwardUrls.list.loadError')}
            </Text>
          )}

          {!isLoading && !isError && forwardUrls.length === 0 && (
            <Text size="small">{t('omiseWebhookForwardUrls.list.empty')}</Text>
          )}

          {!isLoading && !isError && forwardUrls.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>
                      {t('omiseWebhookForwardUrls.list.columns.label')}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t('omiseWebhookForwardUrls.list.columns.url')}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t('omiseWebhookForwardUrls.list.columns.status')}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t('omiseWebhookForwardUrls.list.columns.lastForwarded')}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t('omiseWebhookForwardUrls.list.columns.lastError')}
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-[60px]" />
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {forwardUrls.map(entry => (
                    <Table.Row key={entry.id}>
                      <Table.Cell>
                        <Text size="small">{entry.label ?? '—'}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text
                          size="small"
                          className="break-all"
                        >
                          {entry.url}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-x-2">
                          <Switch
                            checked={entry.is_active}
                            disabled={isBusy}
                            onCheckedChange={checked => void handleToggleActive(entry, checked)}
                          />
                          <Text
                            size="small"
                            className="text-ui-fg-subtle"
                          >
                            {entry.is_active
                              ? t('omiseWebhookForwardUrls.list.active')
                              : t('omiseWebhookForwardUrls.list.inactive')}
                          </Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="small">
                          {entry.last_forwarded_at
                            ? formatDate(new Date(entry.last_forwarded_at), 'yyyy-MM-dd HH:mm')
                            : '—'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text
                          size="small"
                          className={entry.last_error ? 'text-ui-fg-error' : 'text-ui-fg-subtle'}
                        >
                          {truncateError(entry.last_error)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <ActionMenu
                          groups={[
                            {
                              actions: [
                                {
                                  icon: <PencilSquare />,
                                  label: t('omiseWebhookForwardUrls.list.edit'),
                                  onClick: () => setEditEntry(entry)
                                },
                                {
                                  icon: <Trash />,
                                  label: t('omiseWebhookForwardUrls.list.delete'),
                                  onClick: () => void handleDelete(entry)
                                }
                              ]
                            }
                          ]}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-ui-border-base p-6">
          <Heading
            level="h2"
            className="mb-2"
          >
            {t('omiseWebhookForwardUrls.help.title')}
          </Heading>
          <ul className="flex list-disc flex-col gap-y-2 pl-5">
            <li>
              <Text
                size="small"
                className="text-ui-fg-subtle"
              >
                {t('omiseWebhookForwardUrls.help.tunnel')}
              </Text>
            </li>
            <li>
              <Text
                size="small"
                className="text-ui-fg-subtle"
              >
                {t('omiseWebhookForwardUrls.help.urlFormat')}
              </Text>
            </li>
            <li>
              <Text
                size="small"
                className="text-ui-fg-subtle"
              >
                {t('omiseWebhookForwardUrls.help.secret')}
              </Text>
            </li>
            <li>
              <Text
                size="small"
                className="text-ui-fg-subtle"
              >
                {t('omiseWebhookForwardUrls.help.enabled')}
              </Text>
            </li>
          </ul>
        </section>
      </div>

      <Drawer
        open={!!editEntry}
        onOpenChange={open => !open && setEditEntry(null)}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{t('omiseWebhookForwardUrls.edit.title')}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            {editEntry && (
              <EditForwardUrlForm
                entry={editEntry}
                onDismiss={() => setEditEntry(null)}
                onSuccess={() => void refetch()}
              />
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};
