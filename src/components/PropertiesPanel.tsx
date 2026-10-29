import React, { useState } from 'react';
import {
  SceneElement,
  CharacterConfig,
  CharacterViewAngle,
  EyeExpression,
  VisemeShape,
  StudioScene,
  SceneEffectsConfig,
  ShadowConfig,
  TimeOfDayType,
  WeatherEffectType,
  CameraShakeType,
} from '../types/studio';
import {
  POSE_PRESETS,
  MOTION_CLIPS_PRESETS,
  DEFAULT_LIMB_ANGLES,
} from '../utils/riggingLogic';
import {
  Compass,
  Eye,
  Smile,
  FlipHorizontal,
  Copy,
  Trash2,
  Key,
  Move,
  User,
  Sparkles,
  Activity,
  Bone,
  Sun,
  CloudRain,
  Video,
  Layers,
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedElement: SceneElement | null;
  currentScene: StudioScene;
  currentTime: number;
  onUpdateElement: (elemId: string, updates: Partial<SceneElement>) => void;
  onUpdateCharacterData: (elemId: string, charUpdates: Partial<CharacterConfig>) => void;
  onUpdateSceneEffects?: (updates: Partial<SceneEffectsConfig>) => void;
  onUpdateCameraAtCurrentTime?: (updates: {
    x?: number;
    y?: number;
    zoom?: number;
    rotation?: number;
    shake?: CameraShakeType;
    dofBlur?: number;
  }) => void;
  onApplyPoseAtCurrentTime?: (
    elemId: string,
    poseId: string,
    limbAngles: Record<string, number>
  ) => void;
  onDuplicateElement: (elemId: string) => void;
  onDeleteElement: (elemId: string) => void;
  onOpenCharacterCreator: (char?: CharacterConfig) => void;
  onAddKeyframe: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  currentScene,
  currentTime,
  onUpdateElement,
  onUpdateCharacterData,
  onUpdateSceneEffects,
  onUpdateCameraAtCurrentTime,
  onApplyPoseAtCurrentTime,
  onDuplicateElement,
  onDeleteElement,
  onOpenCharacterCreator,
  onAddKeyframe,
}) => {
  const [motionFilter, setMotionFilter] = useState<'all' | 'basic' | 'advanced'>('all');

  const effects: SceneEffectsConfig = currentScene.effects || {
    timeOfDay: 'day',
    showCelestial: true,
    celestialX: 82,
    celestialY: 16,
    weather: 'none',
    weatherIntensity: 65,
    windSpeed: 30,
    ambientLightIntensity: 25,
    vignette: false,
    colorFilter: 'none',
    letterbox: false,
    showGridGuides: false,
  };

  // ===========================================================================
  // SCENE ENVIRONMENT, WEATHER EFFECTS & CAMERA INSPECTOR (When no element selected)
  // ===========================================================================
  if (!selectedElement) {
    return (
      <div className="w-80 bg-[#14161f] border-l border-[#2b2f3e] p-3.5 flex flex-col gap-3.5 text-xs text-gray-300 select-none overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" /> Scene Effects & Camera
          </span>
          <span className="text-[10px] font-mono text-gray-400">{currentScene.duration}s</span>
        </div>

        {/* 1. TIME OF DAY & SUN / MOON */}
        <div className="p-3 bg-[#181a24] rounded-xl border border-[#2b2f3e] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sun size={14} className="text-amber-400" /> Day / Night & Sun / Moon
            </span>
            <label className="flex items-center gap-1 text-[10px] text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={effects.showCelestial}
                onChange={(e) => onUpdateSceneEffects?.({ showCelestial: e.target.checked })}
                className="accent-amber-500"
              />
              <span>Show Sun/Moon</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'day', label: '☀️ Sunny Day' },
                { id: 'sunset', label: '🌅 Golden Sunset' },
                { id: 'night', label: '🌙 Starry Night' },
                { id: 'dusk', label: '🌆 Purple Dusk' },
              ] as { id: TimeOfDayType; label: string }[]
            ).map((tod) => (
              <button
                key={tod.id}
                onClick={() => onUpdateSceneEffects?.({ timeOfDay: tod.id, showCelestial: true })}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                  effects.timeOfDay === tod.id
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-[#202330] text-gray-300 hover:text-white'
                }`}
              >
                {tod.label}
              </button>
            ))}
          </div>

          {effects.showCelestial && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Sky Pos X</span>
                  <span>{effects.celestialX}%</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="92"
                  value={effects.celestialX}
                  onChange={(e) =>
                    onUpdateSceneEffects?.({ celestialX: parseInt(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Sky Height Y</span>
                  <span>{effects.celestialY}%</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="55"
                  value={effects.celestialY}
                  onChange={(e) =>
                    onUpdateSceneEffects?.({ celestialY: parseInt(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. WEATHER PARTICLES (RAINY, STORM, WINTER SNOW, FOG, FIREFLIES, PETALS) */}
        <div className="p-3 bg-[#181a24] rounded-xl border border-[#2b2f3e] flex flex-col gap-2.5">
          <span className="font-bold text-white flex items-center gap-1.5">
            <CloudRain size={14} className="text-sky-400" /> Weather & Atmosphere
          </span>

          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'none', label: '✨ Clear Sky' },
                { id: 'rain', label: '🌧️ Monsoon Rain' },
                { id: 'storm', label: '⛈️ Thunderstorm' },
                { id: 'snow', label: '❄️ Winter Snow' },
                { id: 'fog', label: '🌫️ Winter Fog' },
                { id: 'fireflies', label: '✨ Night Fireflies' },
                { id: 'petals', label: '🌸 Flower Petals' },
              ] as { id: WeatherEffectType; label: string }[]
            ).map((w) => (
              <button
                key={w.id}
                onClick={() => onUpdateSceneEffects?.({ weather: w.id })}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-left truncate ${
                  effects.weather === w.id
                    ? 'bg-sky-600 text-white shadow'
                    : 'bg-[#202330] text-gray-300 hover:text-white'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {effects.weather !== 'none' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Intensity</span>
                  <span>{effects.weatherIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  value={effects.weatherIntensity}
                  onChange={(e) =>
                    onUpdateSceneEffects?.({ weatherIntensity: parseInt(e.target.value) })
                  }
                  className="w-full accent-sky-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Wind Drift</span>
                  <span>{effects.windSpeed}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effects.windSpeed}
                  onChange={(e) =>
                    onUpdateSceneEffects?.({ windSpeed: parseInt(e.target.value) })
                  }
                  className="w-full accent-sky-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. ADVANCED CAMERA ANGLES, SHAKE & CINEMA LENS */}
        <div className="p-3 bg-[#181a24] rounded-xl border border-[#2b2f3e] flex flex-col gap-2.5">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Video size={14} className="text-cyan-400" /> Advanced Camera & Lens
          </span>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Wide Shot (1.0x)', x: 0, y: 0, zoom: 1.0, rot: 0 },
              { label: 'Medium Shot (1.35x)', x: 0, y: -20, zoom: 1.35, rot: 0 },
              { label: 'Close-Up (1.85x)', x: 0, y: -55, zoom: 1.85, rot: 0 },
              { label: 'Extreme Close (2.3x)', x: 0, y: -75, zoom: 2.3, rot: 0 },
              { label: 'Dutch Angle (-10°)', x: 0, y: -15, zoom: 1.3, rot: -10 },
              { label: 'Hero Low Tilt (+8°)', x: 0, y: 20, zoom: 1.25, rot: 8 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() =>
                  onUpdateCameraAtCurrentTime?.({
                    x: preset.x,
                    y: preset.y,
                    zoom: preset.zoom,
                    rotation: preset.rot,
                  })
                }
                className="py-1.5 px-2 rounded-lg bg-[#202330] hover:bg-cyan-600 hover:text-white text-gray-300 text-[10px] font-bold transition-all text-left truncate"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div>
            <span className="text-[10px] text-gray-400 block mb-1">Camera Shake Effect:</span>
            <div className="grid grid-cols-4 gap-1">
              {(['none', 'subtle', 'impact', 'earthquake'] as CameraShakeType[]).map((sh) => (
                <button
                  key={sh}
                  onClick={() => onUpdateCameraAtCurrentTime?.({ shake: sh })}
                  className="py-1 rounded bg-[#202330] hover:bg-cyan-600/40 text-[10px] font-semibold capitalize text-gray-300"
                >
                  {sh}
                </button>
              ))}
            </div>
          </div>

          {/* Cinema Letterbox & Vignette */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
              <input
                type="checkbox"
                checked={effects.letterbox}
                onChange={(e) => onUpdateSceneEffects?.({ letterbox: e.target.checked })}
                className="accent-cyan-500"
              />
              <span>2.35:1 Cinema Bars</span>
            </label>
            <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
              <input
                type="checkbox"
                checked={effects.vignette}
                onChange={(e) => onUpdateSceneEffects?.({ vignette: e.target.checked })}
                className="accent-cyan-500"
              />
              <span>Dark Vignette</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // CHARACTER / ELEMENT INSPECTOR (When a character or prop is selected)
  // ===========================================================================
  const char = selectedElement.characterData;
  const currentAngle: CharacterViewAngle = char?.viewAngle || 'front';
  const currentExpr: EyeExpression = char?.eyeExpression || 'neutral';
  const currentViseme: VisemeShape = char?.viseme || 'closed';
  const currentPupil = char?.pupilLook || { x: 0, y: 0 };
  const currentLimbAngles: Record<string, number> = {
    ...DEFAULT_LIMB_ANGLES,
    ...(char?.bodyPartAngles || {}),
  };

  const shadowCfg: ShadowConfig = selectedElement.shadow || {
    enabled: true,
    type: 'ground',
    opacity: 0.45,
    blur: 8,
    offsetX: 0,
    offsetY: 118,
    scaleX: 1.0,
    skewX: -18,
    color: '#000000',
  };

  const updateShadow = (updates: Partial<ShadowConfig>) => {
    onUpdateElement(selectedElement.id, {
      shadow: { ...shadowCfg, ...updates },
    });
  };

  const handleLimbSliderChange = (limbKey: string, angleVal: number) => {
    const nextAngles = { ...currentLimbAngles, [limbKey]: angleVal };
    onUpdateCharacterData(selectedElement.id, { bodyPartAngles: nextAngles });
    if (onApplyPoseAtCurrentTime) {
      onApplyPoseAtCurrentTime(selectedElement.id, 'custom', nextAngles);
    }
  };

  const filteredMotions = MOTION_CLIPS_PRESETS.filter((clip) => {
    if (motionFilter === 'all') return true;
    if (motionFilter === 'basic') {
      return clip.category === 'locomotion' || clip.category === 'gesture' || clip.category === 'daily';
    }
    return clip.category === 'combat' || clip.category === 'dance' || clip.category === 'emotional';
  });

  return (
    <div className="w-80 bg-[#14161f] border-l border-[#2b2f3e] p-3.5 flex flex-col gap-3.5 text-xs text-gray-300 select-none overflow-y-auto">
      {/* Header with Title & Edit Character Button */}
      <div className="p-3 bg-[#181a24] rounded-xl border border-[#2b2f3e] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-sm truncate">{selectedElement.name}</span>
          <span className="text-[10px] font-mono uppercase bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
            {selectedElement.type}
          </span>
        </div>

        {char && (
          <button
            onClick={() => onOpenCharacterCreator(char)}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
          >
            <User size={13} /> Customize Character & Reference Photo
          </button>
        )}
      </div>

      {/* 1. BASIC TO ADVANCED MOTION LIBRARY ("character ke basic se advance motions add karo") */}
      {char && (
        <div className="p-3 bg-[#181a24] rounded-xl border border-[#2b2f3e] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-400" /> Character Motion Loop
            </span>
            <div className="flex gap-1 text-[10px]">
              {(['all', 'basic', 'advanced'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMotionFilter(tab)}
                  className={`px-1.5 py-0.5 rounded capitalize font-bold ${
                    motionFilter === tab
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#202330] text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 auto-rows-max gap-1.5 max-h-44 overflow-y-auto pr-1">
            <button
              onClick={() => onUpdateElement(selectedElement.id, { activeMotionClipId: undefined })}
              className={`py-2 px-2.5 rounded-lg text-[11px] font-bold text-left truncate border ${
                !selectedElement.activeMotionClipId
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                  : 'bg-[#202330] text-gray-400 border-transparent hover:text-white'
              }`}
            >
              ⏹️ Static / Pose Only
            </button>
            {filteredMotions.map((clip) => {
              const isActive = selectedElement.activeMotionClipId === clip.id;
              return (
                <button
                  key={clip.id}
                  onClick={() =>
                    onUpdateElement(selectedElement.id, {
                      activeMotionClipId: clip.id,
                      motionSpeed: selectedElement.motionSpeed || 1.0,
                    })
                  }
                  className={`py-2 px-2.5 rounded-lg text-[11px] font-bold text-left truncate border transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-300 shadow'
                      : 'bg-[#202330] text-gray-300 border-transparent hover:bg-[#282c3e]'
                  }`}
                  title={clip.description}
                >
                  🎬 {clip.title}
                </button>
              );
            })}
          </div>

          {selectedElement.activeMotionClipId && (
            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>Motion Speed</span>
                <span className="font-mono text-emerald-400">
                  {(selectedElement.motionSpeed || 1).toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={selectedElement.motionSpeed || 1.0}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, { motionSpeed: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-500"
              />
            </div>
          )}
        </div>
      )}

      {/* 2. TIMELINE POSE & JOINT EDITOR ("character ko time line pe poses edits karne ka option do") */}
      {char && (
        <div className="p-3 bg-[#181a24] rounded-xl border border-[#2b2f3e] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Bone size={14} className="text-purple-400" /> Timeline Pose Editor
            </span>
            <span className="text-[10px] font-mono text-purple-300">
              @{currentTime.toFixed(1)}s
            </span>
          </div>

          {/* Instant Pose Presets */}
          <div className="grid grid-cols-2 auto-rows-max gap-1.5 max-h-36 overflow-y-auto pr-1">
            {Object.values(POSE_PRESETS).map((pose) => (
              <button
                key={pose.id}
                onClick={() => {
                  const angles = { ...DEFAULT_LIMB_ANGLES, ...(pose.limbAngles || {}) };
                  onUpdateCharacterData(selectedElement.id, { bodyPartAngles: angles });
                  onApplyPoseAtCurrentTime?.(selectedElement.id, pose.id, angles);
                }}
                className="py-1.5 px-2 rounded-lg bg-[#202330] hover:bg-purple-600 hover:text-white text-[11px] font-semibold text-gray-300 truncate transition-colors text-left"
                title={`Apply ${pose.name} pose at ${currentTime.toFixed(1)}s`}
              >
                🦴 {pose.name.replace(/\s*\(.*?\)/g, '')}
              </button>
            ))}
          </div>

          {/* Individual Joint / Limb Sliders */}
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 pt-1 border-t border-[#252836]">
            {[
              { key: 'headTilt', label: 'Head Tilt', min: -35, max: 35 },
              { key: 'torsoLean', label: 'Torso Lean', min: -35, max: 35 },
              { key: 'leftArm', label: 'Left Arm', min: -130, max: 90 },
              { key: 'rightArm', label: 'Right Arm', min: -130, max: 90 },
              { key: 'leftLeg', label: 'Left Leg', min: -75, max: 75 },
              { key: 'rightLeg', label: 'Right Leg', min: -75, max: 75 },
            ].map((joint) => (
              <div key={joint.key}>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{joint.label}</span>
                  <span className="font-mono text-purple-300">
                    {Math.round(currentLimbAngles[joint.key] || 0)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={joint.min}
                  max={joint.max}
                  value={currentLimbAngles[joint.key] || 0}
                  onChange={(e) => handleLimbSliderChange(joint.key, parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SHADOW CONTROLS ("animation karte time shadow add karne ka bhi option do") */}
      <div className="p-3 bg-[#181a24] rounded-xl border border-[#2b2f3e] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Layers size={14} className="text-indigo-400" /> Character Shadow
          </span>
          <label className="flex items-center gap-1 text-[10px] cursor-pointer">
            <input
              type="checkbox"
              checked={shadowCfg.enabled}
              onChange={(e) => updateShadow({ enabled: e.target.checked })}
              className="accent-indigo-500"
            />
            <span>Enable</span>
          </label>
        </div>

        {shadowCfg.enabled && (
          <>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: 'ground', label: 'Ground' },
                  { id: 'long_cast', label: 'Cast' },
                  { id: 'drop', label: 'Drop' },
                  { id: 'glow', label: 'Glow' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  onClick={() => updateShadow({ type: st.id })}
                  className={`py-1 rounded text-[10px] font-bold ${
                    shadowCfg.type === st.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#202330] text-gray-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Opacity</span>
                  <span>{Math.round(shadowCfg.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={shadowCfg.opacity}
                  onChange={(e) => updateShadow({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Soft Blur</span>
                  <span>{shadowCfg.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={shadowCfg.blur}
                  onChange={(e) => updateShadow({ blur: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Cast Angle / Skew</span>
                  <span>{shadowCfg.skewX || 0}°</span>
                </div>
                <input
                  type="range"
                  min="-55"
                  max="55"
                  value={shadowCfg.skewX || 0}
                  onChange={(e) => updateShadow({ skewX: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
              <input
                type="color"
                value={shadowCfg.color || '#000000'}
                onChange={(e) => updateShadow({ color: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 mt-2"
                title="Shadow / Glow Color"
              />
            </div>
          </>
        )}
      </div>

      {/* 4. 5-ANGLE TURNAROUND PERSPECTIVE */}
      {char && (
        <div className="flex flex-col gap-2 p-3 bg-[#181a24] rounded-xl border border-[#2b2f3e]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Compass size={14} className="text-amber-400" /> View Angle (5-Angle)
            </span>
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
              {currentAngle}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'front' as CharacterViewAngle, label: 'FRONT (0°)' },
                { id: 'three_quarter_front' as CharacterViewAngle, label: '3/4 FRONT' },
                { id: 'profile' as CharacterViewAngle, label: 'SIDE (90°)' },
                { id: 'three_quarter_back' as CharacterViewAngle, label: '3/4 BACK' },
                { id: 'back' as CharacterViewAngle, label: 'BACK (180°)' },
              ] as const
            ).map((ang) => (
              <button
                key={ang.id}
                onClick={() => onUpdateCharacterData(selectedElement.id, { viewAngle: ang.id })}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
                  currentAngle === ang.id
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#202330] text-gray-300 hover:text-white'
                }`}
              >
                {ang.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. TRANSFORM PROPERTIES */}
      <div className="p-3 bg-[#181a24] rounded-xl border border-[#2b2f3e] flex flex-col gap-2.5">
        <span className="font-bold text-white flex items-center gap-1.5">
          <Move size={14} className="text-blue-400" /> Transform
        </span>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 uppercase">Pos X</label>
            <input
              type="number"
              value={selectedElement.x}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })
              }
              className="w-full px-2 py-1 bg-[#101218] border border-[#2b2f3e] rounded text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 uppercase">Pos Y</label>
            <input
              type="number"
              value={selectedElement.y}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })
              }
              className="w-full px-2 py-1 bg-[#101218] border border-[#2b2f3e] rounded text-xs text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Scale</span>
              <span className="font-mono">{selectedElement.scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.05"
              value={selectedElement.scale}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, { scale: parseFloat(e.target.value) })
              }
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Rotation</span>
              <span className="font-mono">{selectedElement.rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={selectedElement.rotation}
              onChange={(e) =>
                onUpdateElement(selectedElement.id, { rotation: parseInt(e.target.value) })
              }
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        {char && (
          <button
            onClick={() => onUpdateCharacterData(selectedElement.id, { flipX: !char.flipX })}
            className={`w-full py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              char.flipX ? 'bg-blue-600 text-white' : 'bg-[#202330] text-gray-300 hover:text-white'
            }`}
          >
            <FlipHorizontal size={13} /> Flip Horizontal
          </button>
        )}
      </div>

      {/* 6. EYE EXPRESSION & MOUTH VISEME LIP-SYNC */}
      {char && (
        <div className="p-3 bg-[#181a24] rounded-xl border border-[#2b2f3e] flex flex-col gap-2.5">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Eye size={14} className="text-cyan-400" /> Expression & Lip-Sync Viseme
          </span>

          <div className="grid grid-cols-4 gap-1">
            {(
              ['neutral', 'blink', 'happy', 'sad', 'angry', 'surprised', 'sleepy'] as EyeExpression[]
            ).map((exp) => (
              <button
                key={exp}
                onClick={() => onUpdateCharacterData(selectedElement.id, { eyeExpression: exp })}
                className={`py-1 rounded text-[10px] font-semibold capitalize transition-all ${
                  currentExpr === exp
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-[#202330] text-gray-400 hover:text-white'
                }`}
              >
                {exp}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 pt-1">
            {(['closed', 'A', 'E', 'I', 'O', 'U', 'M'] as VisemeShape[]).map((v) => (
              <button
                key={v}
                onClick={() => onUpdateCharacterData(selectedElement.id, { viseme: v })}
                className={`py-1 rounded text-[10px] font-bold transition-all ${
                  currentViseme === v
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-[#202330] text-gray-400 hover:text-white'
                }`}
              >
                {v === 'closed' ? '•' : v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KEYFRAME & LAYER ACTIONS */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onAddKeyframe}
          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow"
        >
          <Key size={13} /> + Keyframe (K)
        </button>
        <button
          onClick={() => onDuplicateElement(selectedElement.id)}
          className="p-1.5 bg-[#202330] hover:bg-[#2b2f3e] text-gray-300 rounded-lg"
          title="Duplicate Layer"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => onDeleteElement(selectedElement.id)}
          className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg"
          title="Delete Layer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
