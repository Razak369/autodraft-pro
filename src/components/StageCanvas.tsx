import React, { useState, useMemo } from 'react';
import {
  StudioScene,
  CameraKeyframe,
  CharacterKeyframe,
  SceneEffectsConfig,
} from '../types/studio';
import { CharacterRenderer5Angle } from './CharacterRenderer5Angle';
import {
  interpolateCharacterKeyframes,
  interpolateCameraKeyframes,
  calculateCameraViewRect,
} from '../utils/timelineInterpolation';
import { sampleMotionClipLimbAngles, DEFAULT_LIMB_ANGLES } from '../utils/riggingLogic';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  MousePointer,
  Video,
  RotateCw,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  Sparkles,
  Grid,
  Film,
} from 'lucide-react';

interface StageCanvasProps {
  scene: StudioScene;
  currentTime: number;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElementPosition: (id: string, x: number, y: number) => void;
  onUpdateCameraPosition?: (x: number, y: number, zoom: number, rotation?: number) => void;
  onUpdateSceneEffects?: (updates: Partial<SceneEffectsConfig>) => void;
  isAutoKeyframeActive: boolean;
  onAutoKeyframeTrigger?: (elemId: string, updates: Partial<CharacterKeyframe>) => void;
}

export const StageCanvas: React.FC<StageCanvasProps> = ({
  scene,
  currentTime,
  selectedElementId,
  onSelectElement,
  onUpdateElementPosition,
  onUpdateCameraPosition,
  onUpdateSceneEffects,
  isAutoKeyframeActive,
  onAutoKeyframeTrigger,
}) => {
  const [stageZoom, setStageZoom] = useState<number>(0.92);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<'select' | 'hand'>('select');
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [previewThroughCamera, setPreviewThroughCamera] = useState<boolean>(false);

  const [isDraggingElement, setIsDraggingElement] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedElemId, setDraggedElemId] = useState<string | null>(null);

  const STAGE_WIDTH = 960;
  const STAGE_HEIGHT = 540;

  const effects: SceneEffectsConfig = scene.effects || {
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

  // Active Camera state from keyframes
  const activeCamera: CameraKeyframe = interpolateCameraKeyframes(
    scene.cameraKeyframes,
    currentTime
  );
  const cameraFrame = calculateCameraViewRect(activeCamera, STAGE_WIDTH, STAGE_HEIGHT);

  // Compute deterministic camera shake offset at currentTime
  const shakeOffset = useMemo(() => {
    const shakeType = activeCamera.shake || 'none';
    if (shakeType === 'none') return { x: 0, y: 0 };
    const amp =
      shakeType === 'subtle' ? 2.5 : shakeType === 'impact' ? 7 : shakeType === 'earthquake' ? 14 : 0;
    return {
      x: Math.sin(currentTime * 37) * amp,
      y: Math.cos(currentTime * 43) * amp,
    };
  }, [activeCamera.shake, currentTime]);

  // Deterministic particle positions so weather looks smooth and responsive to currentTime
  const weatherParticles = useMemo(() => {
    const count = Math.max(12, Math.round((effects.weatherIntensity / 100) * 65));
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      seedX: (i * 73) % 100,
      seedY: (i * 41) % 100,
      size: 3 + (i % 5) * 1.5,
      speed: 0.7 + (i % 4) * 0.25,
    }));
  }, [effects.weatherIntensity]);

  const handleFitToScreen = () => {
    setStageZoom(0.92);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleStagePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || activeTool === 'hand' || (e as any).spaceKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  };

  const handleStagePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    if (isDraggingElement && draggedElemId) {
      const stageRect = document.getElementById('white-stage-16-9')?.getBoundingClientRect();
      if (!stageRect) return;

      const rawX = (e.clientX - stageRect.left) / stageZoom;
      const rawY = (e.clientY - stageRect.top) / stageZoom;

      const newX = Math.round(rawX - dragOffset.x);
      const newY = Math.round(rawY - dragOffset.y);

      onUpdateElementPosition(draggedElemId, newX, newY);

      if (isAutoKeyframeActive && onAutoKeyframeTrigger) {
        onAutoKeyframeTrigger(draggedElemId, { x: newX, y: newY });
      }
    }
  };

  const handleStagePointerUp = () => {
    setIsPanning(false);
    setIsDraggingElement(false);
    setDraggedElemId(null);
  };

  // CSS Filter for scene color grading + Depth of Field
  const getSceneFilterStyle = (): string => {
    const filters: string[] = [];
    if (effects.colorFilter === 'warm_vintage') {
      filters.push('sepia(0.28) saturate(1.25) contrast(1.05)');
    } else if (effects.colorFilter === 'cinematic_teal') {
      filters.push('contrast(1.12) saturate(1.18) hue-rotate(-6deg)');
    } else if (effects.colorFilter === 'noir_bw') {
      filters.push('grayscale(1) contrast(1.25)');
    } else if (effects.colorFilter === 'dreamy_glow') {
      filters.push('saturate(1.3) brightness(1.06)');
    }
    if (activeCamera.dofBlur && activeCamera.dofBlur > 0) {
      filters.push(`drop-shadow(0 0 ${activeCamera.dofBlur}px rgba(255,255,255,0.15))`);
    }
    return filters.join(' ');
  };

  return (
    <div
      onPointerDown={handleStagePointerDown}
      onPointerMove={handleStagePointerMove}
      onPointerUp={handleStagePointerUp}
      className={`flex-1 bg-[#0b0c10] overflow-hidden relative flex items-center justify-center select-none ${
        activeTool === 'hand' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        backgroundImage: 'radial-gradient(#272a38 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* TOP-LEFT FLOATING CANVAS NAVIGATION + ENVIRONMENT QUICK BAR */}
      <div className="absolute top-3 left-3 z-40 flex flex-wrap items-center gap-1.5 bg-[#161822]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#2b2f3e] shadow-xl">
        <button
          onClick={() => setActiveTool('select')}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
            activeTool === 'select' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
          title="Selection Tool (V)"
        >
          <MousePointer size={14} />
        </button>
        <button
          onClick={() => setActiveTool('hand')}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
            activeTool === 'hand' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
          title="Hand Pan Tool (H)"
        >
          <Hand size={14} />
        </button>

        <div className="w-px h-4 bg-[#2b2f3e]" />

        <button
          onClick={() => setStageZoom((z) => Math.max(0.3, z - 0.1))}
          className="p-1.5 text-gray-400 hover:text-white rounded"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="text-[11px] font-mono px-1 text-gray-300">
          {Math.round(stageZoom * 100)}%
        </span>
        <button
          onClick={() => setStageZoom((z) => Math.min(2.5, z + 0.1))}
          className="p-1.5 text-gray-400 hover:text-white rounded"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={handleFitToScreen}
          className="px-2 py-1 text-gray-300 hover:text-white rounded text-[11px] font-semibold flex items-center gap-1 bg-[#202330]"
          title="Fit Stage to Screen"
        >
          <Maximize2 size={12} /> Fit
        </button>

        {/* Quick Environment Toggles (Day / Sunset / Night / Rain / Winter) right on stage */}
        {onUpdateSceneEffects && (
          <>
            <div className="w-px h-4 bg-[#2b2f3e]" />
            <button
              onClick={() =>
                onUpdateSceneEffects({
                  timeOfDay:
                    effects.timeOfDay === 'day'
                      ? 'sunset'
                      : effects.timeOfDay === 'sunset'
                      ? 'night'
                      : 'day',
                  showCelestial: true,
                })
              }
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                effects.timeOfDay === 'night'
                  ? 'bg-indigo-600 text-white'
                  : effects.timeOfDay === 'sunset'
                  ? 'bg-orange-600 text-white'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
              title="Cycle Day (Sun) / Sunset / Night (Moon & Stars)"
            >
              {effects.timeOfDay === 'night' ? <Moon size={12} /> : <Sun size={12} />}
              <span className="capitalize">{effects.timeOfDay}</span>
            </button>

            <button
              onClick={() =>
                onUpdateSceneEffects({
                  weather: effects.weather === 'rain' ? 'storm' : effects.weather === 'storm' ? 'none' : 'rain',
                })
              }
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                effects.weather === 'rain' || effects.weather === 'storm'
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-[#202330] text-gray-300 hover:text-white'
              }`}
              title="Toggle Rainy / Monsoon Storm Effect"
            >
              <CloudRain size={12} />
              <span>{effects.weather === 'storm' ? 'Storm' : 'Rain'}</span>
            </button>

            <button
              onClick={() =>
                onUpdateSceneEffects({
                  weather: effects.weather === 'snow' ? 'fog' : effects.weather === 'fog' ? 'none' : 'snow',
                })
              }
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                effects.weather === 'snow' || effects.weather === 'fog'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-[#202330] text-gray-300 hover:text-white'
              }`}
              title="Toggle Winter Snow / Morning Fog Effect"
            >
              <Snowflake size={12} />
              <span>{effects.weather === 'fog' ? 'Winter Fog' : 'Winter'}</span>
            </button>

            <button
              onClick={() =>
                onUpdateSceneEffects({
                  weather:
                    effects.weather === 'fireflies'
                      ? 'petals'
                      : effects.weather === 'petals'
                      ? 'none'
                      : 'fireflies',
                })
              }
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                effects.weather === 'fireflies' || effects.weather === 'petals'
                  ? 'bg-pink-600 text-white shadow'
                  : 'bg-[#202330] text-gray-300 hover:text-white'
              }`}
              title="Toggle Fireflies / Falling Flower Petals"
            >
              <Sparkles size={12} />
              <span>{effects.weather === 'petals' ? 'Petals' : 'FX'}</span>
            </button>
          </>
        )}
      </div>

      {/* TOP-RIGHT ADVANCED CAMERA ANGLE & VIEWFINDER BAR */}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-1.5 bg-[#161822]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#2b2f3e] text-xs shadow-xl">
        <Video size={14} className="text-cyan-400 ml-1" />
        <span className="font-mono text-[11px] text-cyan-300 font-bold mr-1">
          {activeCamera.zoom.toFixed(2)}x
        </span>

        {onUpdateCameraPosition && (
          <div className="flex items-center gap-1">
            {[
              { label: 'Wide', x: 0, y: 0, zoom: 1.0, rot: 0 },
              { label: 'Medium', x: 0, y: -20, zoom: 1.35, rot: 0 },
              { label: 'Close-Up', x: 0, y: -55, zoom: 1.85, rot: 0 },
              { label: 'Dutch Tilt', x: 0, y: -15, zoom: 1.25, rot: -8 },
            ].map((shot) => (
              <button
                key={shot.label}
                onClick={() => onUpdateCameraPosition(shot.x, shot.y, shot.zoom, shot.rot)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  Math.abs(activeCamera.zoom - shot.zoom) < 0.08 &&
                  Math.abs((activeCamera.rotation || 0) - shot.rot) < 2
                    ? 'bg-cyan-500 text-black shadow'
                    : 'bg-[#202330] text-gray-300 hover:text-white'
                }`}
                title={`Apply ${shot.label} Camera Angle`}
              >
                {shot.label}
              </button>
            ))}
          </div>
        )}

        <div className="w-px h-4 bg-[#2b2f3e]" />

        <button
          onClick={() => setPreviewThroughCamera(!previewThroughCamera)}
          className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
            previewThroughCamera
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-[#202330] text-gray-300 hover:text-white'
          }`}
          title="Toggle Live Camera Lens View"
        >
          <Film size={11} />
          <span>{previewThroughCamera ? 'Lens View' : 'Stage View'}</span>
        </button>

        {onUpdateSceneEffects && (
          <button
            onClick={() => onUpdateSceneEffects({ showGridGuides: !effects.showGridGuides })}
            className={`p-1 rounded ${
              effects.showGridGuides ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Toggle Rule of Thirds Camera Grid"
          >
            <Grid size={13} />
          </button>
        )}
      </div>

      {/* THE STAGE CONTAINER */}
      <div
        style={{
          transform: `translate(${panOffset.x + shakeOffset.x}px, ${panOffset.y + shakeOffset.y}px) scale(${stageZoom})`,
          transformOrigin: 'center center',
          transition: isPanning || isDraggingElement ? 'none' : 'transform 0.1s ease-out',
        }}
        className="relative shadow-[0_0_50px_rgba(0,0,0,0.85)] border border-gray-700/80 rounded overflow-hidden"
      >
        {/* 16:9 STAGE CANVAS */}
        <div
          id="white-stage-16-9"
          style={{
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            backgroundColor: scene.backgroundColor || '#ffffff',
            filter: getSceneFilterStyle(),
            transform: previewThroughCamera
              ? `scale(${activeCamera.zoom}) translate(${-activeCamera.x}px, ${-activeCamera.y}px) rotate(${-(
                  activeCamera.rotation || 0
                )}deg)`
              : undefined,
            transformOrigin: 'center center',
          }}
          className="relative overflow-hidden transition-transform duration-150"
        >
          {/* 1. BACKGROUND SCENERY TEMPLATES */}
          {scene.backgroundTemplate === 'village_exterior' && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className={`h-3/5 transition-colors duration-500 ${
                  effects.timeOfDay === 'night'
                    ? 'bg-gradient-to-b from-[#090d16] via-[#111827] to-[#1e1b4b]'
                    : effects.timeOfDay === 'sunset'
                    ? 'bg-gradient-to-b from-[#7c2d12] via-[#ea580c] to-[#fde047]'
                    : effects.timeOfDay === 'dusk'
                    ? 'bg-gradient-to-b from-[#1e1b4b] via-[#6d28d9] to-[#f472b6]'
                    : 'bg-gradient-to-b from-[#38bdf8] via-[#7dd3fc] to-[#bae6fd]'
                }`}
              />
              <div
                className={`h-1/5 relative overflow-hidden ${
                  effects.timeOfDay === 'night'
                    ? 'bg-[#064e3b]'
                    : effects.weather === 'snow'
                    ? 'bg-[#e2e8f0]'
                    : 'bg-[#86efac]'
                }`}
              >
                <div className="absolute -top-10 left-10 w-48 h-32 rounded-full bg-[#4ade80]/30" />
                <div className="absolute -top-14 right-20 w-64 h-36 rounded-full bg-[#22c55e]/25" />
              </div>
              <div
                className={`h-1/5 border-t-2 ${
                  effects.weather === 'snow'
                    ? 'bg-gradient-to-b from-[#f1f5f9] to-[#cbd5e1] border-[#94a3b8]'
                    : effects.timeOfDay === 'night'
                    ? 'bg-gradient-to-b from-[#422006] to-[#1c1917] border-[#065f46]'
                    : 'bg-gradient-to-b from-[#eab308]/60 to-[#ca8a04]/80 border-[#16a34a]'
                }`}
              />
            </div>
          )}

          {/* TIME OF DAY SKY OVERLAY FOR NON-VILLAGE BACKGROUNDS */}
          {scene.backgroundTemplate !== 'village_exterior' && effects.timeOfDay !== 'day' && (
            <div
              className="absolute inset-0 pointer-events-none z-0 transition-colors duration-500"
              style={{
                background:
                  effects.timeOfDay === 'night'
                    ? 'linear-gradient(180deg, rgba(10, 15, 35, 0.82) 0%, rgba(17, 24, 39, 0.65) 100%)'
                    : effects.timeOfDay === 'sunset'
                    ? 'linear-gradient(180deg, rgba(154, 52, 18, 0.55) 0%, rgba(251, 146, 60, 0.35) 60%, rgba(254, 215, 170, 0.2) 100%)'
                    : 'linear-gradient(180deg, rgba(49, 46, 129, 0.65) 0%, rgba(157, 23, 77, 0.35) 100%)',
              }}
            />
          )}

          {/* 2. CELESTIAL BODIES: SUN (DAY/SUNSET) OR MOON & STARS (NIGHT/DUSK) */}
          {effects.showCelestial && (
            <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden">
              {/* Twinkling Stars at Night / Dusk */}
              {(effects.timeOfDay === 'night' || effects.timeOfDay === 'dusk') &&
                Array.from({ length: 28 }).map((_, idx) => {
                  const sx = (idx * 37 + 11) % 95;
                  const sy = (idx * 19 + 5) % 48;
                  const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(currentTime * 2.5 + idx));
                  return (
                    <div
                      key={`star-${idx}`}
                      className="absolute rounded-full bg-white"
                      style={{
                        left: `${sx}%`,
                        top: `${sy}%`,
                        width: idx % 3 === 0 ? 3.5 : 2,
                        height: idx % 3 === 0 ? 3.5 : 2,
                        opacity: twinkle,
                        boxShadow: '0 0 6px #ffffff',
                      }}
                    />
                  );
                })}

              {/* SUN OR MOON */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{
                  left: `${effects.celestialX}%`,
                  top: `${effects.celestialY}%`,
                }}
              >
                {effects.timeOfDay === 'night' || effects.timeOfDay === 'dusk' ? (
                  /* Glowing Full / Crescent Moon with Craters */
                  <div className="relative w-20 h-20 rounded-full bg-[#fef9c3] shadow-[0_0_45px_15px_rgba(254,240,138,0.45)] flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[#fde047]/40 absolute top-4 left-5" />
                    <div className="w-6 h-6 rounded-full bg-[#fde047]/30 absolute bottom-4 right-5" />
                    <div className="w-3 h-3 rounded-full bg-[#fde047]/35 absolute top-10 left-4" />
                  </div>
                ) : (
                  /* Radiant Sun with Animated Halo Rays */
                  <div
                    className={`relative w-22 h-22 rounded-full flex items-center justify-center ${
                      effects.timeOfDay === 'sunset'
                        ? 'bg-gradient-to-b from-[#fef08a] to-[#f97316] shadow-[0_0_60px_22px_rgba(249,115,22,0.65)]'
                        : 'bg-gradient-to-b from-[#ffffff] to-[#fde047] shadow-[0_0_55px_20px_rgba(250,204,21,0.6)]'
                    }`}
                    style={{ width: 84, height: 84 }}
                  >
                    <div
                      className="absolute -inset-4 rounded-full border-2 border-dashed border-amber-300/40"
                      style={{ transform: `rotate(${currentTime * 15}deg)` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. ELEMENTS ON STAGE (CHARACTERS WITH SHADOWS & MOTIONS, PROPS) */}
          {scene.elements.map((element) => {
            if (element.visible === false) return null;

            let currentX = element.x;
            let currentY = element.y;
            let currentScale = element.scale;
            let currentRotation = element.rotation;
            let currentFlip = Boolean(element.characterData?.flipX);
            let currentAngle = element.characterData?.viewAngle || 'front';
            let currentExpr = element.characterData?.eyeExpression || 'neutral';
            let currentViseme = element.characterData?.viseme || 'closed';
            let currentPupil = element.characterData?.pupilLook || { x: 0, y: 0 };
            let kfLimbAngles: Record<string, number> = {
              ...(element.characterData?.bodyPartAngles || {}),
            };

            if (element.keyframes && element.keyframes.length > 0) {
              const interpolated = interpolateCharacterKeyframes(element.keyframes, currentTime, {
                x: element.x,
                y: element.y,
                scale: element.scale,
                rotation: element.rotation,
                viewAngle: element.characterData?.viewAngle || 'front',
              });
              currentX = interpolated.x;
              currentY = interpolated.y;
              currentScale = interpolated.scale;
              currentRotation = interpolated.rotation;
              currentFlip = interpolated.flipX;
              currentAngle = interpolated.viewAngle;
              currentExpr = interpolated.expression;
              currentViseme = interpolated.viseme;
              currentPupil = interpolated.pupilLook;
              if (interpolated.bodyPartAngles) {
                kfLimbAngles = { ...kfLimbAngles, ...interpolated.bodyPartAngles };
              }
            }

            // Combine active motion clip limb angles with keyframe pose angles
            const clipLimbAngles = element.activeMotionClipId
              ? sampleMotionClipLimbAngles(
                  element.activeMotionClipId,
                  currentTime,
                  element.motionSpeed || 1
                )
              : DEFAULT_LIMB_ANGLES;

            const combinedLimbAngles: Record<string, number> = {
              headTilt: (kfLimbAngles.headTilt || 0) + (clipLimbAngles.headTilt || 0),
              torsoLean: (kfLimbAngles.torsoLean || 0) + (clipLimbAngles.torsoLean || 0),
              leftArm: (kfLimbAngles.leftArm || 0) + (clipLimbAngles.leftArm || 0),
              rightArm: (kfLimbAngles.rightArm || 0) + (clipLimbAngles.rightArm || 0),
              leftLeg: (kfLimbAngles.leftLeg || 0) + (clipLimbAngles.leftLeg || 0),
              rightLeg: (kfLimbAngles.rightLeg || 0) + (clipLimbAngles.rightLeg || 0),
              bodyBob: (kfLimbAngles.bodyBob || 0) + (clipLimbAngles.bodyBob || 0),
            };

            // Shadow configuration (Default enabled for characters so animations feel grounded)
            const shadowCfg = element.shadow || {
              enabled: true,
              type: 'ground',
              opacity: 0.45,
              blur: 8,
              offsetX: 0,
              offsetY: 118,
              scaleX: 1.0,
              skewX: effects.celestialX > 50 ? -18 : 18,
              color: '#000000',
            };

            const isSelected = selectedElementId === element.id;

            // Drop or Glow CSS filter for character container
            const dropShadowFilter =
              shadowCfg.enabled && shadowCfg.type === 'drop'
                ? `drop-shadow(${shadowCfg.offsetX}px ${shadowCfg.offsetY || 12}px ${shadowCfg.blur}px ${shadowCfg.color})`
                : shadowCfg.enabled && shadowCfg.type === 'glow'
                ? `drop-shadow(0px 0px ${Math.max(12, shadowCfg.blur * 2)}px ${
                    shadowCfg.color === '#000000' ? '#38bdf8' : shadowCfg.color
                  })`
                : undefined;

            return (
              <div
                key={element.id}
                onPointerDown={(e) => {
                  if (element.locked) return;
                  e.stopPropagation();
                  onSelectElement(element.id);
                  if (activeTool === 'select') {
                    setIsDraggingElement(true);
                    setDraggedElemId(element.id);
                    const stageRect = document
                      .getElementById('white-stage-16-9')
                      ?.getBoundingClientRect();
                    if (stageRect) {
                      const mouseX = (e.clientX - stageRect.left) / stageZoom;
                      const mouseY = (e.clientY - stageRect.top) / stageZoom;
                      setDragOffset({ x: mouseX - currentX, y: mouseY - currentY });
                    }
                  }
                }}
                className={`absolute select-none cursor-move transition-shadow ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : ''
                }`}
                style={{
                  left: currentX,
                  top: currentY,
                  transform: `translate(-50%, -50%) scale(${currentScale}) rotate(${currentRotation}deg)`,
                  zIndex: element.zIndex,
                  filter: dropShadowFilter,
                }}
              >
                {/* SHADOW RENDERING (Ground Contact Shadow or Long Cast Directional Shadow) */}
                {shadowCfg.enabled && shadowCfg.type === 'ground' && (
                  <div
                    className="absolute left-1/2 pointer-events-none rounded-full"
                    style={{
                      width: 110 * (shadowCfg.scaleX || 1),
                      height: 24,
                      bottom: 8 - (shadowCfg.offsetY ? shadowCfg.offsetY - 118 : 0),
                      transform: `translateX(calc(-50% + ${shadowCfg.offsetX || 0}px)) skewX(${
                        shadowCfg.skewX || 0
                      }deg)`,
                      backgroundColor: shadowCfg.color || '#000000',
                      opacity: shadowCfg.opacity,
                      filter: `blur(${shadowCfg.blur}px)`,
                    }}
                  />
                )}

                {shadowCfg.enabled && shadowCfg.type === 'long_cast' && (
                  <div
                    className="absolute left-1/2 pointer-events-none rounded-full"
                    style={{
                      width: 120 * (shadowCfg.scaleX || 1),
                      height: 85,
                      bottom: -15,
                      transform: `translateX(calc(-50% + ${shadowCfg.offsetX || 25}px)) skewX(${
                        shadowCfg.skewX || -35
                      }deg) scaleY(0.45)`,
                      background: `linear-gradient(to bottom, ${
                        shadowCfg.color || '#000000'
                      }, transparent)`,
                      opacity: shadowCfg.opacity,
                      filter: `blur(${shadowCfg.blur}px)`,
                    }}
                  />
                )}

                {/* CHARACTER ELEMENT WITH 5-ANGLE + LIMB POSE ANIMATION */}
                {element.type === 'character' && element.characterData && (
                  <CharacterRenderer5Angle
                    config={{
                      ...element.characterData,
                      viewAngle: currentAngle,
                      flipX: currentFlip,
                      eyeExpression: currentExpr,
                      viseme: currentViseme,
                      pupilLook: currentPupil,
                      bodyPartAngles: combinedLimbAngles,
                    }}
                    overrideLimbAngles={combinedLimbAngles}
                    width={180}
                    height={270}
                  />
                )}

                {/* PROP ELEMENT */}
                {element.type === 'prop' && (
                  <div className="flex flex-col items-center">
                    {element.bgImageUrl ? (
                      <img
                        src={element.bgImageUrl}
                        alt={element.name}
                        className="max-w-[120px] max-h-[120px] object-contain drop-shadow"
                      />
                    ) : (
                      <div className="text-5xl filter drop-shadow select-none">
                        {element.propIcon || '📦'}
                      </div>
                    )}
                  </div>
                )}

                {/* SELECTION BOUNDING BOX & HANDLES */}
                {isSelected && (
                  <div className="absolute -inset-2 border-2 border-dashed border-blue-500 pointer-events-none rounded">
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm" />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-blue-500 border border-white rounded-full flex items-center justify-center">
                      <RotateCw size={8} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* 4. FOREGROUND WEATHER PARTICLE EFFECTS (RAIN, STORM, WINTER SNOW, FOG, FIREFLIES, PETALS) */}
          {effects.weather !== 'none' && (
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              {/* Storm Periodic Lightning Flash */}
              {effects.weather === 'storm' && Math.sin(currentTime * 9) > 0.92 && (
                <div className="absolute inset-0 bg-white/45 z-30" />
              )}

              {/* RAIN & STORM STREAKS */}
              {(effects.weather === 'rain' || effects.weather === 'storm') &&
                weatherParticles.map((p) => {
                  const fallProgress = ((currentTime * 140 * p.speed + p.seedY) % 110) - 10;
                  const driftX = (p.seedX + (currentTime * effects.windSpeed * 0.4)) % 100;
                  return (
                    <div
                      key={p.id}
                      className="absolute bg-gradient-to-b from-transparent via-sky-200/75 to-white/90 rounded-full"
                      style={{
                        left: `${driftX}%`,
                        top: `${fallProgress}%`,
                        width: effects.weather === 'storm' ? 2.2 : 1.6,
                        height: effects.weather === 'storm' ? 28 : 20,
                        transform: `rotate(${10 + effects.windSpeed * 0.2}deg)`,
                      }}
                    />
                  );
                })}

              {/* WINTER SNOWFLAKES */}
              {effects.weather === 'snow' &&
                weatherParticles.map((p) => {
                  const fallProgress = ((currentTime * 35 * p.speed + p.seedY) % 108) - 8;
                  const swayX =
                    (p.seedX + Math.sin(currentTime * 2 + p.id) * 4 + currentTime * (effects.windSpeed * 0.1)) %
                    100;
                  return (
                    <div
                      key={p.id}
                      className="absolute rounded-full bg-white shadow-[0_0_8px_#ffffff]"
                      style={{
                        left: `${swayX}%`,
                        top: `${fallProgress}%`,
                        width: p.size + 2,
                        height: p.size + 2,
                        opacity: 0.85,
                      }}
                    />
                  );
                })}

              {/* WINTER / MORNING FOG LAYERS */}
              {effects.weather === 'fog' && (
                <>
                  <div
                    className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-200/65 via-slate-100/35 to-transparent backdrop-blur-[1.5px]"
                    style={{ opacity: effects.weatherIntensity / 100 }}
                  />
                  <div
                    className="absolute inset-x-0 top-1/4 h-36 bg-white/25 blur-2xl"
                    style={{
                      transform: `translateX(${Math.sin(currentTime * 0.5) * 40}px)`,
                    }}
                  />
                </>
              )}

              {/* MAGICAL FIREFLIES */}
              {effects.weather === 'fireflies' &&
                weatherParticles.slice(0, 30).map((p) => {
                  const fx = (p.seedX + Math.sin(currentTime * 1.5 + p.id) * 6) % 98;
                  const fy = (p.seedY + Math.cos(currentTime * 1.2 + p.id) * 6) % 95;
                  const glow = 0.35 + 0.65 * Math.abs(Math.sin(currentTime * 3 + p.id));
                  return (
                    <div
                      key={p.id}
                      className="absolute rounded-full bg-lime-300 shadow-[0_0_12px_4px_rgba(190,242,100,0.8)]"
                      style={{
                        left: `${fx}%`,
                        top: `${fy}%`,
                        width: 5,
                        height: 5,
                        opacity: glow,
                      }}
                    />
                  );
                })}

              {/* FALLING FLOWER PETALS */}
              {effects.weather === 'petals' &&
                weatherParticles.slice(0, 35).map((p) => {
                  const fallY = ((currentTime * 30 * p.speed + p.seedY) % 108) - 8;
                  const swayX = (p.seedX + Math.sin(currentTime * 2.2 + p.id) * 5) % 100;
                  return (
                    <div
                      key={p.id}
                      className="absolute rounded-tl-full rounded-br-full bg-gradient-to-br from-rose-400 to-amber-400 shadow-sm"
                      style={{
                        left: `${swayX}%`,
                        top: `${fallY}%`,
                        width: 9,
                        height: 6,
                        transform: `rotate(${currentTime * 60 + p.id * 25}deg)`,
                      }}
                    />
                  );
                })}
            </div>
          )}

          {/* 5. VIGNETTE & CINEMA 2.35:1 LETTERBOX BARS */}
          {effects.vignette && (
            <div
              className="absolute inset-0 pointer-events-none z-25"
              style={{
                background:
                  'radial-gradient(circle, transparent 52%, rgba(0, 0, 0, 0.65) 100%)',
              }}
            />
          )}

          {effects.letterbox && (
            <>
              <div className="absolute top-0 inset-x-0 h-12 bg-black z-30 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-12 bg-black z-30 pointer-events-none" />
            </>
          )}

          {/* 6. RULE OF THIRDS CAMERA GRID OVERLAY */}
          {effects.showGridGuides && (
            <div className="absolute inset-0 pointer-events-none z-30 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-cyan-400/25" />
              ))}
            </div>
          )}

          {/* 7. INTERACTIVE CAMERA VIEWFINDER FRAME */}
          {!previewThroughCamera && (
            <div
              id="camera-viewfinder-frame"
              style={{
                left: cameraFrame.x,
                top: cameraFrame.y,
                width: cameraFrame.width,
                height: cameraFrame.height,
                transform: `rotate(${cameraFrame.rotation}deg)`,
                transformOrigin: 'center center',
              }}
              className="absolute border-2 border-cyan-400/80 pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.3)] z-30"
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

              <div className="absolute top-2 left-2 px-2 py-0.5 bg-cyan-950/85 border border-cyan-400/50 rounded text-[9px] font-mono font-bold text-cyan-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>
                  CAM • {activeCamera.zoom.toFixed(2)}X • {effects.timeOfDay.toUpperCase()}
                  {effects.weather !== 'none' ? ` • ${effects.weather.toUpperCase()}` : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
