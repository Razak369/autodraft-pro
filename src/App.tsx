import React, { useState, useEffect } from 'react';
import {
  StudioProject,
  AspectRatio,
  CharacterConfig,
  MotionClip,
  AudioTrackItem,
  SceneElement,
  StudioScene,
} from './types/studio';
import { storageSync, DEFAULT_SAMPLE_PROJECTS } from './utils/storageSync';
import { generateLipSyncKeyframesForText } from './utils/timelineInterpolation';
import { DashboardView } from './components/DashboardView';
import { CanvasStudio } from './components/CanvasStudio';
import { CharacterRigStudio } from './components/CharacterRigStudio';
import { MotionStudio } from './components/MotionStudio';
import { AudioVoiceStudio } from './components/AudioVoiceStudio';
import { CreateProjectModal } from './components/CreateProjectModal';
import { TemplatesModal } from './components/TemplatesModal';
import { AssetLibraryModal } from './components/AssetLibraryModal';
import { OfflineBanner } from './components/OfflineBanner';
import {
  LayoutDashboard,
  FolderKanban,
  Bone,
  Activity,
  Mic,
  Layers,
  Sparkles,
  Clapperboard,
  HelpCircle,
  Trash2,
  Menu,
  X,
  User,
  Plus,
} from 'lucide-react';

type ActiveView = 'dashboard' | 'studio' | 'character_rig' | 'motion' | 'audio';

