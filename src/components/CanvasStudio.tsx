import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StudioProject,
  StudioScene,
  SceneElement,
  CharacterConfig,
  CharacterViewAngle,
  SceneEffectsConfig,
  CameraShakeType,
  RealHumanVoiceType,
} from '../types/studio';
import { StageCanvas } from './StageCanvas';
import { StudioTimeline } from './StudioTimeline';
import { PropertiesPanel } from './PropertiesPanel';
import { CharacterCreatorModal } from './CharacterCreatorModal';
import { ExportProjectModal } from './ExportProjectModal';
import { CharacterRenderer5Angle } from './CharacterRenderer5Angle';
import {
  PRESET_CHARACTERS,
  CharacterPresetItem,
  AUTO_DRAFT_CATEGORY_CHIPS,
  CharacterCategoryChip,
} from '../utils/characterPresets';
import {
  autoAddOrUpdateKeyframe,
  autoAddOrUpdateCameraKeyframe,
  generateLipSyncKeyframesForText,
} from '../utils/timelineInterpolation';
import {
  POSE_PRESETS,
  MOTION_CLIPS_PRESETS,
  DEFAULT_LIMB_ANGLES,
} from '../utils/riggingLogic';
import { audioEngine, REAL_HUMAN_VOICE_CONFIGS } from '../utils/audioEngine';
import {
  User,
  Image as ImageIcon,
  LayoutTemplate,
  Wand2,
  Video,
  Mic,
  Camera,
  Sparkles,
  Type,
  Plus,
  Search,
  Edit2,
  Copy,
  Trash2,
  Download,
  Settings,
  Save,
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ArrowLeft,
  Bone,
  Sun,
  CloudRain,
  Music,
  HelpCircle,
  Layers,
  Sliders,
} from 'lucide-react';

interface CanvasStudioProps {
  project: StudioProject;
  onUpdateProject: (proj: StudioProject) => void;
  onBackToDashboard: () => void;
  onOpenCharacterRigStudio: (char?: CharacterConfig) => void;
  onOpenMotionStudio: () => void;
  onOpenAudioStudio: () => void;
  onOpenTemplatesModal: () => void;
  onOpenAssetLibraryModal: () => void;
}

