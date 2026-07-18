/**
 * avatar-core / migration
 *
 * Forward-compatible config loading. Validated data passes through untouched;
 * malformed or older-shaped data is backfilled from a fallback (usually the
 * default avatar) and re-validated, so stale saved data can never crash a load.
 */

import type { AvatarConfig } from './types';
import { avatarConfigSchema } from './schemas';

export const CURRENT_VERSION = 1 as const;

type Migration = (config: Record<string, unknown>) => Record<string, unknown>;

/** version N → N+1 transforms. Empty until a v2 shape exists. */
const MIGRATIONS: Record<number, Migration> = {};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** Merge a partial/unknown config over a valid fallback, field by field. */
const normalize = (raw: Record<string, unknown>, fallback: AvatarConfig): AvatarConfig => {
  const sel = isRecord(raw.selection) ? raw.selection : {};
  const col = isRecord(raw.colors) ? raw.colors : {};
  return {
    id: typeof raw.id === 'string' ? raw.id : fallback.id,
    version: CURRENT_VERSION,
    name: typeof raw.name === 'string' ? raw.name : fallback.name,
    selection: { ...fallback.selection, ...sel } as AvatarConfig['selection'],
    colors: { ...fallback.colors, ...col } as AvatarConfig['colors'],
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : fallback.createdAt,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : fallback.updatedAt,
  };
};

export const migrateConfig = (raw: unknown, fallback: AvatarConfig): AvatarConfig => {
  // Already valid → run any version upgrades, then return.
  const direct = avatarConfigSchema.safeParse(raw);
  if (direct.success) {
    let cfg: Record<string, unknown> = { ...direct.data };
    for (let v = direct.data.version; v < CURRENT_VERSION; v++) {
      const step = MIGRATIONS[v];
      if (step) cfg = step(cfg);
    }
    cfg.version = CURRENT_VERSION;
    const revalidated = avatarConfigSchema.safeParse(cfg);
    return revalidated.success ? revalidated.data : fallback;
  }

  // Malformed/partial → backfill from fallback and re-validate.
  if (!isRecord(raw)) return fallback;
  const normalized = normalize(raw, fallback);
  const result = avatarConfigSchema.safeParse(normalized);
  return result.success ? result.data : fallback;
};
