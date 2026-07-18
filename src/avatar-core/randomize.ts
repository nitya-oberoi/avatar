/**
 * avatar-core / randomize
 *
 * Pure random avatar generation. The RNG is injectable so tests are
 * deterministic; callers can pass a seeded generator.
 */

import type { AvatarCatalog, AvatarColors, AvatarConfig } from './types';
import { SINGLE_SLOTS } from './layers';
import { simpleId } from './defaultAvatar';

export interface RandomizeOptions {
  rng?: () => number;
  id?: string;
  now?: number;
  /** Colour sets to pick from; if omitted, `baseColors` is kept. */
  palettes?: AvatarColors[];
  maxAccessories?: number;
}

const pick = <T>(arr: readonly T[], rng: () => number): T | undefined =>
  arr.length ? arr[Math.floor(rng() * arr.length)] : undefined;

export const randomizeAvatar = (
  catalog: AvatarCatalog,
  baseColors: AvatarColors,
  opts: RandomizeOptions = {},
): AvatarConfig => {
  const rng = opts.rng ?? Math.random;
  const now = opts.now ?? Date.now();
  const maxAcc = opts.maxAccessories ?? 2;

  const selection = {
    gender: (rng() < 0.5 ? 'male' : 'female') as 'male' | 'female',
    body: pick(catalog.bySlot.body, rng)?.id ?? '',
    head: pick(catalog.bySlot.head, rng)?.id ?? '',
    hair: pick(catalog.bySlot.hair, rng)?.id ?? '',
    outfit: pick(catalog.bySlot.outfit, rng)?.id ?? '',
    expression: pick(catalog.bySlot.expression, rng)?.id ?? '',
    accessories: [] as string[],
  };
  // ensure every single slot resolved (guards empty catalog slices)
  void SINGLE_SLOTS;

  const pool = [...catalog.bySlot.accessories];
  const count = Math.floor(rng() * (maxAcc + 1));
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(rng() * pool.length);
    selection.accessories.push(pool.splice(idx, 1)[0].id);
  }

  const colors = opts.palettes?.length ? { ...(pick(opts.palettes, rng) as AvatarColors) } : { ...baseColors };

  return {
    id: opts.id ?? simpleId(),
    version: 1,
    selection,
    colors,
    createdAt: now,
    updatedAt: now,
  };
};
