/**
 * Default Configuration
 * Default values for avatar customization
 */

import { AvatarColors } from '@apptypes/avatar';

export const defaultColors: AvatarColors = {
  skinTone: '#E8B4A0',
  hairColor: '#3D2817',
  eyeColor: '#6B4423',
  outfitPrimary: '#FF6B9D',
  outfitSecondary: '#FFC857',
  accentColor: '#1E88E5',
};

/**
 * Trait Catalog
 * Master list of all available avatar traits
 * Easily extendable - just add more objects to each array
 */

export const traitCatalog = {
  // Body types - base character shape
  bodies: [
    { id: 'body_standard', name: 'Standard', icon: '👤' },
    { id: 'body_slim', name: 'Slim', icon: '🧘' },
    { id: 'body_athletic', name: 'Athletic', icon: '💪' },
    { id: 'body_curvy', name: 'Curvy', icon: '🎪' },
  ],

  // Head shapes - defines face structure
  heads: [
    { id: 'head_round', name: 'Round', icon: '⭕' },
    { id: 'head_oval', name: 'Oval', icon: '🔵' },
    { id: 'head_square', name: 'Square', icon: '⬜' },
    { id: 'head_heart', name: 'Heart', icon: '❤️' },
    { id: 'head_diamond', name: 'Diamond', icon: '💎' },
  ],

  // Hair styles - includes length and texture
  hair: [
    { id: 'hair_short', name: 'Short', icon: '✂️' },
    { id: 'hair_long', name: 'Long', icon: '💇' },
    { id: 'hair_curly', name: 'Curly', icon: '🌀' },
    { id: 'hair_braids', name: 'Braids', icon: '🧞' },
    { id: 'hair_bun', name: 'Bun', icon: '🎀' },
    { id: 'hair_spiky', name: 'Spiky', icon: '⚡' },
    { id: 'hair_wavy', name: 'Wavy', icon: '〰️' },
    { id: 'hair_bob', name: 'Bob', icon: '🎭' },
    { id: 'hair_pixie', name: 'Pixie', icon: '✨' },
    { id: 'hair_afro', name: 'Afro', icon: '🦱' },
    { id: 'hair_mohawk', name: 'Mohawk', icon: '🤘' },
    { id: 'hair_ponytail', name: 'Ponytail', icon: '🎏' },
    { id: 'hair_pigtails', name: 'Pigtails', icon: '👧' },
    { id: 'hair_topknot', name: 'Top Knot', icon: '🌰' },
    { id: 'hair_curly_long', name: 'Long Curls', icon: '🌀' },
    { id: 'hair_ringlets', name: 'Ringlets', icon: '💫' },
    { id: 'hair_bangs', name: 'Bangs', icon: '💇' },
    { id: 'hair_sidepart', name: 'Side Part', icon: '💠' },
    { id: 'hair_undercut', name: 'Undercut', icon: '🔻' },
    { id: 'hair_curly_bob', name: 'Curly Bob', icon: '🎶' },
    { id: 'hair_curly_pony', name: 'Curly Pony', icon: '🎐' },
    { id: 'hair_crew', name: 'Crew Cut', icon: '🧑' },
    { id: 'hair_quiff', name: 'Quiff', icon: '🔼' },
    { id: 'hair_fauxhawk', name: 'Faux Hawk', icon: '🦔' },
    { id: 'hair_tousled', name: 'Tousled', icon: '💨' },
    { id: 'hair_swoop', name: 'Swoop', icon: '🌊' },
    { id: 'hair_shaggy', name: 'Shaggy', icon: '🧹' },
  ],

  // Outfit options - complete looks
  outfits: [
    { id: 'outfit_casual', name: 'Casual', icon: '👕' },
    { id: 'outfit_formal', name: 'Formal', icon: '🤵' },
    { id: 'outfit_sporty', name: 'Sporty', icon: '🏃' },
    { id: 'outfit_magical', name: 'Magical', icon: '✨' },
    { id: 'outfit_explorer', name: 'Explorer', icon: '🧭' },
    { id: 'outfit_futuristic', name: 'Futuristic', icon: '🤖' },
    { id: 'outfit_vintage', name: 'Vintage', icon: '📻' },
    { id: 'outfit_boho', name: 'Boho', icon: '🌻' },
  ],

  // Accessories - optional additions (multi-select)
  accessories: [
    // Eyewear
    { id: 'acc_glasses', name: 'Glasses', icon: '👓' },
    { id: 'acc_sunglasses', name: 'Sunglasses', icon: '😎' },
    { id: 'acc_goggles', name: 'Goggles', icon: '🥽' },

    // Headwear
    { id: 'acc_hat', name: 'Hat', icon: '🎩' },
    { id: 'acc_beanie', name: 'Beanie', icon: '🎅' },
    { id: 'acc_crown', name: 'Crown', icon: '👑' },
    { id: 'acc_tiara', name: 'Tiara', icon: '✨' },
    { id: 'acc_cap', name: 'Cap', icon: '🧢' },
    { id: 'acc_helmet', name: 'Helmet', icon: '🏍️' },

    // Body accessories
    { id: 'acc_backpack', name: 'Backpack', icon: '🎒' },
    { id: 'acc_scarf', name: 'Scarf', icon: '🧣' },
    { id: 'acc_necklace', name: 'Necklace', icon: '📿' },
    { id: 'acc_earrings', name: 'Earrings', icon: '💎' },
    { id: 'acc_watch', name: 'Watch', icon: '⌚' },
    { id: 'acc_bag', name: 'Bag', icon: '👜' },

    // Companion/Held items
    { id: 'acc_pet', name: 'Pet', icon: '🐕' },
    { id: 'acc_sword', name: 'Sword', icon: '⚔️' },
    { id: 'acc_staff', name: 'Staff', icon: '🪄' },
  ],

  // Facial expressions & emotions
  expressions: [
    { id: 'expr_neutral', name: 'Neutral', icon: '😐' },
    { id: 'expr_happy', name: 'Happy', icon: '😊' },
    { id: 'expr_sad', name: 'Sad', icon: '😢' },
    { id: 'expr_surprised', name: 'Surprised', icon: '😮' },
    { id: 'expr_angry', name: 'Angry', icon: '😠' },
    { id: 'expr_cool', name: 'Cool', icon: '😎' },
    { id: 'expr_love', name: 'In Love', icon: '😍' },
    { id: 'expr_wink', name: 'Wink', icon: '😉' },
  ],
};

