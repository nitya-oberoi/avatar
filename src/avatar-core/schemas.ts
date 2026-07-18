/**
 * avatar-core / schemas
 *
 * Runtime validation (Zod) for everything that crosses a trust boundary:
 * saved local data, API responses, imported JSON, and version migrations.
 * Types are inferred from these schemas so the runtime and compile-time shapes
 * can never drift.
 */

import { z } from 'zod';

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Expected a #RRGGBB hex colour');

export const avatarColorsSchema = z.object({
  skinTone: hexColorSchema,
  hairColor: hexColorSchema,
  eyeColor: hexColorSchema,
  outfitPrimary: hexColorSchema,
  outfitSecondary: hexColorSchema,
  accentColor: hexColorSchema,
});

export const avatarSelectionSchema = z.object({
  gender: z.enum(['male', 'female']),
  body: z.string().min(1),
  head: z.string().min(1),
  hair: z.string().min(1),
  outfit: z.string().min(1),
  accessories: z.array(z.string()),
  expression: z.string().min(1),
});

export const avatarConfigSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  name: z.string().optional(),
  selection: avatarSelectionSchema,
  colors: avatarColorsSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const raritySchema = z.enum(['common', 'rare', 'epic', 'legendary']);
export const avatarSlotSchema = z.enum(['body', 'head', 'hair', 'outfit', 'expression', 'accessories']);

export const avatarItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slot: avatarSlotSchema,
  layer: z.number().int().nonnegative(),
  icon: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  rarity: raritySchema,
  isPremium: z.boolean(),
  price: z.number().nonnegative().optional(),
  colorKeys: z.array(z.string()).optional(),
  compatibleBodyTypes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const avatarPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  config: avatarConfigSchema,
  category: z.enum(['adventure', 'casual', 'fantasy', 'futuristic', 'custom']).optional(),
});

export type AvatarConfigInput = z.infer<typeof avatarConfigSchema>;
export type AvatarItemInput = z.infer<typeof avatarItemSchema>;
export type AvatarPresetInput = z.infer<typeof avatarPresetSchema>;
