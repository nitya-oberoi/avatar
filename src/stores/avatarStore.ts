/**
 * Avatar Store - Zustand state management
 * Manages avatar customization, history, and persistence
 */

import { create } from 'zustand';
import { AvatarConfig, AvatarSelection, AvatarColors, HistoryState } from '@apptypes/avatar';
import { generateUUID, randomItem } from '@lib/utils';
import { defaultColors, traitCatalog, colorPalettes, uiConfig } from '@config/defaults';

const STORAGE_KEY = 'avatarConfig';

// Placeholder identity used for the initial (pre-hydration) config.
// It MUST be deterministic so the server-rendered HTML and the first
// client render are identical — otherwise React throws a hydration
// mismatch. The real id/timestamps are assigned on the client in
// loadFromLocal(), which runs after mount.
const PLACEHOLDER_ID = 'default-avatar';

interface AvatarStore {
  // State
  config: AvatarConfig;
  history: HistoryState;
  isLoading: boolean;
  error: string | null;

  // Selection actions
  selectTrait: (category: keyof AvatarSelection, value: string) => void;
  selectColor: (colorKey: keyof AvatarColors, color: string) => void;
  addAccessory: (accessoryId: string) => void;
  removeAccessory: (accessoryId: string) => void;

  // Configuration actions
  resetAvatar: () => void;
  randomizeAvatar: () => void;
  setConfig: (config: AvatarConfig) => void;
  setName: (name: string) => void;

  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Persistence
  saveToLocal: () => void;
  loadFromLocal: () => void;
  clearLocal: () => void;

  // Utilities
  getConfig: () => AvatarConfig;
  exportJSON: () => string;
  importJSON: (json: string) => void;
}

const createDefaultConfig = (): AvatarConfig => ({
  // Deterministic values only — see PLACEHOLDER_ID note above.
  id: PLACEHOLDER_ID,
  version: 1,
  name: 'My Avatar',
  selection: {
    gender: 'female',
    body: 'body_standard',
    head: 'head_round',
    hair: 'hair_long',
    outfit: 'outfit_casual',
    accessories: [],
    // Must match a key in traitCatalog.expressions / the renderer's mouth map
    expression: 'expr_neutral',
  },
  colors: { ...defaultColors },
  createdAt: 0,
  updatedAt: 0,
});

/**
 * Push a new config into history, returning the state slice to set.
 * Centralizes the past/present/future bookkeeping so every mutating
 * action stays a one-liner, and enforces the max-undo cap so history
 * cannot grow without bound.
 */
const commit = (state: AvatarStore, config: AvatarConfig): Partial<AvatarStore> => {
  const past = [...state.history.past, state.history.present];
  // Enforce history cap: drop the oldest states beyond the limit.
  if (past.length > uiConfig.maxUndoStates) {
    past.splice(0, past.length - uiConfig.maxUndoStates);
  }
  return {
    config,
    history: { past, present: config, future: [] },
  };
};

/**
 * Validate an unknown object is shaped like an AvatarConfig.
 * Guards importJSON / loadFromLocal against malformed or stale data.
 */
const isValidConfig = (value: unknown): value is AvatarConfig => {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Partial<AvatarConfig>;
  return (
    typeof c.selection === 'object' &&
    c.selection !== null &&
    typeof c.colors === 'object' &&
    c.colors !== null &&
    typeof c.selection.body === 'string'
  );
};

/**
 * Merge a partial/loaded config onto defaults so missing fields
 * (from schema drift) are backfilled rather than left undefined.
 */
const normalizeConfig = (config: AvatarConfig): AvatarConfig => {
  const base = createDefaultConfig();
  return {
    ...base,
    ...config,
    selection: { ...base.selection, ...config.selection },
    colors: { ...base.colors, ...config.colors },
  };
};

