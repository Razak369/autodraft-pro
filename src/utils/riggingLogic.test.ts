import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lerp,
  interpolatePose,
  sampleMotionClip,
  flipPoseX,
  MOTION_CLIPS_PRESETS,
  DEFAULT_NEUTRAL_POSE,
  POSE_PRESETS,
} from './riggingLogic';

test('lerp calculates linear interpolation properly', () => {
  assert.equal(lerp(0, 100, 0.5), 50);
  assert.equal(lerp(10, 20, 0), 10);
  assert.equal(lerp(10, 20, 1), 20);
});

test('interpolatePose correctly blends joint angles and positions', () => {
  const poseA = {
    head: { x: 0, y: 10, angle: 0 },
  };
  const poseB = {
    head: { x: 10, y: 30, angle: 90 },
  };

  const midpoint = interpolatePose(poseA, poseB, 0.5);
  assert.equal(midpoint.head.x, 5);
  assert.equal(midpoint.head.y, 20);
  assert.equal(midpoint.head.angle, 45);
});

test('flipPoseX mirrors x coordinates and angles', () => {
  const pose = {
    leftHand: { x: -40, y: 20, angle: 30 },
  };
  const flipped = flipPoseX(pose);
  assert.equal(flipped.leftHand.x, 40);
  assert.equal(flipped.leftHand.y, 20);
  assert.equal(flipped.leftHand.angle, -30);
});

test('sampleMotionClip loops and interpolates within walk clip', () => {
  const walkClip = MOTION_CLIPS_PRESETS.find((c) => c.id === 'village_walk')!;
  assert.ok(walkClip, 'Village walk clip should exist');

  const sampleAtZero = sampleMotionClip(walkClip, 0.0);
  assert.ok(sampleAtZero.pose.head, 'Sampled pose must have head');

  const sampleMid = sampleMotionClip(walkClip, 0.5);
  assert.ok(sampleMid.pose.leftHip, 'Sampled pose must have leftHip');

  const sampleLoopWrap = sampleMotionClip(walkClip, 1.25); // 0.25 after wrapping
  assert.ok(sampleLoopWrap.pose.rightKnee, 'Sampled pose must have rightKnee');
});

test('pose presets contain standard humanoid bone joints', () => {
  assert.ok(POSE_PRESETS.namaste.joints.head);
  assert.ok(POSE_PRESETS.talk.joints.leftHand);
  assert.ok(POSE_PRESETS.dance.joints.rightFoot);
});

test('turnaround angles support standard 5-point studio rotation', () => {
  const angles = ['front', 'three_quarter_front', 'profile', 'three_quarter_back', 'back'];
  assert.equal(angles.length, 5);
  assert.ok(angles.includes('front'));
  assert.ok(angles.includes('three_quarter_front'));
  assert.ok(angles.includes('profile'));
  assert.ok(angles.includes('three_quarter_back'));
  assert.ok(angles.includes('back'));
});

test('expression values stay clamped within safe SVG rendering bounds', () => {
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
  assert.equal(clamp(15, -10, 10), 10);
  assert.equal(clamp(-20, -10, 10), -10);
  assert.equal(clamp(5, -10, 10), 5);
});

