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
    { id: 'body_petite', name: 'Petite', icon: '🧒' },
    { id: 'body_slim', name: 'Slim', icon: '🧘' },
    { id: 'body_standard', name: 'Standard', icon: '👤' },
    { id: 'body_athletic', name: 'Athletic', icon: '💪' },
    { id: 'body_curvy', name: 'Curvy', icon: '🎪' },
    { id: 'body_broad', name: 'Broad', icon: '🏋️' },
    { id: 'body_plus', name: 'Plus', icon: '🧸' },
    { id: 'body_round', name: 'Round', icon: '⛄' },
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

  // Tops - mix-and-match upper garments
  tops: [
    { id: 'top_tshirt', name: 'T-Shirt', icon: '👕' },
    { id: 'top_longsleeve', name: 'Long Sleeve', icon: '🥼' },
    { id: 'top_hoodie', name: 'Hoodie', icon: '🧥' },
    { id: 'top_shirt', name: 'Shirt', icon: '👔' },
    { id: 'top_polo', name: 'Polo', icon: '🎽' },
    { id: 'top_jersey', name: 'Jersey', icon: '🏀' },
    { id: 'top_tank', name: 'Tank Top', icon: '🎗️' },
    { id: 'top_crop', name: 'Crop Top', icon: '✂️' },
    { id: 'top_blouse', name: 'Blouse', icon: '🌸' },
    { id: 'top_star', name: 'Star Tee', icon: '⭐' },
  ],

  // Bottoms - pants, shorts, skirts
  bottoms: [
    { id: 'bottom_jeans', name: 'Jeans', icon: '👖' },
    { id: 'bottom_pants', name: 'Pants', icon: '🩳' },
    { id: 'bottom_shorts', name: 'Shorts', icon: '🩳' },
    { id: 'bottom_joggers', name: 'Joggers', icon: '🏃' },
    { id: 'bottom_cargo', name: 'Cargo', icon: '🪖' },
    { id: 'bottom_skirt', name: 'Skirt', icon: '👗' },
  ],

  // Shoes
  shoes: [
    { id: 'shoes_sneakers', name: 'Sneakers', icon: '👟' },
    { id: 'shoes_stripe', name: 'Stripe Kicks', icon: '🛼' },
    { id: 'shoes_boots', name: 'Boots', icon: '🥾' },
    { id: 'shoes_slides', name: 'Slides', icon: '🩴' },
    { id: 'shoes_dress', name: 'Dress Shoes', icon: '👞' },
    { id: 'shoes_heels', name: 'Heels', icon: '👠' },
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
