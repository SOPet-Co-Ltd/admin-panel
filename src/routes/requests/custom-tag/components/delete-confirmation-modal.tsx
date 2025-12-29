import { Prompt, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import type { AffectedProduct } from "@/hooks/api"

interface DeleteConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  affectedProducts: AffectedProduct[]
  isLoading: boolean
  tagCount: number
}

export const DeleteConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  affectedProducts,
  isLoading,
  tagCount,
}: DeleteConfirmationModalProps) => {
  const { t } = useTranslation()

  return (
    <Prompt open={open} onOpenChange={onClose}>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>{t("customTags.delete.confirmTitle")}</Prompt.Title>
          <Prompt.Description>
            {tagCount === 1
              ? t("customTags.delete.confirmSingle")
              : t("customTags.delete.confirmMultiple", { count: tagCount })}
          </Prompt.Description>
        </Prompt.Header>

        {affectedProducts.length > 0 && (
          <div className="mt-4">
            <Text className="font-medium mb-2">
              {t("customTags.delete.affectedProducts", { count: affectedProducts.length })}:
            </Text>
            <div className="max-h-60 overflow-y-auto border rounded-md p-3">
              <ul className="space-y-2">
                {affectedProducts.map((product) => (
                  <li key={product.id} className="flex items-center gap-2">
                    {product.thumbnail && (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <Text className="text-sm">{product.title}</Text>
                  </li>
                ))}
              </ul>
            </div>
            <Text className="text-sm text-ui-fg-subtle mt-2">
              {t("customTags.delete.warningMessage")}
            </Text>
          </div>
        )}

        <Prompt.Footer>
          <Prompt.Cancel onClick={onClose}>{t("actions.cancel")}</Prompt.Cancel>
          <Prompt.Action onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t("actions.deleting") : t("actions.delete")}
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}
