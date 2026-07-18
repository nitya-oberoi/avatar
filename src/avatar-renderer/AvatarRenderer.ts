/**
 * avatar-renderer / AvatarRenderer
 *
 * Platform-agnostic rendering contract. A web (SVG/Canvas/Pixi) or mobile
 * renderer implements this; the UI and games depend on the interface, so the
 * engine is replaceable without touching callers.
 */

import type { AvatarConfig } from '@/avatar-core';
import type { AvatarAnimation } from '@/avatar-core';

export interface AvatarRenderer {
  /** Preload any assets the renderer needs (no-op for procedural renderers). */
  loadAssets(): Promise<void>;
  /** Draw the given config. Cheap to call on every edit. */
  render(config: AvatarConfig): void;
  /** Start/replace the current animation (renderers without frames may no-op). */
  playAnimation(animation: AvatarAnimation): void;
  pauseAnimation(): void;
  /** Release DOM/GPU resources and stop any loop. */
  destroy(): void;
}
