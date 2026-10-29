export type AspectRatio = '16:9' | '9:16';

export type CharacterViewAngle = 'front' | 'three_quarter_front' | 'profile' | 'three_quarter_back' | 'back';
export type BodyPartAngle = 'front' | 'three_quarter_front' | 'profile_right' | 'profile_left' | 'three_quarter_back' | 'back';

export type BodyPartCategory =
  | 'clothesTop'
  | 'clothesBottom'
  | 'shoes'
  | 'skinColor'
  | 'head'
  | 'eyes'
  | 'eyebrows'
  | 'nose'
  | 'ears'
  | 'hair'
  | 'mouth'
  | 'mustache'
  | 'hands'
  | 'earrings'
  | 'torso';

export interface PartSpriteSet {
  front: string;
  threeQuarterFront: string;
  profile: string;
  threeQuarterBack: string;
  back: string;
}

export interface PartDefinition {
  id: string;
  category: BodyPartCategory;
  name: string;
  sprites: PartSpriteSet;
  anchor: { x: number; y: number };
  zIndexPerAngle: Record<CharacterViewAngle, number>;
  colorable: boolean;
  defaultColor?: string;
  thumbnail?: string;
}

export type VisemeShape = 'A' | 'E' | 'I' | 'O' | 'U' | 'M' | 'closed';

export type EyeExpression =
  | 'neutral'
  | 'blink'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'sleepy';

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'bounce';

export interface LimbPoseAngles {
  headTilt?: number;      // -45 to 45 deg
  torsoLean?: number;     // -45 to 45 deg
  leftArm?: number;       // -180 to 180 deg
  rightArm?: number;      // -180 to 180 deg
  leftLeg?: number;       // -90 to 90 deg
  rightLeg?: number;      // -90 to 90 deg
  bodyBob?: number;       // -30 to 30 px vertical offset
}

export interface CharacterKeyframe {
  id: string;
  time: number; // in seconds
  frame: number; // frame index based on project fps
  easing: EasingType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  viewAngle: CharacterViewAngle;
  expression: EyeExpression;
  viseme: VisemeShape;
  pupilLook: { x: number; y: number }; // -1 to 1
  posePreset?: string;
  bodyPartAngles?: Record<string, number>;
}

export type CameraShakeType = 'none' | 'subtle' | 'impact' | 'earthquake';

export interface CameraKeyframe {
  id: string;
  time: number;
  frame: number;
  easing: EasingType;
  x: number; // pan x
  y: number; // pan y
  zoom: number; // 0.5x to 3.0x
  rotation: number; // degrees
  shake?: CameraShakeType;
  dofBlur?: number; // 0 to 12px
  presetName?: string;
}

export type TimeOfDayType = 'day' | 'sunset' | 'night' | 'dusk';
export type WeatherEffectType = 'none' | 'rain' | 'storm' | 'snow' | 'fog' | 'fireflies' | 'petals';

export interface SceneEffectsConfig {
  timeOfDay: TimeOfDayType;
  showCelestial: boolean; // Sun or Moon visible
  celestialX: number; // 0 to 100%
  celestialY: number; // 5 to 60%
  weather: WeatherEffectType;
  weatherIntensity: number; // 0.1 to 1.0
  windSpeed: number; // -2.0 to 2.0
  ambientLightIntensity: number; // 0 to 1.0
  letterbox: boolean;
  showGridGuides?: boolean;
  dofBlur?: number;
  cameraShake?: CameraShakeType;
}

export interface ShadowConfig {
  enabled: boolean;
  type: 'ground' | 'drop' | 'long_cast' | 'glow';
  opacity: number; // 0.05 to 0.95
  blur: number; // 0 to 30
  offsetX: number; // -50 to 50
  offsetY: number; // -20 to 50
  skewX: number; // -45 to 45
  scale: number; // 0.5 to 2.0
  color: string;
}

export interface VoiceModulationConfig {
  pitch: number; // 0.5 to 2.0
  rate: number; // 0.5 to 2.0
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'whisper' | 'dramatic';
  bass: number; // -10 to 10
  reverb: number; // 0 to 100
  ageShift: 'child' | 'youth' | 'adult' | 'elder';
}

export interface BoneJoint {
  id: string;
  name: string;
  x: number;
  y: number;
  angle: number; // in degrees
  parent?: string;
  length?: number;
}

export interface SkeletonPose {
  id: string;
  name: string;
  category?: 'basic' | 'advanced' | 'combat' | 'dance' | 'emotion';
  joints: Record<string, { x: number; y: number; angle: number }>;
  limbAngles?: LimbPoseAngles;
}


