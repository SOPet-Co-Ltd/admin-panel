import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ActionMenu } from '@components/common/action-menu';
import {
  useAdsModalEntries,
  useCreateAdsModalEntry,
  useDeleteAdsModalEntry,
  useUpdateAdsModalEntry,
  type AdminAdsModalEntry
} from '@hooks/api/ads-modal';
import {
  ADS_MODAL_MEDIA_RULES,
  isAdsModalActive,
  validateAdsModalFile,
  validateAdsModalFileBasics
} from '@lib/ads-modal-media';
import { PencilSquare, Trash } from '@medusajs/icons';
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Drawer,
  Heading,
  Label,
  StatusBadge,
  Table,
  Text,
  Textarea,
  toast,
  usePrompt
} from '@medusajs/ui';

type AdsModalFormProps = {
  mode: 'create' | 'edit';
  initial?: AdminAdsModalEntry | null;
  onDismiss: () => void;
  onSuccess: () => void;
};

const AdsModalForm = ({ mode, initial, onDismiss, onSuccess }: AdsModalFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const [metadataText, setMetadataText] = useState(
    initial?.metadata ? JSON.stringify(initial.metadata, null, 2) : ''
  );

  const [fieldError, setFieldError] = useState<string | null>(null);

  const { mutateAsync: createMutate, isPending: isCreating } = useCreateAdsModalEntry();

  const { mutateAsync: updateMutate, isPending: isUpdating } = useUpdateAdsModalEntry();

  const busy = isCreating || isUpdating;

  useEffect(() => {
    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [file]);

  const displayPreview = previewUrl ?? initial?.image_url ?? null;

  const validateMetadataJson = (): string | null => {
    const trimmed = metadataText.trim();

    if (!trimmed.length) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return 'Metadata must be a JSON object.';
      }

      return null;
    } catch {
      return 'Metadata must be valid JSON.';
    }
  };

  const handleSubmit = async () => {
    setFieldError(null);

    if (mode === 'create' && !file) {
      setFieldError('Choose an image file.');

      return;
    }

    const metaErr = validateMetadataJson();

    if (metaErr) {
      setFieldError(metaErr);

      return;
    }

    try {
      if (file) {
        await validateAdsModalFile(file);
      }
    } catch (e) {
      setFieldError(e instanceof Error ? e.message : 'Invalid image.');

      return;
    }

    try {
      if (mode === 'create' && file) {
        await createMutate({
          file,
          is_active: isActive,
          metadataText
        });

        toast.success('Promotional modal ad created.');
      } else if (mode === 'edit' && initial) {
        await updateMutate({
          id: initial.id,
          file: file ?? undefined,
          is_active: isActive,
          metadataText
        });

        toast.success('Promotional modal ad updated.');
      }

      onSuccess();
      onDismiss();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Request failed.');
    }
  };

  const onPickFile = async (list: FileList | null) => {
    const next = list?.[0];

    if (!next) {
      return;
    }

    const basic = validateAdsModalFileBasics(next);

    if (basic) {
      setFieldError(basic);

      return;
    }

    setFieldError(null);

    try {
      await validateAdsModalFile(next);

      setFile(next);
    } catch (e) {
      setFieldError(e instanceof Error ? e.message : 'Invalid image.');
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div>
        <Label size="xsmall">Image</Label>

        <Text
          size="small"
          className="mt-1 text-ui-fg-subtle"
        >
          {ADS_MODAL_MEDIA_RULES.targetAspectRatioLabel} aspect ratio (e.g.{' '}
          {ADS_MODAL_MEDIA_RULES.targetDimensionsExample} px), max 1 MB, .webp, .png, .jpeg only.
        </Text>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".webp,.png,.jpg,.jpeg,image/webp,image/png,image/jpeg"
            className="hidden"
            onChange={e => void onPickFile(e.target.files)}
          />

          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => fileInputRef.current?.click()}
          >
            {mode === 'edit' ? 'Replace image' : 'Choose file'}
          </Button>

          {mode === 'create' && <Text size="small">Required</Text>}
        </div>

        {displayPreview && (
          <div className="mt-3 max-w-xs overflow-hidden rounded-md border border-ui-border-base">
            <img
              src={displayPreview}
              alt=""
              className="max-h-56 w-full object-contain"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          <Checkbox
            checked={isActive}
            onCheckedChange={v => setIsActive(!!v)}
          />

          <Label size="small">Active</Label>
        </div>

        <Text
          size="small"
          className="text-ui-fg-subtle"
        >
          Only one promotional modal can be active at a time.
        </Text>
      </div>

      <div>
        <Label htmlFor="ads-metadata">Metadata (optional JSON)</Label>

        <Textarea
          id="ads-metadata"
          rows={4}
          placeholder="{}"
          value={metadataText}
          onChange={e => setMetadataText(e.target.value)}
        />
      </div>

      {fieldError && (
        <Text
          size="small"
          className="text-ui-fg-error"
        >
          {fieldError}
        </Text>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onDismiss}
          disabled={busy}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={() => void handleSubmit()}
          isLoading={busy}
        >
          {mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export const AdsModal = () => {
  const prompt = usePrompt();

  const [createOpen, setCreateOpen] = useState(false);

  const [editEntry, setEditEntry] = useState<AdminAdsModalEntry | null>(null);

  const { data, isPending, isError, error, refetch } = useAdsModalEntries();

  const { mutateAsync: deleteMutate, isPending: isDeleting } = useDeleteAdsModalEntry();

  const ads = useMemo(() => data?.ads ?? [], [data?.ads]);

  const handleDelete = useCallback(
    async (entry: AdminAdsModalEntry) => {
      const ok = await prompt({
        title: 'Remove promotional modal?',
        description:
          'This removes the ad from the catalog and deletes its stored image. This cannot be undone.',
        confirmText: 'Remove',
        cancelText: 'Cancel'
      });

      if (!ok) {
        return;
      }

      try {
        await deleteMutate(entry.id);

        toast.success('Promotional modal ad removed.');

        await refetch();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Delete failed.');
      }
    },
    [deleteMutate, prompt, refetch]
  );

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Heading>Promotional modal</Heading>

          <Text
            size="small"
            className="pr-7 text-ui-fg-subtle"
          >
            Upload storefront promotional modal imagery. Only one ad can be active at a time.
          </Text>
        </div>

        <Drawer
          open={createOpen}
          onOpenChange={setCreateOpen}
        >
          <Drawer.Trigger asChild>
            <Button>Add ad</Button>
          </Drawer.Trigger>

          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Add promotional modal</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body>
              <AdsModalForm
                mode="create"
                onDismiss={() => setCreateOpen(false)}
                onSuccess={() => void refetch()}
              />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      </div>

      <div className="px-6 py-4">
        {isPending && (
          <Text
            size="small"
            className="text-ui-fg-muted"
          >
            Loading…
          </Text>
        )}

        {isError && (
          <Text
            size="small"
            className="text-ui-fg-error"
          >
            {error?.message ?? 'Failed to load ads.'}
          </Text>
        )}

        {!isPending && !isError && ads.length === 0 && (
          <div className="flex flex-col items-start gap-3 py-1">
            <Text size="small">No promotional modal ads configured yet.</Text>

            <Button
              variant="secondary"
              onClick={() => setCreateOpen(true)}
            >
              Add ad
            </Button>
          </div>
        )}

        {!isPending && !isError && ads.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Preview</Table.HeaderCell>

                  <Table.HeaderCell>Status</Table.HeaderCell>

                  <Table.HeaderCell>Size</Table.HeaderCell>

                  <Table.HeaderCell className="w-[60px]" />
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {ads.map(entry => (
                  <Table.Row key={entry.id}>
                    <Table.Cell>
                      {entry.image_url ? (
                        <img
                          src={entry.image_url}
                          alt=""
                          className="h-16 w-12 rounded-sm object-cover"
                        />
                      ) : (
                        <Text size="small">—</Text>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      {isAdsModalActive({
                        isActive: entry.is_active
                      }) ? (
                        <StatusBadge color="green">Active</StatusBadge>
                      ) : (
                        <Badge size="2xsmall">Inactive</Badge>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      <Text size="small">
                        {entry.width}×{entry.height}
                      </Text>
                    </Table.Cell>

                    <Table.Cell>
                      <ActionMenu
                        groups={[
                          {
                            actions: [
                              {
                                icon: <PencilSquare />,
                                label: 'Edit',
                                onClick: () => setEditEntry(entry)
                              },
                              {
                                icon: <Trash />,
                                label: 'Remove',
                                onClick: () => void handleDelete(entry),
                                disabled: isDeleting
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
      </div>

      <Drawer
        open={!!editEntry}
        onOpenChange={open => {
          if (!open) {
            setEditEntry(null);
          }
        }}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit promotional modal</Drawer.Title>
          </Drawer.Header>

          <Drawer.Body className="overflow-y-auto">
            {editEntry && (
              <AdsModalForm
                key={editEntry.id}
                mode="edit"
                initial={editEntry}
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
