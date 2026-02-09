import { useMemo, useState } from 'react';

import { ArchiveBox, Map, TriangleDownMini } from '@medusajs/icons';
import type { HttpTypes } from '@medusajs/types';
import { Badge, Container, Divider, Heading, IconButton, StatusBadge, Text } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

import { ActionMenu } from '../../../../../components/common/action-menu';
import { NoRecords } from '../../../../../components/common/empty-table-content';
import { IconAvatar } from '../../../../../components/common/icon-avatar';
import { ListSummary } from '../../../../../components/common/list-summary';
import { getFormattedAddress } from '../../../../../lib/addresses';
import { countries as staticCountries, StaticCountry } from '../../../../../lib/data/countries';
import { formatProvider } from '../../../../../lib/format-provider';
import { isOptionEnabledInStore, isReturnOption } from '../../../../../lib/shipping-options';
import { FulfillmentSetType } from '../../../common/constants';

type LocationGeneralSectionProps = {
  location: HttpTypes.AdminStockLocation;
};

export const LocationGeneralSection = ({ location }: LocationGeneralSectionProps) => {
  return (
    <>
      <Container
        className="p-0"
        data-testid="location-general-section-container"
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          data-testid="location-general-section-header"
        >
          <div data-testid="location-general-section-info">
            <Heading data-testid="location-general-section-heading">{location.name}</Heading>
            <Text
              className="txt-small text-ui-fg-subtle"
              data-testid="location-general-section-address"
            >
              {getFormattedAddress({ address: location.address }).join(', ')}
            </Text>
          </div>
          <Actions location={location} />
        </div>
      </Container>

      <FulfillmentSet
        locationId={location.id}
        locationName={location.name}
        type={FulfillmentSetType.Pickup}
        fulfillmentSet={location.fulfillment_sets?.find(f => f.type === FulfillmentSetType.Pickup)}
      />

      <FulfillmentSet
        locationId={location.id}
        locationName={location.name}
        type={FulfillmentSetType.Shipping}
        fulfillmentSet={location.fulfillment_sets?.find(
          f => f.type === FulfillmentSetType.Shipping
        )}
      />
    </>
  );
};

type ShippingOptionProps = {
  option: HttpTypes.AdminShippingOption;
  fulfillmentSetId: string;
  locationId: string;
};

function ShippingOption({ option, fulfillmentSetId, locationId }: ShippingOptionProps) {
  const { t } = useTranslation();

  const isStoreOption = isOptionEnabledInStore(option);

  // Admins can only view shipping options for oversight, not edit or delete them
  // Vendors manage their own shipping options
  return (
    <div
      className="flex items-center justify-between px-3 py-2"
      data-testid={`location-shipping-option-${option.id}`}
    >
      <div
        className="flex-1"
        data-testid={`location-shipping-option-name-${option.id}`}
      >
        <Text
          size="small"
          weight="plus"
        >
          {option.name} - {option.shipping_profile.name} ({formatProvider(option.provider_id)})
        </Text>
      </div>
      <Badge
        className="mr-4"
        color={isStoreOption ? 'grey' : 'purple'}
        size="2xsmall"
        rounded="full"
        data-testid={`location-shipping-option-badge-${option.id}`}
      >
        {isStoreOption ? t('general.store') : t('general.admin')}
      </Badge>
    </div>
  );
}

type ServiceZoneOptionsProps = {
  zone: HttpTypes.AdminServiceZone;
  locationId: string;
  fulfillmentSetId: string;
  type: FulfillmentSetType;
};

