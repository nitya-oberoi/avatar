import React from 'react';
import { useAvatarStore } from '@stores/avatarStore';
import type { AvatarColors } from '@apptypes/avatar';
import { SWATCHES_BY_KEY } from '../application/categories';
import styles from './creator.module.css';

const LABELS: Record<keyof AvatarColors, string> = {
  skinTone: 'Skin Tone',
  hairColor: 'Hair Color',
  eyeColor: 'Eye Color',
  outfitPrimary: 'Primary',
  outfitSecondary: 'Secondary',
  accentColor: 'Accent',
};

interface Props {
  colorKeys: (keyof AvatarColors)[];
}

export const ColorSwatches: React.FC<Props> = ({ colorKeys }) => {
  const colors = useAvatarStore((s) => s.config.colors);
  const selectColor = useAvatarStore((s) => s.selectColor);

  return (
    <>
      {colorKeys.map((key) => (
        <div key={key}>
          <div className={styles.colorKeyLabel}>{LABELS[key]}</div>
          <div className={styles.swatchRow}>
            {SWATCHES_BY_KEY[key].map((c) => {
              const selected = colors[key].toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  className={`${styles.swatch} ${selected ? styles.swatchSelected : ''}`}
                  style={{ background: c }}
                  onClick={() => selectColor(key, c)}
                  aria-label={`${LABELS[key]} ${c}`}
                  aria-pressed={selected}
                >
                  {selected && <span className={styles.swatchCheck} aria-hidden>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
};
