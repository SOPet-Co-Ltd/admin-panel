import { Button, Select, toast } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import * as zod from "zod"

import { Form } from "@components/common/form"
import { Combobox } from "@components/inputs/combobox"
import { RouteDrawer, useRouteModal } from "@components/modals"
import { KeyboundForm } from "@components/utilities/keybound-form"
import {
  FormExtensionZone,
  useExtendableForm,
} from "@/dashboard-app"
import { productsQueryKeys, useUpdateProduct } from "@hooks/api/products"
import { useComboboxData } from "@hooks/use-combobox-data"
import { queryClient } from "@lib/query-client"
import { backendUrl, getAuthToken, sdk } from "@lib/client"
import { useExtension } from "@providers/extension-provider"
import { CategoryCombobox } from "@routes/products/common/components/category-combobox"
import type { AdminProduct } from "@custom-types/product/common"

type ProductOrganizationFormProps = {
  product: AdminProduct
}

type CustomTag = {
  id: string
  value: string
  type: "pet_type" | "brand"
  status?: string
}

type CustomTagsApiResponse = {
  tags: CustomTag[]
  count: number
  offset: number
  limit: number
}

const ProductOrganizationSchema = zod.object({
  collection_id: zod.string().nullable(),
  category_ids: zod.array(zod.string()),
  custom_tag_1: zod.string().nullable().optional(), // pet_type
  custom_tag_2: zod.string().nullable().optional(), // brand
})

