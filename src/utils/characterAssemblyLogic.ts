import {
  CharacterConfig,
  CharacterViewAngle,
  BodyPartAngle,
  EyePoseType,
  HandPoseType,
  FingerCurlState,
  ModularBodyParts,
  AssetAngle,
  MultiAngleViews,
} from '../types/studio';
import { DEFAULT_NEUTRAL_POSE } from './riggingLogic';

export interface IKPoint {
  x: number;
  y: number;
}

export interface IKSolution {
  joint1: IKPoint;
  joint2: IKPoint;
  target: IKPoint;
  angle1: number; // degrees
  angle2: number; // degrees
  reached: boolean;
}

/**
 * 2-Bone Analytical Inverse Kinematics (IK)
 * Solves for the midpoint (e.g. Elbow or Knee) between a root joint (Shoulder/Hip)
 * and a target end-effector (Hand/Foot).
 */
export function calculateTwoBoneIK(
  root: IKPoint,
  target: IKPoint,
  len1: number,
  len2: number,
  flip: boolean = false
): IKSolution {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const dist = Math.hypot(dx, dy);

  // Maximum reachable distance (with small epsilon to avoid degenerate geometry)
  const maxDist = len1 + len2 - 0.001;
  const minDist = Math.abs(len1 - len2) + 0.001;

  let effectiveTarget = { ...target };
  let reached = true;

  if (dist > maxDist) {
    const scale = maxDist / dist;
    effectiveTarget = {
      x: root.x + dx * scale,
      y: root.y + dy * scale,
    };
    reached = false;
  } else if (dist < minDist) {
    const scale = minDist / (dist || 0.0001);
    effectiveTarget = {
      x: root.x + dx * scale,
      y: root.y + dy * scale,
    };
    reached = false;
  }

  const d = Math.hypot(effectiveTarget.x - root.x, effectiveTarget.y - root.y);
  const baseAngle = Math.atan2(effectiveTarget.y - root.y, effectiveTarget.x - root.x);

  // Law of Cosines: a^2 = b^2 + c^2 - 2bc*cos(A)
  // angle at root:
  const cosAngle1 = (len1 * len1 + d * d - len2 * len2) / (2 * len1 * d);
  const clampedCos1 = Math.max(-1, Math.min(1, cosAngle1));
  const angle1Offset = Math.acos(clampedCos1);

  const finalAngle1 = flip ? baseAngle - angle1Offset : baseAngle + angle1Offset;

  const joint2: IKPoint = {
    x: root.x + len1 * Math.cos(finalAngle1),
    y: root.y + len1 * Math.sin(finalAngle1),
  };

  // Angle from joint2 to target:
  const finalAngle2 = Math.atan2(effectiveTarget.y - joint2.y, effectiveTarget.x - joint2.x);

  return {
    joint1: { ...root },
    joint2,
    target: effectiveTarget,
    angle1: (finalAngle1 * 180) / Math.PI,
    angle2: (finalAngle2 * 180) / Math.PI,
    reached,
  };
}

/**
 * Standard Finger Curl Presets for Hand Poses
 * Returns finger curls in percentages (0 = straight open, 100 = completely curled in)
 */
export const HAND_POSE_PRESETS: Record<HandPoseType, FingerCurlState> = {
  open_palm: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
  fist: { thumb: 95, index: 100, middle: 100, ring: 100, pinky: 100 },
  point: { thumb: 80, index: 0, middle: 95, ring: 95, pinky: 95 },
  namaste: { thumb: 15, index: 0, middle: 0, ring: 0, pinky: 0 },
  thumbs_up: { thumb: 0, index: 100, middle: 100, ring: 100, pinky: 100 },
  peace: { thumb: 85, index: 0, middle: 0, ring: 100, pinky: 100 },
  grip_lathi: { thumb: 60, index: 65, middle: 70, ring: 75, pinky: 75 },
  pinch: { thumb: 50, index: 50, middle: 10, ring: 10, pinky: 10 },
  relaxed: { thumb: 20, index: 25, middle: 30, ring: 35, pinky: 40 },
  stop_palm: { thumb: 10, index: 0, middle: 0, ring: 0, pinky: 0 },
};

