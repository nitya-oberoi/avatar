/**
 * avatar-core / layers
 *
 * Canonical slot list and back→front layer order. A layered (PNG/sprite/mobile)
 * renderer stacks slots in this order; the current SVG renderer has its own
 * internal ordering but shares this logical model. Adding a slot here does not
 * require touching any renderer that reads the order from this array.
 */

import type { AvatarSlot } from './types';

export const AVATAR_SLOTS: AvatarSlot[] = ['body', 'head', 'hair', 'top', 'bottom', 'shoes', 'expression', 'accessories'];

/** Slots that hold a single item; `accessories` is excluded (multi-value). */
export const SINGLE_SLOTS: Exclude<AvatarSlot, 'accessories'>[] = [
  'body',
  'head',
  'hair',
  'top',
  'bottom',
  'shoes',
  'expression',
];

/** Back→front draw order. Lower index = drawn first (furthest back). */
export const AVATAR_LAYER_ORDER: AvatarSlot[] = [
  'body',
  'bottom',
  'shoes',
  'top',
  'head',
  'expression',
  'hair',
  'accessories',
];

/** Layer index for a slot (used to sort catalog items). */
export const layerOf = (slot: AvatarSlot): number => {
  const i = AVATAR_LAYER_ORDER.indexOf(slot);
  return i === -1 ? AVATAR_LAYER_ORDER.length : i;
};
