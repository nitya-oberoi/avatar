/**
 * avatar-core / serialization
 *
 * JSON in/out with validation at the boundary. `deserialize` throws on invalid
 * data; `safeDeserialize` returns a discriminated result for callers that would
 * rather branch than catch.
 */

import type { AvatarConfig } from './types';
import { avatarConfigSchema } from './schemas';

export const serialize = (config: AvatarConfig): string => JSON.stringify(config);

export type DeserializeResult =
  | { success: true; data: AvatarConfig }
  | { success: false; error: string };

export const safeDeserialize = (json: string): DeserializeResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { success: false, error: 'Invalid JSON' };
  }
  const result = avatarConfigSchema.safeParse(parsed);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error.issues.map((i) => i.message).join('; ') };
};

export const deserialize = (json: string): AvatarConfig => {
  const result = safeDeserialize(json);
  if (!result.success) throw new Error(`Avatar deserialization failed: ${result.error}`);
  return result.data;
};

export const isValidConfig = (value: unknown): value is AvatarConfig =>
  avatarConfigSchema.safeParse(value).success;
