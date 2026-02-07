import { useMemo, useState } from 'react';

import { Combobox } from '@components/inputs/combobox';
import {
  useAlgolia,
  useAlgoliaDiagnostics,
  useSyncAlgoliaFull,
  useSyncAlgoliaProduct
} from '@hooks/api/algolia';
import { useProducts } from '@hooks/api/products';
import { Button, Container, Heading, Label, StatusBadge, Table, Text, toast } from '@medusajs/ui';

export const Algolia = () => {
  const { data: algolia, isLoading } = useAlgolia();
  const { mutateAsync: syncFull, isPending: isSyncingFull } = useSyncAlgoliaFull();
  const { mutateAsync: syncProduct, isPending: isSyncingProduct } = useSyncAlgoliaProduct();
  const { data: diagnostics, isLoading: diagnosticsLoading } = useAlgoliaDiagnostics(
    !!algolia?.configured
  );

  const [productId, setProductId] = useState<string>('');
  const [productSearch, setProductSearch] = useState('');

  // Fetch products for the combobox
  const { products } = useProducts(
    {
      q: productSearch,
      limit: 50,
      fields: 'id,title'
    },
    {
      enabled: true
    }
  );

  // Transform products to combobox options
  const productOptions = useMemo(() => {
    if (!products) {
      return [];
    }

    return products.map(product => ({
      value: product.id,
      label: product.title || product.id
    }));
  }, [products]);

  const handleSyncAllProducts = async () => {
    try {
      toast.info('Re-syncing products published to search...');
      const result = (await syncFull()) as {
        message?: string;
        synced: number;
        failed: number;
        total: number;
      };
      toast.success(
        `Synced ${result.synced} products${result.failed > 0 ? ` (${result.failed} failed)` : ''}`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync products';
      toast.error(errorMessage);
    }
  };

  const handleSyncProduct = async () => {
    if (!productId.trim()) {
      toast.error('Please enter a product ID');

      return;
    }

    try {
      await syncProduct(productId.trim());
      toast.success(`Product ${productId} synced successfully!`);
      setProductId('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync product';
      toast.error(errorMessage);
    }
  };

  return (
    <Container data-testid="algolia-container">
      <div
        className="flex items-center justify-between px-6 py-4"
        data-testid="algolia-header"
      >
        <div>
          <Heading data-testid="algolia-heading">Algolia Search Engine</Heading>
          <Text
            className="text-ui-fg-subtle"
            size="small"
            data-testid="algolia-description"
          >
            Manage Algolia search engine configuration and sync product data
          </Text>
        </div>
      </div>

      <div className="px-6 pb-6">
        <Table data-testid="algolia-table">
          <Table.Body data-testid="algolia-table-body">
            <Table.Row data-testid="algolia-table-row-configured">
              <Table.Cell data-testid="algolia-table-cell-configured-label">
                Configuration Status
              </Table.Cell>
              <Table.Cell data-testid="algolia-table-cell-configured-value">
                {isLoading ? (
                  <Text size="small">Loading...</Text>
                ) : algolia?.configured ? (
                  <StatusBadge color="green">Configured</StatusBadge>
                ) : (
                  <StatusBadge color="red">Not Configured</StatusBadge>
                )}
              </Table.Cell>
            </Table.Row>
            <Table.Row data-testid="algolia-table-row-application-id">
              <Table.Cell data-testid="algolia-table-cell-application-id-label">
                Application ID
              </Table.Cell>
              <Table.Cell data-testid="algolia-table-cell-application-id-value">
                {algolia?.appId || 'Not set'}
              </Table.Cell>
            </Table.Row>
            <Table.Row data-testid="algolia-table-row-product-index">
              <Table.Cell data-testid="algolia-table-cell-product-index-label">
                Product Index
              </Table.Cell>
              <Table.Cell data-testid="algolia-table-cell-product-index-value">
                {algolia?.productIndex ? (
                  <StatusBadge
                    color="green"
                    data-testid="algolia-product-index-exists-badge"
                  >
                    Exists
                  </StatusBadge>
                ) : (
                  <StatusBadge
                    color="red"
                    data-testid="algolia-product-index-not-exists-badge"
                  >
                    Doesn&apos;t exist
                  </StatusBadge>
                )}
              </Table.Cell>
            </Table.Row>
            {diagnostics && !diagnosticsLoading && (
              <>
                <Table.Row data-testid="algolia-table-row-diagnostics">
                  <Table.Cell>Product status (DB)</Table.Cell>
                  <Table.Cell>
                    Total: {diagnostics.total} | Published: {diagnostics.publishedCount} | By
                    status:{' '}
                    {Object.entries(diagnostics.byStatus)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ') || '—'}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Products without sales channel</Table.Cell>
                  <Table.Cell>{diagnostics.withoutSalesChannel}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Algolia record count</Table.Cell>
                  <Table.Cell>
                    {diagnostics.algoliaRecordCount != null ? diagnostics.algoliaRecordCount : '—'}
                  </Table.Cell>
                </Table.Row>
                {diagnostics.syncHint && (
                  <Table.Row>
                    <Table.Cell colSpan={2}>
                      <Text
                        size="small"
                        className="text-ui-fg-muted"
                      >
                        {diagnostics.syncHint}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )}
              </>
            )}
          </Table.Body>
        </Table>

        <div className="mt-6 space-y-6">
          <div className="rounded-lg border border-ui-border-base p-6">
            <Heading
              level="h2"
              className="mb-4"
            >
              Sync All Products
            </Heading>
            <Text
              className="mb-4 text-ui-fg-subtle"
              size="small"
            >
              Re-sync all products that are published to search (by vendors) to Algolia. Only
              products with &quot;Published to search&quot; are synced. Vendors publish products
              from the Vendor panel.
            </Text>
            <Button
              onClick={handleSyncAllProducts}
              disabled={isSyncingFull || !algolia?.configured}
              isLoading={isSyncingFull}
              data-testid="algolia-sync-all-button"
            >
              {isSyncingFull ? 'Syncing...' : 'Sync All Products'}
            </Button>
          </div>

          <div className="rounded-lg border border-ui-border-base p-6">
            <Heading
              level="h2"
              className="mb-4"
            >
              Sync Single Product
            </Heading>
            <Text
              className="mb-4 text-ui-fg-subtle"
              size="small"
            >
              Update this product&apos;s custom tags and stats in Algolia. The product must already
              be in the index (published to search by a vendor).
            </Text>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="product-select">Product</Label>
                <Combobox
                  id="product-select"
                  value={productId}
                  onChange={value => setProductId(value || '')}
                  searchValue={productSearch}
                  onSearchValueChange={setProductSearch}
                  options={productOptions}
                  placeholder="Search and select a product..."
                  disabled={isSyncingProduct || !algolia?.configured}
                  allowClear
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSyncProduct}
                  disabled={isSyncingProduct || !algolia?.configured || !productId.trim()}
                  isLoading={isSyncingProduct}
                  data-testid="algolia-sync-product-button"
                >
                  {isSyncingProduct ? 'Syncing...' : 'Sync Product'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};
