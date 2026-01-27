import { TwoColumnPageSkeleton } from '@components/common/skeleton';
import { TwoColumnPage } from '@components/layout/pages';
import { useProduct } from '@hooks/api/products';
import { useExtension } from '@providers/extension-provider';
import { ProductAdditionalAttributeSection } from '@routes/products/product-detail/components/product-additional-attribute-section';
import { ProductAttributeSection } from '@routes/products/product-detail/components/product-attribute-section';
import { ProductGeneralSection } from '@routes/products/product-detail/components/product-general-section';
import { ProductMediaSection } from '@routes/products/product-detail/components/product-media-section';
import { ProductOptionSection } from '@routes/products/product-detail/components/product-option-section';
import { ProductOrganizationSection } from '@routes/products/product-detail/components/product-organization-section';
import { ProductSalesChannelSection } from '@routes/products/product-detail/components/product-sales-channel-section';
import { ProductShippingProfileSection } from '@routes/products/product-detail/components/product-shipping-profile-section';
import { ProductVariantSection } from '@routes/products/product-detail/components/product-variant-section';
import type { productLoader } from '@routes/products/product-detail/loader';
import { useLoaderData, useParams } from 'react-router-dom';

export const ProductDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof productLoader>>;

  const { id } = useParams();
  const { product, isLoading, isError, error } = useProduct(
    id!,
    {
      fields:
        '*variants.inventory_items,*categories,attribute_values.*,attribute_values.attribute.*,+custom_tags'
    },
    {
      initialData: initialData
    }
  );

  console.log(product);

  const { getWidgets } = useExtension();

  const after = getWidgets('product.details.after');
  const before = getWidgets('product.details.before');
  const sideAfter = getWidgets('product.details.side.after');
  const sideBefore = getWidgets('product.details.side.before');

  if (isLoading || !product) {
    return (
      <TwoColumnPageSkeleton
        mainSections={4}
        sidebarSections={3}
        showJSON
        showMetadata
      />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <div data-testid="product-detail-page">
      <TwoColumnPage
        widgets={{
          after,
          before,
          sideAfter,
          sideBefore
        }}
        showJSON
        showMetadata
        data={product}
      >
        <TwoColumnPage.Main data-testid="product-detail-main">
          <ProductGeneralSection product={product} />
          <ProductMediaSection product={product} />
          <ProductOptionSection product={product} />
          <ProductVariantSection product={product} />
        </TwoColumnPage.Main>
        <TwoColumnPage.Sidebar data-testid="product-detail-sidebar">
          <ProductSalesChannelSection product={product} />
          {product.shipping_profile && (
            <ProductShippingProfileSection
              product={{ ...product, shipping_profile: product.shipping_profile }}
            />
          )}
          <ProductOrganizationSection product={product} />
          <ProductAttributeSection product={product} />
          <ProductAdditionalAttributeSection />
        </TwoColumnPage.Sidebar>
      </TwoColumnPage>
    </div>
  );
};
