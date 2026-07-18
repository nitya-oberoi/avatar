import React from 'react';
import { CREATOR_CATEGORIES } from '../application/categories';
import styles from './creator.module.css';

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

export const CategorySidebar: React.FC<Props> = ({ activeId, onSelect }) => (
  <div className={`${styles.panel} ${styles.sidebar}`} role="tablist" aria-label="Customization categories">
    {CREATOR_CATEGORIES.map((c) => (
      <button
        key={c.id}
        role="tab"
        aria-selected={activeId === c.id}
        className={`${styles.catBtn} ${activeId === c.id ? styles.catBtnActive : ''}`}
        onClick={() => onSelect(c.id)}
      >
        <span className={styles.catIcon} aria-hidden>{c.icon}</span>
        {c.label}
      </button>
    ))}
  </div>
);
