import React, { useState, useRef } from 'react';
import { SceneElement, AssetAngle, MultiAngleViews } from '../types/studio';
import { getMultiAngleAssetView } from '../utils/characterAssemblyLogic';
import {
  Search,
  X,
  Plus,
  Upload,
  Image,
  Sparkles,
  Compass,
  Layers,
  ArrowRight,
  RefreshCw,
  FolderPlus,
  Check,
} from 'lucide-react';

interface AssetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddElementToCanvas: (elem: SceneElement) => void;
}

export interface AssetCatalogItem {
  id: string;
  name: string;
  category: 'Backgrounds' | 'Props' | 'FX';
  tag: string;
  icon?: string;
  color?: string;
  bgGradient?: string;
  bgImageUrl?: string;
  multiAngleViews?: Partial<MultiAngleViews>;
}

export const ASSET_CATALOG: AssetCatalogItem[] = [
  // Backgrounds
  {
    id: 'bg_village_street',
    name: 'Indian Village Street & Trees',
    category: 'Backgrounds',
    tag: 'Village',
    bgGradient: 'linear-gradient(to bottom, #7dd3fc, #bae6fd 60%, #86efac 60%, #15803d)',
  },
  {
    id: 'bg_kirana',
    name: 'Kirana Grocery Store Front',
    category: 'Backgrounds',
    tag: 'Shop',
    bgGradient: 'linear-gradient(to bottom, #fed7aa, #ffedd5 50%, #d97706 50%, #78350f)',
  },
  {
    id: 'bg_lush_farm',
    name: 'Green Crop Farm & Hills',
    category: 'Backgrounds',
    tag: 'Farm',
    bgGradient: 'linear-gradient(to bottom, #93c5fd, #dbeafe 50%, #4ade80 50%, #166534)',
  },
  {
    id: 'bg_spooky_haveli',
    name: 'Dark Midnight Moonlight Haveli',
    category: 'Backgrounds',
    tag: 'Horror',
    bgGradient: 'linear-gradient(to bottom, #0f172a, #1e1b4b 60%, #020617)',
  },
  {
    id: 'bg_classroom',
    name: 'School / Moral Story Classroom',
    category: 'Backgrounds',
    tag: 'Moral',
    bgGradient: 'linear-gradient(to bottom, #f1f5f9, #e2e8f0 70%, #94a3b8)',
  },

  // Props with 4-way Multi-Angle Turnarounds
  {
    id: 'prop_tractor',
    name: 'Farm Tractor',
    category: 'Props',
    tag: 'Farm',
    icon: '🚜',
    color: '#dc2626',
    multiAngleViews: {
      front: '🚜',
      right: '🚜',
      left: '🚜',
      back: '🚜💨',
    },
  },
  {
    id: 'prop_bicycle',
    name: 'Village Hero Bicycle',
    category: 'Props',
    tag: 'Village',
    icon: '🚲',
    color: '#2563eb',
    multiAngleViews: {
      front: '🚲',
      right: '🚲',
      left: '🚲',
      back: '🚲',
    },
  },
  {
    id: 'prop_chaistall',
    name: 'Chai Tapri Kettle & Glasses',
    category: 'Props',
    tag: 'Shop',
    icon: '🫖',
    color: '#b45309',
    multiAngleViews: {
      front: '🫖',
      right: '🫖',
      left: '🫖',
      back: '☕',
    },
  },
  {
    id: 'prop_banyan_tree',
    name: 'Sacred Banyan Tree',
    category: 'Props',
    tag: 'Nature',
    icon: '🌳',
    color: '#15803d',
    multiAngleViews: {
      front: '🌳',
      right: '🌳',
      left: '🌳',
      back: '🌲',
    },
  },
  {
    id: 'prop_cart',
    name: 'Wooden Bullock Cart',
    category: 'Props',
    tag: 'Village',
    icon: '🛒',
    color: '#78350f',
    multiAngleViews: {
      front: '🛒',
      right: '🛒',
      left: '🛒',
      back: '📦',
    },
  },
  {
    id: 'prop_charpai',
    name: 'Village Khatia / Charpai Bed',
    category: 'Props',
    tag: 'Home',
    icon: '🛏️',
    color: '#92400e',
    multiAngleViews: {
      front: '🛏️',
      right: '🛏️',
      left: '🛏️',
      back: '🛋️',
    },
  },
  {
    id: 'prop_well',
    name: 'Village Water Well',
    category: 'Props',
    tag: 'Village',
    icon: '🪣',
    color: '#0284c7',
    multiAngleViews: {
      front: '🪣',
      right: '🪣',
      left: '🪣',
      back: '🪵',
    },
  },
  {
    id: 'prop_cooking_pot',
    name: 'Clay Matka & Cooking Handi',
    category: 'Props',
    tag: 'Kitchen',
    icon: '🏺',
    color: '#ea580c',
    multiAngleViews: {
      front: '🏺',
      right: '🏺',
      left: '🏺',
      back: '🍲',
    },
  },
  {
    id: 'prop_cow',
    name: 'Grazing Cow Animal',
    category: 'Props',
    tag: 'Animal',
    icon: '🐄',
    color: '#475569',
    multiAngleViews: {
      front: '🐮',
      right: '🐄',
      left: '🐄',
      back: '🐃',
    },
  },
  {
    id: 'prop_goat',
    name: 'Farm Goat',
    category: 'Props',
    tag: 'Animal',
    icon: '🐐',
    color: '#64748b',
    multiAngleViews: {
      front: '🐐',
      right: '🐐',
      left: '🐐',
      back: '🐑',
    },
  },
  {
    id: 'prop_haveli',
    name: 'Royal Heritage Haveli Gate',
    category: 'Props',
    tag: 'Village',
    icon: '🏛️',
    color: '#eab308',
    multiAngleViews: {
      front: '🏛️',
      right: '🏰',
      left: '🏰',
      back: '🧱',
    },
  },

  // FX
  { id: 'fx_sun', name: 'Golden Morning Sun', category: 'FX', tag: 'Nature', icon: '☀️', color: '#f59e0b' },
  { id: 'fx_clouds', name: 'Cartoon Drifting Clouds', category: 'FX', tag: 'Atmosphere', icon: '☁️', color: '#93c5fd' },
  { id: 'fx_leaves', name: 'Falling Wind Leaves', category: 'FX', tag: 'Nature', icon: '🍂', color: '#d97706' },
];

