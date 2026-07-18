/**
 * avatar-core / animations
 *
 * Animation metadata, not hardcoded frame counts. The current SVG renderer is
 * static and ignores these, but sprite/game renderers (web or mobile) read the
 * definitions here so frame counts and rates live in one place.
 */

export type AvatarAnimation =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'attack'
  | 'dance'
  | 'celebrate';

export interface AnimationDefinition {
  id: AvatarAnimation;
  frames: number;
  frameRate: number;
  loop: boolean;
}

export const ANIMATIONS: Record<AvatarAnimation, AnimationDefinition> = {
  idle: { id: 'idle', frames: 4, frameRate: 6, loop: true },
  walk: { id: 'walk', frames: 6, frameRate: 10, loop: true },
  run: { id: 'run', frames: 6, frameRate: 14, loop: true },
  jump: { id: 'jump', frames: 4, frameRate: 10, loop: false },
  attack: { id: 'attack', frames: 5, frameRate: 14, loop: false },
  dance: { id: 'dance', frames: 8, frameRate: 8, loop: true },
  celebrate: { id: 'celebrate', frames: 6, frameRate: 10, loop: false },
};

export const AVATAR_ANIMATIONS = Object.keys(ANIMATIONS) as AvatarAnimation[];

/** Frame id for a sprite atlas, e.g. `frameName('walk', 2)` → "walk_2". */
export const frameName = (anim: AvatarAnimation, index: number): string => `${anim}_${index}`;