function ServiceZoneOptions({ zone, locationId, fulfillmentSetId, type }: ServiceZoneOptionsProps) {
  const { t } = useTranslation();

  const shippingOptions = zone.shipping_options.filter(o => !isReturnOption(o));

  const returnOptions = zone.shipping_options.filter(o => isReturnOption(o));

  // Admins can only view shipping options for oversight, not create them
  // Vendors manage their own shipping options
  return (
    <div data-testid={`location-service-zone-options-${zone.id}`}>
      <Divider variant="dashed" />
      <div
        className="flex flex-col gap-y-4 px-6 py-4"
        data-testid={`location-service-zone-shipping-options-${zone.id}`}
      >
        <div
          className="item-center flex justify-between"
          data-testid={`location-service-zone-shipping-options-header-${zone.id}`}
        >
          <span
            className="txt-small self-center font-medium text-ui-fg-subtle"
            data-testid={`location-service-zone-shipping-options-label-${zone.id}`}
          >
            {t(`stockLocations.shippingOptions.create.${type}.label`)}
          </span>
        </div>

        {!!shippingOptions.length && (
          <div
            className="grid divide-y rounded-md bg-ui-bg-subtle shadow-elevation-card-rest"
            data-testid={`location-service-zone-shipping-options-list-${zone.id}`}
          >
            {shippingOptions.map(o => (
              <ShippingOption
                key={o.id}
                option={o}
                locationId={locationId}
                fulfillmentSetId={fulfillmentSetId}
              />
            ))}
          </div>
        )}
      </div>

      <Divider variant="dashed" />

      <div
        className="flex flex-col gap-y-4 px-6 py-4"
        data-testid={`location-service-zone-return-options-${zone.id}`}
      >
        <div
          className="item-center flex justify-between"
          data-testid={`location-service-zone-return-options-header-${zone.id}`}
        >
          <span
            className="txt-small self-center font-medium text-ui-fg-subtle"
            data-testid={`location-service-zone-return-options-label-${zone.id}`}
          >
            {t('stockLocations.shippingOptions.create.returns.label')}
          </span>
        </div>

        {!!returnOptions.length && (
          <div
            className="grid divide-y rounded-md bg-ui-bg-subtle shadow-elevation-card-rest"
            data-testid={`location-service-zone-return-options-list-${zone.id}`}
          >
            {returnOptions.map(o => (
              <ShippingOption
                key={o.id}
                option={o}
                locationId={locationId}
                fulfillmentSetId={fulfillmentSetId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type ServiceZoneProps = {
  zone: HttpTypes.AdminServiceZone;
  locationId: string;
  fulfillmentSetId: string;
  type: FulfillmentSetType;
};

function ServiceZone({ zone, locationId, fulfillmentSetId, type }: ServiceZoneProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  // Admins can only view service zones for oversight, not edit or delete them
  // Vendors manage their own service zones

  const countries = useMemo(() => {
    const countryGeoZones = zone.geo_zones.filter(g => g.type === 'country');

    const countries = countryGeoZones
      .map(({ country_code }) => staticCountries.find(c => c.iso_2 === country_code))
      .filter(c => !!c) as StaticCountry[];

    if (process.env.NODE_ENV === 'development' && countryGeoZones.length !== countries.length) {
      console.warn(
        'Some countries are missing in the static countries list',
        countryGeoZones
          .filter(g => !countries.find(c => c.iso_2 === g.country_code))
          .map(g => g.country_code)
      );
    }

    return countries.sort((c1, c2) => c1.name.localeCompare(c2.name));
  }, [zone.geo_zones]);

  const [shippingOptionsCount, returnOptionsCount] = useMemo(() => {
    const options = zone.shipping_options;

    const optionsCount = options.filter(o => !isReturnOption(o)).length;

    const returnOptionsCount = options.filter(isReturnOption).length;

    return [optionsCount, returnOptionsCount];
  }, [zone.shipping_options]);

  return (
    <div
      className="flex flex-col"
      data-testid={`location-service-zone-${zone.id}`}
    >
      <div
        className="flex flex-row items-center justify-between gap-x-4 px-6 py-4"
        data-testid={`location-service-zone-header-${zone.id}`}
      >
        <IconAvatar data-testid={`location-service-zone-icon-${zone.id}`}>
          <Map />
        </IconAvatar>

        <div
          className="grow-1 flex flex-1 flex-col"
          data-testid={`location-service-zone-info-${zone.id}`}
        >
          <Text
            size="small"
            leading="compact"
            weight="plus"
            data-testid={`location-service-zone-name-${zone.id}`}
          >
            {zone.name}
          </Text>
          <div
            className="flex items-center gap-2"
            data-testid={`location-service-zone-details-${zone.id}`}
          >
            <ListSummary
              variant="base"
              list={countries.map(c => c.display_name)}
              inline
              n={1}
              data-testid={`location-service-zone-countries-${zone.id}`}
            />
            <span>·</span>
            <Text
              className="txt-small text-ui-fg-subtle"
              data-testid={`location-service-zone-shipping-count-${zone.id}`}
            >
              {t(`stockLocations.shippingOptions.fields.count.${type}`, {
                count: shippingOptionsCount
              })}
            </Text>
            <span>·</span>
            <Text
              className="txt-small text-ui-fg-subtle"
              data-testid={`location-service-zone-return-count-${zone.id}`}
            >
              {t('stockLocations.shippingOptions.fields.count.returns', {
                count: returnOptionsCount
              })}
            </Text>
          </div>
        </div>

        <div
          className="flex grow-0 items-center gap-4"
          data-testid={`location-service-zone-actions-${zone.id}`}
        >
          <IconButton
            size="small"
            onClick={() => setOpen(s => !s)}
            variant="transparent"
            data-testid={`location-service-zone-toggle-button-${zone.id}`}
          >
            <TriangleDownMini
              style={{
                transform: `rotate(${!open ? 0 : 180}deg)`,
                transition: '.2s transform ease-in-out'
              }}
            />
          </IconButton>
          {/* Admins can only view service zones for oversight, not edit or delete them */}
        </div>
      </div>
      {open && (
        <ServiceZoneOptions
          fulfillmentSetId={fulfillmentSetId}
          locationId={locationId}
          type={type}
          zone={zone}
        />
      )}
    </div>
  );
}

type FulfillmentSetProps = {
  fulfillmentSet?: HttpTypes.AdminFulfillmentSet;
  locationName: string;
  locationId: string;
  type: FulfillmentSetType;
};

function FulfillmentSet(props: FulfillmentSetProps) {
  const { t } = useTranslation();

  const { fulfillmentSet, locationName, locationId, type } = props;

  const fulfillmentSetExists = !!fulfillmentSet;

  const hasServiceZones = !!fulfillmentSet?.service_zones.length;

  // Admins can only view fulfillment sets for oversight, not create/edit/delete them
  // Vendors manage their own fulfillment sets

  return (
    <Container
      className="p-0"
      data-testid={`location-fulfillment-set-${type}`}
    >
      <div className="flex flex-col divide-y">
        <div
          className="flex items-center justify-between px-6 py-4"
          data-testid={`location-fulfillment-set-header-${type}`}
        >
          <Heading
            level="h2"
            data-testid={`location-fulfillment-set-heading-${type}`}
          >
            {t(`stockLocations.fulfillmentSets.${type}.header`)}
          </Heading>
          <div
            className="flex items-center gap-4"
            data-testid={`location-fulfillment-set-actions-${type}`}
          >
            <StatusBadge
              color={fulfillmentSetExists ? 'green' : 'grey'}
              data-testid={`location-fulfillment-set-status-badge-${type}`}
            >
              {t(fulfillmentSetExists ? 'statuses.enabled' : 'statuses.disabled')}
            </StatusBadge>

            {/* Admins can only view fulfillment sets for oversight, not manage them */}
          </div>
        </div>

        {fulfillmentSetExists && !hasServiceZones && (
          <div
            className="flex items-center justify-center py-8 pt-6"
            data-testid={`location-fulfillment-set-empty-${type}`}
          >
            <NoRecords
              message={t('stockLocations.serviceZones.fields.noRecords')}
              className="h-fit"
              action={{
                to: `/settings/locations/${locationId}/fulfillment-set/${fulfillmentSet.id}/service-zones/create`,
                label: t('stockLocations.serviceZones.create.action')
              }}
            />
          </div>
        )}

        {hasServiceZones && (
          <div
            className="flex flex-col divide-y"
            data-testid={`location-fulfillment-set-service-zones-${type}`}
          >
            {fulfillmentSet?.service_zones.map(zone => (
              <ServiceZone
                zone={zone}
                type={type}
                key={zone.id}
                locationId={locationId}
                fulfillmentSetId={fulfillmentSet.id}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

const Actions = ({ location }: { location: HttpTypes.AdminStockLocation }) => {
  const { t } = useTranslation();

  // Admins can only view locations for oversight, not edit or delete them
  // Vendors manage their own locations
  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              icon: <ArchiveBox />,
              label: t('stockLocations.edit.viewInventory'),
              to: `/inventory?location_id=${location.id}`
            }
          ]
        }
      ]}
      data-testid="location-general-section-action-menu"
    />
  );
};
