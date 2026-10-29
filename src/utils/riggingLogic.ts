import { SkeletonPose, MotionClip } from '../types/studio';

export interface JointTransform {
  x: number;
  y: number;
  angle: number; // degrees
}

export type JointMap = Record<string, JointTransform>;

export const BONE_NAMES = [
  'head',
  'neck',
  'leftShoulder',
  'leftElbow',
  'leftHand',
  'rightShoulder',
  'rightElbow',
  'rightHand',
  'torso',
  'pelvis',
  'leftHip',
  'leftKnee',
  'leftFoot',
  'rightHip',
  'rightKnee',
  'rightFoot',
] as const;

export const DEFAULT_NEUTRAL_POSE: JointMap = {
  head: { x: 0, y: -90, angle: 0 },
  neck: { x: 0, y: -70, angle: 0 },
  leftShoulder: { x: -35, y: -55, angle: 15 },
  leftElbow: { x: -55, y: -25, angle: 25 },
  leftHand: { x: -65, y: 10, angle: 10 },
  rightShoulder: { x: 35, y: -55, angle: -15 },
  rightElbow: { x: 55, y: -25, angle: -25 },
  rightHand: { x: 65, y: 10, angle: -10 },
  torso: { x: 0, y: -40, angle: 0 },
  pelvis: { x: 0, y: 0, angle: 0 },
  leftHip: { x: -20, y: 15, angle: 0 },
  leftKnee: { x: -25, y: 55, angle: 0 },
  leftFoot: { x: -25, y: 95, angle: 0 },
  rightHip: { x: 20, y: 15, angle: 0 },
  rightKnee: { x: 25, y: 55, angle: 0 },
  rightFoot: { x: 25, y: 95, angle: 0 },
};

export const DEFAULT_LIMB_ANGLES: Record<string, number> = {
  headTilt: 0,
  torsoLean: 0,
  leftArm: 0,
  rightArm: 0,
  leftLeg: 0,
  rightLeg: 0,
  bodyBob: 0,
};

