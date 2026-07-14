# CLAUDE.md - Development Guide

Development guidance for the Bitmoji Avatar Creator project.

## Quick Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking
```

## Architecture Overview

### State Management (Zustand)
- **avatarStore** - Core avatar state, selection, colors, history, undo/redo, persistence
  - Located: `src/stores/avatarStore.ts`
  - Actions: `selectTrait`, `selectColor`, `randomizeAvatar`, `undo`, `redo`, `saveToLocal`

### Type Definitions
- **AvatarConfig** - Complete avatar state
- **AvatarSelection** - Currently selected traits
- **AvatarColors** - Avatar color customization
- **TraitOption** - Individual trait definition
- Located: `src/types/avatar.ts`

### Configuration
- **defaultColors** - Default color palette
- **traitCatalog** - All available traits (bodies, heads, hair, outfits, accessories, expressions)
- **colorPalettes** - Predefined color schemes
- Located: `src/config/defaults.ts`

### Utilities
- **generateUUID** - Create unique IDs
- **hexToRgb, rgbToHex** - Color conversions
- **getLuminance, getContrastColor** - Text color contrast
- **randomItem, shuffleArray** - Array utilities
- Located: `src/lib/utils.ts`

## Project Structure

```
src/
├── components/        # React UI components (Phase 2)
│   └── (avatar preview, trait selector, color picker, etc.)
├── stores/           # Zustand state management
│   ├── avatarStore.ts      # Main avatar state
│   └── (presetStore, uiStore in Phase 2)
├── types/            # TypeScript definitions
│   └── avatar.ts           # Core types
├── lib/              # Utility functions
│   └── utils.ts            # Helper functions
├── config/           # Configuration
│   └── defaults.ts         # Default values and catalogs
├── pages/            # Next.js pages
│   ├── _app.tsx            # App wrapper
│   ├── index.tsx           # Home page
│   └── (api routes in pages/api)
├── hooks/            # Custom React hooks (upcoming)
└── utils/            # Additional utilities (upcoming)
public/              # Static assets (images, fonts)
```

## Development Workflow

### Adding a New Trait
1. Add to `traitCatalog` in `src/config/defaults.ts`
2. Component automatically uses manifest-driven system
3. No code changes needed in stores

### Adding a New Color Option
1. Extend `AvatarColors` interface in `src/types/avatar.ts`
2. Add to `defaultColors` in `src/config/defaults.ts`
3. Add setter in `useAvatarStore` (already generic via `selectColor`)

### Implementing a New Component
1. Create in `src/components/YourComponent.tsx`
2. Use `useAvatarStore()` hook to access/modify state
3. Follow naming: PascalCase for components
4. Use CSS Modules for styling (YourComponent.module.css)

### Undo/Redo System
- Automatically tracked by store (history management)
- No action needed - just call `selectTrait`, `selectColor`, etc.
- `undo()` and `redo()` methods available
- `canUndo()` and `canRedo()` for UI state

### Persistence
- Auto-save: Call `saveToLocal()` after changes
- Auto-load: Call `loadFromLocal()` on app startup
- Uses browser `localStorage`
- Phase 2: Add API syncing

## Phase 1 Completed ✅
- [x] Project initialization
- [x] TypeScript setup
- [x] Zustand store implementation
- [x] Type definitions
- [x] Default configuration
- [x] Utility functions
- [x] Basic page structure

## Phase 2 Tasks (UI & Components)
- [ ] Create Avatar canvas/preview component
- [ ] Create trait selector component
- [ ] Create color picker component
- [ ] Create main builder layout
- [ ] Add randomize button
- [ ] Add save/name dialog

## Phase 3 Tasks (Export & Advanced)
- [ ] Screenshot export
- [ ] JSON import/export
- [ ] Preset system
- [ ] Gallery/history

## Key Design Decisions

1. **Zustand over Redux** - Simpler, no middleware complexity
2. **Manifest-driven traits** - Easy to modify without code changes
3. **Separate stores** - avatarStore, presetStore, uiStore - clear responsibilities
4. **Local storage by default** - Works offline, Phase 2 adds API sync
5. **Undo/redo in store** - Automatic, no extra actions needed
6. **Config-first approach** - Config is source of truth, rebuilt from it

## Common Patterns

### Using the Avatar Store
```tsx
import { useAvatarStore } from '@stores/avatarStore';

export function MyComponent() {
  const config = useAvatarStore((state) => state.config);
  const selectTrait = useAvatarStore((state) => state.selectTrait);
  
  return (
    <button onClick={() => selectTrait('head', 'head_round')}>
      Round Head
    </button>
  );
}
```

### Randomizing Avatar
```tsx
const randomize = useAvatarStore((state) => state.randomizeAvatar);
<button onClick={randomize}>🎲 Randomize</button>
```

### Exporting Config
```tsx
const exportJSON = useAvatarStore((state) => state.exportJSON);
const json = exportJSON();
downloadFile(json, 'avatar.json');
```

## Troubleshooting

**Types not working?**
- Run `npm run type-check`
- Check import paths use `@types/*` aliases

**Store not updating UI?**
- Make sure you're using the hook in a client component
- Use selector: `useAvatarStore((state) => state.config)`

**Colors not saving?**
- After changes, call `saveToLocal()`
- Check browser localStorage in DevTools

## Resources

- [Next.js Docs](https://nextjs.org)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev)
