import {
  CharacterKeyframe,
  CameraKeyframe,
  EasingType,
  CharacterViewAngle,
  EyeExpression,
  VisemeShape,
} from '../types/studio';

/**
 * Calculates easing curve progress for a given linear alpha (0 to 1)
 */
export function interpolateEasing(t: number, easing: EasingType = 'linear'): number {
  const clamped = Math.max(0, Math.min(1, t));
  switch (easing) {
    case 'ease-in':
      return clamped * clamped;
    case 'ease-out':
      return clamped * (2 - clamped);
    case 'bounce': {
      let n1 = 7.5625;
      let d1 = 2.75;
      let x = clamped;
      if (x < 1 / d1) {
        return n1 * x * x;
      } else if (x < 2 / d1) {
        x -= 1.5 / d1;
        return n1 * x * x + 0.75;
      } else if (x < 2.5 / d1) {
        x -= 2.25 / d1;
        return n1 * x * x + 0.9375;
      } else {
        x -= 2.625 / d1;
        return n1 * x * x + 0.984375;
      }
    }
    case 'linear':
    default:
      return clamped;
  }
}

/**
 * Creates default fallback keyframe
 */
export function createDefaultKeyframe(time = 0, fps = 24): CharacterKeyframe {
  return {
    id: `kf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    time,
    frame: Math.round(time * fps),
    easing: 'linear',
    x: 480,
    y: 270,
    scale: 1.0,
    rotation: 0,
    flipX: false,
    viewAngle: 'front',
    expression: 'neutral',
    viseme: 'closed',
    pupilLook: { x: 0, y: 0 },
  };
}

/**
 * Interpolates character properties at time t given a sorted list of keyframes
 */
export function interpolateCharacterKeyframes(
  keyframes: CharacterKeyframe[] | undefined,
  time: number,
  fallback?: Partial<CharacterKeyframe>
): CharacterKeyframe {
  const base: CharacterKeyframe = {
    ...createDefaultKeyframe(time),
    ...(fallback || {}),
  };

  if (!keyframes || keyframes.length === 0) {
    return base;
  }

  // Sort keyframes by time
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  if (time <= sorted[0].time) {
    return { ...sorted[0], time };
  }

  if (time >= sorted[sorted.length - 1].time) {
    return { ...sorted[sorted.length - 1], time };
  }

  // Find surrounding keyframes
  let prev = sorted[0];
  let next = sorted[1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i].time && time <= sorted[i + 1].time) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }

  const duration = next.time - prev.time;
  if (duration <= 0.0001) {
    return { ...prev, time };
  }

  const alpha = (time - prev.time) / duration;
  const eased = interpolateEasing(alpha, prev.easing || 'linear');

  // Continuous numeric interpolation
  const x = prev.x + (next.x - prev.x) * eased;
  const y = prev.y + (next.y - prev.y) * eased;
  const scale = prev.scale + (next.scale - prev.scale) * eased;
  const rotation = prev.rotation + (next.rotation - prev.rotation) * eased;
  const pupilX = prev.pupilLook.x + (next.pupilLook.x - prev.pupilLook.x) * eased;
  const pupilY = prev.pupilLook.y + (next.pupilLook.y - prev.pupilLook.y) * eased;

  // Discrete stepped properties switch at midpoint
  const isSecondHalf = eased >= 0.5;
  const activeKf = isSecondHalf ? next : prev;

  // Smoothly interpolate bodyPartAngles if present on either keyframe
  let interpolatedAngles: Record<string, number> | undefined = activeKf.bodyPartAngles;
  if (prev.bodyPartAngles || next.bodyPartAngles) {
    const pAngles = prev.bodyPartAngles || {};
    const nAngles = next.bodyPartAngles || {};
    const allKeys = new Set([...Object.keys(pAngles), ...Object.keys(nAngles)]);
    interpolatedAngles = {};
    allKeys.forEach((k) => {
      const v1 = pAngles[k] ?? 0;
      const v2 = nAngles[k] ?? 0;
      interpolatedAngles![k] = Math.round((v1 + (v2 - v1) * eased) * 10) / 10;
    });
  }

  return {
    id: `eval_${time.toFixed(2)}`,
    time,
    frame: Math.round(time * 24),
    easing: prev.easing,
    x,
    y,
    scale,
    rotation,
    flipX: activeKf.flipX,
    viewAngle: activeKf.viewAngle,
    expression: activeKf.expression,
    viseme: activeKf.viseme,
    pupilLook: { x: pupilX, y: pupilY },
    posePreset: activeKf.posePreset,
    bodyPartAngles: interpolatedAngles,
  };
}


/**
 * Creates default camera keyframe
 */
export function createDefaultCameraKeyframe(time = 0, fps = 24): CameraKeyframe {
  return {
    id: `cam_kf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    time,
    frame: Math.round(time * fps),
    easing: 'linear',
    x: 0,
    y: 0,
    zoom: 1.0,
    rotation: 0,
  };
}

