/**
 * features/avatar/application / creator categories
 *
 * The sidebar sections shown in the creator, mapped to what our SVG avatar
 * actually supports. `slot` drives the item grid; `colorKeys` drive the colour
 * swatches. Colour-only sections (skin, eyes) have no slot.
 */

import type { AvatarSlot, AvatarColors } from '@/avatar-core';

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

/** Swatch palette offered for every colour key (extend freely). */
export const COLOR_SWATCHES: string[] = [
  '#2B2B2B', '#5C3A21', '#E8B4A0', '#F0C0A0', '#8D5524', '#C68642',
  '#3D2817', '#7C3AED', '#1E88E5', '#16A085', '#E74C3C', '#F5C542',
  '#FF6B9D', '#FFFFFF',
];
