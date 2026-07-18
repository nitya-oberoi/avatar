import React from 'react';
import { useAvatarStore } from '@stores/avatarStore';
import type { AvatarSelection } from '@apptypes/avatar';
import { renderHairThumbnail, renderHeadThumbnail } from '@lib/avatarRenderer';
import { isUnlocked, priceOf, type AvatarSlot } from '@/avatar-core';
import { appCatalog } from '../application/avatarCatalog';
import styles from './creator.module.css';

type SingleSlot = 'body' | 'head' | 'hair' | 'outfit' | 'expression';

interface Props {
  slot: AvatarSlot;
  unlockedIds: string[];
}

export const ItemGrid: React.FC<Props> = ({ slot, unlockedIds }) => {
  const config = useAvatarStore((s) => s.config);
  const hairColor = useAvatarStore((s) => s.config.colors.hairColor);
  const skinTone = useAvatarStore((s) => s.config.colors.skinTone);
  const selectTrait = useAvatarStore((s) => s.selectTrait);
  const addAccessory = useAvatarStore((s) => s.addAccessory);
  const removeAccessory = useAvatarStore((s) => s.removeAccessory);

  const items = appCatalog.bySlot[slot] ?? [];
  const isAccessories = slot === 'accessories';
  const isHair = slot === 'hair';
  const isHead = slot === 'head';
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
            {isHair || isHead ? (
              <span
                className={styles.thumb}
                aria-hidden
                dangerouslySetInnerHTML={{
                  __html: isHair ? renderHairThumbnail(it.id, hairColor) : renderHeadThumbnail(it.id, skinTone),
                }}
              />
            ) : (
              <span aria-hidden>{it.icon ?? '◇'}</span>
            )}
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
