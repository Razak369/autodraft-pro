import React, { useState, useEffect, useRef } from 'react';
import {
  CharacterConfig,
  CharacterViewAngle,
  BodyPartAngle,
  HeadStyle,
  HairStyle,
  FacialHair,
  ClothesStyle,
  Expression,
  EyeStyle,
  EyebrowStyle,
  NoseStyle,
  EarStyle,
  CustomExpressionData,
  HandPoseType,
  EyePoseType,
  FingerCurlState,
} from '../types/studio';
import { RiggedCharacterRenderer } from './RiggedCharacterRenderer';
import {
  DEFAULT_NEUTRAL_POSE,
  POSE_PRESETS,
  sampleMotionClip,
  MOTION_CLIPS_PRESETS,
} from '../utils/riggingLogic';
import {
  calculateTwoBoneIK,
  HAND_POSE_PRESETS,
  getHandPoseFingers,
  validateAndSanitizeCharacter,
} from '../utils/characterAssemblyLogic';
import {
  Bone,
  Download,
  FlipHorizontal,
  Play,
  Pause,
  Save,
  Undo2,
  Shirt,
  User,
  Smile,
  Eye,
  Check,
  Compass,
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Layers,
  Hand,
  RefreshCw,
  FolderOpen,
  Lock,
} from 'lucide-react';

interface CharacterRigStudioProps {
  initialCharacter?: CharacterConfig;
  onSaveCharacter: (char: CharacterConfig) => void;
  onClose?: () => void;
}

const DEFAULT_CHAR: CharacterConfig = {
  id: 'char_custom_' + Date.now(),
  name: 'New Custom Character',
  skinColor: '#d99763',
  viewAngle: 'front',
  headStyle: 'village_man',
  hairStyle: 'classic_fade',
  hairColor: '#1f2937',
  facialHair: 'thick_mustache',
  eyeStyle: 'almond_indian',
  eyeColor: '#1f2937',
  eyebrowStyle: 'thick_natural',
  noseStyle: 'classic_pointed',
  earStyle: 'round_normal',
  clothesStyle: 'lungi_shirt',
  shirtColor: '#10b981',
  bottomColor: '#93c5fd',
  expression: 'neutral',
  flipX: false,
  scale: 1,
  pose: { ...DEFAULT_NEUTRAL_POSE },
};

const SKIN_TONES = ['#fde68a', '#e5a575', '#d99763', '#be7845', '#9a5327', '#6b3715'];
const HAIR_COLORS = ['#111827', '#374151', '#78350f', '#9ca3af', '#f3f4f6', '#b45309'];
const EYE_COLORS = ['#1f2937', '#451a03', '#0369a1', '#059669', '#7c2d12'];
const SHIRT_COLORS = ['#10b981', '#3b82f6', '#f97316', '#ef4444', '#8b5cf6', '#ffffff', '#1f2937'];
const BOTTOM_COLORS = ['#93c5fd', '#fef3c7', '#ffffff', '#fbbf24', '#cbd5e1', '#374151', '#f472b6'];

const STORAGE_SAVED_EXPRESSIONS = 'autodraft_saved_expressions_v1';