/**
 * Interpolates camera keyframes (pan, zoom, rotation)
 */
export function interpolateCameraKeyframes(
  keyframes: CameraKeyframe[] | undefined,
  time: number
): CameraKeyframe {
  const base = createDefaultCameraKeyframe(time);
  if (!keyframes || keyframes.length === 0) return base;

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  if (time <= sorted[0].time) return { ...sorted[0], time };
  if (time >= sorted[sorted.length - 1].time) return { ...sorted[sorted.length - 1], time };

  let prev = sorted[0];
  let next = sorted[1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i].time && time <= sorted[i + 1].time) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }

  const duration = next.time - prev.time;
  if (duration <= 0.0001) return { ...prev, time };

  const alpha = (time - prev.time) / duration;
  const eased = interpolateEasing(alpha, prev.easing || 'linear');

  return {
    id: `cam_eval_${time.toFixed(2)}`,
    time,
    frame: Math.round(time * 24),
    easing: prev.easing,
    x: prev.x + (next.x - prev.x) * eased,
    y: prev.y + (next.y - prev.y) * eased,
    zoom: prev.zoom + (next.zoom - prev.zoom) * eased,
    rotation: prev.rotation + (next.rotation - prev.rotation) * eased,
  };
}

/**
 * Adds or updates a keyframe at time t
 */
export function autoAddOrUpdateKeyframe(
  keyframes: CharacterKeyframe[] = [],
  updates: Partial<CharacterKeyframe>,
  time: number,
  fps = 24
): CharacterKeyframe[] {
  const threshold = 0.04; // 1 frame at 24fps
  const existingIdx = keyframes.findIndex((k) => Math.abs(k.time - time) < threshold);

  if (existingIdx >= 0) {
    const updated = [...keyframes];
    updated[existingIdx] = {
      ...updated[existingIdx],
      ...updates,
      time,
      frame: Math.round(time * fps),
    };
    return updated.sort((a, b) => a.time - b.time);
  }

  // Create new keyframe
  const base = interpolateCharacterKeyframes(keyframes, time);
  const newKf: CharacterKeyframe = {
    ...base,
    ...updates,
    id: `kf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    time,
    frame: Math.round(time * fps),
  };

  return [...keyframes, newKf].sort((a, b) => a.time - b.time);
}

/**
 * Adds or updates a camera keyframe at time t
 */
export function autoAddOrUpdateCameraKeyframe(
  keyframes: CameraKeyframe[] = [],
  time: number,
  updates: Partial<CameraKeyframe>,
  fps = 24
): CameraKeyframe[] {
  const threshold = 0.04;
  const existingIdx = keyframes.findIndex((k) => Math.abs(k.time - time) < threshold);

  if (existingIdx >= 0) {
    const updated = [...keyframes];
    updated[existingIdx] = {
      ...updated[existingIdx],
      ...updates,
      time,
      frame: Math.round(time * fps),
    };
    return updated.sort((a, b) => a.time - b.time);
  }

  const base = interpolateCameraKeyframes(keyframes, time);
  const newKf: CameraKeyframe = {
    ...base,
    ...updates,
    id: `cam_kf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    time,
    frame: Math.round(time * fps),
  };

  return [...keyframes, newKf].sort((a, b) => a.time - b.time);
}

