import { test } from 'node:test';
import assert from 'node:assert';
import {
  calculateTwoBoneIK,
  getHandPoseFingers,
  HAND_POSE_PRESETS,
  getEyePoseGeometry,
  getTurnaroundProjection,
  createDefaultModularParts,
  validateAndSanitizeCharacter,
  getMultiAngleAssetView,
} from './characterAssemblyLogic';

test('calculateTwoBoneIK calculates midpoint accurately for reachable target', () => {
  const root = { x: 0, y: 0 };
  const target = { x: 0, y: 60 };
  const len1 = 40;
  const len2 = 40;

  const sol = calculateTwoBoneIK(root, target, len1, len2, false);
  assert.strictEqual(sol.reached, true);
  // Joint 2 should bend to the side
  assert.notStrictEqual(sol.joint2.x, 0);
  assert.ok(sol.joint2.y > 0 && sol.joint2.y < 60);

  // Distances between joint1->joint2 and joint2->target should match limb lengths
  const dist1 = Math.hypot(sol.joint2.x - root.x, sol.joint2.y - root.y);
  const dist2 = Math.hypot(sol.target.x - sol.joint2.x, sol.target.y - sol.joint2.y);
  assert.ok(Math.abs(dist1 - len1) < 0.1);
  assert.ok(Math.abs(dist2 - len2) < 0.1);
});

test('calculateTwoBoneIK gracefully clamps when target exceeds limb length', () => {
  const root = { x: 0, y: 0 };
  const target = { x: 100, y: 100 }; // dist ~141.4
  const len1 = 40;
  const len2 = 40; // max reach is 80

  const sol = calculateTwoBoneIK(root, target, len1, len2, false);
  assert.strictEqual(sol.reached, false);
  const effectiveDist = Math.hypot(sol.target.x - root.x, sol.target.y - root.y);
  assert.ok(effectiveDist <= len1 + len2);
});

test('getHandPoseFingers returns correct curls for all standard poses and custom overrides', () => {
  const fist = getHandPoseFingers('fist');
  assert.strictEqual(fist.index, 100);
  assert.strictEqual(fist.pinky, 100);

  const open = getHandPoseFingers('open_palm');
  assert.strictEqual(open.index, 0);
  assert.strictEqual(open.thumb, 0);

  const point = getHandPoseFingers('point');
  assert.strictEqual(point.index, 0);
  assert.strictEqual(point.middle, 95);

  const thumbsUp = getHandPoseFingers('thumbs_up');
  assert.strictEqual(thumbsUp.thumb, 0);
  assert.strictEqual(thumbsUp.index, 100);

  // Custom fine-tuning override
  const custom = getHandPoseFingers('open_palm', { index: 45, pinky: 90 });
  assert.strictEqual(custom.index, 45);
  assert.strictEqual(custom.pinky, 90);
  assert.strictEqual(custom.middle, 0);
});

test('getEyePoseGeometry returns expected geometry and tears for crying and blink', () => {
  const blink = getEyePoseGeometry('blink');
  assert.strictEqual(blink.isBlink, true);
  assert.ok(blink.lidOpen < 0.2);

  const crying = getEyePoseGeometry('crying_tears');
  assert.strictEqual(crying.showTears, true);

  const shock = getEyePoseGeometry('wide_shock');
  assert.ok(shock.lidOpen > 1.0);

  const customLook = getEyePoseGeometry('look_left', { pupilX: -8 });
  assert.strictEqual(customLook.pupilOffsetX, -8);
});

test('getTurnaroundProjection handles profile, three_quarter, front and back angles', () => {
  const front = getTurnaroundProjection('front');
  assert.strictEqual(front.earCount, 2);
  assert.strictEqual(front.isBackView, false);
  assert.strictEqual(front.isProfile, false);

  const profile = getTurnaroundProjection('profile');
  assert.strictEqual(profile.earCount, 1);
  assert.strictEqual(profile.isProfile, true);
  assert.strictEqual(profile.facingDirection, 'right');

  const back = getTurnaroundProjection('back');
  assert.strictEqual(back.isBackView, true);
});

test('validateAndSanitizeCharacter generates complete structure with defaults', () => {
  const sanitized = validateAndSanitizeCharacter({ name: 'Chacha Ji' });
  assert.strictEqual(sanitized.name, 'Chacha Ji');
  assert.ok(sanitized.pose.head);
  assert.ok(sanitized.modularParts?.head);
  assert.ok(sanitized.modularParts?.eyes);
  assert.ok(sanitized.modularParts?.hands);
});

test('getMultiAngleAssetView picks correct angle representation', () => {
  const views = {
    front: '<svg id="front"></svg>',
    right: '<svg id="right"></svg>',
    left: '<svg id="left"></svg>',
    back: '<svg id="back"></svg>',
  };

  const rightView = getMultiAngleAssetView(views, 'right');
  assert.strictEqual(rightView.content, '<svg id="right"></svg>');
  assert.strictEqual(rightView.isSvg, true);

  const fallback = getMultiAngleAssetView(undefined, 'front', '🚜');
  assert.strictEqual(fallback.content, '🚜');
  assert.strictEqual(fallback.isSvg, false);
});