export const CharacterRigStudio: React.FC<CharacterRigStudioProps> = ({
  initialCharacter,
  onSaveCharacter,
  onClose,
}) => {
  const [character, setCharacter] = useState<CharacterConfig>(initialCharacter || DEFAULT_CHAR);
  const [activeTab, setActiveTab] = useState<
    'assemble' | 'turnaround' | 'eyes' | 'hands' | 'clothes' | 'face_detail' | 'expressions' | 'rig'
  >('assemble');
  const [faceSubTab, setFaceSubTab] = useState<'eyes' | 'nose' | 'ear' | 'hair'>('eyes');

  const [skeletonMode, setSkeletonMode] = useState<boolean>(true);
  const [ikEnabled, setIkEnabled] = useState<boolean>(true);
  const [pinnedFeet, setPinnedFeet] = useState<boolean>(false);
  const [activeHandTarget, setActiveHandTarget] = useState<'left' | 'right' | 'both'>('both');
  const [isPlayingMotion, setIsPlayingMotion] = useState<boolean>(false);
  const [selectedMotionId, setSelectedMotionId] = useState<string>('village_walk');
  const [motionProgress, setMotionProgress] = useState<number>(0);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  // Hidden File Inputs Refs
  const charImportInputRef = useRef<HTMLInputElement>(null);
  const clothTextureInputRef = useRef<HTMLInputElement>(null);

  // Custom Expression Editor State
  const [customExpr, setCustomExpr] = useState<CustomExpressionData>({
    id: 'expr_temp',
    name: 'Custom Emotion',
    eyebrowHeight: 0,
    eyebrowTilt: 0,
    eyeScaleY: 1.0,
    mouthCurve: 0,
    mouthOpen: 0,
    blush: false,
    tears: false,
    sweatDrop: false,
  });

  const [savedExpressions, setSavedExpressions] = useState<CustomExpressionData[]>([]);
  const [newExprName, setNewExprName] = useState<string>('My Drama Anger');
  const [showSaveExprModal, setShowSaveExprModal] = useState<boolean>(false);

  // Load user's saved expressions from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_EXPRESSIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSavedExpressions(parsed);
      }
    } catch {}
  }, []);

  // Motion preview loop
  useEffect(() => {
    let animId: number;
    if (isPlayingMotion) {
      let start = performance.now();
      const clip = MOTION_CLIPS_PRESETS.find((c) => c.id === selectedMotionId) || MOTION_CLIPS_PRESETS[0];
      const durationMs = (clip.duration || 1.5) * 1000;

      const loop = (now: number) => {
        const elapsed = (now - start) % durationMs;
        setMotionProgress(elapsed / durationMs);
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    } else {
      setMotionProgress(0);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlayingMotion, selectedMotionId]);

  // Real-time 2-Bone Analytical IK Solver on Drag
  const handleJointMove = (jointName: string, newX: number, newY: number) => {
    setCharacter((prev) => {
      const updatedPose = {
        ...prev.pose,
        [jointName]: {
          ...(prev.pose[jointName] || DEFAULT_NEUTRAL_POSE[jointName] || { x: 0, y: 0, angle: 0 }),
          x: newX,
          y: newY,
        },
      };

      if (ikEnabled) {
        // Analytical 2-bone arm IK
        if (jointName === 'leftHand') {
          const shoulder = updatedPose.leftShoulder || DEFAULT_NEUTRAL_POSE.leftShoulder;
          const sol = calculateTwoBoneIK(shoulder, { x: newX, y: newY }, 35, 35, true);
          updatedPose.leftElbow = { x: Math.round(sol.joint2.x), y: Math.round(sol.joint2.y), angle: Math.round(sol.angle1) };
        } else if (jointName === 'rightHand') {
          const shoulder = updatedPose.rightShoulder || DEFAULT_NEUTRAL_POSE.rightShoulder;
          const sol = calculateTwoBoneIK(shoulder, { x: newX, y: newY }, 35, 35, false);
          updatedPose.rightElbow = { x: Math.round(sol.joint2.x), y: Math.round(sol.joint2.y), angle: Math.round(sol.angle1) };
        }
        // Analytical 2-bone leg IK
        else if (jointName === 'leftFoot' && !pinnedFeet) {
          const hip = updatedPose.leftHip || DEFAULT_NEUTRAL_POSE.leftHip;
          const sol = calculateTwoBoneIK(hip, { x: newX, y: newY }, 40, 40, true);
          updatedPose.leftKnee = { x: Math.round(sol.joint2.x), y: Math.round(sol.joint2.y), angle: Math.round(sol.angle1) };
        } else if (jointName === 'rightFoot' && !pinnedFeet) {
          const hip = updatedPose.rightHip || DEFAULT_NEUTRAL_POSE.rightHip;
          const sol = calculateTwoBoneIK(hip, { x: newX, y: newY }, 40, 40, false);
          updatedPose.rightKnee = { x: Math.round(sol.joint2.x), y: Math.round(sol.joint2.y), angle: Math.round(sol.angle1) };
        }
      }

      return {
        ...prev,
        pose: updatedPose,
      };
    });
  };

  // Character File Import Handler (JSON / SVG / PNG)
  const handleImportCharacterFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const sanitized = validateAndSanitizeCharacter(parsed);
          setCharacter(sanitized);
          setSavedToast(true);
          setTimeout(() => setSavedToast(false), 2000);
        } catch (err) {
          console.error('Failed to parse character JSON', err);
        }
      };
      reader.readAsText(file);
    } else {
      // SVG or Image Avatar
      const reader = new FileReader();
      reader.onload = (event) => {
        setCharacter((prev) => ({
          ...prev,
          name: file.name.replace(/\.[^/.]+$/, ''),
          importedSvgData: event.target?.result as string,
        }));
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cloth Texture Upload Handler
  const handleClothTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCharacter((prev) => ({
        ...prev,
        customClothesTextureUrl: dataUrl,
        clothingConfig: {
          id: `cloth_${Date.now()}`,
          name: 'Custom Imported Outfit',
          style: prev.clothesStyle,
          primaryColor: prev.shirtColor,
          textureUrl: dataUrl,
          pattern: 'bandhani',
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  // Randomize Modular Parts
  const handleRandomizeAssembly = () => {
    const heads: HeadStyle[] = ['village_man', 'village_elder', 'priest', 'village_woman', 'modern_boy', 'grandma', 'farmer', 'scholar'];
    const hairs: HairStyle[] = ['classic_fade', 'village_turban', 'priest_topknot', 'curly_black', 'elder_white', 'women_braid', 'rajasthani_pagri'];
    const clothes: ClothesStyle[] = ['dhoti_kurta', 'lungi_shirt', 'saree', 'farmer_vest', 'modern_jeans', 'royal_kurta', 'jacket_denim'];
    const eyeStyles: EyeStyle[] = ['almond_indian', 'wide_cartoon', 'sharp_focused', 'elderly_droopy'];
    const facialHairs: FacialHair[] = ['none', 'thick_mustache', 'rajput_curled', 'elder_white_beard'];

    const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    setCharacter((prev) => ({
      ...prev,
      headStyle: rand(heads),
      hairStyle: rand(hairs),
      clothesStyle: rand(clothes),
      eyeStyle: rand(eyeStyles),
      facialHair: rand(facialHairs),
      skinColor: rand(SKIN_TONES),
      shirtColor: rand(SHIRT_COLORS),
      bottomColor: rand(BOTTOM_COLORS),
    }));
  };

  const handleApplyPresetPose = (presetKey: string) => {
    const preset = POSE_PRESETS[presetKey];
    if (preset) {
      setCharacter((prev) => ({
        ...prev,
        pose: { ...preset.joints },
      }));
    }
  };

  const handleResetPose = () => {
    setCharacter((prev) => ({
      ...prev,
      pose: { ...DEFAULT_NEUTRAL_POSE },
    }));
  };

  const handleSave = () => {
    onSaveCharacter({
      ...character,
      customExpression: customExpr,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleExportSVG = () => {
    const jsonStr = JSON.stringify(character, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name.toLowerCase().replace(/\s+/g, '_')}_rig.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveCustomExpression = () => {
    if (!newExprName.trim()) return;
    const toSave: CustomExpressionData = {
      ...customExpr,
      id: `expr_${Date.now()}`,
      name: newExprName.trim(),
    };
    const updated = [toSave, ...savedExpressions];
    setSavedExpressions(updated);
    localStorage.setItem(STORAGE_SAVED_EXPRESSIONS, JSON.stringify(updated));
    setShowSaveExprModal(false);
  };

  const handleDeleteSavedExpression = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedExpressions.filter((x) => x.id !== id);
    setSavedExpressions(updated);
    localStorage.setItem(STORAGE_SAVED_EXPRESSIONS, JSON.stringify(updated));
  };

  // Preview pose if motion playing
  const previewClip = MOTION_CLIPS_PRESETS.find((c) => c.id === selectedMotionId);
  const animatedPose = isPlayingMotion && previewClip ? sampleMotionClip(previewClip, motionProgress).pose : undefined;

  return (
    <div className="flex flex-col h-full bg-[#131418] text-gray-200">
      {/* TOP ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#1a1c23] border-b border-[#2b2f3e]">
        {/* Navigation Tabs */}
        <div className="flex bg-[#131418] p-1 rounded-lg border border-[#2b2f3e] overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('assemble')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'assemble' ? 'bg-[#2563eb] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            Modular Parts Assembler
          </button>
          <button
            onClick={() => setActiveTab('eyes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'eyes' ? 'bg-[#2563eb] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye size={14} />
            Eye Poses & Gaze
          </button>
          <button
            onClick={() => setActiveTab('hands')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'hands' ? 'bg-[#2563eb] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Hand size={14} />
            Hand Actions & Fingers
          </button>
          <button
            onClick={() => setActiveTab('turnaround')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'turnaround' ? 'bg-[#2563eb] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Compass size={14} />
            Turnaround Angles
          </button>
          <button
            onClick={() => setActiveTab('clothes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'clothes' ? 'bg-[#2563eb] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shirt size={14} />
            Clothes & Outfits
          </button>
          <button
            onClick={() => setActiveTab('face_detail')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'face_detail' ? 'bg-[#2563eb] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User size={14} />
            Face Anatomy
          </button>
          <button
            onClick={() => setActiveTab('expressions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'expressions' ? 'bg-[#2563eb] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smile size={14} />
            Emotions
          </button>
          <button
            onClick={() => setActiveTab('rig')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'rig' ? 'bg-[#2563eb] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bone size={14} />
            Advanced Rig & IK
          </button>
        </div>

        {/* Studio Controls */}
        <div className="flex items-center gap-2">
          {/* Hidden File Input for Character Import */}
          <input
            ref={charImportInputRef}
            type="file"
            accept=".json,.svg,.png"
            className="hidden"
            onChange={handleImportCharacterFile}
          />
          {/* Hidden File Input for Cloth Texture Import */}
          <input
            ref={clothTextureInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleClothTextureUpload}
          />

          {/* Import Character Button */}
          <button
            onClick={() => charImportInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#222530] hover:bg-[#2b2f3e] text-blue-400 rounded-md text-xs font-semibold border border-blue-500/30 transition-colors"
            title="Import Character (.json / .svg / .png)"
          >
            <Upload size={14} />
            <span>Import</span>
          </button>

          {/* IK Solver Switch */}
          <button
            onClick={() => setIkEnabled(!ikEnabled)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              ikEnabled ? 'bg-purple-600/30 text-purple-300 border-purple-500/50' : 'bg-[#222530] text-gray-400 border-[#2b2f3e]'
            }`}
            title="Toggle 2-Bone Inverse Kinematics"
          >
            <span>IK:</span>
            <span className={ikEnabled ? 'text-purple-300 font-bold' : 'text-gray-400'}>{ikEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Skeleton mode switch */}
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#222530] hover:bg-[#2b2f3e] rounded-md text-xs cursor-pointer border border-[#2b2f3e]">
            <Bone size={14} className={skeletonMode ? 'text-blue-400' : 'text-gray-400'} />
            <span className="font-medium">Skeleton</span>
            <input
              type="checkbox"
              checked={skeletonMode}
              onChange={(e) => setSkeletonMode(e.target.checked)}
              className="accent-blue-500 w-3.5 h-3.5 rounded"
            />
          </label>

          {/* Flip Horizontal */}
          <button
            onClick={() => setCharacter((prev) => ({ ...prev, flipX: !prev.flipX }))}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border border-[#2b2f3e] transition-colors ${
              character.flipX ? 'bg-blue-600/30 text-blue-400 border-blue-500/50' : 'bg-[#222530] hover:bg-[#2b2f3e] text-gray-300'
            }`}
            title="Flip Character"
          >
            <FlipHorizontal size={14} />
            Flip
          </button>

          {/* Reset Pose */}
          <button
            onClick={handleResetPose}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#222530] hover:bg-[#2b2f3e] text-gray-300 rounded-md text-xs border border-[#2b2f3e]"
            title="Reset Pose"
          >
            <Undo2 size={14} />
          </button>

          {/* Motion Preview button */}
          <button
            onClick={() => setIsPlayingMotion(!isPlayingMotion)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isPlayingMotion ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlayingMotion ? <Pause size={14} /> : <Play size={14} />}
            {isPlayingMotion ? 'Stop' : 'Test Motion'}
          </button>

          {/* Export */}
          <button
            onClick={handleExportSVG}
            className="p-1.5 bg-[#222530] hover:bg-[#2b2f3e] text-gray-300 rounded-md text-xs border border-[#2b2f3e]"
            title="Export Character Rig JSON"
          >
            <Download size={14} />
          </button>

          {/* Save Character */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-md shadow-blue-900/30 transition-all"
          >
            {savedToast ? <Check size={14} className="text-emerald-300" /> : <Save size={14} />}
            {savedToast ? 'Saved!' : 'Save Character'}
          </button>

          {onClose && (
            <button onClick={onClose} className="px-2 py-1.5 text-xs text-gray-400 hover:text-white">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PALETTE PANEL */}
        <div className="w-full md:w-88 border-r border-[#2b2f3e] bg-[#17191f] overflow-y-auto p-4 flex flex-col gap-5">
          {/* Character Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Character Name</label>
            <input
              type="text"
              value={character.name}
              onChange={(e) => setCharacter((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-1.5 bg-[#131418] border border-[#2b2f3e] rounded-md text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* ================= TAB 0: MODULAR BODY PARTS ASSEMBLER ================= */}
          {activeTab === 'assemble' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                    Modular Body Parts Assembler
                  </span>
                  <span className="text-[11px] text-gray-400">Combine & attach separate parts to build characters</span>
                </div>
                <button
                  onClick={handleRandomizeAssembly}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#222530] hover:bg-[#2b2f3e] text-blue-400 rounded-md text-xs border border-blue-500/30 transition-colors"
                  title="Randomize Body Parts Mix"
                >
                  <RefreshCw size={12} />
                  <span>Random Mix</span>
                </button>
              </div>

              {/* Quick Import Card */}
              <div className="p-3 bg-gradient-to-r from-blue-950/40 to-purple-950/40 border border-blue-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-300">Import Character / Parts</div>
                  <div className="text-[10px] text-gray-400">Upload JSON rig or SVG body parts</div>
                </div>
                <button
                  onClick={() => charImportInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow"
                >
                  <Upload size={13} />
                  <span>Browse File</span>
                </button>
              </div>

              {/* 1. Head & Face Structure */}
              <div>
                <span className="text-xs font-semibold text-gray-300 block mb-2">1. Head & Face Archetype</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'village_man', label: 'Village Man (गाँव का आदमी)' },
                    { id: 'village_elder', label: 'Village Elder (बुजुर्ग दादा)' },
                    { id: 'priest', label: 'Priest (पंडित जी)' },
                    { id: 'village_woman', label: 'Village Woman (गाँव की दीदी)' },
                    { id: 'modern_boy', label: 'Modern Youth (युवा)' },
                    { id: 'grandma', label: 'Grandmother (दादी माँ)' },
                    { id: 'farmer', label: 'Farmer (किसान भाई)' },
                    { id: 'scholar', label: 'Scholar (विद्वान)' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setCharacter((prev) => ({ ...prev, headStyle: h.id as HeadStyle }))}
                      className={`p-2 text-xs rounded-lg border text-left transition-all ${
                        character.headStyle === h.id
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                          : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Hair & Headwear */}
              <div>
                <span className="text-xs font-semibold text-gray-300 block mb-2">2. Hair & Turban / Pagdi</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'classic_fade', label: 'Classic Short Hair' },
                    { id: 'village_turban', label: 'Village Pagdi (पगड़ी)' },
                    { id: 'priest_topknot', label: 'Topknot (शिखा)' },
                    { id: 'women_braid', label: 'Long Braid (लंबी चोटी)' },
                    { id: 'curly_black', label: 'Curly Black Hair' },
                    { id: 'elder_white', label: 'Elder White Hair' },
                  ].map((hair) => (
                    <button
                      key={hair.id}
                      onClick={() => setCharacter((prev) => ({ ...prev, hairStyle: hair.id as HairStyle }))}
                      className={`p-2 text-xs rounded-lg border text-left transition-all ${
                        character.hairStyle === hair.id
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                          : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                      }`}
                    >
                      {hair.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Upper Body / Torso & Shirt */}
              <div>
                <span className="text-xs font-semibold text-gray-300 block mb-2">3. Torso & Upper Garment</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'dhoti_kurta', label: 'Traditional Kurta' },
                    { id: 'lungi_shirt', label: 'Rural Shirt' },
                    { id: 'farmer_vest', label: 'Farmer Vest (बनियान)' },
                    { id: 'jacket_denim', label: 'Denim Jacket' },
                    { id: 'royal_kurta', label: 'Royal Brocade Kurta' },
                    { id: 'saree', label: 'Traditional Saree' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCharacter((prev) => ({ ...prev, clothesStyle: c.id as ClothesStyle }))}
                      className={`p-2 text-xs rounded-lg border text-left transition-all ${
                        character.clothesStyle === c.id
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                          : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Skin Complexion */}
              <div>
                <span className="text-xs font-semibold text-gray-300 block mb-2">Skin Complexion</span>
                <div className="flex items-center gap-2">
                  {SKIN_TONES.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCharacter((prev) => ({ ...prev, skinColor: color }))}
                      className={`w-7 h-7 rounded-full transition-transform border-2 ${
                        character.skinColor === color ? 'scale-115 border-white shadow-md' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: EYE POSES & GAZE DIRECTION STUDIO ================= */}
          {activeTab === 'eyes' && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1">
                  Eye Expression Poses (आँखों के पोज़)
                </span>
                <p className="text-[11px] text-gray-400 mb-3">
                  Select eye poses, eyelid openness, and gaze directions:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'neutral', label: 'Normal Open (सामान्य)', icon: '👁️' },
                    { id: 'blink', label: 'Blink / Closed (पलक बंद)', icon: '😌' },
                    { id: 'happy_squint', label: 'Happy Squint (हँसी)', icon: '😄' },
                    { id: 'angry_glare', label: 'Angry Glare (गुस्सा)', icon: '😠' },
                    { id: 'wide_shock', label: 'Wide Shock (हैरानी)', icon: '😲' },
                    { id: 'crying_tears', label: 'Crying Tears (आँसू)', icon: '😭' },
                    { id: 'wink_left', label: 'Wink Left (बाईं आँख)', icon: '😉' },
                    { id: 'wink_right', label: 'Wink Right (दाईं आँख)', icon: '😜' },
                    { id: 'look_up', label: 'Look Up (ऊपर देखना)', icon: '🙄' },
                    { id: 'look_down', label: 'Look Down (नीचे देखना)', icon: '👇' },
                    { id: 'look_left', label: 'Look Left (बाएं देखना)', icon: '👈' },
                    { id: 'look_right', label: 'Look Right (दाएं देखना)', icon: '👉' },
                    { id: 'dazed', label: 'Dazed / Shocked', icon: '😵' },
                  ].map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => setCharacter((prev) => ({ ...prev, eyePose: ep.id as EyePoseType }))}
                      className={`p-2.5 text-xs rounded-lg border text-left transition-all flex items-center justify-between ${
                        (character.eyePose || 'neutral') === ep.id
                          ? 'bg-blue-600/20 border-blue-500 text-white font-medium shadow'
                          : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{ep.icon}</span>
                        <span>{ep.label}</span>
                      </div>
                      {(character.eyePose || 'neutral') === ep.id && <Check size={13} className="text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine Gaze & Pupil Control */}
              <div className="pt-3 border-t border-[#2b2f3e] flex flex-col gap-3">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                  Fine Gaze & Eyelid Sliders
                </span>

                {/* Eyelid Openness */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Eyelid Scale / Openness</span>
                    <span className="text-blue-400">{(customExpr.eyeScaleY * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.5"
                    step="0.05"
                    value={customExpr.eyeScaleY}
                    onChange={(e) => setCustomExpr((prev) => ({ ...prev, eyeScaleY: parseFloat(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Eyebrow Height */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Eyebrow Height</span>
                    <span className="text-blue-400">{customExpr.eyebrowHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={customExpr.eyebrowHeight}
                    onChange={(e) => setCustomExpr((prev) => ({ ...prev, eyebrowHeight: parseInt(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Eyebrow Tilt */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Eyebrow Tilt / Angle</span>
                    <span className="text-blue-400">{customExpr.eyebrowTilt}°</span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="1"
                    value={customExpr.eyebrowTilt}
                    onChange={(e) => setCustomExpr((prev) => ({ ...prev, eyebrowTilt: parseInt(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Eye Color */}
                <div>
                  <span className="text-xs font-semibold text-gray-300 block mb-2">Iris Eye Color</span>
                  <div className="flex items-center gap-2">
                    {EYE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCharacter((prev) => ({ ...prev, eyeColor: color }))}
                        className={`w-7 h-7 rounded-full transition-transform border-2 ${
                          (character.eyeColor || '#1f2937') === color
                            ? 'scale-115 border-white shadow'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: HAND ACTIONS & FINGERS STUDIO ================= */}
          {activeTab === 'hands' && (
            <div className="flex flex-col gap-4">
              {/* Target Hand Toggle */}
              <div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Target Hand (हाथ चुनें)
                </span>
                <div className="flex bg-[#131418] p-1 rounded-lg border border-[#2b2f3e]">
                  {(['both', 'left', 'right'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveHandTarget(t)}
                      className={`flex-1 py-1.5 rounded text-xs font-semibold uppercase transition-colors ${
                        activeHandTarget === t ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t === 'both' ? 'Both Hands' : t === 'left' ? 'Left Hand' : 'Right Hand'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hand Action Presets */}
              <div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Hand Poses (हाथ के एक्शन)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'open_palm', label: 'Open Palm (खुला हाथ)', icon: '✋' },
                    { id: 'fist', label: 'Closed Fist (मुक्का)', icon: '✊' },
                    { id: 'point', label: 'Point Index (इशारा)', icon: '👉' },
                    { id: 'namaste', label: 'Namaste (प्रणाम)', icon: '🙏' },
                    { id: 'thumbs_up', label: 'Thumbs Up (शाबाश)', icon: '👍' },
                    { id: 'peace', label: 'Peace / Victory', icon: '✌️' },
                    { id: 'grip_lathi', label: 'Lathi Grip (लाठी पकड़)', icon: '🪵' },
                    { id: 'pinch', label: 'Pinch / Mudra (मुद्रा)', icon: '👌' },
                    { id: 'relaxed', label: 'Relaxed (सामान्य)', icon: '🖐️' },
                    { id: 'stop_palm', label: 'Stop Sign (रुकें)', icon: '🛑' },
                  ].map((hp) => (
                    <button
                      key={hp.id}
                      onClick={() => {
                        const pose = hp.id as HandPoseType;
                        const defaultCurls = HAND_POSE_PRESETS[pose];
                        setCharacter((prev) => {
                          const updated = { ...prev };
                          if (activeHandTarget === 'left' || activeHandTarget === 'both') {
                            updated.leftHandPose = pose;
                            updated.fingerCurls = {
                              ...(updated.fingerCurls || {}),
                              left: { ...defaultCurls },
                            };
                          }
                          if (activeHandTarget === 'right' || activeHandTarget === 'both') {
                            updated.rightHandPose = pose;
                            updated.fingerCurls = {
                              ...(updated.fingerCurls || {}),
                              right: { ...defaultCurls },
                            };
                          }
                          return updated;
                        });
                      }}
                      className="p-2 text-xs rounded-lg border bg-[#131418] border-[#2b2f3e] hover:border-blue-500 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <span>{hp.icon}</span>
                      <span className="truncate">{hp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5-Finger Curl Articulation Sliders */}
              <div className="pt-3 border-t border-[#2b2f3e] flex flex-col gap-3">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                  Individual Finger Curl (उंगलियों का मोड़)
                </span>

                {(['thumb', 'index', 'middle', 'ring', 'pinky'] as const).map((finger) => {
                  const currentCurl =
                    character.fingerCurls?.left?.[finger] ??
                    character.fingerCurls?.right?.[finger] ??
                    0;

                  return (
                    <div key={finger}>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span className="capitalize font-medium">{finger} Finger</span>
                        <span className="text-blue-400">{currentCurl}% curled</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={currentCurl}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setCharacter((prev) => {
                            const curls = { ...(prev.fingerCurls || {}) };
                            if (activeHandTarget === 'left' || activeHandTarget === 'both') {
                              curls.left = { ...(curls.left || {}), [finger]: val };
                            }
                            if (activeHandTarget === 'right' || activeHandTarget === 'both') {
                              curls.right = { ...(curls.right || {}), [finger]: val };
                            }
                            return { ...prev, fingerCurls: curls };
                          });
                        }}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 1: TURNAROUND ANGLES ================= */}
          {activeTab === 'turnaround' && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Perspective Turnaround Angle
                </span>
                <p className="text-[11px] text-gray-400 mb-3">
                  Rotate character head & body between 5 standard cartoon studio production angles:
                </p>

                <div className="flex flex-col gap-2">
                  {[
                    { id: 'front', label: 'Front (0°)', desc: 'Standard frontal dialogue view' },
                    { id: 'three_quarter_front', label: '3/4 Front (45°)', desc: 'Natural cinematic angle' },
                    { id: 'profile', label: 'Profile (90°)', desc: 'Side walk cycle & silhouette' },
                    { id: 'three_quarter_back', label: '3/4 Back (135°)', desc: 'Over-the-shoulder conversation' },
                    { id: 'back', label: 'Back (180°)', desc: 'Full rear walking away view' },
                  ].map((ang) => (
                    <button
                      key={ang.id}
                      onClick={() => setCharacter((prev) => ({ ...prev, viewAngle: ang.id as CharacterViewAngle }))}
                      className={`p-3 text-xs rounded-xl border text-left transition-all flex items-center justify-between ${
                        (character.viewAngle || 'front') === ang.id
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                          : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:border-gray-500 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{ang.label}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{ang.desc}</div>
                      </div>
                      {(character.viewAngle || 'front') === ang.id && (
                        <Check size={14} className="text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div className="pt-2 border-t border-[#2b2f3e]">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Skin Complexion
                </span>
                <div className="flex items-center gap-2">
                  {SKIN_TONES.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCharacter((prev) => ({ ...prev, skinColor: color }))}
                      className={`w-7 h-7 rounded-full transition-transform border-2 ${
                        character.skinColor === color ? 'scale-115 border-white shadow-md' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: DETAILED FACE (EYES, NOSE, EARS, HAIR) ================= */}
          {activeTab === 'face_detail' && (
            <div className="flex flex-col gap-4">
              {/* Sub-tabs */}
              <div className="flex bg-[#131418] p-1 rounded-lg border border-[#2b2f3e]">
                {(['eyes', 'nose', 'ear', 'hair'] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setFaceSubTab(sub)}
                    className={`flex-1 py-1.5 rounded text-xs font-semibold uppercase transition-colors ${
                      faceSubTab === sub ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* EYES SUBTAB */}
              {faceSubTab === 'eyes' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-300 block mb-2">Eye Shape & Style</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'almond_indian', label: 'Almond Indian' },
                        { id: 'wide_cartoon', label: 'Wide Cartoon' },
                        { id: 'sharp_focused', label: 'Sharp Focused' },
                        { id: 'elderly_droopy', label: 'Elder Droopy' },
                        { id: 'closed_peaceful', label: 'Peaceful Closed' },
                        { id: 'wink', label: 'Playful Wink' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCharacter((prev) => ({ ...prev, eyeStyle: item.id as EyeStyle }))}
                          className={`p-2 text-xs rounded-lg border text-left ${
                            (character.eyeStyle || 'almond_indian') === item.id
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                              : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-300 block mb-2">Eye Iris Color</span>
                    <div className="flex items-center gap-2">
                      {EYE_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCharacter((prev) => ({ ...prev, eyeColor: color }))}
                          className={`w-7 h-7 rounded-full transition-transform border-2 ${
                            (character.eyeColor || '#1f2937') === color
                              ? 'scale-115 border-white shadow'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-300 block mb-2">Eyebrow Style</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'thick_natural', label: 'Thick Natural' },
                        { id: 'sharp_angled', label: 'Sharp Angled' },
                        { id: 'bushy_elder', label: 'Bushy Elder' },
                        { id: 'thin_groomed', label: 'Thin Groomed' },
                      ].map((eb) => (
                        <button
                          key={eb.id}
                          onClick={() => setCharacter((prev) => ({ ...prev, eyebrowStyle: eb.id as EyebrowStyle }))}
                          className={`p-2 text-xs rounded-lg border text-left ${
                            (character.eyebrowStyle || 'thick_natural') === eb.id
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                              : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                          }`}
                        >
                          {eb.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NOSE SUBTAB */}
              {faceSubTab === 'nose' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold text-gray-300 block mb-1">Nose Structure & Piercing</span>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'classic_pointed', label: 'Classic Pointed Nose', desc: 'Versatile sharp cartoon nose' },
                      { id: 'broad_village', label: 'Broad Earthy Village Nose', desc: 'Prominent nostrils & bridge' },
                      { id: 'button_round', label: 'Button Round Nose', desc: 'Soft friendly rounded profile' },
                      { id: 'sharp_aquiline', label: 'Aquiline / Rajput Regal Nose', desc: 'Commanding curved bridge' },
                      { id: 'nath_pierced', label: 'Traditional Nath (Gold Nose Ring)', desc: 'Indian festive bridal ornament' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCharacter((prev) => ({ ...prev, noseStyle: item.id as NoseStyle }))}
                        className={`p-2.5 text-xs rounded-lg border text-left transition-all ${
                          (character.noseStyle || 'classic_pointed') === item.id
                            ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                            : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-[10px] text-gray-400">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EAR SUBTAB */}
              {faceSubTab === 'ear' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold text-gray-300 block mb-1">Ear Anatomy & Ornaments</span>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'round_normal', label: 'Standard Round Ear', desc: 'Balanced anatomical proportions' },
                      { id: 'earring_gold', label: 'Gold Kundan / Bali Earring', desc: 'Traditional golden stud earring' },
                      { id: 'large_elder', label: 'Large Elder Ears', desc: 'Longer lobes for village panchayat elders' },
                      { id: 'small_tucked', label: 'Small Tucked Ears', desc: 'Subtle neat youth profile' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCharacter((prev) => ({ ...prev, earStyle: item.id as EarStyle }))}
                        className={`p-2.5 text-xs rounded-lg border text-left transition-all ${
                          (character.earStyle || 'round_normal') === item.id
                            ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                            : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-[10px] text-gray-400">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* HAIR SUBTAB */}
              {faceSubTab === 'hair' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-300 block mb-2">Hairstyle / Pagdi</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'classic_fade', label: 'Classic Short' },
                        { id: 'village_turban', label: 'Village Pagdi' },
                        { id: 'priest_topknot', label: 'Pandit Topknot' },
                        { id: 'women_braid', label: 'Traditional Braid' },
                      ].map((hair) => (
                        <button
                          key={hair.id}
                          onClick={() => setCharacter((prev) => ({ ...prev, hairStyle: hair.id as HairStyle }))}
                          className={`p-2 text-xs rounded-lg border text-left ${
                            character.hairStyle === hair.id
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                              : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                          }`}
                        >
                          {hair.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-300 block mb-2">Hair Color</span>
                    <div className="flex items-center gap-2">
                      {HAIR_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCharacter((prev) => ({ ...prev, hairColor: color }))}
                          className={`w-7 h-7 rounded-full transition-transform border-2 ${
                            (character.hairColor || '#1f2937') === color
                              ? 'scale-115 border-white shadow'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-300 block mb-2">Mustache & Beard</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'thick_mustache', label: 'Thick Mustache' },
                        { id: 'rajput_curled', label: 'Rajputi Curled' },
                        { id: 'elder_white_beard', label: 'Elder Beard' },
                        { id: 'none', label: 'Clean Shaven' },
                      ].map((fh) => (
                        <button
                          key={fh.id}
                          onClick={() => setCharacter((prev) => ({ ...prev, facialHair: fh.id as FacialHair }))}
                          className={`p-2 text-xs rounded-lg border text-left ${
                            character.facialHair === fh.id
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                              : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                          }`}
                        >
                          {fh.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: ADVANCED EXPRESSIONS & EMOTION EDITOR ================= */}
          {activeTab === 'expressions' && (
            <div className="flex flex-col gap-5">
              {/* Emotion Presets */}
              <div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Instant Emotion Presets
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'happy', label: 'Happy 😊' },
                    { id: 'sad', label: 'Sad 😢' },
                    { id: 'angry', label: 'Angry 😠' },
                    { id: 'shocked', label: 'Shocked 😲' },
                    { id: 'crying', label: 'Crying 😭' },
                    { id: 'laughing', label: 'Laughing 😂' },
                    { id: 'smug', label: 'Smug 😏' },
                    { id: 'scared', label: 'Scared 😨' },
                    { id: 'talking', label: 'Talking 🗣️' },
                    { id: 'smile', label: 'Smile 🙂' },
                    { id: 'wink', label: 'Wink 😉' },
                    { id: 'neutral', label: 'Neutral 😐' },
                  ].map((exp) => (
                    <button
                      key={exp.id}
                      onClick={() => {
                        setCharacter((prev) => ({ ...prev, expression: exp.id as Expression }));
                        // sync customExpr curves
                        setCustomExpr((prev) => ({
                          ...prev,
                          mouthCurve: exp.id === 'happy' || exp.id === 'smile' ? 8 : exp.id === 'sad' || exp.id === 'crying' ? -8 : 0,
                          mouthOpen: exp.id === 'talking' || exp.id === 'laughing' ? 12 : exp.id === 'shocked' ? 16 : 0,
                          tears: exp.id === 'crying',
                          blush: exp.id === 'happy' || exp.id === 'laughing',
                          sweatDrop: exp.id === 'scared',
                        }));
                      }}
                      className={`p-2 text-xs rounded-lg border text-center transition-all ${
                        character.expression === exp.id
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                          : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:text-white'
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE CUSTOM EXPRESSION SLIDERS */}
              <div className="p-3.5 bg-[#131418] rounded-xl border border-[#2b2f3e] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders size={13} className="text-blue-400" /> Fine-Tune Facial Sliders
                  </span>
                  <button
                    onClick={() => setShowSaveExprModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded text-[11px] font-semibold"
                  >
                    <Plus size={11} /> Save Expression
                  </button>
                </div>

                {/* Eyebrow Height */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Eyebrow Raise</span>
                    <span className="font-mono">{customExpr.eyebrowHeight}</span>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="1"
                    value={customExpr.eyebrowHeight}
                    onChange={(e) => setCustomExpr((prev) => ({ ...prev, eyebrowHeight: parseInt(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Eyebrow Tilt */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Eyebrow Tilt (Anger / Sad)</span>
                    <span className="font-mono">{customExpr.eyebrowTilt}°</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={customExpr.eyebrowTilt}
                    onChange={(e) => setCustomExpr((prev) => ({ ...prev, eyebrowTilt: parseInt(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Eye Open/Squint */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Eye Squint / Open Scale</span>
                    <span className="font-mono">{customExpr.eyeScaleY}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1.5"
                    step="0.1"
                    value={customExpr.eyeScaleY}
                    onChange={(e) => setCustomExpr((prev) => ({ ...prev, eyeScaleY: parseFloat(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Mouth Smile / Frown Curve */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Mouth Smile (+) / Frown (-)</span>
                    <span className="font-mono">{customExpr.mouthCurve}</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={customExpr.mouthCurve}
                    onChange={(e) => setCustomExpr((prev) => ({ ...prev, mouthCurve: parseInt(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Mouth Open Height */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Mouth Opening (Talk/Gasp)</span>
                    <span className="font-mono">{customExpr.mouthOpen}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="18"
                    step="1"
                    value={customExpr.mouthOpen}
                    onChange={(e) => setCustomExpr((prev) => ({ ...prev, mouthOpen: parseInt(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Overlays: Blush, Tears, Sweat */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customExpr.blush || false}
                      onChange={(e) => setCustomExpr((p) => ({ ...p, blush: e.target.checked }))}
                      className="accent-pink-500 rounded"
                    />
                    <span>Blush</span>
                  </label>

                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customExpr.tears || false}
                      onChange={(e) => setCustomExpr((p) => ({ ...p, tears: e.target.checked }))}
                      className="accent-blue-500 rounded"
                    />
                    <span>Tears</span>
                  </label>

                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customExpr.sweatDrop || false}
                      onChange={(e) => setCustomExpr((p) => ({ ...p, sweatDrop: e.target.checked }))}
                      className="accent-cyan-500 rounded"
                    />
                    <span>Sweat</span>
                  </label>
                </div>
              </div>

              {/* USER'S SAVED CUSTOM EXPRESSIONS LIBRARY */}
              {savedExpressions.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                    My Saved Expressions ({savedExpressions.length})
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {savedExpressions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setCustomExpr(item);
                        }}
                        className="px-3 py-2 bg-[#131418] hover:bg-[#222530] border border-[#2b2f3e] rounded-lg text-xs flex items-center justify-between cursor-pointer group"
                      >
                        <span className="font-semibold text-white">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500">Apply</span>
                          <button
                            onClick={(e) => handleDeleteSavedExpression(item.id, e)}
                            className="text-gray-500 hover:text-red-400 p-0.5"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: CLOTHES & OUTFITS ================= */}
          {activeTab === 'clothes' && (
            <div className="flex flex-col gap-4">
              {/* Custom Texture / Fabric Upload Card */}
              <div className="p-3 bg-gradient-to-r from-emerald-950/40 to-blue-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-300">Import Cloth Texture / SVG</div>
                  <div className="text-[10px] text-gray-400">
                    {character.customClothesTextureUrl ? 'Custom texture applied' : 'Upload fabric pattern (.png / .jpg / .svg)'}
                  </div>
                </div>
                <button
                  onClick={() => clothTextureInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow"
                >
                  <Upload size={13} />
                  <span>Upload Fabric</span>
                </button>
              </div>

              {/* Outfits List */}
              <div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Traditional & Modern Outfits
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'dhoti_kurta', label: 'Dhoti & Kurta' },
                    { id: 'lungi_shirt', label: 'Lungi & Shirt' },
                    { id: 'saree', label: 'Traditional Saree (साड़ी)' },
                    { id: 'royal_kurta', label: 'Royal Kurta (जरी कुर्ता)' },
                    { id: 'jacket_denim', label: 'Denim Jacket & Pants' },
                    { id: 'farmer_vest', label: 'Farmer Vest (बनियान)' },
                    { id: 'modern_jeans', label: 'Modern Shirt & Jeans' },
                    { id: 'angavastram', label: 'Kurta with Gamchha' },
                  ].map((outfit) => (
                    <button
                      key={outfit.id}
                      onClick={() => setCharacter((prev) => ({ ...prev, clothesStyle: outfit.id as ClothesStyle }))}
                      className={`p-2.5 text-xs rounded-lg border text-left transition-all ${
                        character.clothesStyle === outfit.id
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                          : 'bg-[#131418] border-[#2b2f3e] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {outfit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric Pattern Preset */}
              <div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Fabric Pattern
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'plain', label: 'Plain Solid' },
                    { id: 'stripes', label: 'Stripes' },
                    { id: 'dots', label: 'Polka Dots' },
                    { id: 'bandhani', label: 'Bandhani' },
                    { id: 'gold_border', label: 'Gold Zari' },
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() =>
                        setCharacter((prev) => ({
                          ...prev,
                          clothingConfig: {
                            id: `cloth_${Date.now()}`,
                            name: pat.label,
                            style: prev.clothesStyle,
                            primaryColor: prev.shirtColor,
                            pattern: pat.id as 'plain' | 'stripes' | 'dots' | 'bandhani' | 'gold_border',
                          },
                        }))
                      }
                      className="p-1.5 text-[11px] rounded bg-[#131418] border border-[#2b2f3e] hover:border-blue-500 text-gray-300 text-center"
                    >
                      {pat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Garment Accessories
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gamchha', label: 'Gamchha / Towel Drape' },
                    { id: 'dupatta', label: 'Dupatta / Shawl' },
                    { id: 'kalgi', label: 'Royal Turban Kalgi Brooch' },
                    { id: 'necklace', label: 'Gold Bead Necklace' },
                    { id: 'none', label: 'None' },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() =>
                        setCharacter((prev) => ({
                          ...prev,
                          clothingConfig: {
                            ...(prev.clothingConfig || {
                              id: `cloth_${Date.now()}`,
                              name: 'Custom',
                              style: prev.clothesStyle,
                              primaryColor: prev.shirtColor,
                            }),
                            accessory: acc.id as 'dupatta' | 'gamchha' | 'kalgi' | 'necklace' | 'none',
                          },
                        }))
                      }
                      className="p-2 text-xs rounded bg-[#131418] border border-[#2b2f3e] hover:border-blue-500 text-gray-300 text-left"
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shirt Color */}
              <div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Shirt / Upper Garment Color
                </span>
                <div className="flex items-center gap-2">
                  {SHIRT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCharacter((prev) => ({ ...prev, shirtColor: color }))}
                      className={`w-7 h-7 rounded-full transition-transform border-2 ${
                        character.shirtColor === color ? 'scale-115 border-white shadow' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Color */}
              <div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Bottom / Dhoti / Saree Color
                </span>
                <div className="flex items-center gap-2">
                  {BOTTOM_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCharacter((prev) => ({ ...prev, bottomColor: color }))}
                      className={`w-7 h-7 rounded-full transition-transform border-2 ${
                        character.bottomColor === color ? 'scale-115 border-white shadow' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: ADVANCED RIG & IK ================= */}
          {activeTab === 'rig' && (
            <div className="flex flex-col gap-4">
              {/* IK Solver Card */}
              <div className="p-3.5 bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/40 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Bone size={14} /> 2-Bone Inverse Kinematics (IK)
                  </span>
                  <button
                    onClick={() => setIkEnabled(!ikEnabled)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                      ikEnabled ? 'bg-purple-600 text-white shadow' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {ikEnabled ? 'IK Active' : 'IK Disabled'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  When IK is active, dragging the Hand or Foot pin automatically calculates the Elbow or Knee joint
                  rotation naturally using analytical trigonometry!
                </p>
              </div>

              {/* Pinning Controls */}
              <div className="p-3 bg-[#131418] border border-[#2b2f3e] rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Lock size={13} className="text-amber-400" /> Pin Feet to Ground
                  </div>
                  <div className="text-[10px] text-gray-400">Keeps feet locked while moving pelvis & torso</div>
                </div>
                <input
                  type="checkbox"
                  checked={pinnedFeet}
                  onChange={(e) => setPinnedFeet(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                />
              </div>

              {/* Instant Pose Presets */}
              <div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                  Studio Pose Presets
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(POSE_PRESETS).map(([key, poseObj]) => (
                    <button
                      key={key}
                      onClick={() => handleApplyPresetPose(key)}
                      className="p-2.5 text-xs rounded-lg border border-[#2b2f3e] bg-[#131418] text-gray-300 hover:border-blue-500 hover:text-white transition-all text-left font-medium"
                    >
                      {poseObj.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset to Neutral Pose */}
              <button
                onClick={handleResetPose}
                className="w-full py-2 bg-[#222530] hover:bg-[#2b2f3e] text-gray-300 rounded-lg text-xs font-semibold border border-[#2b2f3e] flex items-center justify-center gap-1.5"
              >
                <Undo2 size={13} />
                <span>Reset to Default Standing T-Pose</span>
              </button>
            </div>
          )}
        </div>

        {/* CENTER STAGE CANVAS */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#0d0e12] select-none">
          {/* Subtle Grid dots */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Turnaround Quick Pill Bar directly above Character */}
          <div className="absolute top-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-[#1a1c23]/90 border border-[#2b2f3e] shadow-xl backdrop-blur-md">
            {[
              { id: 'front', label: 'Front' },
              { id: 'three_quarter_front', label: '3/4 Front' },
              { id: 'profile', label: 'Profile' },
              { id: 'three_quarter_back', label: '3/4 Back' },
              { id: 'back', label: 'Back' },
            ].map((ang) => (
              <button
                key={ang.id}
                onClick={() => setCharacter((prev) => ({ ...prev, viewAngle: ang.id as CharacterViewAngle }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  (character.viewAngle || 'front') === ang.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-400 hover:text-white hover:bg-[#222530]'
                }`}
              >
                {ang.label}
              </button>
            ))}
          </div>

          {/* Floating Canvas Transform Overlay */}
          <div className="relative p-6 border border-dashed border-gray-700/60 rounded-2xl bg-[#14161d]/80 shadow-2xl backdrop-blur-sm mt-8">
            <RiggedCharacterRenderer
              config={character}
              showSkeleton={skeletonMode && (character.viewAngle === 'front' || !character.viewAngle)}
              interactiveRig={!isPlayingMotion}
              onJointMove={handleJointMove}
              overridePose={animatedPose}
              customExpression={customExpr}
              width={320}
              height={440}
            />

            <div className="absolute top-2 left-2 w-2.5 h-2.5 bg-white border border-gray-900 rounded-sm" />
            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-white border border-gray-900 rounded-sm" />
            <div className="absolute bottom-2 left-2 w-2.5 h-2.5 bg-white border border-gray-900 rounded-sm" />
            <div className="absolute bottom-2 right-2 w-2.5 h-2.5 bg-white border border-gray-900 rounded-sm" />
          </div>

          {/* Bottom status bar */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-gray-500">
            <div>
              <span>Angle: <strong className="text-white capitalize">{(character.viewAngle || 'front').replace(/_/g, ' ')}</strong></span> •{' '}
              <span>Emotion: <strong className="text-blue-400 capitalize">{character.expression}</strong></span>
            </div>
            {isPlayingMotion && (
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Motion: {previewClip?.title} ({Math.round(motionProgress * 100)}%)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SAVE EXPRESSION MODAL */}
      {showSaveExprModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1a1c23] border border-[#2b2f3e] rounded-2xl p-5 shadow-2xl text-left">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" /> Save Custom Facial Expression
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Give this fine-tuned facial expression a unique name to use across all scenes:
            </p>

            <input
              type="text"
              value={newExprName}
              onChange={(e) => setNewExprName(e.target.value)}
              placeholder="e.g. Village Comedy Smirk"
              className="w-full px-3 py-2 bg-[#131418] border border-[#2b2f3e] rounded-lg text-sm text-white mb-4 focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSaveExprModal(false)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomExpression}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow"
              >
                Save Expression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
