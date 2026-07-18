/**
 * Core Avatar Type Definitions
 * These types define the complete structure of an avatar configuration
 */

// Avatar categories
export type AvatarCategory = 'body' | 'head' | 'hair' | 'top' | 'bottom' | 'shoes' | 'accessories' | 'expression';

// Individual trait types
export interface TraitOption {
  id: string;
  name: string;
  category: AvatarCategory;
  preview?: string;
  colorable: boolean;
  description?: string;
}

// Color representation (hex format)
export type HexColor = string; // e.g. "#FF5733"

// Avatar customization colors
export interface AvatarColors {
  skinTone: HexColor;
  hairColor: HexColor;
  eyeColor: HexColor;
  outfitPrimary: HexColor;
  outfitSecondary: HexColor;
  accentColor: HexColor;
}

// Current selection state
export interface AvatarSelection {
  gender: 'male' | 'female';
  body: string;
  head: string;
  hair: string;
  top: string;
  bottom: string;
  shoes: string;
  accessories: string[];
  expression: string;
}

// Complete avatar configuration
export interface AvatarConfig {
  id: string;
  version: number;
  name?: string;
  selection: AvatarSelection;
  colors: AvatarColors;
  createdAt: number;
  updatedAt: number;
}

// Preset/template for quick creation
export interface AvatarPreset {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  config: AvatarConfig;
  category?: 'adventure' | 'casual' | 'fantasy' | 'futuristic' | 'custom';
}

// Export formats
export type ExportFormat = 'png' | 'jpg' | 'svg' | 'json';

// Export options
export interface ExportOptions {
  format: ExportFormat;
  width: number;
  height: number;
  transparent?: boolean;
  quality?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// History state for undo/redo
export interface HistoryState {
  past: AvatarConfig[];
  present: AvatarConfig;
  future: AvatarConfig[];
}
