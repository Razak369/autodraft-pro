import React, { useState, useRef, useEffect } from 'react';
import {
  CharacterConfig,
  CharacterViewAngle,
  BodyPartCategory,
  VisemeShape,
  EyeExpression,
} from '../types/studio';
import {
  PART_LIBRARY,
  getPartsByCategory,
  getDefaultPartsMap,
  renderEyeSpecial,
  renderVisemeShape,
} from '../utils/partLibrary';
import { CharacterRenderer5Angle } from './CharacterRenderer5Angle';
import {
  Search,
  X,
  Save,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FlipHorizontal,
  Bone,
  Play,
  Pause,
  Upload,
  Palette,
  Smile,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  Trash2,
  Download,
  Check,
  ChevronLeft,
  Move,
  Image as ImageIcon,
  Layout,
  Sliders,
  Eye,
  Pipette,
  Wand2,
} from 'lucide-react';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCharacter: (character: CharacterConfig, isSaveAsNew?: boolean) => void;
  initialCharacter?: CharacterConfig;
}

type BreadcrumbTab = 'head' | 'select_clothes' | 'change_clothes' | 'locked_layers';
type EditorLayoutMode = 'creator_steps' | 'character_project';

interface ReferencePhotoPreset {
  id: string;
  title: string;
  badge: string;
  skinColor: string;
  hairColor: string;
  topColor: string;
  bottomColor: string;
  suggestedParts: Partial<Record<BodyPartCategory, string>>;
  previewSvg: string;
}