export type HeadStyle = 'village_man' | 'village_elder' | 'priest' | 'village_woman' | 'modern_boy' | 'modern_girl' | 'grandma' | 'farmer' | 'tribal' | 'scholar';
export type HairStyle = 'classic_fade' | 'village_turban' | 'priest_topknot' | 'curly_black' | 'elder_white' | 'women_braid' | 'bald_tilak' | 'rajasthani_pagri' | 'bandana';
export type FacialHair = 'none' | 'thick_mustache' | 'rajput_curled' | 'full_beard' | 'stubble' | 'elder_white_beard' | 'french_beard';
export type ClothesStyle = 'dhoti_kurta' | 'lungi_shirt' | 'saree' | 'farmer_vest' | 'modern_jeans' | 'royal_kurta' | 'simple_tshirt' | 'jacket_denim' | 'angavastram';

export type EyeStyle = 'almond_indian' | 'wide_cartoon' | 'sharp_focused' | 'elderly_droopy' | 'closed_peaceful' | 'wink';
export type EyebrowStyle = 'thick_natural' | 'sharp_angled' | 'bushy_elder' | 'thin_groomed';
export type NoseStyle = 'classic_pointed' | 'broad_village' | 'button_round' | 'sharp_aquiline' | 'nath_pierced';
export type EarStyle = 'round_normal' | 'earring_gold' | 'large_elder' | 'small_tucked';

export type EyePoseType =
  | 'neutral'
  | 'blink'
  | 'happy_squint'
  | 'angry_glare'
  | 'wide_shock'
  | 'crying_tears'
  | 'wink_left'
  | 'wink_right'
  | 'look_up'
  | 'look_down'
  | 'look_left'
  | 'look_right'
  | 'dazed';

export type HandPoseType =
  | 'open_palm'
  | 'fist'
  | 'point'
  | 'namaste'
  | 'thumbs_up'
  | 'peace'
  | 'grip_lathi'
  | 'pinch'
  | 'relaxed'
  | 'stop_palm';

export interface FingerCurlState {
  thumb: number; // 0 to 100%
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export interface ClothingItemConfig {
  id: string;
  name: string;
  style: ClothesStyle;
  primaryColor: string;
  secondaryColor?: string;
  textureUrl?: string;
  pattern?: 'plain' | 'stripes' | 'dots' | 'bandhani' | 'gold_border';
  accessory?: 'dupatta' | 'gamchha' | 'kalgi' | 'necklace' | 'none';
}

export interface ModularBodyParts {
  head: {
    style: HeadStyle;
    skinColor: string;
    scale: number;
    angle?: BodyPartAngle;
  };
  hair: {
    style: HairStyle;
    color: string;
  };
  eyes: {
    style: EyeStyle;
    pose: EyePoseType;
    color: string;
    pupilX: number; // -10 to +10
    pupilY: number; // -10 to +10
    pupilSize: number; // 0.5 to 1.5
    lidOpen: number; // 0 (closed) to 1.0 (fully open)
  };
  eyebrows: {
    style: EyebrowStyle;
    tilt: number; // -15 to +15
    height: number; // -10 to +10
  };
  nose: {
    style: NoseStyle;
    scale: number;
    pierced?: boolean;
  };
  ears: {
    style: EarStyle;
    earring?: boolean;
  };
  facialHair: {
    style: FacialHair;
    color?: string;
  };
  torso: {
    shirtStyle: ClothesStyle;
    shirtColor: string;
    angle?: BodyPartAngle;
  };
  arms: {
    sleeveLength: 'short' | 'long' | 'sleeveless';
    color?: string;
  };
  hands: {
    leftPose: HandPoseType;
    rightPose: HandPoseType;
    leftFingers: FingerCurlState;
    rightFingers: FingerCurlState;
  };
  legs: {
    bottomStyle: ClothesStyle;
    bottomColor: string;
  };
  feet: {
    footwear: 'barefoot' | 'chappal' | 'mojari' | 'boots';
    color: string;
  };
  clothes: ClothingItemConfig;
}

export type Expression =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'shocked'
  | 'smile'
  | 'talking'
  | 'crying'
  | 'laughing'
  | 'smug'
  | 'scared'
  | 'wink';

export interface CustomExpressionData {
  id: string;
  name: string;
  eyebrowHeight: number; // -10 to +10
  eyebrowTilt: number; // -15 to +15
  eyeScaleY: number; // 0.1 to 1.5
  mouthCurve: number; // -10 to +10
  mouthOpen: number; // 0 to 20
  blush?: boolean;
  tears?: boolean;
  sweatDrop?: boolean;
}

export interface CharacterPartSelection {
  partId: string;
  color: string;
  customSprites?: Partial<Record<CharacterViewAngle, string>>;
}

export interface CharacterConfig {
  id: string;
  name: string;
  skinColor: string;
  viewAngle?: CharacterViewAngle;
  headStyle: HeadStyle;
  hairStyle: HairStyle;
  hairColor?: string;
  facialHair: FacialHair;
  eyeStyle?: EyeStyle;
  eyeColor?: string;
  eyebrowStyle?: EyebrowStyle;
  noseStyle?: NoseStyle;
  earStyle?: EarStyle;
  clothesStyle: ClothesStyle;
  shirtColor: string;
  bottomColor: string;
  expression: Expression;
  customExpression?: CustomExpressionData;
  flipX: boolean;
  scale: number;
  pose: Record<string, { x: number; y: number; angle: number }>;

