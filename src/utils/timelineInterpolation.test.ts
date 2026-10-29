import test from 'node:test';
import assert from 'node:assert';
import {
  interpolateEasing,
  interpolateCharacterKeyframes,
  interpolateCameraKeyframes,
  autoAddOrUpdateKeyframe,
  calculateCameraViewRect,
  generateLipSyncKeyframesForText,
} from './timelineInterpolation';
import {
  PART_LIBRARY,
  getPartsByCategory,
  getPartDefinition,
  renderEyeSpecial,
  renderVisemeShape,
} from './partLibrary';
import { sampleMotionClipLimbAngles } from './riggingLogic';
import { CharacterKeyframe, CameraKeyframe, SceneElement } from '../types/studio';

test('Part Library contains at least 6 variants per major category with all 5 angles', () => {
  const categories = ['clothesTop', 'clothesBottom', 'shoes', 'head', 'eyes', 'eyebrows', 'nose', 'ears', 'hair', 'mouth', 'mustache', 'hands', 'earrings'] as const;

  for (const cat of categories) {
    const parts = getPartsByCategory(cat);
    assert.ok(parts.length >= 6, `Category ${cat} must have at least 6 presets, found ${parts.length}`);

    for (const part of parts) {
      assert.ok(part.sprites.front.length > 0, `${part.id} missing front sprite`);
      assert.ok(part.sprites.threeQuarterFront.length > 0, `${part.id} missing 3/4 front sprite`);
      assert.ok(part.sprites.profile.length > 0, `${part.id} missing profile sprite`);
      assert.ok(part.sprites.threeQuarterBack.length > 0, `${part.id} missing 3/4 back sprite`);
      assert.ok(part.sprites.back.length > 0, `${part.id} missing back sprite`);
    }
  }
});

test('interpolateEasing computes expected values for linear, ease-in, ease-out and bounce', () => {
  assert.strictEqual(interpolateEasing(0, 'linear'), 0);
  assert.strictEqual(interpolateEasing(1, 'linear'), 1);
  assert.strictEqual(interpolateEasing(0.5, 'linear'), 0.5);

  const easeInHalf = interpolateEasing(0.5, 'ease-in');
  assert.strictEqual(easeInHalf, 0.25);

  const easeOutHalf = interpolateEasing(0.5, 'ease-out');
  assert.strictEqual(easeOutHalf, 0.75);

  const bounceEnd = interpolateEasing(1, 'bounce');
  assert.ok(Math.abs(bounceEnd - 1) < 0.05);
});

test('interpolateCharacterKeyframes blends transforms, limb angles, and steps discrete properties', () => {
  const kf1: CharacterKeyframe = {
    id: 'kf1',
    time: 0,
    frame: 0,
    easing: 'linear',
    x: 100,
    y: 200,
    scale: 1.0,
    rotation: 0,
    flipX: false,
    viewAngle: 'front',
    expression: 'neutral',
    viseme: 'closed',
    pupilLook: { x: 0, y: 0 },
    bodyPartAngles: { headTilt: 0, torsoLean: 0, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyBob: 0 },
  };

  const kf2: CharacterKeyframe = {
    id: 'kf2',
    time: 2,
    frame: 48,
    easing: 'linear',
    x: 300,
    y: 400,
    scale: 2.0,
    rotation: 90,
    flipX: true,
    viewAngle: 'profile',
    expression: 'happy',
    viseme: 'A',
    pupilLook: { x: 1, y: -1 },
    bodyPartAngles: { headTilt: 20, torsoLean: -10, leftArm: -60, rightArm: 40, leftLeg: -20, rightLeg: 30, bodyBob: -8 },
  };

  // At time 1s (midpoint):
  const mid = interpolateCharacterKeyframes([kf1, kf2], 1.0);
  assert.strictEqual(mid.x, 200);
  assert.strictEqual(mid.y, 300);
  assert.strictEqual(mid.scale, 1.5);
  assert.strictEqual(mid.rotation, 45);
  assert.strictEqual(mid.pupilLook.x, 0.5);
  assert.strictEqual(mid.pupilLook.y, -0.5);
  assert.strictEqual(mid.bodyPartAngles?.headTilt, 10);
  assert.strictEqual(mid.bodyPartAngles?.leftArm, -30);

  // Stepped discrete properties at 50%
  assert.strictEqual(mid.viewAngle, 'profile');
  assert.strictEqual(mid.expression, 'happy');
  assert.strictEqual(mid.viseme, 'A');
});

