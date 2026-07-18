/**
 * avatar-core / repository
 *
 * The persistence contract the UI depends on. UI/components talk to this
 * interface only — never to fetch/localStorage/APIs directly — so the same
 * screens run against a mock, localStorage, or a real backend unchanged.
 */

import type { AvatarConfig, AvatarPreset } from './types';

export interface AvatarRepository {
  getCurrentAvatar(userId: string): Promise<AvatarConfig>;
  saveAvatar(userId: string, avatar: AvatarConfig): Promise<AvatarConfig>;

  getPresets(userId: string): Promise<AvatarPreset[]>;
  savePreset(userId: string, preset: AvatarPreset): Promise<AvatarPreset>;
  deletePreset(userId: string, presetId: string): Promise<void>;

  getUnlockedItemIds(userId: string): Promise<string[]>;
}