export const AssetLibraryModal: React.FC<AssetLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddElementToCanvas,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Props' | 'Backgrounds' | 'FX' | 'MultiAngleCreator'>('Props');
  const [search, setSearch] = useState<string>('');
  const [activeAnglePreview, setActiveAnglePreview] = useState<AssetAngle>('front');

  // Multi-Angle Custom Creator State
  const [customAssetName, setCustomAssetName] = useState<string>('Custom Prop');
  const [customViews, setCustomViews] = useState<{
    front: string;
    right: string;
    left: string;
    back: string;
  }>({
    front: '',
    right: '',
    left: '',
    back: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiAngleInputRef = useRef<HTMLInputElement>(null);
  const [uploadSlot, setUploadSlot] = useState<AssetAngle>('front');

  if (!isOpen) return null;

  const filtered = ASSET_CATALOG.filter((a) => {
    if (a.category !== selectedCategory) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddProp = (asset: AssetCatalogItem) => {
    if (asset.category === 'Backgrounds') {
      const elem: SceneElement = {
        id: `elem_bg_${Date.now()}`,
        type: 'background',
        name: asset.name,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        zIndex: 0,
        bgGradient: asset.bgGradient,
      };
      onAddElementToCanvas(elem);
    } else {
      const elem: SceneElement = {
        id: `elem_prop_${Date.now()}`,
        type: 'prop',
        name: asset.name,
        x: 350 + Math.random() * 80,
        y: 350 + Math.random() * 40,
        scale: 1.0,
        rotation: 0,
        zIndex: 5,
        propIcon: asset.icon,
        propColor: asset.color,
        assetAngle: activeAnglePreview,
        multiAngleViews: asset.multiAngleViews,
      };
      onAddElementToCanvas(elem);
    }
    onClose();
  };

  const handleUploadSingleAsset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const elem: SceneElement = {
        id: `elem_custom_${Date.now()}`,
        type: selectedCategory === 'Backgrounds' ? 'background' : 'prop',
        name: file.name.replace(/\.[^/.]+$/, ''),
        x: 300,
        y: 300,
        scale: 1.0,
        rotation: 0,
        zIndex: 6,
        bgImageUrl: url,
        assetAngle: activeAnglePreview,
        multiAngleViews: {
          front: url,
          right: url,
          left: url,
          back: url,
        },
      };
      onAddElementToCanvas(elem);
      onClose();
    }
  };

  const handleSlotFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomViews((prev) => ({
        ...prev,
        [uploadSlot]: url,
      }));
    }
  };

  const handleAddCustomMultiAngleProp = () => {
    const elem: SceneElement = {
      id: `elem_multi_${Date.now()}`,
      type: 'prop',
      name: customAssetName || 'Custom 4-Way Prop',
      x: 350,
      y: 350,
      scale: 1.0,
      rotation: 0,
      zIndex: 6,
      assetAngle: activeAnglePreview,
      bgImageUrl: customViews[activeAnglePreview] || customViews.front,
      multiAngleViews: {
        front: customViews.front || '📦',
        right: customViews.right || customViews.front || '📦',
        left: customViews.left || customViews.front || '📦',
        back: customViews.back || customViews.front || '📦',
      },
    };
    onAddElementToCanvas(elem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#1a1c23] border border-[#2b2f3e] rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2f3e]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-white">Asset & Prop Multi-Angle Library</h2>
              <p className="text-[11px] text-gray-400">
                Front (0°), Right (90°), Left (-90°), and Back (180°) views with custom asset import
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Categories Bar & Search */}
        <div className="p-4 border-b border-[#2b2f3e] flex flex-wrap items-center justify-between gap-3 bg-[#14161c]">
          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'Props', label: 'Props (4-Way Angles)' },
                { id: 'Backgrounds', label: 'Backgrounds' },
                { id: 'FX', label: 'VFX / Atmosphere' },
                { id: 'MultiAngleCreator', label: '4-Way Asset Creator' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1c23]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {selectedCategory !== 'MultiAngleCreator' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#131418] border border-[#2b2f3e] rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,image/svg+xml"
                onChange={handleUploadSingleAsset}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#222530] hover:bg-[#2b2f3e] text-white rounded-lg text-xs border border-[#2b2f3e]"
                title="Upload image or SVG"
              >
                <Upload size={13} /> Upload File
              </button>
            </div>
          )}
        </div>

        {/* Prop Angle Toolbar when browsing Props */}
        {selectedCategory === 'Props' && (
          <div className="px-6 py-2.5 bg-[#171922] border-b border-[#2b2f3e] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Compass size={15} className="text-amber-400" />
              <span className="font-semibold">Turnaround Angle:</span>
              <span className="text-[11px] text-gray-400">
                (Preview and add prop in chosen perspective)
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[#101216] p-1 rounded-xl border border-[#2b2f3e]">
              {(
                [
                  { id: 'front', label: 'Front (0°)' },
                  { id: 'right', label: 'Right (90°)' },
                  { id: 'left', label: 'Left (-90°)' },
                  { id: 'back', label: 'Back (180°)' },
                ] as const
              ).map((ang) => (
                <button
                  key={ang.id}
                  onClick={() => setActiveAnglePreview(ang.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeAnglePreview === ang.id
                      ? 'bg-amber-500 text-black font-bold shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {ang.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        {selectedCategory === 'MultiAngleCreator' ? (
          /* Multi-Angle Custom Prop Creator Mode */
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5">
            <div className="p-4 bg-[#14161c] rounded-xl border border-[#2b2f3e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderPlus size={16} className="text-amber-400" /> Custom 4-Way Angle Asset Creator
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Import different angles (Front, Right, Left, Back) for your custom prop or vehicle.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Asset Name (e.g. Haveli Door)"
                  value={customAssetName}
                  onChange={(e) => setCustomAssetName(e.target.value)}
                  className="px-3 py-1.5 bg-[#101216] border border-[#2b2f3e] rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleAddCustomMultiAngleProp}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus size={14} /> Add to Canvas
                </button>
              </div>
            </div>

            <input
              ref={multiAngleInputRef}
              type="file"
              accept="image/*,image/svg+xml"
              onChange={handleSlotFileUpload}
              className="hidden"
            />

            {/* 4 Angle Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {(
                [
                  { id: 'front' as AssetAngle, label: 'Front View (0°)', desc: 'Facing forward' },
                  { id: 'right' as AssetAngle, label: 'Right Side (90°)', desc: 'Facing right profile' },
                  { id: 'left' as AssetAngle, label: 'Left Side (-90°)', desc: 'Facing left profile' },
                  { id: 'back' as AssetAngle, label: 'Back View (180°)', desc: 'Facing away / rear' },
                ] as const
              ).map((slot) => {
                const img = customViews[slot.id];
                return (
                  <div
                    key={slot.id}
                    className="p-4 bg-[#14161c] border border-[#2b2f3e] rounded-xl flex flex-col justify-between items-center text-center group hover:border-amber-500 transition-all"
                  >
                    <div className="w-full flex justify-between items-center text-xs mb-2">
                      <span className="font-bold text-white">{slot.label}</span>
                      {img && <Check size={14} className="text-emerald-400" />}
                    </div>

                    <div className="w-full aspect-square bg-[#0f1014] rounded-lg border border-dashed border-[#2b2f3e] flex items-center justify-center overflow-hidden relative">
                      {img ? (
                        img.startsWith('data:image') || img.startsWith('blob:') ? (
                          <img
                            src={img}
                            alt={slot.label}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <span className="text-4xl">{img}</span>
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-500">
                          <Image size={24} />
                          <span className="text-[10px] text-gray-400">{slot.desc}</span>
                        </div>
                      )}
                    </div>

                    <div className="w-full mt-3 flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          setUploadSlot(slot.id);
                          multiAngleInputRef.current?.click();
                        }}
                        className="w-full py-1.5 bg-[#222530] hover:bg-[#2b2f3e] text-white rounded-lg text-xs font-medium border border-[#2b2f3e] flex items-center justify-center gap-1"
                      >
                        <Upload size={12} /> Upload {slot.id}
                      </button>

                      <input
                        type="text"
                        placeholder="Or emoji/symbol"
                        value={img}
                        onChange={(e) =>
                          setCustomViews((prev) => ({
                            ...prev,
                            [slot.id]: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 bg-[#101216] border border-[#2b2f3e] rounded text-[11px] text-center text-gray-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Standard Catalog Grid */
          <div className="flex-1 p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {filtered.map((item) => {
              const multiView = item.multiAngleViews
                ? getMultiAngleAssetView(item.multiAngleViews, activeAnglePreview, item.icon || '📦')
                : { content: item.icon || '📦', isSvg: false };

              const shouldFlipHorizontal =
                item.category === 'Props' &&
                activeAnglePreview === 'left' &&
                !item.multiAngleViews?.left;

              return (
                <div
                  key={item.id}
                  onClick={() => handleAddProp(item)}
                  className="p-3 bg-[#14161c] border border-[#2b2f3e] hover:border-amber-500 rounded-xl cursor-pointer group flex flex-col justify-between transition-all"
                >
                  <div
                    className="aspect-square w-full rounded-lg mb-2 flex items-center justify-center text-4xl shadow-inner border border-gray-800/60 relative overflow-hidden"
                    style={{
                      background: item.bgGradient || '#1a1c23',
                    }}
                  >
                    {item.multiAngleViews && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 rounded text-[9px] font-mono text-amber-300 border border-amber-500/30">
                        {activeAnglePreview.toUpperCase()}
                      </span>
                    )}

                    <div
                      className={`transition-transform duration-200 ${
                        shouldFlipHorizontal ? 'scale-x-[-1]' : ''
                      }`}
                    >
                      {multiView.content}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-amber-400 truncate">
                      {item.name}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-gray-400 uppercase">{item.tag}</span>
                      {item.multiAngleViews && (
                        <span className="text-[9px] text-amber-400/80">4-Way</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
