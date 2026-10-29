import React, { useState } from 'react';
import { StudioProject } from '../types/studio';
import {
  Sparkles,
  Plus,
  Tv,
  Smartphone,
  Clapperboard,
  Presentation,
  PenTool,
  Mic,
  Video,
  FileText,
  Search,
  Trash2,
  Download,
  Upload,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  Film,
} from 'lucide-react';
import { ExportProjectModal } from './ExportProjectModal';

interface DashboardViewProps {
  projects: StudioProject[];
  onOpenProject: (proj: StudioProject) => void;
  onCreateNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onOpenCharacterRigStudio: () => void;
  onOpenMotionStudio: () => void;
  onOpenAudioStudio: () => void;
  onExportProject: (proj: StudioProject) => void;
  onImportProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onOpenProject,
  onCreateNewProject,
  onDeleteProject,
  onOpenCharacterRigStudio,
  onOpenMotionStudio,
  onOpenAudioStudio,
  onExportProject,
  onImportProject,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedProjectForRender, setSelectedProjectForRender] = useState<StudioProject | null>(null);

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#131418] text-gray-200 p-6 md:p-8">
      {/* SEARCH HEADER - Matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Welcome back, Creator</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 font-mono">
              Pro Studio
            </span>
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Build animated cartoons, rig customized characters, and produce viral stories
          </p>
        </div>

        <div className="w-full sm:w-80 relative">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects or creator tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1c23] border border-[#2b2f3e] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* FEATURED PLATFORMS - MATCHING SCREENSHOT 2 */}
      <div className="mb-8">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5">
          FEATURED PLATFORMS
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Animation Studio (Primary) */}
          <div
            onClick={projects.length > 0 ? () => onOpenProject(projects[0]) : onCreateNewProject}
            className="group relative rounded-2xl p-4 bg-gradient-to-br from-[#1e2330] to-[#181a22] border border-blue-500/60 hover:border-blue-400 cursor-pointer shadow-lg hover:shadow-blue-900/20 transition-all flex flex-col justify-between h-44 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold mb-2">
              <Layers size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-blue-400 flex items-center justify-between">
                <span>Animation Studio</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Multi-scene 2D timeline, scene props & camera directors
              </p>
            </div>
          </div>

          {/* Card 2: Cinema Studio */}
          <div
            onClick={projects.length > 0 ? () => onOpenProject(projects[0]) : onCreateNewProject}
            className="group rounded-2xl p-4 bg-[#1a1c23] border border-[#2b2f3e] hover:border-gray-500 cursor-pointer shadow transition-all flex flex-col justify-between h-44"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold mb-2">
              <Clapperboard size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-amber-400 flex items-center justify-between">
                <span>Cinema Studio</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Cinematic letterbox, lighting filters & dramatic pan
              </p>
            </div>
          </div>

          {/* Card 3: Ad Studio */}
          <div
            onClick={onCreateNewProject}
            className="group rounded-2xl p-4 bg-[#1a1c23] border border-[#2b2f3e] hover:border-gray-500 cursor-pointer shadow transition-all flex flex-col justify-between h-44"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold mb-2">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-emerald-400 flex items-center justify-between">
                <span>Ad Studio</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Shorts/Reels 9:16 commercial promo videos
              </p>
            </div>
          </div>

          {/* Card 4: Whiteboard AI */}
          <div
            onClick={onCreateNewProject}
            className="group rounded-2xl p-4 bg-[#1a1c23] border border-[#2b2f3e] hover:border-gray-500 cursor-pointer shadow transition-all flex flex-col justify-between h-44"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold mb-2">
              <Presentation size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-purple-400 flex items-center justify-between">
                <span>Whiteboard AI</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Doodle hand drawing & explainer educational scenes
              </p>
            </div>
          </div>

          {/* Card 5: AI Channel Guru */}
          <div
            onClick={onOpenAudioStudio}
            className="group rounded-2xl p-4 bg-[#1a1c23] border border-[#2b2f3e] hover:border-gray-500 cursor-pointer shadow transition-all flex flex-col justify-between h-44"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold mb-2">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-rose-400 flex items-center justify-between">
                <span>AI Channel Guru</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Niche topics, viral hooks & automated cartoon scripts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MORE CREATOR TOOLS - MATCHING SCREENSHOT 2 */}
      <div className="mb-9">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5">
          MORE CREATOR TOOLS
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Tool 1: Character Rigging Studio */}
          <div
            onClick={onOpenCharacterRigStudio}
            className="p-4 rounded-xl bg-[#17191f] border border-[#2b2f3e] hover:border-blue-500/80 cursor-pointer transition-all flex items-start gap-3.5 group shadow"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <PenTool size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                <span>Character Rig Studio</span>
                <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-400">NEW</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Customize village characters, turbans, dresses & drag bone skeleton pins
              </p>
            </div>
          </div>

          {/* Tool 2: Motion Capture & Clips */}
          <div
            onClick={onOpenMotionStudio}
            className="p-4 rounded-xl bg-[#17191f] border border-[#2b2f3e] hover:border-emerald-500/80 cursor-pointer transition-all flex items-start gap-3.5 group shadow"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Activity size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                <span>Motion Capture & Clips</span>
                <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400">PRO</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Optical webcam tracking & library of walk, dance, and namaste clips
              </p>
            </div>
          </div>

          {/* Tool 3: AI Voice & Audio SFX */}
          <div
            onClick={onOpenAudioStudio}
            className="p-4 rounded-xl bg-[#17191f] border border-[#2b2f3e] hover:border-purple-500/80 cursor-pointer transition-all flex items-start gap-3.5 group shadow"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Mic size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
                <span>AI Voice & Sound FX</span>
                <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-400">HOT</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Text-to-Speech Hindi/English, Cow/Dog sounds, Tractor/Work SFX & mic recorder
              </p>
            </div>
          </div>

          {/* Tool 4: AI Story Writer */}
          <div
            onClick={onCreateNewProject}
            className="p-4 rounded-xl bg-[#17191f] border border-[#2b2f3e] hover:border-amber-500/80 cursor-pointer transition-all flex items-start gap-3.5 group shadow"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                AI Story Writer
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Draft compelling Indian moral stories, jokes & fairy tales
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* YOUR ANIMATION PROJECTS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white">Your Animation Projects</h2>
            <span className="text-xs px-2 py-0.5 bg-[#1a1c23] border border-[#2b2f3e] rounded-full text-gray-400">
              {projects.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Export Video / GIF Button */}
            {projects.length > 0 && (
              <button
                onClick={() => setSelectedProjectForRender(projects[0])}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1c23] hover:bg-[#222530] text-blue-400 hover:text-blue-300 rounded-lg text-xs font-semibold border border-blue-500/30 transition-colors"
                title="Render Project as MP4 or GIF"
              >
                <Film size={13} />
                <span>Export Video / GIF</span>
              </button>
            )}

            {/* Import Project JSON */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1c23] hover:bg-[#222530] text-gray-300 rounded-lg text-xs font-semibold border border-[#2b2f3e] cursor-pointer">
              <Upload size={13} />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportProject}
                className="hidden"
              />
            </label>

            {/* Create Project Button */}
            <button
              onClick={onCreateNewProject}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-900/30 transition-all"
            >
              <Plus size={14} /> Create Project
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onOpenProject(project)}
              className="group rounded-2xl bg-[#17191f] border border-[#2b2f3e] hover:border-blue-500/70 p-3.5 cursor-pointer shadow-md transition-all flex flex-col justify-between"
            >
              {/* Preview Thumbnail Box */}
              <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-[#1e2330] to-[#121318] border border-gray-800/80 mb-3 relative overflow-hidden flex items-center justify-center">
                <div className="flex flex-col items-center text-center p-2">
                  <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mb-1">
                    {project.aspectRatio === '9:16' ? <Smartphone size={18} /> : <Tv size={18} />}
                  </div>
                  <span className="text-[11px] font-bold text-gray-200 line-clamp-1">
                    {project.scenes[0]?.name || 'Scene 1'}
                  </span>
                </div>

                {/* Aspect ratio badge */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono text-gray-300 border border-gray-800">
                  {project.aspectRatio}
                </div>
              </div>

              {/* Title & Metadata */}
              <div>
                <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  {project.title}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 flex items-center justify-between">
                  <span>{project.scenes.length} Scenes</span>
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action buttons on card */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#222530] gap-1">
                {/* Primary Render MP4/GIF Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProjectForRender(project);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-[11px] font-bold transition-all shadow-sm"
                  title="Render & Export as MP4 or GIF"
                >
                  <Film size={12} />
                  <span>Render</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportProject(project);
                    }}
                    className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                    title="Backup Project JSON"
                  >
                    <Download size={12} /> Backup
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete project "${project.title}"?`)) {
                        onDeleteProject(project.id);
                      }
                    }}
                    className="text-[11px] text-gray-400 hover:text-red-400 flex items-center gap-1 p-0.5"
                    title="Delete Project"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EXPORT PROJECT MODAL */}
      {selectedProjectForRender && (
        <ExportProjectModal
          isOpen={!!selectedProjectForRender}
          onClose={() => setSelectedProjectForRender(null)}
          project={selectedProjectForRender}
        />
      )}
    </div>
  );
};
