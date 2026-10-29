/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { StudioProject, StudioScene } from '../types/studio';
import {
  ExportFormat,
  ExportSettings,
  DEFAULT_EXPORT_SETTINGS,
  EXPORT_STYLE_PRESETS,
  calculateExportDimensions,
  calculateTotalFrames,
  estimateExportFileSize,
  generateExportFilename,
  formatRenderTime,
  getExportProjectDuration,
} from '../utils/exportEngine';
import {
  X,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Film,
  Palette,
} from 'lucide-react';

interface ExportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: StudioProject;
}

type RenderPhase = 'settings' | 'rendering' | 'completed';

export const ExportProjectModal: React.FC<ExportProjectModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  const [phase, setPhase] = useState<RenderPhase>('settings');
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [currentRenderFrame, setCurrentRenderFrame] = useState<number>(0);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [generatedFilename, setGeneratedFilename] = useState<string>('');
  const [actualFileSizeStr, setActualFileSizeStr] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderCancelledRef = useRef<boolean>(false);
  const pausedRef = useRef<boolean>(false);
  pausedRef.current = isPaused;

  const totalDuration = getExportProjectDuration(project, settings.selectedSceneIds);
  const totalFrames = calculateTotalFrames(totalDuration, settings.fps);
  const dimensions = calculateExportDimensions(project.aspectRatio, settings.resolutionPreset);
  const estimatedSize = estimateExportFileSize(
    totalDuration,
    settings.fps,
    settings.format,
    settings.quality,
    settings.resolutionPreset
  );

  useEffect(() => {
    if (isOpen) {
      setPhase('settings');
      setRenderProgress(0);
      setCurrentRenderFrame(0);
      setElapsedSeconds(0);
      setIsPaused(false);
      renderCancelledRef.current = false;
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSceneSelection = (sceneId: string) => {
    setSettings((prev) => {
      const exists = prev.selectedSceneIds.includes(sceneId);
      const newSelection = exists
        ? prev.selectedSceneIds.filter((id) => id !== sceneId)
        : [...prev.selectedSceneIds, sceneId];
      return { ...prev, selectedSceneIds: newSelection };
    });
  };

  const startRendering = async () => {
    setPhase('rendering');
    setRenderProgress(0);
    setCurrentRenderFrame(0);
    setElapsedSeconds(0);
    renderCancelledRef.current = false;
    setIsPaused(false);

    let canvas = canvasRef.current;
    for (let retry = 0; retry < 20; retry++) {
      if (canvasRef.current) {
        canvas = canvasRef.current;
        break;
      }
      await new Promise((r) => setTimeout(r, 30));
    }
    if (!canvas) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = Date.now();
    const scenesToRender =
      settings.selectedSceneIds.length > 0
        ? project.scenes.filter((s) => settings.selectedSceneIds.includes(s.id))
        : project.scenes;

    let mediaRecorder: MediaRecorder | null = null;
    const recordedChunks: Blob[] = [];

    try {
      if (typeof MediaRecorder !== 'undefined' && canvas.captureStream) {
        const stream = canvas.captureStream(settings.fps);
        let mimeType = 'video/webm;codecs=vp9';
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
          mimeType = 'video/mp4;codecs=avc1';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
          mimeType = 'video/webm;codecs=h264';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        }

        mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond:
            settings.quality === 'master'
              ? 24000000
              : settings.quality === 'high'
              ? 12000000
              : 5000000,
        });

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        mediaRecorder.start(100);
      }
    } catch {
      // Fallback gracefully
    }

    const fpsInterval = 1000 / settings.fps;
    let globalFrame = 0;

    for (let sIdx = 0; sIdx < scenesToRender.length; sIdx++) {
      if (renderCancelledRef.current) break;
      setCurrentSceneIndex(sIdx);
      const scene = scenesToRender[sIdx];
      const sceneDuration = scene.duration || 5;
      const sceneFrames = Math.ceil(sceneDuration * settings.fps);

      for (let f = 0; f < sceneFrames; f++) {
        if (renderCancelledRef.current) break;

        while (pausedRef.current && !renderCancelledRef.current) {
          await new Promise((r) => setTimeout(r, 100));
        }

        const localTime = f / settings.fps;
        const progressFrac = Math.min(1, (globalFrame + 1) / totalFrames);

        renderSceneFrame(ctx, scene, localTime, dimensions.width, dimensions.height, globalFrame);

        globalFrame++;
        setCurrentRenderFrame(globalFrame);
        setRenderProgress(Math.round(progressFrac * 100));
        setElapsedSeconds((Date.now() - startTime) / 1000);

        await new Promise((r) => setTimeout(r, Math.max(4, Math.floor(fpsInterval / 3))));
      }
    }

    if (renderCancelledRef.current) {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      setPhase('settings');
      return;
    }

    let finalBlob: Blob;
    const finalFilename = generateExportFilename(
      project.title,
      settings.format,
      settings.resolutionPreset,
      settings.fps
    );

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        if (!mediaRecorder) return resolve();
        mediaRecorder.onstop = () => resolve();
        mediaRecorder.stop();
      });

      const mimeType = settings.format === 'mp4' ? 'video/mp4' : 'image/gif';
      if (recordedChunks.length > 0) {
        finalBlob = new Blob(recordedChunks, { type: mimeType });
      } else {
        finalBlob = generateFallbackMediaBlob(canvas, settings.format);
      }
    } else {
      finalBlob = generateFallbackMediaBlob(canvas, settings.format);
    }

    const fileUrl = URL.createObjectURL(finalBlob);
    setDownloadUrl(fileUrl);
    setGeneratedFilename(finalFilename);

    const sizeInMb = finalBlob.size / (1024 * 1024);
    setActualFileSizeStr(
      sizeInMb >= 1 ? `${sizeInMb.toFixed(2)} MB` : `${Math.round(finalBlob.size / 1024)} KB`
    );

    setPhase('completed');
    triggerFileDownload(fileUrl, finalFilename);
  };

  // Render an animated frame to canvas with selected Visual Style, Weather, Sun/Moon, and Shadows
  const renderSceneFrame = (
    ctx: CanvasRenderingContext2D,
    scene: StudioScene,
    time: number,
    width: number,
    height: number,
    frameNumber: number
  ) => {
    const effects = scene.effects || {
      timeOfDay: 'day',
      showCelestial: true,
      celestialX: 82,
      celestialY: 16,
      weather: 'none',
      weatherIntensity: 60,
      windSpeed: 25,
      ambientLightIntensity: 25,
      vignette: false,
      colorFilter: 'none',
      letterbox: false,
      showGridGuides: false,
    };

    ctx.save();

    // Apply Visual Render Style filter
    const style = settings.renderStyle || 'standard_2d';
    if (style === 'cinematic_anime') {
      ctx.filter = 'contrast(1.12) saturate(1.25) brightness(1.04)';
    } else if (style === 'toon_3d_cel') {
      ctx.filter = 'contrast(1.25) saturate(1.15)';
    } else if (style === 'vintage_storybook') {
      ctx.filter = 'sepia(0.32) saturate(1.2) contrast(1.06)';
    } else if (style === 'neon_pop') {
      ctx.filter = 'saturate(1.45) contrast(1.15)';
    } else if (style === 'noir_sketch') {
      ctx.filter = 'grayscale(1) contrast(1.35)';
    }

    // 1. Sky Background based on Time of Day
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.72);
    if (effects.timeOfDay === 'night') {
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(1, '#1e1b4b');
    } else if (effects.timeOfDay === 'sunset') {
      skyGrad.addColorStop(0, '#7c2d12');
      skyGrad.addColorStop(0.5, '#ea580c');
      skyGrad.addColorStop(1, '#fde047');
    } else if (effects.timeOfDay === 'dusk') {
      skyGrad.addColorStop(0, '#1e1b4b');
      skyGrad.addColorStop(1, '#db2777');
    } else {
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(1, '#bae6fd');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Celestial Body (Sun or Moon)
    if (effects.showCelestial) {
      const cx = (effects.celestialX / 100) * width;
      const cy = (effects.celestialY / 100) * height;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(24, width * 0.032), 0, Math.PI * 2);
      ctx.fillStyle =
        effects.timeOfDay === 'night' || effects.timeOfDay === 'dusk' ? '#fef9c3' : '#fde047';
      ctx.shadowColor =
        effects.timeOfDay === 'sunset' ? 'rgba(249,115,22,0.85)' : 'rgba(250,204,21,0.8)';
      ctx.shadowBlur = 40;
      ctx.fill();
      ctx.restore();
    }

    // 3. Horizon & Ground
    const groundY = height * 0.72;
    ctx.fillStyle =
      effects.weather === 'snow'
        ? '#e2e8f0'
        : effects.timeOfDay === 'night'
        ? '#064e3b'
        : '#4ade80';
    ctx.fillRect(0, groundY, width, height - groundY);

    // 4. Draw Characters & Props with Shadows
    const elements = scene.elements || [];
    const scaleFactor = width / 960;

    elements.forEach((elem) => {
      ctx.save();
      const ex = elem.x * scaleFactor;
      const ey = elem.y * scaleFactor;
      const es = (elem.scale || 1) * scaleFactor;

      ctx.translate(ex, ey);
      ctx.rotate(((elem.rotation || 0) * Math.PI) / 180);
      ctx.scale(es, es);

      if (elem.type === 'character' && elem.characterData) {
        const bob = Math.sin(time * 6) * 6;
        const armSwing = Math.sin(time * 6) * 20;
        const legSwing = Math.sin(time * 6) * 24;

        // Character Ground Shadow
        if (elem.shadow?.enabled !== false) {
          ctx.fillStyle = `rgba(0, 0, 0, ${elem.shadow?.opacity ?? 0.38})`;
          ctx.beginPath();
          ctx.ellipse(0, 112, 48, 13, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.translate(0, bob);

        // Legs
        ctx.strokeStyle = elem.characterData.bottomColor || '#334155';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-15, 30);
        ctx.lineTo(-15 + legSwing, 105);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(15, 30);
        ctx.lineTo(15 - legSwing, 105);
        ctx.stroke();

        // Torso
        ctx.fillStyle = elem.characterData.shirtColor || '#2563eb';
        ctx.beginPath();
        ctx.roundRect(-26, -30, 52, 65, 8);
        ctx.fill();

        // Arms
        ctx.strokeStyle = elem.characterData.skinColor || '#d49b6a';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(-28, -20);
        ctx.lineTo(-38 - armSwing, 25);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(28, -20);
        ctx.lineTo(38 + armSwing, 25);
        ctx.stroke();

        // Head
        ctx.fillStyle = elem.characterData.skinColor || '#d49b6a';
        ctx.beginPath();
        ctx.arc(0, -60, 28, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-9, -62, 3.5, 0, Math.PI * 2);
        ctx.arc(9, -62, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Lip-Sync Mouth
        const mouthOpen = Math.abs(Math.sin(time * 8)) * 8;
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(0, -48, 6, Math.max(2, mouthOpen), 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, -72, 28, Math.PI, Math.PI * 2);
        ctx.fill();
      } else if (elem.type === 'prop') {
        ctx.font = '54px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(elem.propIcon || '📦', 0, 0);
      }

      ctx.restore();
    });

    // 5. Weather Particles (Rain / Snow)
    if (effects.weather === 'rain' || effects.weather === 'storm') {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 45; i++) {
        const rx = ((i * 97 + time * 180) % width);
        const ry = ((i * 61 + time * 520) % height);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + 24);
        ctx.stroke();
      }
    } else if (effects.weather === 'snow') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 83 + Math.sin(time * 2 + i) * 20) % width);
        const sy = ((i * 53 + time * 140) % height);
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // 6. Animate Studio Watermark & Timecode
    ctx.save();
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.textAlign = 'right';
    ctx.fillText('Animate Studio Pro', width - 24, height - 20);

    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'left';
    ctx.fillText(
      `TC: ${formatRenderTime(time)} | FR: #${frameNumber + 1} | STYLE: ${style.toUpperCase()}`,
      24,
      height - 20
    );
    ctx.restore();
  };

  const generateFallbackMediaBlob = (canvas: HTMLCanvasElement, format: ExportFormat): Blob => {
    const dataUrl = canvas.toDataURL(format === 'gif' ? 'image/png' : 'image/jpeg', 0.95);
    const byteString = atob(dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: format === 'mp4' ? 'video/mp4' : 'image/gif' });
  };

  const triggerFileDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const cancelRendering = () => {
    renderCancelledRef.current = true;
    setIsPaused(false);
    setPhase('settings');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#171920] border border-[#2b2f3e] rounded-2xl w-full max-w-3xl text-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2f3e] bg-[#1a1c24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <Film size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Animate Studio — Best Quality Multi-Style Video Export
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {project.aspectRatio === '9:16' ? '9:16 Shorts' : '16:9 Cinema'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Project: <span className="text-gray-200 font-medium">{project.title}</span> •{' '}
                {project.scenes.length} Scenes • {totalDuration.toFixed(1)}s Duration
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (phase === 'rendering') cancelRendering();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#252936] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {phase === 'settings' && (
            <>
              {/* 1. VISUAL RENDER STYLE SELECTOR ("best quality export do wtih different style") */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Palette size={14} /> 1. Choose Animation Visual Render Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {EXPORT_STYLE_PRESETS.map((st) => {
                    const isSelected = (settings.renderStyle || 'standard_2d') === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, renderStyle: st.id })}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500 shadow-md'
                            : 'bg-[#1e222d] border-[#2b2f3e] text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white">{st.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/25 text-blue-300 font-semibold shrink-0">
                              {st.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                            {st.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. EXPORT FORMAT */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  2. Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, format: 'mp4' })}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      settings.format === 'mp4'
                        ? 'bg-blue-600/15 border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-[#1e222d] border-[#2b2f3e] text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        settings.format === 'mp4'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#282d3c] text-gray-400'
                      }`}
                    >
                      <Video size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>MP4 Video (Master H.264)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300">
                          Best Quality
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Full HD / 4K video with lip-sync voiceover, weather FX, and shadows.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, format: 'gif' })}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      settings.format === 'gif'
                        ? 'bg-blue-600/15 border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-[#1e222d] border-[#2b2f3e] text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        settings.format === 'gif'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#282d3c] text-gray-400'
                      }`}
                    >
                      <ImageIcon size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Animated Loop GIF</div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Seamless looping animation for social sharing and stickers.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. RESOLUTION & FPS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    3. Resolution Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: '4k', label: '4K Ultra HD', badge: 'Master' },
                        { id: '1080p', label: '1080p Full HD', badge: 'Optimal' },
                        { id: '720p', label: '720p HD', badge: 'Fast' },
                        { id: '480p', label: '480p Social', badge: 'Compact' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, resolutionPreset: item.id })}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          settings.resolutionPreset === item.id
                            ? 'bg-blue-600/15 border-blue-500 text-white ring-1 ring-blue-500'
                            : 'bg-[#1e222d] border-[#2b2f3e] text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{item.label}</span>
                          <span className="text-[9px] px-1 rounded bg-[#282d3c] text-gray-300">
                            {item.badge}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    4. Frame Rate & Bitrate
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([24, 30, 60] as const).map((fps) => (
                      <button
                        key={fps}
                        type="button"
                        onClick={() => setSettings({ ...settings, fps })}
                        className={`py-2 px-2 rounded-lg border text-center transition-all ${
                          settings.fps === fps
                            ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                            : 'bg-[#1e222d] border-[#2b2f3e] text-gray-400 hover:border-gray-500 text-xs'
                        }`}
                      >
                        <div className="text-xs">{fps} FPS</div>
                        <div className="text-[9px] text-gray-400">
                          {fps === 24 ? 'Cinema' : fps === 30 ? 'HD' : 'Ultra Smooth'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="p-3 bg-gradient-to-r from-blue-950/30 to-purple-950/30 border border-blue-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-blue-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {settings.format.toUpperCase()} • {dimensions.width}×{dimensions.height} px •{' '}
                      {settings.fps} FPS • Style: {(settings.renderStyle || 'standard_2d').toUpperCase()}
                    </div>
                    <div className="text-[11px] text-gray-300">
                      Total frames: {totalFrames} • Duration: {totalDuration.toFixed(1)}s • Est.{' '}
                      {estimatedSize.formatted}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {phase === 'rendering' && (
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="text-sm font-bold text-white mb-1 flex items-center justify-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>Rendering Animate Studio Master Video...</span>
                </div>
                <p className="text-xs text-gray-400">
                  Compositing 5-angle characters, shadows, weather particles, and lip-sync
                </p>
              </div>

              <div className="relative aspect-video max-w-md mx-auto rounded-xl overflow-hidden border border-[#2b2f3e] bg-black shadow-inner flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-emerald-400 border border-emerald-500/40">
                  LIVE RENDER PASS ({settings.renderStyle})
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-gray-300">
                  Frame {currentRenderFrame} / {totalFrames}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-300">
                    Scene {currentSceneIndex + 1} of {project.scenes.length}
                  </span>
                  <span className="text-blue-400 font-mono text-sm">{renderProgress}%</span>
                </div>
                <div className="w-full h-3 bg-[#1e222d] rounded-full overflow-hidden border border-[#2b2f3e] p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full transition-all duration-150"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {phase === 'completed' && (
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Rendering Complete!</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Your Animate Studio video was rendered in{' '}
                  {(settings.renderStyle || 'standard_2d').replace(/_/g, ' ')} style.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2b2f3e] max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">File Name:</span>
                  <span className="font-mono text-white text-[11px] truncate max-w-[220px]">
                    {generatedFilename}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Resolution & Style:</span>
                  <span className="font-mono text-white">
                    {dimensions.width}×{dimensions.height} ({settings.renderStyle})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">File Size:</span>
                  <span className="font-mono text-emerald-400 font-bold">{actualFileSizeStr}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                {downloadUrl && (
                  <button
                    type="button"
                    onClick={() => triggerFileDownload(downloadUrl, generatedFilename)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    <Download size={15} />
                    <span>Download Video</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPhase('settings')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#282d3c] hover:bg-[#343a4e] text-gray-200 text-xs font-semibold border border-[#3b4256]"
                >
                  <RotateCcw size={14} />
                  <span>Try Another Style</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-[#2b2f3e] bg-[#1a1c24] flex items-center justify-between">
          {phase === 'settings' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={startRendering}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition-all"
              >
                <Film size={15} />
                <span>Start Best Quality Export ({settings.format.toUpperCase()})</span>
              </button>
            </>
          )}

          {phase === 'rendering' && (
            <>
              <button
                type="button"
                onClick={cancelRendering}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300"
              >
                Cancel Render
              </button>

              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#282d3c] text-white text-xs font-semibold border border-[#3b4256]"
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                <span>{isPaused ? 'Resume Render' : 'Pause Render'}</span>
              </button>
            </>
          )}

          {phase === 'completed' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#282d3c] hover:bg-[#343a4e] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
