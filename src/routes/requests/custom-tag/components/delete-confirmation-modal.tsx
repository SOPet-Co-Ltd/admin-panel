import { Prompt, Text } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

import type { AffectedProduct } from '@/hooks/api';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  affectedProducts: AffectedProduct[];
  isLoading: boolean;
  tagCount: number;
}

export const DeleteConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  affectedProducts,
  isLoading,
  tagCount
}: DeleteConfirmationModalProps) => {
  const { t } = useTranslation();

  return (
    <Prompt
      open={open}
      onOpenChange={onClose}
    >
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>{t('customTags.delete.confirmTitle')}</Prompt.Title>
          <Prompt.Description>
            {tagCount === 1
              ? t('customTags.delete.confirmSingle')
              : t('customTags.delete.confirmMultiple', { count: tagCount })}
          </Prompt.Description>
        </Prompt.Header>

        {affectedProducts.length > 0 && (
          <div className="mt-4">
            <Text className="mb-2 font-medium">
              {t('customTags.delete.affectedProducts', { count: affectedProducts.length })}:
            </Text>
            <div className="max-h-60 overflow-y-auto rounded-md border p-3">
              <ul className="space-y-2">
                {affectedProducts.map(product => (
                  <li
                    key={product.id}
                    className="flex items-center gap-2"
                  >
                    {product.thumbnail && (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    <Text className="text-sm">{product.title}</Text>
                  </li>
                ))}
              </ul>
            </div>
            <Text className="mt-2 text-sm text-ui-fg-subtle">
              {t('customTags.delete.warningMessage')}
            </Text>
          </div>
        )}

        <Prompt.Footer>
          <Prompt.Cancel onClick={onClose}>{t('actions.cancel')}</Prompt.Cancel>
          <Prompt.Action
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? t('actions.deleting') : t('actions.delete')}
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};
