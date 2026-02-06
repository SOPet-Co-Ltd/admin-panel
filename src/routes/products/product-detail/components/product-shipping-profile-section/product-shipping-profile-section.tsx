import { HttpTypes } from '@medusajs/types';
import { Container, Heading, Text } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

type ProductShippingProfileSectionProps = {
  product: HttpTypes.AdminProduct & {
    shipping_profile: HttpTypes.AdminShippingProfile;
  };
};

export const ProductShippingProfileSection = ({ product }: ProductShippingProfileSectionProps) => {
  const { t } = useTranslation();

  const shippingProfile = product.shipping_profile;

  return (
    <Container
      className="p-0"
      data-testid="product-shipping-profile-section"
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        data-testid="product-shipping-profile-header"
      >
        <Heading
          level="h2"
          data-testid="product-shipping-profile-title"
        >
          {t('products.shippingProfile.header')}
        </Heading>
        {/* Shipping profiles are vendor-specific and managed in the vendor panel */}
      </div>

      {shippingProfile && (
        <div data-testid="product-shipping-profile-link-container">
          <div className="px-6 py-4">
            <Text
              size="small"
              weight="plus"
              data-testid="product-shipping-profile-name"
            >
              {shippingProfile.name}
            </Text>
            <Text
              className="txt-small text-ui-fg-subtle"
              data-testid="product-shipping-profile-type"
            >
              {shippingProfile.type}
            </Text>
          </div>
        </div>
      )}
    </Container>
  );
};
