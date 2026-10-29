import React, { useState } from 'react';
import { StudioScene } from '../types/studio';
import { PRESET_CHARACTERS } from '../utils/characterPresets';
import { Search, X, Check, Sparkles, Film } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (scene: StudioScene) => void;
}

interface SceneTemplateItem {
  id: string;
  title: string;
  genre: string;
  tag: string;
  badge: string;
  previewColor: string;
  sceneData: Partial<StudioScene>;
}

const getPresetConfig = (index: number) =>
  PRESET_CHARACTERS[index % PRESET_CHARACTERS.length].config;

const TEMPLATES: SceneTemplateItem[] = [
  {
    id: 'village_walk',
    title: 'Sunny Village Walk & Greeting',
    genre: 'Moral',
    tag: 'Village exterior',
    badge: '☀️ Sunny Day',
    previewColor: '#0284c7',
    sceneData: {
      name: 'Sunny Village Walk',
      duration: 8.0,
      backgroundColor: '#e0f2fe',
      backgroundTemplate: 'village_exterior',
      effects: {
        timeOfDay: 'day',
        showCelestial: true,
        celestialX: 82,
        celestialY: 16,
        weather: 'none',
        weatherIntensity: 50,
        windSpeed: 20,
        ambientLightIntensity: 25,
        vignette: false,
        colorFilter: 'none',
        letterbox: false,
        showGridGuides: false,
      },
      elements: [
        {
          id: 'elem_char_ramesh',
          type: 'character',
          name: 'Ramesh (Walking)',
          x: 280,
          y: 350,
          scale: 1.05,
          rotation: 0,
          zIndex: 10,
          activeMotionClipId: 'clip_walk',
          shadow: {
            enabled: true,
            type: 'ground',
            opacity: 0.45,
            blur: 8,
            offsetX: 0,
            offsetY: 118,
            scaleX: 1,
            skewX: -15,
            color: '#000000',
          },
          characterData: { ...getPresetConfig(1), name: 'Ramesh', viewAngle: 'three_quarter_front' },
        },
        {
          id: 'elem_char_pandit',
          type: 'character',
          name: 'Sarpanch Ji (Namaste)',
          x: 650,
          y: 350,
          scale: 1.05,
          rotation: 0,
          zIndex: 11,
          activeMotionClipId: 'clip_namaste',
          shadow: {
            enabled: true,
            type: 'ground',
            opacity: 0.45,
            blur: 8,
            offsetX: 0,
            offsetY: 118,
            scaleX: 1,
            skewX: -15,
            color: '#000000',
          },
          characterData: { ...getPresetConfig(2), name: 'Sarpanch Ji', flipX: true },
        },
      ],
      audioTracks: [],
    },
  },
  {
    id: 'monsoon_rainy_village',
    title: 'Monsoon Rainy Village Story',
    genre: 'Story',
    tag: 'Seasonal',
    badge: '🌧️ Rainy FX',
    previewColor: '#0369a1',
    sceneData: {
      name: 'Monsoon Rainy Village',
      duration: 8.0,
      backgroundColor: '#334155',
      backgroundTemplate: 'village_exterior',
      effects: {
        timeOfDay: 'dusk',
        showCelestial: false,
        celestialX: 75,
        celestialY: 18,
        weather: 'rain',
        weatherIntensity: 80,
        windSpeed: 45,
        ambientLightIntensity: 40,
        vignette: true,
        colorFilter: 'cinematic_teal',
        letterbox: false,
        showGridGuides: false,
      },
      elements: [
        {
          id: 'elem_rain_farmer',
          type: 'character',
          name: 'Kisan Hariya',
          x: 360,
          y: 355,
          scale: 1.05,
          rotation: 0,
          zIndex: 10,
          activeMotionClipId: 'clip_run',
          characterData: { ...getPresetConfig(3), name: 'Kisan Hariya' },
        },
        {
          id: 'elem_rain_bride',
          type: 'character',
          name: 'Meena Didi',
          x: 620,
          y: 355,
          scale: 1.05,
          rotation: 0,
          zIndex: 11,
          activeMotionClipId: 'clip_wave',
          characterData: { ...getPresetConfig(4), name: 'Meena Didi', flipX: true },
        },
      ],
      audioTracks: [],
    },
  },
  {
    id: 'winter_foggy_chai',
    title: 'Winter Snow & Morning Chai Tapri',
    genre: 'Story',
    tag: 'Seasonal',
    badge: '❄️ Winter Snow',
    previewColor: '#0891b2',
    sceneData: {
      name: 'Winter Snow Chai Tapri',
      duration: 8.0,
      backgroundColor: '#cbd5e1',
      backgroundTemplate: 'village_exterior',
      effects: {
        timeOfDay: 'day',
        showCelestial: true,
        celestialX: 22,
        celestialY: 20,
        weather: 'snow',
        weatherIntensity: 75,
        windSpeed: 25,
        ambientLightIntensity: 30,
        vignette: false,
        colorFilter: 'none',
        letterbox: false,
        showGridGuides: false,
      },
      elements: [
        {
          id: 'elem_winter_kaka',
          type: 'character',
          name: 'Chaiwala Kaka',
          x: 340,
          y: 355,
          scale: 1.08,
          rotation: 0,
          zIndex: 10,
          activeMotionClipId: 'clip_chai_sip',
          characterData: { ...getPresetConfig(2), name: 'Chaiwala Kaka' },
        },
        {
          id: 'elem_winter_youth',
          type: 'character',
          name: 'Raju Youth',
          x: 600,
          y: 355,
          scale: 1.05,
          rotation: 0,
          zIndex: 11,
          activeMotionClipId: 'clip_talk_explain',
          characterData: { ...getPresetConfig(1), name: 'Raju Youth', flipX: true },
        },
      ],
      audioTracks: [],
    },
  },
  {
    id: 'horror_night',
    title: 'Spooky Haunted Haveli Storm',
    genre: 'Horror',
    tag: 'Horror',
    badge: '🌙 Night + Storm',
    previewColor: '#1e1b4b',
    sceneData: {
      name: 'Haunted Haveli Storm',
      duration: 8.0,
      backgroundColor: '#090d16',
      backgroundTemplate: 'village_exterior',
      effects: {
        timeOfDay: 'night',
        showCelestial: true,
        celestialX: 84,
        celestialY: 16,
        weather: 'storm',
        weatherIntensity: 85,
        windSpeed: 55,
        ambientLightIntensity: 60,
        vignette: true,
        colorFilter: 'cinematic_teal',
        letterbox: true,
        showGridGuides: false,
      },
      elements: [
        {
          id: 'elem_horror_traveler',
          type: 'character',
          name: 'Scared Traveler',
          x: 460,
          y: 360,
          scale: 1.1,
          rotation: 0,
          zIndex: 10,
          activeMotionClipId: 'clip_sad_walk',
          shadow: {
            enabled: true,
            type: 'long_cast',
            opacity: 0.65,
            blur: 10,
            offsetX: -25,
            offsetY: 115,
            scaleX: 1.2,
            skewX: -35,
            color: '#000000',
          },
          characterData: {
            ...getPresetConfig(1),
            name: 'Scared Traveler',
            eyeExpression: 'surprised',
          },
        },
      ],
      audioTracks: [],
    },
  },
  {
    id: 'royal_darbar',
    title: 'Royal Maharaja Darbar Court',
    genre: 'Fairy tales',
    tag: 'Opening scene',
    badge: '👑 Royal Palace',
    previewColor: '#b45309',
    sceneData: {
      name: 'Royal Maharaja Darbar',
      duration: 8.0,
      backgroundColor: '#451a03',
      effects: {
        timeOfDay: 'sunset',
        showCelestial: true,
        celestialX: 50,
        celestialY: 18,
        weather: 'fireflies',
        weatherIntensity: 55,
        windSpeed: 10,
        ambientLightIntensity: 30,
        vignette: true,
        colorFilter: 'warm_vintage',
        letterbox: true,
        showGridGuides: false,
      },
      elements: [
        {
          id: 'elem_maharaja',
          type: 'character',
          name: 'Maharaja Vikram',
          x: 340,
          y: 350,
          scale: 1.15,
          rotation: 0,
          zIndex: 10,
          activeMotionClipId: 'clip_talk_explain',
          characterData: { ...getPresetConfig(0), name: 'Maharaja Vikram' },
        },
        {
          id: 'elem_minister',
          type: 'character',
          name: 'Senapati (Bow)',
          x: 640,
          y: 355,
          scale: 1.08,
          rotation: 0,
          zIndex: 11,
          activeMotionClipId: 'clip_pranam_bow',
          characterData: { ...getPresetConfig(2), name: 'Senapati', flipX: true },
        },
      ],
      audioTracks: [],
    },
  },
  {
    id: 'diwali_festival_dance',
    title: 'Diwali Night Bhangra & Garba Dance',
    genre: 'Story',
    tag: 'Village',
    badge: '🎆 Night + Dance',
    previewColor: '#7c3aed',
    sceneData: {
      name: 'Diwali Night Celebration',
      duration: 8.0,
      backgroundColor: '#1e1b4b',
      backgroundTemplate: 'village_exterior',
      effects: {
        timeOfDay: 'night',
        showCelestial: true,
        celestialX: 80,
        celestialY: 15,
        weather: 'fireflies',
        weatherIntensity: 85,
        windSpeed: 15,
        ambientLightIntensity: 35,
        vignette: false,
        colorFilter: 'dreamy_glow',
        letterbox: false,
        showGridGuides: false,
      },
      elements: [
        {
          id: 'elem_dancer_1',
          type: 'character',
          name: 'Bhangra Hero',
          x: 340,
          y: 350,
          scale: 1.1,
          rotation: 0,
          zIndex: 10,
          activeMotionClipId: 'clip_bhangra_dance',
          characterData: { ...getPresetConfig(0), name: 'Bhangra Hero', eyeExpression: 'happy' },
        },
        {
          id: 'elem_dancer_2',
          type: 'character',
          name: 'Garba Queen',
          x: 620,
          y: 350,
          scale: 1.1,
          rotation: 0,
          zIndex: 11,
          activeMotionClipId: 'clip_garba_spin',
          characterData: {
            ...getPresetConfig(4),
            name: 'Garba Queen',
            eyeExpression: 'happy',
            flipX: true,
          },
        },
      ],
      audioTracks: [],
    },
  },
  {
    id: 'martial_arts_action',
    title: 'Action Hero Martial Arts Showdown',
    genre: 'Story',
    tag: 'City',
    badge: '🥋 Action Combat',
    previewColor: '#dc2626',
    sceneData: {
      name: 'Martial Arts Showdown',
      duration: 6.0,
      backgroundColor: '#1e293b',
      backgroundTemplate: 'village_exterior',
      effects: {
        timeOfDay: 'sunset',
        showCelestial: true,
        celestialX: 50,
        celestialY: 22,
        weather: 'none',
        weatherIntensity: 40,
        windSpeed: 30,
        ambientLightIntensity: 30,
        vignette: true,
        colorFilter: 'none',
        letterbox: true,
        showGridGuides: false,
      },
      elements: [
        {
          id: 'elem_fighter_1',
          type: 'character',
          name: 'Action Fighter',
          x: 350,
          y: 350,
          scale: 1.12,
          rotation: 0,
          zIndex: 10,
          activeMotionClipId: 'clip_martial_kick',
          characterData: { ...getPresetConfig(1), name: 'Action Fighter', eyeExpression: 'angry' },
        },
        {
          id: 'elem_fighter_2',
          type: 'character',
          name: 'Lathi Master',
          x: 610,
          y: 350,
          scale: 1.12,
          rotation: 0,
          zIndex: 11,
          activeMotionClipId: 'clip_sword_strike',
          characterData: {
            ...getPresetConfig(3),
            name: 'Lathi Master',
            eyeExpression: 'angry',
            flipX: true,
          },
        },
      ],
      audioTracks: [],
    },
  },
  {
    id: 'wedding_petals',
    title: 'Royal Wedding Flower Petals Shower',
    genre: 'Fairy tales',
    tag: 'Seasonal',
    badge: '🌸 Flower Petals',
    previewColor: '#db2777',
    sceneData: {
      name: 'Royal Wedding Celebration',
      duration: 8.0,
      backgroundColor: '#881337',
      effects: {
        timeOfDay: 'sunset',
        showCelestial: true,
        celestialX: 78,
        celestialY: 16,
        weather: 'petals',
        weatherIntensity: 80,
        windSpeed: 20,
        ambientLightIntensity: 25,
        vignette: false,
        colorFilter: 'dreamy_glow',
        letterbox: false,
        showGridGuides: false,
      },
      elements: [
        {
          id: 'elem_groom',
          type: 'character',
          name: 'Dulha Raja',
          x: 370,
          y: 355,
          scale: 1.1,
          rotation: 0,
          zIndex: 10,
          activeMotionClipId: 'clip_namaste',
          characterData: { ...getPresetConfig(0), name: 'Dulha Raja', eyeExpression: 'happy' },
        },
        {
          id: 'elem_bride',
          type: 'character',
          name: 'Dulhan Rani',
          x: 590,
          y: 355,
          scale: 1.08,
          rotation: 0,
          zIndex: 11,
          activeMotionClipId: 'clip_namaste',
          characterData: {
            ...getPresetConfig(4),
            name: 'Dulhan Rani',
            eyeExpression: 'happy',
            flipX: true,
          },
        },
      ],
      audioTracks: [],
    },
  },
  {
    id: 'farmer_golden_harvest',
    title: 'Golden Sunset Kisan Harvest',
    genre: 'Moral',
    tag: 'Village exterior',
    badge: '🌅 Golden Sunset',
    previewColor: '#d97706',
    sceneData: {
      name: 'Golden Sunset Harvest',
      duration: 7.0,
      backgroundColor: '#fef3c7',
      backgroundTemplate: 'village_exterior',
      effects: {
        timeOfDay: 'sunset',
        showCelestial: true,
        celestialX: 80,
        celestialY: 22,
        weather: 'none',
        weatherIntensity: 40,
        windSpeed: 15,
        ambientLightIntensity: 35,
        vignette: false,
        colorFilter: 'warm_vintage',
        letterbox: false,
        showGridGuides: false,
      },
      elements: [
        {
          id: 'elem_kisan_joy',
          type: 'character',
          name: 'Kisan Ramu',
          x: 480,
          y: 355,
          scale: 1.15,
          rotation: 0,
          zIndex: 10,
          activeMotionClipId: 'clip_victory_jump',
          characterData: { ...getPresetConfig(3), name: 'Kisan Ramu', eyeExpression: 'happy' },
        },
      ],
      audioTracks: [],
    },
  },
  {
    id: 'kids_school_moral',
    title: 'Kids Moral Story & Meditation',
    genre: 'Kids',
    tag: 'Moral',
    badge: '🧘 Kids & Guru',
    previewColor: '#059669',
    sceneData: {
      name: 'Gurukul Moral Lesson',
      duration: 7.0,
      backgroundColor: '#ecfccb',
      backgroundTemplate: 'village_exterior',
      effects: {
        timeOfDay: 'day',
        showCelestial: true,
        celestialX: 18,
        celestialY: 16,
        weather: 'petals',
        weatherIntensity: 45,
        windSpeed: 15,
        ambientLightIntensity: 20,
        vignette: false,
        colorFilter: 'none',
        letterbox: false,
        showGridGuides: false,
      },
      elements: [
        {
          id: 'elem_guru',
          type: 'character',
          name: 'Guru Ji',
          x: 480,
          y: 355,
          scale: 1.1,
          rotation: 0,
          zIndex: 10,
          activeMotionClipId: 'clip_meditate_float',
          characterData: { ...getPresetConfig(2), name: 'Guru Ji', eyeExpression: 'happy' },
        },
      ],
      audioTracks: [],
    },
  },
  {
    id: 'blank',
    title: 'Blank Custom Scene',
    genre: 'All Templates',
    tag: 'Intro',
    badge: '✨ Blank Stage',
    previewColor: '#1e293b',
    sceneData: {
      name: 'Blank Canvas Scene',
      duration: 6.0,
      backgroundColor: '#f8fafc',
      elements: [],
      audioTracks: [],
    },
  },
];

