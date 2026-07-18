/**
 * features/avatar/application / creator categories
 *
 * The sidebar sections shown in the creator, mapped to what our SVG avatar
 * actually supports. `slot` drives the item grid; `colorKeys` drive the colour
 * swatches. Colour-only sections (skin, eyes) have no slot.
 */

import type { AvatarSlot, AvatarColors } from '@/avatar-core';
import { skinTones, hairColors, eyeColors } from '@config/defaults';

export interface CreatorCategory {
  id: string;
  label: string;
  icon: string;
  /** Catalog slot whose items fill the grid (omit for colour-only sections). */
  slot?: AvatarSlot;
  /** Palette keys editable in this section. */
  colorKeys?: (keyof AvatarColors)[];
}

export const CREATOR_CATEGORIES: CreatorCategory[] = [
  { id: 'body', label: 'Body', icon: '🧍', slot: 'body' },
  { id: 'head', label: 'Head', icon: '🥚', slot: 'head' },
  { id: 'skin', label: 'Skin', icon: '🎨', colorKeys: ['skinTone'] },
  { id: 'hair', label: 'Hair', icon: '💇', slot: 'hair', colorKeys: ['hairColor'] },
  { id: 'face', label: 'Face', icon: '😀', slot: 'expression' },
  { id: 'eyes', label: 'Eyes', icon: '👁️', colorKeys: ['eyeColor'] },
  { id: 'top', label: 'Top', icon: '👕', slot: 'top', colorKeys: ['outfitPrimary'] },
  { id: 'bottom', label: 'Bottom', icon: '👖', slot: 'bottom', colorKeys: ['outfitSecondary'] },
  { id: 'shoes', label: 'Shoes', icon: '👟', slot: 'shoes', colorKeys: ['accentColor'] },
  { id: 'accessories', label: 'Accessories', icon: '🧢', slot: 'accessories' },
];

/** Fashion colours for garment keys. */
const FASHION_SWATCHES: string[] = [
  '#FFFFFF', '#ECF0F1', '#2B2B2B', '#2C3E50', '#39518F', '#5B7CFA',
  '#1E88E5', '#16A085', '#2ECC71', '#F5C542', '#FF8C42', '#E74C3C',
  '#E84393', '#FF6B9D', '#9B59B6', '#7C3AED',
];

/** Each colour key gets a swatch set that makes sense for it. */
export const SWATCHES_BY_KEY: Record<keyof AvatarColors, string[]> = {
  skinTone: skinTones,
  hairColor: hairColors,
  eyeColor: eyeColors,
  outfitPrimary: FASHION_SWATCHES,
  outfitSecondary: FASHION_SWATCHES,
  accentColor: FASHION_SWATCHES,
};