export default function App() {
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [activeView, setActiveView] = useState<ActiveView>('studio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState<boolean>(false);

  // Character being edited in Rig Studio
  const [editingCharacter, setEditingCharacter] = useState<CharacterConfig | undefined>(undefined);

  // Load projects from storageSync on mount
  useEffect(() => {
    const loaded = storageSync.getProjects();
    setProjects(loaded);
    const currId = storageSync.getCurrentProjectId();
    setCurrentProjectId(currId || loaded[0]?.id || DEFAULT_SAMPLE_PROJECTS[0].id);
  }, []);

  const currentProject =
    projects.find((p) => p.id === currentProjectId) || projects[0] || DEFAULT_SAMPLE_PROJECTS[0];

  const handleUpdateProject = (updated: StudioProject) => {
    storageSync.saveProject(updated);
    setProjects(storageSync.getProjects());
  };

  const handleCreateNewProject = (title: string, ratio: AspectRatio) => {
    const newProj: StudioProject = {
      id: `proj_${Date.now()}`,
      title,
      aspectRatio: ratio,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fps: 24,
      currentSceneId: 'scene_init',
      scenes: [
        {
          id: 'scene_init',
          name: 'Scene 1',
          duration: 6.0,
          backgroundColor: '#f8fafc',
          elements: [],
          audioTracks: [],
        },
      ],
    };
    storageSync.saveProject(newProj);
    setProjects(storageSync.getProjects());
    setCurrentProjectId(newProj.id);
    setActiveView('studio');
  };

  const handleDeleteProject = (id: string) => {
    storageSync.deleteProject(id);
    const updated = storageSync.getProjects();
    setProjects(updated);
    if (currentProjectId === id && updated.length > 0) {
      setCurrentProjectId(updated[0].id);
    }
  };

  const handleExportProject = (proj: StudioProject) => {
    const dataStr = storageSync.exportProjectToJson(proj);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proj.title.toLowerCase().replace(/\s+/g, '_')}.animatestudio.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const imported = storageSync.importProjectFromJson(content);
          setProjects(storageSync.getProjects());
          setCurrentProjectId(imported.id);
          setActiveView('studio');
        } catch (err) {
          console.error('Failed to parse project JSON file.', err);
        }
      };
      reader.readAsText(file);
    }
  };

  // Add character from Rig Studio to current project scene
  const handleSaveCharacterFromRigStudio = (char: CharacterConfig) => {
    if (currentProject) {
      const activeScene =
        currentProject.scenes.find((s) => s.id === currentProject.currentSceneId) ||
        currentProject.scenes[0];

      // Check if character already exists in scene
      const existingIdx = activeScene.elements.findIndex(
        (el) => el.characterData?.id === char.id
      );

      let updatedElements = [...activeScene.elements];
      if (existingIdx >= 0) {
        updatedElements[existingIdx] = {
          ...updatedElements[existingIdx],
          name: char.name,
          characterData: char,
        };
      } else {
        const newElem: SceneElement = {
          id: `elem_char_${Date.now()}`,
          type: 'character',
          name: char.name,
          x: 280,
          y: 380,
          scale: 1.1,
          rotation: 0,
          zIndex: 10,
          characterData: char,
          activeMotionClipId: 'village_walk',
        };
        updatedElements.push(newElem);
      }

      const updatedScenes = currentProject.scenes.map((s) =>
        s.id === activeScene.id ? { ...s, elements: updatedElements } : s
      );

      handleUpdateProject({ ...currentProject, scenes: updatedScenes });
    }
  };

  // Add audio track to active scene (with optional Auto Lip-Sync keyframes)
  const handleAddAudioToActiveScene = (track: AudioTrackItem) => {
    if (currentProject) {
      const activeScene =
        currentProject.scenes.find((s) => s.id === currentProject.currentSceneId) ||
        currentProject.scenes[0];

      let updatedElements = [...activeScene.elements];
      if (track.autoLipSync && track.text) {
        const targetChar =
          updatedElements.find((el) => el.id === track.targetCharacterElementId) ||
          updatedElements.find((el) => el.type === 'character');
        if (targetChar) {
          const updatedKfs = generateLipSyncKeyframesForText(
            targetChar,
            track.text,
            track.startTime,
            track.duration
          );
          updatedElements = updatedElements.map((el) =>
            el.id === targetChar.id ? { ...el, keyframes: updatedKfs } : el
          );
        }
      }

      const updatedScenes = currentProject.scenes.map((s) =>
        s.id === activeScene.id
          ? {
              ...s,
              elements: updatedElements,
              audioTracks: [...s.audioTracks, track],
            }
          : s
      );

      handleUpdateProject({
        ...currentProject,
        audioTracks: [...(currentProject.audioTracks || []), track],
        scenes: updatedScenes,
      });
      setActiveView('studio');
    }
  };

  // Apply motion clip to active character
  const handleApplyMotionClip = (clipId: string) => {
    if (currentProject) {
      const activeScene =
        currentProject.scenes.find((s) => s.id === currentProject.currentSceneId) ||
        currentProject.scenes[0];

      const updatedElements = activeScene.elements.map((el) =>
        el.type === 'character' ? { ...el, activeMotionClipId: clipId } : el
      );

      const updatedScenes = currentProject.scenes.map((s) =>
        s.id === activeScene.id ? { ...s, elements: updatedElements } : s
      );

      handleUpdateProject({ ...currentProject, scenes: updatedScenes });
      setActiveView('studio');
    }
  };

  // Add scene element from Asset Library
  const handleAddElementFromAssetLibrary = (elem: SceneElement) => {
    if (currentProject) {
      const activeScene =
        currentProject.scenes.find((s) => s.id === currentProject.currentSceneId) ||
        currentProject.scenes[0];

      const updatedScenes = currentProject.scenes.map((s) =>
        s.id === activeScene.id
          ? { ...s, elements: [...s.elements, elem] }
          : s
      );

      handleUpdateProject({ ...currentProject, scenes: updatedScenes });
    }
  };

  // Apply Scene from Templates Modal
  const handleApplyTemplateScene = (newScene: StudioScene) => {
    if (currentProject) {
      handleUpdateProject({
        ...currentProject,
        scenes: [...currentProject.scenes, newScene],
        currentSceneId: newScene.id,
      });
      setActiveView('studio');
    }
  };

  const activeSceneCharacters = (
    currentProject?.scenes.find((s) => s.id === currentProject.currentSceneId) ||
    currentProject?.scenes[0]
  )?.elements
    .filter((el) => el.type === 'character')
    .map((el) => ({ id: el.id, name: el.name })) || [];

  if (activeView === 'studio') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#0d0e12]">
        <CanvasStudio
          project={currentProject}
          onUpdateProject={handleUpdateProject}
          onBackToDashboard={() => setActiveView('dashboard')}
          onOpenCharacterRigStudio={(char) => {
            setEditingCharacter(char);
            setActiveView('character_rig');
          }}
          onOpenMotionStudio={() => setActiveView('motion')}
          onOpenAudioStudio={() => setActiveView('audio')}
          onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
          onOpenAssetLibraryModal={() => setIsAssetModalOpen(true)}
        />
        {/* Modals */}
        {isTemplatesModalOpen && (
          <TemplatesModal
            isOpen={isTemplatesModalOpen}
            onClose={() => setIsTemplatesModalOpen(false)}
            onApplyTemplate={handleApplyTemplateScene}
          />
        )}
        {isAssetModalOpen && (
          <AssetLibraryModal
            isOpen={isAssetModalOpen}
            onClose={() => setIsAssetModalOpen(false)}
            onAddElementToCanvas={handleAddElementFromAssetLibrary}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131418] text-gray-200 font-sans">
      {/* LEFT MAIN SIDEBAR */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#17191f] border-r border-[#2b2f3e] flex flex-col justify-between transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2b2f3e]">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-900/40">
                AS
              </div>
              <div className="flex items-center text-lg font-black tracking-tight text-white">
                <span>animate</span>
                <span className="text-blue-500 ml-1">studio</span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 flex flex-col gap-1 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveView('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeView === 'dashboard'
                  ? 'bg-[#2563eb] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#222530]'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveView('studio');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-[#222530]"
            >
              <Clapperboard size={16} />
              <span>Animate Studio Canvas</span>
            </button>

            <button
              onClick={() => {
                setEditingCharacter(undefined);
                setActiveView('character_rig');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeView === 'character_rig'
                  ? 'bg-[#2563eb] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#222530]'
              }`}
            >
              <Bone size={16} />
              <span>Character Rig Studio</span>
            </button>

            <button
              onClick={() => {
                setActiveView('motion');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeView === 'motion'
                  ? 'bg-[#2563eb] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#222530]'
              }`}
            >
              <Activity size={16} />
              <span>Motion Capture & Clips</span>
            </button>

            <button
              onClick={() => {
                setActiveView('audio');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeView === 'audio'
                  ? 'bg-[#2563eb] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#222530]'
              }`}
            >
              <Mic size={16} />
              <span>AI Voice & Lip-Sync</span>
            </button>

            <button
              onClick={() => {
                setIsAssetModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#222530] transition-colors"
            >
              <Layers size={16} />
              <span>Asset Library</span>
            </button>
          </nav>
        </div>

        {/* User Profile & Subscription Footer */}
        <div className="p-4 border-t border-[#2b2f3e] bg-[#14161c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow">
              AS
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">Animate Studio Pro</div>
              <div className="text-[10px] text-emerald-400 font-medium">All Features • Active</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Top App Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1a1c23] border-b border-[#2b2f3e]">
          <div className="flex items-center gap-2">
            <button
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-[#222530]"
            >
              <Menu size={18} />
            </button>
            <span className="text-sm font-bold text-white">Animate Studio</span>
          </div>

          <OfflineBanner />
        </div>

        {/* CURRENT ACTIVE VIEW */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {activeView === 'dashboard' && (
            <DashboardView
              projects={projects}
              onOpenProject={(proj) => {
                setCurrentProjectId(proj.id);
                setActiveView('studio');
              }}
              onCreateNewProject={() => setIsCreateModalOpen(true)}
              onDeleteProject={handleDeleteProject}
              onOpenCharacterRigStudio={() => {
                setEditingCharacter(undefined);
                setActiveView('character_rig');
              }}
              onOpenMotionStudio={() => setActiveView('motion')}
              onOpenAudioStudio={() => setActiveView('audio')}
              onExportProject={handleExportProject}
              onImportProject={handleImportProject}
            />
          )}


          {activeView === 'character_rig' && (
            <CharacterRigStudio
              initialCharacter={editingCharacter}
              onSaveCharacter={handleSaveCharacterFromRigStudio}
              onClose={() => setActiveView('studio')}
            />
          )}

          {activeView === 'motion' && (
            <MotionStudio
              onApplyClipToCharacter={handleApplyMotionClip}
              onAddCustomClip={(newClip) => {
                // Keep in memory or project
              }}
            />
          )}

          {activeView === 'audio' && (
            <AudioVoiceStudio
              onAddAudioToTimeline={handleAddAudioToActiveScene}
              sceneCharacters={activeSceneCharacters}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={handleCreateNewProject}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onApplyTemplate={handleApplyTemplateScene}
      />

      <AssetLibraryModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onAddElementToCanvas={handleAddElementFromAssetLibrary}
      />
    </div>
  );
}