const REFERENCE_PHOTO_PRESETS: ReferencePhotoPreset[] = [
  {
    id: 'ref_sarpanch',
    title: 'Village Sarpanch Portrait',
    badge: 'Desi Elder',
    skinColor: '#d99763',
    hairColor: '#f8fafc',
    topColor: '#f59e0b',
    bottomColor: '#ffffff',
    suggestedParts: {
      head: 'head_elder_round',
      hair: 'hair_pagdi_royal',
      mustache: 'must_handlebar',
      clothesTop: 'top_kurta_vest',
      clothesBottom: 'bot_dhoti_white',
      shoes: 'shoe_mojari_gold',
    },
    previewSvg: `<svg viewBox="0 0 80 80"><rect width="80" height="80" rx="12" fill="#1e293b"/><circle cx="40" cy="34" r="16" fill="#d99763"/><path d="M22,28 Q40,12 58,28 Z" fill="#f59e0b"/><path d="M30,38 Q40,44 50,38" stroke="#1e293b" stroke-width="3" fill="none"/><rect x="22" y="52" width="36" height="24" rx="6" fill="#f59e0b"/></svg>`,
  },
  {
    id: 'ref_bride_saree',
    title: 'Green Saree Heroine (Ref 13)',
    badge: 'Traditional',
    skinColor: '#e0a575',
    hairColor: '#1c1917',
    topColor: '#881337',
    bottomColor: '#047857',
    suggestedParts: {
      head: 'head_oval_soft',
      hair: 'hair_long_wavy',
      mustache: 'mustache_none',
      earrings: 'earring_jhumka_gold',
      clothesTop: 'top_saree_blouse',
      clothesBottom: 'bot_saree_pleats',
      shoes: 'shoe_sandals_brown',
    },
    previewSvg: `<svg viewBox="0 0 80 80"><rect width="80" height="80" rx="12" fill="#1e293b"/><path d="M24,22 Q40,10 56,22 L58,54 L22,54 Z" fill="#1c1917"/><circle cx="40" cy="34" r="14" fill="#e0a575"/><rect x="24" y="50" width="32" height="26" rx="5" fill="#047857"/><path d="M24,50 L48,76 L56,50 Z" fill="#881337"/></svg>`,
  },
  {
    id: 'ref_young_boy',
    title: 'Modern Youth (Ref 12)',
    badge: 'Hero',
    skinColor: '#d99763',
    hairColor: '#27272a',
    topColor: '#2563eb',
    bottomColor: '#1e293b',
    suggestedParts: {
      head: 'head_oval_soft',
      hair: 'hair_classic_fade',
      mustache: 'mustache_none',
      clothesTop: 'top_polo_shirt',
      clothesBottom: 'bot_jeans_slim',
      shoes: 'shoe_sneakers_ sporty',
    },
    previewSvg: `<svg viewBox="0 0 80 80"><rect width="80" height="80" rx="12" fill="#1e293b"/><circle cx="40" cy="35" r="15" fill="#d99763"/><path d="M24,30 Q40,14 56,30 Z" fill="#27272a"/><rect x="24" y="52" width="32" height="24" rx="5" fill="#2563eb"/></svg>`,
  },
  {
    id: 'ref_royal_maharaja',
    title: 'Royal Maharaja (Ref 9)',
    badge: 'Royal',
    skinColor: '#e0a575',
    hairColor: '#0f172a',
    topColor: '#0284c7',
    bottomColor: '#fbbf24',
    suggestedParts: {
      head: 'head_square_hero',
      hair: 'hair_pagdi_royal',
      mustache: 'must_royal_thick',
      clothesTop: 'top_sherwani_royal',
      clothesBottom: 'bot_dhoti_white',
      shoes: 'shoe_mojari_gold',
    },
    previewSvg: `<svg viewBox="0 0 80 80"><rect width="80" height="80" rx="12" fill="#1e293b"/><circle cx="40" cy="35" r="15" fill="#e0a575"/><path d="M22,26 Q40,8 58,26 Z" fill="#fbbf24"/><rect x="22" y="52" width="36" height="24" rx="5" fill="#0284c7"/></svg>`,
  },
];

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  isOpen,
  onClose,
  onSaveCharacter,
  initialCharacter,
}) => {
  // Layout mode switcher:
  // 'creator_steps' = Screenshots 10, 11, 12 (Modal with Head -> Select Clothes -> Change Cloths -> Locked Layers + Previous/Next)
  // 'character_project' = Screenshot 13 (CHARACTER PROJECT full-screen sidebar layout with CLOTHES & CHARACTER lists + Replacement skins)
  const [layoutMode, setLayoutMode] = useState<EditorLayoutMode>('creator_steps');

  // Breadcrumb navigation (Screenshots 10, 11, 12)
  const [activeBreadcrumb, setActiveBreadcrumb] = useState<BreadcrumbTab>('head');

  // Active Category
  const [activeCategory, setActiveCategory] = useState<BodyPartCategory>('head');
  const [subTab, setSubTab] = useState<'presets' | 'colors'>('presets');
  const [search, setSearch] = useState<string>('');

  // Screenshot 12: Exploded Face Parts View on dot-grid canvas
  const [explodedFaceView, setExplodedFaceView] = useState<boolean>(false);
  const [showTransformBox, setShowTransformBox] = useState<boolean>(true);
  const [activeCanvasTool, setActiveCanvasTool] = useState<'hand' | 'edit'>('edit');

  // Reference Photo Guide & Color Sampler ("freance photos jise characters edit karne ke features")
  const [showReferencePanel, setShowReferencePanel] = useState<boolean>(false);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(
    initialCharacter?.referencePhotoUrl || null
  );
  const [referenceOverlayOpacity, setReferenceOverlayOpacity] = useState<number>(
    initialCharacter?.referencePhotoOpacity ?? 0.45
  );
  const [referenceDisplayMode, setReferenceDisplayMode] = useState<'side_by_side' | 'onion_skin'>(
    'side_by_side'
  );
  const referenceInputRef = useRef<HTMLInputElement>(null);

  // Character State
  const [charName, setCharName] = useState<string>(initialCharacter?.name || 'New Character');
  const [viewAngle, setViewAngle] = useState<CharacterViewAngle>(
    initialCharacter?.viewAngle || 'front'
  );
  const [flipX, setFlipX] = useState<boolean>(Boolean(initialCharacter?.flipX));
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  const [previewZoom, setPreviewZoom] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Expressions & Visemes test controls
  const [expression, setExpression] = useState<EyeExpression>(
    initialCharacter?.eyeExpression || 'neutral'
  );
  const [viseme, setViseme] = useState<VisemeShape>(initialCharacter?.viseme || 'closed');
  const [pupilLook, setPupilLook] = useState<{ x: number; y: number }>(
    initialCharacter?.pupilLook || { x: 0, y: 0 }
  );
  const [isPlayingTurnaround, setIsPlayingTurnaround] = useState<boolean>(false);
  const [lockedCategories, setLockedCategories] = useState<Set<BodyPartCategory>>(new Set());

  // Selected Parts per category
  const [selectedParts, setSelectedParts] = useState<
    Record<
      BodyPartCategory,
      { partId: string; color: string; customSprites?: Partial<Record<CharacterViewAngle, string>> }
    >
  >(() => {
    const defaults = getDefaultPartsMap();
    if (initialCharacter?.selectedParts) {
      return { ...defaults, ...initialCharacter.selectedParts } as any;
    }
    return defaults;
  });

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [uploadSlotCategory, setUploadSlotCategory] = useState<BodyPartCategory>('clothesTop');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialCharacter) {
      setCharName(initialCharacter.name);
      setViewAngle(initialCharacter.viewAngle || 'front');
      setFlipX(Boolean(initialCharacter.flipX));
      setExpression(initialCharacter.eyeExpression || 'neutral');
      setViseme(initialCharacter.viseme || 'closed');
      setPupilLook(initialCharacter.pupilLook || { x: 0, y: 0 });
      if (initialCharacter.selectedParts) {
        setSelectedParts((prev) => ({ ...prev, ...initialCharacter.selectedParts } as any));
      }
    }
  }, [initialCharacter]);

  useEffect(() => {
    if (!isPlayingTurnaround) return;
    const angles: CharacterViewAngle[] = [
      'front',
      'three_quarter_front',
      'profile',
      'three_quarter_back',
      'back',
    ];
    let idx = angles.indexOf(viewAngle);
    const interval = setInterval(() => {
      idx = (idx + 1) % angles.length;
      setViewAngle(angles[idx]);
    }, 700);
    return () => clearInterval(interval);
  }, [isPlayingTurnaround, viewAngle]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectPart = (cat: BodyPartCategory, partId: string) => {
    if (lockedCategories.has(cat)) {
      showToast(`Layer "${cat}" is locked. Unlock it to change.`);
      return;
    }
    setSelectedParts((prev) => ({
      ...prev,
      [cat]: {
        ...prev[cat],
        partId,
      },
    }));
  };

  const handleColorChange = (cat: BodyPartCategory, newColor: string) => {
    if (lockedCategories.has(cat)) {
      showToast(`Layer "${cat}" is locked.`);
      return;
    }
    setSelectedParts((prev) => {
      const next = {
        ...prev,
        [cat]: {
          ...prev[cat],
          color: newColor,
        },
      };
      // If changing skinColor, also sync head, ears, nose, hands skin color for seamless consistency
      if (cat === 'skinColor') {
        next.head = { ...next.head, color: newColor };
        next.ears = { ...next.ears, color: newColor };
        next.nose = { ...next.nose, color: newColor };
        next.hands = { ...next.hands, color: newColor };
      }
      return next;
    });
  };

  const toggleLayerLock = (cat: BodyPartCategory) => {
    setLockedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
        showToast(`Unlocked ${cat}`);
      } else {
        next.add(cat);
        showToast(`Locked ${cat}`);
      }
      return next;
    });
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedParts((prev) => ({
          ...prev,
          [uploadSlotCategory]: {
            ...prev[uploadSlotCategory],
            customSprites: {
              ...(prev[uploadSlotCategory]?.customSprites || {}),
              [viewAngle]: result,
            },
          },
        }));
        showToast(`Custom sprite uploaded for ${uploadSlotCategory} (${viewAngle})`);
      };
      if (file.type.includes('svg')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
  };

  const handleReferencePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setReferenceImageUrl(dataUrl);
      setShowReferencePanel(true);
      showToast('Reference photo loaded! Use Auto-Match or sample colors.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyReferencePreset = (preset: ReferencePhotoPreset) => {
    setSelectedParts((prev) => {
      const next = { ...prev };
      next.skinColor = { ...next.skinColor, color: preset.skinColor };
      next.head = {
        ...next.head,
        partId: preset.suggestedParts.head || next.head.partId,
        color: preset.skinColor,
      };
      next.ears = { ...next.ears, color: preset.skinColor };
      next.nose = { ...next.nose, color: preset.skinColor };
      next.hands = { ...next.hands, color: preset.skinColor };
      next.hair = {
        ...next.hair,
        partId: preset.suggestedParts.hair || next.hair.partId,
        color: preset.hairColor,
      };
      if (preset.suggestedParts.mustache) {
        next.mustache = { ...next.mustache, partId: preset.suggestedParts.mustache };
      }
      if (preset.suggestedParts.earrings) {
        next.earrings = { ...next.earrings, partId: preset.suggestedParts.earrings };
      }
      if (preset.suggestedParts.clothesTop) {
        next.clothesTop = {
          ...next.clothesTop,
          partId: preset.suggestedParts.clothesTop,
          color: preset.topColor,
        };
      }
      if (preset.suggestedParts.clothesBottom) {
        next.clothesBottom = {
          ...next.clothesBottom,
          partId: preset.suggestedParts.clothesBottom,
          color: preset.bottomColor,
        };
      }
      if (preset.suggestedParts.shoes) {
        next.shoes = {
          ...next.shoes,
          partId: preset.suggestedParts.shoes,
        };
      }
      return next;
    });
    showToast(`Matched character features from "${preset.title}"!`);
  };

  const buildCharacterConfig = (newId?: string, newName?: string): CharacterConfig => {
    return {
      id: newId || initialCharacter?.id || `char_${Date.now()}`,
      name: newName || charName,
      skinColor: selectedParts.skinColor?.color || '#d99763',
      viewAngle,
      flipX,
      scale: initialCharacter?.scale || 1.0,
      pose: initialCharacter?.pose || {},
      bodyPartAngles: initialCharacter?.bodyPartAngles || {},
      headStyle: (selectedParts.head?.partId as any) || 'village_man',
      hairStyle: (selectedParts.hair?.partId as any) || 'classic_fade',
      facialHair: (selectedParts.mustache?.partId as any) || 'none',
      clothesStyle: (selectedParts.clothesTop?.partId as any) || 'dhoti_kurta',
      shirtColor: selectedParts.clothesTop?.color || '#10b981',
      bottomColor: selectedParts.clothesBottom?.color || '#f8fafc',
      expression: expression as any,
      eyeExpression: expression,
      viseme,
      pupilLook,
      selectedParts,
      referencePhotoUrl: referenceImageUrl || undefined,
      referencePhotoOpacity: referenceOverlayOpacity,
    };
  };

  const handleSave = () => {
    const char = buildCharacterConfig();
    onSaveCharacter(char, false);
    showToast(`Saved "${char.name}"!`);
    setTimeout(() => onClose(), 350);
  };

  const handleSaveAsNew = () => {
    const newId = `char_${Date.now()}`;
    const copyName = charName.includes('(Copy)') ? charName : `${charName} (Copy)`;
    const newChar = buildCharacterConfig(newId, copyName);
    onSaveCharacter(newChar, true);
    showToast(`Saved as new character: "${copyName}"!`);
    setTimeout(() => onClose(), 350);
  };

  const handleReset = () => {
    const defaults = getDefaultPartsMap();
    setSelectedParts(defaults as any);
    showToast('Reset character to defaults');
  };

  const handleDownload = () => {
    const char = buildCharacterConfig();
    const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${char.name.toLowerCase().replace(/\s+/g, '_')}_animate_studio.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Character JSON downloaded');
  };

  // Exact Category Lists matching Screenshot 13 ("CHARACTER PROJECT")
  const clothesCategories: { id: BodyPartCategory; label: string }[] = [
    { id: 'clothesBottom', label: 'Bottom' },
    { id: 'clothesTop', label: 'Top' },
    { id: 'shoes', label: 'Shoes' },
  ];

  const characterCategories: { id: BodyPartCategory; label: string }[] = [
    { id: 'skinColor', label: 'Skin Colors' },
    { id: 'eyes', label: 'Eyes' },
    { id: 'eyebrows', label: 'Eyebrows' },
    { id: 'head', label: 'Face' },
    { id: 'nose', label: 'Nose' },
    { id: 'ears', label: 'Ears' },
    { id: 'hair', label: 'Hair' },
    { id: 'mouth', label: 'Lips' },
    { id: 'hands', label: 'Palms' },
    { id: 'earrings', label: 'Earrings' },
    { id: 'mustache', label: 'Mustache / Beard' },
  ];

  // Breadcrumb step order (Screenshots 10, 11, 12)
  const breadcrumbOrder: BreadcrumbTab[] = [
    'head',
    'select_clothes',
    'change_clothes',
    'locked_layers',
  ];
  const currentStepIdx = breadcrumbOrder.indexOf(activeBreadcrumb);

  const handleBreadcrumbClick = (tab: BreadcrumbTab) => {
    setActiveBreadcrumb(tab);
    if (tab === 'head') {
      setActiveCategory('head');
    } else if (tab === 'select_clothes') {
      setActiveCategory('clothesTop');
    } else if (tab === 'change_clothes') {
      setActiveCategory('clothesBottom');
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      handleBreadcrumbClick(breadcrumbOrder[currentStepIdx - 1]);
    }
  };

  const handleNextStep = () => {
    if (currentStepIdx < breadcrumbOrder.length - 1) {
      handleBreadcrumbClick(breadcrumbOrder[currentStepIdx + 1]);
    } else {
      handleSave();
    }
  };

  const availableParts = getPartsByCategory(activeCategory).filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentSelection = selectedParts[activeCategory];
  const currentColor = currentSelection?.color || '#10b981';

  const activePartDef = PART_LIBRARY.find(
    (p) => p.category === activeCategory && p.id === currentSelection?.partId
  );
  const hasCustomAngleSprite = Boolean((currentSelection as any)?.customSprites?.[viewAngle]);
  const hasMissingSpriteWarning =
    !hasCustomAngleSprite &&
    activePartDef &&
    !activePartDef.sprites[
      viewAngle === 'front'
        ? 'front'
        : viewAngle === 'three_quarter_front'
        ? 'threeQuarterFront'
        : viewAngle === 'profile'
        ? 'profile'
        : viewAngle === 'three_quarter_back'
        ? 'threeQuarterBack'
        : 'back'
    ];

  const colorSwatches = [
    '#f5cba7',
    '#e0a575',
    '#d99763',
    '#c8824f',
    '#8d5524', // skin tones
    '#991b1b',
    '#dc2626',
    '#ea580c',
    '#f59e0b',
    '#fbbf24', // reds / oranges / golds
    '#047857',
    '#10b981',
    '#14b8a6',
    '#0284c7',
    '#2563eb', // greens / blues
    '#4338ca',
    '#7c3aed',
    '#db2777',
    '#881337',
    '#1c1917', // purples / pinks / dark
    '#ffffff',
    '#f8fafc',
    '#cbd5e1',
    '#475569',
    '#09090b', // neutrals
  ];

  const activeCategoryLabel =
    [...clothesCategories, ...characterCategories].find((c) => c.id === activeCategory)?.label ||
    'Face';

  // Helper to get front SVG for exploded face parts view (Screenshot 12)
  const getPartFrontSvg = (cat: BodyPartCategory) => {
    const sel = selectedParts[cat];
    const def = PART_LIBRARY.find((p) => p.category === cat && p.id === sel?.partId);
    const raw = def?.sprites.front || '';
    return raw.replace(/<svg[^>]*>|<\/svg>/gi, '');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e12] flex flex-col text-white select-none overflow-hidden font-sans">
      {/* Hidden File Inputs */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/svg+xml,image/png,image/jpeg"
        onChange={handleCustomUpload}
        className="hidden"
      />
      <input
        ref={referenceInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleReferencePhotoUpload}
        className="hidden"
      />

      {/* =====================================================================
          MODE 2: FULL-SCREEN "CHARACTER PROJECT" LAYOUT (Screenshot 13)
         ===================================================================== */}
      {layoutMode === 'character_project' ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#111216]">
          {/* Screenshot 13 Header */}
          <div className="h-14 px-6 bg-[#14151a] border-b border-[#252730] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#1d1f27] hover:bg-[#2a2d3a] flex items-center justify-center text-gray-300"
                title="Back to Studio"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-300">
                CHARACTER PROJECT
              </span>
              <span className="text-xs text-gray-500">•</span>
              <input
                type="text"
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                className="bg-[#1b1d25] px-2.5 py-1 rounded border border-[#2b2f3e] text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2.5">
              {/* Switch back to Step-by-Step Creator Modal (Screenshots 10-12) */}
              <button
                onClick={() => setLayoutMode('creator_steps')}
                className="px-3 py-1.5 rounded-lg bg-[#1e2029] hover:bg-[#282b38] border border-[#2f3342] text-xs font-semibold text-gray-200 flex items-center gap-1.5"
              >
                <Layout size={13} className="text-blue-400" />
                <span>Step-by-Step Creator View</span>
              </button>

              {/* Reference Photo Guide Toggle */}
              <button
                onClick={() => setShowReferencePanel(!showReferencePanel)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  showReferencePanel
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-[#1e2029] text-purple-300 border-purple-500/30 hover:bg-[#282b38]'
                }`}
              >
                <ImageIcon size={13} />
                <span>Reference Photo</span>
              </button>

              {/* Save as New */}
              <button
                onClick={handleSaveAsNew}
                className="px-3 py-1.5 rounded-lg bg-[#1e2029] hover:bg-[#282b38] border border-[#2f3342] text-xs font-semibold text-gray-200 flex items-center gap-1.5"
              >
                <Copy size={13} />
                <span>Duplicate</span>
              </button>

              {/* Screenshot 13 White Save Button */}
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-black text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Save size={13} />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Screenshot 13 3-Column Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Column 1: Left Vertical Sidebar (CLOTHES & CHARACTER) */}
            <div className="w-52 bg-[#131419] border-r border-[#23252f] flex flex-col overflow-y-auto p-3 gap-4">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search features"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#191b22] rounded-lg border border-[#272a35] text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              {/* CLOTHES Section */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1.5">
                  CLOTHES
                </div>
                <div className="flex flex-col gap-0.5">
                  {clothesCategories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-[#1e2538] text-white font-semibold border border-blue-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-[#1a1c23]'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {lockedCategories.has(cat.id) && <Lock size={11} className="text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-[#23252f]" />

              {/* CHARACTER Section */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1.5">
                  CHARACTER
                </div>
                <div className="flex flex-col gap-0.5">
                  {characterCategories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-all ${
                          isActive
                            ? 'bg-[#1e2538] text-white font-semibold border border-blue-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-[#1a1c23]'
                        }`}
                      >
                        {cat.id === 'skinColor' && (
                          <span
                            className="w-4 h-4 rounded-full border border-white/40 shrink-0"
                            style={{
                              backgroundColor: selectedParts.skinColor?.color || '#d99763',
                            }}
                          />
                        )}
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 2: Middle Feature Options Panel ("Face", Presets | Colors, Replacement skins) */}
            <div className="w-80 bg-[#15171e] border-r border-[#23252f] flex flex-col p-5 overflow-y-auto gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{activeCategoryLabel}</h2>
                <button
                  onClick={() => {
                    setUploadSlotCategory(activeCategory);
                    uploadInputRef.current?.click();
                  }}
                  className="px-2.5 py-1 rounded bg-[#222532] hover:bg-[#2c3040] text-[11px] font-semibold text-blue-300 flex items-center gap-1"
                >
                  <Upload size={11} /> Upload Skin
                </button>
              </div>

              {/* Presets | Colors Pill Switcher (Screenshot 13) */}
              <div className="grid grid-cols-2 p-1 bg-[#1b1d26] rounded-xl border border-[#282b38]">
                <button
                  onClick={() => setSubTab('presets')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    subTab === 'presets'
                      ? 'bg-[#2a2e3d] text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Presets
                </button>
                <button
                  onClick={() => setSubTab('colors')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    subTab === 'colors'
                      ? 'bg-[#2a2e3d] text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Palette size={12} className="text-pink-400" />
                  <span>Colors</span>
                </button>
              </div>

              {/* Replacement skins header (Screenshot 13) */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span className="font-bold text-gray-200">Replacement skins</span>
                <span className="uppercase font-mono text-[10px]">
                  {availableParts.length} OPTIONS
                </span>
              </div>

              {subTab === 'presets' ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {availableParts.map((part) => {
                    const isSelected = currentSelection?.partId === part.id;
                    const sprite = part.sprites.front;
                    return (
                      <div
                        key={part.id}
                        onClick={() => handleSelectPart(activeCategory, part.id)}
                        className={`relative aspect-square rounded-xl border cursor-pointer p-2 flex flex-col items-center justify-between transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/40'
                            : 'border-[#272a36] bg-[#191b24] hover:border-gray-500'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                        <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
                          {sprite ? (
                            <div
                              className="w-14 h-14"
                              style={{ '--part-color': currentColor } as React.CSSProperties}
                              dangerouslySetInnerHTML={{ __html: sprite }}
                            />
                          ) : (
                            <span className="text-[9px] text-gray-500">None</span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-300 truncate w-full text-center">
                          {part.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentColor.startsWith('#') ? currentColor : '#10b981'}
                      onChange={(e) => handleColorChange(activeCategory, e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={currentColor}
                      onChange={(e) => handleColorChange(activeCategory, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#191b24] border border-[#2b2f3e] rounded-lg text-xs font-mono text-white"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {colorSwatches.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(activeCategory, color)}
                        className={`w-full aspect-square rounded-lg border transition-transform hover:scale-105 ${
                          currentColor.toLowerCase() === color.toLowerCase()
                            ? 'border-white ring-2 ring-blue-500'
                            : 'border-white/15'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: Right "LIVE PREVIEW" Stage (Screenshot 13) */}
            <div className="flex-1 bg-[#111216] relative flex items-center justify-center overflow-hidden">
              <div className="absolute top-5 left-6 text-[11px] font-bold tracking-widest uppercase text-gray-400">
                LIVE PREVIEW
              </div>

              {/* Character Preview */}
              <div
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${previewZoom})`,
                }}
                className="relative flex items-center justify-center"
              >
                <CharacterRenderer5Angle
                  config={buildCharacterConfig()}
                  overrideAngle={viewAngle}
                  overrideExpression={expression}
                  overrideViseme={viseme}
                  overridePupilLook={pupilLook}
                  width={310}
                  height={460}
                  showSkeleton={showSkeleton}
                />
              </div>

              {/* Screenshot 13 Bottom-Left Vertical Zoom Controls (+ / - / Reset) */}
              <div className="absolute bottom-6 left-6 flex flex-col bg-[#1b1d25] border border-[#2b2f3e] rounded-xl overflow-hidden shadow-xl">
                <button
                  onClick={() => setPreviewZoom((z) => Math.min(2.4, z + 0.15))}
                  className="p-2.5 text-gray-300 hover:text-white hover:bg-[#252834] border-b border-[#2b2f3e]"
                  title="Zoom In"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  onClick={() => setPreviewZoom((z) => Math.max(0.4, z - 0.15))}
                  className="p-2.5 text-gray-300 hover:text-white hover:bg-[#252834] border-b border-[#2b2f3e]"
                  title="Zoom Out"
                >
                  <ZoomOut size={15} />
                </button>
                <button
                  onClick={() => {
                    setPreviewZoom(1.0);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="p-2.5 text-gray-300 hover:text-white hover:bg-[#252834]"
                  title="Reset View"
                >
                  <RotateCcw size={15} />
                </button>
              </div>

              <div className="absolute bottom-6 right-6 px-3 py-1.5 rounded-lg bg-[#1b1d25]/90 border border-[#2b2f3e] text-[11px] text-gray-400">
                Drag to pan • Pinch to zoom
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =====================================================================
           MODE 1: STEP-BY-STEP CHARACTER CREATOR MODAL (Screenshots 10, 11, 12)
           ===================================================================== */
        <>
          {/* TOP HEADER BAR (Matching Screenshots 10, 11, 12) */}
          <div className="h-14 px-6 bg-[#161820] border-b border-[#2b2f3e] flex items-center justify-between">
            {/* Left: Back Button & "Character Creator" Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-[#20232f] hover:bg-[#2b2f3e] flex items-center justify-center text-gray-300"
                title="Back"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Character Creator</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold">
                  Animate Studio
                </span>
              </div>
            </div>

            {/* Center Pill Badge + Name Input */}
            <div className="hidden md:flex items-center gap-2 bg-[#1c1f2a] px-3 py-1.5 rounded-xl border border-[#2b2f3e]">
              <span className="text-xs font-semibold text-gray-300">Character:</span>
              <input
                type="text"
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none w-36"
                placeholder="Character Name"
              />
            </div>

            {/* Right: Full-Screen Project Mode (Screenshot 13), Reference Photo, Save */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLayoutMode('character_project')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#222532] hover:bg-[#2c3040] text-gray-200 text-xs font-semibold rounded-lg border border-[#323646]"
                title="Switch to Full-Screen Character Project Layout (Screenshot 13)"
              >
                <Layout size={13} className="text-cyan-400" />
                <span>Full Project UI</span>
              </button>

              <button
                onClick={() => setShowReferencePanel(!showReferencePanel)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  showReferencePanel
                    ? 'bg-purple-600 text-white border-purple-400 shadow'
                    : 'bg-purple-950/40 text-purple-300 border-purple-500/40 hover:bg-purple-900/50'
                }`}
                title="Edit Character from Reference Photos"
              >
                <ImageIcon size={13} />
                <span>Reference Photo</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md transition-all"
              >
                <Save size={13} />
                <span>Save</span>
              </button>

              <button
                onClick={handleSaveAsNew}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-all"
              >
                <Copy size={13} />
                <span>Save as New</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222530] rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* SECOND BAR: Step Tabs (Head | Select Clothes | Change Cloths | Locked Layers) + Action Toolbar (Lock | Upload | Reset | Download | Delete | Transform) */}
          <div className="h-12 px-6 bg-[#13151d] border-b border-[#2b2f3e] flex items-center justify-between gap-4 overflow-x-auto">
            {/* Step Pill Tabs (Screenshots 10, 11, 12) */}
            <div className="flex items-center gap-1.5 bg-[#1b1e29] p-1 rounded-full border border-[#2b2f3e]">
              <button
                onClick={() => handleBreadcrumbClick('head')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeBreadcrumb === 'head'
                    ? 'bg-white text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smile size={12} />
                <span>Head</span>
              </button>

              <button
                onClick={() => handleBreadcrumbClick('select_clothes')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeBreadcrumb === 'select_clothes'
                    ? 'bg-white text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>👕 Select Clothes</span>
              </button>

              <button
                onClick={() => handleBreadcrumbClick('change_clothes')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeBreadcrumb === 'change_clothes'
                    ? 'bg-white text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>👖 Change Cloths</span>
              </button>

              <button
                onClick={() => handleBreadcrumbClick('locked_layers')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeBreadcrumb === 'locked_layers'
                    ? 'bg-white text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Lock size={11} />
                <span>Locked Layers</span>
                {lockedCategories.size > 0 && (
                  <span className="px-1.5 rounded-full bg-amber-500 text-black text-[10px]">
                    {lockedCategories.size}
                  </span>
                )}
              </button>
            </div>

            {/* Center/Right Action Bar (Lock, Upload, Reset, Download, Delete, Transform, Exploded Face Parts) */}
            <div className="flex items-center gap-1.5 bg-[#1b1e29] px-3 py-1.5 rounded-xl border border-[#2b2f3e] text-xs">
              <button
                onClick={() => toggleLayerLock(activeCategory)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  lockedCategories.has(activeCategory)
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-gray-300 hover:text-white hover:bg-[#252938]'
                }`}
              >
                {lockedCategories.has(activeCategory) ? <Lock size={12} /> : <Unlock size={12} />}
                <span>Lock</span>
              </button>

              <button
                onClick={() => {
                  setUploadSlotCategory(activeCategory);
                  uploadInputRef.current?.click();
                }}
                className="flex items-center gap-1 px-2 py-1 text-gray-300 hover:text-white hover:bg-[#252938] rounded"
              >
                <Upload size={12} />
                <span>Upload</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2 py-1 text-gray-300 hover:text-white hover:bg-[#252938] rounded"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2 py-1 text-gray-300 hover:text-white hover:bg-[#252938] rounded"
              >
                <Download size={12} />
                <span>Download</span>
              </button>

              <button
                onClick={() => {
                  setSelectedParts((prev) => ({
                    ...prev,
                    [activeCategory]: {
                      ...prev[activeCategory],
                      partId: 'none',
                    },
                  }));
                  showToast(`Cleared ${activeCategory}`);
                }}
                className="flex items-center gap-1 px-2 py-1 text-red-400 hover:bg-red-950/40 rounded"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setShowTransformBox(!showTransformBox)}
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  showTransformBox
                    ? 'bg-blue-600/20 text-blue-300'
                    : 'text-gray-300 hover:text-white hover:bg-[#252938]'
                }`}
              >
                <Move size={12} />
                <span>Transform</span>
              </button>

              <div className="w-px h-4 bg-[#2b2f3e] mx-1" />

              {/* Screenshot 12: Exploded Face Parts View Toggle */}
              <button
                onClick={() => setExplodedFaceView(!explodedFaceView)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                  explodedFaceView
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                }`}
                title="Deconstruct Face Parts on Canvas (Screenshot 12)"
              >
                <Sparkles size={12} />
                <span>Exploded Face Parts</span>
              </button>
            </div>
          </div>

          {/* MAIN WORKSPACE AREA */}
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT PANEL: 4-COLUMN PRESET GRID + BOTTOM PREVIOUS / NEXT BUTTONS (Screenshots 10, 11, 12) */}
            <div className="w-80 md:w-96 bg-[#161822] border-r border-[#2b2f3e] flex flex-col z-20">
              {/* Helper Tutorial Banner (Screenshot 11) */}
              <div className="px-3.5 py-2 bg-[#1b1e2b] border-b border-[#2b2f3e] flex items-center justify-between text-[11px]">
                <span className="text-gray-300 font-medium">Learn How to use</span>
                <button
                  onClick={() => setExplodedFaceView(!explodedFaceView)}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <span>{explodedFaceView ? 'Show Assembled Body' : 'Inspect Face Parts'}</span>
                </button>
              </div>

              {/* Category Chips Row */}
              <div className="px-3 py-2 border-b border-[#2b2f3e] bg-[#14161f] flex flex-wrap gap-1">
                {[...characterCategories, ...clothesCategories].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                      activeCategory === c.id
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-[#1c1f2b] text-gray-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Presets vs Colors Sub-tab */}
              <div className="flex border-b border-[#2b2f3e] bg-[#12141a]">
                <button
                  onClick={() => setSubTab('presets')}
                  className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all ${
                    subTab === 'presets'
                      ? 'border-blue-500 text-blue-400 bg-[#161822]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {activeCategoryLabel} ({availableParts.length})
                </button>
                <button
                  onClick={() => setSubTab('colors')}
                  className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1 ${
                    subTab === 'colors'
                      ? 'border-blue-500 text-blue-400 bg-[#161822]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Palette size={12} />
                  <span>Colors & Skin</span>
                </button>
              </div>

              {/* Locked Layers View when 'locked_layers' tab is active */}
              {activeBreadcrumb === 'locked_layers' ? (
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-300 mb-1">
                    Layer Lock Manager ({lockedCategories.size} locked)
                  </span>
                  {[...characterCategories, ...clothesCategories].map((cat) => {
                    const isLocked = lockedCategories.has(cat.id);
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#12141a] border border-[#2b2f3e]"
                      >
                        <span className="text-xs font-medium text-gray-200">{cat.label}</span>
                        <button
                          onClick={() => toggleLayerLock(cat.id)}
                          className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                            isLocked
                              ? 'bg-amber-500 text-black'
                              : 'bg-[#222532] text-gray-400 hover:text-white'
                          }`}
                        >
                          {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                          <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : subTab === 'presets' ? (
                /* 4-Column Thumbnail Grid (Screenshots 10, 11, 12) */
                <div className="flex-1 p-3 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2">
                    {availableParts.map((part) => {
                      const isSelected = currentSelection?.partId === part.id;
                      const sprite =
                        part.sprites[
                          viewAngle === 'front'
                            ? 'front'
                            : viewAngle === 'three_quarter_front'
                            ? 'threeQuarterFront'
                            : viewAngle === 'profile'
                            ? 'profile'
                            : viewAngle === 'three_quarter_back'
                            ? 'threeQuarterBack'
                            : 'back'
                        ];

                      return (
                        <div
                          key={part.id}
                          onClick={() => handleSelectPart(activeCategory, part.id)}
                          className={`relative aspect-square rounded-lg border cursor-pointer p-1.5 flex flex-col items-center justify-between transition-all group ${
                            isSelected
                              ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/50 shadow-md'
                              : 'border-[#2b2f3e] bg-[#12141a] hover:border-gray-500 hover:bg-[#1a1c24]'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow z-10">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}

                          <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
                            {sprite ? (
                              <div
                                className="w-14 h-14"
                                style={{ '--part-color': currentColor } as React.CSSProperties}
                                dangerouslySetInnerHTML={{ __html: sprite }}
                              />
                            ) : (
                              <span className="text-[9px] text-gray-500 italic">None</span>
                            )}
                          </div>

                          <span className="text-[10px] text-center font-medium text-gray-300 truncate w-full group-hover:text-white">
                            {part.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Color Swatches & Picker */
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 block mb-2">
                      Active Layer Color ({activeCategoryLabel})
                    </span>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-white/40 shadow-inner"
                        style={{ backgroundColor: currentColor }}
                      />
                      <input
                        type="color"
                        value={currentColor.startsWith('#') ? currentColor : '#10b981'}
                        onChange={(e) => handleColorChange(activeCategory, e.target.value)}
                        className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={currentColor}
                        onChange={(e) => handleColorChange(activeCategory, e.target.value)}
                        className="w-28 px-2.5 py-1 bg-[#12141a] border border-[#2b2f3e] rounded text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-400 block mb-2">
                      Studio Color Swatches
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {colorSwatches.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(activeCategory, color)}
                          className={`w-full aspect-square rounded-md border transition-transform hover:scale-105 ${
                            currentColor.toLowerCase() === color.toLowerCase()
                              ? 'border-white ring-2 ring-blue-500'
                              : 'border-white/10'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BOTTOM PREVIOUS / NEXT STEP BUTTONS (Exact match for Screenshots 10, 11, 12) */}
              <div className="p-3 border-t border-[#2b2f3e] bg-[#14161f] flex items-center gap-2.5">
                {currentStepIdx > 0 && (
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 py-2.5 rounded-lg bg-[#252836] hover:bg-[#2f3344] text-white text-xs font-bold transition-all"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition-all"
                >
                  {currentStepIdx < breadcrumbOrder.length - 1 ? 'Next' : 'Finish & Save'}
                </button>
              </div>
            </div>

            {/* CENTER DOT-GRID CANVAS (Screenshots 10, 11, 12 + Reference Photo Comparison) */}
            <div
              className="flex-1 bg-[#13151c] relative flex items-center justify-center overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(#2b2f3e 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
              onPointerDown={(e) => {
                if (e.button === 1 || activeCanvasTool === 'hand') {
                  setIsPanning(true);
                  setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
                }
              }}
              onPointerMove={(e) => {
                if (isPanning) {
                  setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
                }
              }}
              onPointerUp={() => setIsPanning(false)}
            >
              {hasMissingSpriteWarning && (
                <div className="absolute top-4 left-4 z-40 bg-amber-600/90 text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  <span>
                    No sprite for {activeCategory} at {viewAngle} angle.
                  </span>
                </div>
              )}

              {/* LEFT FLOATING VERTICAL TOOL BUTTONS (Matching Screenshots 10, 11, 12: Hand, Pencil, +, -, Smile) */}
              <div className="absolute left-5 bottom-16 z-30 flex flex-col gap-2">
                <button
                  onClick={() => setActiveCanvasTool('hand')}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all shadow-lg ${
                    activeCanvasTool === 'hand'
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-[#1e212d] text-gray-300 border-[#2f3446] hover:text-white'
                  }`}
                  title="Pan Canvas"
                >
                  <Move size={15} />
                </button>
                <button
                  onClick={() => setActiveCanvasTool('edit')}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all shadow-lg ${
                    activeCanvasTool === 'edit'
                      ? 'bg-blue-500 text-white border-blue-300'
                      : 'bg-[#1e212d] text-gray-300 border-[#2f3446] hover:text-white'
                  }`}
                  title="Transform & Edit Part"
                >
                  <Sliders size={15} />
                </button>
                <button
                  onClick={() => setPreviewZoom((z) => Math.min(2.5, z + 0.15))}
                  className="w-9 h-9 rounded-full bg-[#1e212d] hover:bg-[#282c3c] text-gray-200 border border-[#2f3446] flex items-center justify-center shadow-lg"
                  title="Zoom In"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  onClick={() => setPreviewZoom((z) => Math.max(0.4, z - 0.15))}
                  className="w-9 h-9 rounded-full bg-[#1e212d] hover:bg-[#282c3c] text-gray-200 border border-[#2f3446] flex items-center justify-center shadow-lg"
                  title="Zoom Out"
                >
                  <ZoomOut size={15} />
                </button>
                <button
                  onClick={() => setExplodedFaceView(!explodedFaceView)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all shadow-lg ${
                    explodedFaceView
                      ? 'bg-amber-500 text-black border-amber-300'
                      : 'bg-[#1e212d] text-gray-300 border-[#2f3446] hover:text-white'
                  }`}
                  title="Toggle Exploded Face Parts View (Screenshot 12)"
                >
                  <Smile size={15} />
                </button>
              </div>

              {/* SIDE-BY-SIDE REFERENCE PHOTO CARD ON CANVAS (When active) */}
              {referenceImageUrl && referenceDisplayMode === 'side_by_side' && (
                <div className="mr-8 p-3 bg-[#181b26]/95 border border-purple-500/40 rounded-2xl shadow-2xl flex flex-col items-center gap-2 z-20">
                  <div className="flex items-center justify-between w-full text-[10px] font-bold text-purple-300 uppercase">
                    <span>Reference Photo</span>
                    <button
                      onClick={() => setReferenceImageUrl(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <img
                    src={referenceImageUrl}
                    alt="Character Reference"
                    className="w-48 h-64 object-cover rounded-xl border border-white/10"
                  />
                  <span className="text-[10px] text-gray-400">
                    Click parts on right to match reference
                  </span>
                </div>
              )}

              {/* ===============================================================
                  SCREENSHOT 12: EXPLODED FACE PARTS VIEW vs ASSEMBLED VIEW
                 =============================================================== */}
              {explodedFaceView ? (
                <div
                  className="flex items-center gap-12 transition-transform duration-75"
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${previewZoom})`,
                  }}
                >
                  {/* Left Cluster: Separated Floating Facial Features (Eyebrows, Eyes, Nose, Lips, Ears) */}
                  <div className="relative w-64 h-72 flex flex-col items-center justify-center gap-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-500/30">
                      Click any facial feature to customize
                    </div>

                    {/* Floating Eyebrows */}
                    <div
                      onClick={() => setActiveCategory('eyebrows')}
                      className={`p-2 rounded-xl border cursor-pointer transition-all ${
                        activeCategory === 'eyebrows'
                          ? 'border-blue-400 bg-blue-950/30 scale-105'
                          : 'border-transparent hover:border-white/20 bg-[#1a1d28]/60'
                      }`}
                      title="Click to edit Eyebrows"
                    >
                      <svg viewBox="0 0 100 40" className="w-36 h-12 overflow-visible">
                        <g
                          transform="translate(0, -15)"
                          style={
                            {
                              '--part-color': selectedParts.eyebrows?.color || '#1c1917',
                            } as React.CSSProperties
                          }
                          dangerouslySetInnerHTML={{ __html: getPartFrontSvg('eyebrows') }}
                        />
                      </svg>
                    </div>

                    {/* Floating Eyes & Ears Row */}
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => setActiveCategory('ears')}
                        className={`p-2 rounded-xl border cursor-pointer transition-all ${
                          activeCategory === 'ears'
                            ? 'border-blue-400 bg-blue-950/30 scale-105'
                            : 'border-transparent hover:border-white/20 bg-[#1a1d28]/60'
                        }`}
                        title="Click to edit Ears"
                      >
                        <svg viewBox="0 0 100 60" className="w-16 h-12 overflow-visible">
                          <g
                            transform="translate(0, -20)"
                            style={
                              {
                                '--part-color': selectedParts.skinColor?.color || '#d99763',
                              } as React.CSSProperties
                            }
                            dangerouslySetInnerHTML={{ __html: getPartFrontSvg('ears') }}
                          />
                        </svg>
                      </div>

                      <div
                        onClick={() => setActiveCategory('eyes')}
                        className={`p-2 rounded-xl border cursor-pointer transition-all ${
                          activeCategory === 'eyes'
                            ? 'border-blue-400 bg-blue-950/30 scale-105'
                            : 'border-transparent hover:border-white/20 bg-[#1a1d28]/60'
                        }`}
                        title="Click to edit Eyes & Gaze"
                      >
                        <svg viewBox="0 0 100 55" className="w-36 h-16 overflow-visible">
                          <g
                            transform="translate(0, -22)"
                            dangerouslySetInnerHTML={{
                              __html: renderEyeSpecial(
                                'front',
                                expression,
                                pupilLook,
                                selectedParts.eyes?.color || '#3b2f2f'
                              ),
                            }}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Floating Mouth / Lips */}
                    <div
                      onClick={() => setActiveCategory('mouth')}
                      className={`p-2 rounded-xl border cursor-pointer transition-all ${
                        activeCategory === 'mouth'
                          ? 'border-blue-400 bg-blue-950/30 scale-105'
                          : 'border-transparent hover:border-white/20 bg-[#1a1d28]/60'
                      }`}
                      title="Click to edit Lips & Mouth Visemes"
                    >
                      <svg viewBox="0 0 100 50" className="w-28 h-12 overflow-visible">
                        <g
                          transform="translate(0, -45)"
                          dangerouslySetInnerHTML={{
                            __html: renderVisemeShape(
                              viseme,
                              'front',
                              selectedParts.mouth?.color || '#be123c'
                            ),
                          }}
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Right Side: Large Base Head + Hair inside 8-Handle White Bounding Box (Screenshot 12) */}
                  <div
                    onClick={() => setActiveCategory('head')}
                    className="relative p-4 cursor-pointer"
                  >
                    {showTransformBox && (
                      <div className="absolute inset-0 border-2 border-white/90 pointer-events-none">
                        <div className="absolute -top-2 -left-2 w-3.5 h-3.5 bg-white rounded-full border border-black" />
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full border border-black" />
                        <div className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-white rounded-full border border-black" />
                        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border border-black" />
                        <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border border-black" />
                        <div className="absolute -bottom-2 -left-2 w-3.5 h-3.5 bg-white rounded-full border border-black" />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full border border-black" />
                        <div className="absolute -bottom-2 -right-2 w-3.5 h-3.5 bg-white rounded-full border border-black" />
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-white" />
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border border-black" />
                      </div>
                    )}

                    <svg viewBox="0 0 120 130" className="w-60 h-64 overflow-visible drop-shadow-2xl">
                      <g
                        transform="translate(10, 15)"
                        style={
                          {
                            '--part-color': selectedParts.skinColor?.color || '#d99763',
                          } as React.CSSProperties
                        }
                        dangerouslySetInnerHTML={{ __html: getPartFrontSvg('ears') }}
                      />
                      <g
                        transform="translate(10, 15)"
                        style={
                          {
                            '--part-color': selectedParts.skinColor?.color || '#d99763',
                          } as React.CSSProperties
                        }
                        dangerouslySetInnerHTML={{ __html: getPartFrontSvg('head') }}
                      />
                      {/* Closed eyelids sockets like Screenshot 12 */}
                      <path
                        d="M42,60 Q48,54 54,60"
                        stroke="#451a03"
                        strokeWidth="2"
                        fill="none"
                      />
                      <path
                        d="M66,60 Q72,54 78,60"
                        stroke="#451a03"
                        strokeWidth="2"
                        fill="none"
                      />
                      <g
                        transform="translate(10, 15)"
                        style={
                          {
                            '--part-color': selectedParts.skinColor?.color || '#d99763',
                          } as React.CSSProperties
                        }
                        dangerouslySetInnerHTML={{ __html: getPartFrontSvg('nose') }}
                      />
                      <g
                        transform="translate(10, 15)"
                        style={
                          {
                            '--part-color': selectedParts.hair?.color || '#1c1917',
                          } as React.CSSProperties
                        }
                        dangerouslySetInnerHTML={{ __html: getPartFrontSvg('hair') }}
                      />
                    </svg>
                  </div>
                </div>
              ) : (
                /* STANDARD ASSEMBLED CHARACTER ON DOT-GRID CANVAS (Screenshots 10 & 11) */
                <div
                  className="relative transition-transform duration-75 flex items-center justify-center select-none"
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${previewZoom})`,
                  }}
                >
                  {/* Onion-Skin Reference Photo Overlay */}
                  {referenceImageUrl && referenceDisplayMode === 'onion_skin' && (
                    <img
                      src={referenceImageUrl}
                      alt="Onion Skin Reference"
                      style={{ opacity: referenceOverlayOpacity }}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20 rounded-lg"
                    />
                  )}

                  {/* White 8-Handle Bounding Box (Screenshots 10 & 11) */}
                  {showTransformBox && (
                    <div className="absolute inset-0 border-2 border-white/85 pointer-events-none rounded-sm -m-2">
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full shadow border border-black/40" />
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow border border-black/40" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full shadow border border-black/40" />
                      <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border border-black/40" />
                      <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border border-black/40" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full shadow border border-black/40" />
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow border border-black/40" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full shadow border border-black/40" />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-white/80" />
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow border border-black/50" />
                    </div>
                  )}

                  <CharacterRenderer5Angle
                    config={buildCharacterConfig()}
                    overrideAngle={viewAngle}
                    overrideExpression={expression}
                    overrideViseme={viseme}
                    overridePupilLook={pupilLook}
                    width={280}
                    height={420}
                    showSkeleton={showSkeleton}
                  />
                </div>
              )}

              {/* BOTTOM-RIGHT STACKED CONTROLS (Exact match for Screenshots 10, 11, 12: Skeleton Mode toggle, Flip toggle, Preview button) */}
              <div className="absolute bottom-5 right-5 z-30 flex flex-col gap-2 w-48">
                {/* Skeleton Mode Switch Row */}
                <div
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className="px-3.5 py-2 rounded-xl bg-[#1b1e29]/95 border border-[#2d3244] flex items-center justify-between cursor-pointer hover:border-gray-500 shadow-lg"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
                    <Bone size={13} className="text-sky-400" />
                    <span>Skeleton Mode</span>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      showSkeleton ? 'bg-sky-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        showSkeleton ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Flip Switch Row */}
                <div
                  onClick={() => setFlipX(!flipX)}
                  className="px-3.5 py-2 rounded-xl bg-[#1b1e29]/95 border border-[#2d3244] flex items-center justify-between cursor-pointer hover:border-gray-500 shadow-lg"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
                    <FlipHorizontal size={13} className="text-blue-400" />
                    <span>Flip</span>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      flipX ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        flipX ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Preview Button */}
                <button
                  onClick={() => setIsPlayingTurnaround(!isPlayingTurnaround)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg border transition-all ${
                    isPlayingTurnaround
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-[#1b1e29] hover:bg-[#252938] text-white border-[#2d3244]'
                  }`}
                >
                  {isPlayingTurnaround ? <Pause size={13} /> : <Play size={13} />}
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* RIGHT DRAWER: REFERENCE PHOTO STUDIO & FACE EXPRESSION TESTER */}
            {showReferencePanel && (
              <div className="w-80 bg-[#161822] border-l border-[#2b2f3e] p-4 flex flex-col gap-4 overflow-y-auto z-30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Wand2 size={14} /> Reference Photo Matcher
                  </span>
                  <button
                    onClick={() => setShowReferencePanel(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Upload any reference photo or select a reference character preset below to match
                  facial features, outfits, and skin tones.
                </p>

                {/* Upload Custom Reference Photo */}
                <button
                  onClick={() => referenceInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Upload size={14} />
                  <span>Upload Reference Photo</span>
                </button>

                {/* Display Mode Toggle when custom image is loaded */}
                {referenceImageUrl && (
                  <div className="p-3 rounded-xl bg-[#12141c] border border-[#2b2f3e] flex flex-col gap-2.5">
                    <span className="text-[11px] font-semibold text-gray-300">
                      Reference Guide Mode:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setReferenceDisplayMode('side_by_side')}
                        className={`py-1.5 rounded text-[11px] font-bold ${
                          referenceDisplayMode === 'side_by_side'
                            ? 'bg-purple-600 text-white'
                            : 'bg-[#1e212d] text-gray-400'
                        }`}
                      >
                        Side-by-Side
                      </button>
                      <button
                        onClick={() => setReferenceDisplayMode('onion_skin')}
                        className={`py-1.5 rounded text-[11px] font-bold ${
                          referenceDisplayMode === 'onion_skin'
                            ? 'bg-purple-600 text-white'
                            : 'bg-[#1e212d] text-gray-400'
                        }`}
                      >
                        Onion-Skin Overlay
                      </button>
                    </div>
                    {referenceDisplayMode === 'onion_skin' && (
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>Overlay Opacity</span>
                          <span>{Math.round(referenceOverlayOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="0.9"
                          step="0.05"
                          value={referenceOverlayOpacity}
                          onChange={(e) => setReferenceOverlayOpacity(parseFloat(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Built-in Reference Photo Presets (Matching User's Reference Screenshots) */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-gray-300 uppercase">
                    Instant Reference Templates
                  </span>
                  {REFERENCE_PHOTO_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-2.5 rounded-xl bg-[#12141c] border border-[#2b2f3e] hover:border-purple-500/50 flex items-center gap-3 transition-all"
                    >
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
                        dangerouslySetInnerHTML={{ __html: preset.previewSvg }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{preset.title}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/30"
                            style={{ backgroundColor: preset.skinColor }}
                            title="Skin Tone"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/30"
                            style={{ backgroundColor: preset.topColor }}
                            title="Top Color"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/30"
                            style={{ backgroundColor: preset.bottomColor }}
                            title="Bottom Color"
                          />
                          <span className="text-[9px] text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded ml-auto">
                            {preset.badge}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApplyReferencePreset(preset)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Expression & Lip-Sync Tester */}
                <div className="border-t border-[#2b2f3e] pt-3 flex flex-col gap-2.5">
                  <span className="text-[11px] font-bold text-gray-300 uppercase">
                    Live Expression & Viseme Test
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(
                      ['neutral', 'blink', 'happy', 'sad', 'angry', 'surprised', 'sleepy'] as EyeExpression[]
                    ).map((exp) => (
                      <button
                        key={exp}
                        onClick={() => setExpression(exp)}
                        className={`px-2 py-1 rounded text-[10px] font-semibold capitalize ${
                          expression === exp
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#1e2029] text-gray-400 hover:text-white'
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {(['closed', 'A', 'E', 'I', 'O', 'U', 'M'] as VisemeShape[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setViseme(v)}
                        className={`flex-1 py-1 rounded text-[10px] font-mono font-bold ${
                          viseme === v
                            ? 'bg-rose-600 text-white'
                            : 'bg-[#1e2029] text-gray-400 hover:text-white'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* BOTTOM 5-ANGLE TURNAROUND BAR */}
      <div className="h-12 bg-[#161820] border-t border-[#2b2f3e] flex items-center justify-center px-4 gap-2 z-30">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 hidden sm:inline">
          5-Angle Turnaround:
        </span>

        {[
          { id: 'front', label: 'FRONT' },
          { id: 'three_quarter_front', label: '3/4 FRONT' },
          { id: 'profile', label: 'SIDE' },
          { id: 'three_quarter_back', label: '3/4 BACK' },
          { id: 'back', label: 'BACK' },
        ].map((angleItem) => {
          const isActive = viewAngle === angleItem.id;
          return (
            <button
              key={angleItem.id}
              onClick={() => {
                setIsPlayingTurnaround(false);
                setViewAngle(angleItem.id as CharacterViewAngle);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-[#222530] text-gray-300 hover:bg-[#2b2f3e] hover:text-white'
              }`}
            >
              {angleItem.label}
            </button>
          );
        })}
      </div>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-2xl flex items-center gap-2">
          <Check size={14} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