export const POSE_PRESETS: Record<string, SkeletonPose> = {
  neutral: {
    id: 'neutral',
    name: 'Standing Neutral (Basic)',
    category: 'basic',
    limbAngles: { headTilt: 0, torsoLean: 0, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 0 },
    joints: { ...DEFAULT_NEUTRAL_POSE },
  },
  namaste: {
    id: 'namaste',
    name: 'Namaste Greeting (Basic)',
    category: 'basic',
    limbAngles: { headTilt: 6, torsoLean: 4, leftArm: -55, rightArm: 55, leftLeg: 0, rightLeg: 0, bodyBob: 2 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      head: { x: 0, y: -88, angle: 5 },
      leftShoulder: { x: -30, y: -55, angle: 45 },
      leftElbow: { x: -32, y: -30, angle: 80 },
      leftHand: { x: -5, y: -38, angle: 90 },
      rightShoulder: { x: 30, y: -55, angle: -45 },
      rightElbow: { x: 32, y: -30, angle: -80 },
      rightHand: { x: 5, y: -38, angle: -90 },
    },
  },
  talk: {
    id: 'talk',
    name: 'Explain / Storytelling (Basic)',
    category: 'basic',
    limbAngles: { headTilt: -5, torsoLean: 2, leftArm: -35, rightArm: 65, leftLeg: 0, rightLeg: 0, bodyBob: 0 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      head: { x: 4, y: -90, angle: -6 },
      leftShoulder: { x: -35, y: -55, angle: -30 },
      leftElbow: { x: -50, y: -35, angle: -60 },
      leftHand: { x: -45, y: -5, angle: -20 },
      rightShoulder: { x: 35, y: -55, angle: 70 },
      rightElbow: { x: 60, y: -50, angle: 100 },
      rightHand: { x: 40, y: -70, angle: 120 },
    },
  },
  walkA: {
    id: 'walkA',
    name: 'Walk Stride Left (Basic)',
    category: 'basic',
    limbAngles: { headTilt: 2, torsoLean: 4, leftArm: 32, rightArm: -32, leftLeg: -28, rightLeg: 28, bodyBob: -4 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      leftShoulder: { x: -30, y: -55, angle: -30 },
      leftElbow: { x: -45, y: -30, angle: -45 },
      leftHand: { x: -50, y: -5, angle: -20 },
      rightShoulder: { x: 30, y: -55, angle: 35 },
      rightElbow: { x: 50, y: -30, angle: 45 },
      rightHand: { x: 55, y: 0, angle: 25 },
      leftHip: { x: -20, y: 15, angle: 25 },
      leftKnee: { x: -35, y: 55, angle: 10 },
      leftFoot: { x: -45, y: 92, angle: -10 },
      rightHip: { x: 20, y: 15, angle: -25 },
      rightKnee: { x: 35, y: 50, angle: -30 },
      rightFoot: { x: 45, y: 85, angle: 15 },
    },
  },
  walkB: {
    id: 'walkB',
    name: 'Walk Stride Right (Basic)',
    category: 'basic',
    limbAngles: { headTilt: -2, torsoLean: 4, leftArm: -32, rightArm: 32, leftLeg: 28, rightLeg: -28, bodyBob: -4 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      leftShoulder: { x: -30, y: -55, angle: 35 },
      leftElbow: { x: -50, y: -30, angle: 45 },
      leftHand: { x: -55, y: 0, angle: 25 },
      rightShoulder: { x: 30, y: -55, angle: -30 },
      rightElbow: { x: 45, y: -30, angle: -45 },
      rightHand: { x: 50, y: -5, angle: -20 },
      leftHip: { x: -20, y: 15, angle: -25 },
      leftKnee: { x: -35, y: 50, angle: -30 },
      leftFoot: { x: -45, y: 85, angle: 15 },
      rightHip: { x: 20, y: 15, angle: 25 },
      rightKnee: { x: 35, y: 55, angle: 10 },
      rightFoot: { x: 45, y: 92, angle: -10 },
    },
  },
  runSprint: {
    id: 'runSprint',
    name: 'Fast Sprint / Run (Advanced)',
    category: 'advanced',
    limbAngles: { headTilt: 10, torsoLean: 18, leftArm: 65, rightArm: -65, leftLeg: -50, rightLeg: 50, bodyBob: -10 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      head: { x: 8, y: -88, angle: 12 },
      torso: { x: 6, y: -38, angle: 18 },
      leftShoulder: { x: -30, y: -55, angle: 65 },
      rightShoulder: { x: 30, y: -55, angle: -65 },
      leftHip: { x: -20, y: 15, angle: -50 },
      rightHip: { x: 20, y: 15, angle: 50 },
    },
  },
  jumpAir: {
    id: 'jumpAir',
    name: 'Heroic High Jump (Advanced)',
    category: 'advanced',
    limbAngles: { headTilt: -8, torsoLean: 0, leftArm: -135, rightArm: 135, leftLeg: -30, rightLeg: 35, bodyBob: -24 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      head: { x: 0, y: -96, angle: -8 },
      leftShoulder: { x: -35, y: -60, angle: 135 },
      rightShoulder: { x: 35, y: -60, angle: 135 },
      leftHip: { x: -25, y: 10, angle: -30 },
      rightHip: { x: 25, y: 10, angle: 35 },
    },
  },
  dance: {
    id: 'dance',
    name: 'Folk Dance / Bhangra (Dance)',
    category: 'dance',
    limbAngles: { headTilt: -10, torsoLean: -6, leftArm: -125, rightArm: 125, leftLeg: -25, rightLeg: 35, bodyBob: -8 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      head: { x: 0, y: -92, angle: -10 },
      leftShoulder: { x: -40, y: -55, angle: 120 },
      leftElbow: { x: -65, y: -80, angle: 90 },
      leftHand: { x: -50, y: -110, angle: 60 },
      rightShoulder: { x: 40, y: -55, angle: 120 },
      rightElbow: { x: 65, y: -80, angle: 90 },
      rightHand: { x: 50, y: -110, angle: 60 },
      leftHip: { x: -25, y: 15, angle: -20 },
      leftKnee: { x: -40, y: 50, angle: 35 },
      leftFoot: { x: -45, y: 90, angle: 0 },
      rightHip: { x: 25, y: 15, angle: 25 },
      rightKnee: { x: 40, y: 40, angle: -45 },
      rightFoot: { x: 35, y: 70, angle: -15 },
    },
  },
  farmWork: {
    id: 'farmWork',
    name: 'Farmer Field Work (Action)',
    category: 'advanced',
    limbAngles: { headTilt: 20, torsoLean: 22, leftArm: 55, rightArm: 75, leftLeg: -15, rightLeg: 20, bodyBob: 8 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      head: { x: 10, y: -82, angle: 25 },
      torso: { x: 5, y: -35, angle: 20 },
      leftShoulder: { x: -25, y: -45, angle: 60 },
      leftElbow: { x: -10, y: -20, angle: 70 },
      leftHand: { x: 15, y: 5, angle: 80 },
      rightShoulder: { x: 35, y: -50, angle: 80 },
      rightElbow: { x: 45, y: -20, angle: 90 },
      rightHand: { x: 20, y: 8, angle: 85 },
      leftHip: { x: -20, y: 15, angle: -15 },
      leftKnee: { x: -30, y: 55, angle: 25 },
      leftFoot: { x: -30, y: 95, angle: 0 },
      rightHip: { x: 20, y: 15, angle: 20 },
      rightKnee: { x: 30, y: 55, angle: -20 },
      rightFoot: { x: 40, y: 95, angle: 0 },
    },
  },
  sittingChai: {
    id: 'sittingChai',
    name: 'Sitting & Drinking Tea (Basic)',
    category: 'basic',
    limbAngles: { headTilt: 4, torsoLean: 2, leftArm: 20, rightArm: 85, leftLeg: 65, rightLeg: 65, bodyBob: 18 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      torso: { x: 0, y: -20, angle: 0 },
      pelvis: { x: 0, y: 25, angle: 0 },
      leftShoulder: { x: -35, y: -35, angle: 20 },
      leftElbow: { x: -50, y: -10, angle: 40 },
      leftHand: { x: -30, y: 10, angle: 20 },
      rightShoulder: { x: 35, y: -35, angle: 75 },
      rightElbow: { x: 50, y: -40, angle: 120 },
      rightHand: { x: 20, y: -65, angle: 140 },
      leftHip: { x: -25, y: 35, angle: 75 },
      leftKnee: { x: -45, y: 65, angle: -90 },
      leftFoot: { x: -40, y: 95, angle: 0 },
      rightHip: { x: 25, y: 35, angle: 75 },
      rightKnee: { x: 45, y: 65, angle: -90 },
      rightFoot: { x: 40, y: 95, angle: 0 },
    },
  },
  surprised: {
    id: 'surprised',
    name: 'Shocked / Surprised (Emotion)',
    category: 'emotion',
    limbAngles: { headTilt: -8, torsoLean: -8, leftArm: -130, rightArm: 130, leftLeg: -12, rightLeg: 12, bodyBob: -6 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      head: { x: 0, y: -94, angle: 0 },
      leftShoulder: { x: -35, y: -55, angle: 135 },
      leftElbow: { x: -60, y: -75, angle: 110 },
      leftHand: { x: -65, y: -105, angle: 90 },
      rightShoulder: { x: 35, y: -55, angle: 135 },
      rightElbow: { x: 60, y: -75, angle: 110 },
      rightHand: { x: 65, y: -105, angle: 90 },
      leftHip: { x: -22, y: 15, angle: -10 },
      rightHip: { x: 22, y: 15, angle: 10 },
    },
  },
  combatKick: {
    id: 'combatKick',
    name: 'Martial Arts High Kick (Combat)',
    category: 'combat',
    limbAngles: { headTilt: -6, torsoLean: -18, leftArm: -60, rightArm: 75, leftLeg: 5, rightLeg: -85, bodyBob: -6 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      torso: { x: -8, y: -40, angle: -18 },
      leftShoulder: { x: -35, y: -55, angle: -60 },
      rightShoulder: { x: 35, y: -55, angle: 75 },
      rightHip: { x: 25, y: 10, angle: -85 },
      rightKnee: { x: 65, y: -20, angle: -80 },
      rightFoot: { x: 95, y: -45, angle: -75 },
    },
  },
  swordStrike: {
    id: 'swordStrike',
    name: 'Lathi / Sword Power Strike (Combat)',
    category: 'combat',
    limbAngles: { headTilt: 8, torsoLean: 16, leftArm: 35, rightArm: -145, leftLeg: -35, rightLeg: 30, bodyBob: 4 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      torso: { x: 8, y: -38, angle: 16 },
      rightShoulder: { x: 35, y: -60, angle: 145 },
      leftHip: { x: -25, y: 15, angle: -35 },
      rightHip: { x: 25, y: 15, angle: 30 },
    },
  },
  meditationYoga: {
    id: 'meditationYoga',
    name: 'Pranayama / Yoga Lotus (Advanced)',
    category: 'advanced',
    limbAngles: { headTilt: 0, torsoLean: 0, leftArm: 35, rightArm: -35, leftLeg: 75, rightLeg: -75, bodyBob: 24 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      pelvis: { x: 0, y: 28, angle: 0 },
      leftHip: { x: -25, y: 35, angle: 75 },
      rightHip: { x: 25, y: 35, angle: -75 },
    },
  },
  pranamBow: {
    id: 'pranamBow',
    name: 'Respectful Bow / Pranam (Emotion)',
    category: 'emotion',
    limbAngles: { headTilt: 28, torsoLean: 35, leftArm: 65, rightArm: 65, leftLeg: -5, rightLeg: 10, bodyBob: 12 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      head: { x: 18, y: -72, angle: 28 },
      torso: { x: 12, y: -30, angle: 35 },
    },
  },
  superheroFly: {
    id: 'superheroFly',
    name: 'Superhero Flying Pose (Advanced)',
    category: 'advanced',
    limbAngles: { headTilt: -15, torsoLean: 25, leftArm: 20, rightArm: -160, leftLeg: 25, rightLeg: 40, bodyBob: -28 },
    joints: {
      ...DEFAULT_NEUTRAL_POSE,
      torso: { x: 10, y: -50, angle: 25 },
      rightShoulder: { x: 40, y: -70, angle: 160 },
    },
  },
};