  // 5-Angle Part Layer slots
  selectedParts?: Partial<Record<BodyPartCategory, CharacterPartSelection>>;

  // Extended Advanced Rigging, Eye, Hand & Modular Parts
  eyePose?: EyePoseType;
  eyeExpression?: EyeExpression;
  viseme?: VisemeShape;
  pupilLook?: { x: number; y: number };
  leftHandPose?: HandPoseType;
  rightHandPose?: HandPoseType;
  fingerCurls?: {
    left?: Partial<FingerCurlState>;
    right?: Partial<FingerCurlState>;
  };
  clothingConfig?: ClothingItemConfig;
  customClothesTextureUrl?: string;
  modularParts?: ModularBodyParts;
  ikEnabled?: boolean;
  pinnedJoints?: string[];
  importedSvgData?: string;
  referencePhotoUrl?: string;
  bodyPartAngles?: Record<string, number>;
  posePreset?: string;
}

export interface MotionClip {
  id: string;
  title: string;
  category: 'walk' | 'gesture' | 'action' | 'dance' | 'reaction' | 'combat' | 'advanced';
  level?: 'basic' | 'intermediate' | 'advanced';
  duration: number; // in seconds
  description: string;
  limbCycle?: {
    time: number; // 0 to 1
    angles: Record<string, number>;
    expression?: EyeExpression;
  }[];
  keyframes: {
    time: number; // 0 to 1
    pose: Record<string, { x: number; y: number; angle: number }>;
    expression?: Expression;
  }[];
}

export type AssetAngle = 'front' | 'right' | 'left' | 'back';

export interface MultiAngleViews {
  front: string;
  right: string;
  left: string;
  back: string;
}

export interface SceneElement {
  id: string;
  type: 'character' | 'prop' | 'background' | 'text';
  name: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  locked?: boolean;
  visible?: boolean;
  characterData?: CharacterConfig;
  keyframes?: CharacterKeyframe[];
  activeMotionClipId?: string;
  activeMotionSpeed?: number;
  posePreset?: string;
  bodyPartAngles?: Record<string, number>;
  shadow?: ShadowConfig;
  propIcon?: string;
  propColor?: string;
  textContent?: string;
  bgGradient?: string;
  bgImageUrl?: string;
  assetAngle?: AssetAngle;
  multiAngleViews?: Partial<MultiAngleViews>;
  customAssetSvg?: string;
  flipX?: boolean;
  viewAngle?: CharacterViewAngle;
  expression?: EyeExpression;
  viseme?: VisemeShape;
  pupilLook?: { x: number; y: number };
}

export type AnimalSoundType =
  | 'cow'
  | 'dog'
  | 'rooster'
  | 'bird'
  | 'goat'
  | 'lion'
  | 'cat'
  | 'elephant'
  | 'horse'
  | 'buffalo'
  | 'monkey';

export type RealHumanVoiceType =
  | 'dada_ji'
  | 'village_hero'
  | 'dadi_ji'
  | 'village_didi'
  | 'auntie_chachi'
  | 'village_pradhan'
  | 'kid_chhotu'
  | 'pandit_ji'
  | 'kisan_kaka'
  | 'pinky_kid'
  | 'motu_cartoon'
  | 'chintu_funny'
  | 'mithu_parrot'
  | 'robot_ai'
  | 'story_narrator'
  | 'movie_trailer'
  | 'horror_ghost'
  | 'news_anchor'
  | 'police_inspector'
  | 'royal_maharaja';

export interface AudioTrackItem {
  id: string;
  name: string;
  type: 'tts' | 'sfx' | 'music' | 'recorded' | 'upload';
  category?: 'human' | 'animal' | 'work' | 'nature' | 'music';
  startTime: number;
  duration: number;
  volume: number;
  text?: string;
  voiceName?: string;
  soundType?: string;
  audioBlobUrl?: string;
  animalType?: AnimalSoundType;
  humanVoiceProfile?: RealHumanVoiceType;
  voiceModulation?: VoiceModulationConfig;
  targetCharacterId?: string;
  autoLipSync?: boolean;
}

export interface StudioScene {
  id: string;
  name: string;
  duration: number; // in seconds
  elements: SceneElement[];
  audioTracks: AudioTrackItem[];
  cameraKeyframes?: CameraKeyframe[];
  backgroundColor: string;
  backgroundTemplate?: string;
  effects?: SceneEffectsConfig;
}

export interface StudioProject {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  createdAt: number;
  updatedAt: number;
  scenes: StudioScene[];
  currentSceneId: string;
  fps: number;
}

export interface AssetTemplate {
  id: string;
  title: string;
  category: 'Backgrounds' | 'Props' | 'Characters' | 'Audio' | 'FX';
  genre: 'Village' | 'City' | 'Moral' | 'Horror' | 'Office' | 'Story' | 'Kids';
  thumbnailUrl?: string;
  description: string;
  tags: string[];
  multiAngleViews?: Partial<MultiAngleViews>;
  isCustomImport?: boolean;
}

