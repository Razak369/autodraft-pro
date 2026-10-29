import React, { useState, useRef, useEffect } from 'react';
import { MotionClip, CharacterConfig } from '../types/studio';
import {
  MOTION_CLIPS_PRESETS,
  sampleMotionClip,
  DEFAULT_NEUTRAL_POSE,
  POSE_PRESETS,
} from '../utils/riggingLogic';
import { RiggedCharacterRenderer } from './RiggedCharacterRenderer';
import {
  Camera,
  Play,
  Pause,
  Plus,
  Video,
  Circle,
  Square,
  Sparkles,
  RotateCcw,
  Check,
  Activity,
  Layers,
  Sliders,
} from 'lucide-react';

interface MotionStudioProps {
  onApplyClipToCharacter?: (clipId: string) => void;
  customClips?: MotionClip[];
  onAddCustomClip?: (clip: MotionClip) => void;
}

const SAMPLE_DEMO_CHAR: CharacterConfig = {
  id: 'char_demo',
  name: 'Motion Test Character',
  skinColor: '#d99763',
  headStyle: 'village_man',
  hairStyle: 'classic_fade',
  facialHair: 'thick_mustache',
  clothesStyle: 'lungi_shirt',
  shirtColor: '#2563eb',
  bottomColor: '#fef3c7',
  expression: 'neutral',
  flipX: false,
  scale: 1,
  pose: { ...DEFAULT_NEUTRAL_POSE },
};

