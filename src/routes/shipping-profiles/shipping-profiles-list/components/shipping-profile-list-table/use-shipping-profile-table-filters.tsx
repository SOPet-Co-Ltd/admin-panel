import { useTranslation } from 'react-i18next';

import { Filter } from '../../../../../components/table/data-table';

export const useShippingProfileTableFilters = () => {
  const { t } = useTranslation();

  const filters: Filter[] = [
    {
      type: 'select',
      options: [
        { label: t('shippingProfile.types.default'), value: 'default' },
        { label: t('shippingProfile.types.custom'), value: 'custom' },
        { label: t('shippingProfile.types.gift_card'), value: 'gift_card' }
      ],
      key: 'type',
      label: t('fields.type')
    },
    {
      type: 'date',
      key: 'created_at',
      label: t('fields.createdAt')
    }
  ];

  return filters;
};
