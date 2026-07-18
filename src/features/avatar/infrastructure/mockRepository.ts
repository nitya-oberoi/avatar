/**
 * features/avatar/infrastructure / MockAvatarRepository
 *
 * In-memory AvatarRepository for local dev, tests, and Storybook. Seeded with
 * an injected default avatar so it carries no dependency on the app catalog.
 */

import type { AvatarConfig, AvatarPreset, AvatarRepository } from '@/avatar-core';

export interface MockSeed {
  avatar: AvatarConfig;
  presets?: AvatarPreset[];
  unlockedItemIds?: string[];
}

export class MockAvatarRepository implements AvatarRepository {
  private avatars = new Map<string, AvatarConfig>();
  private presets = new Map<string, AvatarPreset[]>();

  constructor(private seed: MockSeed) {}

  async getCurrentAvatar(userId: string): Promise<AvatarConfig> {
    return this.avatars.get(userId) ?? this.seed.avatar;
  }

  async saveAvatar(userId: string, avatar: AvatarConfig): Promise<AvatarConfig> {
    this.avatars.set(userId, avatar);
    return avatar;
  }

  async getPresets(userId: string): Promise<AvatarPreset[]> {
    return this.presets.get(userId) ?? this.seed.presets ?? [];
  }

  async savePreset(userId: string, preset: AvatarPreset): Promise<AvatarPreset> {
    const list = this.presets.get(userId) ?? [];
    const next = list.some((p) => p.id === preset.id)
      ? list.map((p) => (p.id === preset.id ? preset : p))
      : [...list, preset];
    this.presets.set(userId, next);
    return preset;
  }

  async deletePreset(userId: string, presetId: string): Promise<void> {
    const list = this.presets.get(userId) ?? [];
    this.presets.set(userId, list.filter((p) => p.id !== presetId));
  }

  async getUnlockedItemIds(): Promise<string[]> {
    return this.seed.unlockedItemIds ?? [];
  }
}
