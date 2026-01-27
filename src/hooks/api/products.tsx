import type { AttributeDTO } from '@custom-types/index';
import type {
  AdminProduct,
  AdminProductResponse,
  AdminProductUpdate,
  ExtendedAdminProductListParams
} from '@custom-types/product/common';
import { backendUrl, getAuthToken, sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import { queryKeysFactory } from '@lib/query-key-factory';
import type { FetchError } from '@medusajs/js-sdk';
import type { HttpTypes } from '@medusajs/types';
import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query';

import { inventoryItemsQueryKeys } from './inventory.tsx';

const PRODUCTS_QUERY_KEY = 'products' as const;
export const productsQueryKeys = queryKeysFactory(PRODUCTS_QUERY_KEY);

const VARIANTS_QUERY_KEY = 'product_variants' as const;
export const variantsQueryKeys = queryKeysFactory(VARIANTS_QUERY_KEY);

const OPTIONS_QUERY_KEY = 'product_options' as const;
export const optionsQueryKeys = queryKeysFactory(OPTIONS_QUERY_KEY);

type CustomTagsResponse = {
  product_id: string;
  custom_tags: Array<{
    id: string;
    value: string;
    type: 'pet_type' | 'brand';
    status?: string;
  }>;
  count: number;
} | null;

export const useCreateProductOption = (
  productId: string,
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof sdk.admin.product.createOption>>,
    FetchError,
    HttpTypes.AdminCreateProductOption
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminCreateProductOption) =>
      sdk.admin.product.createOption(productId, payload),
    onSuccess: (
      data: Awaited<ReturnType<typeof sdk.admin.product.createOption>>,
      variables: HttpTypes.AdminCreateProductOption,
      context: unknown
    ) => {
      queryClient.invalidateQueries({ queryKey: optionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useUpdateProductOption = (
  productId: string,
  optionId: string,
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof sdk.admin.product.updateOption>>,
    FetchError,
    HttpTypes.AdminUpdateProductOption
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminUpdateProductOption) =>
      sdk.admin.product.updateOption(productId, optionId, payload),
    onSuccess: (
      data: Awaited<ReturnType<typeof sdk.admin.product.updateOption>>,
      variables: HttpTypes.AdminUpdateProductOption,
      context: unknown
    ) => {
      queryClient.invalidateQueries({ queryKey: optionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: optionsQueryKeys.detail(optionId)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useDeleteProductOption = (
  productId: string,
  optionId: string,
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof sdk.admin.product.deleteOption>>,
    FetchError,
    void
  >
) => {
  return useMutation({
    mutationFn: () => sdk.admin.product.deleteOption(productId, optionId),
    onSuccess: (
      data: Awaited<ReturnType<typeof sdk.admin.product.deleteOption>>,
      variables: void,
      context: unknown
    ) => {
      queryClient.invalidateQueries({ queryKey: optionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: optionsQueryKeys.detail(optionId)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useProductVariant = (
  productId: string,
  variantId: string,
  query?: HttpTypes.AdminProductVariantParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminProductVariantResponse,
      FetchError,
      HttpTypes.AdminProductVariantResponse,
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.product.retrieveVariant(productId, variantId, query),
    queryKey: variantsQueryKeys.detail(variantId, query),
    ...options
  });

  return { ...data, ...rest };
};

export const useProductVariants = (
  productId: string,
  query?: HttpTypes.AdminProductVariantParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminProductVariantListResponse,
      FetchError,
      HttpTypes.AdminProductVariantListResponse,
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.product.listVariants(productId, query),
    queryKey: variantsQueryKeys.list({ productId, ...query }),
    ...options
  });

  return { ...data, ...rest };
};

export const useCreateProductVariant = (
  productId: string,
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof sdk.admin.product.createVariant>>,
    FetchError,
    HttpTypes.AdminCreateProductVariant
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminCreateProductVariant) =>
      sdk.admin.product.createVariant(productId, payload),
    onSuccess: (
      data: Awaited<ReturnType<typeof sdk.admin.product.createVariant>>,
      variables: HttpTypes.AdminCreateProductVariant,
      context: unknown
    ) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useUpdateProductVariant = (
  productId: string,
  variantId: string,
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof sdk.admin.product.updateVariant>>,
    FetchError,
    HttpTypes.AdminUpdateProductVariant
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminUpdateProductVariant) =>
      sdk.admin.product.updateVariant(productId, variantId, payload),
    onSuccess: (
      data: Awaited<ReturnType<typeof sdk.admin.product.updateVariant>>,
      variables: HttpTypes.AdminUpdateProductVariant,
      context: unknown
    ) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: variantsQueryKeys.detail(variantId)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useUpdateProductVariantsBatch = (
  productId: string,
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof sdk.admin.product.batchVariants>>,
    FetchError,
    HttpTypes.AdminBatchProductVariantRequest['update']
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminBatchProductVariantRequest['update']) =>
      sdk.admin.product.batchVariants(productId, {
        update: payload
      }),
    onSuccess: (
      data: Awaited<ReturnType<typeof sdk.admin.product.batchVariants>>,
      variables: HttpTypes.AdminBatchProductVariantRequest['update'],
      context: unknown
    ) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.details() });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useProductVariantsInventoryItemsBatch = (
  productId: string,
  options?: UseMutationOptions<
    HttpTypes.AdminBatchProductVariantInventoryItemResponse,
    FetchError,
    HttpTypes.AdminBatchProductVariantInventoryItemRequest
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminBatchProductVariantInventoryItemRequest) =>
      sdk.admin.product.batchVariantInventoryItems(productId, payload),
    onSuccess: (
      data: Awaited<ReturnType<typeof sdk.admin.product.batchVariantInventoryItems>>,
      variables: HttpTypes.AdminBatchProductVariantInventoryItemRequest,
      context: unknown
    ) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.details() });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useDeleteVariant = (
  productId: string,
  variantId: string,
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof sdk.admin.product.deleteVariant>>,
    FetchError,
    void
  >
) => {
  return useMutation({
    mutationFn: () => sdk.admin.product.deleteVariant(productId, variantId),
    onSuccess: (
      data: Awaited<ReturnType<typeof sdk.admin.product.deleteVariant>>,
      variables: void,
      context: unknown
    ) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: variantsQueryKeys.detail(variantId)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useDeleteVariantLazy = (
  productId: string,
  options?: UseMutationOptions<
    HttpTypes.AdminProductVariantDeleteResponse,
    FetchError,
    { variantId: string }
  >
) => {
  return useMutation({
    mutationFn: ({ variantId }) => sdk.admin.product.deleteVariant(productId, variantId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: variantsQueryKeys.detail(variables.variantId)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useProduct = (
  id: string,
  query?: Record<string, unknown>,
  options?: Omit<
    UseQueryOptions<AdminProductResponse, FetchError, AdminProductResponse, QueryKey>,
    'queryFn' | 'queryKey'
  >
) => {
  const { fields, ...restQuery } = query || {};
  const sanitizeFields = (fields?: string) =>
    typeof fields === 'string'
      ? fields
          .split(',')
          .map(f => f.trim())
          .filter(
            f =>
              f &&
              f !== '+custom_tags' &&
              f !== 'custom_tags' &&
              f !== '+custom_tags.*' &&
              f !== 'custom_tags.*'
          )
          .join(',')
      : fields;

  const sanitizedFields = sanitizeFields(typeof fields === 'string' ? fields : undefined);
  const finalQuery = {
    ...restQuery,
    ...(sanitizedFields ? { fields: sanitizedFields } : {})
  };

  const { data, ...rest } = useQuery({
    queryFn: async () => {
      const [productRes, tagsRes] = await Promise.all([
        sdk.admin.product.retrieve(id, finalQuery),
        sdk.client
          .fetch(`/admin/products/${id}/custom-tags`, {
            method: 'GET'
          })
          .catch(() => null)
      ]);

      const product = productRes.product as AdminProduct;
      const tagsResponse = tagsRes as CustomTagsResponse;
      const customTags = tagsResponse?.custom_tags || [];
      if (customTags?.length) {
        product.custom_tags = customTags;
      }

      return { ...productRes, product };
    },
    queryKey: productsQueryKeys.detail(id, {
      ...query,
      ...(sanitizedFields ? { fields: sanitizedFields } : {})
    }),
    ...options
  });

  return { ...data, ...rest };
};

export const useProducts = (
  query?: ExtendedAdminProductListParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminProductListResponse,
      FetchError,
      HttpTypes.AdminProductListResponse,
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.product.list(query),
    queryKey: productsQueryKeys.list(query),
    ...options
  });

  return { ...data, ...rest };
};

export const useCreateProduct = (
  options?: UseMutationOptions<
    HttpTypes.AdminProductResponse,
    FetchError,
    HttpTypes.AdminCreateProduct
  >
) => {
  return useMutation({
    mutationFn: async payload => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${backendUrl}/admin/products/custom`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to create product');
      }

      return response.json();
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      // if `manage_inventory` is true on created variants that will create inventory items automatically
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useUpdateProduct = (
  id: string,
  options?: UseMutationOptions<AdminProductResponse, FetchError, AdminProductUpdate>
) => {
  return useMutation({
    mutationFn: payload => sdk.admin.product.update(id, payload),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.lists()
      });
      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(id)
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useDeleteProduct = (
  id: string,
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof sdk.admin.product.delete>>,
    FetchError,
    void
  >
) => {
  return useMutation({
    mutationFn: () => sdk.admin.product.delete(id),
    onSuccess: (
      data: Awaited<ReturnType<typeof sdk.admin.product.delete>>,
      variables: void,
      context: unknown
    ) => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.detail(id) });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useExportProducts = (
  query?: HttpTypes.AdminProductListParams,
  options?: UseMutationOptions<
    HttpTypes.AdminExportProductResponse,
    FetchError,
    HttpTypes.AdminExportProductRequest
  >
) => {
  return useMutation({
    mutationFn: payload => sdk.admin.product.export(payload, query),
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useImportProducts = (
  options?: UseMutationOptions<
    HttpTypes.AdminImportProductResponse,
    FetchError,
    HttpTypes.AdminImportProductRequest
  >
) => {
  return useMutation({
    mutationFn: payload => sdk.admin.product.createImport(payload),
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useConfirmImportProducts = (
  options?: UseMutationOptions<Record<string, never>, FetchError, string>
) => {
  return useMutation({
    mutationFn: payload => sdk.admin.product.confirmImport(payload),
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useProductAttributes = (id: string) => {
  const { data, ...rest } = useQuery<{ attributes: AttributeDTO[] }>({
    queryFn: () =>
      sdk.client.fetch(`/admin/products/${id}/applicable-attributes`, {
        method: 'GET'
      }),
    queryKey: ['product', id, 'product-attributes']
  });

  return { data, ...rest };
};
