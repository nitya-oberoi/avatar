# 🎨 Bitmoji Avatar Creator

A cute, fun avatar customization system inspired by Bitmoji. Create stylized avatars with customizable traits, colors, and accessories.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/     # React components
├── stores/        # Zustand state management
├── types/         # TypeScript type definitions
├── lib/           # Utility functions
├── config/        # Configuration and defaults
├── pages/         # Next.js pages
├── hooks/         # Custom React hooks
└── utils/         # Miscellaneous utilities
public/            # Static assets
```

## Development

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run format     # Format with Prettier
npm run type-check # Check TypeScript
```

## Features (Roadmap)

### Phase 1: Foundation ✅
- [x] Zustand state management
- [x] TypeScript types
- [x] Avatar configuration
- [x] Trait catalog
- [ ] Basic UI structure

### Phase 2: Builder UI (In Progress)
- [ ] Avatar canvas/preview
- [ ] Trait selector
- [ ] Color picker
- [ ] Preset system
- [ ] Randomize button

### Phase 3: Export & Advanced
- [ ] Screenshot export
- [ ] JSON export/import
- [ ] Preset save/load
- [ ] Avatar gallery

### Phase 4: Social & Polish
- [ ] Share avatars
- [ ] User profiles
- [ ] Selfie integration (Phase 2+)

## Tech Stack

- **Frontend**: React 18 + Next.js 14
- **State**: Zustand
- **Language**: TypeScript
- **Styling**: CSS Modules (upcoming)

## Architecture

### Avatar Configuration
```json
{
  "id": "uuid",
  "name": "My Avatar",
  "selection": {
    "body": "body_standard",
    "head": "head_round",
    "hair": "hair_long",
    "outfit": "outfit_casual",
    "accessories": ["acc_glasses"],
    "expression": "expr_happy"
  },
  "colors": {
    "skinTone": "#E8B4A0",
    "hairColor": "#3D2817",
    "eyeColor": "#6B4423",
    "outfitPrimary": "#FF6B9D",
    "outfitSecondary": "#FFC857",
    "accentColor": "#1E88E5"
  }
}
```

### State Management (Zustand)
- `avatarStore` - Avatar customization state, history, persistence
- `uiStore` - UI state (modals, notifications)
- `presetStore` - Preset management (Phase 2)

## API (Phase 2+)

```
POST   /api/avatars          - Create avatar
GET    /api/avatars          - List user avatars
GET    /api/avatars/[id]     - Get avatar
PUT    /api/avatars/[id]     - Update avatar
DELETE /api/avatars/[id]     - Delete avatar
POST   /api/avatars/export   - Export avatar
```

## Contributing

Contributions welcome! Please follow the existing code style and add tests for new features.

## License

MIT
