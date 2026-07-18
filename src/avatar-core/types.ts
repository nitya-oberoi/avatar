/**
 * avatar-core / types
 *
 * Framework-free canonical model for an AvatarVerse-style layered avatar.
 * Pure TypeScript only — no React, DOM, Canvas, Next, or platform globals —
 * so it is reusable as-is in web, React Native, Expo, and game runtimes.
 *
 * The existing app config (selection + colors) is the canonical avatar shape;
 * we re-export it here and layer the spec's richer catalog/slot metadata on top
 * rather than inventing a second, incompatible AvatarConfig.
 */

// Re-export the existing pure avatar config types as the canonical model.
export type {
  AvatarConfig,
  AvatarColors,
  AvatarSelection,
  AvatarPreset,
  HexColor,
} from '../types/avatar';

// A customization slot. Single-value slots hold one item id; `accessories`
// is the one multi-value slot (an avatar can wear several at once).
export type AvatarSlot = 'body' | 'head' | 'hair' | 'outfit' | 'expression' | 'accessories';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * A cosmetic catalog item. Extends the app's lightweight trait option with the
 * commerce/rarity metadata a social platform needs.
 */
export interface AvatarItem {
  id: string;
  name: string;
  slot: AvatarSlot;
  /** Draw order within the avatar; lower renders first (further back). */
  layer: number;
  icon?: string;
  thumbnailUrl?: string;
  rarity: Rarity;
  isPremium: boolean;
  price?: number;
  /** Palette keys this item recolours, e.g. ['hairColor']. */
  colorKeys?: string[];
  /** Body types this item is compatible with; omit = all. */
  compatibleBodyTypes?: string[];
  tags?: string[];
}

/** All items grouped by slot, plus a flat id lookup. */
export interface AvatarCatalog {
  slots: AvatarSlot[];
  items: AvatarItem[];
  bySlot: Record<AvatarSlot, AvatarItem[]>;
  byId: Record<string, AvatarItem>;
}
