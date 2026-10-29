import React, { useState } from 'react';
import { StudioProject } from '../types/studio';
import {
  Save,
  Undo2,
  Redo2,
  Download,
  Settings,
  Edit2,
  Tv,
  Smartphone,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { OfflineBanner } from './OfflineBanner';

interface StudioTopBarProps {
  project: StudioProject;
  onUpdateProjectTitle: (newTitle: string) => void;
  onSaveProject: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  characterCount: number;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  project,
  onUpdateProjectTitle,
  onSaveProject,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenExportModal,
  onOpenSettingsModal,
  characterCount,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>(project.title);

  const handleFinishEditing = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      onUpdateProjectTitle(tempTitle.trim());
    } else {
      setTempTitle(project.title);
    }
  };

  return (
    <div className="h-12 px-4 bg-[#161822] border-b border-[#2b2f3e] flex items-center justify-between select-none z-40">
      {/* Left: Brand Icon, Project Name (Editable), Save Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow">
            AD
          </div>
          <span className="text-xs font-bold text-gray-200 hidden sm:inline">AutoDraft</span>
        </div>

        <div className="w-px h-5 bg-[#2b2f3e]" />

        {/* Editable Title */}
        {isEditingTitle ? (
          <input
            type="text"
            value={tempTitle}
            autoFocus
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleFinishEditing}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFinishEditing();
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

        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202330] text-gray-400 border border-[#2b2f3e]">
          16:9 • {project.fps}fps
        </span>

        <OfflineBanner />
      </div>

      {/* Right: Actions (Save, Undo, Redo, Export, Settings) */}
      <div className="flex items-center gap-2">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg bg-[#202330] hover:bg-[#2b2f3e] disabled:opacity-40 text-gray-300 hover:text-white transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg bg-[#202330] hover:bg-[#2b2f3e] disabled:opacity-40 text-gray-300 hover:text-white transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={14} />
        </button>

        <div className="w-px h-5 bg-[#2b2f3e] mx-1" />

        {/* Save */}
        <button
          onClick={onSaveProject}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#202330] hover:bg-[#2b2f3e] text-xs font-semibold text-gray-200 transition-colors border border-[#2b2f3e]"
          title="Save Project (In-Memory / IndexedDB)"
        >
          <Save size={13} />
          <span>Save</span>
        </button>

        {/* Download / Export */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all"
          title="Export Video as WebM, GIF or PNG Sequence"
        >
          <Download size={13} />
          <span>Export Video</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettingsModal}
          className="p-1.5 rounded-lg bg-[#202330] hover:bg-[#2b2f3e] text-gray-400 hover:text-white transition-colors"
          title="Project Settings & Shortcuts"
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
};
