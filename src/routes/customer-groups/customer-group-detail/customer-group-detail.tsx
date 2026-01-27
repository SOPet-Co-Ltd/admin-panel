import { useLoaderData, useParams } from 'react-router-dom';

import { SingleColumnPageSkeleton } from '../../../components/common/skeleton';
import { SingleColumnPage } from '../../../components/layout/pages';
import { useCustomerGroup } from '../../../hooks/api/customer-groups';
import { useExtension } from '../../../providers/extension-provider';
import { CustomerGroupCustomerSection } from './components/customer-group-customer-section';
import { CustomerGroupGeneralSection } from './components/customer-group-general-section';
import { CUSTOMER_GROUP_DETAIL_FIELDS } from './constants';
import { customerGroupLoader } from './loader';

export const CustomerGroupDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof customerGroupLoader>>;

  const { id } = useParams();
  const { customer_group, isLoading, isError, error } = useCustomerGroup(
    id!,
    {
      fields: CUSTOMER_GROUP_DETAIL_FIELDS
    },
    { initialData }
  );

  const { getWidgets } = useExtension();

  if (isLoading || !customer_group) {
    return (
      <SingleColumnPageSkeleton
        sections={2}
        showJSON
        showMetadata
      />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets('customer_group.details.before'),
        after: getWidgets('customer_group.details.after')
      }}
      showJSON
      showMetadata
      data={customer_group}
    >
      <CustomerGroupGeneralSection group={customer_group} />
      <CustomerGroupCustomerSection group={customer_group} />
    </SingleColumnPage>
  );
};
