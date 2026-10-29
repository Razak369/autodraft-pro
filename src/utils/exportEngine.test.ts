/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  calculateExportDimensions,
  calculateTotalFrames,
  estimateExportFileSize,
  generateExportFilename,
  formatRenderTime,
  getExportProjectDuration,
} from './exportEngine.ts';
import { StudioProject } from '../types/studio.ts';

test('calculateExportDimensions returns correct pixel dimensions for 16:9 and 9:16', () => {
  const dim1080_169 = calculateExportDimensions('16:9', '1080p');
  assert.strictEqual(dim1080_169.width, 1920);
  assert.strictEqual(dim1080_169.height, 1080);

  const dim1080_916 = calculateExportDimensions('9:16', '1080p');
  assert.strictEqual(dim1080_916.width, 1080);
  assert.strictEqual(dim1080_916.height, 1920);

  const dim4k_169 = calculateExportDimensions('16:9', '4k');
  assert.strictEqual(dim4k_169.width, 3840);
  assert.strictEqual(dim4k_169.height, 2160);

  const dim720_169 = calculateExportDimensions('16:9', '720p');
  assert.strictEqual(dim720_169.width, 1280);
  assert.strictEqual(dim720_169.height, 720);

  const dim480_916 = calculateExportDimensions('9:16', '480p');
  assert.strictEqual(dim480_916.width, 480);
  assert.strictEqual(dim480_916.height, 854);
});

test('calculateTotalFrames computes accurate frame counts', () => {
  assert.strictEqual(calculateTotalFrames(5, 24), 120);
  assert.strictEqual(calculateTotalFrames(10, 30), 300);
  assert.strictEqual(calculateTotalFrames(2.5, 60), 150);
  assert.strictEqual(calculateTotalFrames(0, 30), 0);
});

test('estimateExportFileSize outputs positive sizes and reasonable format strings', () => {
  const mp4Estimate = estimateExportFileSize(10, 30, 'mp4', 'high', '1080p');
  assert.ok(mp4Estimate.bytes > 0);
  assert.ok(mp4Estimate.formatted.includes('MB'));

  const gifEstimate = estimateExportFileSize(5, 24, 'gif', 'standard', '720p');
  assert.ok(gifEstimate.bytes > 0);
  assert.ok(gifEstimate.formatted.includes('MB') || gifEstimate.formatted.includes('KB'));
});

test('generateExportFilename sanitizes titles and includes quality specs', () => {
  const name1 = generateExportFilename('Village Farmer Story #1!', 'mp4', '1080p', 30);
  assert.strictEqual(name1, 'village_farmer_story_1_1080p_30fps.mp4');

  const name2 = generateExportFilename('Dance Reel', 'gif', '720p', 24);
  assert.strictEqual(name2, 'dance_reel_720p_24fps.gif');

  const nameEmpty = generateExportFilename('', 'mp4', '4k', 60);
  assert.strictEqual(nameEmpty, 'animation_project_4k_60fps.mp4');
});

test('formatRenderTime formats minutes and seconds correctly', () => {
  assert.strictEqual(formatRenderTime(0), '00:00');
  assert.strictEqual(formatRenderTime(65), '01:05');
  assert.strictEqual(formatRenderTime(120), '02:00');
});

test('getExportProjectDuration calculates total scene duration', () => {
  const sampleProj: StudioProject = {
    id: 'test_p',
    title: 'Test Proj',
    aspectRatio: '16:9',
    createdAt: 0,
    updatedAt: 0,
    fps: 24,
    currentSceneId: 's1',
    scenes: [
      { id: 's1', name: 'Scene 1', duration: 4.5, backgroundColor: '#fff', elements: [], audioTracks: [] },
      { id: 's2', name: 'Scene 2', duration: 5.5, backgroundColor: '#fff', elements: [], audioTracks: [] },
    ],
  };

  assert.strictEqual(getExportProjectDuration(sampleProj, []), 10.0);
  assert.strictEqual(getExportProjectDuration(sampleProj, ['s1']), 4.5);
});