/**
 * Calculates camera viewfinder frame bounding box on a 16:9 stage canvas
 */
export function calculateCameraViewRect(
  camera: CameraKeyframe,
  stageWidth = 960,
  stageHeight = 540
): { x: number; y: number; width: number; height: number; zoom: number; rotation: number } {
  const zoom = Math.max(0.2, camera.zoom || 1.0);
  const viewWidth = stageWidth / zoom;
  const viewHeight = stageHeight / zoom;

  const centerX = stageWidth / 2 + camera.x;
  const centerY = stageHeight / 2 + camera.y;

  return {
    x: centerX - viewWidth / 2,
    y: centerY - viewHeight / 2,
    width: viewWidth,
    height: viewHeight,
    zoom,
    rotation: camera.rotation || 0,
  };
}

/**
 * Generates automatic Lip-Sync Viseme Keyframes (A, E, I, O, U, M, closed) for a given dialogue text
 */
export function generateLipSyncKeyframesForText(
  existingKeyframesOrElement:
    | CharacterKeyframe[]
    | { keyframes?: CharacterKeyframe[]; x?: number; y?: number; scale?: number; rotation?: number } = [],
  text: string,
  startTime: number,
  duration: number,
  fps = 24,
  defaultBase?: Partial<CharacterKeyframe>
): CharacterKeyframe[] {
  const existingKeyframes = Array.isArray(existingKeyframesOrElement)
    ? existingKeyframesOrElement
    : existingKeyframesOrElement?.keyframes || [];
  const elemFallback: Partial<CharacterKeyframe> = !Array.isArray(existingKeyframesOrElement)
    ? {
        x: existingKeyframesOrElement?.x ?? 200,
        y: existingKeyframesOrElement?.y ?? 200,
        scale: existingKeyframesOrElement?.scale ?? 1,
        rotation: existingKeyframesOrElement?.rotation ?? 0,
      }
    : {};

  const clean = text.trim();
  if (!clean || duration <= 0) return existingKeyframes;

  const visemeCycle: VisemeShape[] = ['A', 'E', 'O', 'M', 'I', 'U', 'A', 'closed'];
  const chars = clean.split('');
  const stepSeconds = 0.14; // ~7 mouth shapes per second for crisp cartoon lip-sync
  const totalSteps = Math.max(2, Math.floor(duration / stepSeconds));

  let updated = [...existingKeyframes];

  for (let i = 0; i <= totalSteps; i++) {
    const t = Math.round((startTime + i * stepSeconds) * 100) / 100;
    const charIdx = Math.min(chars.length - 1, Math.floor((i / totalSteps) * chars.length));
    const ch = (chars[charIdx] || '').toLowerCase();

    let viseme: VisemeShape = 'closed';
    if (i === totalSteps || ch === ' ' || ch === '.' || ch === ',') {
      viseme = i % 3 === 0 ? 'closed' : 'M';
    } else if ('aā'.includes(ch)) {
      viseme = 'A';
    } else if ('eēiīy'.includes(ch)) {
      viseme = i % 2 === 0 ? 'E' : 'I';
    } else if ('oō'.includes(ch)) {
      viseme = 'O';
    } else if ('uūw'.includes(ch)) {
      viseme = 'U';
    } else if ('mbp'.includes(ch)) {
      viseme = 'M';
    } else {
      viseme = visemeCycle[i % visemeCycle.length];
    }

    const baseState =
      updated.length > 0
        ? interpolateCharacterKeyframes(updated, t)
        : {
            ...interpolateCharacterKeyframes([], t),
            ...elemFallback,
            ...defaultBase,
          };
    updated = autoAddOrUpdateKeyframe(
      updated,
      {
        ...baseState,
        viseme,
      },
      t,
      fps
    );
  }

  // Ensure mouth closes cleanly at the end of dialogue
  const endState = interpolateCharacterKeyframes(updated, startTime + duration + 0.05);
  updated = autoAddOrUpdateKeyframe(
    updated,
    {
      ...endState,
      viseme: 'closed',
    },
    Math.round((startTime + duration + 0.05) * 100) / 100,
    fps
  );

  return updated;
}