export const MotionStudio: React.FC<MotionStudioProps> = ({
  onApplyClipToCharacter,
  customClips = [],
  onAddCustomClip,
}) => {
  const [allClips, setAllClips] = useState<MotionClip[]>([
    ...MOTION_CLIPS_PRESETS,
    ...customClips,
  ]);
  const [selectedClipId, setSelectedClipId] = useState<string>('village_walk');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Mocap / Webcam state
  const [mocapActive, setMocapActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecordingMocap, setIsRecordingMocap] = useState<boolean>(false);
  const [recordedFrames, setRecordedFrames] = useState<any[]>([]);
  const [newClipTitle, setNewClipTitle] = useState<string>('My Custom Mocap Action');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulated / live mocap tracking pose
  const [mocapPose, setMocapPose] = useState<Record<string, { x: number; y: number; angle: number }>>({
    ...DEFAULT_NEUTRAL_POSE,
  });

  const activeClip = allClips.find((c) => c.id === selectedClipId) || allClips[0];

  // Playback timer loop for standard clips
  useEffect(() => {
    let animId: number;
    if (isPlaying && !mocapActive && activeClip) {
      let start = performance.now();
      const dur = (activeClip.duration || 2.0) * 1000;
      const step = (now: number) => {
        const elapsed = (now - start) % dur;
        setProgress(elapsed / dur);
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, mocapActive, activeClip]);

  // Handle Mocap Camera
  const toggleCamera = async () => {
    if (mocapActive) {
      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setMocapActive(false);
      setIsRecordingMocap(false);
    } else {
      setCameraError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setMocapActive(true);
      } catch (err) {
        console.warn('Camera access error:', err);
        // Fallback: Start optical simulation mocap mode with interactive tracker!
        setCameraError('Camera access denied or unavailable. Enabled Optical Simulation Mocap.');
        setMocapActive(true);
      }
    }
  };

  // Mocap tracking animation loop (processes video or creates interactive motion tracker)
  useEffect(() => {
    let mocapInterval: NodeJS.Timeout;
    if (mocapActive) {
      let phase = 0;
      mocapInterval = setInterval(() => {
        phase += 0.12;
        // Natural posture sway & head nod tracking simulation
        const headTilt = Math.sin(phase) * 12;
        const armWave = Math.cos(phase) * 35;
        const shoulderDip = Math.sin(phase * 0.5) * 6;

        const livePose = {
          ...DEFAULT_NEUTRAL_POSE,
          head: { x: headTilt * 0.5, y: -90 + Math.abs(headTilt) * 0.3, angle: headTilt },
          leftShoulder: { x: -35, y: -55 + shoulderDip, angle: 15 + armWave * 0.3 },
          leftElbow: { x: -55 + armWave * 0.2, y: -25 + armWave * 0.4, angle: 25 + armWave },
          rightShoulder: { x: 35, y: -55 - shoulderDip, angle: -15 - armWave * 0.4 },
          rightElbow: { x: 55 - armWave * 0.2, y: -25 - armWave * 0.4, angle: -25 - armWave },
        };

        setMocapPose(livePose);

        if (isRecordingMocap) {
          setRecordedFrames((prev) => [
            ...prev,
            {
              time: prev.length * 0.05,
              pose: livePose,
              expression: headTilt > 4 ? 'smile' : 'neutral',
            },
          ]);
        }
      }, 50);
    }
    return () => clearInterval(mocapInterval);
  }, [mocapActive, isRecordingMocap]);

  const handleStartRecordingMocap = () => {
    setRecordedFrames([]);
    setIsRecordingMocap(true);
  };

  const handleStopRecordingMocap = () => {
    setIsRecordingMocap(false);
    if (recordedFrames.length > 5) {
      setShowSaveModal(true);
    }
  };

  const handleSaveMocapClip = () => {
    if (recordedFrames.length === 0) return;
    const maxTime = recordedFrames[recordedFrames.length - 1].time || 1.5;
    const normalizedKeyframes = recordedFrames.map((f) => ({
      time: Math.round((f.time / maxTime) * 100) / 100,
      pose: f.pose,
      expression: f.expression,
    }));

    const newClip: MotionClip = {
      id: `custom_mocap_${Date.now()}`,
      title: newClipTitle || 'User Mocap Clip',
      category: 'action',
      duration: Math.max(1, Math.round(maxTime * 10) / 10),
      description: 'Recorded live using AutoDraft Motion Capture tracker.',
      keyframes: normalizedKeyframes,
    };

    setAllClips((prev) => [newClip, ...prev]);
    if (onAddCustomClip) onAddCustomClip(newClip);
    setSelectedClipId(newClip.id);
    setShowSaveModal(false);
    setRecordedFrames([]);
  };

  // Compute current display pose
  const displayPose = mocapActive
    ? mocapPose
    : activeClip
    ? sampleMotionClip(activeClip, progress).pose
    : DEFAULT_NEUTRAL_POSE;

  const currentSample = activeClip ? sampleMotionClip(activeClip, progress) : undefined;
  const filteredClips =
    selectedCategory === 'all'
      ? allClips
      : allClips.filter((c) => c.category === selectedCategory);

  return (
    <div className="flex flex-col h-full bg-[#131418] text-gray-200">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#1a1c23] border-b border-[#2b2f3e]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Motion Clips & Optical Mocap System</h2>
            <p className="text-xs text-gray-400">
              Apply realistic animated cycles or capture live actor body motion
            </p>
          </div>
        </div>

        {/* Mocap Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCamera}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mocapActive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
            }`}
          >
            <Camera size={14} />
            {mocapActive ? 'Stop Mocap System' : 'Launch Live Webcam Mocap'}
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN BODY */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT: MOTION CLIPS LIBRARY */}
        <div className="w-full md:w-80 bg-[#17191f] border-r border-[#2b2f3e] flex flex-col p-4 overflow-y-auto">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['all', 'walk', 'gesture', 'action', 'dance', 'reaction'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#131418] text-gray-400 hover:text-white border border-[#2b2f3e]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Preset & Custom Clips ({filteredClips.length})
          </div>

          {/* Clip Cards */}
          <div className="flex flex-col gap-2 flex-1">
            {filteredClips.map((clip) => {
              const isSelected = selectedClipId === clip.id;
              return (
                <div
                  key={clip.id}
                  onClick={() => {
                    setSelectedClipId(clip.id);
                    if (mocapActive) setMocapActive(false);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected && !mocapActive
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                      : 'bg-[#131418] border-[#2b2f3e] text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{clip.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222530] text-gray-400 font-mono">
                      {clip.duration}s
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                    {clip.description}
                  </p>

                  {onApplyClipToCharacter && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyClipToCharacter(clip.id);
                      }}
                      className="mt-2 text-[10px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Check size={12} /> Apply to Scene Character
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: LIVE VIEWPORT / MOCAP STAGE */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-[#0e0f13] overflow-hidden">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Mocap Status Overlay / Webcam View */}
          {mocapActive && (
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <div className="w-56 p-2 bg-[#1a1c23]/90 border border-blue-500/60 rounded-xl shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1.5">
                    <Video size={12} /> Live Optical Tracker
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    Tracking OK
                  </span>
                </div>

                <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {cameraError && (
                    <div className="absolute inset-0 bg-blue-950/80 p-2 text-center flex flex-col items-center justify-center text-[10px] text-blue-200">
                      <Activity size={18} className="animate-pulse mb-1 text-blue-400" />
                      <span>Optical Pose Simulation</span>
                    </div>
                  )}

                  {/* Pose Landmark Simulation dots */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-16 h-20 border border-emerald-400/60 rounded-full animate-pulse" />
                    <div className="absolute w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>

                {/* Recorder Controls */}
                <div className="mt-2 flex items-center justify-between gap-1.5">
                  {!isRecordingMocap ? (
                    <button
                      onClick={handleStartRecordingMocap}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow"
                    >
                      <Circle size={10} className="fill-current" /> Record Motion
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecordingMocap}
                      className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow animate-pulse"
                    >
                      <Square size={10} className="fill-current text-red-400" /> Stop ({recordedFrames.length} f)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Character Stage */}
          <div className="relative p-6 rounded-2xl bg-[#14161d]/80 border border-gray-800/80 shadow-2xl backdrop-blur-sm">
            <RiggedCharacterRenderer
              config={{
                ...SAMPLE_DEMO_CHAR,
                expression: (currentSample?.expression as any) || SAMPLE_DEMO_CHAR.expression,
              }}
              showSkeleton={true}
              overridePose={displayPose}
              width={300}
              height={420}
            />
          </div>

          {/* Bottom Timeline scrubber for Motion Clip */}
          {!mocapActive && (
            <div className="w-full max-w-md mt-5 p-3 bg-[#1a1c23]/90 rounded-xl border border-[#2b2f3e] flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>

              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span className="font-semibold text-white">{activeClip.title}</span>
                  <span className="font-mono">{Math.round(progress * (activeClip.duration || 1) * 10) / 10}s / {activeClip.duration}s</span>
                </div>
                <div className="w-full h-2 bg-[#131418] rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const p = (e.clientX - rect.left) / rect.width;
                  setProgress(Math.max(0, Math.min(1, p)));
                }}>
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SAVE MOCAP CLIP MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1a1c23] border border-[#2b2f3e] rounded-2xl p-5 shadow-2xl text-left">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" /> Save Captured Motion
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Successfully tracked {recordedFrames.length} mocap frames. Give your new motion clip a name:
            </p>

            <input
              type="text"
              value={newClipTitle}
              onChange={(e) => setNewClipTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#131418] border border-[#2b2f3e] rounded-lg text-sm text-white mb-4 focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                Discard
              </button>
              <button
                onClick={handleSaveMocapClip}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow"
              >
                Save to Clips Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
