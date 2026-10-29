import React, { useState } from 'react';
import { AspectRatio, StudioProject } from '../types/studio';
import { Tv, Smartphone, X, Sparkles } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (title: string, ratio: AspectRatio) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [title, setTitle] = useState<string>('New Animation Project');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateProject(title.trim(), aspectRatio);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#1a1c23] border border-[#2b2f3e] rounded-2xl shadow-2xl p-6 text-left">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-blue-500" />
            Create new project
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Village Comedy Tale Ep 1"
              required
              className="w-full px-3.5 py-2.5 bg-[#131418] border border-[#2b2f3e] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Canvas Size: 16:9 vs 9:16 - Matching Screenshot 3 */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Canvas Size
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-white text-gray-900 border-white shadow-lg'
                    : 'bg-[#131418] text-gray-400 border-[#2b2f3e] hover:border-gray-500 hover:text-white'
                }`}
              >
                <Tv size={16} />
                <span>16:9 (Desktop / Landscape)</span>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-white text-gray-900 border-white shadow-lg'
                    : 'bg-[#131418] text-gray-400 border-[#2b2f3e] hover:border-gray-500 hover:text-white'
                }`}
              >
                <Smartphone size={16} />
                <span>9:16 (Phone / Shorts)</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2b2f3e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/30 transition-all"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
