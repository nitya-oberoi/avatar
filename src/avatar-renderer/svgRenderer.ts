/**
 * avatar-renderer / SvgAvatarRenderer
 *
 * Web renderer that wraps the existing procedural SVG engine
 * (lib/avatarRenderer) behind the AvatarRenderer interface. Chosen over
 * Canvas/Pixi for v1 because the avatar is already vector art — no asset
 * pipeline, crisp at any size, and it keeps the polished look we built.
 *
 * The SVG is static, so animation is tracked but not visually played; a future
 * Canvas/Pixi renderer can implement the same interface with real sprite frames
 * and drop in with no caller changes.
 */

import type { AvatarConfig } from '@/avatar-core';
import type { AvatarAnimation } from '@/avatar-core';
import { renderAvatarSVG } from '@lib/avatarRenderer';
import type { AvatarRenderer } from './AvatarRenderer';

export interface SvgRendererOptions {
  size?: number;
}

export class SvgAvatarRenderer implements AvatarRenderer {
  private container: HTMLElement;
  private size: number;
  private lastMarkup = '';
  private animation: AvatarAnimation = 'idle';

  constructor(container: HTMLElement, opts: SvgRendererOptions = {}) {
    this.container = container;
    this.size = opts.size ?? 320;
  }

  async loadAssets(): Promise<void> {
    // Procedural SVG needs no assets.
  }

  render(config: AvatarConfig): void {
    const markup = renderAvatarSVG(config, this.size);
    // Skip DOM writes when nothing changed (memoized redraw).
    if (markup === this.lastMarkup) return;
    this.lastMarkup = markup;
    this.container.innerHTML = markup;
  }

  playAnimation(animation: AvatarAnimation): void {
    this.animation = animation;
    this.container.setAttribute('data-animation', animation);
  }

  pauseAnimation(): void {
    this.container.removeAttribute('data-animation');
  }

  get currentAnimation(): AvatarAnimation {
    return this.animation;
  }

  destroy(): void {
    this.container.innerHTML = '';
    this.lastMarkup = '';
  }
}
