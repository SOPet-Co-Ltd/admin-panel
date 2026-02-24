import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from 'react';

import { Button, Container, Heading, Table, Text, toast } from '@medusajs/ui';
import { useNavigate } from 'react-router-dom';

import { deleteFilesQuery, sdk, uploadFilesQuery } from '@/lib/client';

type StorefrontConfigSection = 'sponsors' | 'banners';

type StorefrontConfigItem = {
  id: string;
  image_url: string;
  name: string;
  href: string;
};

type StorefrontConfigUploadFolder = 'sponsor' | 'banner';

type StorefrontConfigSectionTableProps = {
  title: string;
  description: string;
  uploadButtonLabel: string;
  items: StorefrontConfigItem[];
  isBusy: boolean;
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onUploadClick: () => void;
  onFilesSelected: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onMove: (index: number, direction: -1 | 1) => Promise<void>;
  onRemove: (index: number) => Promise<void>;
  onOpenDetails: (itemId: string) => void;
};

const asString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const parseItemsFromMetadata = (
  metadata: unknown,
  section: StorefrontConfigSection
): StorefrontConfigItem[] => {
  if (!metadata || typeof metadata !== 'object') {
    return [];
  }

  const storefrontConfig = (metadata as Record<string, unknown>).storefront_config;
  if (!storefrontConfig || typeof storefrontConfig !== 'object') {
    return [];
  }

  const rawItems = (storefrontConfig as Record<string, unknown>)[section];
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const row = item as Record<string, unknown>;
      const imageUrl = asString(row.image_url) ?? asString(row.url);

      if (!imageUrl) {
        return null;
      }

      const order = typeof row.order === 'number' && Number.isFinite(row.order) ? row.order : index;

      return {
        id: asString(row.id) ?? `${section}-${index + 1}`,
        image_url: imageUrl,
        name: asString(row.name) ?? '',
        href: asString(row.href) ?? '',
        order
      };
    })
    .filter((item): item is StorefrontConfigItem & { order: number } => item !== null)
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      id: item.id,
      image_url: item.image_url,
      name: item.name,
      href: item.href
    }));
};

const toPayloadItems = (items: StorefrontConfigItem[]) => {
  return items.map((item, index) => ({
    id: item.id,
    image_url: item.image_url,
    name: item.name.trim() || undefined,
    href: item.href.trim() || undefined,
    order: index
  }));
};

const createConfigItemId = (section: StorefrontConfigSection) => {
  return `${section}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const StorefrontConfigSectionTable = ({
  title,
  description,
  uploadButtonLabel,
  items,
  isBusy,
  isUploading,
  fileInputRef,
  onUploadClick,
  onFilesSelected,
  onMove,
  onRemove,
  onOpenDetails
}: StorefrontConfigSectionTableProps) => {
  return (
    <section className="rounded-xl border border-ui-border-base bg-ui-bg-base">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ui-border-base px-4 py-4">
        <div className="space-y-1">
          <Heading level="h3">{title}</Heading>
          <Text
            size="small"
            className="text-ui-fg-subtle"
          >
            {description}
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-ui-border-base bg-ui-bg-subtle px-2.5 py-1 text-xs text-ui-fg-subtle">
            {items.length} item{items.length === 1 ? '' : 's'}
          </span>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={onFilesSelected}
          />
          <Button
            variant="secondary"
            onClick={onUploadClick}
            isLoading={isUploading}
            disabled={isUploading || isBusy}
          >
            {uploadButtonLabel}
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Preview</Table.HeaderCell>
              <Table.HeaderCell>Display Name</Table.HeaderCell>
              <Table.HeaderCell>Link URL</Table.HeaderCell>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {!items.length ? (
              <Table.Row>
                <Table.Cell>
                  <Text
                    size="small"
                    className="text-ui-fg-subtle"
                  >
                    No items configured yet.
                  </Text>
                </Table.Cell>
                <Table.Cell>-</Table.Cell>
                <Table.Cell>-</Table.Cell>
                <Table.Cell>-</Table.Cell>
                <Table.Cell>-</Table.Cell>
              </Table.Row>
            ) : (
              items.map((item, index) => (
                <Table.Row
                  key={`${item.id}-${index}`}
                  className="cursor-pointer"
                  onClick={() => onOpenDetails(item.id)}
                >
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 overflow-hidden rounded border border-ui-border-base bg-ui-bg-subtle">
                        <img
                          src={item.image_url}
                          alt={item.name || `${title} ${index + 1}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <Text
                        size="xsmall"
                        className="max-w-[320px] truncate text-ui-fg-muted"
                      >
                        {item.image_url}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{item.name || '-'}</Table.Cell>
                  <Table.Cell>
                    <Text
                      size="small"
                      className="max-w-[260px] truncate"
                    >
                      {item.href || '-'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>#{index + 1}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={event => {
                          event.stopPropagation();
                          void onMove(index, -1);
                        }}
                        disabled={index === 0 || isBusy}
                      >
                        Up
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={event => {
                          event.stopPropagation();
                          void onMove(index, 1);
                        }}
                        disabled={index === items.length - 1 || isBusy}
                      >
                        Down
                      </Button>
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={event => {
                          event.stopPropagation();
                          void onRemove(index);
                        }}
                        disabled={isBusy}
                      >
                        Remove
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={event => {
                          event.stopPropagation();
                          onOpenDetails(item.id);
                        }}
                        disabled={isBusy}
                      >
                        Open
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>

        <Text
          size="xsmall"
          className="mt-3 text-ui-fg-muted"
        >
          Click a row to open full details and edit this item.
        </Text>
      </div>
    </section>
  );
};