/**
 * Color Palettes
 * Predefined color combinations for quick selection
 * Easy to add more - just add a new object with color hex codes
 */

export const colorPalettes = [
  {
    name: 'Warm Summer',
    skinTone: '#E8B4A0',
    hairColor: '#8B4513',
    eyeColor: '#6B4423',
    outfitPrimary: '#FF6B9D',
    outfitSecondary: '#FFC857',
    accentColor: '#FFB6C1',
  },
  {
    name: 'Cool Winter',
    skinTone: '#D4A5A5',
    hairColor: '#1C1C1C',
    eyeColor: '#4A90E2',
    outfitPrimary: '#00A8E8',
    outfitSecondary: '#B0E0E6',
    accentColor: '#1E88E5',
  },
  {
    name: 'Sunset',
    skinTone: '#F4A460',
    hairColor: '#FF6347',
    eyeColor: '#FF4500',
    outfitPrimary: '#FF6B6B',
    outfitSecondary: '#FFD93D',
    accentColor: '#FF8C42',
  },
  {
    name: 'Forest',
    skinTone: '#C9B8A3',
    hairColor: '#2D5016',
    eyeColor: '#6B8E23',
    outfitPrimary: '#228B22',
    outfitSecondary: '#90EE90',
    accentColor: '#3CB371',
  },
  {
    name: 'Bubblegum',
    skinTone: '#FDBCB4',
    hairColor: '#FF69B4',
    eyeColor: '#FF1493',
    outfitPrimary: '#FFB6C1',
    outfitSecondary: '#FFC0CB',
    accentColor: '#FF69B4',
  },
  {
    name: 'Ocean Breeze',
    skinTone: '#D9BFA8',
    hairColor: '#2C3E50',
    eyeColor: '#3498DB',
    outfitPrimary: '#1ABC9C',
    outfitSecondary: '#3498DB',
    accentColor: '#2980B9',
  },
  {
    name: 'Midnight',
    skinTone: '#C0A080',
    hairColor: '#1A1A1A',
    eyeColor: '#2C3E50',
    outfitPrimary: '#34495E',
    outfitSecondary: '#7F8C8D',
    accentColor: '#2C3E50',
  },
  {
    name: 'Lavender Dream',
    skinTone: '#F5D5D5',
    hairColor: '#7851A9',
    eyeColor: '#9370DB',
    outfitPrimary: '#DDA0DD',
    outfitSecondary: '#E6B8FF',
    accentColor: '#9370DB',
  },
  {
    name: 'Peach',
    skinTone: '#FDBEA3',
    hairColor: '#CD853F',
    eyeColor: '#D2691E',
    outfitPrimary: '#FFB347',
    outfitSecondary: '#FFDAB9',
    accentColor: '#FF8C69',
  },
  {
    name: 'Mint Green',
    skinTone: '#E0D4C8',
    hairColor: '#3D7044',
    eyeColor: '#52B788',
    outfitPrimary: '#52B788',
    outfitSecondary: '#A8D5BA',
    accentColor: '#2D6A4F',
  },
];