export const MOTION_CLIPS_PRESETS: MotionClip[] = [
  {
    id: 'idle_breathe',
    title: 'Calm Idle Breathing',
    category: 'gesture',
    level: 'basic',
    duration: 2.0,
    description: 'Subtle lifelike chest breathing, gentle arm relaxation, and natural head poise.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 0, torsoLean: 0, leftArm: 4, rightArm: -4, leftLeg: 0, rightLeg: 0, bodyBob: 0 } },
      { time: 0.5, angles: { headTilt: 2, torsoLean: 1, leftArm: 8, rightArm: -8, leftLeg: 0, rightLeg: 0, bodyBob: -3 } },
      { time: 1.0, angles: { headTilt: 0, torsoLean: 0, leftArm: 4, rightArm: -4, leftLeg: 0, rightLeg: 0, bodyBob: 0 } },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.neutral.joints },
      { time: 0.5, pose: POSE_PRESETS.neutral.joints },
      { time: 1.0, pose: POSE_PRESETS.neutral.joints },
    ],
  },
  {
    id: 'village_walk',
    title: 'Village Confident Walk',
    category: 'walk',
    level: 'basic',
    duration: 1.2,
    description: 'Natural cyclic walk animation with synchronized arms and legs.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 2, torsoLean: 4, leftArm: 32, rightArm: -32, leftLeg: -28, rightLeg: 28, bodyBob: -4 } },
      { time: 0.25, angles: { headTilt: 0, torsoLean: 2, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 2 } },
      { time: 0.5, angles: { headTilt: -2, torsoLean: 4, leftArm: -32, rightArm: 32, leftLeg: 28, rightLeg: -28, bodyBob: -4 } },
      { time: 0.75, angles: { headTilt: 0, torsoLean: 2, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 2 } },
      { time: 1.0, angles: { headTilt: 2, torsoLean: 4, leftArm: 32, rightArm: -32, leftLeg: -28, rightLeg: 28, bodyBob: -4 } },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.walkA.joints },
      { time: 0.25, pose: POSE_PRESETS.neutral.joints },
      { time: 0.5, pose: POSE_PRESETS.walkB.joints },
      { time: 0.75, pose: POSE_PRESETS.neutral.joints },
      { time: 1.0, pose: POSE_PRESETS.walkA.joints },
    ],
  },
  {
    id: 'fast_sprint_run',
    title: 'Fast Action Sprint / Run',
    category: 'walk',
    level: 'intermediate',
    duration: 0.8,
    description: 'High-speed dynamic running cycle with forward torso lean and rapid stride.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 8, torsoLean: 16, leftArm: 65, rightArm: -65, leftLeg: -52, rightLeg: 52, bodyBob: -10 } },
      { time: 0.25, angles: { headTilt: 4, torsoLean: 14, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 4 } },
      { time: 0.5, angles: { headTilt: 8, torsoLean: 16, leftArm: -65, rightArm: 65, leftLeg: 52, rightLeg: -52, bodyBob: -10 } },
      { time: 0.75, angles: { headTilt: 4, torsoLean: 14, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 4 } },
      { time: 1.0, angles: { headTilt: 8, torsoLean: 16, leftArm: 65, rightArm: -65, leftLeg: -52, rightLeg: 52, bodyBob: -10 } },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.runSprint.joints },
      { time: 0.5, pose: flipPoseX(POSE_PRESETS.runSprint.joints) },
      { time: 1.0, pose: POSE_PRESETS.runSprint.joints },
    ],
  },
  {
    id: 'sad_slow_walk',
    title: 'Sad / Tired Slow Walk',
    category: 'walk',
    level: 'basic',
    duration: 2.2,
    description: 'Slumped shoulders, downward gaze, and heavy slow footsteps.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 18, torsoLean: 12, leftArm: 14, rightArm: -10, leftLeg: -15, rightLeg: 15, bodyBob: 4 }, expression: 'sad' },
      { time: 0.5, angles: { headTilt: 22, torsoLean: 14, leftArm: -10, rightArm: 14, leftLeg: 15, rightLeg: -15, bodyBob: 8 }, expression: 'sad' },
      { time: 1.0, angles: { headTilt: 18, torsoLean: 12, leftArm: 14, rightArm: -10, leftLeg: -15, rightLeg: 15, bodyBob: 4 }, expression: 'sad' },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.walkA.joints, expression: 'sad' },
      { time: 0.5, pose: POSE_PRESETS.walkB.joints, expression: 'sad' },
      { time: 1.0, pose: POSE_PRESETS.walkA.joints, expression: 'sad' },
    ],
  },
  {
    id: 'namaste_greeting',
    title: 'Namaste Greeting',
    category: 'gesture',
    level: 'basic',
    duration: 2.0,
    description: 'Polite Indian namaste greeting with head nod and warm smile.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 0, torsoLean: 0, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 0 }, expression: 'neutral' },
      { time: 0.35, angles: { headTilt: 8, torsoLean: 5, leftArm: -55, rightArm: 55, leftLeg: 0, rightLeg: 0, bodyBob: 3 }, expression: 'happy' },
      { time: 0.7, angles: { headTilt: 8, torsoLean: 5, leftArm: -55, rightArm: 55, leftLeg: 0, rightLeg: 0, bodyBob: 3 }, expression: 'happy' },
      { time: 1.0, angles: { headTilt: 0, torsoLean: 0, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 0 }, expression: 'neutral' },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.neutral.joints, expression: 'neutral' },
      { time: 0.35, pose: POSE_PRESETS.namaste.joints, expression: 'smile' },
      { time: 0.7, pose: POSE_PRESETS.namaste.joints, expression: 'smile' },
      { time: 1.0, pose: POSE_PRESETS.neutral.joints, expression: 'neutral' },
    ],
  },
  {
    id: 'explain_talk',
    title: 'Storytelling / Explain',
    category: 'gesture',
    level: 'basic',
    duration: 2.4,
    description: 'Hand gestures for dialogue and explanation with mouth talking motion.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: -3, torsoLean: 0, leftArm: -15, rightArm: 25, leftLeg: 0, rightLeg: 0, bodyBob: 0 } },
      { time: 0.35, angles: { headTilt: 5, torsoLean: 3, leftArm: -40, rightArm: 65, leftLeg: 0, rightLeg: 0, bodyBob: -2 } },
      { time: 0.7, angles: { headTilt: -5, torsoLean: -2, leftArm: -60, rightArm: 30, leftLeg: 0, rightLeg: 0, bodyBob: 0 } },
      { time: 1.0, angles: { headTilt: -3, torsoLean: 0, leftArm: -15, rightArm: 25, leftLeg: 0, rightLeg: 0, bodyBob: 0 } },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.neutral.joints, expression: 'talking' },
      { time: 0.3, pose: POSE_PRESETS.talk.joints, expression: 'talking' },
      { time: 0.6, pose: POSE_PRESETS.neutral.joints, expression: 'smile' },
      { time: 0.85, pose: POSE_PRESETS.talk.joints, expression: 'talking' },
      { time: 1.0, pose: POSE_PRESETS.neutral.joints, expression: 'talking' },
    ],
  },
  {
    id: 'wave_hand_hello',
    title: 'Cheerful Hand Wave',
    category: 'gesture',
    level: 'basic',
    duration: 1.5,
    description: 'Friendly high hand wave to greet viewers or friends.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 0, torsoLean: 0, leftArm: 0, rightArm: 110, leftLeg: 0, rightLeg: 0, bodyBob: 0 }, expression: 'happy' },
      { time: 0.25, angles: { headTilt: -6, torsoLean: -3, leftArm: 0, rightArm: 145, leftLeg: 0, rightLeg: 0, bodyBob: -2 }, expression: 'happy' },
      { time: 0.5, angles: { headTilt: 6, torsoLean: 3, leftArm: 0, rightArm: 105, leftLeg: 0, rightLeg: 0, bodyBob: 0 }, expression: 'happy' },
      { time: 0.75, angles: { headTilt: -6, torsoLean: -3, leftArm: 0, rightArm: 145, leftLeg: 0, rightLeg: 0, bodyBob: -2 }, expression: 'happy' },
      { time: 1.0, angles: { headTilt: 0, torsoLean: 0, leftArm: 0, rightArm: 110, leftLeg: 0, rightLeg: 0, bodyBob: 0 }, expression: 'happy' },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.neutral.joints, expression: 'happy' },
      { time: 0.5, pose: POSE_PRESETS.talk.joints, expression: 'happy' },
      { time: 1.0, pose: POSE_PRESETS.neutral.joints, expression: 'happy' },
    ],
  },
  {
    id: 'bhangra_folk_dance',
    title: 'Bhangra Folk Dance',
    category: 'dance',
    level: 'advanced',
    duration: 1.6,
    description: 'High-energy celebration dance with bouncing arms and rhythm.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: -8, torsoLean: -5, leftArm: -120, rightArm: 120, leftLeg: -25, rightLeg: 35, bodyBob: -10 }, expression: 'happy' },
      { time: 0.25, angles: { headTilt: 8, torsoLean: 5, leftArm: -95, rightArm: 95, leftLeg: 5, rightLeg: -5, bodyBob: 4 }, expression: 'happy' },
      { time: 0.5, angles: { headTilt: -8, torsoLean: 5, leftArm: -135, rightArm: 135, leftLeg: 35, rightLeg: -25, bodyBob: -10 }, expression: 'happy' },
      { time: 0.75, angles: { headTilt: 8, torsoLean: -5, leftArm: -95, rightArm: 95, leftLeg: -5, rightLeg: 5, bodyBob: 4 }, expression: 'happy' },
      { time: 1.0, angles: { headTilt: -8, torsoLean: -5, leftArm: -120, rightArm: 120, leftLeg: -25, rightLeg: 35, bodyBob: -10 }, expression: 'happy' },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.neutral.joints, expression: 'happy' },
      { time: 0.25, pose: POSE_PRESETS.dance.joints, expression: 'happy' },
      { time: 0.5, pose: POSE_PRESETS.neutral.joints, expression: 'happy' },
      { time: 0.75, pose: POSE_PRESETS.dance.joints, expression: 'happy' },
      { time: 1.0, pose: POSE_PRESETS.neutral.joints, expression: 'happy' },
    ],
  },
  {
    id: 'garba_twirl_dance',
    title: 'Garba / Classical Twirl Dance',
    category: 'dance',
    level: 'advanced',
    duration: 1.8,
    description: 'Rhythmic clapping and graceful festive dance movement.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: -10, torsoLean: -8, leftArm: -70, rightArm: -40, leftLeg: -20, rightLeg: 20, bodyBob: -6 }, expression: 'happy' },
      { time: 0.5, angles: { headTilt: 10, torsoLean: 8, leftArm: 40, rightArm: 70, leftLeg: 20, rightLeg: -20, bodyBob: -12 }, expression: 'happy' },
      { time: 1.0, angles: { headTilt: -10, torsoLean: -8, leftArm: -70, rightArm: -40, leftLeg: -20, rightLeg: 20, bodyBob: -6 }, expression: 'happy' },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.dance.joints, expression: 'happy' },
      { time: 0.5, pose: POSE_PRESETS.namaste.joints, expression: 'happy' },
      { time: 1.0, pose: POSE_PRESETS.dance.joints, expression: 'happy' },
    ],
  },
  {
    id: 'farmer_work',
    title: 'Farmer Field Work',
    category: 'action',
    level: 'intermediate',
    duration: 2.0,
    description: 'Farmer bending and hoeing the ground repeatedly.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 0, torsoLean: 0, leftArm: -40, rightArm: -40, leftLeg: 0, rightLeg: 0, bodyBob: 0 } },
      { time: 0.45, angles: { headTilt: 20, torsoLean: 25, leftArm: 65, rightArm: 75, leftLeg: -15, rightLeg: 20, bodyBob: 10 } },
      { time: 0.65, angles: { headTilt: 20, torsoLean: 25, leftArm: 65, rightArm: 75, leftLeg: -15, rightLeg: 20, bodyBob: 10 } },
      { time: 1.0, angles: { headTilt: 0, torsoLean: 0, leftArm: -40, rightArm: -40, leftLeg: 0, rightLeg: 0, bodyBob: 0 } },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.neutral.joints },
      { time: 0.4, pose: POSE_PRESETS.farmWork.joints },
      { time: 0.6, pose: POSE_PRESETS.farmWork.joints },
      { time: 1.0, pose: POSE_PRESETS.neutral.joints },
    ],
  },
  {
    id: 'kungfu_combat_kick',
    title: 'Martial Arts High Kick',
    category: 'combat',
    level: 'advanced',
    duration: 1.4,
    description: 'Explosive martial arts jump and side kick action.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 0, torsoLean: 5, leftArm: -30, rightArm: 30, leftLeg: -10, rightLeg: 10, bodyBob: 4 }, expression: 'angry' },
      { time: 0.4, angles: { headTilt: -8, torsoLean: -22, leftArm: -70, rightArm: 85, leftLeg: 10, rightLeg: -85, bodyBob: -16 }, expression: 'angry' },
      { time: 0.7, angles: { headTilt: -8, torsoLean: -22, leftArm: -70, rightArm: 85, leftLeg: 10, rightLeg: -85, bodyBob: -12 }, expression: 'angry' },
      { time: 1.0, angles: { headTilt: 0, torsoLean: 5, leftArm: -30, rightArm: 30, leftLeg: -10, rightLeg: 10, bodyBob: 4 }, expression: 'angry' },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.neutral.joints, expression: 'angry' },
      { time: 0.45, pose: POSE_PRESETS.combatKick.joints, expression: 'angry' },
      { time: 1.0, pose: POSE_PRESETS.neutral.joints, expression: 'angry' },
    ],
  },
  {
    id: 'sword_lathi_swing',
    title: 'Lathi / Sword Power Swing',
    category: 'combat',
    level: 'advanced',
    duration: 1.5,
    description: 'Heroic overhead weapon swing and defensive stance.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: -5, torsoLean: -10, leftArm: 20, rightArm: -145, leftLeg: -20, rightLeg: 20, bodyBob: -4 }, expression: 'angry' },
      { time: 0.45, angles: { headTilt: 12, torsoLean: 22, leftArm: -30, rightArm: 75, leftLeg: -35, rightLeg: 35, bodyBob: 8 }, expression: 'angry' },
      { time: 1.0, angles: { headTilt: -5, torsoLean: -10, leftArm: 20, rightArm: -145, leftLeg: -20, rightLeg: 20, bodyBob: -4 }, expression: 'angry' },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.swordStrike.joints, expression: 'angry' },
      { time: 0.5, pose: POSE_PRESETS.farmWork.joints, expression: 'angry' },
      { time: 1.0, pose: POSE_PRESETS.swordStrike.joints, expression: 'angry' },
    ],
  },
  {
    id: 'shocked_reaction',
    title: 'Shocked Sudden Reaction',
    category: 'reaction',
    level: 'basic',
    duration: 1.5,
    description: 'Dramatic jump-back with arms up and mouth wide open in astonishment.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 0, torsoLean: 0, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 0 }, expression: 'neutral' },
      { time: 0.25, angles: { headTilt: -10, torsoLean: -10, leftArm: -135, rightArm: 135, leftLeg: -18, rightLeg: 18, bodyBob: -14 }, expression: 'surprised' },
      { time: 0.7, angles: { headTilt: -10, torsoLean: -10, leftArm: -135, rightArm: 135, leftLeg: -18, rightLeg: 18, bodyBob: -6 }, expression: 'surprised' },
      { time: 1.0, angles: { headTilt: 0, torsoLean: 0, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 0 }, expression: 'neutral' },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.neutral.joints, expression: 'neutral' },
      { time: 0.2, pose: POSE_PRESETS.surprised.joints, expression: 'shocked' },
      { time: 0.7, pose: POSE_PRESETS.surprised.joints, expression: 'shocked' },
      { time: 1.0, pose: POSE_PRESETS.neutral.joints, expression: 'neutral' },
    ],
  },
  {
    id: 'tea_chai_sip',
    title: 'Chai Sip & Chat',
    category: 'action',
    level: 'basic',
    duration: 2.5,
    description: 'Sitting down and raising tea cup to mouth.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 0, torsoLean: 2, leftArm: 20, rightArm: 45, leftLeg: 60, rightLeg: 60, bodyBob: 16 } },
      { time: 0.4, angles: { headTilt: -8, torsoLean: 0, leftArm: 20, rightArm: 110, leftLeg: 60, rightLeg: 60, bodyBob: 16 }, expression: 'happy' },
      { time: 0.7, angles: { headTilt: -8, torsoLean: 0, leftArm: 20, rightArm: 110, leftLeg: 60, rightLeg: 60, bodyBob: 16 }, expression: 'happy' },
      { time: 1.0, angles: { headTilt: 0, torsoLean: 2, leftArm: 20, rightArm: 45, leftLeg: 60, rightLeg: 60, bodyBob: 16 } },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.neutral.joints, expression: 'neutral' },
      { time: 0.3, pose: POSE_PRESETS.sittingChai.joints, expression: 'smile' },
      { time: 0.7, pose: POSE_PRESETS.sittingChai.joints, expression: 'smile' },
      { time: 1.0, pose: POSE_PRESETS.neutral.joints, expression: 'neutral' },
    ],
  },
  {
    id: 'hero_jump_celebrate',
    title: 'Victory Jump Celebration',
    category: 'reaction',
    level: 'advanced',
    duration: 1.4,
    description: 'Crouch down and leap high into the air with both arms raised.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 5, torsoLean: 10, leftArm: 25, rightArm: -25, leftLeg: 20, rightLeg: -20, bodyBob: 10 }, expression: 'happy' },
      { time: 0.45, angles: { headTilt: -10, torsoLean: 0, leftArm: -140, rightArm: 140, leftLeg: -30, rightLeg: 30, bodyBob: -28 }, expression: 'happy' },
      { time: 0.75, angles: { headTilt: -10, torsoLean: 0, leftArm: -140, rightArm: 140, leftLeg: -15, rightLeg: 15, bodyBob: -18 }, expression: 'happy' },
      { time: 1.0, angles: { headTilt: 5, torsoLean: 10, leftArm: 25, rightArm: -25, leftLeg: 20, rightLeg: -20, bodyBob: 10 }, expression: 'happy' },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.neutral.joints, expression: 'happy' },
      { time: 0.5, pose: POSE_PRESETS.jumpAir.joints, expression: 'happy' },
      { time: 1.0, pose: POSE_PRESETS.neutral.joints, expression: 'happy' },
    ],
  },
  {
    id: 'pranam_touch_feet',
    title: 'Respectful Pranam / Ashirwad',
    category: 'gesture',
    level: 'intermediate',
    duration: 2.2,
    description: 'Bowing forward respectfully to take elders blessings.',
    limbCycle: [
      { time: 0.0, angles: { headTilt: 0, torsoLean: 0, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 0 } },
      { time: 0.45, angles: { headTilt: 25, torsoLean: 35, leftArm: 70, rightArm: 70, leftLeg: -5, rightLeg: 10, bodyBob: 12 } },
      { time: 0.75, angles: { headTilt: 25, torsoLean: 35, leftArm: 70, rightArm: 70, leftLeg: -5, rightLeg: 10, bodyBob: 12 } },
      { time: 1.0, angles: { headTilt: 0, torsoLean: 0, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 0 } },
    ],
    keyframes: [
      { time: 0.0, pose: POSE_PRESETS.neutral.joints },
      { time: 0.5, pose: POSE_PRESETS.pranamBow.joints },
      { time: 1.0, pose: POSE_PRESETS.neutral.joints },
    ],
  },
];

