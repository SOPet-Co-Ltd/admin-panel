import { useEffect, useMemo, useState } from 'react';

import { ArrowLeft } from '@medusajs/icons';
import { Button, Container, Heading, Input, Text, toast } from '@medusajs/ui';
import { useNavigate, useParams } from 'react-router-dom';

import { sdk } from '@/lib/client';

type StorefrontConfigSection = 'sponsors' | 'banners';

type StorefrontConfigItem = {
  id: string;
  image_url: string;
  name: string;
  href: string;
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

const isStorefrontConfigSection = (value: string | undefined): value is StorefrontConfigSection => {
  return value === 'sponsors' || value === 'banners';
};

export const StorefrontConfigItemDetail = () => {
  const navigate = useNavigate();
  const { section, itemId } = useParams();

  const validSection = isStorefrontConfigSection(section) ? section : null;
  const decodedItemId = itemId ? decodeURIComponent(itemId) : '';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sponsors, setSponsors] = useState<StorefrontConfigItem[]>([]);
  const [banners, setBanners] = useState<StorefrontConfigItem[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [hrefInput, setHrefInput] = useState('');

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

        setSponsors(parseItemsFromMetadata(metadataLike, 'sponsors'));
        setBanners(parseItemsFromMetadata(metadataLike, 'banners'));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load storefront config item';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorefrontConfig();
  }, []);

  const currentItems = validSection === 'sponsors' ? sponsors : banners;
  const currentIndex = currentItems.findIndex(item => item.id === decodedItemId);
  const currentItem = currentIndex >= 0 ? currentItems[currentIndex] : null;

  useEffect(() => {
    if (!currentItem) {
      return;
    }

    setNameInput(currentItem.name);
    setHrefInput(currentItem.href);
  }, [currentItem]);

  const sectionLabel = useMemo(() => {
    if (validSection === 'sponsors') {
      return 'Sponsor';
    }

    if (validSection === 'banners') {
      return 'Banner';
    }

    return 'Media';
  }, [validSection]);

  const persistStorefrontConfig = async (
    nextSponsors: StorefrontConfigItem[],
    nextBanners: StorefrontConfigItem[]
  ) => {
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
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save storefront config';
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveItemChanges = async () => {
    if (!validSection || !currentItem || currentIndex < 0) {
      return;
    }

    const nextSectionItems = [...currentItems];
    nextSectionItems[currentIndex] = {
      ...currentItem,
      name: nameInput,
      href: hrefInput
    };

    const nextSponsors = validSection === 'sponsors' ? nextSectionItems : sponsors;
    const nextBanners = validSection === 'banners' ? nextSectionItems : banners;

    const didSave = await persistStorefrontConfig(nextSponsors, nextBanners);

    if (didSave) {
      toast.success('Item saved');
      setIsEditing(false);
    }
  };

  if (!validSection) {
    return (
      <Container>
        <div className="px-6 py-5">
          <Heading>Invalid section</Heading>
          <Text
            size="small"
            className="mt-2 text-ui-fg-subtle"
          >
            Section must be either sponsors or banners.
          </Text>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => navigate('/settings/storefront-config')}
          >
            Back to Storefront Config
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="overflow-hidden p-0">
      <div className="border-b border-ui-border-base px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button
              variant="transparent"
              className="mb-3"
              onClick={() => navigate('/settings/storefront-config')}
            >
              <ArrowLeft />
              Back
            </Button>
            <Heading>{sectionLabel} Detail</Heading>
            <Text
              size="small"
              className="text-ui-fg-subtle"
            >
              Full information and editable metadata for this {sectionLabel.toLowerCase()} item.
            </Text>
          </div>
          {currentItem && (
            <Button
              variant="secondary"
              onClick={() => setIsEditing(prev => !prev)}
              disabled={isLoading || isSaving}
            >
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 py-5">
        {isLoading ? (
          <Text size="small">Loading...</Text>
        ) : !currentItem ? (
          <div className="rounded-lg border border-ui-border-base p-5">
            <Heading level="h3">Item not found</Heading>
            <Text
              size="small"
              className="mt-2 text-ui-fg-subtle"
            >
              The selected item no longer exists.
            </Text>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => navigate('/settings/storefront-config')}
            >
              Back to list
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
            <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4">
              <img
                src={currentItem.image_url}
                alt={currentItem.name || `${sectionLabel} image`}
                className="h-[240px] w-full rounded object-contain"
              />
            </div>

            <div className="space-y-4 rounded-lg border border-ui-border-base p-4">
              <div>
                <Text
                  size="xsmall"
                  className="mb-1 text-ui-fg-subtle"
                >
                  Item ID
                </Text>
                <Text size="small">{currentItem.id}</Text>
              </div>

              <div>
                <Text
                  size="xsmall"
                  className="mb-1 text-ui-fg-subtle"
                >
                  Image URL
                </Text>
                <Text
                  size="small"
                  className="break-all"
                >
                  {currentItem.image_url}
                </Text>
              </div>

              <div>
                <Text
                  size="xsmall"
                  className="mb-1 text-ui-fg-subtle"
                >
                  Display Name
                </Text>
                {isEditing ? (
                  <Input
                    value={nameInput}
                    onChange={event => setNameInput(event.target.value)}
                    placeholder="Display name"
                  />
                ) : (
                  <Text size="small">{currentItem.name || '-'}</Text>
                )}
              </div>

              <div>
                <Text
                  size="xsmall"
                  className="mb-1 text-ui-fg-subtle"
                >
                  Link URL
                </Text>
                {isEditing ? (
                  <Input
                    value={hrefInput}
                    onChange={event => setHrefInput(event.target.value)}
                    placeholder="https://example.com"
                  />
                ) : (
                  <Text
                    size="small"
                    className="break-all"
                  >
                    {currentItem.href || '-'}
                  </Text>
                )}
              </div>

              {isEditing && (
                <div className="pt-2">
                  <Button
                    onClick={() => void saveItemChanges()}
                    isLoading={isSaving}
                    disabled={isSaving}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export const Component = StorefrontConfigItemDetail;
