import { FetchError } from "@medusajs/js-sdk"
import {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query"
import { sdk } from "../../lib/client"
import { queryClient } from "../../lib/query-client"
import { queryKeysFactory } from "../../lib/query-key-factory"

const CUSTOM_TAGS_QUERY_KEY = "custom_tags" as const
export const customTagsQueryKeys = queryKeysFactory(CUSTOM_TAGS_QUERY_KEY)

export interface CustomTag {
  id: string
  value: string
  type: "pet_type" | "brand"
  status: "pending" | "approved" | "rejected"
  requested_by?: string
  approved_by?: string
  rejected_reason?: string
  created_at: string
  updated_at: string
}

export interface CustomTagsResponse {
  tags: CustomTag[]
  count: number
}

export interface CustomTagsQuery {
  type?: "pet_type" | "brand"
  status?: "pending" | "approved" | "rejected"
  limit?: number
  offset?: number
  order?: string
}

export const useCustomTags = (
  query?: CustomTagsQuery,
  options?: Omit<
    UseQueryOptions<
      CustomTagsResponse,
      FetchError,
      CustomTagsResponse,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: customTagsQueryKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (query?.type) params.append("type", query.type)
      if (query?.status) params.append("status", query.status)
      if (query?.limit !== undefined) params.append("limit", String(query.limit))
      if (query?.offset !== undefined) params.append("offset", String(query.offset))
      if (query?.order) params.append("order", query.order)

      const response = await sdk.client.fetch<CustomTagsResponse>(
        `/admin/custom-tags${params.toString() ? `?${params.toString()}` : ""}`
      )
      return response
    },
    ...options,
  })

  return { ...data, ...rest }
}

export interface CreateCustomTagPayload {
  value: string
  type: "pet_type" | "brand"
}

export const useCreateCustomTag = (
  options?: UseMutationOptions<
    { tag: CustomTag; message: string },
    FetchError,
    CreateCustomTagPayload
  >
) => {
  return useMutation({
    mutationFn: async (payload: CreateCustomTagPayload) => {
      const response = await sdk.client.fetch<{ tag: CustomTag; message: string }>(
        "/admin/custom-tags",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      )
      return response
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customTagsQueryKeys.lists(),
      })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useApproveCustomTag = (
  tagId: string,
  options?: UseMutationOptions<
    { tag: CustomTag; message: string },
    FetchError,
    void
  >
) => {
  return useMutation({
    mutationFn: async () => {
      const response = await sdk.client.fetch<{ tag: CustomTag; message: string }>(
        `/admin/custom-tags/${tagId}/approve`,
        {
          method: "POST",
        }
      )
      return response
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customTagsQueryKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: customTagsQueryKeys.detail(tagId),
      })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export interface RejectCustomTagPayload {
  reason?: string
}

export const useRejectCustomTag = (
  tagId: string,
  options?: UseMutationOptions<
    { tag: CustomTag; message: string },
    FetchError,
    RejectCustomTagPayload
  >
) => {
  return useMutation({
    mutationFn: async (payload: RejectCustomTagPayload) => {
      const response = await sdk.client.fetch<{ tag: CustomTag; message: string }>(
        `/admin/custom-tags/${tagId}/reject`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      )
      return response
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customTagsQueryKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: customTagsQueryKeys.detail(tagId),
      })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export interface AffectedProduct {
  id: string
  title: string
  thumbnail?: string
}

export interface AffectedProductsResponse {
  products: AffectedProduct[]
  count: number
}

export const useAffectedProducts = (
  options?: UseMutationOptions<
    AffectedProductsResponse,
    FetchError,
    { ids: string[] }
  >
) => {
  return useMutation({
    mutationFn: async (payload: { ids: string[] }) => {
      const response = await sdk.client.fetch<AffectedProductsResponse>(
        "/admin/custom-tags/affected-products",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      )
      return response
    },
    ...options,
  })
}

export const useDeleteCustomTags = (
  options?: UseMutationOptions<
    { deleted: number; message?: string },
    FetchError,
    { ids: string[] }
  >
) => {
  return useMutation({
    mutationFn: async (payload: { ids: string[] }) => {
      const response = await sdk.client.fetch<{ deleted: number; message?: string }>(
        "/admin/custom-tags",
        {
          method: "DELETE",
          body: JSON.stringify(payload),
        }
      )
      return response
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customTagsQueryKeys.lists(),
      })
      // Invalidate queries for each deleted tag
      variables.ids.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: customTagsQueryKeys.detail(id),
        })
      })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export type { AffectedProduct }

