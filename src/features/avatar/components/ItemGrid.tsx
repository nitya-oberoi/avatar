import React from 'react';
import { useAvatarStore } from '@stores/avatarStore';
import type { AvatarSelection } from '@apptypes/avatar';
import {
  renderHairThumbnail,
  renderHeadThumbnail,
  renderExpressionThumbnail,
  renderAccessoryThumbnail,
  renderBodyThumbnail,
  renderTopThumbnail,
  renderBottomThumbnail,
  renderShoesThumbnail,
} from '@lib/avatarRenderer';
import { isUnlocked, priceOf, type AvatarSlot } from '@/avatar-core';
import { appCatalog } from '../application/avatarCatalog';
import styles from './creator.module.css';

type SingleSlot = 'body' | 'head' | 'hair' | 'top' | 'bottom' | 'shoes' | 'expression';

interface Props {
  slot: AvatarSlot;
  unlockedIds: string[];
}

export const ItemGrid: React.FC<Props> = ({ slot, unlockedIds }) => {
  const config = useAvatarStore((s) => s.config);
  const colors = useAvatarStore((s) => s.config.colors);
  const selectTrait = useAvatarStore((s) => s.selectTrait);
  const addAccessory = useAvatarStore((s) => s.addAccessory);
  const removeAccessory = useAvatarStore((s) => s.removeAccessory);

  const items = appCatalog.bySlot[slot] ?? [];
  const isAccessories = slot === 'accessories';

  // Every slot renders a live avatar preview instead of an emoji icon.
  const thumbFor = (id: string): string => {
    switch (slot) {
      case 'hair': return renderHairThumbnail(id, colors.hairColor);
      case 'head': return renderHeadThumbnail(id, colors.skinTone);
      case 'body': return renderBodyThumbnail(id, colors);
      case 'top': return renderTopThumbnail(id, colors);
      case 'bottom': return renderBottomThumbnail(id, colors);
      case 'shoes': return renderShoesThumbnail(id, colors);
      case 'expression': return renderExpressionThumbnail(id, colors);
      case 'accessories': return renderAccessoryThumbnail(id, colors);
      default: return '';
    }
  };
  const selectedIds = isAccessories
    ? config.selection.accessories
    : [config.selection[slot as SingleSlot]];

  const pick = (id: string) => {
    if (!isAccessories) {
      selectTrait(slot as keyof AvatarSelection, id);
    } else if (config.selection.accessories.includes(id)) {
      removeAccessory(id);
    } else {
      addAccessory(id);
    }
  };

  return (
    <div className={styles.grid} role="listbox" aria-label={`${slot} items`}>
      {items.map((it) => {
        const selected = selectedIds.includes(it.id);
        const locked = !isUnlocked(it, unlockedIds);
        return (
          <button
            key={it.id}
            role="option"
            aria-selected={selected}
            className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
            onClick={() => (locked ? undefined : pick(it.id))}
            title={locked ? `${it.name} — locked` : it.name}
          >
            <span
              className={styles.thumb}
              aria-hidden
              dangerouslySetInnerHTML={{ __html: thumbFor(it.id) }}
            />
            <span className={styles.cardName}>{it.name}</span>
            {selected && <span className={styles.check} aria-hidden>✓</span>}
            {it.isPremium && !locked && <span className={styles.gem} aria-hidden>💎</span>}
            {locked && (
              <>
                <span className={styles.price}>{priceOf(it)}</span>
                <span className={styles.locked} aria-hidden>🔒</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};
