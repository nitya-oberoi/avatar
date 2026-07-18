/**
 * avatar-core — framework-free avatar foundation for AvatarVerse.
 *
 * Pure TypeScript: no React, DOM, Canvas, Next, or platform globals. Reusable
 * as-is across web, React Native, Expo, and game runtimes. Platform code
 * (renderers, UI, storage adapters) lives outside this folder and depends on
 * these types/functions — never the reverse.
 */

export * from './types';
export * from './layers';
export * from './animations';
export * from './catalog';
export * from './schemas';
export * from './defaultAvatar';
export * from './randomize';
export * from './serialization';
export * from './migration';
export * from './compatibility';
export * from './unlock';
export * from './presets';
export * from './repository';