/**
 * Computes resolved finger curl percentages combining preset with user fine-tuning
 */
export function getHandPoseFingers(
  poseType: HandPoseType,
  customCurl?: Partial<FingerCurlState>
): FingerCurlState {
  const base = HAND_POSE_PRESETS[poseType] || HAND_POSE_PRESETS.open_palm;
  return {
    thumb: Math.max(0, Math.min(100, customCurl?.thumb ?? base.thumb)),
    index: Math.max(0, Math.min(100, customCurl?.index ?? base.index)),
    middle: Math.max(0, Math.min(100, customCurl?.middle ?? base.middle)),
    ring: Math.max(0, Math.min(100, customCurl?.ring ?? base.ring)),
    pinky: Math.max(0, Math.min(100, customCurl?.pinky ?? base.pinky)),
  };
}

export interface EyePoseGeometry {
  lidOpen: number; // 0 to 1
  pupilOffsetX: number; // -10 to +10 px
  pupilOffsetY: number; // -10 to +10 px
  pupilRadiusScale: number; // 0.5 to 1.8
  arcCurve: number; // -5 to +5 (smile/happy arc)
  showTears: boolean;
  isBlink: boolean;
  isWinkLeft: boolean;
  isWinkRight: boolean;
  eyebrowTiltAdjust: number; // degrees
}

/**
 * Resolves eye pose geometric parameters for dynamic SVG drawing
 */
export function getEyePoseGeometry(
  pose: EyePoseType = 'neutral',
  overrides?: {
    pupilX?: number;
    pupilY?: number;
    pupilSize?: number;
    lidOpen?: number;
  }
): EyePoseGeometry {
  let lidOpen = 1.0;
  let pupilOffsetX = 0;
  let pupilOffsetY = 0;
  let pupilRadiusScale = 1.0;
  let arcCurve = 0;
  let showTears = false;
  let isBlink = false;
  let isWinkLeft = false;
  let isWinkRight = false;
  let eyebrowTiltAdjust = 0;

  switch (pose) {
    case 'blink':
      lidOpen = 0.05;
      isBlink = true;
      arcCurve = 1;
      break;
    case 'happy_squint':
      lidOpen = 0.35;
      arcCurve = 4;
      pupilOffsetY = -1;
      eyebrowTiltAdjust = 3;
      break;
    case 'angry_glare':
      lidOpen = 0.7;
      pupilRadiusScale = 0.9;
      pupilOffsetY = -2;
      eyebrowTiltAdjust = -8;
      break;
    case 'wide_shock':
      lidOpen = 1.4;
      pupilRadiusScale = 0.7;
      eyebrowTiltAdjust = 6;
      break;
    case 'crying_tears':
      lidOpen = 0.5;
      arcCurve = -2;
      showTears = true;
      eyebrowTiltAdjust = 4;
      break;
    case 'wink_left':
      isWinkLeft = true;
      lidOpen = 1.0;
      break;
    case 'wink_right':
      isWinkRight = true;
      lidOpen = 1.0;
      break;
    case 'look_up':
      pupilOffsetY = -5;
      eyebrowTiltAdjust = 2;
      break;
    case 'look_down':
      pupilOffsetY = 5;
      lidOpen = 0.8;
      break;
    case 'look_left':
      pupilOffsetX = -6;
      break;
    case 'look_right':
      pupilOffsetX = 6;
      break;
    case 'dazed':
      pupilRadiusScale = 1.5;
      pupilOffsetX = Math.sin(Date.now() / 200) * 2;
      break;
    case 'neutral':
    default:
      lidOpen = 1.0;
      break;
  }

  // Apply user manual overrides if provided
  if (overrides?.lidOpen !== undefined) lidOpen = overrides.lidOpen;
  if (overrides?.pupilX !== undefined) pupilOffsetX = overrides.pupilX;
  if (overrides?.pupilY !== undefined) pupilOffsetY = overrides.pupilY;
  if (overrides?.pupilSize !== undefined) pupilRadiusScale = overrides.pupilSize;

  return {
    lidOpen: Math.max(0, Math.min(2.0, lidOpen)),
    pupilOffsetX: Math.max(-10, Math.min(10, pupilOffsetX)),
    pupilOffsetY: Math.max(-10, Math.min(10, pupilOffsetY)),
    pupilRadiusScale: Math.max(0.2, Math.min(2.5, pupilRadiusScale)),
    arcCurve,
    showTears,
    isBlink,
    isWinkLeft,
    isWinkRight,
    eyebrowTiltAdjust,
  };
}

