/**
 * avatar-core / presets
 *
 * Pure helpers for the saved-preset feature. Storage/active-selection is app
 * state; this module only shapes preset objects.
 */

import type { AvatarConfig, AvatarPreset } from './types';
import { simpleId } from './defaultAvatar';

export interface PresetOptions {
  id?: string;
  description?: string;
  category?: AvatarPreset['category'];
  thumbnail?: string;
}

export const createPreset = (config: AvatarConfig, name: string, opts: PresetOptions = {}): AvatarPreset => ({
  id: opts.id ?? simpleId(),
  name,
  description: opts.description,
  thumbnail: opts.thumbnail,
  category: opts.category ?? 'custom',
  config: { ...config },
});

export const duplicatePreset = (preset: AvatarPreset, id: string = simpleId()): AvatarPreset => ({
  ...preset,
  id,
  name: `${preset.name} copy`,
  config: { ...preset.config, id },
});

export const renamePreset = (preset: AvatarPreset, name: string): AvatarPreset => ({ ...preset, name });
