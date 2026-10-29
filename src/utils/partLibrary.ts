import {
  BodyPartCategory,
  CharacterViewAngle,
  PartDefinition,
  PartSpriteSet,
  VisemeShape,
  EyeExpression,
} from '../types/studio';

/**
 * Standard Z-index layers per angle for proper 2D cartoon layering:
 * In Front: Torso < Head < Ears < Eyes/Nose/Mouth < Eyebrows < Hair < Mustache < Clothes
 * In Back: Clothes < Torso < Head < Ears < Hair (Hair covers back of head!)
 */
export const DEFAULT_Z_INDICES: Record<BodyPartCategory, Record<CharacterViewAngle, number>> = {
  skinColor: { front: 0, three_quarter_front: 0, profile: 0, three_quarter_back: 0, back: 0 },
  torso: { front: 10, three_quarter_front: 10, profile: 10, three_quarter_back: 10, back: 10 },
  clothesBottom: { front: 12, three_quarter_front: 12, profile: 12, three_quarter_back: 12, back: 12 },
  shoes: { front: 14, three_quarter_front: 14, profile: 14, three_quarter_back: 14, back: 14 },
  clothesTop: { front: 20, three_quarter_front: 20, profile: 20, three_quarter_back: 20, back: 20 },
  head: { front: 30, three_quarter_front: 30, profile: 30, three_quarter_back: 30, back: 30 },
  ears: { front: 28, three_quarter_front: 28, profile: 31, three_quarter_back: 31, back: 31 },
  earrings: { front: 29, three_quarter_front: 29, profile: 32, three_quarter_back: 32, back: 32 },
  hair: { front: 50, three_quarter_front: 50, profile: 50, three_quarter_back: 55, back: 55 },
  eyes: { front: 35, three_quarter_front: 35, profile: 35, three_quarter_back: 5, back: 5 },
  eyebrows: { front: 36, three_quarter_front: 36, profile: 36, three_quarter_back: 6, back: 6 },
  nose: { front: 37, three_quarter_front: 37, profile: 37, three_quarter_back: 7, back: 7 },
  mouth: { front: 38, three_quarter_front: 38, profile: 38, three_quarter_back: 8, back: 8 },
  mustache: { front: 40, three_quarter_front: 40, profile: 40, three_quarter_back: 9, back: 9 },
  hands: { front: 60, three_quarter_front: 60, profile: 60, three_quarter_back: 60, back: 60 },
};

// -------------------------------------------------------------
// HELPER TO CREATE CLEAN COLORABLE FLAT-VECTOR SVG STRINGS
// -------------------------------------------------------------
function makeSvg(inner: string, viewBox = '0 0 100 100'): string {
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor">${inner}</svg>`;
}

