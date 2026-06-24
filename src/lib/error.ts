import { FetchError } from '@medusajs/js-sdk';

export function getErrorMessage(err: unknown, fallback = 'Unknown error'): string {
  if (err instanceof FetchError || err instanceof Error) {
    return err.message || fallback;
  }
  if (typeof err === 'string') {
    return err;
  }
  if (err !== null && typeof err === 'object') {
    if ('error' in err && typeof (err as { error: unknown }).error === 'string') {
      return (err as { error: string }).error;
    }
    if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
      return (err as { message: string }).message;
    }
  }
  return fallback;
}
