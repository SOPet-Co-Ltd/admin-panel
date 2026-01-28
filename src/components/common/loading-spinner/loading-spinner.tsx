import { Spinner } from '@medusajs/icons';

export const LoadingSpinner = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="animate-spin text-ui-fg-interactive" />
    </div>
  );
};