const GENRES = [
  'All Templates',
  'Moral',
  'Story',
  'Horror',
  'Fairy tales',
  'Kids',
  'Explainer',
];
const TAGS = [
  'Village',
  'Village exterior',
  'Seasonal',
  'Horror',
  'Moral',
  'City',
  'Opening scene',
  'Intro',
];

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All Templates');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('village_walk');

  if (!isOpen) return null;

  const filtered = TEMPLATES.filter((tpl) => {
    if (selectedGenre !== 'All Templates' && tpl.genre !== selectedGenre) return false;
    if (selectedTag && tpl.tag !== selectedTag) return false;
    if (searchQuery && !tpl.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleApply = () => {
    const template = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];
    const newScene: StudioScene = {
      id: `scene_${Date.now()}`,
      name: template.title,
      duration: template.sceneData.duration || 8.0,
      backgroundColor: template.sceneData.backgroundColor || '#f8fafc',
      backgroundTemplate: template.sceneData.backgroundTemplate,
      effects: template.sceneData.effects,
      elements: template.sceneData.elements || [],
      audioTracks: template.sceneData.audioTracks || [],
      cameraKeyframes: [
        {
          id: `cam_${Date.now()}`,
          time: 0,
          frame: 0,
          x: 0,
          y: 0,
          zoom: 1.0,
          rotation: 0,
          easing: 'ease-out',
        },
      ],
    };
    onApplyTemplate(newScene);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="w-full max-w-5xl bg-[#1a1c23] border border-[#2b2f3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2f3e]">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Film size={18} className="text-blue-500" />
              <span>Animate Studio — Video Scene Templates ({TEMPLATES.length} Ready Scenes)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Pre-built scenes with rigged 5-angle characters, Day/Night/Rain/Winter effects, and motions
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT: GENRES LIST */}
          <div className="w-full md:w-52 border-r border-[#2b2f3e] bg-[#14161c] p-4 overflow-y-auto">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              VIDEO GENRES
            </div>
            <div className="flex flex-col gap-1">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all ${
                    selectedGenre === genre
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-400 hover:text-white hover:bg-[#1a1c23]'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: SEARCH, TAGS & TEMPLATE GRID */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search Video Templates (e.g. Monsoon Rain, Winter Snow, Royal, Diwali, Action...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#131418] border border-[#2b2f3e] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-2.5 py-1 text-[11px] rounded-full border transition-all ${
                    selectedTag === tag
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
              {filtered.map((item) => {
                const isSelected = selectedTemplateId === item.id;
                const charCount = item.sceneData.elements?.length || 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTemplateId(item.id)}
                    onDoubleClick={() => {
                      setSelectedTemplateId(item.id);
                      handleApply();
                    }}
                    className={`group relative rounded-xl border p-2.5 cursor-pointer transition-all flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/25 ring-2 ring-blue-500/50'
                        : 'border-[#2b2f3e] bg-[#14161c] hover:border-gray-500'
                    }`}
                  >
                    <div
                      className="aspect-video w-full rounded-lg relative overflow-hidden flex items-center justify-center border border-gray-800"
                      style={{ backgroundColor: item.previewColor }}
                    >
                      <div className="absolute inset-0 p-2.5 flex flex-col justify-between text-white">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-black/50 backdrop-blur px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                          {charCount > 0 && (
                            <span className="text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded">
                              {charCount} Char
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold drop-shadow-md leading-snug">
                          {item.title}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-200 group-hover:text-blue-400 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {item.sceneData.duration}s
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3.5 bg-[#14161c] border-t border-[#2b2f3e] flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            <span>Double-click any template or click Apply Scene to load it into Animate Studio</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/30 transition-all"
            >
              Apply Video Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
