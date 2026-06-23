import { useEffect, useState } from 'react';

import { usePromotionSettings, useUpdatePromotionSettings } from '@hooks/api/promotion-settings';
import { Container, Heading, Label, StatusBadge, Switch, Table, Text, toast } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

export const PromotionSettingsPage = () => {
  const { t } = useTranslation();
  const { data, isLoading } = usePromotionSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdatePromotionSettings();
  const [isPromotionAutoApply, setIsPromotionAutoApply] = useState(false);

  useEffect(() => {
    if (data) {
      setIsPromotionAutoApply(data.is_promotion_auto_apply);
    }
  }, [data]);

  const handleToggle = async (checked: boolean) => {
    setIsPromotionAutoApply(checked);

    try {
      await updateSettings({ is_promotion_auto_apply: checked });
      toast.success(t('promotionSettings.toast.updateSuccess'));
    } catch (error) {
      setIsPromotionAutoApply(!checked);
      toast.error(
        error instanceof Error ? error.message : t('promotionSettings.toast.updateError')
      );
    }
  };

  const isBusy = isLoading || isPending;

  return (
    <Container
      className="divide-y p-0"
      data-testid="promotion-settings-container"
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        data-testid="promotion-settings-header"
      >
        <div>
          <Heading
            level="h1"
            data-testid="promotion-settings-heading"
          >
            {t('promotionSettings.domain')}
          </Heading>
          <Text
            size="small"
            className="text-ui-fg-subtle"
            data-testid="promotion-settings-subtitle"
          >
            {t('promotionSettings.subtitle')}
          </Text>
        </div>
      </div>

      <div
        className="px-6 py-6"
        data-testid="promotion-settings-body"
      >
        <Table data-testid="promotion-settings-status-table">
          <Table.Body>
            <Table.Row data-testid="promotion-settings-status-row">
              <Table.Cell data-testid="promotion-settings-status-label">
                {t('promotionSettings.status.autoApply')}
              </Table.Cell>
              <Table.Cell data-testid="promotion-settings-status-value">
                {isLoading ? (
                  <Text size="small">{t('promotionSettings.loading')}</Text>
                ) : isPromotionAutoApply ? (
                  <StatusBadge color="green">{t('promotionSettings.status.enabled')}</StatusBadge>
                ) : (
                  <StatusBadge color="grey">{t('promotionSettings.status.disabled')}</StatusBadge>
                )}
              </Table.Cell>
            </Table.Row>
            <Table.Row data-testid="promotion-settings-scope-row">
              <Table.Cell data-testid="promotion-settings-scope-label">
                {t('promotionSettings.status.scope')}
              </Table.Cell>
              <Table.Cell data-testid="promotion-settings-scope-value">
                {t('promotionSettings.status.scopeValue')}
              </Table.Cell>
            </Table.Row>
            <Table.Row data-testid="promotion-settings-trigger-row">
              <Table.Cell data-testid="promotion-settings-trigger-label">
                {t('promotionSettings.status.trigger')}
              </Table.Cell>
              <Table.Cell data-testid="promotion-settings-trigger-value">
                {t('promotionSettings.status.triggerValue')}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>

        <div
          className="mt-6 space-y-6"
          data-testid="promotion-settings-sections"
        >
          <section
            className="rounded-lg border border-ui-border-base p-6"
            data-testid="promotion-settings-auto-apply-section"
          >
            <Heading
              level="h2"
              className="mb-2"
            >
              {t('promotionSettings.autoApply.title')}
            </Heading>
            <Text
              size="small"
              className="mb-4 text-ui-fg-subtle"
            >
              {t('promotionSettings.autoApply.subtitle')}
            </Text>

            <div
              className="flex items-start gap-x-3 rounded-lg bg-ui-bg-component p-4 shadow-elevation-card-rest"
              data-testid="promotion-settings-auto-apply-toggle"
            >
              <Switch
                id="promotion-auto-apply"
                className="rtl:rotate-180"
                dir="ltr"
                checked={isPromotionAutoApply}
                disabled={isBusy}
                onCheckedChange={handleToggle}
                data-testid="promotion-settings-auto-apply-switch"
              />
              <div className="flex flex-col gap-y-1">
                <Label
                  htmlFor="promotion-auto-apply"
                  data-testid="promotion-settings-auto-apply-label"
                >
                  {t('promotionSettings.autoApply.toggleLabel')}
                </Label>
                <Text
                  size="small"
                  className="text-ui-fg-subtle"
                  data-testid="promotion-settings-auto-apply-description"
                >
                  {t('promotionSettings.autoApply.toggleDescription')}
                </Text>
              </div>
            </div>
          </section>

          <section
            className="rounded-lg border border-ui-border-base p-6"
            data-testid="promotion-settings-behavior-section"
          >
            <Heading
              level="h2"
              className="mb-2"
            >
              {t('promotionSettings.behavior.title')}
            </Heading>
            <ul className="flex list-disc flex-col gap-y-2 pl-5">
              <li>
                <Text
                  size="small"
                  className="text-ui-fg-subtle"
                >
                  {t('promotionSettings.behavior.stacking')}
                </Text>
              </li>
              <li>
                <Text
                  size="small"
                  className="text-ui-fg-subtle"
                >
                  {t('promotionSettings.behavior.oncePerCheckout')}
                </Text>
              </li>
              <li>
                <Text
                  size="small"
                  className="text-ui-fg-subtle"
                >
                  {t('promotionSettings.behavior.skipManual')}
                </Text>
              </li>
              <li>
                <Text
                  size="small"
                  className="text-ui-fg-subtle"
                >
                  {t('promotionSettings.behavior.customerCanChange')}
                </Text>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Container>
  );
};
