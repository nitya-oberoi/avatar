import React, { useEffect, useState } from 'react';
import { useAvatarStore } from '@stores/avatarStore';
import {
  createPreset,
  randomizeAvatar,
  type AvatarAnimation,
  type AvatarPreset,
} from '@/avatar-core';
import { appCatalog, appDefaultColors } from '../application/avatarCatalog';
import { CREATOR_CATEGORIES } from '../application/categories';
import { CategorySidebar } from './CategorySidebar';
import { ItemGrid } from './ItemGrid';
import { ColorSwatches } from './ColorSwatches';
import { AvatarStage } from './AvatarStage';
import { PresetBar } from './PresetBar';
import styles from './creator.module.css';

// Mock ownership until a real wallet/inventory exists.
const COINS = 12450;
const UNLOCKED_IDS: string[] = [];

// Sensible wardrobe applied when the user switches gender.
const GENDER_DEFAULTS: Record<'male' | 'female', { hair: string; top: string; bottom: string; shoes: string }> = {
  male: { hair: 'hair_crew', top: 'top_tshirt', bottom: 'bottom_jeans', shoes: 'shoes_sneakers' },
  female: { hair: 'hair_long', top: 'top_blouse', bottom: 'bottom_skirt', shoes: 'shoes_sneakers' },
};

export const CreatorScreen: React.FC = () => {
  const config = useAvatarStore((s) => s.config);
  const loadFromLocal = useAvatarStore((s) => s.loadFromLocal);
  const saveToLocal = useAvatarStore((s) => s.saveToLocal);
  const randomize = useAvatarStore((s) => s.randomizeAvatar);
  const setConfig = useAvatarStore((s) => s.setConfig);
  const selectTrait = useAvatarStore((s) => s.selectTrait);
  const undo = useAvatarStore((s) => s.undo);
  const redo = useAvatarStore((s) => s.redo);
  const resetAvatar = useAvatarStore((s) => s.resetAvatar);
  const canUndo = useAvatarStore((s) => s.history.past.length > 0);
  const canRedo = useAvatarStore((s) => s.history.future.length > 0);
  const gender = config.selection.gender;

  const [activeCategoryId, setActiveCategoryId] = useState('body');
  const [animation, setAnimation] = useState<AvatarAnimation>('idle');
  const [presets, setPresets] = useState<AvatarPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load persisted avatar (client-only).
  useEffect(() => { loadFromLocal(); }, [loadFromLocal]);

  // Debounced autosave through the repository-backed store.
  useEffect(() => {
    const t = setTimeout(() => saveToLocal(), 400);
    return () => clearTimeout(t);
  }, [config, saveToLocal]);

  // Seed a few varied presets on mount (in-memory for now).
  useEffect(() => {
    setPresets(
      Array.from({ length: 5 }, (_, i) =>
        createPreset(randomizeAvatar(appCatalog, appDefaultColors), `Look ${i + 1}`),
      ),
    );
  }, []);

  const category = CREATOR_CATEGORIES.find((c) => c.id === activeCategoryId) ?? CREATOR_CATEGORIES[0];

  const onSave = () => {
    saveToLocal();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const onSelectPreset = (p: AvatarPreset) => {
    setConfig(p.config);
    setActivePresetId(p.id);
  };

  const onNewPreset = () => {
    const p = createPreset(config, `Look ${presets.length + 1}`);
    setPresets((list) => [...list, p]);
    setActivePresetId(p.id);
  };

  const onGender = (g: 'male' | 'female') => {
    selectTrait('gender', g);
    const d = GENDER_DEFAULTS[g];
    selectTrait('hair', d.hair);
    selectTrait('top', d.top);
    selectTrait('bottom', d.bottom);
    selectTrait('shoes', d.shoes);
  };

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>AVATAR CREATOR</h1>
          <p className={styles.subtitle}>Create your unique avatar</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.coins} title="Coin balance">
            <span className={styles.coinDot} aria-hidden />
            {COINS.toLocaleString()}
            <button className={styles.coinPlus} aria-label="Add coins">+</button>
          </div>
          <div className={styles.tools}>
            <button className={styles.toolBtn} onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo">↶</button>
            <button className={styles.toolBtn} onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo">↷</button>
            <button className={styles.toolBtn} onClick={resetAvatar} aria-label="Reset" title="Reset">⟳</button>
            <button className={styles.toolBtn} onClick={randomize} aria-label="Randomize avatar" title="Randomize">🎲</button>
          </div>
          <button className={styles.saveBtn} onClick={onSave}>{saved ? 'SAVED ✓' : 'SAVE AVATAR'}</button>
        </div>
      </header>

      <div className={styles.body}>
        <CategorySidebar activeId={activeCategoryId} onSelect={setActiveCategoryId} />

        <div className={styles.panel}>
          <div className={styles.genderRow} role="group" aria-label="Gender">
            {(['female', 'male'] as const).map((g) => (
              <button
                key={g}
                className={`${styles.genderBtn} ${gender === g ? styles.genderBtnActive : ''}`}
                onClick={() => onGender(g)}
                aria-pressed={gender === g}
              >
                {g === 'female' ? '♀ Female' : '♂ Male'}
              </button>
            ))}
          </div>
          {category.slot && (
            <>
              <div className={styles.sectionLabel}>{category.label} Style</div>
              <ItemGrid slot={category.slot} unlockedIds={UNLOCKED_IDS} />
            </>
          )}
          {category.colorKeys && (
            <>
              <div className={styles.sectionLabel} style={{ marginTop: category.slot ? 18 : 2 }}>
                {category.label} Color
              </div>
              <ColorSwatches colorKeys={category.colorKeys} />
            </>
          )}
        </div>

        <AvatarStage animation={animation} onAnimation={setAnimation} />
      </div>

      <PresetBar
        presets={presets}
        activeId={activePresetId}
        onSelect={onSelectPreset}
        onNew={onNewPreset}
      />
    </div>
  );
};

export default CreatorScreen;
