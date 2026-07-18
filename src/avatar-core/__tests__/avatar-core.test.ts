import { describe, it, expect } from 'vitest';
import {
  buildCatalog,
  createDefaultAvatar,
  randomizeAvatar,
  equipItem,
  canEquip,
  serialize,
  deserialize,
  safeDeserialize,
  migrateConfig,
  createPreset,
  duplicatePreset,
  renamePreset,
  isUnlocked,
  avatarConfigSchema,
  type AvatarColors,
  type RawCatalog,
} from '@/avatar-core';

const COLORS: AvatarColors = {
  skinTone: '#E8B4A0',
  hairColor: '#3D2817',
  eyeColor: '#6B4423',
  outfitPrimary: '#FF6B9D',
  outfitSecondary: '#FFC857',
  accentColor: '#1E88E5',
};

const RAW: RawCatalog = {
  bodies: [{ id: 'body_standard', name: 'Standard' }, { id: 'body_slim', name: 'Slim' }],
  heads: [{ id: 'head_round', name: 'Round' }, { id: 'head_oval', name: 'Oval' }],
  hair: [{ id: 'hair_short', name: 'Short' }, { id: 'hair_long', name: 'Long' }],
  outfits: [{ id: 'outfit_casual', name: 'Casual' }, { id: 'outfit_formal', name: 'Formal' }],
  accessories: [{ id: 'acc_glasses', name: 'Glasses' }, { id: 'acc_crown', name: 'Crown' }],
  expressions: [{ id: 'expr_neutral', name: 'Neutral' }, { id: 'expr_happy', name: 'Happy' }],
};

const catalog = buildCatalog(RAW, {
  // premium + only wearable on a slim body (for unlock + compatibility tests)
  acc_crown: { rarity: 'legendary', isPremium: true, price: 500, compatibleBodyTypes: ['body_slim'] },
});
const def = () => createDefaultAvatar(catalog, COLORS, { id: 'a1', now: 0 });

describe('catalog', () => {
  it('groups items by slot and indexes by id with a layer', () => {
    expect(catalog.bySlot.hair.map((i) => i.id)).toEqual(['hair_short', 'hair_long']);
    expect(catalog.byId.acc_crown.isPremium).toBe(true);
    expect(typeof catalog.byId.hair_short.layer).toBe('number');
    expect(catalog.byId.hair_short.colorKeys).toContain('hairColor');
  });
});

describe('schema validation', () => {
  it('accepts a valid default avatar', () => {
    expect(avatarConfigSchema.safeParse(def()).success).toBe(true);
  });
  it('rejects an invalid hex colour', () => {
    const bad = { ...def(), colors: { ...COLORS, skinTone: 'red' } };
    expect(avatarConfigSchema.safeParse(bad).success).toBe(false);
  });
  it('rejects a config missing a slot', () => {
    const bad = { ...def(), selection: { ...def().selection, body: '' } };
    expect(avatarConfigSchema.safeParse(bad).success).toBe(false);
  });
});

describe('createDefaultAvatar', () => {
  it('picks the first item per slot and preferred neutral expression', () => {
    const a = def();
    expect(a.selection.body).toBe('body_standard');
    expect(a.selection.expression).toBe('expr_neutral');
    expect(a.selection.accessories).toEqual([]);
  });
});

describe('equipItem', () => {
  it('replaces a single slot immutably', () => {
    const a = def();
    const b = equipItem(a, catalog, 'hair_long');
    expect(b.selection.hair).toBe('hair_long');
    expect(a.selection.hair).toBe('hair_short'); // original untouched
  });
  it('toggles accessories on and off', () => {
    const on = equipItem(def(), catalog, 'acc_glasses');
    expect(on.selection.accessories).toContain('acc_glasses');
    const off = equipItem(on, catalog, 'acc_glasses');
    expect(off.selection.accessories).not.toContain('acc_glasses');
  });
  it('ignores unknown and body-incompatible items', () => {
    const a = def(); // body_standard; acc_crown only fits body_slim
    expect(equipItem(a, catalog, 'nope').selection).toEqual(a.selection);
    expect(equipItem(a, catalog, 'acc_crown').selection.accessories).not.toContain('acc_crown');
  });
  it('allows a compatible single-slot switch', () => {
    expect(equipItem(def(), catalog, 'body_slim').selection.body).toBe('body_slim');
  });
});

describe('canEquip', () => {
  it('reports unknown, incompatible, and ok', () => {
    expect(canEquip(def(), catalog, 'nope')).toEqual({ ok: false, reason: 'unknown-item' });
    expect(canEquip(def(), catalog, 'acc_crown')).toEqual({ ok: false, reason: 'incompatible-body' });
    expect(canEquip(def(), catalog, 'body_standard')).toEqual({ ok: true });
  });
});

describe('randomizeAvatar', () => {
  it('is deterministic under a seeded rng and always valid', () => {
    let n = 0;
    const rng = () => ((n = (n * 9301 + 49297) % 233280), n / 233280);
    const a = randomizeAvatar(catalog, COLORS, { rng, id: 'r1', now: 0 });
    expect(avatarConfigSchema.safeParse(a).success).toBe(true);
    expect(catalog.byId[a.selection.hair]).toBeDefined();
  });
});

describe('serialization', () => {
  it('round-trips a config', () => {
    const a = def();
    expect(deserialize(serialize(a))).toEqual(a);
  });
  it('rejects bad json and bad shape', () => {
    expect(safeDeserialize('{oops').success).toBe(false);
    expect(safeDeserialize('{"version":1}').success).toBe(false);
  });
});

describe('migrateConfig', () => {
  const fallback = def();
  it('passes a valid config through', () => {
    expect(migrateConfig(fallback, fallback)).toEqual(fallback);
  });
  it('backfills a partial config from the fallback', () => {
    const partial = { selection: { hair: 'hair_long' } };
    const out = migrateConfig(partial, fallback);
    expect(out.selection.hair).toBe('hair_long');
    expect(out.selection.body).toBe(fallback.selection.body); // backfilled
    expect(out.colors).toEqual(fallback.colors);
  });
  it('falls back on garbage', () => {
    expect(migrateConfig(42, fallback)).toEqual(fallback);
  });
});

describe('presets', () => {
  it('creates, duplicates, and renames', () => {
    const p = createPreset(def(), 'Hero', { id: 'p1' });
    expect(p.name).toBe('Hero');
    expect(duplicatePreset(p, 'p2').id).toBe('p2');
    expect(renamePreset(p, 'Villain').name).toBe('Villain');
  });
});

describe('unlock', () => {
  it('gates premium items', () => {
    expect(isUnlocked(catalog.byId.acc_glasses, [])).toBe(true);
    expect(isUnlocked(catalog.byId.acc_crown, [])).toBe(false);
    expect(isUnlocked(catalog.byId.acc_crown, ['acc_crown'])).toBe(true);
  });
});
