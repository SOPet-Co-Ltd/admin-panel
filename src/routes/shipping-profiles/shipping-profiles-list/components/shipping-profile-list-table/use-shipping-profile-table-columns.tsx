import { useMemo } from 'react';

import { HttpTypes } from '@medusajs/types';
import { createDataTableColumnHelper, StatusBadge } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

import { PlaceholderCell } from '../../../../../components/table/table-cells/common/placeholder-cell';

const columnHelper = createDataTableColumnHelper<HttpTypes.AdminShippingProfile>();

export const useShippingProfileTableColumns = () => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('fields.name'),
        cell: ({ getValue }) => {
          const name = getValue();
          if (!name) {
            return <PlaceholderCell />;
          }

          return <span className="text-small truncate text-ui-fg-subtle">{name}</span>;
        }
      }),
      columnHelper.accessor('type', {
        header: t('fields.type'),
        cell: ({ getValue }) => {
          const type = getValue();
          if (!type) {
            return <PlaceholderCell />;
          }

          return (
            <StatusBadge color="grey">
              <span className="capitalize">{type}</span>
            </StatusBadge>
          );
        }
      }),
      columnHelper.accessor('created_at', {
        header: t('fields.createdAt'),
        cell: ({ getValue }) => {
          const createdAt = getValue();
          if (!createdAt) {
            return <PlaceholderCell />;
          }

          return (
            <span className="text-small text-ui-fg-subtle">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          );
        }
      }),
      columnHelper.accessor('updated_at', {
        header: t('fields.updatedAt'),
        cell: ({ getValue }) => {
          const updatedAt = getValue();
          if (!updatedAt) {
            return <PlaceholderCell />;
          }

          return (
            <span className="text-small text-ui-fg-subtle">
              {new Date(updatedAt).toLocaleDateString()}
            </span>
          );
        }
      })
    ],
    [t]
  );
};
