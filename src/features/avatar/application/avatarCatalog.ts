/**
 * features/avatar/application / composition root
 *
 * Wires the app's existing trait data ([config/defaults] traitCatalog) into the
 * framework-free avatar-core. This is the ONLY place the core meets the app's
 * catalog source, so there is a single source of truth and core stays portable.
 *
 * Premium/rarity metadata lives here as overrides — cosmetics are not hardcoded
 * inside UI components.
 */

import {
  buildCatalog,
  createDefaultAvatar,
  type AvatarConfig,
  type BuildOptions,
  type ItemMetaOverrides,
} from '@/avatar-core';
import { traitCatalog, defaultColors } from '@config/defaults';

/** Commerce/rarity metadata for specific cosmetics (extend freely). */
const ITEM_META: ItemMetaOverrides = {
  acc_crown: { rarity: 'legendary', isPremium: true, price: 500 },
  acc_tiara: { rarity: 'epic', isPremium: true, price: 300 },
  acc_helmet: { rarity: 'rare', isPremium: true, price: 150 },
  outfit_futuristic: { rarity: 'epic', isPremium: true, price: 250 },
  outfit_magical: { rarity: 'rare' },
};

export const appCatalog = buildCatalog(traitCatalog, ITEM_META);

export const appDefaultColors = defaultColors;

export const makeDefaultAvatar = (opts?: BuildOptions): AvatarConfig =>
  createDefaultAvatar(appCatalog, appDefaultColors, opts);