export interface TurnaroundProjection {
  headOffsetX: number;
  headWidthScale: number;
  bodyWidthScale: number;
  earCount: number;
  earLeftVisible: boolean;
  earRightVisible: boolean;
  isBackView: boolean;
  isProfile: boolean;
  isThreeQuarter: boolean;
  facingDirection: 'front' | 'right' | 'left' | 'back';
}

/**
 * Computes turnaround geometric projection for any character or body part view angle
 */
export function getTurnaroundProjection(
  angle: CharacterViewAngle | BodyPartAngle = 'front'
): TurnaroundProjection {
  switch (angle) {
    case 'profile':
    case 'profile_right':
      return {
        headOffsetX: 12,
        headWidthScale: 0.82,
        bodyWidthScale: 0.75,
        earCount: 1,
        earLeftVisible: false,
        earRightVisible: true,
        isBackView: false,
        isProfile: true,
        isThreeQuarter: false,
        facingDirection: 'right',
      };
    case 'profile_left':
      return {
        headOffsetX: -12,
        headWidthScale: 0.82,
        bodyWidthScale: 0.75,
        earCount: 1,
        earLeftVisible: true,
        earRightVisible: false,
        isBackView: false,
        isProfile: true,
        isThreeQuarter: false,
        facingDirection: 'left',
      };
    case 'three_quarter_front':
      return {
        headOffsetX: 5,
        headWidthScale: 0.95,
        bodyWidthScale: 0.9,
        earCount: 2,
        earLeftVisible: true,
        earRightVisible: true,
        isBackView: false,
        isProfile: false,
        isThreeQuarter: true,
        facingDirection: 'right',
      };
    case 'three_quarter_back':
      return {
        headOffsetX: 5,
        headWidthScale: 0.95,
        bodyWidthScale: 0.9,
        earCount: 1,
        earLeftVisible: true,
        earRightVisible: false,
        isBackView: true,
        isProfile: false,
        isThreeQuarter: true,
        facingDirection: 'back',
      };
    case 'back':
      return {
        headOffsetX: 0,
        headWidthScale: 1.0,
        bodyWidthScale: 1.0,
        earCount: 2,
        earLeftVisible: true,
        earRightVisible: true,
        isBackView: true,
        isProfile: false,
        isThreeQuarter: false,
        facingDirection: 'back',
      };
    case 'front':
    default:
      return {
        headOffsetX: 0,
        headWidthScale: 1.0,
        bodyWidthScale: 1.0,
        earCount: 2,
        earLeftVisible: true,
        earRightVisible: true,
        isBackView: false,
        isProfile: false,
        isThreeQuarter: false,
        facingDirection: 'front',
      };
  }
}

/**
 * Creates default modular body parts configuration for a character
 */
