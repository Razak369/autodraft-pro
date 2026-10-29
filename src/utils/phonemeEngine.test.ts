import test from 'node:test';
import assert from 'node:assert/strict';
import {
  charToViseme,
  generatePhonemeTimeline,
  sampleVisemeAtTime,
  VISEME_MAP,
} from './phonemeEngine';

test('charToViseme correctly maps vowels and consonants', () => {
  assert.equal(charToViseme('a'), 'AA');
  assert.equal(charToViseme('e'), 'EE');
  assert.equal(charToViseme('i'), 'EE');
  assert.equal(charToViseme('o'), 'OH');
  assert.equal(charToViseme('u'), 'OO');
  assert.equal(charToViseme('m'), 'MBP');
  assert.equal(charToViseme('b'), 'MBP');
  assert.equal(charToViseme('p'), 'MBP');
  assert.equal(charToViseme('f'), 'FV');
  assert.equal(charToViseme('l'), 'LDT');
  assert.equal(charToViseme('s'), 'SZ');
  assert.equal(charToViseme(' '), 'REST');
});

test('generatePhonemeTimeline calculates proper timestamps', () => {
  const text = 'Hello';
  const duration = 1.0;
  const timeline = generatePhonemeTimeline(text, duration);

  assert.equal(timeline.length, 6); // 5 letters + 1 final rest
  assert.equal(timeline[0].char, 'H');
  assert.equal(timeline[0].time, 0);
  assert.equal(timeline[5].viseme, 'REST');
  assert.equal(timeline[5].time, 1.0);
});

test('sampleVisemeAtTime retrieves proper mouth shape', () => {
  const text = 'Ba';
  const duration = 1.0;
  const timeline = generatePhonemeTimeline(text, duration);

  const atStart = sampleVisemeAtTime(timeline, 0.1);
  assert.equal(atStart.viseme, 'MBP');
  assert.equal(atStart.mouthOpen, 0);

  const atMid = sampleVisemeAtTime(timeline, 0.6);
  assert.equal(atMid.viseme, 'AA');
  assert.ok(atMid.mouthOpen > 10);
});