export const ProductOrganizationForm = ({
  product,
}: ProductOrganizationFormProps) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()
  const { getFormConfigs, getFormFields } = useExtension()

  const configs = getFormConfigs("product", "organize")
  const fields = getFormFields("product", "organize")

  const collections = useComboboxData({
    queryKey: ["product_collections"],
    queryFn: (params) => sdk.admin.productCollection.list(params),
    getOptions: (data) =>
      data.collections.map((collection) => ({
        label: collection.title!,
        value: collection.id!,
      })),
  })

  const petTypes = useComboboxData<CustomTagsApiResponse, Record<string, string | number>>({
    queryKey: ["custom_tags", "pet_type"],
    queryFn: async (params) => {
      const response = await sdk.client.fetch<{ tags: CustomTag[]; count: number }>("/admin/custom-tags", {
        method: "GET",
        query: { ...params, type: "pet_type", status: "approved" },
      })

      return {
        ...response,
        offset: (params.offset as number) ?? 0,
        limit: (params.limit as number) ?? 10,
      }
    },
    getOptions: (data) =>
      data.tags?.map((tag) => ({
        label: tag.value,
        value: tag.id,
      })) || [],
  })

  const brands = useComboboxData<CustomTagsApiResponse, Record<string, string | number>>({
    queryKey: ["custom_tags", "brand"],
    queryFn: async (params) => {
      const response = await sdk.client.fetch<{ tags: CustomTag[]; count: number }>("/admin/custom-tags", {
        method: "GET",
        query: { ...params, type: "brand", status: "approved" },
      })

      return {
        ...response,
        offset: (params.offset as number) ?? 0,
        limit: (params.limit as number) ?? 10,
      }
    },
    getOptions: (data) =>
      data.tags?.map((tag) => ({
        label: tag.value,
        value: tag.id,
      })) || [],
  })

  const form = useExtendableForm({
    defaultValues: {
      collection_id: product.collection_id ?? null,
      category_ids: product.categories?.map((c) => c.id) || [],
      custom_tag_1:
        (product.custom_tags || []).find((ct) => ct.type === "pet_type")?.id ?? null,
      custom_tag_2:
        (product.custom_tags || []).find((ct) => ct.type === "brand")?.id ?? null,
    },
    schema: ProductOrganizationSchema,
    configs: configs,
    data: product,
  })

  const { mutateAsync, isPending } = useUpdateProduct(product.id)

  const handleSubmit = form.handleSubmit(async (data) => {
    const selectedTagIds = [data.custom_tag_1, data.custom_tag_2].filter(
      (v): v is string => !!v
    )
    const existingTagIds =
      (product.custom_tags || [])
        .filter((ct) => ct.type === "pet_type" || ct.type === "brand")
        .map((ct) => ct.id) || []
    const hasTagChanges =
      selectedTagIds.length !== existingTagIds.length ||
      selectedTagIds.some((id) => !existingTagIds.includes(id))

    try {
      await mutateAsync({
        collection_id: data.collection_id || null,
        categories: data.category_ids.map((c) => ({ id: c })),
      })

      if (hasTagChanges && existingTagIds.length) {
        const token = getAuthToken()
        const deleteResponse = await fetch(`${backendUrl}/admin/products/${product.id}/custom-tags`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ tag_ids: existingTagIds }),
        })
        
        if (!deleteResponse.ok && deleteResponse.status !== 204) {
          const errorData = await deleteResponse.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to delete custom tags")
        }
      }

      if (selectedTagIds.length) {
        await sdk.client.fetch(`/admin/products/${product.id}/custom-tags`, {
          method: "POST",
          body: { tag_ids: selectedTagIds },
        })
      }

      // Invalidate and refetch all product detail queries to refresh the page
      // This will match queries like ["products", "detail", product.id, { query: {...} }]
      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(product.id),
      })
      // Force refetch to ensure the page updates immediately
      await queryClient.refetchQueries({
        queryKey: productsQueryKeys.detail(product.id),
      })

      toast.success(
        t("products.organization.edit.toasts.success", {
          title: product.title,
        })
      )
      handleSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      toast.error(errorMessage)
    }
  })

  return (
    <RouteDrawer.Form form={form} data-testid="product-organization-form">
      <KeyboundForm onSubmit={handleSubmit} className="flex h-full flex-col" data-testid="product-organization-keybound-form">
        <RouteDrawer.Body data-testid="product-organization-form-body">
          <div className="flex h-full flex-col gap-y-4" data-testid="product-organization-form-fields">
            <Form.Field
              control={form.control}
              name="collection_id"
              render={({ field }) => {
                return (
                  <Form.Item data-testid="product-organization-form-collection-item">
                    <Form.Label optional data-testid="product-organization-form-collection-label">
                      {t("products.fields.collection.label")}
                    </Form.Label>
                    <Form.Control data-testid="product-organization-form-collection-control">
                      <Combobox
                        {...field}
                        multiple={false}
                        options={collections.options}
                        onSearchValueChange={collections.onSearchValueChange}
                        searchValue={collections.searchValue}
                        data-testid="product-organization-form-collection-combobox"
                      />
                    </Form.Control>
                    <Form.ErrorMessage data-testid="product-organization-form-collection-error" />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="category_ids"
              render={({ field }) => {
                return (
                  <Form.Item data-testid="product-organization-form-categories-item">
                    <Form.Label optional data-testid="product-organization-form-categories-label">
                      {t("products.fields.categories.label")}
                    </Form.Label>
                    <Form.Control data-testid="product-organization-form-categories-control">
                      <CategoryCombobox {...field} data-testid="product-organization-form-categories-combobox" />
                    </Form.Control>
                    <Form.ErrorMessage data-testid="product-organization-form-categories-error" />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="custom_tag_1"
              render={({ field: { ref, onChange, value, ...field } }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>
                      {t("products.fields.petType.label")}
                    </Form.Label>
                    <Form.Control>
                      <Select
                        {...field}
                        value={value || undefined}
                        onValueChange={onChange}
                      >
                        <Select.Trigger ref={ref}>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {petTypes.options.map((option) => (
                            <Select.Item key={option.value} value={option.value}>
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="custom_tag_2"
              render={({ field: { ref, onChange, value, ...field } }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>
                      {t("products.fields.brand.label")}
                    </Form.Label>
                    <Form.Control>
                      <Select
                        {...field}
                        value={value || undefined}
                        onValueChange={onChange}
                      >
                        <Select.Trigger ref={ref}>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {brands.options.map((option) => (
                            <Select.Item key={option.value} value={option.value}>
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <FormExtensionZone fields={fields} form={form} data-testid="product-organization-form-extension-zone" />
          </div>
        </RouteDrawer.Body>
        <RouteDrawer.Footer data-testid="product-organization-form-footer">
          <div className="flex items-center justify-end gap-x-2" data-testid="product-organization-form-footer-actions">
            <RouteDrawer.Close asChild data-testid="product-organization-form-cancel-button-wrapper">
              <Button size="small" variant="secondary" data-testid="product-organization-form-cancel-button">
                {t("actions.cancel")}
              </Button>
            </RouteDrawer.Close>
            <Button size="small" type="submit" isLoading={isPending} data-testid="product-organization-form-save-button">
              {t("actions.save")}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  )
}
