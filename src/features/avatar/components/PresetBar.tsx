import React from 'react';
import { renderAvatarSVG } from '@lib/avatarRenderer';
import type { AvatarPreset } from '@/avatar-core';
import styles from './creator.module.css';

interface Props {
  presets: AvatarPreset[];
  activeId: string | null;
  onSelect: (preset: AvatarPreset) => void;
  onNew: () => void;
}

export const PresetBar: React.FC<Props> = ({ presets, activeId, onSelect, onNew }) => (
  <div className={styles.presetBar} aria-label="Saved presets">
    {presets.map((p) => (
      <button
        key={p.id}
        className={`${styles.slot} ${activeId === p.id ? styles.slotActive : ''}`}
        onClick={() => onSelect(p)}
        title={p.name}
        aria-pressed={activeId === p.id}
      >
        <span className={styles.slotSvg} dangerouslySetInnerHTML={{ __html: renderAvatarSVG(p.config, 84) }} />
        {activeId === p.id && <span className={styles.slotStar} aria-hidden>★</span>}
      </button>
    ))}
    <button className={`${styles.slot} ${styles.newSlot}`} onClick={onNew}>
      <span className={styles.newSlotPlus} aria-hidden>+</span>
      NEW SLOT
    </button>
  </div>
);