// -------------------------------------------------------------
// PRESET PARTS CATALOG (At least 6 variants per category, each with 5 angles)
// -------------------------------------------------------------
export const PART_LIBRARY: PartDefinition[] = [
  // ===================== 1. CLOTHES TOP =====================
  {
    id: 'top_kurta',
    category: 'clothesTop',
    name: 'Classic Indian Kurta',
    colorable: true,
    defaultColor: '#10b981',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesTop,
    sprites: {
      front: makeSvg(`
        <path d="M 30 20 L 70 20 L 78 70 L 22 70 Z" fill="var(--part-color, #10b981)" stroke="#064e3b" stroke-width="3" />
        <path d="M 46 20 L 50 38 L 54 20" stroke="#064e3b" stroke-width="2" />
        <line x1="50" y1="38" x2="50" y2="54" stroke="#064e3b" stroke-width="2" />
        <circle cx="50" cy="42" r="1.5" fill="#fef08a" />
        <circle cx="50" cy="48" r="1.5" fill="#fef08a" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 32 20 L 68 20 L 75 70 L 25 70 Z" fill="var(--part-color, #10b981)" stroke="#064e3b" stroke-width="3" />
        <path d="M 54 20 L 58 38 L 62 20" stroke="#064e3b" stroke-width="2" />
        <line x1="58" y1="38" x2="58" y2="54" stroke="#064e3b" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 38 20 L 64 20 L 66 70 L 34 70 Z" fill="var(--part-color, #10b981)" stroke="#064e3b" stroke-width="3" />
        <line x1="62" y1="25" x2="62" y2="55" stroke="#064e3b" stroke-width="2" stroke-dasharray="2 2" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 32 20 L 68 20 L 75 70 L 25 70 Z" fill="var(--part-color, #10b981)" stroke="#064e3b" stroke-width="3" />
        <path d="M 38 22 Q 50 26 62 22" stroke="#064e3b" stroke-width="2" />
      `),
      back: makeSvg(`
        <path d="M 30 20 L 70 20 L 78 70 L 22 70 Z" fill="var(--part-color, #10b981)" stroke="#064e3b" stroke-width="3" />
        <path d="M 35 20 Q 50 25 65 20" stroke="#064e3b" stroke-width="2" />
        <line x1="50" y1="24" x2="50" y2="68" stroke="#064e3b" stroke-width="1.5" stroke-dasharray="3 3" />
      `),
    },
  },
  {
    id: 'top_tshirt',
    category: 'clothesTop',
    name: 'Round Neck T-Shirt',
    colorable: true,
    defaultColor: '#3b82f6',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesTop,
    sprites: {
      front: makeSvg(`
        <path d="M 28 22 L 72 22 L 76 65 L 24 65 Z" fill="var(--part-color, #3b82f6)" stroke="#1e3a8a" stroke-width="3" />
        <path d="M 40 22 Q 50 32 60 22" stroke="#1e3a8a" stroke-width="2.5" fill="#f8fafc" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 30 22 L 70 22 L 74 65 L 26 65 Z" fill="var(--part-color, #3b82f6)" stroke="#1e3a8a" stroke-width="3" />
        <path d="M 46 22 Q 55 31 64 22" stroke="#1e3a8a" stroke-width="2.5" fill="#f8fafc" />
      `),
      profile: makeSvg(`
        <path d="M 36 22 L 64 22 L 65 65 L 35 65 Z" fill="var(--part-color, #3b82f6)" stroke="#1e3a8a" stroke-width="3" />
        <path d="M 52 22 Q 58 28 62 22" stroke="#1e3a8a" stroke-width="2" fill="#f8fafc" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 30 22 L 70 22 L 74 65 L 26 65 Z" fill="var(--part-color, #3b82f6)" stroke="#1e3a8a" stroke-width="3" />
        <path d="M 44 22 Q 54 26 64 22" stroke="#1e3a8a" stroke-width="2" />
      `),
      back: makeSvg(`
        <path d="M 28 22 L 72 22 L 76 65 L 24 65 Z" fill="var(--part-color, #3b82f6)" stroke="#1e3a8a" stroke-width="3" />
        <path d="M 38 22 Q 50 27 62 22" stroke="#1e3a8a" stroke-width="2" />
      `),
    },
  },
  {
    id: 'top_shirt',
    category: 'clothesTop',
    name: 'Formal Buttoned Shirt',
    colorable: true,
    defaultColor: '#f1f5f9',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesTop,
    sprites: {
      front: makeSvg(`
        <path d="M 28 20 L 72 20 L 76 68 L 24 68 Z" fill="var(--part-color, #f1f5f9)" stroke="#334155" stroke-width="3" />
        <polygon points="40,20 50,28 46,20" fill="#cbd5e1" stroke="#334155" />
        <polygon points="60,20 50,28 54,20" fill="#cbd5e1" stroke="#334155" />
        <line x1="50" y1="28" x2="50" y2="68" stroke="#334155" stroke-width="2" />
        <circle cx="50" cy="38" r="1.5" fill="#475569" /><circle cx="50" cy="48" r="1.5" fill="#475569" /><circle cx="50" cy="58" r="1.5" fill="#475569" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 30 20 L 70 20 L 74 68 L 26 68 Z" fill="var(--part-color, #f1f5f9)" stroke="#334155" stroke-width="3" />
        <polygon points="48,20 58,28 54,20" fill="#cbd5e1" stroke="#334155" />
        <polygon points="66,20 58,28 62,20" fill="#cbd5e1" stroke="#334155" />
        <line x1="58" y1="28" x2="58" y2="68" stroke="#334155" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 36 20 L 64 20 L 66 68 L 34 68 Z" fill="var(--part-color, #f1f5f9)" stroke="#334155" stroke-width="3" />
        <polygon points="56,20 62,26 60,20" fill="#cbd5e1" stroke="#334155" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 30 20 L 70 20 L 74 68 L 26 68 Z" fill="var(--part-color, #f1f5f9)" stroke="#334155" stroke-width="3" />
        <path d="M 34 24 L 66 24" stroke="#94a3b8" stroke-width="2" />
      `),
      back: makeSvg(`
        <path d="M 28 20 L 72 20 L 76 68 L 24 68 Z" fill="var(--part-color, #f1f5f9)" stroke="#334155" stroke-width="3" />
        <path d="M 32 25 L 68 25" stroke="#94a3b8" stroke-width="2" />
        <line x1="50" y1="25" x2="50" y2="68" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="2 2" />
      `),
    },
  },
  {
    id: 'top_denim_jacket',
    category: 'clothesTop',
    name: 'Denim Biker Jacket',
    colorable: true,
    defaultColor: '#1e40af',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesTop,
    sprites: {
      front: makeSvg(`
        <path d="M 26 18 L 74 18 L 78 70 L 22 70 Z" fill="var(--part-color, #1e40af)" stroke="#172554" stroke-width="3" />
        <polygon points="36,18 48,34 32,32" fill="#3b82f6" stroke="#172554" stroke-width="1.5" />
        <polygon points="64,18 52,34 68,32" fill="#3b82f6" stroke="#172554" stroke-width="1.5" />
        <line x1="50" y1="34" x2="50" y2="70" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2 2" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 28 18 L 72 18 L 76 70 L 24 70 Z" fill="var(--part-color, #1e40af)" stroke="#172554" stroke-width="3" />
        <polygon points="46,18 56,34 42,32" fill="#3b82f6" stroke="#172554" />
        <polygon points="68,18 60,34 72,32" fill="#3b82f6" stroke="#172554" />
      `),
      profile: makeSvg(`
        <path d="M 34 18 L 66 18 L 68 70 L 32 70 Z" fill="var(--part-color, #1e40af)" stroke="#172554" stroke-width="3" />
        <polygon points="56,18 64,32 54,30" fill="#3b82f6" stroke="#172554" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 28 18 L 72 18 L 76 70 L 24 70 Z" fill="var(--part-color, #1e40af)" stroke="#172554" stroke-width="3" />
        <line x1="36" y1="26" x2="64" y2="26" stroke="#f59e0b" stroke-width="1.5" />
      `),
      back: makeSvg(`
        <path d="M 26 18 L 74 18 L 78 70 L 22 70 Z" fill="var(--part-color, #1e40af)" stroke="#172554" stroke-width="3" />
        <line x1="32" y1="26" x2="68" y2="26" stroke="#f59e0b" stroke-width="2" />
        <line x1="50" y1="26" x2="50" y2="68" stroke="#f59e0b" stroke-width="1.5" />
      `),
    },
  },
  {
    id: 'top_vest',
    category: 'clothesTop',
    name: 'Farmer Sleeveless Vest',
    colorable: true,
    defaultColor: '#f8fafc',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesTop,
    sprites: {
      front: makeSvg(`
        <path d="M 34 22 L 66 22 L 72 65 L 28 65 Z" fill="var(--part-color, #f8fafc)" stroke="#475569" stroke-width="2.5" />
        <path d="M 44 22 Q 50 36 56 22" stroke="#475569" stroke-width="2" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 36 22 L 64 22 L 70 65 L 30 65 Z" fill="var(--part-color, #f8fafc)" stroke="#475569" stroke-width="2.5" />
        <path d="M 48 22 Q 54 34 60 22" stroke="#475569" stroke-width="2" fill="none" />
      `),
      profile: makeSvg(`
        <path d="M 40 22 L 60 22 L 62 65 L 38 65 Z" fill="var(--part-color, #f8fafc)" stroke="#475569" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 36 22 L 64 22 L 70 65 L 30 65 Z" fill="var(--part-color, #f8fafc)" stroke="#475569" stroke-width="2.5" />
      `),
      back: makeSvg(`
        <path d="M 34 22 L 66 22 L 72 65 L 28 65 Z" fill="var(--part-color, #f8fafc)" stroke="#475569" stroke-width="2.5" />
        <path d="M 42 22 Q 50 28 58 22" stroke="#475569" stroke-width="2" />
      `),
    },
  },
  {
    id: 'top_sherwani',
    category: 'clothesTop',
    name: 'Royal Sherwani Kurta',
    colorable: true,
    defaultColor: '#b91c1c',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesTop,
    sprites: {
      front: makeSvg(`
        <path d="M 28 18 L 72 18 L 80 75 L 20 75 Z" fill="var(--part-color, #b91c1c)" stroke="#7f1d1d" stroke-width="3" />
        <rect x="47" y="18" width="6" height="57" fill="#fbbf24" stroke="#b45309" stroke-width="1" />
        <circle cx="50" cy="28" r="2" fill="#fef08a" /><circle cx="50" cy="40" r="2" fill="#fef08a" /><circle cx="50" cy="52" r="2" fill="#fef08a" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 30 18 L 70 18 L 78 75 L 22 75 Z" fill="var(--part-color, #b91c1c)" stroke="#7f1d1d" stroke-width="3" />
        <rect x="54" y="18" width="6" height="57" fill="#fbbf24" stroke="#b45309" stroke-width="1" />
      `),
      profile: makeSvg(`
        <path d="M 36 18 L 64 18 L 68 75 L 32 75 Z" fill="var(--part-color, #b91c1c)" stroke="#7f1d1d" stroke-width="3" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 30 18 L 70 18 L 78 75 L 22 75 Z" fill="var(--part-color, #b91c1c)" stroke="#7f1d1d" stroke-width="3" />
      `),
      back: makeSvg(`
        <path d="M 28 18 L 72 18 L 80 75 L 20 75 Z" fill="var(--part-color, #b91c1c)" stroke="#7f1d1d" stroke-width="3" />
        <line x1="50" y1="20" x2="50" y2="75" stroke="#fbbf24" stroke-width="2" />
      `),
    },
  },
  {
    id: 'top_saree_blouse',
    category: 'clothesTop',
    name: 'Indian Saree Blouse & Pallu',
    colorable: true,
    defaultColor: '#991b1b',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesTop,
    sprites: {
      front: makeSvg(`
        <path d="M 28 20 L 72 20 L 75 52 L 25 52 Z" fill="var(--part-color, #991b1b)" stroke="#450a0a" stroke-width="2.5" />
        <path d="M 28 20 L 40 20 L 74 52 L 62 52 Z" fill="#047857" stroke="#064e3b" stroke-width="2" />
        <line x1="40" y1="20" x2="74" y2="52" stroke="#fbbf24" stroke-width="3" />
        <line x1="38" y1="20" x2="72" y2="52" stroke="#d97706" stroke-width="1" stroke-dasharray="2 2" />
        <path d="M 40 20 Q 50 32 60 20" stroke="#fbbf24" stroke-width="2.5" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 30 20 L 70 20 L 73 52 L 27 52 Z" fill="var(--part-color, #991b1b)" stroke="#450a0a" stroke-width="2.5" />
        <path d="M 30 20 L 44 20 L 72 52 L 58 52 Z" fill="#047857" stroke="#064e3b" stroke-width="2" />
        <line x1="44" y1="20" x2="72" y2="52" stroke="#fbbf24" stroke-width="3" />
      `),
      profile: makeSvg(`
        <path d="M 36 20 L 64 20 L 66 52 L 34 52 Z" fill="var(--part-color, #991b1b)" stroke="#450a0a" stroke-width="2.5" />
        <path d="M 36 20 L 52 20 L 66 52 L 50 52 Z" fill="#047857" stroke="#064e3b" stroke-width="2" />
        <line x1="52" y1="20" x2="66" y2="52" stroke="#fbbf24" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 30 20 L 70 20 L 73 52 L 27 52 Z" fill="var(--part-color, #991b1b)" stroke="#450a0a" stroke-width="2.5" />
        <path d="M 30 20 L 48 20 L 40 52 L 27 52 Z" fill="#047857" stroke="#064e3b" stroke-width="2" />
        <line x1="48" y1="20" x2="40" y2="52" stroke="#fbbf24" stroke-width="3" />
      `),
      back: makeSvg(`
        <path d="M 28 20 L 72 20 L 75 52 L 25 52 Z" fill="var(--part-color, #991b1b)" stroke="#450a0a" stroke-width="2.5" />
        <circle cx="50" cy="28" r="1.5" fill="#fbbf24" />
        <path d="M 45 28 Q 50 34 55 28" stroke="#fbbf24" stroke-width="1.5" fill="none" />
        <line x1="50" y1="33" x2="47" y2="44" stroke="#fbbf24" stroke-width="1.2" />
        <line x1="50" y1="33" x2="53" y2="44" stroke="#fbbf24" stroke-width="1.2" />
      `),
    },
  },
  {
    id: 'top_polo_green',
    category: 'clothesTop',
    name: 'Spruce Green Polo (Arjun)',
    colorable: true,
    defaultColor: '#059669',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesTop,
    sprites: {
      front: makeSvg(`
        <path d="M 28 20 L 72 20 L 76 66 L 24 66 Z" fill="var(--part-color, #059669)" stroke="#064e3b" stroke-width="3" />
        <polygon points="36,20 50,32 44,20" fill="#047857" stroke="#064e3b" stroke-width="1.5" />
        <polygon points="64,20 50,32 56,20" fill="#047857" stroke="#064e3b" stroke-width="1.5" />
        <rect x="47" y="30" width="6" height="20" fill="#047857" stroke="#064e3b" stroke-width="1" />
        <circle cx="50" cy="36" r="1.2" fill="#ffffff" />
        <circle cx="50" cy="44" r="1.2" fill="#ffffff" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 30 20 L 70 20 L 74 66 L 26 66 Z" fill="var(--part-color, #059669)" stroke="#064e3b" stroke-width="3" />
        <polygon points="46,20 58,32 52,20" fill="#047857" stroke="#064e3b" stroke-width="1.5" />
        <polygon points="66,20 58,32 62,20" fill="#047857" stroke="#064e3b" stroke-width="1.5" />
        <rect x="55" y="30" width="6" height="20" fill="#047857" stroke="#064e3b" stroke-width="1" />
      `),
      profile: makeSvg(`
        <path d="M 36 20 L 64 20 L 66 66 L 34 66 Z" fill="var(--part-color, #059669)" stroke="#064e3b" stroke-width="3" />
        <polygon points="56,20 64,30 60,20" fill="#047857" stroke="#064e3b" stroke-width="1.5" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 30 20 L 70 20 L 74 66 L 26 66 Z" fill="var(--part-color, #059669)" stroke="#064e3b" stroke-width="3" />
        <path d="M 40 22 Q 54 26 64 22" stroke="#064e3b" stroke-width="2" />
      `),
      back: makeSvg(`
        <path d="M 28 20 L 72 20 L 76 66 L 24 66 Z" fill="var(--part-color, #059669)" stroke="#064e3b" stroke-width="3" />
        <path d="M 36 22 Q 50 26 64 22" stroke="#064e3b" stroke-width="2" />
      `),
    },
  },

  // ===================== 2. CLOTHES BOTTOM =====================
  {
    id: 'bot_dhoti',
    category: 'clothesBottom',
    name: 'Traditional Indian Dhoti',
    colorable: true,
    defaultColor: '#f8fafc',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesBottom,
    sprites: {
      front: makeSvg(`
        <path d="M 28 10 L 72 10 L 68 85 L 53 85 L 50 35 L 47 85 L 32 85 Z" fill="var(--part-color, #f8fafc)" stroke="#64748b" stroke-width="2.5" />
        <path d="M 40 15 Q 45 50 38 80" stroke="#cbd5e1" stroke-width="1.5" />
        <path d="M 60 15 Q 55 50 62 80" stroke="#cbd5e1" stroke-width="1.5" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 30 10 L 70 10 L 66 85 L 56 85 L 54 35 L 46 85 L 34 85 Z" fill="var(--part-color, #f8fafc)" stroke="#64748b" stroke-width="2.5" />
      `),
      profile: makeSvg(`
        <path d="M 36 10 L 64 10 L 60 85 L 42 85 Z" fill="var(--part-color, #f8fafc)" stroke="#64748b" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 30 10 L 70 10 L 66 85 L 52 85 L 50 35 L 46 85 L 34 85 Z" fill="var(--part-color, #f8fafc)" stroke="#64748b" stroke-width="2.5" />
      `),
      back: makeSvg(`
        <path d="M 28 10 L 72 10 L 68 85 L 53 85 L 50 35 L 47 85 L 32 85 Z" fill="var(--part-color, #f8fafc)" stroke="#64748b" stroke-width="2.5" />
      `),
    },
  },
  {
    id: 'bot_jeans',
    category: 'clothesBottom',
    name: 'Casual Blue Jeans',
    colorable: true,
    defaultColor: '#1d4ed8',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesBottom,
    sprites: {
      front: makeSvg(`
        <path d="M 26 10 L 74 10 L 70 90 L 53 90 L 50 38 L 47 90 L 30 90 Z" fill="var(--part-color, #1d4ed8)" stroke="#1e3a8a" stroke-width="3" />
        <line x1="50" y1="10" x2="50" y2="35" stroke="#f59e0b" stroke-width="1.5" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 28 10 L 72 10 L 68 90 L 55 90 L 53 38 L 45 90 L 32 90 Z" fill="var(--part-color, #1d4ed8)" stroke="#1e3a8a" stroke-width="3" />
      `),
      profile: makeSvg(`
        <path d="M 34 10 L 66 10 L 62 90 L 38 90 Z" fill="var(--part-color, #1d4ed8)" stroke="#1e3a8a" stroke-width="3" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 28 10 L 72 10 L 68 90 L 55 90 L 53 38 L 45 90 L 32 90 Z" fill="var(--part-color, #1d4ed8)" stroke="#1e3a8a" stroke-width="3" />
        <rect x="58" y="16" width="9" height="11" fill="none" stroke="#f59e0b" stroke-width="1" />
      `),
      back: makeSvg(`
        <path d="M 26 10 L 74 10 L 70 90 L 53 90 L 50 38 L 47 90 L 30 90 Z" fill="var(--part-color, #1d4ed8)" stroke="#1e3a8a" stroke-width="3" />
        <rect x="34" y="16" width="10" height="12" fill="none" stroke="#f59e0b" stroke-width="1.2" />
        <rect x="56" y="16" width="10" height="12" fill="none" stroke="#f59e0b" stroke-width="1.2" />
      `),
    },
  },
  {
    id: 'bot_pajama',
    category: 'clothesBottom',
    name: 'Kurta Pajama Pants',
    colorable: true,
    defaultColor: '#f1f5f9',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesBottom,
    sprites: {
      front: makeSvg(`
        <path d="M 28 10 L 72 10 L 66 90 L 52 90 L 50 36 L 48 90 L 34 90 Z" fill="var(--part-color, #f1f5f9)" stroke="#94a3b8" stroke-width="2.5" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 30 10 L 70 10 L 64 90 L 54 90 L 52 36 L 46 90 L 36 90 Z" fill="var(--part-color, #f1f5f9)" stroke="#94a3b8" stroke-width="2.5" />
      `),
      profile: makeSvg(`
        <path d="M 36 10 L 64 10 L 58 90 L 42 90 Z" fill="var(--part-color, #f1f5f9)" stroke="#94a3b8" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 30 10 L 70 10 L 64 90 L 54 90 L 52 36 L 46 90 L 36 90 Z" fill="var(--part-color, #f1f5f9)" stroke="#94a3b8" stroke-width="2.5" />
      `),
      back: makeSvg(`
        <path d="M 28 10 L 72 10 L 66 90 L 52 90 L 50 36 L 48 90 L 34 90 Z" fill="var(--part-color, #f1f5f9)" stroke="#94a3b8" stroke-width="2.5" />
      `),
    },
  },
  {
    id: 'bot_lungi',
    category: 'clothesBottom',
    name: 'Village Checkered Lungi',
    colorable: true,
    defaultColor: '#0284c7',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesBottom,
    sprites: {
      front: makeSvg(`
        <path d="M 26 10 L 74 10 L 76 85 L 24 85 Z" fill="var(--part-color, #0284c7)" stroke="#0369a1" stroke-width="2.5" />
        <line x1="25" y1="35" x2="75" y2="35" stroke="#bae6fd" stroke-width="1.5" stroke-dasharray="4 4" />
        <line x1="25" y1="60" x2="75" y2="60" stroke="#bae6fd" stroke-width="1.5" stroke-dasharray="4 4" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 28 10 L 72 10 L 74 85 L 26 85 Z" fill="var(--part-color, #0284c7)" stroke="#0369a1" stroke-width="2.5" />
      `),
      profile: makeSvg(`
        <path d="M 34 10 L 66 10 L 68 85 L 32 85 Z" fill="var(--part-color, #0284c7)" stroke="#0369a1" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 28 10 L 72 10 L 74 85 L 26 85 Z" fill="var(--part-color, #0284c7)" stroke="#0369a1" stroke-width="2.5" />
      `),
      back: makeSvg(`
        <path d="M 26 10 L 74 10 L 76 85 L 24 85 Z" fill="var(--part-color, #0284c7)" stroke="#0369a1" stroke-width="2.5" />
      `),
    },
  },
  {
    id: 'bot_shorts',
    category: 'clothesBottom',
    name: 'Athletic Shorts',
    colorable: true,
    defaultColor: '#334155',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesBottom,
    sprites: {
      front: makeSvg(`
        <path d="M 28 10 L 72 10 L 70 55 L 53 55 L 50 30 L 47 55 L 30 55 Z" fill="var(--part-color, #334155)" stroke="#0f172a" stroke-width="3" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 30 10 L 70 10 L 68 55 L 55 55 L 53 30 L 45 55 L 32 55 Z" fill="var(--part-color, #334155)" stroke="#0f172a" stroke-width="3" />
      `),
      profile: makeSvg(`
        <path d="M 36 10 L 64 10 L 62 55 L 38 55 Z" fill="var(--part-color, #334155)" stroke="#0f172a" stroke-width="3" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 30 10 L 70 10 L 68 55 L 55 55 L 53 30 L 45 55 L 32 55 Z" fill="var(--part-color, #334155)" stroke="#0f172a" stroke-width="3" />
      `),
      back: makeSvg(`
        <path d="M 28 10 L 72 10 L 70 55 L 53 55 L 50 30 L 47 55 L 30 55 Z" fill="var(--part-color, #334155)" stroke="#0f172a" stroke-width="3" />
      `),
    },
  },
  {
    id: 'bot_cargo',
    category: 'clothesBottom',
    name: 'Utility Cargo Trousers',
    colorable: true,
    defaultColor: '#65a30d',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesBottom,
    sprites: {
      front: makeSvg(`
        <path d="M 26 10 L 74 10 L 70 90 L 53 90 L 50 38 L 47 90 L 30 90 Z" fill="var(--part-color, #65a30d)" stroke="#3f6212" stroke-width="3" />
        <rect x="25" y="45" width="8" height="15" fill="#4d7c0f" rx="2" />
        <rect x="67" y="45" width="8" height="15" fill="#4d7c0f" rx="2" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 28 10 L 72 10 L 68 90 L 55 90 L 53 38 L 45 90 L 32 90 Z" fill="var(--part-color, #65a30d)" stroke="#3f6212" stroke-width="3" />
        <rect x="65" y="45" width="8" height="15" fill="#4d7c0f" rx="2" />
      `),
      profile: makeSvg(`
        <path d="M 34 10 L 66 10 L 62 90 L 38 90 Z" fill="var(--part-color, #65a30d)" stroke="#3f6212" stroke-width="3" />
        <rect x="58" y="45" width="8" height="15" fill="#4d7c0f" rx="2" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 28 10 L 72 10 L 68 90 L 55 90 L 53 38 L 45 90 L 32 90 Z" fill="var(--part-color, #65a30d)" stroke="#3f6212" stroke-width="3" />
      `),
      back: makeSvg(`
        <path d="M 26 10 L 74 10 L 70 90 L 53 90 L 50 38 L 47 90 L 30 90 Z" fill="var(--part-color, #65a30d)" stroke="#3f6212" stroke-width="3" />
      `),
    },
  },
  {
    id: 'bot_saree_skirt',
    category: 'clothesBottom',
    name: 'Indian Saree Pleated Skirt (Priya)',
    colorable: true,
    defaultColor: '#047857',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesBottom,
    sprites: {
      front: makeSvg(`
        <path d="M 28 10 L 72 10 L 76 90 L 24 90 Z" fill="var(--part-color, #047857)" stroke="#064e3b" stroke-width="2.5" />
        <path d="M 44 10 L 46 90" stroke="#065f46" stroke-width="1.8" />
        <path d="M 50 10 L 50 90" stroke="#065f46" stroke-width="1.8" />
        <path d="M 56 10 L 54 90" stroke="#065f46" stroke-width="1.8" />
        <rect x="24" y="80" width="52" height="10" fill="#fbbf24" stroke="#b45309" stroke-width="1.5" />
        <line x1="24" y1="83" x2="76" y2="83" stroke="#d97706" stroke-width="1" stroke-dasharray="2 2" />
        <circle cx="35" cy="85" r="1.5" fill="#b45309" /><circle cx="50" cy="85" r="1.5" fill="#b45309" /><circle cx="65" cy="85" r="1.5" fill="#b45309" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 30 10 L 70 10 L 74 90 L 26 90 Z" fill="var(--part-color, #047857)" stroke="#064e3b" stroke-width="2.5" />
        <path d="M 50 10 L 54 90" stroke="#065f46" stroke-width="1.8" />
        <path d="M 58 10 L 60 90" stroke="#065f46" stroke-width="1.8" />
        <rect x="26" y="80" width="48" height="10" fill="#fbbf24" stroke="#b45309" stroke-width="1.5" />
      `),
      profile: makeSvg(`
        <path d="M 34 10 L 66 10 L 68 90 L 32 90 Z" fill="var(--part-color, #047857)" stroke="#064e3b" stroke-width="2.5" />
        <rect x="32" y="80" width="36" height="10" fill="#fbbf24" stroke="#b45309" stroke-width="1.5" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 30 10 L 70 10 L 74 90 L 26 90 Z" fill="var(--part-color, #047857)" stroke="#064e3b" stroke-width="2.5" />
        <rect x="26" y="80" width="48" height="10" fill="#fbbf24" stroke="#b45309" stroke-width="1.5" />
      `),
      back: makeSvg(`
        <path d="M 28 10 L 72 10 L 76 90 L 24 90 Z" fill="var(--part-color, #047857)" stroke="#064e3b" stroke-width="2.5" />
        <rect x="24" y="80" width="52" height="10" fill="#fbbf24" stroke="#b45309" stroke-width="1.5" />
      `),
    },
  },
  {
    id: 'bot_skirt_long',
    category: 'clothesBottom',
    name: 'Long Flowing Skirt / Sarong',
    colorable: true,
    defaultColor: '#78350f',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.clothesBottom,
    sprites: {
      front: makeSvg(`
        <path d="M 30 10 L 70 10 L 76 88 L 24 88 Z" fill="var(--part-color, #78350f)" stroke="#451a03" stroke-width="2.5" />
        <path d="M 40 10 Q 42 50 38 88" stroke="#a16207" stroke-width="1.5" stroke-dasharray="2 2" />
        <path d="M 60 10 Q 58 50 62 88" stroke="#a16207" stroke-width="1.5" stroke-dasharray="2 2" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 32 10 L 68 10 L 74 88 L 26 88 Z" fill="var(--part-color, #78350f)" stroke="#451a03" stroke-width="2.5" />
      `),
      profile: makeSvg(`
        <path d="M 36 10 L 64 10 L 68 88 L 32 88 Z" fill="var(--part-color, #78350f)" stroke="#451a03" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 32 10 L 68 10 L 74 88 L 26 88 Z" fill="var(--part-color, #78350f)" stroke="#451a03" stroke-width="2.5" />
      `),
      back: makeSvg(`
        <path d="M 30 10 L 70 10 L 76 88 L 24 88 Z" fill="var(--part-color, #78350f)" stroke="#451a03" stroke-width="2.5" />
      `),
    },
  },

  // ===================== 3. SHOES =====================
  {
    id: 'shoe_mojari',
    category: 'shoes',
    name: 'Traditional Royal Mojari',
    colorable: true,
    defaultColor: '#b45309',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.shoes,
    sprites: {
      front: makeSvg(`
        <path d="M 20 60 Q 35 40 45 60 Q 42 75 25 75 Z" fill="var(--part-color, #b45309)" stroke="#78350f" stroke-width="2" />
        <path d="M 80 60 Q 65 40 55 60 Q 58 75 75 75 Z" fill="var(--part-color, #b45309)" stroke="#78350f" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 25 60 Q 40 40 50 60 Q 46 75 30 75 Z" fill="var(--part-color, #b45309)" stroke="#78350f" stroke-width="2" />
        <path d="M 75 60 Q 62 42 58 60 Q 60 75 72 75 Z" fill="var(--part-color, #b45309)" stroke="#78350f" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 30 60 Q 50 45 75 58 Q 78 72 35 72 Z" fill="var(--part-color, #b45309)" stroke="#78350f" stroke-width="2" />
        <path d="M 75 58 Q 85 52 82 60" stroke="#78350f" stroke-width="2" fill="none" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="40" cy="65" rx="12" ry="7" fill="var(--part-color, #b45309)" stroke="#78350f" stroke-width="2" />
        <ellipse cx="65" cy="65" rx="10" ry="6" fill="var(--part-color, #b45309)" stroke="#78350f" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="35" cy="65" rx="10" ry="7" fill="var(--part-color, #b45309)" stroke="#78350f" stroke-width="2" />
        <ellipse cx="65" cy="65" rx="10" ry="7" fill="var(--part-color, #b45309)" stroke="#78350f" stroke-width="2" />
      `),
    },
  },
  {
    id: 'shoe_chappal',
    category: 'shoes',
    name: 'Village Kolhapuri Chappals',
    colorable: true,
    defaultColor: '#78350f',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.shoes,
    sprites: {
      front: makeSvg(`
        <ellipse cx="32" cy="70" rx="12" ry="5" fill="#fef08a" stroke="#78350f" stroke-width="2" />
        <path d="M 28 66 L 36 74" stroke="var(--part-color, #78350f)" stroke-width="3" />
        <ellipse cx="68" cy="70" rx="12" ry="5" fill="#fef08a" stroke="#78350f" stroke-width="2" />
        <path d="M 64 66 L 72 74" stroke="var(--part-color, #78350f)" stroke-width="3" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="36" cy="70" rx="12" ry="5" fill="#fef08a" stroke="#78350f" stroke-width="2" />
        <ellipse cx="66" cy="70" rx="10" ry="4" fill="#fef08a" stroke="#78350f" stroke-width="2" />
      `),
      profile: makeSvg(`
        <line x1="30" y1="72" x2="72" y2="72" stroke="#78350f" stroke-width="4" stroke-linecap="round" />
        <path d="M 45 70 Q 55 60 62 70" stroke="var(--part-color, #78350f)" stroke-width="3" fill="none" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="38" cy="72" rx="9" ry="5" fill="#fef08a" stroke="#78350f" stroke-width="2" />
        <ellipse cx="64" cy="72" rx="8" ry="4" fill="#fef08a" stroke="#78350f" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="35" cy="72" rx="9" ry="5" fill="#fef08a" stroke="#78350f" stroke-width="2" />
        <ellipse cx="65" cy="72" rx="9" ry="5" fill="#fef08a" stroke="#78350f" stroke-width="2" />
      `),
    },
  },
  {
    id: 'shoe_sneakers',
    category: 'shoes',
    name: 'Modern Sport Sneakers',
    colorable: true,
    defaultColor: '#ef4444',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.shoes,
    sprites: {
      front: makeSvg(`
        <rect x="22" y="55" width="20" height="20" rx="6" fill="var(--part-color, #ef4444)" stroke="#991b1b" stroke-width="2" />
        <rect x="20" y="72" width="24" height="6" rx="2" fill="#ffffff" stroke="#94a3b8" />
        <rect x="58" y="55" width="20" height="20" rx="6" fill="var(--part-color, #ef4444)" stroke="#991b1b" stroke-width="2" />
        <rect x="56" y="72" width="24" height="6" rx="2" fill="#ffffff" stroke="#94a3b8" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 24 55 Q 40 50 48 68 L 22 75 Z" fill="var(--part-color, #ef4444)" stroke="#991b1b" stroke-width="2" />
        <path d="M 58 55 Q 70 50 76 68 L 56 75 Z" fill="var(--part-color, #ef4444)" stroke="#991b1b" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 30 55 Q 55 50 75 65 L 72 75 L 30 75 Z" fill="var(--part-color, #ef4444)" stroke="#991b1b" stroke-width="2" />
        <rect x="28" y="73" width="46" height="5" rx="2" fill="#ffffff" stroke="#94a3b8" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="40" cy="65" rx="12" ry="10" fill="var(--part-color, #ef4444)" stroke="#991b1b" stroke-width="2" />
        <ellipse cx="64" cy="65" rx="10" ry="8" fill="var(--part-color, #ef4444)" stroke="#991b1b" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="35" cy="65" rx="11" ry="9" fill="var(--part-color, #ef4444)" stroke="#991b1b" stroke-width="2" />
        <ellipse cx="65" cy="65" rx="11" ry="9" fill="var(--part-color, #ef4444)" stroke="#991b1b" stroke-width="2" />
      `),
    },
  },
  {
    id: 'shoe_boots',
    category: 'shoes',
    name: 'Leather Work Boots',
    colorable: true,
    defaultColor: '#522e15',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.shoes,
    sprites: {
      front: makeSvg(`
        <rect x="22" y="45" width="20" height="30" rx="4" fill="var(--part-color, #522e15)" stroke="#301a0c" stroke-width="2.5" />
        <rect x="58" y="45" width="20" height="30" rx="4" fill="var(--part-color, #522e15)" stroke="#301a0c" stroke-width="2.5" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 24 45 L 42 45 L 46 75 L 20 75 Z" fill="var(--part-color, #522e15)" stroke="#301a0c" stroke-width="2.5" />
        <path d="M 58 45 L 72 45 L 75 75 L 56 75 Z" fill="var(--part-color, #522e15)" stroke="#301a0c" stroke-width="2.5" />
      `),
      profile: makeSvg(`
        <path d="M 32 45 L 54 45 L 54 60 L 72 65 L 70 76 L 30 76 Z" fill="var(--part-color, #522e15)" stroke="#301a0c" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`
        <rect x="30" y="45" width="18" height="30" rx="4" fill="var(--part-color, #522e15)" stroke="#301a0c" stroke-width="2" />
        <rect x="56" y="45" width="16" height="30" rx="4" fill="var(--part-color, #522e15)" stroke="#301a0c" stroke-width="2" />
      `),
      back: makeSvg(`
        <rect x="24" y="45" width="18" height="30" rx="4" fill="var(--part-color, #522e15)" stroke="#301a0c" stroke-width="2.5" />
        <rect x="58" y="45" width="18" height="30" rx="4" fill="var(--part-color, #522e15)" stroke="#301a0c" stroke-width="2.5" />
      `),
    },
  },
  {
    id: 'shoe_barefoot',
    category: 'shoes',
    name: 'Barefoot & Silver Anklet',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.shoes,
    sprites: {
      front: makeSvg(`
        <ellipse cx="32" cy="70" rx="10" ry="6" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
        <ellipse cx="68" cy="70" rx="10" ry="6" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
        <line x1="24" y1="62" x2="40" y2="62" stroke="#e2e8f0" stroke-width="2" />
        <line x1="60" y1="62" x2="76" y2="62" stroke="#e2e8f0" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="36" cy="70" rx="10" ry="6" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
        <ellipse cx="66" cy="70" rx="8" ry="5" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
      `),
      profile: makeSvg(`
        <path d="M 32 60 Q 48 55 68 68 Q 66 75 32 75 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="38" cy="70" rx="8" ry="6" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
        <ellipse cx="64" cy="70" rx="7" ry="5" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
      `),
      back: makeSvg(`
        <ellipse cx="35" cy="70" rx="8" ry="6" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
        <ellipse cx="65" cy="70" rx="8" ry="6" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
      `),
    },
  },
  {
    id: 'shoe_oxford',
    category: 'shoes',
    name: 'Polished Black Oxfords',
    colorable: true,
    defaultColor: '#171717',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.shoes,
    sprites: {
      front: makeSvg(`
        <ellipse cx="32" cy="65" rx="12" ry="8" fill="var(--part-color, #171717)" stroke="#404040" stroke-width="2" />
        <ellipse cx="68" cy="65" rx="12" ry="8" fill="var(--part-color, #171717)" stroke="#404040" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="36" cy="65" rx="12" ry="8" fill="var(--part-color, #171717)" stroke="#404040" stroke-width="2" />
        <ellipse cx="66" cy="65" rx="10" ry="7" fill="var(--part-color, #171717)" stroke="#404040" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 30 60 Q 55 52 75 62 Q 72 74 30 74 Z" fill="var(--part-color, #171717)" stroke="#404040" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="38" cy="65" rx="10" ry="8" fill="var(--part-color, #171717)" stroke="#404040" stroke-width="2" />
        <ellipse cx="64" cy="65" rx="9" ry="7" fill="var(--part-color, #171717)" stroke="#404040" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="35" cy="65" rx="10" ry="8" fill="var(--part-color, #171717)" stroke="#404040" stroke-width="2" />
        <ellipse cx="65" cy="65" rx="10" ry="8" fill="var(--part-color, #171717)" stroke="#404040" stroke-width="2" />
      `),
    },
  },

  // ===================== 4. HEAD / FACE SHAPES =====================
  {
    id: 'head_oval',
    category: 'head',
    name: 'Classic Oval Face',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.head,
    sprites: {
      front: makeSvg(`
        <ellipse cx="50" cy="50" rx="36" ry="42" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 45 8 C 68 8 82 28 80 54 C 78 78 60 90 42 90 C 26 90 20 74 20 54 C 20 30 30 8 45 8 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      profile: makeSvg(`
        <path d="M 46 8 C 68 12 76 28 76 45 C 84 48 84 56 76 58 C 76 74 64 88 44 88 C 30 88 26 70 26 48 C 26 24 34 8 46 8 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 52 8 C 72 8 82 28 82 54 C 82 76 70 88 50 88 C 34 88 26 76 24 54 C 22 28 36 8 52 8 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      back: makeSvg(`
        <ellipse cx="50" cy="50" rx="36" ry="42" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
    },
  },
  {
    id: 'head_priya_bindi',
    category: 'head',
    name: 'Feminine Graceful Face with Bindi (Priya)',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.head,
    sprites: {
      front: makeSvg(`
        <path d="M 22 36 C 22 14 78 14 78 36 C 78 62 70 82 50 88 C 30 82 22 62 22 36 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
        <circle cx="50" cy="38" r="2.5" fill="#dc2626" stroke="#991b1b" stroke-width="0.5" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 26 36 C 26 14 80 16 80 38 C 78 64 68 84 46 88 C 30 82 24 62 26 36 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
        <circle cx="46" cy="38" r="2.2" fill="#dc2626" />
      `),
      profile: makeSvg(`
        <path d="M 32 36 C 32 16 76 18 76 42 C 82 46 82 54 74 56 C 72 72 62 84 44 86 C 30 84 28 66 32 36 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
        <ellipse cx="68" cy="38" rx="1" ry="2" fill="#dc2626" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 28 36 C 28 14 82 14 82 38 C 80 64 68 84 48 88 C 32 84 26 64 28 36 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
      `),
      back: makeSvg(`
        <path d="M 22 36 C 22 14 78 14 78 36 C 78 62 70 82 50 88 C 30 82 22 62 22 36 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
      `),
    },
  },
  {
    id: 'head_arjun_youth',
    category: 'head',
    name: 'Modern Defined Jaw Youth (Arjun)',
    colorable: true,
    defaultColor: '#e0a575',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.head,
    sprites: {
      front: makeSvg(`
        <path d="M 20 34 C 20 12 80 12 80 34 C 80 60 72 82 50 86 C 28 82 20 60 20 34 Z" fill="var(--part-color, #e0a575)" stroke="#9c6339" stroke-width="2.5" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 24 34 C 24 12 82 14 82 36 C 80 62 70 82 48 86 C 30 82 22 60 24 34 Z" fill="var(--part-color, #e0a575)" stroke="#9c6339" stroke-width="2.5" />
      `),
      profile: makeSvg(`
        <path d="M 30 34 C 30 14 76 16 76 42 C 84 46 84 54 74 56 C 74 72 64 84 46 86 C 30 84 26 66 30 34 Z" fill="var(--part-color, #e0a575)" stroke="#9c6339" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 26 34 C 24 14 82 14 82 38 C 82 64 70 84 50 86 C 32 82 24 62 26 34 Z" fill="var(--part-color, #e0a575)" stroke="#9c6339" stroke-width="2.5" />
      `),
      back: makeSvg(`
        <path d="M 20 34 C 20 12 80 12 80 34 C 80 60 72 82 50 86 C 28 82 20 60 20 34 Z" fill="var(--part-color, #e0a575)" stroke="#9c6339" stroke-width="2.5" />
      `),
    },
  },
  {
    id: 'head_square',
    category: 'head',
    name: 'Chiseled Square Jaw',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.head,
    sprites: {
      front: makeSvg(`
        <rect x="18" y="14" width="64" height="72" rx="18" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 28 14 L 72 16 L 76 80 L 36 86 L 22 74 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      profile: makeSvg(`
        <path d="M 32 14 L 68 14 L 78 48 L 68 84 L 34 82 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 32 14 L 76 16 L 74 76 L 40 84 L 26 78 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      back: makeSvg(`
        <rect x="18" y="14" width="64" height="72" rx="18" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
    },
  },
  {
    id: 'head_round',
    category: 'head',
    name: 'Round Friendly Face',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.head,
    sprites: {
      front: makeSvg(`
        <circle cx="50" cy="50" r="40" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 46 10 C 72 10 86 28 84 56 C 82 80 62 88 44 88 C 24 88 18 72 20 52 C 20 28 30 10 46 10 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      profile: makeSvg(`
        <circle cx="48" cy="50" r="38" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 52 10 C 74 10 84 28 84 54 C 84 76 68 88 48 88 C 28 88 22 72 24 52 C 24 28 36 10 52 10 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      back: makeSvg(`
        <circle cx="50" cy="50" r="40" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
    },
  },
  {
    id: 'head_heart',
    category: 'head',
    name: 'Narrow Heart Face',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.head,
    sprites: {
      front: makeSvg(`
        <path d="M 18 28 C 18 14 36 14 50 20 C 64 14 82 14 82 28 C 82 54 64 80 50 90 C 36 80 18 54 18 28 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 28 20 C 44 14 74 16 78 30 C 80 56 65 82 48 90 C 34 82 24 58 24 36 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      profile: makeSvg(`
        <path d="M 36 16 C 56 16 72 24 74 46 C 76 66 60 84 46 88 C 34 86 28 64 30 40 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 32 18 C 48 14 76 16 78 32 C 80 58 64 82 48 90 C 34 82 24 58 24 36 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      back: makeSvg(`
        <path d="M 18 28 C 18 14 36 14 50 20 C 64 14 82 14 82 28 C 82 54 64 80 50 90 C 36 80 18 54 18 28 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
    },
  },
  {
    id: 'head_elder',
    category: 'head',
    name: 'Wise Elder Face (Wrinkles)',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.head,
    sprites: {
      front: makeSvg(`
        <ellipse cx="50" cy="50" rx="35" ry="42" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
        <path d="M 35 22 Q 50 20 65 22" stroke="#9c6339" stroke-width="1.5" />
        <path d="M 32 26 Q 50 24 68 26" stroke="#9c6339" stroke-width="1.5" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 45 8 C 68 8 82 28 80 54 C 78 78 60 90 42 90 C 26 90 20 74 20 54 C 20 30 30 8 45 8 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
        <line x1="42" y1="20" x2="68" y2="24" stroke="#9c6339" stroke-width="1.5" />
      `),
      profile: makeSvg(`
        <path d="M 46 8 C 68 12 76 28 76 45 C 84 48 84 56 76 58 C 76 74 64 88 44 88 C 30 88 26 70 26 48 C 26 24 34 8 46 8 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 52 8 C 72 8 82 28 82 54 C 82 76 70 88 50 88 C 34 88 26 76 24 54 C 22 28 36 8 52 8 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      back: makeSvg(`
        <ellipse cx="50" cy="50" rx="35" ry="42" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
    },
  },
  {
    id: 'head_diamond',
    category: 'head',
    name: 'Stylized Angular Diamond',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.head,
    sprites: {
      front: makeSvg(`
        <polygon points="50,10 84,40 50,92 16,40" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      threeQuarterFront: makeSvg(`
        <polygon points="52,10 84,40 46,90 22,44" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      profile: makeSvg(`
        <polygon points="46,10 76,42 46,88 30,46" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      threeQuarterBack: makeSvg(`
        <polygon points="52,10 82,42 48,90 24,44" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
      back: makeSvg(`
        <polygon points="50,10 84,40 50,92 16,40" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="3" />
      `),
    },
  },

  // ===================== 5. EYES =====================
  {
    id: 'eye_almond',
    category: 'eyes',
    name: 'Almond Indian Eyes',
    colorable: true,
    defaultColor: '#1e293b',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyes,
    sprites: {
      front: makeSvg(`
        <!-- Left Eye -->
        <path d="M 24 50 Q 36 38 48 50 Q 36 62 24 50 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <circle cx="36" cy="50" r="5" fill="var(--part-color, #1e293b)" />
        <circle cx="38" cy="48" r="1.5" fill="#ffffff" />
        <!-- Right Eye -->
        <path d="M 52 50 Q 64 38 76 50 Q 64 62 52 50 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <circle cx="64" cy="50" r="5" fill="var(--part-color, #1e293b)" />
        <circle cx="66" cy="48" r="1.5" fill="#ffffff" />
      `),
      threeQuarterFront: makeSvg(`
        <!-- Left eye larger, right eye foreshortened -->
        <path d="M 32 50 Q 46 38 58 50 Q 46 62 32 50 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <circle cx="48" cy="50" r="5" fill="var(--part-color, #1e293b)" />
        <path d="M 64 50 Q 72 40 78 50 Q 72 60 64 50 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <circle cx="72" cy="50" r="3.5" fill="var(--part-color, #1e293b)" />
      `),
      profile: makeSvg(`
        <!-- Profile single eye side-wedge -->
        <path d="M 54 48 L 72 44 L 66 56 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <ellipse cx="68" cy="49" rx="2.5" ry="4" fill="var(--part-color, #1e293b)" />
      `),
      threeQuarterBack: makeSvg(`
        <!-- Hidden in back view -->
        <g opacity="0"></g>
      `),
      back: makeSvg(`
        <!-- Hidden in back view -->
        <g opacity="0"></g>
      `),
    },
  },
  {
    id: 'eye_cartoon_round',
    category: 'eyes',
    name: 'Big Cartoon Anime Eyes',
    colorable: true,
    defaultColor: '#2563eb',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyes,
    sprites: {
      front: makeSvg(`
        <ellipse cx="34" cy="50" rx="9" ry="12" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <ellipse cx="35" cy="50" rx="6" ry="8" fill="var(--part-color, #2563eb)" />
        <circle cx="37" cy="46" r="2.5" fill="#ffffff" />
        <ellipse cx="66" cy="50" rx="9" ry="12" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <ellipse cx="67" cy="50" rx="6" ry="8" fill="var(--part-color, #2563eb)" />
        <circle cx="69" cy="46" r="2.5" fill="#ffffff" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="44" cy="50" rx="9" ry="12" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <ellipse cx="45" cy="50" rx="6" ry="8" fill="var(--part-color, #2563eb)" />
        <ellipse cx="70" cy="50" rx="6" ry="11" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <ellipse cx="71" cy="50" rx="4" ry="7" fill="var(--part-color, #2563eb)" />
      `),
      profile: makeSvg(`
        <path d="M 58 42 Q 74 46 72 58 Q 58 56 58 42 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <ellipse cx="68" cy="50" rx="3" ry="6" fill="var(--part-color, #2563eb)" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'eye_sharp',
    category: 'eyes',
    name: 'Sharp Focused Eyes',
    colorable: true,
    defaultColor: '#0f172a',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyes,
    sprites: {
      front: makeSvg(`
        <polygon points="22,48 46,45 38,55" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <circle cx="36" cy="49" r="4" fill="var(--part-color, #0f172a)" />
        <polygon points="78,48 54,45 62,55" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <circle cx="64" cy="49" r="4" fill="var(--part-color, #0f172a)" />
      `),
      threeQuarterFront: makeSvg(`
        <polygon points="32,48 56,45 48,55" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <circle cx="48" cy="49" r="4" fill="var(--part-color, #0f172a)" />
        <polygon points="76,48 64,45 68,54" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      `),
      profile: makeSvg(`
        <polygon points="56,46 74,45 66,54" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'eye_droopy',
    category: 'eyes',
    name: 'Gentle Droopy Eyes',
    colorable: true,
    defaultColor: '#334155',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyes,
    sprites: {
      front: makeSvg(`
        <path d="M 24 46 Q 36 44 48 52 Q 36 60 24 46 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <circle cx="36" cy="51" r="4" fill="var(--part-color, #334155)" />
        <path d="M 76 46 Q 64 44 52 52 Q 64 60 76 46 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <circle cx="64" cy="51" r="4" fill="var(--part-color, #334155)" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 32 46 Q 46 44 58 52 Q 46 60 32 46 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <circle cx="46" cy="51" r="4" fill="var(--part-color, #334155)" />
      `),
      profile: makeSvg(`
        <path d="M 56 46 L 72 50 L 62 56 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'eye_sly',
    category: 'eyes',
    name: 'Narrow Sly Eyes',
    colorable: true,
    defaultColor: '#1e1b4b',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyes,
    sprites: {
      front: makeSvg(`
        <path d="M 25 50 Q 36 44 47 50" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        <circle cx="36" cy="51" r="3" fill="var(--part-color, #1e1b4b)" />
        <path d="M 75 50 Q 64 44 53 50" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        <circle cx="64" cy="51" r="3" fill="var(--part-color, #1e1b4b)" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 35 50 Q 48 44 58 50" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        <circle cx="48" cy="51" r="3" fill="var(--part-color, #1e1b4b)" />
      `),
      profile: makeSvg(`
        <path d="M 56 48 L 70 48" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'eye_friendly_round',
    category: 'eyes',
    name: 'Friendly Dot Eyes',
    colorable: true,
    defaultColor: '#171717',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyes,
    sprites: {
      front: makeSvg(`
        <circle cx="36" cy="50" r="5" fill="var(--part-color, #171717)" />
        <circle cx="38" cy="48" r="1.5" fill="#ffffff" />
        <circle cx="64" cy="50" r="5" fill="var(--part-color, #171717)" />
        <circle cx="66" cy="48" r="1.5" fill="#ffffff" />
      `),
      threeQuarterFront: makeSvg(`
        <circle cx="48" cy="50" r="5" fill="var(--part-color, #171717)" />
        <circle cx="70" cy="50" r="3.5" fill="var(--part-color, #171717)" />
      `),
      profile: makeSvg(`
        <circle cx="66" cy="50" r="4" fill="var(--part-color, #171717)" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'eye_priya_kajal',
    category: 'eyes',
    name: 'Kajal Lined Almond Eyes (Priya)',
    colorable: true,
    defaultColor: '#18181b',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyes,
    sprites: {
      front: makeSvg(`
        <!-- Left Sclera -->
        <path d="M 22 50 Q 36 38 48 50 Q 36 60 22 50 Z" fill="#ffffff" stroke="#09090b" stroke-width="2" />
        <!-- Winged Kajal Eyeliner -->
        <path d="M 20 49 Q 36 36 49 48" stroke="#09090b" stroke-width="2.8" stroke-linecap="round" fill="none" />
        <path d="M 48 49 L 52 46" stroke="#09090b" stroke-width="2" stroke-linecap="round" />
        <!-- Iris & Pupil -->
        <circle cx="36" cy="50" r="5" fill="var(--part-color, #18181b)" />
        <circle cx="36" cy="50" r="2.5" fill="#000000" />
        <circle cx="38" cy="48" r="1.5" fill="#ffffff" />
        <circle cx="34" cy="52" r="0.8" fill="#ffffff" />
        <!-- Right Sclera -->
        <path d="M 52 50 Q 64 38 78 50 Q 64 60 52 50 Z" fill="#ffffff" stroke="#09090b" stroke-width="2" />
        <path d="M 51 48 Q 64 36 80 49" stroke="#09090b" stroke-width="2.8" stroke-linecap="round" fill="none" />
        <path d="M 78 49 L 82 46" stroke="#09090b" stroke-width="2" stroke-linecap="round" />
        <circle cx="64" cy="50" r="5" fill="var(--part-color, #18181b)" />
        <circle cx="64" cy="50" r="2.5" fill="#000000" />
        <circle cx="66" cy="48" r="1.5" fill="#ffffff" />
        <circle cx="62" cy="52" r="0.8" fill="#ffffff" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 28 50 Q 42 38 54 50 Q 42 60 28 50 Z" fill="#ffffff" stroke="#09090b" stroke-width="2" />
        <path d="M 26 49 Q 42 36 55 49" stroke="#09090b" stroke-width="2.8" stroke-linecap="round" fill="none" />
        <circle cx="42" cy="50" r="5" fill="var(--part-color, #18181b)" />
        <circle cx="44" cy="48" r="1.5" fill="#ffffff" />
        <path d="M 62 50 Q 72 40 82 50 Q 72 58 62 50 Z" fill="#ffffff" stroke="#09090b" stroke-width="1.8" />
        <circle cx="72" cy="50" r="3.8" fill="var(--part-color, #18181b)" />
      `),
      profile: makeSvg(`
        <path d="M 54 48 L 74 44 L 66 56 Z" fill="#ffffff" stroke="#09090b" stroke-width="2" />
        <path d="M 54 47 L 76 43" stroke="#09090b" stroke-width="2.5" />
        <ellipse cx="66" cy="50" rx="3.5" ry="5" fill="var(--part-color, #18181b)" />
        <circle cx="67" cy="48" r="1" fill="#ffffff" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },

  // ===================== 6. HAIR / TURBANS =====================
  {
    id: 'hair_priya_wavy',
    category: 'hair',
    name: 'Long Flowing Wavy Hair (Priya)',
    colorable: true,
    defaultColor: '#09090b',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hair,
    sprites: {
      front: makeSvg(`
        <!-- Side wisps & crown volume -->
        <path d="M 12 36 C 12 8 88 8 88 36 C 88 55 82 85 76 96 C 70 82 72 60 74 45 C 64 36 54 38 50 36 C 46 38 36 36 26 45 C 28 60 30 82 24 96 C 18 85 12 55 12 36 Z" fill="var(--part-color, #09090b)" stroke="#000000" stroke-width="2" />
        <!-- Soft lustrous hair strands and sheen -->
        <path d="M 30 20 Q 50 14 70 20" stroke="#3f3f46" stroke-width="1.5" fill="none" opacity="0.6" />
        <path d="M 22 48 Q 26 65 24 85" stroke="#27272a" stroke-width="1.8" fill="none" />
        <path d="M 78 48 Q 74 65 76 85" stroke="#27272a" stroke-width="1.8" fill="none" />
        <!-- Tiny delicate gold Maang Tikka at center hairline -->
        <circle cx="50" cy="30" r="2" fill="#fbbf24" stroke="#b45309" stroke-width="0.8" />
        <line x1="50" y1="18" x2="50" y2="28" stroke="#fbbf24" stroke-width="1" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 14 36 C 14 8 86 10 86 38 C 86 60 84 96 74 100 C 68 85 70 60 72 45 C 60 38 48 38 42 36 C 30 40 26 50 24 60 C 22 75 22 92 18 96 C 14 85 14 55 14 36 Z" fill="var(--part-color, #09090b)" stroke="#000000" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 20 36 C 20 10 80 12 80 44 C 74 38 66 38 56 36 C 44 42 40 55 36 70 C 30 85 24 98 16 100 C 14 85 18 55 20 36 Z" fill="var(--part-color, #09090b)" stroke="#000000" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 16 34 C 14 10 86 10 86 36 C 86 65 84 98 72 105 C 50 108 35 106 20 102 C 14 85 14 55 16 34 Z" fill="var(--part-color, #09090b)" stroke="#000000" stroke-width="2" />
      `),
      back: makeSvg(`
        <path d="M 12 34 C 12 8 88 8 88 34 C 88 65 84 102 70 108 C 50 112 35 110 18 105 C 12 85 12 55 12 34 Z" fill="var(--part-color, #09090b)" stroke="#000000" stroke-width="2" />
        <path d="M 30 45 Q 50 55 70 45" stroke="#27272a" stroke-width="2" fill="none" />
        <path d="M 34 70 Q 50 80 66 70" stroke="#27272a" stroke-width="2" fill="none" />
      `),
    },
  },
  {
    id: 'hair_modern_quiff',
    category: 'hair',
    name: 'Modern Styled Quiff Fade (Arjun)',
    colorable: true,
    defaultColor: '#171717',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hair,
    sprites: {
      front: makeSvg(`
        <path d="M 18 38 C 16 8 84 12 82 38 C 76 34 66 35 50 30 C 34 35 24 34 18 38 Z" fill="var(--part-color, #171717)" stroke="#000000" stroke-width="2" />
        <!-- Quiff texture sweep -->
        <path d="M 35 14 Q 52 8 68 18" stroke="#3f3f46" stroke-width="2" fill="none" opacity="0.7" />
        <path d="M 38 22 Q 52 16 64 24" stroke="#3f3f46" stroke-width="1.5" fill="none" opacity="0.7" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 20 38 C 18 10 82 14 80 40 C 72 34 58 35 46 30 C 32 35 24 36 20 38 Z" fill="var(--part-color, #171717)" stroke="#000000" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 24 38 C 22 12 78 16 76 44 C 68 36 54 36 42 32 C 28 38 24 38 24 38 Z" fill="var(--part-color, #171717)" stroke="#000000" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 20 40 C 18 12 82 12 82 44 C 82 54 20 54 20 40 Z" fill="var(--part-color, #171717)" stroke="#000000" stroke-width="2" />
      `),
      back: makeSvg(`
        <path d="M 16 38 C 16 10 84 10 84 38 C 84 56 16 56 16 38 Z" fill="var(--part-color, #171717)" stroke="#000000" stroke-width="2" />
      `),
    },
  },
  {
    id: 'hair_pagri',
    category: 'hair',
    name: 'Rajasthani Royal Pagri',
    colorable: true,
    defaultColor: '#ea580c',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hair,
    sprites: {
      front: makeSvg(`
        <path d="M 12 40 C 12 10 88 10 88 40 C 88 48 12 48 12 40 Z" fill="var(--part-color, #ea580c)" stroke="#9a3412" stroke-width="3" />
        <path d="M 20 32 Q 50 18 80 32" stroke="#fbbf24" stroke-width="2.5" />
        <path d="M 22 40 Q 50 26 78 40" stroke="#fbbf24" stroke-width="2.5" />
        <polygon points="46,12 54,12 50,2" fill="#fbbf24" stroke="#9a3412" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 16 40 C 14 12 86 12 86 42 C 86 48 16 48 16 40 Z" fill="var(--part-color, #ea580c)" stroke="#9a3412" stroke-width="3" />
        <path d="M 24 34 Q 56 20 82 34" stroke="#fbbf24" stroke-width="2.5" />
      `),
      profile: makeSvg(`
        <path d="M 24 40 C 22 14 84 14 80 42 C 80 48 24 48 24 40 Z" fill="var(--part-color, #ea580c)" stroke="#9a3412" stroke-width="3" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 16 42 C 14 12 86 12 86 42 C 86 52 16 52 16 42 Z" fill="var(--part-color, #ea580c)" stroke="#9a3412" stroke-width="3" />
      `),
      back: makeSvg(`
        <path d="M 12 40 C 12 10 88 10 88 40 C 88 52 12 52 12 40 Z" fill="var(--part-color, #ea580c)" stroke="#9a3412" stroke-width="3" />
        <line x1="50" y1="20" x2="50" y2="65" stroke="#ea580c" stroke-width="8" stroke-linecap="round" />
      `),
    },
  },
  {
    id: 'hair_classic_fade',
    category: 'hair',
    name: 'Modern Fade Haircut',
    colorable: true,
    defaultColor: '#171717',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hair,
    sprites: {
      front: makeSvg(`
        <path d="M 16 38 C 16 12 84 12 84 38 C 76 34 64 36 50 32 C 36 36 24 34 16 38 Z" fill="var(--part-color, #171717)" stroke="#0a0a0a" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 18 38 C 18 12 82 14 82 40 C 74 34 60 36 46 32 C 32 36 24 36 18 38 Z" fill="var(--part-color, #171717)" stroke="#0a0a0a" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 22 38 C 22 14 78 16 78 44 C 70 36 56 36 42 34 C 28 38 22 38 22 38 Z" fill="var(--part-color, #171717)" stroke="#0a0a0a" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 20 40 C 18 14 82 14 82 44 C 82 54 20 54 20 40 Z" fill="var(--part-color, #171717)" stroke="#0a0a0a" stroke-width="2" />
      `),
      back: makeSvg(`
        <path d="M 16 40 C 16 12 84 12 84 40 C 84 56 16 56 16 40 Z" fill="var(--part-color, #171717)" stroke="#0a0a0a" stroke-width="2" />
      `),
    },
  },
  {
    id: 'hair_shikha',
    category: 'hair',
    name: 'Priest Shikha Topknot',
    colorable: true,
    defaultColor: '#171717',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hair,
    sprites: {
      front: makeSvg(`
        <ellipse cx="50" cy="12" rx="7" ry="10" fill="var(--part-color, #171717)" stroke="#0a0a0a" stroke-width="2" />
        <line x1="50" y1="2" x2="55" y2="10" stroke="#f59e0b" stroke-width="1.5" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="58" cy="12" rx="7" ry="10" fill="var(--part-color, #171717)" stroke="#0a0a0a" stroke-width="2" />
      `),
      profile: makeSvg(`
        <ellipse cx="64" cy="14" rx="7" ry="10" fill="var(--part-color, #171717)" stroke="#0a0a0a" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="58" cy="14" rx="8" ry="11" fill="var(--part-color, #171717)" stroke="#0a0a0a" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="50" cy="14" rx="8" ry="12" fill="var(--part-color, #171717)" stroke="#0a0a0a" stroke-width="2" />
        <path d="M 50 24 Q 52 40 50 48" stroke="var(--part-color, #171717)" stroke-width="4" stroke-linecap="round" />
      `),
    },
  },
  {
    id: 'hair_braid',
    category: 'hair',
    name: 'Long Women Braid (Choti)',
    colorable: true,
    defaultColor: '#171717',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hair,
    sprites: {
      front: makeSvg(`
        <path d="M 16 38 C 16 12 84 12 84 38 C 76 34 50 32 16 38 Z" fill="var(--part-color, #171717)" />
        <path d="M 22 40 Q 15 65 24 88" stroke="var(--part-color, #171717)" stroke-width="8" stroke-linecap="round" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 18 38 C 18 12 82 14 82 40 C 74 34 50 32 18 38 Z" fill="var(--part-color, #171717)" />
        <path d="M 26 40 Q 20 65 30 88" stroke="var(--part-color, #171717)" stroke-width="8" stroke-linecap="round" fill="none" />
      `),
      profile: makeSvg(`
        <path d="M 24 38 C 22 14 78 16 78 44" fill="var(--part-color, #171717)" />
        <path d="M 30 42 Q 22 65 28 88" stroke="var(--part-color, #171717)" stroke-width="8" stroke-linecap="round" fill="none" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 18 38 C 18 12 82 12 82 42 C 82 54 18 54 18 38 Z" fill="var(--part-color, #171717)" />
        <path d="M 44 46 Q 42 70 45 92" stroke="var(--part-color, #171717)" stroke-width="8" stroke-linecap="round" fill="none" />
      `),
      back: makeSvg(`
        <path d="M 16 38 C 16 12 84 12 84 40 C 84 56 16 56 16 38 Z" fill="var(--part-color, #171717)" />
        <path d="M 50 46 Q 50 70 50 95" stroke="var(--part-color, #171717)" stroke-width="9" stroke-linecap="round" fill="none" />
        <circle cx="50" cy="50" r="3" fill="#ef4444" />
        <circle cx="50" cy="92" r="3" fill="#f59e0b" />
      `),
    },
  },
  {
    id: 'hair_curly',
    category: 'hair',
    name: 'Curly Black Curls',
    colorable: true,
    defaultColor: '#171717',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hair,
    sprites: {
      front: makeSvg(`
        <circle cx="25" cy="25" r="14" fill="var(--part-color, #171717)" />
        <circle cx="50" cy="18" r="15" fill="var(--part-color, #171717)" />
        <circle cx="75" cy="25" r="14" fill="var(--part-color, #171717)" />
        <circle cx="16" cy="38" r="10" fill="var(--part-color, #171717)" />
        <circle cx="84" cy="38" r="10" fill="var(--part-color, #171717)" />
      `),
      threeQuarterFront: makeSvg(`
        <circle cx="32" cy="24" r="14" fill="var(--part-color, #171717)" />
        <circle cx="56" cy="18" r="15" fill="var(--part-color, #171717)" />
        <circle cx="78" cy="26" r="13" fill="var(--part-color, #171717)" />
      `),
      profile: makeSvg(`
        <circle cx="38" cy="24" r="14" fill="var(--part-color, #171717)" />
        <circle cx="60" cy="20" r="14" fill="var(--part-color, #171717)" />
      `),
      threeQuarterBack: makeSvg(`
        <circle cx="32" cy="24" r="14" fill="var(--part-color, #171717)" />
        <circle cx="56" cy="20" r="16" fill="var(--part-color, #171717)" />
      `),
      back: makeSvg(`
        <circle cx="26" cy="26" r="14" fill="var(--part-color, #171717)" />
        <circle cx="50" cy="20" r="16" fill="var(--part-color, #171717)" />
        <circle cx="74" cy="26" r="14" fill="var(--part-color, #171717)" />
      `),
    },
  },
  {
    id: 'hair_white_elder',
    category: 'hair',
    name: 'Flowing Elder White Hair',
    colorable: true,
    defaultColor: '#f1f5f9',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hair,
    sprites: {
      front: makeSvg(`
        <path d="M 14 38 C 14 10 86 10 86 38 C 76 34 50 32 14 38 Z" fill="var(--part-color, #f1f5f9)" stroke="#cbd5e1" stroke-width="2" />
        <path d="M 14 38 L 10 65 L 18 55 Z" fill="var(--part-color, #f1f5f9)" stroke="#cbd5e1" />
        <path d="M 86 38 L 90 65 L 82 55 Z" fill="var(--part-color, #f1f5f9)" stroke="#cbd5e1" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 18 38 C 16 10 84 12 84 40 C 76 34 50 32 18 38 Z" fill="var(--part-color, #f1f5f9)" stroke="#cbd5e1" stroke-width="2" />
        <path d="M 16 40 L 12 65 L 20 55 Z" fill="var(--part-color, #f1f5f9)" stroke="#cbd5e1" />
      `),
      profile: makeSvg(`
        <path d="M 24 38 C 22 14 80 16 80 44" fill="var(--part-color, #f1f5f9)" stroke="#cbd5e1" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <path d="M 18 38 C 18 10 84 10 84 42 C 84 62 18 62 18 38 Z" fill="var(--part-color, #f1f5f9)" stroke="#cbd5e1" stroke-width="2" />
      `),
      back: makeSvg(`
        <path d="M 14 38 C 14 10 86 10 86 42 C 86 65 14 65 14 38 Z" fill="var(--part-color, #f1f5f9)" stroke="#cbd5e1" stroke-width="2" />
      `),
    },
  },

  // ===================== 7. NOSE =====================
  {
    id: 'nose_pointed',
    category: 'nose',
    name: 'Classic Pointed Nose',
    colorable: true,
    defaultColor: '#9c6339',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.nose,
    sprites: {
      front: makeSvg(`
        <path d="M 50 44 L 46 56 L 54 56 Z" fill="var(--part-color, #9c6339)" stroke="#9c6339" stroke-width="1.5" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 54 44 Q 62 52 64 56 Q 56 58 54 56 Z" fill="var(--part-color, #9c6339)" stroke="#9c6339" stroke-width="1.5" />
      `),
      profile: makeSvg(`
        <path d="M 60 44 Q 74 52 74 56 L 62 56 Z" fill="var(--part-color, #9c6339)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'nose_button',
    category: 'nose',
    name: 'Button Round Nose',
    colorable: true,
    defaultColor: '#9c6339',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.nose,
    sprites: {
      front: makeSvg(`
        <circle cx="50" cy="54" r="4" fill="var(--part-color, #9c6339)" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="58" cy="54" rx="4" ry="3.5" fill="var(--part-color, #9c6339)" />
      `),
      profile: makeSvg(`
        <ellipse cx="68" cy="54" rx="4" ry="4" fill="var(--part-color, #9c6339)" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'nose_broad',
    category: 'nose',
    name: 'Broad Village Nose',
    colorable: true,
    defaultColor: '#9c6339',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.nose,
    sprites: {
      front: makeSvg(`
        <path d="M 44 54 Q 50 50 56 54 Q 50 58 44 54 Z" fill="var(--part-color, #9c6339)" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 52 54 Q 58 50 64 54" stroke="var(--part-color, #9c6339)" stroke-width="2.5" />
      `),
      profile: makeSvg(`
        <path d="M 58 50 Q 70 54 66 58" stroke="var(--part-color, #9c6339)" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'nose_aquiline',
    category: 'nose',
    name: 'Sharp Aquiline Hook',
    colorable: true,
    defaultColor: '#9c6339',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.nose,
    sprites: {
      front: makeSvg(`
        <line x1="50" y1="42" x2="48" y2="54" stroke="var(--part-color, #9c6339)" stroke-width="2" />
        <path d="M 46 54 Q 50 58 54 54" stroke="var(--part-color, #9c6339)" stroke-width="2" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 54 42 Q 62 48 64 54 Q 58 56 54 54" stroke="var(--part-color, #9c6339)" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 60 40 Q 76 46 72 56 L 62 56" stroke="var(--part-color, #9c6339)" stroke-width="2" fill="none" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'nose_nath',
    category: 'nose',
    name: 'Nath Pierced (Golden Ring)',
    colorable: true,
    defaultColor: '#fbbf24',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.nose,
    sprites: {
      front: makeSvg(`
        <path d="M 50 44 L 46 55 L 54 55 Z" fill="#9c6339" />
        <circle cx="56" cy="55" r="4.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="1.8" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 54 44 Q 62 52 64 55 Z" fill="#9c6339" />
        <circle cx="65" cy="55" r="4.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="1.8" />
      `),
      profile: makeSvg(`
        <circle cx="70" cy="55" r="4.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="1.8" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'nose_subtle',
    category: 'nose',
    name: 'Subtle Stylized Dot',
    colorable: true,
    defaultColor: '#9c6339',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.nose,
    sprites: {
      front: makeSvg(`
        <circle cx="50" cy="54" r="2.5" fill="var(--part-color, #9c6339)" />
      `),
      threeQuarterFront: makeSvg(`
        <circle cx="58" cy="54" r="2.5" fill="var(--part-color, #9c6339)" />
      `),
      profile: makeSvg(`
        <circle cx="66" cy="54" r="2.5" fill="var(--part-color, #9c6339)" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },

  // ===================== 8. EYEBROWS =====================
  {
    id: 'brow_thick',
    category: 'eyebrows',
    name: 'Thick Bushy Eyebrows',
    colorable: true,
    defaultColor: '#0f172a',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyebrows,
    sprites: {
      front: makeSvg(`
        <path d="M 22 40 Q 36 34 46 38" stroke="var(--part-color, #0f172a)" stroke-width="4" stroke-linecap="round" />
        <path d="M 78 40 Q 64 34 54 38" stroke="var(--part-color, #0f172a)" stroke-width="4" stroke-linecap="round" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 32 40 Q 46 34 56 38" stroke="var(--part-color, #0f172a)" stroke-width="4" stroke-linecap="round" />
        <path d="M 76 40 Q 68 36 62 38" stroke="var(--part-color, #0f172a)" stroke-width="3.5" stroke-linecap="round" />
      `),
      profile: makeSvg(`
        <path d="M 52 38 Q 66 34 72 38" stroke="var(--part-color, #0f172a)" stroke-width="4" stroke-linecap="round" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'brow_sharp',
    category: 'eyebrows',
    name: 'Sharp Arched Eyebrows',
    colorable: true,
    defaultColor: '#0f172a',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyebrows,
    sprites: {
      front: makeSvg(`
        <path d="M 24 42 L 36 36 L 46 40" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        <path d="M 76 42 L 64 36 L 54 40" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 34 42 L 46 36 L 56 40" stroke="var(--part-color, #0f172a)" stroke-width="3" fill="none" />
        <path d="M 76 42 L 68 36 L 62 40" stroke="var(--part-color, #0f172a)" stroke-width="2.5" fill="none" />
      `),
      profile: makeSvg(`
        <path d="M 54 42 L 64 36 L 72 40" stroke="var(--part-color, #0f172a)" stroke-width="3" fill="none" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'brow_soft',
    category: 'eyebrows',
    name: 'Soft Natural Eyebrows',
    colorable: true,
    defaultColor: '#1e293b',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyebrows,
    sprites: {
      front: makeSvg(`
        <path d="M 24 40 Q 36 36 46 40" stroke="var(--part-color, #1e293b)" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <path d="M 76 40 Q 64 36 54 40" stroke="var(--part-color, #1e293b)" stroke-width="2.5" stroke-linecap="round" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 34 40 Q 46 36 56 40" stroke="var(--part-color, #1e293b)" stroke-width="2.5" stroke-linecap="round" fill="none" />
      `),
      profile: makeSvg(`
        <path d="M 54 40 Q 64 36 72 40" stroke="var(--part-color, #1e293b)" stroke-width="2.5" stroke-linecap="round" fill="none" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'brow_elder',
    category: 'eyebrows',
    name: 'Bushy Elder White Brows',
    colorable: true,
    defaultColor: '#f1f5f9',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyebrows,
    sprites: {
      front: makeSvg(`
        <path d="M 22 38 Q 36 32 46 38" stroke="var(--part-color, #f1f5f9)" stroke-width="5" stroke-linecap="round" />
        <path d="M 78 38 Q 64 32 54 38" stroke="var(--part-color, #f1f5f9)" stroke-width="5" stroke-linecap="round" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 32 38 Q 46 32 56 38" stroke="var(--part-color, #f1f5f9)" stroke-width="5" stroke-linecap="round" />
      `),
      profile: makeSvg(`
        <path d="M 52 36 Q 66 32 72 38" stroke="var(--part-color, #f1f5f9)" stroke-width="5" stroke-linecap="round" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'brow_straight',
    category: 'eyebrows',
    name: 'Straight Bold Eyebrows',
    colorable: true,
    defaultColor: '#0f172a',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyebrows,
    sprites: {
      front: makeSvg(`
        <line x1="24" y1="38" x2="46" y2="38" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" />
        <line x1="54" y1="38" x2="76" y2="38" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" />
      `),
      threeQuarterFront: makeSvg(`
        <line x1="34" y1="38" x2="56" y2="38" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" />
      `),
      profile: makeSvg(`
        <line x1="56" y1="38" x2="72" y2="38" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'brow_thin',
    category: 'eyebrows',
    name: 'Thin Groomed Eyebrows',
    colorable: true,
    defaultColor: '#1e293b',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.eyebrows,
    sprites: {
      front: makeSvg(`
        <path d="M 24 40 Q 36 34 46 38" stroke="var(--part-color, #1e293b)" stroke-width="1.8" stroke-linecap="round" fill="none" />
        <path d="M 76 40 Q 64 34 54 38" stroke="var(--part-color, #1e293b)" stroke-width="1.8" stroke-linecap="round" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 34 40 Q 46 34 56 38" stroke="var(--part-color, #1e293b)" stroke-width="1.8" stroke-linecap="round" fill="none" />
      `),
      profile: makeSvg(`
        <path d="M 54 38 Q 64 34 72 38" stroke="var(--part-color, #1e293b)" stroke-width="1.8" stroke-linecap="round" fill="none" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },

  // ===================== 9. EARS =====================
  {
    id: 'ear_normal',
    category: 'ears',
    name: 'Standard Round Ears',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.ears,
    sprites: {
      front: makeSvg(`
        <ellipse cx="12" cy="50" rx="6" ry="11" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <ellipse cx="88" cy="50" rx="6" ry="11" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="16" cy="50" rx="6" ry="11" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <ellipse cx="86" cy="50" rx="4" ry="9" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      profile: makeSvg(`
        <ellipse cx="38" cy="50" rx="8" ry="13" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="28" cy="50" rx="6" ry="11" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="12" cy="50" rx="6" ry="11" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <ellipse cx="88" cy="50" rx="6" ry="11" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
    },
  },
  {
    id: 'ear_gold_hoop',
    category: 'ears',
    name: 'Ears with Gold Kundan Hoop',
    colorable: true,
    defaultColor: '#fbbf24',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.ears,
    sprites: {
      front: makeSvg(`
        <ellipse cx="12" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
        <circle cx="12" cy="62" r="4.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="2" />
        <ellipse cx="88" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
        <circle cx="88" cy="62" r="4.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="16" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
        <circle cx="16" cy="62" r="4.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="2" />
      `),
      profile: makeSvg(`
        <ellipse cx="38" cy="50" rx="8" ry="13" fill="#d99763" stroke="#9c6339" stroke-width="2.5" />
        <circle cx="38" cy="64" r="5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="2.2" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="28" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="12" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
        <ellipse cx="88" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
      `),
    },
  },
  {
    id: 'ear_elder',
    category: 'ears',
    name: 'Large Elder Ears',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.ears,
    sprites: {
      front: makeSvg(`
        <ellipse cx="10" cy="52" rx="7" ry="14" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <ellipse cx="90" cy="52" rx="7" ry="14" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="14" cy="52" rx="7" ry="14" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      profile: makeSvg(`
        <ellipse cx="36" cy="52" rx="9" ry="16" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="26" cy="52" rx="7" ry="14" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="10" cy="52" rx="7" ry="14" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <ellipse cx="90" cy="52" rx="7" ry="14" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
    },
  },
  {
    id: 'ear_small',
    category: 'ears',
    name: 'Small Tucked Ears',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.ears,
    sprites: {
      front: makeSvg(`
        <ellipse cx="14" cy="50" rx="4.5" ry="8" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <ellipse cx="86" cy="50" rx="4.5" ry="8" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="18" cy="50" rx="4.5" ry="8" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      profile: makeSvg(`
        <ellipse cx="40" cy="50" rx="6" ry="10" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="30" cy="50" rx="4.5" ry="8" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="14" cy="50" rx="4.5" ry="8" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <ellipse cx="86" cy="50" rx="4.5" ry="8" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
    },
  },
  {
    id: 'ear_pointed',
    category: 'ears',
    name: 'Pointed High Ears',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.ears,
    sprites: {
      front: makeSvg(`
        <polygon points="12,38 4,50 14,56" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <polygon points="88,38 96,50 86,56" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <polygon points="16,38 8,50 18,56" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      profile: makeSvg(`
        <polygon points="38,36 28,48 40,58" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <polygon points="28,38 20,50 30,56" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      back: makeSvg(`
        <polygon points="12,38 4,50 14,56" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <polygon points="88,38 96,50 86,56" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
    },
  },
  {
    id: 'ear_stud',
    category: 'ears',
    name: 'Ears with Diamond Stud',
    colorable: true,
    defaultColor: '#38bdf8',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.ears,
    sprites: {
      front: makeSvg(`
        <ellipse cx="12" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
        <circle cx="12" cy="58" r="2.5" fill="var(--part-color, #38bdf8)" stroke="#ffffff" stroke-width="1" />
        <ellipse cx="88" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
        <circle cx="88" cy="58" r="2.5" fill="var(--part-color, #38bdf8)" stroke="#ffffff" stroke-width="1" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="16" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
        <circle cx="16" cy="58" r="2.5" fill="var(--part-color, #38bdf8)" />
      `),
      profile: makeSvg(`
        <ellipse cx="38" cy="50" rx="8" ry="13" fill="#d99763" stroke="#9c6339" stroke-width="2.5" />
        <circle cx="38" cy="60" r="3" fill="var(--part-color, #38bdf8)" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="28" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="12" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
        <ellipse cx="88" cy="50" rx="6" ry="11" fill="#d99763" stroke="#9c6339" stroke-width="2" />
      `),
    },
  },

  // ===================== 10. MOUTH / VISEMES =====================
  {
    id: 'mouth_neutral',
    category: 'mouth',
    name: 'Natural Neutral Mouth',
    colorable: true,
    defaultColor: '#881337',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mouth,
    sprites: {
      front: makeSvg(`
        <path d="M 40 68 Q 50 72 60 68" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 48 68 Q 56 72 64 68" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
      `),
      profile: makeSvg(`
        <path d="M 58 68 Q 66 70 70 68" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'mouth_smile',
    category: 'mouth',
    name: 'Cheerful Smile',
    colorable: true,
    defaultColor: '#881337',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mouth,
    sprites: {
      front: makeSvg(`
        <path d="M 38 65 Q 50 78 62 65 Z" fill="var(--part-color, #881337)" stroke="#0f172a" stroke-width="2" />
        <path d="M 42 66 Q 50 68 58 66" stroke="#ffffff" stroke-width="2" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 46 65 Q 56 78 66 65 Z" fill="var(--part-color, #881337)" stroke="#0f172a" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 56 65 Q 66 76 72 65 Z" fill="var(--part-color, #881337)" stroke="#0f172a" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'mouth_wide_open',
    category: 'mouth',
    name: 'Laughing Open Mouth',
    colorable: true,
    defaultColor: '#641220',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mouth,
    sprites: {
      front: makeSvg(`
        <ellipse cx="50" cy="70" rx="10" ry="8" fill="var(--part-color, #641220)" stroke="#0f172a" stroke-width="2.5" />
        <path d="M 44 67 Q 50 70 56 67" stroke="#ffffff" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="56" cy="70" rx="8" ry="8" fill="var(--part-color, #641220)" stroke="#0f172a" stroke-width="2.5" />
      `),
      profile: makeSvg(`
        <path d="M 58 66 Q 72 68 68 76 Q 60 76 58 66 Z" fill="var(--part-color, #641220)" stroke="#0f172a" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'mouth_sad',
    category: 'mouth',
    name: 'Sad Frown',
    colorable: true,
    defaultColor: '#0f172a',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mouth,
    sprites: {
      front: makeSvg(`
        <path d="M 40 72 Q 50 64 60 72" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 48 72 Q 56 64 64 72" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" fill="none" />
      `),
      profile: makeSvg(`
        <path d="M 58 72 Q 66 66 70 72" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" fill="none" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'mouth_talking',
    category: 'mouth',
    name: 'Talking O-Shape',
    colorable: true,
    defaultColor: '#641220',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mouth,
    sprites: {
      front: makeSvg(`
        <circle cx="50" cy="70" r="6" fill="var(--part-color, #641220)" stroke="#0f172a" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="56" cy="70" rx="5" ry="6" fill="var(--part-color, #641220)" stroke="#0f172a" stroke-width="2" />
      `),
      profile: makeSvg(`
        <ellipse cx="66" cy="70" rx="4" ry="6" fill="var(--part-color, #641220)" stroke="#0f172a" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'mouth_smirk',
    category: 'mouth',
    name: 'Cunning Smirk',
    colorable: true,
    defaultColor: '#0f172a',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mouth,
    sprites: {
      front: makeSvg(`
        <path d="M 42 70 Q 52 72 62 64" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 50 70 Q 58 72 66 64" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" fill="none" />
      `),
      profile: makeSvg(`
        <path d="M 60 70 Q 66 70 72 64" stroke="var(--part-color, #0f172a)" stroke-width="3" stroke-linecap="round" fill="none" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },

  // ===================== 11. MUSTACHE / FACIAL HAIR =====================
  {
    id: 'mustache_rajput',
    category: 'mustache',
    name: 'Royal Rajput Curled Mustache',
    colorable: true,
    defaultColor: '#171717',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mustache,
    sprites: {
      front: makeSvg(`
        <path d="M 50 62 Q 35 60 22 52 Q 20 46 26 48 Q 36 55 50 58 Q 64 55 74 48 Q 80 46 78 52 Q 65 60 50 62 Z" fill="var(--part-color, #171717)" stroke="#000000" stroke-width="1.5" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 55 62 Q 40 60 28 52 Q 26 48 32 48 Q 42 55 55 58 Q 66 55 74 50 Q 78 48 76 54 Q 68 60 55 62 Z" fill="var(--part-color, #171717)" stroke="#000000" stroke-width="1.5" />
      `),
      profile: makeSvg(`
        <path d="M 62 60 Q 74 58 82 50 Q 82 46 78 48 Q 72 55 62 58 Z" fill="var(--part-color, #171717)" stroke="#000000" stroke-width="1.5" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'mustache_police',
    category: 'mustache',
    name: 'Thick Police Mustache',
    colorable: true,
    defaultColor: '#171717',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mustache,
    sprites: {
      front: makeSvg(`
        <path d="M 32 62 Q 50 58 68 62 L 64 66 Q 50 62 36 66 Z" fill="var(--part-color, #171717)" stroke="#000000" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 40 62 Q 55 58 70 62 L 67 66 Q 55 62 43 66 Z" fill="var(--part-color, #171717)" stroke="#000000" />
      `),
      profile: makeSvg(`
        <path d="M 58 62 Q 68 60 74 64 L 70 67 Q 66 64 58 65 Z" fill="var(--part-color, #171717)" stroke="#000000" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'mustache_full_beard',
    category: 'mustache',
    name: 'Full Village Beard',
    colorable: true,
    defaultColor: '#171717',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mustache,
    sprites: {
      front: makeSvg(`
        <path d="M 24 58 Q 50 95 76 58 Q 50 72 24 58 Z" fill="var(--part-color, #171717)" stroke="#000000" stroke-width="1.5" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 30 58 Q 54 95 78 60 Q 54 72 30 58 Z" fill="var(--part-color, #171717)" stroke="#000000" stroke-width="1.5" />
      `),
      profile: makeSvg(`
        <path d="M 42 58 Q 68 95 76 60 Q 58 72 42 58 Z" fill="var(--part-color, #171717)" stroke="#000000" stroke-width="1.5" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'mustache_white_elder',
    category: 'mustache',
    name: 'Elder Grandfather Beard',
    colorable: true,
    defaultColor: '#f1f5f9',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mustache,
    sprites: {
      front: makeSvg(`
        <path d="M 22 56 Q 50 100 78 56 Q 50 72 22 56 Z" fill="var(--part-color, #f1f5f9)" stroke="#cbd5e1" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <path d="M 28 56 Q 54 100 80 58 Q 54 72 28 56 Z" fill="var(--part-color, #f1f5f9)" stroke="#cbd5e1" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 40 56 Q 66 100 76 60 Q 56 72 40 56 Z" fill="var(--part-color, #f1f5f9)" stroke="#cbd5e1" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'mustache_french',
    category: 'mustache',
    name: 'Trimmed French Beard',
    colorable: true,
    defaultColor: '#171717',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mustache,
    sprites: {
      front: makeSvg(`
        <circle cx="50" cy="74" r="8" fill="var(--part-color, #171717)" />
        <path d="M 42 62 Q 50 58 58 62" stroke="var(--part-color, #171717)" stroke-width="3" stroke-linecap="round" />
      `),
      threeQuarterFront: makeSvg(`
        <circle cx="56" cy="74" r="7" fill="var(--part-color, #171717)" />
      `),
      profile: makeSvg(`
        <circle cx="66" cy="74" r="6" fill="var(--part-color, #171717)" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'mustache_stubble',
    category: 'mustache',
    name: '5 O\'Clock Stubble',
    colorable: true,
    defaultColor: '#475569',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.mustache,
    sprites: {
      front: makeSvg(`
        <ellipse cx="50" cy="70" rx="16" ry="10" fill="var(--part-color, #475569)" opacity="0.3" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="56" cy="70" rx="14" ry="10" fill="var(--part-color, #475569)" opacity="0.3" />
      `),
      profile: makeSvg(`
        <ellipse cx="64" cy="70" rx="12" ry="10" fill="var(--part-color, #475569)" opacity="0.3" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },

  // ===================== 12. HANDS =====================
  {
    id: 'hand_open',
    category: 'hands',
    name: 'Open Palm Hand',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hands,
    sprites: {
      front: makeSvg(`
        <ellipse cx="50" cy="60" rx="15" ry="18" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <rect x="36" y="24" width="6" height="24" rx="3" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
        <rect x="44" y="18" width="6" height="28" rx="3" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
        <rect x="52" y="20" width="6" height="26" rx="3" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
        <rect x="60" y="26" width="6" height="20" rx="3" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
        <rect x="28" y="44" width="7" height="18" rx="3" transform="rotate(-30 28 44)" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="52" cy="60" rx="14" ry="18" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <rect x="42" y="20" width="6" height="26" rx="3" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="1.5" />
      `),
      profile: makeSvg(`
        <ellipse cx="50" cy="55" rx="10" ry="20" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="50" cy="60" rx="14" ry="18" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="50" cy="60" rx="15" ry="18" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <line x1="42" y1="46" x2="42" y2="60" stroke="#9c6339" stroke-width="1" />
        <line x1="50" y1="44" x2="50" y2="60" stroke="#9c6339" stroke-width="1" />
        <line x1="58" y1="46" x2="58" y2="60" stroke="#9c6339" stroke-width="1" />
      `),
    },
  },
  {
    id: 'hand_fist',
    category: 'hands',
    name: 'Closed Fist Punch',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hands,
    sprites: {
      front: makeSvg(`
        <rect x="32" y="36" width="36" height="34" rx="10" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
        <line x1="42" y1="36" x2="42" y2="58" stroke="#9c6339" stroke-width="1.5" />
        <line x1="50" y1="36" x2="50" y2="58" stroke="#9c6339" stroke-width="1.5" />
        <line x1="58" y1="36" x2="58" y2="58" stroke="#9c6339" stroke-width="1.5" />
        <path d="M 28 54 Q 38 68 56 68" stroke="#9c6339" stroke-width="3" fill="none" />
      `),
      threeQuarterFront: makeSvg(`
        <rect x="34" y="36" width="34" height="34" rx="10" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
      `),
      profile: makeSvg(`
        <circle cx="50" cy="50" r="16" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
      `),
      threeQuarterBack: makeSvg(`
        <rect x="34" y="36" width="34" height="34" rx="10" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
      `),
      back: makeSvg(`
        <rect x="32" y="36" width="36" height="34" rx="10" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2.5" />
      `),
    },
  },
  {
    id: 'hand_point',
    category: 'hands',
    name: 'Pointing Index Finger',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hands,
    sprites: {
      front: makeSvg(`
        <rect x="35" y="45" width="30" height="28" rx="8" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <rect x="46" y="16" width="8" height="32" rx="4" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <rect x="38" y="45" width="28" height="28" rx="8" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <rect x="50" y="16" width="8" height="32" rx="4" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      profile: makeSvg(`
        <path d="M 40 45 L 68 25 L 72 32 L 48 56 Z" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <rect x="38" y="45" width="28" height="28" rx="8" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      back: makeSvg(`
        <rect x="35" y="45" width="30" height="28" rx="8" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <rect x="46" y="16" width="8" height="32" rx="4" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
    },
  },
  {
    id: 'hand_namaste',
    category: 'hands',
    name: 'Namaste Prayer Hands',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hands,
    sprites: {
      front: makeSvg(`
        <ellipse cx="50" cy="50" rx="10" ry="24" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <line x1="50" y1="26" x2="50" y2="74" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="54" cy="50" rx="9" ry="24" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      profile: makeSvg(`
        <ellipse cx="58" cy="50" rx="6" ry="24" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="54" cy="50" rx="9" ry="24" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="50" cy="50" rx="10" ry="24" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
    },
  },
  {
    id: 'hand_thumbs_up',
    category: 'hands',
    name: 'Thumbs Up Gesture',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hands,
    sprites: {
      front: makeSvg(`
        <circle cx="50" cy="60" r="14" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <rect x="46" y="24" width="8" height="26" rx="4" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <circle cx="52" cy="60" r="14" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <rect x="48" y="24" width="8" height="26" rx="4" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      profile: makeSvg(`
        <circle cx="50" cy="60" r="12" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <rect x="48" y="26" width="8" height="24" rx="4" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <circle cx="50" cy="60" r="14" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      back: makeSvg(`
        <circle cx="50" cy="60" r="14" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
        <rect x="46" y="24" width="8" height="26" rx="4" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
    },
  },
  {
    id: 'hand_relaxed',
    category: 'hands',
    name: 'Relaxed Natural Hand',
    colorable: true,
    defaultColor: '#d99763',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.hands,
    sprites: {
      front: makeSvg(`
        <ellipse cx="50" cy="55" rx="14" ry="18" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <ellipse cx="52" cy="55" rx="13" ry="18" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      profile: makeSvg(`
        <ellipse cx="54" cy="55" rx="9" ry="18" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`
        <ellipse cx="52" cy="55" rx="13" ry="18" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
      back: makeSvg(`
        <ellipse cx="50" cy="55" rx="14" ry="18" fill="var(--part-color, #d99763)" stroke="#9c6339" stroke-width="2" />
      `),
    },
  },

  // ===================== 13. EARRINGS =====================
  {
    id: 'earring_none',
    category: 'earrings',
    name: 'No Earrings',
    colorable: false,
    defaultColor: '#ffffff',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.earrings,
    sprites: {
      front: makeSvg(`<g opacity="0"></g>`),
      threeQuarterFront: makeSvg(`<g opacity="0"></g>`),
      profile: makeSvg(`<g opacity="0"></g>`),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'earring_jhumka_gold',
    category: 'earrings',
    name: 'Royal Kundan Jhumka with Pearls (Priya)',
    colorable: true,
    defaultColor: '#fbbf24',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.earrings,
    sprites: {
      front: makeSvg(`
        <!-- Left Jhumka -->
        <circle cx="12" cy="60" r="2.5" fill="#fef08a" stroke="#b45309" stroke-width="0.8" />
        <path d="M 6 64 Q 12 60 18 64 L 16 72 L 8 72 Z" fill="var(--part-color, #fbbf24)" stroke="#b45309" stroke-width="1" />
        <circle cx="9" cy="74" r="1" fill="#ffffff" /><circle cx="12" cy="74" r="1" fill="#ffffff" /><circle cx="15" cy="74" r="1" fill="#ffffff" />
        <!-- Right Jhumka -->
        <circle cx="88" cy="60" r="2.5" fill="#fef08a" stroke="#b45309" stroke-width="0.8" />
        <path d="M 82 64 Q 88 60 94 64 L 92 72 L 84 72 Z" fill="var(--part-color, #fbbf24)" stroke="#b45309" stroke-width="1" />
        <circle cx="85" cy="74" r="1" fill="#ffffff" /><circle cx="88" cy="74" r="1" fill="#ffffff" /><circle cx="91" cy="74" r="1" fill="#ffffff" />
      `),
      threeQuarterFront: makeSvg(`
        <circle cx="16" cy="60" r="2.5" fill="#fef08a" stroke="#b45309" stroke-width="0.8" />
        <path d="M 10 64 Q 16 60 22 64 L 20 72 L 12 72 Z" fill="var(--part-color, #fbbf24)" stroke="#b45309" stroke-width="1" />
        <circle cx="13" cy="74" r="1" fill="#ffffff" /><circle cx="16" cy="74" r="1" fill="#ffffff" /><circle cx="19" cy="74" r="1" fill="#ffffff" />
      `),
      profile: makeSvg(`
        <circle cx="38" cy="62" r="2.5" fill="#fef08a" stroke="#b45309" stroke-width="0.8" />
        <path d="M 32 66 Q 38 62 44 66 L 42 74 L 34 74 Z" fill="var(--part-color, #fbbf24)" stroke="#b45309" stroke-width="1" />
        <circle cx="35" cy="76" r="1" fill="#ffffff" /><circle cx="38" cy="76" r="1" fill="#ffffff" /><circle cx="41" cy="76" r="1" fill="#ffffff" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'earring_jhumka',
    category: 'earrings',
    name: 'Royal Golden Jhumka',
    colorable: true,
    defaultColor: '#fbbf24',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.earrings,
    sprites: {
      front: makeSvg(`
        <circle cx="12" cy="62" r="3" fill="var(--part-color, #fbbf24)" />
        <path d="M 6 66 Q 12 62 18 66 L 15 74 L 9 74 Z" fill="var(--part-color, #fbbf24)" stroke="#b45309" stroke-width="1" />
        <circle cx="88" cy="62" r="3" fill="var(--part-color, #fbbf24)" />
        <path d="M 82 66 Q 88 62 94 66 L 91 74 L 85 74 Z" fill="var(--part-color, #fbbf24)" stroke="#b45309" stroke-width="1" />
      `),
      threeQuarterFront: makeSvg(`
        <circle cx="16" cy="62" r="3" fill="var(--part-color, #fbbf24)" />
        <path d="M 10 66 Q 16 62 22 66 L 19 74 L 13 74 Z" fill="var(--part-color, #fbbf24)" stroke="#b45309" stroke-width="1" />
      `),
      profile: makeSvg(`
        <circle cx="38" cy="64" r="3" fill="var(--part-color, #fbbf24)" />
        <path d="M 32 68 Q 38 64 44 68 L 41 76 L 35 76 Z" fill="var(--part-color, #fbbf24)" stroke="#b45309" stroke-width="1" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'earring_round_stud',
    category: 'earrings',
    name: 'Ruby Red Round Stud',
    colorable: true,
    defaultColor: '#e11d48',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.earrings,
    sprites: {
      front: makeSvg(`
        <circle cx="12" cy="58" r="3.5" fill="var(--part-color, #e11d48)" stroke="#fbbf24" stroke-width="1" />
        <circle cx="88" cy="58" r="3.5" fill="var(--part-color, #e11d48)" stroke="#fbbf24" stroke-width="1" />
      `),
      threeQuarterFront: makeSvg(`
        <circle cx="16" cy="58" r="3.5" fill="var(--part-color, #e11d48)" stroke="#fbbf24" stroke-width="1" />
      `),
      profile: makeSvg(`
        <circle cx="38" cy="60" r="3.5" fill="var(--part-color, #e11d48)" stroke="#fbbf24" stroke-width="1" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'earring_silver_hoop',
    category: 'earrings',
    name: 'Tribal Silver Hoop',
    colorable: true,
    defaultColor: '#e2e8f0',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.earrings,
    sprites: {
      front: makeSvg(`
        <circle cx="12" cy="62" r="5" fill="none" stroke="var(--part-color, #e2e8f0)" stroke-width="2" />
        <circle cx="88" cy="62" r="5" fill="none" stroke="var(--part-color, #e2e8f0)" stroke-width="2" />
      `),
      threeQuarterFront: makeSvg(`
        <circle cx="16" cy="62" r="5" fill="none" stroke="var(--part-color, #e2e8f0)" stroke-width="2" />
      `),
      profile: makeSvg(`
        <circle cx="38" cy="64" r="5.5" fill="none" stroke="var(--part-color, #e2e8f0)" stroke-width="2" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'earring_pearl_drop',
    category: 'earrings',
    name: 'Pearl Drop Hanging',
    colorable: true,
    defaultColor: '#f8fafc',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.earrings,
    sprites: {
      front: makeSvg(`
        <line x1="12" y1="58" x2="12" y2="66" stroke="#fbbf24" stroke-width="1.5" />
        <circle cx="12" cy="68" r="3" fill="var(--part-color, #f8fafc)" stroke="#cbd5e1" />
        <line x1="88" y1="58" x2="88" y2="66" stroke="#fbbf24" stroke-width="1.5" />
        <circle cx="88" cy="68" r="3" fill="var(--part-color, #f8fafc)" stroke="#cbd5e1" />
      `),
      threeQuarterFront: makeSvg(`
        <line x1="16" y1="58" x2="16" y2="66" stroke="#fbbf24" stroke-width="1.5" />
        <circle cx="16" cy="68" r="3" fill="var(--part-color, #f8fafc)" stroke="#cbd5e1" />
      `),
      profile: makeSvg(`
        <line x1="38" y1="60" x2="38" y2="68" stroke="#fbbf24" stroke-width="1.5" />
        <circle cx="38" cy="70" r="3" fill="var(--part-color, #f8fafc)" stroke="#cbd5e1" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'earring_double_ring',
    category: 'earrings',
    name: 'Double Golden Rings',
    colorable: true,
    defaultColor: '#fbbf24',
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.earrings,
    sprites: {
      front: makeSvg(`
        <circle cx="12" cy="60" r="3.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="1.5" />
        <circle cx="12" cy="66" r="4.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="1.5" />
        <circle cx="88" cy="60" r="3.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="1.5" />
        <circle cx="88" cy="66" r="4.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="1.5" />
      `),
      threeQuarterFront: makeSvg(`
        <circle cx="16" cy="60" r="3.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="1.5" />
        <circle cx="16" cy="66" r="4.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="1.5" />
      `),
      profile: makeSvg(`
        <circle cx="38" cy="62" r="3.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="1.5" />
        <circle cx="38" cy="68" r="4.5" fill="none" stroke="var(--part-color, #fbbf24)" stroke-width="1.5" />
      `),
      threeQuarterBack: makeSvg(`<g opacity="0"></g>`),
      back: makeSvg(`<g opacity="0"></g>`),
    },
  },
  {
    id: 'earring_none',
    category: 'earrings',
    name: 'No Earrings',
    colorable: false,
    anchor: { x: 50, y: 50 },
    zIndexPerAngle: DEFAULT_Z_INDICES.earrings,
    sprites: {
      front: makeSvg(`<g></g>`),
      threeQuarterFront: makeSvg(`<g></g>`),
      profile: makeSvg(`<g></g>`),
      threeQuarterBack: makeSvg(`<g></g>`),
      back: makeSvg(`<g></g>`),
    },
  },
];

/**
 * Retrieves the PartDefinition for a given category and partId
 */
export function getPartDefinition(category: BodyPartCategory, partId: string): PartDefinition | undefined {
  return PART_LIBRARY.find((p) => p.category === category && p.id === partId);
}

/**
 * Retrieves all PartDefinitions for a specific category
 */
export function getPartsByCategory(category: BodyPartCategory): PartDefinition[] {
  return PART_LIBRARY.filter((p) => p.category === category);
}

/**
 * Returns default part selection for a new character
 */
export function getDefaultPartsMap(): Record<BodyPartCategory, { partId: string; color: string }> {
  return {
    clothesTop: { partId: 'top_kurta', color: '#10b981' },
    clothesBottom: { partId: 'bot_dhoti', color: '#f8fafc' },
    shoes: { partId: 'shoe_mojari', color: '#b45309' },
    skinColor: { partId: 'skin_golden', color: '#d99763' },
    head: { partId: 'head_oval', color: '#d99763' },
    eyes: { partId: 'eye_almond', color: '#1e293b' },
    eyebrows: { partId: 'brow_thick', color: '#0f172a' },
    nose: { partId: 'nose_pointed', color: '#9c6339' },
    ears: { partId: 'ear_normal', color: '#d99763' },
    hair: { partId: 'hair_pagri', color: '#ea580c' },
    mouth: { partId: 'mouth_neutral', color: '#881337' },
    mustache: { partId: 'mustache_rajput', color: '#171717' },
    hands: { partId: 'hand_open', color: '#d99763' },
    earrings: { partId: 'earring_none', color: '#fbbf24' },
    torso: { partId: 'top_kurta', color: '#10b981' },
  };
}

/**
 * Renders an Eye special element with separate eyeball, iris/pupil with direction, eyelid openness, and expression
 */
export function renderEyeSpecial(
  angle: CharacterViewAngle,
  expression: EyeExpression = 'neutral',
  pupilLook: { x: number; y: number } = { x: 0, y: 0 },
  irisColor = '#1e293b'
): string {
  if (angle === 'back' || angle === 'three_quarter_back') {
    return '';
  }

  // Look offsets clamped
  const lookX = Math.max(-6, Math.min(6, pupilLook.x * 6));
  const lookY = Math.max(-5, Math.min(5, pupilLook.y * 5));

  // Expressions
  let lidY = 0;
  let arcD = '';

  switch (expression) {
    case 'blink':
      return `
        <path d="M 24 50 Q 36 58 48 50" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M 52 50 Q 64 58 76 50" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
      `;
    case 'happy':
      return `
        <path d="M 24 52 Q 36 40 48 52" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M 52 52 Q 64 40 76 52" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
      `;
    case 'sad':
      lidY = 3;
      arcD = 'M 24 44 Q 36 54 48 44';
      break;
    case 'angry':
      arcD = 'M 24 42 L 48 50';
      break;
    case 'surprised':
      return `
        <circle cx="36" cy="50" r="10" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <circle cx="${36 + lookX}" cy="${50 + lookY}" r="4.5" fill="${irisColor}" />
        <circle cx="64" cy="50" r="10" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <circle cx="${64 + lookX}" cy="${50 + lookY}" r="4.5" fill="${irisColor}" />
      `;
    case 'sleepy':
      return `
        <path d="M 24 48 Q 36 54 48 48" stroke="#0f172a" stroke-width="3" fill="none" />
        <circle cx="36" cy="51" r="3" fill="${irisColor}" />
        <path d="M 52 48 Q 64 54 76 48" stroke="#0f172a" stroke-width="3" fill="none" />
        <circle cx="64" cy="51" r="3" fill="${irisColor}" />
      `;
    case 'neutral':
    default:
      break;
  }

  if (angle === 'profile') {
    return `
      <path d="M 56 46 L 74 44 L 68 56 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <ellipse cx="${66 + lookX * 0.5}" cy="${50 + lookY}" rx="3" ry="5" fill="${irisColor}" />
      ${arcD ? `<path d="${arcD}" stroke="#0f172a" stroke-width="2.5" />` : ''}
    `;
  }

  if (angle === 'three_quarter_front') {
    return `
      <!-- Left Eye -->
      <ellipse cx="44" cy="50" rx="10" ry="8" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <circle cx="${44 + lookX}" cy="${50 + lookY}" r="4.5" fill="${irisColor}" />
      <!-- Right Eye foreshortened -->
      <ellipse cx="70" cy="50" rx="6" ry="7" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <circle cx="${70 + lookX * 0.6}" cy="${50 + lookY}" r="3.5" fill="${irisColor}" />
    `;
  }

  // Front View
  return `
    <!-- Left Eye -->
    <ellipse cx="36" cy="50" rx="9" ry="7" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
    <circle cx="${36 + lookX}" cy="${50 + lookY}" r="4.5" fill="${irisColor}" />
    <circle cx="${38 + lookX}" cy="${48 + lookY}" r="1.5" fill="#ffffff" />
    <!-- Right Eye -->
    <ellipse cx="64" cy="50" rx="9" ry="7" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
    <circle cx="${64 + lookX}" cy="${50 + lookY}" r="4.5" fill="${irisColor}" />
    <circle cx="${66 + lookX}" cy="${48 + lookY}" r="1.5" fill="#ffffff" />
    ${arcD ? `<path d="${arcD}" stroke="#0f172a" stroke-width="2.5" />` : ''}
  `;
}

/**
 * Renders Viseme mouth shapes (A, E, I, O, U, M, closed) for lip sync across 5 angles
 */
export function renderVisemeShape(
  viseme: VisemeShape = 'closed',
  angle: CharacterViewAngle = 'front',
  lipColor = '#881337'
): string {
  if (angle === 'back' || angle === 'three_quarter_back') {
    return '';
  }

  const cx = angle === 'profile' ? 66 : angle === 'three_quarter_front' ? 56 : 50;

  switch (viseme) {
    case 'A':
      return `<ellipse cx="${cx}" cy="70" rx="${angle === 'profile' ? 6 : 9}" ry="8" fill="${lipColor}" stroke="#0f172a" stroke-width="2" />`;
    case 'E':
      return `<rect x="${cx - 9}" y="66" width="${angle === 'profile' ? 12 : 18}" height="7" rx="3" fill="${lipColor}" stroke="#0f172a" stroke-width="2" />`;
    case 'I':
      return `<path d="M ${cx - 8} 68 Q ${cx} 72 ${cx + 8} 68" stroke="#0f172a" stroke-width="2.5" fill="none" /><line x1="${cx - 6}" y1="68" x2="${cx + 6}" y2="68" stroke="#ffffff" stroke-width="2" />`;
    case 'O':
      return `<ellipse cx="${cx}" cy="70" rx="6" ry="7" fill="${lipColor}" stroke="#0f172a" stroke-width="2" />`;
    case 'U':
      return `<circle cx="${cx}" cy="70" r="4.5" fill="${lipColor}" stroke="#0f172a" stroke-width="2" />`;
    case 'M':
    case 'closed':
    default:
      return `<path d="M ${cx - 8} 70 Q ${cx} 71 ${cx + 8} 70" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />`;
  }
}
