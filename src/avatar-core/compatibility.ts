/**
 * avatar-core / compatibility & equipping
 *
 * Pure, immutable equip logic. Every function returns a new AvatarConfig and
 * never mutates its input, so it is safe to use directly in reducers/stores.
 */

import type { AvatarCatalog, AvatarConfig, AvatarItem, AvatarSlot } from './types';

export const isItemCompatible = (item: AvatarItem, bodyType: string): boolean =>
  !item.compatibleBodyTypes || item.compatibleBodyTypes.includes(bodyType);

export type EquipCheck = { ok: true } | { ok: false; reason: string };

export const canEquip = (config: AvatarConfig, catalog: AvatarCatalog, itemId: string): EquipCheck => {
  const item = catalog.byId[itemId];
  if (!item) return { ok: false, reason: 'unknown-item' };
  if (!isItemCompatible(item, config.selection.body)) return { ok: false, reason: 'incompatible-body' };
  return { ok: true };
};

const withUpdatedAt = (config: AvatarConfig): AvatarConfig => ({ ...config, updatedAt: Date.now() });

/**
 * Equip an item into its slot. Single slots replace the current value;
 * `accessories` toggles (equip if absent, remove if present). Incompatible or
 * unknown items return the config unchanged.
 */
export const equipItem = (config: AvatarConfig, catalog: AvatarCatalog, itemId: string): AvatarConfig => {
  const item = catalog.byId[itemId];
  if (!item || !isItemCompatible(item, config.selection.body)) return config;

  if (item.slot === 'accessories') {
    const has = config.selection.accessories.includes(itemId);
    const accessories = has
      ? config.selection.accessories.filter((a) => a !== itemId)
      : [...config.selection.accessories, itemId];
    return withUpdatedAt({ ...config, selection: { ...config.selection, accessories } });
  }

  const slot = item.slot as Exclude<AvatarSlot, 'accessories'>;
  return withUpdatedAt({ ...config, selection: { ...config.selection, [slot]: itemId } });
};

/** The item id currently equipped in a single slot (null for accessories). */
export const equippedIn = (config: AvatarConfig, slot: AvatarSlot): string | null => {
  if (slot === 'accessories') return null;
  return config.selection[slot as Exclude<AvatarSlot, 'accessories'>] ?? null;
};
