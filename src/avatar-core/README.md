# Avatar system architecture

A modular, framework-free avatar foundation merged into this Next.js app. The
existing procedural **SVG** avatar renderer is kept and reused; this layer adds
the AvatarVerse-style data model, validation, catalog, repository, and a
renderer abstraction around it.

## Layers (dependency direction points inward)

```
src/
  avatar-core/            ← pure TS. No React/DOM/Next/Canvas/platform globals.
    types, layers, animations, catalog, schemas, defaultAvatar,
    randomize, serialization, migration, compatibility, unlock,
    presets, repository, __tests__/
  avatar-renderer/        ← web rendering (DOM). Implements AvatarRenderer.
    AvatarRenderer.ts (interface), svgRenderer.ts (wraps lib/avatarRenderer)
  features/avatar/
    application/          ← composition root: wires app catalog → core
    infrastructure/       ← MockAvatarRepository, LocalStorageAvatarRepository
  lib/avatarRenderer.ts   ← existing procedural SVG engine (unchanged)
  config/defaults.ts      ← existing trait data (single source of truth)
```

**Rule:** `avatar-core` never imports React, the DOM, Next, Canvas, or a
renderer. Everything else may depend on `avatar-core`, never the reverse.

## Avatar data model

An avatar is structured JSON (`AvatarConfig`), not an image:

```jsonc
{
  "id": "avatar-...", "version": 1, "name": "Hero",
  "selection": { "gender": "female", "body": "body_standard", "head": "head_round",
                 "hair": "hair_long", "outfit": "outfit_casual",
                 "accessories": ["acc_glasses"], "expression": "expr_neutral" },
  "colors": { "skinTone": "#E8B4A0", "hairColor": "#3D2817", "eyeColor": "#6B4423",
              "outfitPrimary": "#FF6B9D", "outfitSecondary": "#FFC857", "accentColor": "#1E88E5" },
  "createdAt": 0, "updatedAt": 0
}
```

Validated at every boundary with Zod (`avatarConfigSchema`). `version` +
`migrateConfig` let the shape evolve without breaking saved data.

## How avatar data is stored

Through the `AvatarRepository` interface only — UI never touches
localStorage/fetch directly. Provided implementations:
`MockAvatarRepository` (in-memory) and `LocalStorageAvatarRepository`
(browser, SSR/RN-safe). A backend adapter would implement the same interface.

## Add a new cosmetic item

1. Add `{ id, name, icon }` to the right array in `config/defaults.ts`.
2. (Optional) rarity/premium/price in `features/avatar/application/avatarCatalog.ts` (`ITEM_META`).
3. (SVG renderer) draw it in `lib/avatarRenderer.ts` for its slot.
No renderer/catalog rewrite needed — `buildCatalog` picks it up.

## Add a new category (slot)

1. Add the slot to `AvatarSlot` (`types.ts`), `AVATAR_SLOTS`, and
   `AVATAR_LAYER_ORDER` (`layers.ts`) at the correct depth.
2. Add its trait array + a mapping in `catalog.ts` `buildCatalog`.
3. Handle it in the renderer(s).

## Add an animation

Add an entry to `ANIMATIONS` (`animations.ts`) with `frames`/`frameRate`/`loop`.
Frame-based renderers read it; no frame counts are hardcoded elsewhere. (The
current SVG renderer is static and ignores animation.)

## Use the avatar in another game (Phaser/Canvas)

Depend on the interfaces, not this app:

```ts
const avatar = await avatarRepository.getCurrentAvatar(userId); // AvatarConfig
const renderer = new SvgAvatarRenderer(containerEl, { size: 256 }); // or a future PixiAvatarRenderer
await renderer.loadAssets();
renderer.render(avatar);
renderer.playAnimation('walk');
```

A Phaser adapter implements the same `AvatarRenderer` interface (draw to a
`Scene` at x/y) — callers stay identical.

## What is reusable in a mobile app (React Native / Expo)

Everything in **`avatar-core`** unchanged: types, catalog, slots, layer order,
validation, serialization, migration, randomize, compatibility, unlock,
presets, and the `AvatarRepository` interface. Platform-specific: the renderer
(`avatar-renderer` is web/DOM — write a native one implementing
`AvatarRenderer`), UI, and a storage adapter (localStorage → AsyncStorage).

## Commands

```
npm run dev          # run the app
npm run build        # production build
npm run type-check   # tsc --noEmit
npm run lint         # eslint
npm test             # vitest run (avatar-core unit tests)
```
