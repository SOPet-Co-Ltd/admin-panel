import * as zod from 'zod';

import { ShippingOptionPriceType } from '../../../common/constants';
import { ConditionalPriceSchema } from '../../../common/schema';

export const CreateShippingOptionSchema = zod.object({
  price_type: zod.nativeEnum(ShippingOptionPriceType).optional(),
  name: zod.string().min(1),
  shipping_profile_id: zod.string().min(1),
  shipping_option_type_id: zod.string().min(1),
  provider_id: zod.string().min(1),
  fulfillment_option_id: zod.string().min(1),
  enabled_in_store: zod.boolean().default(false),
  region_prices: zod
    .record(zod.string(), zod.union([zod.string(), zod.number()]).optional())
    .optional(),
  currency_prices: zod
    .record(zod.string(), zod.union([zod.string(), zod.number()]).optional())
    .optional(),
  conditional_region_prices: zod.record(zod.string(), zod.array(ConditionalPriceSchema)).optional(),
  conditional_currency_prices: zod
    .record(zod.string(), zod.array(ConditionalPriceSchema))
    .optional()
});

export type CreateShippingOptionSchemaType = zod.infer<typeof CreateShippingOptionSchema>;