export const StorefrontConfig = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sponsors, setSponsors] = useState<StorefrontConfigItem[]>([]);
  const [banners, setBanners] = useState<StorefrontConfigItem[]>([]);
  const [uploadingSection, setUploadingSection] = useState<StorefrontConfigSection | null>(null);
  const sponsorInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const persistedStateRef = useRef<{
    sponsors: StorefrontConfigItem[];
    banners: StorefrontConfigItem[];
  }>({
    sponsors: [],
    banners: []
  });

  useEffect(() => {
    const loadStorefrontConfig = async () => {
      try {
        setIsLoading(true);

        const response = await sdk.client.fetch<{
          sponsors?: unknown[];
          banners?: unknown[];
        }>('/admin/storefront-config', {
          method: 'GET'
        });

        const metadataLike = {
          storefront_config: {
            sponsors: response?.sponsors || [],
            banners: response?.banners || []
          }
        };

        const parsedSponsors = parseItemsFromMetadata(metadataLike, 'sponsors');
        const parsedBanners = parseItemsFromMetadata(metadataLike, 'banners');

        setSponsors(parsedSponsors);
        setBanners(parsedBanners);
        persistedStateRef.current = {
          sponsors: parsedSponsors,
          banners: parsedBanners
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load storefront config';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorefrontConfig();
  }, []);

  const persistStorefrontConfig = async (params: {
    nextSponsors: StorefrontConfigItem[];
    nextBanners: StorefrontConfigItem[];
    successMessage?: string;
    cleanupFileIds?: string[];
    rollbackOnError?: boolean;
  }): Promise<boolean> => {
    const {
      nextSponsors,
      nextBanners,
      successMessage,
      cleanupFileIds,
      rollbackOnError = false
    } = params;

    try {
      setIsSaving(true);

      await sdk.client.fetch('/admin/storefront-config', {
        method: 'POST',
        body: {
          sponsors: toPayloadItems(nextSponsors),
          banners: toPayloadItems(nextBanners)
        }
      });

      setSponsors(nextSponsors);
      setBanners(nextBanners);
      persistedStateRef.current = {
        sponsors: nextSponsors,
        banners: nextBanners
      };

      if (successMessage) {
        toast.success(successMessage);
      }
      return true;
    } catch (error) {
      if (cleanupFileIds?.length) {
        try {
          await deleteFilesQuery(cleanupFileIds);
        } catch {
          // Keep the original error as the user-facing failure.
        }
      }

      if (rollbackOnError) {
        setSponsors(persistedStateRef.current.sponsors);
        setBanners(persistedStateRef.current.banners);
      }

      const message = error instanceof Error ? error.message : 'Failed to save storefront config';
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const openFilePicker = (section: StorefrontConfigSection) => {
    if (section === 'sponsors') {
      sponsorInputRef.current?.click();
      return;
    }

    bannerInputRef.current?.click();
  };

  const getNextBySection = (
    section: StorefrontConfigSection,
    nextSectionItems: StorefrontConfigItem[]
  ) => {
    return {
      nextSponsors: section === 'sponsors' ? nextSectionItems : sponsors,
      nextBanners: section === 'banners' ? nextSectionItems : banners
    };
  };

  const handleFilesSelected = async (
    section: StorefrontConfigSection,
    folder: StorefrontConfigUploadFolder,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    if (!files.length) {
      return;
    }

    try {
      setUploadingSection(section);
      const response = await uploadFilesQuery(files, { folder });
      const uploaded = response.files ?? [];

      if (!uploaded.length) {
        toast.error('No files were uploaded');
        return;
      }

      const newItems: StorefrontConfigItem[] = uploaded
        .filter(file => !!file.url)
        .map(file => ({
          id: file.id || createConfigItemId(section),
          image_url: file.url,
          name: '',
          href: ''
        }));

      const currentItems = section === 'sponsors' ? sponsors : banners;
      const nextSectionItems = [...currentItems, ...newItems];
      const { nextSponsors, nextBanners } = getNextBySection(section, nextSectionItems);
      const uploadedIds = uploaded.map(file => file.id).filter((id): id is string => !!id);

      await persistStorefrontConfig({
        nextSponsors,
        nextBanners,
        successMessage: `${section === 'sponsors' ? 'Sponsor' : 'Banner'} image uploaded`,
        cleanupFileIds: uploadedIds
      });
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Failed to upload image';
      toast.error(message);
    } finally {
      setUploadingSection(null);
      event.target.value = '';
    }
  };

  const moveItem = async (section: StorefrontConfigSection, index: number, direction: -1 | 1) => {
    const currentItems = section === 'sponsors' ? sponsors : banners;
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= currentItems.length) {
      return;
    }

    const nextSectionItems = [...currentItems];
    const [item] = nextSectionItems.splice(index, 1);
    nextSectionItems.splice(targetIndex, 0, item);

    const { nextSponsors, nextBanners } = getNextBySection(section, nextSectionItems);

    await persistStorefrontConfig({
      nextSponsors,
      nextBanners,
      successMessage: 'Order updated'
    });
  };

  const removeItem = async (section: StorefrontConfigSection, index: number) => {
    const currentItems = section === 'sponsors' ? sponsors : banners;
    const nextSectionItems = currentItems.filter((_, i) => i !== index);
    const { nextSponsors, nextBanners } = getNextBySection(section, nextSectionItems);

    await persistStorefrontConfig({
      nextSponsors,
      nextBanners,
      successMessage: 'Item removed'
    });
  };

  const openItemDetails = (section: StorefrontConfigSection, itemId: string) => {
    navigate(`/settings/storefront-config/${section}/${encodeURIComponent(itemId)}`);
  };

  const totalItems = sponsors.length + banners.length;
  const isBusy = isLoading || isSaving;

  return (
    <Container className="overflow-hidden p-0">
      <div className="border-b border-ui-border-base bg-ui-bg-subtle px-6 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <Heading>Storefront Config</Heading>
            <Text
              size="small"
              className="text-ui-fg-subtle"
            >
              Table view for sponsor and banner items. Open a row to view full detail and edit.
            </Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-ui-border-base bg-ui-bg-base px-2.5 py-1 text-xs text-ui-fg-subtle">
              Sponsors: {sponsors.length}
            </span>
            <span className="rounded-full border border-ui-border-base bg-ui-bg-base px-2.5 py-1 text-xs text-ui-fg-subtle">
              Banners: {banners.length}
            </span>
            <span className="rounded-full border border-ui-border-base bg-ui-bg-base px-2.5 py-1 text-xs text-ui-fg-subtle">
              Total media: {totalItems}
            </span>
            <span className="rounded-full border border-ui-border-base bg-ui-bg-base px-2.5 py-1 text-xs text-ui-fg-subtle">
              {isSaving ? 'Saving...' : 'Auto-save enabled'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <StorefrontConfigSectionTable
          title="Sponsor Managing"
          description="Manage sponsors shown in the storefront sponsor section."
          uploadButtonLabel="Upload Sponsor"
          items={sponsors}
          isBusy={isBusy}
          isUploading={uploadingSection === 'sponsors'}
          fileInputRef={sponsorInputRef}
          onUploadClick={() => openFilePicker('sponsors')}
          onFilesSelected={event => handleFilesSelected('sponsors', 'sponsor', event)}
          onMove={(index, direction) => moveItem('sponsors', index, direction)}
          onRemove={index => removeItem('sponsors', index)}
          onOpenDetails={itemId => openItemDetails('sponsors', itemId)}
        />

        <StorefrontConfigSectionTable
          title="Banner Managing"
          description="Manage promotional banners for storefront sections."
          uploadButtonLabel="Upload Banner"
          items={banners}
          isBusy={isBusy}
          isUploading={uploadingSection === 'banners'}
          fileInputRef={bannerInputRef}
          onUploadClick={() => openFilePicker('banners')}
          onFilesSelected={event => handleFilesSelected('banners', 'banner', event)}
          onMove={(index, direction) => moveItem('banners', index, direction)}
          onRemove={index => removeItem('banners', index)}
          onOpenDetails={itemId => openItemDetails('banners', itemId)}
        />
      </div>
    </Container>
  );
};

export const Component = StorefrontConfig;