/**
 * Linearly interpolates between two numbers
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Samples limb angles for a motion clip at normalized progress (0 to 1)
 */
export function sampleMotionClipLimbAngles(
  clipId: string | undefined,
  timeSeconds: number,
  speed = 1.0
): Record<string, number> {
  if (!clipId) return { ...DEFAULT_LIMB_ANGLES };
  const clip = MOTION_CLIPS_PRESETS.find((c) => c.id === clipId);
  if (!clip || !clip.limbCycle || clip.limbCycle.length === 0) {
    return { ...DEFAULT_LIMB_ANGLES };
  }

  const dur = Math.max(0.2, clip.duration || 1.5);
  const progress = (((timeSeconds * speed) / dur) % 1 + 1) % 1;
  const cycle = clip.limbCycle;

  if (cycle.length === 1) return { ...DEFAULT_LIMB_ANGLES, ...cycle[0].angles };

  for (let i = 0; i < cycle.length - 1; i++) {
    const c1 = cycle[i];
    const c2 = cycle[i + 1];
    if (progress >= c1.time && progress <= c2.time) {
      const span = c2.time - c1.time;
      const alpha = span > 0 ? (progress - c1.time) / span : 0;
      const out: Record<string, number> = {};
      const keys = new Set([...Object.keys(DEFAULT_LIMB_ANGLES), ...Object.keys(c1.angles), ...Object.keys(c2.angles)]);
      keys.forEach((k) => {
        out[k] = Math.round(lerp(c1.angles[k] ?? 0, c2.angles[k] ?? 0, alpha) * 10) / 10;
      });
      return out;
    }
  }

  return { ...DEFAULT_LIMB_ANGLES, ...cycle[cycle.length - 1].angles };
}