export function createDefaultModularParts(config?: Partial<CharacterConfig>): ModularBodyParts {
  const skin = config?.skinColor || '#d99763';
  return {
    head: {
      style: config?.headStyle || 'village_man',
      skinColor: skin,
      scale: 1.0,
      angle: 'front',
    },
    hair: {
      style: config?.hairStyle || 'classic_fade',
      color: config?.hairColor || '#1f2937',
    },
    eyes: {
      style: config?.eyeStyle || 'almond_indian',
      pose: config?.eyePose || 'neutral',
      color: config?.eyeColor || '#1f2937',
      pupilX: 0,
      pupilY: 0,
      pupilSize: 1.0,
      lidOpen: 1.0,
    },
    eyebrows: {
      style: config?.eyebrowStyle || 'thick_natural',
      tilt: 0,
      height: 0,
    },
    nose: {
      style: config?.noseStyle || 'classic_pointed',
      scale: 1.0,
      pierced: config?.noseStyle === 'nath_pierced',
    },
    ears: {
      style: config?.earStyle || 'round_normal',
      earring: config?.earStyle === 'earring_gold',
    },
    facialHair: {
      style: config?.facialHair || 'none',
      color: config?.hairColor || '#1f2937',
    },
    torso: {
      shirtStyle: config?.clothesStyle || 'lungi_shirt',
      shirtColor: config?.shirtColor || '#10b981',
      angle: 'front',
    },
    arms: {
      sleeveLength: 'long',
      color: config?.shirtColor || '#10b981',
    },
    hands: {
      leftPose: config?.leftHandPose || 'open_palm',
      rightPose: config?.rightHandPose || 'open_palm',
      leftFingers: { ...HAND_POSE_PRESETS.open_palm },
      rightFingers: { ...HAND_POSE_PRESETS.open_palm },
    },
    legs: {
      bottomStyle: config?.clothesStyle || 'lungi_shirt',
      bottomColor: config?.bottomColor || '#93c5fd',
    },
    feet: {
      footwear: 'chappal',
      color: '#582f0e',
    },
    clothes: {
      id: 'cloth_default',
      name: 'Default Traditional Outfit',
      style: config?.clothesStyle || 'lungi_shirt',
      primaryColor: config?.shirtColor || '#10b981',
      secondaryColor: config?.bottomColor || '#93c5fd',
      pattern: 'plain',
    },
  };
}

/**
 * Validates and sanitizes a character config, ensuring valid joints, poses and IDs
 */
export function validateAndSanitizeCharacter(config: Partial<CharacterConfig>): CharacterConfig {
  const safePose = {
    ...DEFAULT_NEUTRAL_POSE,
    ...(config.pose || {}),
  };

  return {
    id: config.id || `char_${Date.now()}`,
    name: config.name?.trim() || 'Custom Character',
    skinColor: config.skinColor || '#d99763',
    viewAngle: config.viewAngle || 'front',
    headStyle: config.headStyle || 'village_man',
    hairStyle: config.hairStyle || 'classic_fade',
    hairColor: config.hairColor || '#1f2937',
    facialHair: config.facialHair || 'none',
    eyeStyle: config.eyeStyle || 'almond_indian',
    eyeColor: config.eyeColor || '#1f2937',
    eyebrowStyle: config.eyebrowStyle || 'thick_natural',
    noseStyle: config.noseStyle || 'classic_pointed',
    earStyle: config.earStyle || 'round_normal',
    clothesStyle: config.clothesStyle || 'lungi_shirt',
    shirtColor: config.shirtColor || '#10b981',
    bottomColor: config.bottomColor || '#93c5fd',
    expression: config.expression || 'neutral',
    customExpression: config.customExpression,
    flipX: Boolean(config.flipX),
    scale: Math.max(0.1, Math.min(3, config.scale ?? 1)),
    pose: safePose,
    eyePose: config.eyePose || 'neutral',
    leftHandPose: config.leftHandPose || 'open_palm',
    rightHandPose: config.rightHandPose || 'open_palm',
    fingerCurls: config.fingerCurls,
    clothingConfig: config.clothingConfig,
    customClothesTextureUrl: config.customClothesTextureUrl,
    modularParts: config.modularParts || createDefaultModularParts(config),
    ikEnabled: Boolean(config.ikEnabled),
    pinnedJoints: config.pinnedJoints || [],
    importedSvgData: config.importedSvgData,
  };
}

/**
 * Resolves the active SVG rendering or icon for a Multi-Angle Asset
 */
export function getMultiAngleAssetView(
  views: Partial<MultiAngleViews> | undefined,
  angle: AssetAngle = 'front',
  fallbackIcon: string = '📦'
): { content: string; isSvg: boolean } {
  if (views && views[angle]) {
    return { content: views[angle]!, isSvg: views[angle]!.startsWith('<svg') || views[angle]!.startsWith('data:image') };
  }
  if (views?.front) {
    return { content: views.front, isSvg: views.front.startsWith('<svg') || views.front.startsWith('data:image') };
  }
  return { content: fallbackIcon, isSvg: false };
}
