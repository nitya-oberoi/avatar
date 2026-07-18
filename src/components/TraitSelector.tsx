/**
 * TraitSelector Component
 * Allows user to select different avatar traits
 */

import React from 'react';
import { useAvatarStore } from '@stores/avatarStore';
import { AvatarCategory, AvatarColors } from '@apptypes/avatar';
import { traitCatalog, colorPalettes } from '@config/defaults';
import styles from './TraitSelector.module.css';

/** Shape of every entry in the trait catalog. */
interface CatalogEntry {
  id: string;
  name: string;
  icon: string;
}

interface TraitSelectorProps {
  category: AvatarCategory;
  onSelect?: (traitId: string) => void;
}

/**
 * TraitSelector: Display grid of options for a category
 */
export const TraitSelector: React.FC<TraitSelectorProps> = ({ category, onSelect }) => {
  const config = useAvatarStore((state) => state.config);
  const selectTrait = useAvatarStore((state) => state.selectTrait);
  const addAccessory = useAvatarStore((state) => state.addAccessory);
  const removeAccessory = useAvatarStore((state) => state.removeAccessory);

  let traits: CatalogEntry[] = [];
  let selectedId = '';

  switch (category) {
    case 'body':
      traits = traitCatalog.bodies;
      selectedId = config.selection.body;
      break;
    case 'head':
      traits = traitCatalog.heads;
      selectedId = config.selection.head;
      break;
    case 'hair':
      traits = traitCatalog.hair;
      selectedId = config.selection.hair;
      break;
    case 'top':
      traits = traitCatalog.tops;
      selectedId = config.selection.top;
      break;
    case 'bottom':
      traits = traitCatalog.bottoms;
      selectedId = config.selection.bottom;
      break;
    case 'shoes':
      traits = traitCatalog.shoes;
      selectedId = config.selection.shoes;
      break;
    case 'accessories':
      traits = traitCatalog.accessories;
      selectedId = ''; // Accessories are multi-select
      break;
    case 'expression':
      traits = traitCatalog.expressions;
      selectedId = config.selection.expression;
      break;
  }

  const handleSelect = (traitId: string) => {
    if (category === 'accessories') {
      // Toggle accessory
      if (config.selection.accessories.includes(traitId)) {
        removeAccessory(traitId);
      } else {
        addAccessory(traitId);
      }
    } else {
      // Single select
      selectTrait(category, traitId);
    }
    onSelect?.(traitId);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </h3>
      <div className={styles.grid}>
        {traits.map((trait) => {
          const isSelected =
            category === 'accessories'
              ? config.selection.accessories.includes(trait.id)
              : trait.id === selectedId;

          return (
            <button
              key={trait.id}
              className={`${styles.option} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleSelect(trait.id)}
              title={trait.name}
              aria-pressed={isSelected}
            >
              <span className={styles.icon}>{trait.icon}</span>
              <span className={styles.name}>{trait.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ColorPalettePicker: Display predefined color palettes
 */
export const ColorPalettePicker: React.FC = () => {
  const selectColor = useAvatarStore((state) => state.selectColor);

  const handlePaletteSelect = (palette: (typeof colorPalettes)[0]) => {
    selectColor('skinTone', palette.skinTone);
    selectColor('hairColor', palette.hairColor);
    selectColor('eyeColor', palette.eyeColor);
    selectColor('outfitPrimary', palette.outfitPrimary);
    selectColor('outfitSecondary', palette.outfitSecondary);
    selectColor('accentColor', palette.accentColor);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Color Palettes</h3>
      <div className={styles.paletteGrid}>
        {colorPalettes.map((palette) => (
          <button
            key={palette.name}
            className={styles.palette}
            onClick={() => handlePaletteSelect(palette)}
            title={palette.name}
          >
            <div className={styles.palettePreview}>
              <div
                className={styles.paletteColor}
                style={{ backgroundColor: palette.skinTone }}
              />
              <div
                className={styles.paletteColor}
                style={{ backgroundColor: palette.hairColor }}
              />
              <div
                className={styles.paletteColor}
                style={{ backgroundColor: palette.outfitPrimary }}
              />
            </div>
            <span className={styles.paletteName}>{palette.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * ColorCustomizer: Fine-grained color picker
 */
interface ColorCustomizerProps {
  colorKey: keyof AvatarColors;
  label: string;
}

export const ColorCustomizer: React.FC<ColorCustomizerProps> = ({ colorKey, label }) => {
  const colors = useAvatarStore((state) => state.config.colors);
  const selectColor = useAvatarStore((state) => state.selectColor);

  const currentColor = colors[colorKey] || '#000000';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectColor(colorKey, e.target.value);
  };

  return (
    <div className={styles.colorCustomizer}>
      <label className={styles.colorLabel}>{label}</label>
      <div className={styles.colorInputWrapper}>
        <input
          type="color"
          value={currentColor}
          onChange={handleChange}
          className={styles.colorInput}
        />
        <span className={styles.colorValue}>{currentColor}</span>
      </div>
    </div>
  );
};

export default TraitSelector;
