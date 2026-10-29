export type VisemeType = 'REST' | 'AA' | 'EE' | 'OH' | 'OO' | 'MBP' | 'FV' | 'LDT' | 'SZ';

export interface VisemeShape {
  viseme: VisemeType;
  label: string;
  mouthOpen: number; // 0 to 24
  mouthWidth: number; // 10 to 30
  mouthCurve: number; // -10 to +10
  showTeethUpper: boolean;
  showTeethLower: boolean;
  showTongue: boolean;
  pucker: boolean;
}

export const VISEME_MAP: Record<VisemeType, VisemeShape> = {
  REST: {
    viseme: 'REST',
    label: 'Rest / Neutral',
    mouthOpen: 1,
    mouthWidth: 18,
    mouthCurve: 0,
    showTeethUpper: false,
    showTeethLower: false,
    showTongue: false,
    pucker: false,
  },
  MBP: {
    viseme: 'MBP',
    label: 'M, B, P (Closed)',
    mouthOpen: 0,
    mouthWidth: 16,
    mouthCurve: 0,
    showTeethUpper: false,
    showTeethLower: false,
    showTongue: false,
    pucker: false,
  },
  AA: {
    viseme: 'AA',
    label: 'Ah, Aa, H (Open)',
    mouthOpen: 18,
    mouthWidth: 22,
    mouthCurve: 2,
    showTeethUpper: true,
    showTeethLower: true,
    showTongue: false,
    pucker: false,
  },
  EE: {
    viseme: 'EE',
    label: 'Ee, I, Y (Wide)',
    mouthOpen: 8,
    mouthWidth: 26,
    mouthCurve: 6,
    showTeethUpper: true,
    showTeethLower: true,
    showTongue: false,
    pucker: false,
  },
  OH: {
    viseme: 'OH',
    label: 'Oh, O (Rounded)',
    mouthOpen: 15,
    mouthWidth: 15,
    mouthCurve: 0,
    showTeethUpper: false,
    showTeethLower: false,
    showTongue: false,
    pucker: true,
  },
  OO: {
    viseme: 'OO',
    label: 'Oo, U, W (Pucker)',
    mouthOpen: 9,
    mouthWidth: 10,
    mouthCurve: -1,
    showTeethUpper: false,
    showTeethLower: false,
    showTongue: false,
    pucker: true,
  },
  FV: {
    viseme: 'FV',
    label: 'F, V (Bite Lip)',
    mouthOpen: 5,
    mouthWidth: 19,
    mouthCurve: 1,
    showTeethUpper: true,
    showTeethLower: false,
    showTongue: false,
    pucker: false,
  },
  LDT: {
    viseme: 'LDT',
    label: 'L, D, T, N, R (Tongue)',
    mouthOpen: 11,
    mouthWidth: 21,
    mouthCurve: 3,
    showTeethUpper: true,
    showTeethLower: false,
    showTongue: true,
    pucker: false,
  },
  SZ: {
    viseme: 'SZ',
    label: 'S, Z, Ch, J (Teeth)',
    mouthOpen: 6,
    mouthWidth: 23,
    mouthCurve: 4,
    showTeethUpper: true,
    showTeethLower: true,
    showTongue: false,
    pucker: false,
  },
};

/**
 * Recognizes the corresponding viseme from a character or phoneme cluster
 */
export function charToViseme(char: string): VisemeType {
  const c = char.toLowerCase();

  // Vowels
  if (c === 'a') return 'AA';
  if (c === 'e' || c === 'i' || c === 'y') return 'EE';
  if (c === 'o') return 'OH';
  if (c === 'u' || c === 'w') return 'OO';

  // Bilabial
  if (c === 'm' || c === 'b' || c === 'p') return 'MBP';

  // Labiodental
  if (c === 'f' || c === 'v') return 'FV';

  // Alveolar / Dental with tongue
  if (c === 'l' || c === 'd' || c === 't' || c === 'n' || c === 'r') return 'LDT';

  // Sibilants
  if (c === 's' || c === 'z' || c === 'c' || c === 'j' || c === 'g') return 'SZ';

  // Spaces or punctuation
  if (c === ' ' || c === '.' || c === ',' || c === '!' || c === '?') return 'REST';

  return 'AA';
}

export interface TimedViseme {
  time: number; // in seconds
  char: string;
  viseme: VisemeType;
}

/**
 * Parses text into a timed sequence of visemes based on estimated speech rate
 */
export function generatePhonemeTimeline(text: string, totalDuration: number): TimedViseme[] {
  const clean = text.trim();
  if (!clean) return [{ time: 0, char: ' ', viseme: 'REST' }];

  const totalChars = clean.length;
  const timePerChar = totalDuration / Math.max(1, totalChars);

  const timeline: TimedViseme[] = [];
  for (let i = 0; i < totalChars; i++) {
    const ch = clean[i];
    const viseme = charToViseme(ch);
    timeline.push({
      time: i * timePerChar,
      char: ch,
      viseme,
    });
  }

  // End on rest
  timeline.push({
    time: totalDuration,
    char: ' ',
    viseme: 'REST',
  });

  return timeline;
}

/**
 * Samples the viseme at a given timestamp
 */
export function sampleVisemeAtTime(timeline: TimedViseme[], time: number): VisemeShape {
  if (timeline.length === 0) return VISEME_MAP.REST;

  for (let i = timeline.length - 1; i >= 0; i--) {
    if (time >= timeline[i].time) {
      return VISEME_MAP[timeline[i].viseme] || VISEME_MAP.REST;
    }
  }

  return VISEME_MAP[timeline[0].viseme] || VISEME_MAP.REST;
}
