import React, { useState, useRef } from 'react';
import {
  StudioScene,
  SceneElement,
  EasingType,
  StudioProject,
} from '../types/studio';
import { POSE_PRESETS, DEFAULT_LIMB_ANGLES } from '../utils/riggingLogic';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Video,
  User,
  Key,
  Bone,
  Volume2,
} from 'lucide-react';

interface StudioTimelineProps {
  project: StudioProject;
  currentScene: StudioScene;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onSetCurrentTime: (time: number) => void;
  onTogglePlay: () => void;
  onSetPlaybackSpeed: (speed: number) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateScene: (updater: (s: StudioScene) => StudioScene) => void;
  onSelectScene: (sceneId: string) => void;
  onAddScene: () => void;
  onDeleteScene: (sceneId: string) => void;
  isAutoKeyframeActive: boolean;
  onToggleAutoKeyframe: () => void;
  onAddKeyframeAtCurrentTime: () => void;
  onAddCameraKeyframeAtCurrentTime: () => void;
  onApplyPoseAtCurrentTime?: (
    elemId: string,
    poseId: string,
    limbAngles: Record<string, number>
  ) => void;
}

export const StudioTimeline: React.FC<StudioTimelineProps> = ({
  project,
  currentScene,
  currentTime,
  isPlaying,
  playbackSpeed,
  onSetCurrentTime,
  onTogglePlay,
  onSetPlaybackSpeed,
  selectedElementId,
  onSelectElement,
  onUpdateScene,
  onSelectScene,
  onAddScene,
  onDeleteScene,
  isAutoKeyframeActive,
  onToggleAutoKeyframe,
  onAddKeyframeAtCurrentTime,
  onAddCameraKeyframeAtCurrentTime,
  onApplyPoseAtCurrentTime,
}) => {
  const [timelineZoom, setTimelineZoom] = useState<number>(1.0);
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState<boolean>(false);

  const rulerRef = useRef<HTMLDivElement>(null);
  const FPS = project.fps || 24;
  const duration = currentScene.duration || 6.0;

  const characters = currentScene.elements.filter((el) => el.type === 'character');
  const selectedCharacter = characters.find((c) => c.id === selectedElementId);

  const handleScrub = (clientX: number) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    onSetCurrentTime(Math.round(newTime * 100) / 100);
  };

  const handleRulerPointerDown = (e: React.PointerEvent) => {
    setIsDraggingPlayhead(true);
    handleScrub(e.clientX);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handleRulerPointerMove = (e: React.PointerEvent) => {
    if (isDraggingPlayhead) {
      handleScrub(e.clientX);
    }
  };

  const handleRulerPointerUp = () => {
    setIsDraggingPlayhead(false);
  };

  const handleStep5Back = () => onSetCurrentTime(Math.max(0, currentTime - 5));
  const handleStep5Forward = () => onSetCurrentTime(Math.min(duration, currentTime + 5));

  const allKeyframeTimes: number[] = [0];
  currentScene.elements.forEach((el) => {
    el.keyframes?.forEach((k) => allKeyframeTimes.push(k.time));
  });
  currentScene.cameraKeyframes?.forEach((k) => allKeyframeTimes.push(k.time));
  const uniqueTimes = Array.from(new Set(allKeyframeTimes)).sort((a, b) => a - b);

  const handlePrevKeyframe = () => {
    const prev = [...uniqueTimes].reverse().find((t) => t < currentTime - 0.05);
    if (prev !== undefined) onSetCurrentTime(prev);
    else onSetCurrentTime(0);
  };

  const handleNextKeyframe = () => {
    const next = uniqueTimes.find((t) => t > currentTime + 0.05);
    if (next !== undefined) onSetCurrentTime(next);
  };

  const handleToggleLock = (elemId: string) => {
    onUpdateScene((s) => ({
      ...s,
      elements: s.elements.map((el) =>
        el.id === elemId ? { ...el, locked: !el.locked } : el
      ),
    }));
  };

  const handleToggleVisibility = (elemId: string) => {
    onUpdateScene((s) => ({
      ...s,
      elements: s.elements.map((el) =>
        el.id === elemId ? { ...el, visible: el.visible === false ? true : false } : el
      ),
    }));
  };

  const handleDeleteElement = (elemId: string) => {
    onUpdateScene((s) => ({
      ...s,
      elements: s.elements.filter((el) => el.id !== elemId),
    }));
    if (selectedElementId === elemId) onSelectElement(null);
  };

  const handleChangeKeyframeEasing = (kfId: string, newEasing: EasingType) => {
    if (!selectedElementId) return;
    onUpdateScene((s) => ({
      ...s,
      elements: s.elements.map((el) => {
        if (el.id !== selectedElementId || !el.keyframes) return el;
        return {
          ...el,
          keyframes: el.keyframes.map((kf) =>
            kf.id === kfId ? { ...kf, easing: newEasing } : kf
          ),
        };
      }),
    }));
  };

  const handleDeleteKeyframe = (kfId: string) => {
    if (!selectedElementId) return;
    onUpdateScene((s) => ({
      ...s,
      elements: s.elements.map((el) => {
        if (el.id !== selectedElementId || !el.keyframes) return el;
        return {
          ...el,
          keyframes: el.keyframes.filter((kf) => kf.id !== kfId),
        };
      }),
    }));
    setSelectedKeyframeId(null);
  };

  const handleApplyTimelinePosePreset = (poseId: string) => {
    if (!selectedCharacter) return;
    const preset = POSE_PRESETS[poseId];
    if (!preset) return;
    const limbAngles = { ...DEFAULT_LIMB_ANGLES, ...(preset.limbAngles || {}) };
    if (onApplyPoseAtCurrentTime) {
      onApplyPoseAtCurrentTime(selectedCharacter.id, poseId, limbAngles);
    }
  };

  const currentFrame = Math.round(currentTime * FPS);
  const totalFrames = Math.round(duration * FPS);

  return (
    <div className="h-72 bg-[#12141a] border-t border-[#2b2f3e] flex flex-col z-30 select-none">
      {/* 1. PLAYBACK & TRANSPORT CONTROLS BAR */}
      <div className="h-11 px-4 bg-[#181a24] border-b border-[#2b2f3e] flex items-center justify-between">
        {/* Left: Tools & Auto-Keyframe Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoKeyframe}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              isAutoKeyframeActive
                ? 'bg-rose-600/30 text-rose-300 border-rose-500 shadow-md'
                : 'bg-[#222530] text-gray-400 border-[#2b2f3e] hover:text-white'
            }`}
            title="Auto-Keyframe: Moving or posing character automatically records a keyframe at current time"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isAutoKeyframeActive ? 'bg-rose-500 animate-ping' : 'bg-gray-500'
              }`}
            />
            <span>Auto-KF</span>
          </button>

          <button
            onClick={onAddKeyframeAtCurrentTime}
            disabled={!selectedElementId}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 disabled:opacity-40 rounded-lg text-xs font-semibold transition-all"
            title="Add Diamond Keyframe at Current Time (K)"
          >
            <Key size={12} />
            <span>+ Pose/KF (K)</span>
          </button>

          <button
            onClick={onAddCameraKeyframeAtCurrentTime}
            className="flex items-center gap-1 px-2 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition-all"
            title="Add Camera Keyframe at Current Time"
          >
            <Video size={12} />
            <span>+ Cam KF</span>
          </button>

          {/* Quick Timeline Pose Selector Bar when a character is selected */}
          {selectedCharacter && (
            <div className="hidden xl:flex items-center gap-1 ml-2 pl-2 border-l border-[#2b2f3e]">
              <Bone size={12} className="text-purple-400 mr-0.5" />
              <span className="text-[10px] font-bold text-purple-300 mr-1">Timeline Pose:</span>
              {Object.values(POSE_PRESETS).slice(0, 7).map((pose) => (
                <button
                  key={pose.id}
                  onClick={() => handleApplyTimelinePosePreset(pose.id)}
                  className="px-2 py-0.5 rounded bg-[#222533] hover:bg-purple-600 text-[10px] font-semibold text-gray-300 hover:text-white transition-colors"
                  title={`Stamp "${pose.name}" pose keyframe at ${currentTime.toFixed(2)}s`}
                >
                  {pose.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Playback Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSetCurrentTime(0)}
            className="p-1.5 text-gray-400 hover:text-white rounded"
            title="Go to Start"
          >
            <SkipBack size={14} />
          </button>

          <button
            onClick={handleStep5Back}
            className="px-1.5 py-0.5 text-[10px] text-gray-400 hover:text-white rounded bg-[#202330]"
          >
            -5s
          </button>

          <button
            onClick={handlePrevKeyframe}
            className="p-1.5 text-gray-400 hover:text-white rounded"
            title="Previous Keyframe"
          >
            <RotateCcw size={13} />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-900/40 transition-transform active:scale-95"
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} className="translate-x-0.5" />}
          </button>

          <button
            onClick={handleNextKeyframe}
            className="p-1.5 text-gray-400 hover:text-white rounded"
            title="Next Keyframe"
          >
            <FastForward size={13} />
          </button>

          <button
            onClick={handleStep5Forward}
            className="px-1.5 py-0.5 text-[10px] text-gray-400 hover:text-white rounded bg-[#202330]"
          >
            +5s
          </button>

          <button
            onClick={() => onSetCurrentTime(duration)}
            className="p-1.5 text-gray-400 hover:text-white rounded"
            title="Go to End"
          >
            <SkipForward size={14} />
          </button>

          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-[#2b2f3e]">
            <span className="font-mono text-xs font-bold text-white bg-[#101218] px-2 py-0.5 rounded border border-[#2b2f3e]">
              {currentTime < 10 ? `0${currentTime.toFixed(2)}` : currentTime.toFixed(2)}s
              <span className="text-gray-400 ml-1">
                ({currentFrame}f/{totalFrames}f)
              </span>
            </span>

            <button
              onClick={() =>
                onSetPlaybackSpeed(playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 0.5 : 1)
              }
              className="px-1.5 py-0.5 rounded bg-[#202330] hover:bg-[#2b2f3e] text-[10px] font-bold text-blue-400 font-mono"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>

        {/* Right: Timeline Zoom slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">Zoom:</span>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={timelineZoom}
            onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
            className="w-20 accent-blue-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 2. TIMELINE TRACKS AREA (HEADER RULER + TRACK ROWS) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: TRACK HEADERS & LABELS */}
        <div className="w-64 bg-[#161822] border-r border-[#2b2f3e] flex flex-col overflow-y-auto">
          <div className="h-7 px-3 bg-[#13141d] border-b border-[#2b2f3e] flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase">
            <span>Layers & Tracks</span>
            <span>Controls</span>
          </div>

          {/* CAMERA TRACK HEADER */}
          <div className="h-8 px-3 border-b border-[#2b2f3e] flex items-center justify-between bg-[#11131a] text-xs font-semibold text-cyan-300">
            <div className="flex items-center gap-2">
              <Video size={13} className="text-cyan-400" />
              <span>Camera & Angles</span>
            </div>
            <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-900/30 px-1 rounded">
              {currentScene.cameraKeyframes?.length || 0} kf
            </span>
          </div>

          {/* AUDIO / TTS VOICE TRACK HEADER (If audio tracks exist) */}
          {(project.audioTracks?.length || 0) > 0 && (
            <div className="h-8 px-3 border-b border-[#2b2f3e] flex items-center justify-between bg-[#14121d] text-xs font-semibold text-rose-300">
              <div className="flex items-center gap-2">
                <Volume2 size={13} className="text-rose-400" />
                <span>Voice & Lip-Sync</span>
              </div>
              <span className="text-[9px] font-mono text-rose-300 bg-rose-900/30 px-1 rounded">
                {project.audioTracks.length} clips
              </span>
            </div>
          )}

          {/* CHARACTER TRACK HEADERS */}
          {characters.map((char) => {
            const isSelected = selectedElementId === char.id;

            return (
              <div key={char.id} className="flex flex-col border-b border-[#2b2f3e]">
                <div
                  onClick={() => onSelectElement(char.id)}
                  className={`h-10 px-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-600/20 border-l-4 border-blue-500 text-white'
                      : 'hover:bg-[#1a1c26] text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-5 h-5 rounded-md bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-[10px] font-bold text-blue-300 shrink-0">
                      {char.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold truncate">{char.name}</span>
                    {char.activeMotionClipId && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-500/30">
                        Motion
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-gray-400 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(char.id);
                      }}
                      className="p-1 hover:text-white rounded"
                    >
                      {char.visible === false ? (
                        <EyeOff size={12} className="text-gray-500" />
                      ) : (
                        <Eye size={12} />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(char.id);
                      }}
                      className="p-1 hover:text-white rounded"
                    >
                      {char.locked ? (
                        <Lock size={12} className="text-amber-400" />
                      ) : (
                        <Unlock size={12} />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteElement(char.id);
                      }}
                      className="p-1 hover:text-red-400 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* EXPANDED SUB-TRACKS (Shown for the selected character) */}
                {isSelected && (
                  <div className="bg-[#101218] pl-6 pr-3 py-1 flex flex-col gap-1 text-[10px] font-medium text-gray-400 border-t border-[#1e2230]">
                    <div className="h-5 flex items-center justify-between">
                      <span>Transform (X, Y)</span>
                      <span className="font-mono text-[9px] text-gray-500">pos</span>
                    </div>
                    <div className="h-5 flex items-center justify-between">
                      <span className="text-purple-300 font-semibold">Skeleton Pose & Limbs</span>
                      <span className="font-mono text-[9px] text-purple-400">pose</span>
                    </div>
                    <div className="h-5 flex items-center justify-between">
                      <span>Turnaround View Angle</span>
                      <span className="font-mono text-[9px] text-amber-400">5-angle</span>
                    </div>
                    <div className="h-5 flex items-center justify-between">
                      <span>Mouth / Viseme Lip-Sync</span>
                      <span className="font-mono text-[9px] text-rose-400">lip-sync</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: TIMELINE RULER & KEYFRAME DIAMONDS GRID */}
        <div className="flex-1 flex flex-col overflow-x-auto overflow-y-auto bg-[#101116] relative">
          {/* TIMELINE RULER */}
          <div
            ref={rulerRef}
            onPointerDown={handleRulerPointerDown}
            onPointerMove={handleRulerPointerMove}
            onPointerUp={handleRulerPointerUp}
            className="h-7 bg-[#141620] border-b border-[#2b2f3e] relative cursor-pointer shrink-0 select-none"
            style={{ width: `${100 * timelineZoom}%`, minWidth: '100%' }}
          >
            {Array.from({ length: Math.ceil(duration) + 1 }).map((_, sec) => {
              const leftPercent = (sec / duration) * 100;
              return (
                <div
                  key={sec}
                  className="absolute top-0 bottom-0 flex flex-col items-start border-l border-gray-600/80 pl-1 text-[9px] font-mono text-gray-400"
                  style={{ left: `${leftPercent}%` }}
                >
                  <span className="font-bold text-white">{sec}s</span>
                  <div className="flex gap-2 text-[8px] text-gray-500">
                    <span>f{sec * FPS}</span>
                  </div>
                </div>
              );
            })}

            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-50 pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="w-3 h-3 bg-rose-500 rounded-sm -translate-x-[5px] -translate-y-1 shadow flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </div>
          </div>

          {/* TIMELINE TRACKS CANVAS */}
          <div
            className="flex-1 flex flex-col relative"
            style={{ width: `${100 * timelineZoom}%`, minWidth: '100%' }}
          >
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-40 pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />

            {/* CAMERA TRACK ROW */}
            <div className="h-8 border-b border-[#2b2f3e] bg-[#12141c]/60 relative flex items-center">
              {currentScene.cameraKeyframes?.map((camKf) => {
                const leftPercent = (camKf.time / duration) * 100;
                return (
                  <div
                    key={camKf.id}
                    onClick={() => onSetCurrentTime(camKf.time)}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-cyan-400 border border-white hover:scale-125 cursor-pointer transition-transform shadow"
                    style={{ left: `${leftPercent}%` }}
                    title={`Camera Keyframe at ${camKf.time}s • Zoom: ${camKf.zoom}x`}
                  />
                );
              })}
            </div>

            {/* AUDIO / VOICE TRACK ROW */}
            {(project.audioTracks?.length || 0) > 0 && (
              <div className="h-8 border-b border-[#2b2f3e] bg-[#161220]/60 relative flex items-center">
                {project.audioTracks.map((clip) => {
                  const leftPercent = (clip.startTime / duration) * 100;
                  const widthPercent = Math.min(
                    100 - leftPercent,
                    (clip.duration / duration) * 100
                  );
                  return (
                    <div
                      key={clip.id}
                      onClick={() => onSetCurrentTime(clip.startTime)}
                      className="absolute h-5 rounded-md bg-gradient-to-r from-rose-600/80 to-purple-600/80 border border-rose-400/60 px-2 flex items-center gap-1.5 text-[9px] font-bold text-white truncate cursor-pointer shadow"
                      style={{ left: `${leftPercent}%`, width: `${Math.max(6, widthPercent)}%` }}
                      title={`${clip.name} (${clip.duration}s)`}
                    >
                      <Volume2 size={10} />
                      <span className="truncate">{clip.name}</span>
                      {clip.autoLipSync && (
                        <span className="px-1 rounded bg-black/40 text-[8px] text-rose-200">
                          LIP-SYNC
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* CHARACTERS TRACK ROWS & SUB-TRACKS */}
            {characters.map((char) => {
              const isSelected = selectedElementId === char.id;
              const keyframes = char.keyframes || [];

              return (
                <div key={char.id} className="flex flex-col border-b border-[#2b2f3e]">
                  <div
                    onClick={() => onSelectElement(char.id)}
                    className={`h-10 relative flex items-center cursor-pointer ${
                      isSelected ? 'bg-blue-950/20' : 'hover:bg-[#151720]'
                    }`}
                  >
                    {keyframes.map((kf) => {
                      const leftPercent = (kf.time / duration) * 100;
                      const isKfSelected = selectedKeyframeId === kf.id;

                      return (
                        <div
                          key={kf.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedKeyframeId(kf.id);
                            onSetCurrentTime(kf.time);
                          }}
                          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 cursor-pointer transition-transform hover:scale-125 shadow-md flex items-center justify-center ${
                            isKfSelected
                              ? 'bg-amber-400 border-2 border-white scale-125 z-30'
                              : 'bg-blue-500 border border-white/80 z-20'
                          }`}
                          style={{ left: `${leftPercent}%` }}
                          title={`Keyframe at ${kf.time.toFixed(2)}s • Pose: ${
                            kf.posePreset || 'custom'
                          } • Viseme: ${kf.viseme}`}
                        />
                      );
                    })}
                  </div>

                  {isSelected && (
                    <div className="flex flex-col py-1 bg-[#0d0e14] border-t border-[#1e2230]">
                      {/* Sub-track 1: Position */}
                      <div className="h-5 relative flex items-center border-b border-gray-800/40">
                        {keyframes.map((kf) => (
                          <div
                            key={`pos-${kf.id}`}
                            className="absolute -translate-x-1/2 w-2 h-2 rotate-45 bg-blue-400/80 border border-white"
                            style={{ left: `${(kf.time / duration) * 100}%` }}
                          />
                        ))}
                      </div>

                      {/* Sub-track 2: Skeleton Pose & Limb Angles */}
                      <div className="h-5 relative flex items-center border-b border-gray-800/40">
                        {keyframes.map((kf) => (
                          <div
                            key={`pose-${kf.id}`}
                            onClick={() => {
                              setSelectedKeyframeId(kf.id);
                              onSetCurrentTime(kf.time);
                            }}
                            className="absolute -translate-x-1/2 px-1 rounded text-[8px] font-bold bg-purple-600 text-white border border-purple-300 cursor-pointer"
                            style={{ left: `${(kf.time / duration) * 100}%` }}
                          >
                            {kf.posePreset || 'pose'}
                          </div>
                        ))}
                      </div>

                      {/* Sub-track 3: 5-Angle Turnaround */}
                      <div className="h-5 relative flex items-center border-b border-gray-800/40">
                        {keyframes.map((kf) => (
                          <div
                            key={`ang-${kf.id}`}
                            className="absolute -translate-x-1/2 px-1 rounded text-[8px] font-bold bg-amber-500 text-black border border-white"
                            style={{ left: `${(kf.time / duration) * 100}%` }}
                          >
                            {kf.viewAngle}
                          </div>
                        ))}
                      </div>

                      {/* Sub-track 4: Mouth Viseme Lip-Sync */}
                      <div className="h-5 relative flex items-center">
                        {keyframes.map((kf) => (
                          <div
                            key={`vis-${kf.id}`}
                            className="absolute -translate-x-1/2 px-1 rounded text-[8px] font-bold bg-rose-500 text-white"
                            style={{ left: `${(kf.time / duration) * 100}%` }}
                          >
                            {kf.viseme}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SCENES TABS & KEYFRAME POSE / EASING BAR */}
      <div className="h-9 px-4 bg-[#14161f] border-t border-[#2b2f3e] flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-bold text-gray-500 uppercase mr-1">Scenes:</span>
          {project.scenes.map((scene) => {
            const isActive = scene.id === currentScene.id;
            return (
              <div
                key={scene.id}
                onClick={() => onSelectScene(scene.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-[#1e202a] text-gray-400 hover:text-white'
                }`}
              >
                <span>{scene.name}</span>
                {project.scenes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScene(scene.id);
                    }}
                    className="hover:text-red-300 ml-1 text-xs"
                    title="Delete Scene"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={onAddScene}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-[#1e202a] hover:bg-[#282b38] rounded transition-colors"
          >
            <Plus size={12} /> Add Scene
          </button>
        </div>

        {/* Selected Keyframe Inspector: Pose Preset + Easing Dropdown & Delete */}
        {selectedKeyframeId && (
          <div className="flex items-center gap-2 bg-[#1b1d28] px-3 py-1 rounded-lg border border-amber-500/40 text-xs">
            <span className="text-[10px] text-amber-400 font-bold">♦ Keyframe Pose & Easing:</span>
            {selectedCharacter && (
              <select
                onChange={(e) => handleApplyTimelinePosePreset(e.target.value)}
                defaultValue=""
                className="px-2 py-0.5 bg-[#101218] border border-purple-500/40 rounded text-xs text-purple-200"
              >
                <option value="" disabled>
                  Change Pose...
                </option>
                {Object.values(POSE_PRESETS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            <select
              onChange={(e) =>
                handleChangeKeyframeEasing(selectedKeyframeId, e.target.value as EasingType)
              }
              className="px-2 py-0.5 bg-[#101218] border border-[#2b2f3e] rounded text-xs text-white"
            >
              <option value="linear">Linear</option>
              <option value="ease-in">Ease-In</option>
              <option value="ease-out">Ease-Out</option>
              <option value="bounce">Bounce</option>
            </select>
            <button
              onClick={() => handleDeleteKeyframe(selectedKeyframeId)}
              className="text-red-400 hover:text-red-300 p-0.5 rounded"
              title="Delete Keyframe"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
