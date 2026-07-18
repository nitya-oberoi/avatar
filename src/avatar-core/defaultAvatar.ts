/**
 * avatar-core / defaultAvatar
 *
 * Builds a valid starting avatar from a catalog. Ids/timestamps are injected so
 * the function stays pure and testable (and SSR-safe when the caller supplies
 * deterministic values).
 */

import type { AvatarCatalog, AvatarColors, AvatarConfig, AvatarSlot } from './types';

export interface BuildOptions {
  id?: string;
  name?: string;
  now?: number;
  gender?: 'male' | 'female';
}

/** Simple id — override via opts for deterministic/SSR use. */
export const simpleId = (): string =>
  `avatar-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const firstId = (catalog: AvatarCatalog, slot: AvatarSlot): string => catalog.bySlot[slot]?.[0]?.id ?? '';

const preferredId = (catalog: AvatarCatalog, slot: AvatarSlot, preferred: string): string =>
  catalog.byId[preferred]?.slot === slot ? preferred : firstId(catalog, slot);

export const createDefaultAvatar = (
  catalog: AvatarCatalog,
  colors: AvatarColors,
  opts: BuildOptions = {},
): AvatarConfig => {
  const now = opts.now ?? Date.now();
  return {
    id: opts.id ?? simpleId(),
    version: 1,
    name: opts.name,
    selection: {
      gender: opts.gender ?? 'female',
      body: firstId(catalog, 'body'),
      head: firstId(catalog, 'head'),
      hair: firstId(catalog, 'hair'),
      outfit: firstId(catalog, 'outfit'),
      accessories: [],
      expression: preferredId(catalog, 'expression', 'expr_neutral'),
    },
    colors: { ...colors },
    createdAt: now,
    updatedAt: now,
  };
};
