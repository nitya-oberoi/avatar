/**
 * avatar-core / unlock & commerce rules
 *
 * Pure predicates for gating premium cosmetics. The platform passes the user's
 * unlocked item ids; core decides what is wearable/purchasable.
 */

import type { AvatarItem } from './types';

/** Free items are always unlocked; premium items require ownership. */
export const isUnlocked = (item: AvatarItem, unlockedItemIds: readonly string[]): boolean =>
  !item.isPremium || unlockedItemIds.includes(item.id);

export const isPurchasable = (item: AvatarItem, unlockedItemIds: readonly string[]): boolean =>
  item.isPremium && !unlockedItemIds.includes(item.id) && typeof item.price === 'number';

export const priceOf = (item: AvatarItem): number => item.price ?? 0;

export const canAfford = (item: AvatarItem, coinBalance: number): boolean => priceOf(item) <= coinBalance;
