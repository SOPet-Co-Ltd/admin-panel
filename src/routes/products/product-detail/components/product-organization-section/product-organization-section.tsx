import { PencilSquare } from "@medusajs/icons"
import { Badge, Container, Heading, Tooltip } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ActionMenu } from "@components/common/action-menu"
import { SectionRow } from "@components/common/section"
import type { AdminProduct } from "@custom-types/product/common"
import { useExtension } from "@providers/extension-provider"

type ProductOrganizationSectionProps = {
  product: AdminProduct
}

export const ProductOrganizationSection = ({
  product,
}: ProductOrganizationSectionProps) => {
  const { t } = useTranslation()
  const { getDisplays } = useExtension()
  const petTypeTags =
    (product.custom_tags || []).filter((ct) => ct.type === "pet_type") || []
  const brandTags =
    (product.custom_tags || []).filter((ct) => ct.type === "brand") || []

  return (
    <Container className="divide-y p-0" data-testid="product-organization-section">
      <div className="flex items-center justify-between px-6 py-4" data-testid="product-organization-header">
        <Heading level="h2" data-testid="product-organization-title">{t("products.organization.header")}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.edit"),
                  to: "organization",
                  icon: <PencilSquare />,
                },
              ],
            },
          ]}
          data-testid="product-organization-action-menu"
        />
      </div>

      <SectionRow
        title={t("fields.collection")}
        value={
          product.collection ? (
            <OrganizationTag
              label={product.collection.title}
              to={`/collections/${product.collection.id}`}
            />
          ) : undefined
        }
        data-testid="product-collection-row"
      />

      <SectionRow
        title={t("fields.categories")}
        value={
          product.categories?.length
            ? product.categories.map((pcat) => (
                <OrganizationTag
                  key={pcat.id}
                  label={pcat.name}
                  to={`/categories/${pcat.id}`}
                />
              ))
            : undefined
        }
        data-testid="product-categories-row"
      />

      <SectionRow
        title={t("products.fields.petType.label")}
        value={
          petTypeTags.length
            ? petTypeTags.map((ct) => (
                <OrganizationTag key={ct.id} label={ct.value} to="/custom-tags" />
              ))
            : undefined
        }
        data-testid="product-pet-type-row"
      />

      <SectionRow
        title={t("products.fields.brand.label")}
        value={
          brandTags.length
            ? brandTags.map((ct) => (
                <OrganizationTag key={ct.id} label={ct.value} to="/custom-tags" />
              ))
            : undefined
        }
        data-testid="product-brand-row"
      />

      {getDisplays("product", "organize").map((Component, i) => {
        return <Component key={i} data={product} />
      })}
    </Container>
  )
}

const OrganizationTag = ({ label, to }: { label: string; to: string }) => {
  return (
    <Tooltip content={label}>
      <Badge size="2xsmall" className="block w-fit truncate" asChild>
        <Link to={to} data-testid={`organization-tag-${label.toLowerCase().replace(/\s+/g, "-")}`}>{label}</Link>
      </Badge>
    </Tooltip>
  )
}