export const CanvasStudio: React.FC<CanvasStudioProps> = ({
  project,
  onUpdateProject,
  onBackToDashboard,
  onOpenTemplatesModal,
  onOpenAssetLibraryModal,
  onOpenAudioStudio,
}) => {
  const currentScene =
    project.scenes.find((s) => s.id === project.currentSceneId) ||
    project.scenes[0] || {
      id: 'scene_default',
      name: 'Scene 1',
      duration: 8.0,
      backgroundColor: '#f8fafc',
      elements: [],
      audioTracks: [],
    };

  // Playback & Transport State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isAutoKeyframeActive, setIsAutoKeyframeActive] = useState<boolean>(true);

  // Selection & UI Panels
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    currentScene.elements[0]?.id || null
  );
  const [activeLeftNav, setActiveLeftNav] = useState<
    | 'character'
    | 'media'
    | 'templates'
    | 'imageGen'
    | 'videoGen'
    | 'aiVoice'
    | 'aiThumbnail'
    | 'animIK'
    | 'effects'
    | 'text'
  >('character');
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(true);
  const [activeRightSidebarTab, setActiveRightSidebarTab] = useState<
    'inspector' | 'effects' | 'assetLibrary' | 'music' | 'sounds'
  >('inspector');

  // Character Drawer State (Screenshot 9)
  const [characterFilterCategory, setCharacterFilterCategory] =
    useState<CharacterCategoryChip>('All');
  const [characterSearch, setCharacterSearch] = useState<string>('');
  const [characterLibrary, setCharacterLibrary] = useState<CharacterPresetItem[]>(() => [
    ...PRESET_CHARACTERS,
  ]);

  // Inline Quick Voice + Auto Lip-Sync Drawer State
  const [quickVoiceKey, setQuickVoiceKey] = useState<RealHumanVoiceType>('dada_ji');
  const [quickVoiceText, setQuickVoiceText] = useState<string>(
    REAL_HUMAN_VOICE_CONFIGS.dada_ji.sampleHindi
  );
  const [quickVoicePitch, setQuickVoicePitch] = useState<number>(
    REAL_HUMAN_VOICE_CONFIGS.dada_ji.pitch
  );
  const [quickVoiceRate, setQuickVoiceRate] = useState<number>(
    REAL_HUMAN_VOICE_CONFIGS.dada_ji.rate
  );
  const [quickVoiceEmotion, setQuickVoiceEmotion] = useState<
    'neutral' | 'happy' | 'sad' | 'angry' | 'whisper' | 'dramatic'
  >('neutral');
  const [isAuditioningVoice, setIsAuditioningVoice] = useState<boolean>(false);

  // Modals
  const [isCharacterCreatorOpen, setIsCharacterCreatorOpen] = useState<boolean>(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterConfig | undefined>(undefined);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Editable Project Title
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>(project.title);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<StudioScene[]>([currentScene]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Playback Loop
  useEffect(() => {
    let animId: number;
    let lastStamp = performance.now();

    if (isPlaying) {
      const step = (now: number) => {
        const delta = (now - lastStamp) / 1000;
        lastStamp = now;

        setCurrentTime((prev) => {
          const next = prev + delta * playbackSpeed;
          if (next >= currentScene.duration) {
            return 0;
          }
          return next;
        });
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, currentScene.duration]);

  // Audio trigger handling during playback
  const triggeredAudioRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!isPlaying) {
      triggeredAudioRef.current.clear();
      return;
    }

    currentScene.audioTracks.forEach((track) => {
      if (
        currentTime >= track.startTime &&
        currentTime <= track.startTime + 0.25 &&
        !triggeredAudioRef.current.has(track.id)
      ) {
        triggeredAudioRef.current.add(track.id);
        if (track.type === 'tts' && track.text) {
          if (track.humanVoiceProfile) {
            audioEngine.speakRealHumanVoice(track.humanVoiceProfile, track.text, {
              customPitch: track.voiceModulation?.pitch,
              customRate: track.voiceModulation?.rate,
              emotion: track.voiceModulation?.emotion,
            });
          } else {
            audioEngine.speakText(track.text, { voiceName: track.voiceName });
          }
        } else if (track.type === 'sfx' && track.soundType) {
          if (track.category === 'animal') audioEngine.playAnimalSound(track.soundType as any);
          else if (track.category === 'nature') audioEngine.playNatureSound(track.soundType as any);
          else if (track.category === 'human') audioEngine.playHumanReaction(track.soundType as any);
        }
      }
    });
  }, [currentTime, isPlaying, currentScene.audioTracks]);

  // Push Scene changes to History & Project
  const updateCurrentScene = useCallback(
    (updater: (s: StudioScene) => StudioScene, recordHistory = true) => {
      const updatedScene = updater(currentScene);
      const updatedScenes = project.scenes.map((s) =>
        s.id === currentScene.id ? updatedScene : s
      );

      onUpdateProject({
        ...project,
        scenes: updatedScenes,
        updatedAt: Date.now(),
      });

      if (recordHistory) {
        setHistory((prev) => {
          const sliced = prev.slice(0, historyIndex + 1);
          return [...sliced, updatedScene];
        });
        setHistoryIndex((prev) => prev + 1);
      }
    },
    [currentScene, project, onUpdateProject, historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetScene = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      const updatedScenes = project.scenes.map((s) =>
        s.id === currentScene.id ? targetScene : s
      );
      onUpdateProject({ ...project, scenes: updatedScenes });
      showToast('Undo');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetScene = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      const updatedScenes = project.scenes.map((s) =>
        s.id === currentScene.id ? targetScene : s
      );
      onUpdateProject({ ...project, scenes: updatedScenes });
      showToast('Redo');
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          handleDeleteElement(selectedElementId);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedElementId) handleDuplicateElement(selectedElementId);
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleAddKeyframeAtCurrentTime();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const selectedElement =
    currentScene.elements.find((el) => el.id === selectedElementId) || null;

  const handleUpdateElementPosition = (id: string, x: number, y: number) => {
    updateCurrentScene((s) => {
      const elem = s.elements.find((el) => el.id === id);
      if (!elem) return s;

      let keyframes = elem.keyframes || [];
      if (isAutoKeyframeActive && elem.type === 'character') {
        keyframes = autoAddOrUpdateKeyframe(
          keyframes,
          {
            x,
            y,
            scale: elem.scale,
            rotation: elem.rotation,
            flipX: elem.flipX || false,
            viewAngle: elem.viewAngle || elem.characterData?.viewAngle || 'front',
            expression: elem.expression || 'neutral',
            viseme: elem.viseme || 'closed',
            pupilLook: elem.pupilLook || { x: 0, y: 0 },
            easing: 'ease-out',
            bodyPartAngles: elem.characterData?.bodyPartAngles,
          },
          currentTime,
          project.fps
        );
      }

      return {
        ...s,
        elements: s.elements.map((el) => (el.id === id ? { ...el, x, y, keyframes } : el)),
      };
    });
  };

  // Apply Pose Preset or Joint Angle at Current Time on the Timeline
  const handleApplyPoseAtCurrentTime = (
    elemId: string,
    poseId: string,
    limbAngles: Record<string, number>
  ) => {
    updateCurrentScene((s) => ({
      ...s,
      elements: s.elements.map((el) => {
        if (el.id !== elemId) return el;
        const keyframes = autoAddOrUpdateKeyframe(
          el.keyframes || [],
          {
            x: el.x,
            y: el.y,
            scale: el.scale,
            rotation: el.rotation,
            flipX: el.flipX || Boolean(el.characterData?.flipX),
            viewAngle: el.viewAngle || el.characterData?.viewAngle || 'front',
            expression: el.expression || el.characterData?.eyeExpression || 'neutral',
            viseme: el.viseme || el.characterData?.viseme || 'closed',
            pupilLook: el.pupilLook || el.characterData?.pupilLook || { x: 0, y: 0 },
            easing: 'ease-out',
            posePreset: poseId,
            bodyPartAngles: limbAngles,
          },
          currentTime,
          project.fps
        );
        return {
          ...el,
          keyframes,
          characterData: el.characterData
            ? { ...el.characterData, bodyPartAngles: limbAngles }
            : el.characterData,
        };
      }),
    }));
  };

  // Update Scene Effects (Day/Night/Sun/Moon/Rain/Winter)
  const handleUpdateSceneEffects = (updates: Partial<SceneEffectsConfig>) => {
    updateCurrentScene((s) => {
      const currentEffects: SceneEffectsConfig = s.effects || {
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
      return {
        ...s,
        effects: { ...currentEffects, ...updates },
      };
    });
  };

  // Update Camera at Current Time
  const handleUpdateCameraAtCurrentTime = (updates: {
    x?: number;
    y?: number;
    zoom?: number;
    rotation?: number;
    shake?: CameraShakeType;
    dofBlur?: number;
  }) => {
    updateCurrentScene((s) => {
      const activeCamKeyframes = s.cameraKeyframes || [];
      const updated = autoAddOrUpdateCameraKeyframe(
        activeCamKeyframes,
        currentTime,
        {
          x: updates.x ?? 0,
          y: updates.y ?? 0,
          zoom: updates.zoom ?? 1.0,
          rotation: updates.rotation ?? 0,
          shake: updates.shake,
          dofBlur: updates.dofBlur,
          easing: 'ease-out',
        },
        project.fps
      );
      return { ...s, cameraKeyframes: updated };
    });
    showToast('Camera angle updated');
  };

  // Add Voiceover with Auto Lip-Sync directly from the Quick Voice Drawer
  const handleQuickAddVoiceWithLipSync = () => {
    const prof = REAL_HUMAN_VOICE_CONFIGS[quickVoiceKey] || REAL_HUMAN_VOICE_CONFIGS.dada_ji;
    const text = quickVoiceText.trim() || prof.sampleHindi;
    const wordCount = text.split(/\s+/).length;
    const estDuration = Math.max(1.8, Math.round((wordCount / (2.4 * quickVoiceRate)) * 10) / 10);

    const targetChar =
      (selectedElement && selectedElement.type === 'character' ? selectedElement : null) ||
      currentScene.elements.find((e) => e.type === 'character');

    const newTrack = {
      id: `audio_quick_${Date.now()}`,
      name: `${prof.name}: "${text.slice(0, 20)}..."`,
      type: 'tts' as const,
      category: 'human' as const,
      startTime: currentTime,
      duration: estDuration,
      volume: 1.0,
      text,
      humanVoiceProfile: quickVoiceKey,
      voiceModulation: {
        pitch: quickVoicePitch,
        rate: quickVoiceRate,
        emotion: quickVoiceEmotion,
        ageShift: 'adult' as const,
        reverb: 10,
        bassBoost: 0,
      },
      autoLipSync: true,
      targetCharacterId: targetChar?.id,
    };

    updateCurrentScene((s) => {
      const updatedElements = s.elements.map((el) => {
        if (targetChar && el.id === targetChar.id) {
          const syncedKfs = generateLipSyncKeyframesForText(
            el.keyframes || [],
            text,
            currentTime,
            estDuration,
            project.fps || 24,
            {
              x: el.x,
              y: el.y,
              scale: el.scale,
              rotation: el.rotation,
              flipX: Boolean(el.characterData?.flipX),
              viewAngle: el.characterData?.viewAngle || 'front',
              expression: el.characterData?.eyeExpression || 'neutral',
              pupilLook: el.characterData?.pupilLook || { x: 0, y: 0 },
              bodyPartAngles: el.characterData?.bodyPartAngles,
            }
          );
          return { ...el, keyframes: syncedKfs };
        }
        return el;
      });

      return {
        ...s,
        elements: updatedElements,
        audioTracks: [...s.audioTracks, newTrack],
      };
    });

    onUpdateProject({
      ...project,
      audioTracks: [...(project.audioTracks || []), newTrack],
    });

    showToast(
      targetChar
        ? `Added "${prof.name}" voice & Lip-Sync keyframes to ${targetChar.name}!`
        : `Added "${prof.name}" voice to timeline!`
    );
  };

  const handleDuplicateElement = (elemId: string) => {
    const elem = currentScene.elements.find((el) => el.id === elemId);
    if (!elem) return;

    const copy: SceneElement = {
      ...elem,
      id: `elem_${Date.now()}`,
      name: `${elem.name} (Copy)`,
      x: elem.x + 35,
      y: elem.y + 25,
      zIndex: elem.zIndex + 1,
    };

    updateCurrentScene((s) => ({
      ...s,
      elements: [...s.elements, copy],
    }));
    setSelectedElementId(copy.id);
    showToast(`Duplicated ${copy.name}`);
  };

  const handleDeleteElement = (elemId: string) => {
    updateCurrentScene((s) => ({
      ...s,
      elements: s.elements.filter((el) => el.id !== elemId),
    }));
    setSelectedElementId(null);
    showToast('Deleted element');
  };

  const handleAddKeyframeAtCurrentTime = () => {
    if (!selectedElement || selectedElement.type !== 'character') return;

    updateCurrentScene((s) => ({
      ...s,
      elements: s.elements.map((el) => {
        if (el.id !== selectedElement.id) return el;
        const keyframes = autoAddOrUpdateKeyframe(
          el.keyframes || [],
          {
            x: el.x,
            y: el.y,
            scale: el.scale,
            rotation: el.rotation,
            flipX: el.flipX || false,
            viewAngle: el.viewAngle || el.characterData?.viewAngle || 'front',
            expression: el.expression || 'neutral',
            viseme: el.viseme || 'closed',
            pupilLook: el.pupilLook || { x: 0, y: 0 },
            easing: 'ease-out',
            bodyPartAngles: el.characterData?.bodyPartAngles,
          },
          currentTime,
          project.fps
        );
        return { ...el, keyframes };
      }),
    }));
    showToast('Keyframe stamped at playhead');
  };

  const handleAddCameraKeyframeAtCurrentTime = () => {
    updateCurrentScene((s) => {
      const activeCamKeyframes = s.cameraKeyframes || [];
      const updated = autoAddOrUpdateCameraKeyframe(
        activeCamKeyframes,
        currentTime,
        {
          x: 0,
          y: 0,
          zoom: 1.0,
          rotation: 0,
          easing: 'ease-out',
        },
        project.fps
      );
      return { ...s, cameraKeyframes: updated };
    });
    showToast('Camera keyframe added');
  };

  const handleAddCharacterToScene = (
    preset: CharacterPresetItem,
    angle: CharacterViewAngle = 'front'
  ) => {
    const newElem: SceneElement = {
      id: `elem_char_${Date.now()}`,
      type: 'character',
      name: preset.name,
      x: 480,
      y: 330,
      scale: 1.0,
      rotation: 0,
      zIndex: currentScene.elements.length + 10,
      flipX: preset.config.flipX,
      viewAngle: angle || preset.config.viewAngle || 'front',
      expression: preset.config.eyeExpression || 'neutral',
      viseme: preset.config.viseme || 'closed',
      pupilLook: preset.config.pupilLook || { x: 0, y: 0 },
      activeMotionClipId: 'clip_idle',
      shadow: {
        enabled: true,
        type: 'ground',
        opacity: 0.45,
        blur: 8,
        offsetX: 0,
        offsetY: 118,
        scaleX: 1.0,
        skewX: -15,
        color: '#000000',
      },
      characterData: { ...preset.config, viewAngle: angle },
      keyframes: [
        {
          id: `kf_${Date.now()}`,
          time: 0,
          frame: 0,
          easing: 'ease-out',
          x: 480,
          y: 330,
          scale: 1.0,
          rotation: 0,
          flipX: preset.config.flipX,
          viewAngle: angle,
          expression: preset.config.eyeExpression || 'neutral',
          viseme: preset.config.viseme || 'closed',
          pupilLook: preset.config.pupilLook || { x: 0, y: 0 },
        },
      ],
    };

    updateCurrentScene((s) => ({
      ...s,
      elements: [...s.elements, newElem],
    }));
    setSelectedElementId(newElem.id);
    showToast(`Added "${preset.name}" to Stage`);
  };

  const handleOpenEditCharacter = (char: CharacterConfig) => {
    setEditingCharacter(char);
    setIsCharacterCreatorOpen(true);
  };

  const handleOpenCreateCharacter = () => {
    setEditingCharacter(undefined);
    setIsCharacterCreatorOpen(true);
  };

  const handleDuplicateCharacterInDrawer = (preset: CharacterPresetItem) => {
    const copyId = `char_custom_${Date.now()}`;
    const copyName = `${preset.name} (Copy)`;
    const newPreset: CharacterPresetItem = {
      id: copyId,
      name: copyName,
      category: preset.category,
      description: `Cloned from ${preset.name}`,
      config: {
        ...preset.config,
        id: copyId,
        name: copyName,
      },
    };

    setCharacterLibrary((prev) => [newPreset, ...prev]);
    showToast(`Cloned character "${copyName}" in library`);
  };

  const handleDeleteCharacterFromDrawer = (presetId: string) => {
    setCharacterLibrary((prev) => prev.filter((c) => c.id !== presetId));
    showToast('Deleted character from library');
  };

  const handleSaveCharacterFromModal = (savedChar: CharacterConfig, isSaveAsNew = false) => {
    if (isSaveAsNew) {
      const newPreset: CharacterPresetItem = {
        id: savedChar.id,
        name: savedChar.name,
        category: 'Latest',
        description: `Custom created character: ${savedChar.name}`,
        config: savedChar,
      };

      setCharacterLibrary((prev) => [newPreset, ...prev]);
      handleAddCharacterToScene(newPreset, savedChar.viewAngle);
      showToast(`Saved as new character "${savedChar.name}"!`);
    } else {
      setCharacterLibrary((prev) =>
        prev.map((item) =>
          item.config.id === savedChar.id
            ? { ...item, name: savedChar.name, config: savedChar }
            : item
        )
      );

      updateCurrentScene((s) => ({
        ...s,
        elements: s.elements.map((el) => {
          if (el.characterData?.id === savedChar.id) {
            return {
              ...el,
              name: savedChar.name,
              viewAngle: savedChar.viewAngle,
              flipX: savedChar.flipX,
              expression: savedChar.eyeExpression,
              viseme: savedChar.viseme,
              pupilLook: savedChar.pupilLook,
              characterData: savedChar,
            };
          }
          return el;
        }),
      }));

      showToast(`Updated "${savedChar.name}"!`);
    }
  };

  const filteredCharacters = characterLibrary.filter((char) => {
    const matchesCategory =
      characterFilterCategory === 'All' || char.category === characterFilterCategory;
    const matchesSearch =
      !characterSearch ||
      char.name.toLowerCase().includes(characterSearch.toLowerCase()) ||
      char.description.toLowerCase().includes(characterSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-[#0d0e12] flex flex-col text-white select-none overflow-hidden font-sans">
      {/* 1. TOP BAR (Screenshot 9 Layout + ANIMATE STUDIO Branding) */}
      <div className="h-12 px-4 bg-[#161822] border-b border-[#2b2f3e] flex items-center justify-between z-40 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mr-1"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              AS
            </div>
            <span className="text-xs font-black tracking-wider text-white hidden sm:inline">
              ANIMATE <span className="text-blue-400">STUDIO</span>
            </span>
          </div>

          <div className="w-px h-5 bg-[#2b2f3e]" />

          {isEditingTitle ? (
            <input
              type="text"
              value={tempTitle}
              autoFocus
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                if (tempTitle.trim()) {
                  onUpdateProject({ ...project, title: tempTitle.trim() });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false);
                  if (tempTitle.trim()) onUpdateProject({ ...project, title: tempTitle.trim() });
                }
                if (e.key === 'Escape') {
                  setIsEditingTitle(false);
                  setTempTitle(project.title);
                }
              }}
              className="px-2 py-0.5 bg-[#101218] border border-blue-500 rounded text-xs font-bold text-white focus:outline-none"
            />
          ) : (
            <div
              onClick={() => {
                setTempTitle(project.title);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 cursor-pointer group"
              title="Click to rename project"
            >
              <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                {project.title}
              </span>
              <Edit2 size={12} className="text-gray-500 group-hover:text-blue-400" />
            </div>
          )}

          <span className="text-[10px] font-mono text-gray-400 bg-[#12141c] px-2 py-0.5 rounded border border-[#2b2f3e]">
            ID: 20380149
          </span>
        </div>

        {/* Right Top Actions: Save, Frame, Undo/Redo, Download (Opens Multi-Style Export Modal), Settings */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#12141c] rounded-lg border border-[#2b2f3e] p-0.5">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-30 rounded hover:bg-[#222532]"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-30 rounded hover:bg-[#222532]"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw size={13} />
            </button>
          </div>

          <button
            onClick={() => {
              onUpdateProject({ ...project, updatedAt: Date.now() });
              showToast('Project saved!');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#222532] hover:bg-[#2b2f3e] text-xs font-semibold rounded-lg text-gray-200 hover:text-white transition-colors"
          >
            <Save size={13} />
            <span>Save</span>
          </button>

          <div className="flex items-center gap-1 bg-[#12141c] px-2.5 py-1 rounded-lg border border-[#2b2f3e] text-xs">
            <span className="text-[10px] text-gray-400">Frame</span>
            <select
              value={project.aspectRatio}
              onChange={(e) =>
                onUpdateProject({ ...project, aspectRatio: e.target.value as any })
              }
              className="bg-transparent text-xs font-bold text-blue-400 focus:outline-none cursor-pointer"
            >
              <option value="16:9" className="bg-[#161822] text-white">
                16:9
              </option>
              <option value="9:16" className="bg-[#161822] text-white">
                9:16
              </option>
            </select>
          </div>

          {/* Primary Blue Download / Export Video Button (Screenshot 9) */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-lg text-white shadow-md shadow-blue-900/40 transition-all"
          >
            <Download size={13} />
            <span>Download</span>
          </button>

          <button
            onClick={() => {
              setSelectedElementId(null);
              setActiveRightSidebarTab('effects');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#222532] hover:bg-[#2b2f3e] rounded-lg text-xs font-semibold text-gray-200"
            title="Scene Settings & Effects"
          >
            <Settings size={13} />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: LEFT ICON BAR + ACTIVE DRAWER + CENTER STAGE + RIGHT INSPECTOR + RIGHT ICON BAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT VERTICAL ICON TOOLBAR (Screenshot 9) */}
        <div className="w-16 bg-[#12141a] border-r border-[#2b2f3e] flex flex-col items-center py-2.5 gap-1.5 z-30 select-none overflow-y-auto">
          {[
            { id: 'character', label: 'Character', icon: User },
            { id: 'templates', label: 'Templates', icon: LayoutTemplate },
            { id: 'aiVoice', label: 'Ai Voice', icon: Mic, badge: 'AI' },
            { id: 'animIK', label: 'Anim IK', icon: Bone },
            { id: 'effects', label: 'Effects', icon: CloudRain },
            { id: 'media', label: 'Media', icon: ImageIcon },
            { id: 'aiThumbnail', label: 'Camera', icon: Camera },
            { id: 'text', label: 'Create', icon: Wand2, badge: 'AI' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeLeftNav === item.id && isLeftDrawerOpen;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'templates') {
                    onOpenTemplatesModal();
                    return;
                  }
                  if (item.id === 'media') {
                    onOpenAssetLibraryModal();
                    return;
                  }
                  if (item.id === 'text') {
                    handleOpenCreateCharacter();
                    return;
                  }
                  if (item.id === 'effects' || item.id === 'aiThumbnail') {
                    setSelectedElementId(null);
                    setActiveRightSidebarTab('effects');
                    setActiveLeftNav(item.id as any);
                    return;
                  }
                  if (activeLeftNav === item.id) {
                    setIsLeftDrawerOpen(!isLeftDrawerOpen);
                  } else {
                    setActiveLeftNav(item.id as any);
                    setIsLeftDrawerOpen(true);
                  }
                }}
                className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1c24]'
                }`}
                title={item.label}
              >
                {item.badge && (
                  <span className="absolute top-0.5 right-0.5 px-1 rounded bg-blue-500 text-[7px] font-black text-white">
                    {item.badge}
                  </span>
                )}
                <Icon size={17} />
                <span className="text-[9px] font-medium tracking-tight truncate w-11 text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ===================================================================
            LEFT DRAWER 1: CHARACTERS LIBRARY (Screenshot 9)
           =================================================================== */}
        {isLeftDrawerOpen && activeLeftNav === 'character' && (
          <div className="w-80 md:w-88 bg-[#161822] border-r border-[#2b2f3e] flex flex-col z-20 select-none">
            <div className="p-3 border-b border-[#2b2f3e] flex items-center justify-between">
              <span className="text-sm font-bold text-white">Characters</span>
              <button
                onClick={handleOpenCreateCharacter}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#222532] hover:bg-blue-600 text-white text-xs font-bold rounded-lg border border-[#323648] transition-all"
              >
                <span>Create</span>
                <Plus size={13} />
              </button>
            </div>

            {/* Search Characters Input */}
            <div className="p-2.5 border-b border-[#2b2f3e] bg-[#14161f]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Characters"
                  value={characterSearch}
                  onChange={(e) => setCharacterSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-[#101218] rounded-lg border border-[#2b2f3e] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter Chips (Screenshot 9: Desi, Western, Indonesian, Village, Birds, Animals, Vehicles, Religious, Horror, Latest) */}
            <div className="px-3 py-2 border-b border-[#2b2f3e] bg-[#14161f] flex flex-wrap gap-1.5">
              {AUTO_DRAFT_CATEGORY_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setCharacterFilterCategory(chip)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    characterFilterCategory === chip
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-[#1e202b] text-gray-300 hover:text-white hover:bg-[#252836]'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* 2-Column Character Cards Grid (Exact match for Screenshot 9) */}
            <div className="flex-1 p-2.5 overflow-y-auto grid grid-cols-2 gap-2.5 content-start">
              {filteredCharacters.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-[#12141c] rounded-xl border border-[#262936] hover:border-blue-500/60 p-2 flex flex-col justify-between transition-all group relative"
                >
                  {/* Top-Right "✏️ Edit" Pill Button (Screenshot 9) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditCharacter(preset.config);
                    }}
                    className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#252836]/95 hover:bg-blue-600 text-gray-200 hover:text-white text-[10px] font-bold border border-white/10 shadow"
                    title="Edit Character Features, Clothes & Reference Photo"
                  >
                    <Edit2 size={10} />
                    <span>Edit</span>
                  </button>

                  {/* Character Preview Thumbnail */}
                  <div
                    onClick={() => handleAddCharacterToScene(preset, 'front')}
                    className="w-full h-36 bg-[#171923] rounded-lg flex items-center justify-center cursor-pointer overflow-hidden relative"
                    title={`Click to add ${preset.name} to Stage`}
                  >
                    <CharacterRenderer5Angle
                      config={preset.config}
                      overrideAngle="front"
                      width={105}
                      height={145}
                    />
                  </div>

                  {/* Character Name + Duplicate/Delete */}
                  <div className="flex items-center justify-between mt-1.5 px-0.5">
                    <span className="text-[11px] font-bold text-white truncate">
                      {preset.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateCharacterInDrawer(preset)}
                        className="text-gray-400 hover:text-emerald-400"
                        title="Clone Character"
                      >
                        <Copy size={11} />
                      </button>
                      {preset.id.startsWith('char_custom') && (
                        <button
                          onClick={() => handleDeleteCharacterFromDrawer(preset.id)}
                          className="text-gray-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom 5-Angle Links (FRONT | 3/4 FRONT | 3/4 BACK | BACK | SIDE matching Screenshot 9) */}
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 pt-1 border-t border-[#1e202c] text-[8px] font-bold text-gray-400">
                    {[
                      { id: 'front', label: 'FRONT' },
                      { id: 'three_quarter_front', label: '3/4 FRONT' },
                      { id: 'three_quarter_back', label: '3/4 BACK' },
                      { id: 'back', label: 'BACK' },
                      { id: 'profile', label: 'SIDE' },
                    ].map((ang) => (
                      <button
                        key={ang.id}
                        onClick={() =>
                          handleAddCharacterToScene(preset, ang.id as CharacterViewAngle)
                        }
                        className="hover:text-blue-400 transition-colors"
                      >
                        {ang.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            LEFT DRAWER 2: INLINE AI VOICE, VOICE EDITOR & AUTO LIP-SYNC
           =================================================================== */}
        {isLeftDrawerOpen && activeLeftNav === 'aiVoice' && (
          <div className="w-80 md:w-88 bg-[#161822] border-r border-[#2b2f3e] flex flex-col z-20 select-none p-3.5 gap-3.5 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Mic size={15} className="text-rose-400" /> AI Voice & Auto Lip-Sync
                </span>
                <span className="text-[10px] text-gray-400">
                  20+ Voices • Voice Editor • 1-Click Character Lip-Sync
                </span>
              </div>
              <button
                onClick={onOpenAudioStudio}
                className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[10px] font-bold border border-purple-500/30"
              >
                Full Studio
              </button>
            </div>

            {/* Select Voice from 20+ Library */}
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">
                1. Choose Character Voice (20+ Library)
              </label>
              <div className="grid grid-cols-2 auto-rows-max gap-1.5 max-h-48 overflow-y-auto pr-1">
                {Object.entries(REAL_HUMAN_VOICE_CONFIGS).map(([key, prof]) => {
                  const isSelected = quickVoiceKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setQuickVoiceKey(key as RealHumanVoiceType);
                        setQuickVoiceText(prof.sampleHindi);
                        setQuickVoicePitch(prof.pitch);
                        setQuickVoiceRate(prof.rate);
                      }}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-600/25 border-blue-500 text-white shadow'
                          : 'bg-[#12141c] border-[#2b2f3e] text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-[11px] font-bold truncate">{prof.name}</div>
                      <div className="text-[9px] text-gray-400 truncate">{prof.role}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice Editor Sliders (Pitch, Speed, Emotion) */}
            <div className="p-3 rounded-xl bg-[#12141c] border border-purple-500/30 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold uppercase text-purple-300 flex items-center gap-1">
                <Sliders size={11} /> 2. Edit Voice Pitch, Speed & Emotion
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Pitch</span>
                    <span className="font-mono text-purple-300">{quickVoicePitch.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.9"
                    step="0.05"
                    value={quickVoicePitch}
                    onChange={(e) => setQuickVoicePitch(parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Speed</span>
                    <span className="font-mono text-purple-300">{quickVoiceRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={quickVoiceRate}
                    onChange={(e) => setQuickVoiceRate(parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {(['neutral', 'happy', 'sad', 'angry', 'whisper', 'dramatic'] as const).map(
                  (emo) => (
                    <button
                      key={emo}
                      onClick={() => setQuickVoiceEmotion(emo)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        quickVoiceEmotion === emo
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#1c1f2b] text-gray-400 hover:text-white'
                      }`}
                    >
                      {emo}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Dialogue Input */}
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                3. Dialogue Script (Auto Lip-Syncs Selected Character)
              </label>
              <textarea
                rows={3}
                value={quickVoiceText}
                onChange={(e) => setQuickVoiceText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#101218] border border-[#2b2f3e] text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Type Hindi or English dialogue..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  if (isAuditioningVoice) {
                    audioEngine.stopSpeech();
                    setIsAuditioningVoice(false);
                    return;
                  }
                  setIsAuditioningVoice(true);
                  audioEngine.speakRealHumanVoice(quickVoiceKey, quickVoiceText, {
                    customPitch: quickVoicePitch,
                    customRate: quickVoiceRate,
                    emotion: quickVoiceEmotion,
                    onEnd: () => setIsAuditioningVoice(false),
                    onError: () => setIsAuditioningVoice(false),
                  });
                }}
                className="w-full py-2 rounded-xl bg-[#222533] hover:bg-[#2c3042] text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-[#32364a]"
              >
                {isAuditioningVoice ? <Pause size={13} /> : <Play size={13} />}
                <span>{isAuditioningVoice ? 'Stop Voice' : 'Preview Edited Voice'}</span>
              </button>

              <button
                onClick={handleQuickAddVoiceWithLipSync}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Sparkles size={13} />
                <span>Add Voice + Auto Lip-Sync to Timeline</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            LEFT DRAWER 3: ANIM IK — BASIC TO ADVANCED MOTIONS & POSES
           =================================================================== */}
        {isLeftDrawerOpen && activeLeftNav === 'animIK' && (
          <div className="w-80 md:w-88 bg-[#161822] border-r border-[#2b2f3e] flex flex-col z-20 select-none p-3.5 gap-3.5 overflow-y-auto">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Bone size={15} className="text-emerald-400" /> Basic to Advanced Motions & IK
              </span>
              <span className="text-[10px] text-gray-400">
                Click any motion loop or timeline pose to animate the active character
              </span>
            </div>

            {!selectedElement || selectedElement.type !== 'character' ? (
              <div className="p-4 rounded-xl bg-[#12141c] border border-[#2b2f3e] text-xs text-gray-400">
                Select or add a character on the stage to apply Basic & Advanced Motions or edit
                timeline poses.
              </div>
            ) : (
              <>
                <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs flex items-center justify-between">
                  <span className="text-gray-300">Active Character:</span>
                  <span className="font-bold text-blue-300">{selectedElement.name}</span>
                </div>

                {/* Motion Clips List */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1.5">
                    1. Continuous Motion Loops (14 Clips)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MOTION_CLIPS_PRESETS.map((clip) => {
                      const isActive = selectedElement.activeMotionClipId === clip.id;
                      return (
                        <button
                          key={clip.id}
                          onClick={() => {
                            updateCurrentScene((s) => ({
                              ...s,
                              elements: s.elements.map((el) =>
                                el.id === selectedElement.id
                                  ? { ...el, activeMotionClipId: clip.id }
                                  : el
                              ),
                            }));
                            showToast(`Applied "${clip.title}" to ${selectedElement.name}`);
                          }}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            isActive
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                              : 'bg-[#12141c] border-[#2b2f3e] text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-xs font-bold truncate">
                            🎬 {clip.title}
                          </div>
                          <div className="text-[9px] opacity-75 capitalize">{clip.category} • {clip.level || 'basic'}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline Pose Stamps */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-300 block mb-1.5">
                    2. Stamp Keyframe Pose at {currentTime.toFixed(1)}s
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.values(POSE_PRESETS).map((pose) => (
                      <button
                        key={pose.id}
                        onClick={() => {
                          const angles = { ...DEFAULT_LIMB_ANGLES, ...(pose.limbAngles || {}) };
                          handleApplyPoseAtCurrentTime(selectedElement.id, pose.id, angles);
                          showToast(`Stamped "${pose.name}" pose at ${currentTime.toFixed(1)}s`);
                        }}
                        className="p-2 rounded-xl bg-[#12141c] hover:bg-purple-600 border border-[#2b2f3e] text-left text-xs font-semibold text-gray-200 hover:text-white transition-all truncate"
                      >
                        🦴 {pose.name.replace(/\s*\(.*?\)/g, '')}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* CENTER: 16:9 STAGE CANVAS */}
        <div className="flex-1 flex flex-col bg-[#0d0e12] overflow-hidden relative">
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <StageCanvas
              scene={currentScene}
              currentTime={currentTime}
              selectedElementId={selectedElementId}
              onSelectElement={(id) => {
                setSelectedElementId(id);
                if (id) setActiveRightSidebarTab('inspector');
              }}
              onUpdateElementPosition={handleUpdateElementPosition}
              onUpdateCameraPosition={(x, y, zoom, rotation) =>
                handleUpdateCameraAtCurrentTime({ x, y, zoom, rotation })
              }
              onUpdateSceneEffects={handleUpdateSceneEffects}
              isAutoKeyframeActive={isAutoKeyframeActive}
            />
          </div>
        </div>

        {/* RIGHT INSPECTOR PANEL (Properties / Scene Effects / Camera / Shadows) */}
        <PropertiesPanel
          selectedElement={activeRightSidebarTab === 'effects' ? null : selectedElement}
          currentScene={currentScene}
          currentTime={currentTime}
          onUpdateElement={(elemId, updates) => {
            updateCurrentScene((s) => ({
              ...s,
              elements: s.elements.map((el) => (el.id === elemId ? { ...el, ...updates } : el)),
            }));
          }}
          onUpdateCharacterData={(elemId, charUpdates) => {
            updateCurrentScene((s) => ({
              ...s,
              elements: s.elements.map((el) => {
                if (el.id === elemId && el.characterData) {
                  return {
                    ...el,
                    characterData: { ...el.characterData, ...charUpdates },
                  };
                }
                return el;
              }),
            }));
          }}
          onUpdateSceneEffects={handleUpdateSceneEffects}
          onUpdateCameraAtCurrentTime={handleUpdateCameraAtCurrentTime}
          onApplyPoseAtCurrentTime={handleApplyPoseAtCurrentTime}
          onDuplicateElement={handleDuplicateElement}
          onDeleteElement={handleDeleteElement}
          onOpenCharacterCreator={(char) => {
            if (char) handleOpenEditCharacter(char);
            else handleOpenCreateCharacter();
          }}
          onAddKeyframe={handleAddKeyframeAtCurrentTime}
        />

        {/* FAR-RIGHT VERTICAL ICON TOOLBAR (Matching Screenshot 9: Asset Library, Effects, Music, Sounds, Tutorials) */}
        <div className="w-16 bg-[#12141a] border-l border-[#2b2f3e] flex flex-col items-center py-2.5 gap-2 z-30 select-none">
          {[
            {
              id: 'assetLibrary',
              label: 'Asset Library',
              icon: Layers,
              badge: 'AI',
              action: () => onOpenAssetLibraryModal(),
            },
            {
              id: 'effects',
              label: 'Effects',
              icon: Sun,
              action: () => {
                setSelectedElementId(null);
                setActiveRightSidebarTab('effects');
              },
            },
            {
              id: 'inspector',
              label: 'Character',
              icon: Sliders,
              action: () => {
                if (!selectedElementId && currentScene.elements[0]) {
                  setSelectedElementId(currentScene.elements[0].id);
                }
                setActiveRightSidebarTab('inspector');
              },
            },
            {
              id: 'music',
              label: 'Music',
              icon: Music,
              action: () => onOpenAudioStudio(),
            },
            {
              id: 'sounds',
              label: 'Sounds',
              icon: Volume2,
              action: () => onOpenAudioStudio(),
            },
            {
              id: 'tutorials',
              label: 'Templates',
              icon: HelpCircle,
              action: () => onOpenTemplatesModal(),
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeRightSidebarTab === item.id;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1c24]'
                }`}
                title={item.label}
              >
                {item.badge && (
                  <span className="absolute top-0.5 right-0.5 px-1 rounded bg-blue-500 text-[7px] font-black text-white">
                    {item.badge}
                  </span>
                )}
                <Icon size={17} />
                <span className="text-[8px] font-medium tracking-tight truncate w-12 text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM TIMELINE: TRANSPORT + SCENES TABS + MULTI-TRACK KEYFRAMES + POSE EDITOR */}
      <StudioTimeline
        project={project}
        currentScene={currentScene}
        currentTime={currentTime}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onSetCurrentTime={setCurrentTime}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onSetPlaybackSpeed={setPlaybackSpeed}
        selectedElementId={selectedElementId}
        onSelectElement={(id) => {
          setSelectedElementId(id);
          if (id) setActiveRightSidebarTab('inspector');
        }}
        onUpdateScene={(updater) => updateCurrentScene(updater)}
        onSelectScene={(sceneId) => {
          onUpdateProject({ ...project, currentSceneId: sceneId });
          setCurrentTime(0);
        }}
        onAddScene={() => {
          const newScene: StudioScene = {
            id: `scene_${Date.now()}`,
            name: `Scene ${project.scenes.length + 1}`,
            duration: 8.0,
            backgroundColor: '#f8fafc',
            backgroundTemplate: 'village_exterior',
            elements: [],
            audioTracks: [],
          };
          onUpdateProject({
            ...project,
            scenes: [...project.scenes, newScene],
            currentSceneId: newScene.id,
          });
          setCurrentTime(0);
          showToast(`Added ${newScene.name}`);
        }}
        onDeleteScene={(sceneId) => {
          if (project.scenes.length <= 1) return;
          const remaining = project.scenes.filter((s) => s.id !== sceneId);
          onUpdateProject({
            ...project,
            scenes: remaining,
            currentSceneId: remaining[0].id,
          });
        }}
        isAutoKeyframeActive={isAutoKeyframeActive}
        onToggleAutoKeyframe={() => setIsAutoKeyframeActive(!isAutoKeyframeActive)}
        onAddKeyframeAtCurrentTime={handleAddKeyframeAtCurrentTime}
        onAddCameraKeyframeAtCurrentTime={handleAddCameraKeyframeAtCurrentTime}
        onApplyPoseAtCurrentTime={handleApplyPoseAtCurrentTime}
      />

      {/* CHARACTER CREATOR MODAL (Screenshots 10, 11, 12, 13 + Reference Photo Matcher) */}
      <CharacterCreatorModal
        isOpen={isCharacterCreatorOpen}
        onClose={() => setIsCharacterCreatorOpen(false)}
        onSaveCharacter={handleSaveCharacterFromModal}
        initialCharacter={editingCharacter}
      />

      {/* MULTI-STYLE HIGH QUALITY EXPORT MODAL */}
      <ExportProjectModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
      />

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-2xl flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
