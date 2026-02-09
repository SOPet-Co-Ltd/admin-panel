import { InventoryItemDTO } from '@medusajs/types';

// Admins can only view inventory for platform oversight, not edit or delete
// Vendors manage their own inventory
export const InventoryActions = ({ item }: { item: InventoryItemDTO }) => {
  // No actions available - read-only view for admins
  return null;
};