/**
 * Linearly interpolates between two joint poses
 */
export function interpolatePose(poseA: JointMap, poseB: JointMap, t: number): JointMap {
  const result: JointMap = {};
  const clampedT = Math.max(0, Math.min(1, t));

  const keys = new Set([...Object.keys(poseA), ...Object.keys(poseB)]);
  for (const key of keys) {
    const jA = poseA[key] || DEFAULT_NEUTRAL_POSE[key] || { x: 0, y: 0, angle: 0 };
    const jB = poseB[key] || DEFAULT_NEUTRAL_POSE[key] || { x: 0, y: 0, angle: 0 };

    result[key] = {
      x: Math.round(lerp(jA.x, jB.x, clampedT) * 100) / 100,
      y: Math.round(lerp(jA.y, jB.y, clampedT) * 100) / 100,
      angle: Math.round(lerp(jA.angle, jB.angle, clampedT) * 100) / 100,
    };
  }

  return result;
}

/**
 * Samples a motion clip at normalized progress t (0 to 1)
 */
export function sampleMotionClip(clip: MotionClip, progress: number): {
  pose: JointMap;
  expression?: string;
} {
  const loopT = ((progress % 1) + 1) % 1;
  const kfs = clip.keyframes;

  if (kfs.length === 0) {
    return { pose: DEFAULT_NEUTRAL_POSE };
  }
  if (kfs.length === 1) {
    return { pose: kfs[0].pose, expression: kfs[0].expression };
  }

  // Find surrounding keyframes
  for (let i = 0; i < kfs.length - 1; i++) {
    const k1 = kfs[i];
    const k2 = kfs[i + 1];
    if (loopT >= k1.time && loopT <= k2.time) {
      const segmentSpan = k2.time - k1.time;
      const segT = segmentSpan > 0 ? (loopT - k1.time) / segmentSpan : 0;
      return {
        pose: interpolatePose(k1.pose, k2.pose, segT),
        expression: segT > 0.5 ? k2.expression || k1.expression : k1.expression,
      };
    }
  }

  return { pose: kfs[kfs.length - 1].pose, expression: kfs[kfs.length - 1].expression };
}

/**
 * Horizontally mirrors joint positions
 */
export function flipPoseX(pose: JointMap): JointMap {
  const result: JointMap = {};
  for (const [key, joint] of Object.entries(pose)) {
    result[key] = {
      x: -joint.x,
      y: joint.y,
      angle: -joint.angle,
    };
  }
  return result;
}

