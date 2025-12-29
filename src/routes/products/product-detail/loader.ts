import { LoaderFunctionArgs } from "react-router-dom"

import { productsQueryKeys } from "../../../hooks/api/products"
import { sdk } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"
import type { AdminProduct } from "../../../types/product/common"
import { PRODUCT_DETAIL_FIELDS } from "./constants"

const sanitizeFields = (fields?: string) =>
  typeof fields === "string"
    ? fields
        .split(",")
        .map((f) => f.trim())
        .filter(
          (f) =>
            f &&
            f !== "+custom_tags" &&
            f !== "custom_tags" &&
            f !== "+custom_tags.*" &&
            f !== "custom_tags.*"
        )
        .join(",")
    : fields

const productDetailQuery = (id: string) => {
  const fields = sanitizeFields(PRODUCT_DETAIL_FIELDS)
  const finalQuery = fields ? { fields } : {}
  const queryKeyData = Object.keys(finalQuery).length ? finalQuery : undefined

  return {
    queryKey: productsQueryKeys.detail(id, queryKeyData),
    queryFn: async () => {
      const [productRes, tagsRes] = await Promise.all([
        sdk.admin.product.retrieve(id, finalQuery),
        sdk.client
          .fetch(`/admin/products/${id}/custom-tags`, {
            method: "GET",
          })
          .catch(() => null),
      ])

      const product = productRes.product as AdminProduct
      const customTags =
        (tagsRes as any)?.custom_tags || (tagsRes as any)?.tags || []
      if (customTags?.length) {
        product.custom_tags = customTags
      }

      return { ...productRes, product }
    },
  }
}

export const productLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id
  const query = productDetailQuery(id!)

  const response = await queryClient.ensureQueryData({
    ...query,
    staleTime: 90000,
  })

  return response
}