export const useAvatarStore = create<AvatarStore>((set, get) => ({
  // Initial state
  config: createDefaultConfig(),
  history: {
    past: [],
    present: createDefaultConfig(),
    future: [],
  },
  isLoading: false,
  error: null,

  // Selection actions
  selectTrait: (category, value) =>
    set((state) =>
      commit(state, {
        ...state.config,
        selection: { ...state.config.selection, [category]: value },
        updatedAt: Date.now(),
      })
    ),

  selectColor: (colorKey, color) =>
    set((state) =>
      commit(state, {
        ...state.config,
        colors: { ...state.config.colors, [colorKey]: color },
        updatedAt: Date.now(),
      })
    ),

  addAccessory: (accessoryId) =>
    set((state) => {
      if (state.config.selection.accessories.includes(accessoryId)) return state;
      return commit(state, {
        ...state.config,
        selection: {
          ...state.config.selection,
          accessories: [...state.config.selection.accessories, accessoryId],
        },
        updatedAt: Date.now(),
      });
    }),

  removeAccessory: (accessoryId) =>
    set((state) =>
      commit(state, {
        ...state.config,
        selection: {
          ...state.config.selection,
          accessories: state.config.selection.accessories.filter((id) => id !== accessoryId),
        },
        updatedAt: Date.now(),
      })
    ),

  // Configuration actions
  resetAvatar: () => {
    const config = createDefaultConfig();
    set({ config, history: { past: [], present: config, future: [] } });
  },

  randomizeAvatar: () =>
    set((state) => {
      // Pick a cohesive palette rather than six random colors so results
      // always look intentional. Traits are drawn from the full catalog.
      const palette = randomItem(colorPalettes);
      const accessoryPool = traitCatalog.accessories;
      const accessoryCount = Math.floor(Math.random() * 3); // 0, 1, or 2
      const accessories = Array.from({ length: accessoryCount }, () => randomItem(accessoryPool).id).filter(
        (id, i, arr) => arr.indexOf(id) === i
      );

      return commit(state, {
        ...state.config,
        selection: {
          gender: randomItem(['male', 'female'] as const),
          body: randomItem(traitCatalog.bodies).id,
          head: randomItem(traitCatalog.heads).id,
          hair: randomItem(traitCatalog.hair).id,
          outfit: randomItem(traitCatalog.outfits).id,
          expression: randomItem(traitCatalog.expressions).id,
          accessories,
        },
        colors: {
          skinTone: palette.skinTone,
          hairColor: palette.hairColor,
          eyeColor: palette.eyeColor,
          outfitPrimary: palette.outfitPrimary,
          outfitSecondary: palette.outfitSecondary,
          accentColor: palette.accentColor,
        },
        updatedAt: Date.now(),
      });
    }),

  setConfig: (config) => {
    set({ config, history: { past: [], present: config, future: [] } });
  },

  setName: (name) =>
    set((state) => commit(state, { ...state.config, name, updatedAt: Date.now() })),

  // History actions
  undo: () =>
    set((state) => {
      if (state.history.past.length === 0) return state;
      const past = [...state.history.past];
      const present = past.pop()!;
      return {
        config: present,
        history: { past, present, future: [state.history.present, ...state.history.future] },
      };
    }),

  redo: () =>
    set((state) => {
      if (state.history.future.length === 0) return state;
      const future = [...state.history.future];
      const present = future.shift()!;
      return {
        config: present,
        history: { past: [...state.history.past, state.history.present], present, future },
      };
    }),

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,

  // Persistence
  saveToLocal: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(get().config));
    } catch (e) {
      console.error('Failed to save avatar to localStorage:', e);
    }
  },

  loadFromLocal: () => {
    // Runs client-side only (from a mount effect), so it's safe to use
    // localStorage, generateUUID(), and Date.now() here.
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isValidConfig(parsed)) {
          get().setConfig(normalizeConfig(parsed));
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load avatar from localStorage:', e);
    }

    // No valid saved avatar. If we're still on the deterministic
    // placeholder, stamp it with a real id/timestamps now (client-side).
    const current = get().config;
    if (current.id === PLACEHOLDER_ID) {
      const now = Date.now();
      get().setConfig({ ...current, id: generateUUID(), createdAt: now, updatedAt: now });
    }
  },

  clearLocal: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear avatar from localStorage:', e);
    }
  },

  // Utilities
  getConfig: () => get().config,

  exportJSON: () => JSON.stringify(get().config, null, 2),

  importJSON: (json) => {
    try {
      const parsed: unknown = JSON.parse(json);
      if (!isValidConfig(parsed)) {
        set({ error: 'Invalid avatar configuration' });
        return;
      }
      const config = normalizeConfig(parsed);
      config.id = generateUUID();
      config.updatedAt = Date.now();
      set({ error: null });
      get().setConfig(config);
    } catch (e) {
      set({ error: 'Invalid JSON format' });
      console.error('Failed to import avatar:', e);
    }
  },
}));
