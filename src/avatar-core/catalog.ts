/**
 * avatar-core / catalog
 *
 * Builds a typed AvatarCatalog from raw trait data. Data is INJECTED (not
 * imported from the app) so core stays portable — the app calls buildCatalog
 * with its own catalog source, and there is a single source of truth.
 */

import type { AvatarCatalog, AvatarItem, AvatarSlot, Rarity } from './types';
import { AVATAR_SLOTS, layerOf } from './layers';

/** Minimal shape each raw trait entry must provide. */
export interface RawTrait {
  id: string;
  name: string;
  icon?: string;
}

/** Raw catalog grouped by the app's category keys. */
export interface RawCatalog {
  bodies: RawTrait[];
  heads: RawTrait[];
  hair: RawTrait[];
  tops: RawTrait[];
  bottoms: RawTrait[];
  shoes: RawTrait[];
  accessories: RawTrait[];
  expressions: RawTrait[];
}

/** Per-item metadata overrides, keyed by item id (rarity/premium/price/layer/etc.). */
export type ItemMetaOverrides = Record<string, Partial<Omit<AvatarItem, 'id' | 'name' | 'slot'>>>;

const SLOT_COLOR_KEYS: Partial<Record<AvatarSlot, string[]>> = {
  hair: ['hairColor'],
  top: ['outfitPrimary'],
  bottom: ['outfitSecondary'],
  shoes: ['accentColor'],
  accessories: ['accentColor'],
  head: ['skinTone'],
};

const RARITY_BY_SLOT: Partial<Record<AvatarSlot, Rarity>> = {};

const toItems = (
  raw: RawTrait[],
  slot: AvatarSlot,
  overrides: ItemMetaOverrides,
): AvatarItem[] =>
  raw.map((t) => {
    const o = overrides[t.id] ?? {};
    return {
      id: t.id,
      name: t.name,
      slot,
      layer: o.layer ?? layerOf(slot),
      icon: t.icon,
      rarity: o.rarity ?? RARITY_BY_SLOT[slot] ?? 'common',
      isPremium: o.isPremium ?? false,
      price: o.price,
      colorKeys: o.colorKeys ?? SLOT_COLOR_KEYS[slot],
      compatibleBodyTypes: o.compatibleBodyTypes,
      tags: o.tags,
    };
  });

export const buildCatalog = (raw: RawCatalog, overrides: ItemMetaOverrides = {}): AvatarCatalog => {
  const items: AvatarItem[] = [
    ...toItems(raw.bodies, 'body', overrides),
    ...toItems(raw.heads, 'head', overrides),
    ...toItems(raw.hair, 'hair', overrides),
    ...toItems(raw.tops, 'top', overrides),
    ...toItems(raw.bottoms, 'bottom', overrides),
    ...toItems(raw.shoes, 'shoes', overrides),
    ...toItems(raw.accessories, 'accessories', overrides),
    ...toItems(raw.expressions, 'expression', overrides),
  ];

  const bySlot = AVATAR_SLOTS.reduce((acc, slot) => {
    acc[slot] = items.filter((i) => i.slot === slot);
    return acc;
  }, {} as Record<AvatarSlot, AvatarItem[]>);

  const byId = items.reduce<Record<string, AvatarItem>>((acc, i) => {
    acc[i.id] = i;
    return acc;
  }, {});

  return { slots: AVATAR_SLOTS, items, bySlot, byId };
};

export const findItem = (catalog: AvatarCatalog, id: string): AvatarItem | undefined => catalog.byId[id];
