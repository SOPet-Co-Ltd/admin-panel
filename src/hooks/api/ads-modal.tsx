import { backendUrl, getAuthToken, sdk } from '@lib/client';
import { queryKeysFactory } from '@lib/query-key-factory';
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query';

export type AdminAdsModalEntry = {
  id: string;
  file_id: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  image_url?: string | null;
};

export type AdminAdsModalListResponse = {
  ads: AdminAdsModalEntry[];
};

export type AdminAdsModalMutationResponse = {
  ad: AdminAdsModalEntry;
};

export const adsModalQueryKeys = queryKeysFactory('ads_modal');

async function parseAdminError(res: Response): Promise<string> {
  const json = (await res.json().catch(() => ({}))) as { error?: string; message?: string };

  return typeof json.error === 'string'
    ? json.error
    : typeof json.message === 'string'
      ? json.message
      : res.statusText || 'Request failed';
}

function buildAdsModalFormData(
  fields: {
    file?: File | null;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    metadataText: string;
  },
  options: { includeMetadata: 'omit-empty' | 'always' }
): FormData {
  const form = new FormData();

  if (fields.file) {
    form.append('file', fields.file);
  }

  form.append('is_active', fields.is_active ? 'true' : 'false');

  if (fields.starts_at !== null) {
    form.append('starts_at', fields.starts_at);
  } else {
    form.append('starts_at', '');
  }

  if (fields.ends_at !== null) {
    form.append('ends_at', fields.ends_at);
  } else {
    form.append('ends_at', '');
  }

  const trimmed = fields.metadataText.trim();
  if (options.includeMetadata === 'always') {
    form.append('metadata', trimmed);
  } else if (trimmed.length) {
    form.append('metadata', trimmed);
  }

  return form;
}

export async function createAdsModalEntryRequest(fields: {
  file: File;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  metadataText: string;
}): Promise<AdminAdsModalMutationResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token');
  }

  const form = buildAdsModalFormData(
    { ...fields, file: fields.file },
    { includeMetadata: 'omit-empty' }
  );
  const res = await fetch(`${backendUrl}/admin/ads-modal`, {
    method: 'POST',
    body: form,
    headers: {
      authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(await parseAdminError(res));
  }

  return res.json() as Promise<AdminAdsModalMutationResponse>;
}

export async function updateAdsModalEntryRequest(
  id: string,
  fields: {
    file?: File | null;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    metadataText: string;
  }
): Promise<AdminAdsModalMutationResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token');
  }

  const form = buildAdsModalFormData(fields, { includeMetadata: 'always' });
  const res = await fetch(`${backendUrl}/admin/ads-modal/${id}`, {
    method: 'PATCH',
    body: form,
    headers: {
      authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(await parseAdminError(res));
  }

  return res.json() as Promise<AdminAdsModalMutationResponse>;
}

export async function deleteAdsModalEntryRequest(
  id: string
): Promise<{ id: string; deleted: boolean }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token');
  }

  const res = await fetch(`${backendUrl}/admin/ads-modal/${id}`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(await parseAdminError(res));
  }

  return res.json() as Promise<{ id: string; deleted: boolean }>;
}

export const useAdsModalEntries = (
  options?: Omit<
    UseQueryOptions<AdminAdsModalListResponse, Error, AdminAdsModalListResponse>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: adsModalQueryKeys.list(),
    queryFn: () =>
      sdk.client.fetch<AdminAdsModalListResponse>('/admin/ads-modal', {
        method: 'GET'
      }),
    ...options
  });
};

export const useCreateAdsModalEntry = (
  options?: UseMutationOptions<
    AdminAdsModalMutationResponse,
    Error,
    Parameters<typeof createAdsModalEntryRequest>[0]
  >
) => {
  return useMutation({
    mutationFn: createAdsModalEntryRequest,
    ...options
  });
};

export const useUpdateAdsModalEntry = (
  options?: UseMutationOptions<
    AdminAdsModalMutationResponse,
    Error,
    { id: string } & Parameters<typeof updateAdsModalEntryRequest>[1]
  >
) => {
  return useMutation({
    mutationFn: ({ id, ...rest }) => updateAdsModalEntryRequest(id, rest),
    ...options
  });
};

export const useDeleteAdsModalEntry = (
  options?: UseMutationOptions<{ id: string; deleted: boolean }, Error, string>
) => {
  return useMutation({
    mutationFn: deleteAdsModalEntryRequest,
    ...options
  });
};
