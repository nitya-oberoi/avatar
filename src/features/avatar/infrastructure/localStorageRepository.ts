/**
 * features/avatar/infrastructure / LocalStorageAvatarRepository
 *
 * Browser-persistence AvatarRepository. Guards against non-browser environments
 * (SSR / React Native) so importing it never throws; loads run through
 * migrateConfig, so stale or malformed saved data degrades to the fallback
 * instead of crashing.
 */

import {
  avatarPresetSchema,
  migrateConfig,
  serialize,
  type AvatarConfig,
  type AvatarPreset,
  type AvatarRepository,
} from '@/avatar-core';

export class LocalStorageAvatarRepository implements AvatarRepository {
  constructor(
    private fallback: AvatarConfig,
    private namespace = 'avatarverse',
  ) {}

  private get store(): Storage | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch {
      return null;
    }
  }

  private key(kind: string, userId: string): string {
    return `${this.namespace}:${kind}:${userId}`;
  }

  async getCurrentAvatar(userId: string): Promise<AvatarConfig> {
    const raw = this.store?.getItem(this.key('avatar', userId));
    if (!raw) return this.fallback;
    try {
      return migrateConfig(JSON.parse(raw), this.fallback);
    } catch {
      return this.fallback;
    }
  }

  async saveAvatar(userId: string, avatar: AvatarConfig): Promise<AvatarConfig> {
    try {
      this.store?.setItem(this.key('avatar', userId), serialize(avatar));
    } catch {
      /* quota / private mode — persistence is best-effort */
    }
    return avatar;
  }

  async getPresets(userId: string): Promise<AvatarPreset[]> {
    const raw = this.store?.getItem(this.key('presets', userId));
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((p) => {
        const r = avatarPresetSchema.safeParse(p);
        return r.success ? [r.data] : [];
      });
    } catch {
      return [];
    }
  }

  async savePreset(userId: string, preset: AvatarPreset): Promise<AvatarPreset> {
    const list = await this.getPresets(userId);
    const next = list.some((p) => p.id === preset.id)
      ? list.map((p) => (p.id === preset.id ? preset : p))
      : [...list, preset];
    try {
      this.store?.setItem(this.key('presets', userId), JSON.stringify(next));
    } catch {
      /* best-effort */
    }
    return preset;
  }

  async deletePreset(userId: string, presetId: string): Promise<void> {
    const list = await this.getPresets(userId);
    try {
      this.store?.setItem(
        this.key('presets', userId),
        JSON.stringify(list.filter((p) => p.id !== presetId)),
      );
    } catch {
      /* best-effort */
    }
  }

  async getUnlockedItemIds(userId: string): Promise<string[]> {
    const raw = this.store?.getItem(this.key('unlocked', userId));
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }
}