test('autoAddOrUpdateKeyframe updates existing keyframe if within frame threshold or appends', () => {
  const kf1: CharacterKeyframe = {
    id: 'kf1',
    time: 1.0,
    frame: 24,
    easing: 'linear',
    x: 100,
    y: 100,
    scale: 1,
    rotation: 0,
    flipX: false,
    viewAngle: 'front',
    expression: 'neutral',
    viseme: 'closed',
    pupilLook: { x: 0, y: 0 },
  };

  // Close time should update
  const updated = autoAddOrUpdateKeyframe([kf1], { x: 150 }, 1.02, 24);
  assert.strictEqual(updated.length, 1);
  assert.strictEqual(updated[0].x, 150);

  // Far time should add new keyframe
  const added = autoAddOrUpdateKeyframe(updated, { x: 500 }, 3.5, 24);
  assert.strictEqual(added.length, 2);
  assert.strictEqual(added[1].time, 3.5);
});

test('calculateCameraViewRect generates correct viewport zoom and center coordinates', () => {
  const cam: CameraKeyframe = {
    id: 'cam1',
    time: 0,
    frame: 0,
    easing: 'linear',
    x: 0,
    y: 0,
    zoom: 2.0, // 2x zoom into center
    rotation: 0,
  };

  const rect = calculateCameraViewRect(cam, 960, 540);
  assert.strictEqual(rect.width, 480);
  assert.strictEqual(rect.height, 270);
  assert.strictEqual(rect.x, 240);
  assert.strictEqual(rect.y, 135);
});

test('renderEyeSpecial and renderVisemeShape produce non-empty SVGs in front and profile angles', () => {
  const eyeFront = renderEyeSpecial('front', 'surprised', { x: 0.5, y: -0.2 });
  assert.ok(eyeFront.includes('<circle'));

  const eyeProfile = renderEyeSpecial('profile', 'blink');
  assert.ok(eyeProfile.length > 0);

  const eyeBack = renderEyeSpecial('back');
  assert.strictEqual(eyeBack, '');

  const mouthA = renderVisemeShape('A', 'front');
  assert.ok(mouthA.includes('ellipse'));
});

test('generateLipSyncKeyframesForText generates vowel/consonant mouth visemes across dialogue duration', () => {
  const charElem: SceneElement = {
    id: 'c1',
    type: 'character',
    name: 'Raju',
    x: 200,
    y: 300,
    scale: 1,
    rotation: 0,
    zIndex: 10,
    keyframes: [],
  };

  const kfs = generateLipSyncKeyframesForText(charElem, 'Namaste doston aaj hum kahani sunenge', 0.5, 2.5, 24);
  assert.ok(kfs.length >= 4, 'Should generate multiple viseme keyframes');
  assert.strictEqual(kfs[kfs.length - 1].viseme, 'closed', 'Should close mouth at end of speech');
});

test('sampleMotionClipLimbAngles interpolates basic and advanced motion cycles smoothly', () => {
  const kickAngles = sampleMotionClipLimbAngles('kungfu_combat_kick', 0.56, 1.0);
  assert.ok(typeof kickAngles.rightLeg === 'number');
  assert.ok(Math.abs(kickAngles.rightLeg) > 20, 'Martial arts high kick should raise right leg');
});
