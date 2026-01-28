import Medusa from '@medusajs/js-sdk';

export const backendUrl = __BACKEND_URL__ ?? '/';

const decodeJwt = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));

    return decoded;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string | null) => {
  if (!token) {
    return true;
  }

  const payload = decodeJwt(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 < Date.now();
};

export const getAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem('medusa_auth_token');
};

export const sdk = new Medusa({
  baseUrl: backendUrl
});

// Custom upload function using /admin/media endpoint
export const uploadFilesQuery = async (files: File[]) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token');
  }

  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  return await fetch(`${backendUrl}/admin/media`, {
    method: 'POST',
    body: formData,
    headers: {
      authorization: `Bearer ${token}`
    }
  })
    .then(async res => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to upload files');
      }
      return res.json();
    })
    .catch(error => {
      throw error;
    });
};

// Custom delete function using /admin/media endpoint
export const deleteFilesQuery = async (fileIds: string[]) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token');
  }

  if (!fileIds || fileIds.length === 0) {
    return;
  }

  return await fetch(`${backendUrl}/admin/media`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ids: fileIds })
  })
    .then(async res => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete files');
      }
      return res.json();
    })
    .catch(error => {
      throw error;
    });
};

// useful when you want to call the BE from the console and try things out quickly
if (typeof window !== 'undefined') {
  (window as any).__sdk = sdk;
}
