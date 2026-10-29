/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AspectRatio, StudioProject } from '../types/studio';

export type ExportFormat = 'webm' | 'mp4' | 'gif' | 'png_sequence';
export type ExportResolutionPreset = '480p' | '720p' | '1080p' | '4k';
export type ExportFps = 24 | 30 | 60;
export type ExportQualityPreset = 'standard' | 'high' | 'master';
export type ExportRenderStyle =
  | 'standard_2d'
  | 'cinematic_anime'
  | 'toon_3d_cel'
  | 'vintage_storybook'
  | 'neon_pop'
  | 'noir_sketch';

export interface ExportStylePresetInfo {
  id: ExportRenderStyle;
  name: string;
  badge: string;
  description: string;
}

export const EXPORT_STYLE_PRESETS: ExportStylePresetInfo[] = [
  {
    id: 'standard_2d',
    name: 'Crisp Vector 2D Cartoon',
    badge: 'Studio Default',
    description: 'Clean broadcast-ready 2D animation with vibrant colors and sharp outlines.',
  },
  {
    id: 'cinematic_anime',
    name: 'Cinematic Anime Glow',
    badge: 'Popular',
    description: 'Soft atmospheric bloom, dramatic rim lighting, and rich anime color grading.',
  },
  {
    id: 'toon_3d_cel',
    name: '3D Cel-Shaded Toon',
    badge: 'Ultra HD',
    description: 'Deep directional shading, bold ink contours, and high-contrast studio depth.',
  },
  {
    id: 'vintage_storybook',
    name: 'Warm Desi Storybook',
    badge: 'Moral Stories',
    description: 'Warm golden-hour nostalgia tint ideal for folk tales and moral stories.',
  },
  {
    id: 'neon_pop',
    name: 'Vibrant Reels Pop',
    badge: 'Shorts / Reels',
    description: 'High-saturation punchy colors optimized for YouTube Shorts and Instagram.',
  },
  {
    id: 'noir_sketch',
    name: 'Dramatic Noir Cinema',
    badge: 'Horror / Drama',
    description: 'High-contrast monochrome cinema look with deep shadows and vignette.',
  },
];

export interface ExportSettings {
  format: ExportFormat;
  resolutionPreset: ExportResolutionPreset;
  fps: ExportFps;
  quality: ExportQualityPreset;
  renderStyle?: ExportRenderStyle;
  includeAudio: boolean;
  selectedSceneIds: string[]; // empty means all
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'mp4',
  resolutionPreset: '1080p',
  fps: 30,
  quality: 'master',
  renderStyle: 'standard_2d',
  includeAudio: true,
  selectedSceneIds: [],
};

/**
 * Calculates pixel dimensions based on project aspect ratio and target resolution preset.
 */
export function calculateExportDimensions(
  aspectRatio: AspectRatio,
  resolutionPreset: ExportResolutionPreset
): { width: number; height: number } {
  const is16by9 = aspectRatio === '16:9';

  switch (resolutionPreset) {
    case '4k':
      return is16by9 ? { width: 3840, height: 2160 } : { width: 2160, height: 3840 };
    case '1080p':
      return is16by9 ? { width: 1920, height: 1080 } : { width: 1080, height: 1920 };
    case '720p':
      return is16by9 ? { width: 1280, height: 720 } : { width: 720, height: 1280 };
    case '480p':
    default:
      return is16by9 ? { width: 854, height: 480 } : { width: 480, height: 854 };
  }
}

/**
 * Calculates total frames to render given duration and fps.
 */
export function calculateTotalFrames(durationSeconds: number, fps: number): number {
  if (durationSeconds <= 0 || fps <= 0) return 0;
  return Math.ceil(durationSeconds * fps);
}

/**
 * Estimates file size in megabytes and formatted string based on settings.
 */
export function estimateExportFileSize(
  durationSeconds: number,
  fps: number,
  format: ExportFormat,
  quality: ExportQualityPreset,
  resolutionPreset: ExportResolutionPreset
): { bytes: number; formatted: string } {
  if (durationSeconds <= 0) return { bytes: 0, formatted: '0 KB' };

  if (format === 'gif') {
    const resMultiplier =
      resolutionPreset === '4k'
        ? 4.0
        : resolutionPreset === '1080p'
        ? 2.2
        : resolutionPreset === '720p'
        ? 1.0
        : 0.45;
    const baseBytesPerFrame = 25000 * resMultiplier;
    const effectiveFps = Math.min(fps, 24);
    const totalFrames = durationSeconds * effectiveFps;
    const bytes = Math.round(totalFrames * baseBytesPerFrame);
    const mb = bytes / (1024 * 1024);
    return {
      bytes,
      formatted: mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`,
    };
  }

  let mbps = 8;
  if (quality === 'standard') mbps = 5;
  if (quality === 'high') mbps = 12;
  if (quality === 'master') mbps = 24;

  if (resolutionPreset === '4k') mbps *= 2.2;
  else if (resolutionPreset === '720p') mbps *= 0.65;
  else if (resolutionPreset === '480p') mbps *= 0.35;

  if (fps === 60) mbps *= 1.35;
  else if (fps === 24) mbps *= 0.9;

  const totalBits = mbps * 1_000_000 * durationSeconds;
  const bytes = Math.round(totalBits / 8);
  const mb = bytes / (1024 * 1024);

  return {
    bytes,
    formatted: mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`,
  };
}

/**
 * Creates a clean safe filename for download.
 */
export function generateExportFilename(
  projectTitle: string,
  format: ExportFormat,
  resolutionPreset: ExportResolutionPreset,
  fps: ExportFps
): string {
  const cleanTitle =
    projectTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/gi, '_')
      .replace(/^_+|_+$/g, '') || 'animation_project';

  return `${cleanTitle}_${resolutionPreset}_${fps}fps.${format}`;
}

/**
 * Formats seconds into MM:SS or S.s
 */
export function formatRenderTime(seconds: number): string {
  if (seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculates effective project duration considering selected scenes.
 */
export function getExportProjectDuration(
  project: StudioProject,
  selectedSceneIds: string[]
): number {
  const scenesToExport =
    selectedSceneIds.length > 0
      ? project.scenes.filter((s) => selectedSceneIds.includes(s.id))
      : project.scenes;

  return scenesToExport.reduce((acc, scene) => acc + (scene.duration || 5), 0);
}