/**
 * UI Configuration
 * Settings for the avatar builder interface
 */

export const uiConfig = {
  // Canvas and preview sizes
  avatarCanvasSize: 300,
  previewSize: 150,
  colorPickerSize: 40,

  // Animation and transitions
  animationDuration: 300, // milliseconds

  // Constraints
  maxAccessories: 5,
  maxUndoStates: 20,

  // Colors
  brandPrimary: '#667eea',
  brandSecondary: '#764ba2',
  backgroundColor: '#f5f5f5',
};

/**
 * Quick presets - full avatar configurations
 * These are "looks" users can quickly apply
 * Useful for inspiration or starting templates
 */

export const avatarPresets = [
  {
    name: 'Adventure Seeker',
    selection: {
      body: 'body_athletic',
      head: 'head_square',
      hair: 'hair_short',
      outfit: 'outfit_explorer',
      accessories: ['acc_backpack', 'acc_hat'],
      expression: 'expr_happy',
    },
    colors: {
      skinTone: '#D4A574',
      hairColor: '#5C4033',
      eyeColor: '#8D6E63',
      outfitPrimary: '#8D6E63',
      outfitSecondary: '#D7CCC8',
      accentColor: '#FF6F00',
    },
  },
  {
    name: 'Magical Wizard',
    selection: {
      body: 'body_slim',
      head: 'head_heart',
      hair: 'hair_wavy',
      outfit: 'outfit_magical',
      accessories: ['acc_staff', 'acc_crown'],
      expression: 'expr_cool',
    },
    colors: {
      skinTone: '#F5E6D3',
      hairColor: '#3F2C1D',
      eyeColor: '#7851A9',
      outfitPrimary: '#4A148C',
      outfitSecondary: '#7B1FA2',
      accentColor: '#FFD700',
    },
  },
  {
    name: 'Chill Vibe',
    selection: {
      body: 'body_standard',
      head: 'head_round',
      hair: 'hair_curly',
      outfit: 'outfit_casual',
      accessories: ['acc_sunglasses'],
      expression: 'expr_happy',
    },
    colors: {
      skinTone: '#E8B4A0',
      hairColor: '#8B4513',
      eyeColor: '#D4A574',
      outfitPrimary: '#FF6B9D',
      outfitSecondary: '#FFC857',
      accentColor: '#1E88E5',
    },
  },
];
