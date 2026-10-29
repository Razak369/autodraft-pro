import { AnimalSoundType } from '../types/studio';

/**
 * Advanced Web Audio & Speech Engine for AutoDraft Studio
 * Generates realistic synthesized sound effects (Animal, Work, Nature, Human),
 * handles Text-to-Speech narration, and manages custom audio recording & uploads.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --- ANIMAL SOUND SYNTHESIS ---
  public playAnimalSound(type: AnimalSoundType) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'cow': {
        // Deep resonant moo with vowel formant filter
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(145, now + 0.3);
        osc.frequency.linearRampToValueAtTime(110, now + 1.2);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.linearRampToValueAtTime(320, now + 0.8);
        filter.Q.value = 4.0;

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.4);
        break;
      }

      case 'rooster': {
        // High-pitched "Cock-a-doodle-doo" sequence
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.setValueAtTime(560, now + 0.15);
        osc.frequency.setValueAtTime(480, now + 0.3);
        osc.frequency.linearRampToValueAtTime(820, now + 0.5);
        osc.frequency.exponentialRampToValueAtTime(520, now + 1.1);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);
        break;
      }

      case 'dog': {
        // 2 sharp barks
        [0, 0.28].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(350, now + delay);
          osc.frequency.exponentialRampToValueAtTime(120, now + delay + 0.16);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now + delay);

          gain.gain.setValueAtTime(0.3, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.005, now + delay + 0.18);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.18);
        });
        break;
      }

      case 'bird': {
        // Sweet chirps
        [0, 0.15, 0.3, 0.45].forEach((delay, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const baseFreq = 2200 + (idx % 2) * 500;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, now + delay);
          osc.frequency.exponentialRampToValueAtTime(baseFreq + 700, now + delay + 0.08);

          gain.gain.setValueAtTime(0.18, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.1);
        });
        break;
      }

      case 'goat': {
        // Bleat with vibrato LFO
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);

        lfo.frequency.setValueAtTime(12, now); // vibrato
        lfoGain.gain.setValueAtTime(25, now);
        lfo.connect(osc.frequency);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 1.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 1.0);
        osc.stop(now + 1.0);
        break;
      }

      case 'lion': {
        // Low growl with noise and bass drop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 1.5);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 1.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.8);
        break;
      }

      case 'cat': {
        // Soft meow pitch bend
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.linearRampToValueAtTime(750, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.9);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.95);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.95);
        break;
      }

      case 'elephant': {
        // Grand trumpet sweep with brass harmonics
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.linearRampToValueAtTime(550, now + 0.4);
        osc1.frequency.linearRampToValueAtTime(440, now + 1.2);

        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.linearRampToValueAtTime(1100, now + 0.4);
        osc2.frequency.linearRampToValueAtTime(880, now + 1.2);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(1600, now + 0.4);
        filter.Q.value = 5.0;

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.45, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 1.5);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.5);
        osc2.stop(now + 1.5);
        break;
      }

      case 'horse': {
        // High whinny with flutter vibrato
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(400, now + 1.2);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(18, now);
        lfoGain.gain.setValueAtTime(70, now);
        lfo.connect(osc.frequency);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 1.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 1.25);
        osc.stop(now + 1.25);
        break;
      }

      case 'buffalo': {
        // Heavy low-pitched snort & guttural moo
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(85, now);
        osc.frequency.linearRampToValueAtTime(105, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(65, now + 1.4);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 1.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.6);
        break;
      }

      case 'monkey': {
        // Rhythmic monkey chatter bursts
        [0, 0.12, 0.24, 0.38, 0.52].forEach((delay, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          const baseFreq = 750 + (idx % 2) * 250;
          osc.frequency.setValueAtTime(baseFreq, now + delay);
          osc.frequency.exponentialRampToValueAtTime(baseFreq + 400, now + delay + 0.08);

          gain.gain.setValueAtTime(0.25, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.005, now + delay + 0.09);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.1);
        });
        break;
      }
    }
  }

  // --- WORK & INDUSTRY SOUND SYNTHESIS ---
  public playWorkSound(type: 'hammer' | 'shutter' | 'tractor' | 'drill' | 'saw' | 'typing') {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'hammer': {
        // Metallic anvil clang
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1760, now);
        osc2.frequency.exponentialRampToValueAtTime(440, now + 0.15);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.8);
        osc2.stop(now + 0.8);
        break;
      }

      case 'shutter': {
        // Rolling shop metal shutter sound (metallic rattles)
        for (let i = 0; i < 7; i++) {
          const delay = i * 0.08;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140 + Math.random() * 80, now + delay);
          gain.gain.setValueAtTime(0.15, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.07);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.07);
        }
        break;
      }

      case 'tractor': {
        // Chugging diesel engine 4-stroke thuds
        for (let i = 0; i < 6; i++) {
          const delay = i * 0.18;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(75, now + delay);
          osc.frequency.exponentialRampToValueAtTime(45, now + delay + 0.12);
          gain.gain.setValueAtTime(0.3, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.14);
        }
        break;
      }

      case 'drill': {
        // High frequency motor whine
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.3);
        osc.frequency.linearRampToValueAtTime(900, now + 1.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.3);
        break;
      }

      case 'saw': {
        // Rhythmic wood saw scraping
        [0, 0.35, 0.7].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, now + delay);
          osc.frequency.linearRampToValueAtTime(320, now + delay + 0.18);
          gain.gain.setValueAtTime(0.2, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.28);
        });
        break;
      }

      case 'typing': {
        // Keyboard click cluster
        [0, 0.08, 0.18, 0.26, 0.38].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800 + Math.random() * 400, now + delay);
          gain.gain.setValueAtTime(0.2, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.04);
        });
        break;
      }
    }
  }

  // --- NATURE SOUND SYNTHESIS ---
  public playNatureSound(type: 'rain' | 'river' | 'crickets' | 'wind' | 'campfire') {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'rain': {
        // Thunder rumble + rain pitter-patter
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 1.8);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.0);
        break;
      }

      case 'river': {
        // Gentle water flow bubbling
        for (let i = 0; i < 8; i++) {
          const delay = i * 0.15;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600 + Math.random() * 500, now + delay);
          osc.frequency.exponentialRampToValueAtTime(400, now + delay + 0.12);
          gain.gain.setValueAtTime(0.08, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.12);
        }
        break;
      }

      case 'crickets': {
        // High frequency pulsating chirp
        for (let i = 0; i < 5; i++) {
          const delay = i * 0.22;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(4500, now + delay);
          gain.gain.setValueAtTime(0.12, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.1);
        }
        break;
      }

      case 'wind': {
        // Whistling wind sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.linearRampToValueAtTime(380, now + 1.0);
        osc.frequency.exponentialRampToValueAtTime(180, now + 2.2);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.3);
        break;
      }

      case 'campfire': {
        // Crackling wood pops
        for (let i = 0; i < 6; i++) {
          const delay = i * 0.2 + Math.random() * 0.1;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(200 + Math.random() * 600, now + delay);
          gain.gain.setValueAtTime(0.15, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.05);
        }
        break;
      }
    }
  }

  // --- HUMAN EMOTIONAL VOICE REACTIONS ---
  public playHumanReaction(type: 'laugh' | 'gasp' | 'cheer' | 'sigh') {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'laugh': {
        // "Ha-ha-ha" bursts
        [0, 0.18, 0.36, 0.54].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(320, now + delay);
          osc.frequency.exponentialRampToValueAtTime(240, now + delay + 0.12);
          gain.gain.setValueAtTime(0.25, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.14);
        });
        break;
      }

      case 'gasp': {
        // Sudden intake pitch rise
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(480, now + 0.35);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
        break;
      }

      case 'cheer': {
        // High celebratory ascending tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.9);
        break;
      }

      case 'sigh': {
        // Descending soft sigh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.7);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }
    }
  }

  // --- TEXT TO SPEECH (REAL HUMAN NARRATION) ---
  public speakText(
    text: string,
    options: {
      pitch?: number;
      rate?: number;
      voiceName?: string;
      onBoundary?: (charIndex: number, charLength?: number) => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    } = {}
  ): SpeechSynthesisUtterance | null {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return null;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = options.pitch ?? 1.0;
    utterance.rate = options.rate ?? 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (options.voiceName) {
      const selectedVoice = voices.find((v) => v.name === options.voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else {
      // Pick best English or Hindi voice available
      const preferred = voices.find((v) => v.lang.includes('hi') || v.lang.includes('en-IN') || v.lang.includes('en'));
      if (preferred) utterance.voice = preferred;
    }

    if (options.onBoundary) {
      utterance.onboundary = (e: SpeechSynthesisEvent) => {
        options.onBoundary?.(e.charIndex, e.charLength);
      };
    }

    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);
    return utterance;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  public stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // --- REAL HUMAN VOICE PERSONAS WITH VOICE MODULATION EDITOR ---
  public speakRealHumanVoice(
    profileType: string,
    text: string,
    options: {
      customPitch?: number;
      customRate?: number;
      emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'whisper' | 'dramatic';
      ageShift?: 'child' | 'youth' | 'adult' | 'elder';
      reverb?: number;
      onBoundary?: (charIndex: number, charLength?: number) => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    } = {}
  ): SpeechSynthesisUtterance | null {
    const profile = REAL_HUMAN_VOICE_CONFIGS[profileType] || REAL_HUMAN_VOICE_CONFIGS.village_hero;

    let finalPitch = options.customPitch ?? profile.pitch;
    let finalRate = options.customRate ?? profile.rate;

    // Apply emotion modulation
    if (options.emotion === 'happy') {
      finalPitch *= 1.12;
      finalRate *= 1.08;
    } else if (options.emotion === 'sad') {
      finalPitch *= 0.88;
      finalRate *= 0.82;
    } else if (options.emotion === 'angry') {
      finalPitch *= 0.92;
      finalRate *= 1.15;
    } else if (options.emotion === 'whisper') {
      finalPitch *= 1.2;
      finalRate *= 0.85;
    } else if (options.emotion === 'dramatic') {
      finalPitch *= 0.8;
      finalRate *= 0.9;
    }

    // Apply age shift modulation
    if (options.ageShift === 'child') {
      finalPitch = Math.min(2.0, finalPitch * 1.35);
      finalRate = Math.min(1.8, finalRate * 1.1);
    } else if (options.ageShift === 'elder') {
      finalPitch = Math.max(0.5, finalPitch * 0.78);
      finalRate = Math.max(0.6, finalRate * 0.84);
    }

    finalPitch = Math.max(0.4, Math.min(2.0, Math.round(finalPitch * 100) / 100));
    finalRate = Math.max(0.5, Math.min(2.0, Math.round(finalRate * 100) / 100));

    return this.speakText(text, {
      pitch: finalPitch,
      rate: finalRate,
      voiceName: undefined,
      onBoundary: options.onBoundary,
      onEnd: options.onEnd,
      onError: options.onError,
    });
  }

  // --- CUSTOM AUDIO DECODING & WAVEFORM EXTRACTION ---
  public async decodeAudioFile(file: File): Promise<{
    duration: number;
    peaks: number[];
    audioUrl: string;
  }> {
    const ctx = this.getContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const audioUrl = URL.createObjectURL(file);

    // Extract 64 normalized waveform peaks for UI visualization
    const rawData = audioBuffer.getChannelData(0);
    const samples = 64;
    const blockSize = Math.floor(rawData.length / samples);
    const peaks: number[] = [];

    for (let i = 0; i < samples; i++) {
      let max = 0;
      for (let j = 0; j < blockSize; j++) {
        const val = Math.abs(rawData[i * blockSize + j] || 0);
        if (val > max) max = val;
      }
      peaks.push(Math.round(max * 100) / 100);
    }

    return {
      duration: Math.round(audioBuffer.duration * 10) / 10,
      peaks,
      audioUrl,
    };
  }
}

export interface HumanVoiceConfig {
  id: string;
  name: string;
  category: 'desi' | 'cartoon_kids' | 'cinematic';
  role: string;
  pitch: number;
  rate: number;
  preferredGender: 'male' | 'female';
  sampleHindi: string;
  sampleEnglish: string;
}

export const REAL_HUMAN_VOICE_CONFIGS: Record<string, HumanVoiceConfig> = {
  dada_ji: {
    id: 'dada_ji',
    name: 'Dada Ji (Elder Grandpa)',
    category: 'desi',
    role: 'Wise village grandfather, moral storyteller',
    pitch: 0.72,
    rate: 0.82,
    preferredGender: 'male',
    sampleHindi: 'Beta, meri baat dhyan se suno. Zindagi me hamesha sachchai ke raste par chalna.',
    sampleEnglish: 'Listen carefully, my child. The ancient roots of our village run deeper than words.',
  },
  village_hero: {
    id: 'village_hero',
    name: 'Raju (Village Hero)',
    category: 'desi',
    role: 'Main hero, energetic youth, determined farmer',
    pitch: 1.05,
    rate: 1.08,
    preferredGender: 'male',
    sampleHindi: 'Hum sab milkar gaon ki taqdeer badal denge! Koi piche nahi hatega!',
    sampleEnglish: 'Together we will build a brighter future for the entire community!',
  },
  dadi_ji: {
    id: 'dadi_ji',
    name: 'Dadi Ji (Grandma)',
    category: 'desi',
    role: 'Loving grandmother, gentle warmth, folk tales',
    pitch: 1.25,
    rate: 0.84,
    preferredGender: 'female',
    sampleHindi: 'Jeete raho mere laal! Aao, pehle garam doodh piyo fir kahani sunati hu.',
    sampleEnglish: 'Bless you, my dear child! Sit close and listen to this tale of courage.',
  },
  village_didi: {
    id: 'village_didi',
    name: 'Meena Didi (Teacher / Heroine)',
    category: 'desi',
    role: 'Expressive heroine, school teacher, bright youth',
    pitch: 1.35,
    rate: 1.05,
    preferredGender: 'female',
    sampleHindi: 'Dekhiye, agar hum ekjut honge toh har mushkil aasan ho jayegi.',
    sampleEnglish: 'Look at the golden sunrise over our fields! Today begins a brand new adventure.',
  },
  auntie_chachi: {
    id: 'auntie_chachi',
    name: 'Chachi Ji (Gossip Auntie)',
    category: 'desi',
    role: 'Dramatic, lively neighborhood mother, high-energy',
    pitch: 1.18,
    rate: 1.22,
    preferredGender: 'female',
    sampleHindi: 'Arre o Sharma ji! Suniye toh sahi, kya gajab khabar aayi hai aaj!',
    sampleEnglish: 'Good heavens! You will not believe what just occurred at the village market!',
  },
  village_pradhan: {
    id: 'village_pradhan',
    name: 'Sarpanch Pradhan Ji',
    category: 'desi',
    role: 'Authoritative panchayat head, deep baritone',
    pitch: 0.64,
    rate: 0.88,
    preferredGender: 'male',
    sampleHindi: 'Panchayat ka faisla aakhri hoga. Gaon ki shanti sabse pehle hai.',
    sampleEnglish: 'The council has spoken. Order and prosperity must guide our village.',
  },
  pandit_ji: {
    id: 'pandit_ji',
    name: 'Pandit Shastri Ji',
    category: 'desi',
    role: 'Solemn scholar, Sanskritized Hindi chants, calm',
    pitch: 0.88,
    rate: 0.86,
    preferredGender: 'male',
    sampleHindi: 'Shubhaste panthanah santu. Satya aur dharmo rakshati rakshitah.',
    sampleEnglish: 'May truth and righteousness be your shield through all walks of life.',
  },
  kisan_kaka: {
    id: 'kisan_kaka',
    name: 'Ramu Kisan (Hardworking Farmer)',
    category: 'desi',
    role: 'Earthy, humble village farmer with warm rustic tone',
    pitch: 0.92,
    rate: 0.96,
    preferredGender: 'male',
    sampleHindi: 'Iss baar baarish achhi hui hai, khet me gehu ki fasal sona ugalegi!',
    sampleEnglish: 'The monsoon rains have blessed our soil; this harvest will feed the whole district!',
  },
  kid_chhotu: {
    id: 'kid_chhotu',
    name: 'Chhotu (Naughty Boy)',
    category: 'cartoon_kids',
    role: 'Curious child, cheerful boy, mischievous',
    pitch: 1.62,
    rate: 1.22,
    preferredGender: 'male',
    sampleHindi: 'Bhaiya dekho mela lag gaya! Chalo jhoola jhoolte hain!',
    sampleEnglish: 'Hooray! The village fair has started! Let us go ride the giant Ferris wheel!',
  },
  pinky_kid: {
    id: 'pinky_kid',
    name: 'Pinky (Cute Little Girl)',
    category: 'cartoon_kids',
    role: 'Sweet bubbly young girl voice for moral & school stories',
    pitch: 1.72,
    rate: 1.15,
    preferredGender: 'female',
    sampleHindi: 'Mummy dekho titli kitni sundar hai! Main bhi iske piche daudungi!',
    sampleEnglish: 'Look at the rainbow butterflies in the garden! Come play with me!',
  },
  motu_cartoon: {
    id: 'motu_cartoon',
    name: 'Golu Samosa Lover (Funny Cartoon)',
    category: 'cartoon_kids',
    role: 'Jolly, round, food-loving comedic cartoon character',
    pitch: 0.78,
    rate: 1.12,
    preferredGender: 'male',
    sampleHindi: 'Arre wah! Garam garam samose ki khushbu se pet me chuhe kood rahe hain!',
    sampleEnglish: 'Oh boy! Fresh hot samosas give me superpower energy!',
  },
  chintu_funny: {
    id: 'chintu_funny',
    name: 'Chintu Comedian (Squeaky Fast)',
    category: 'cartoon_kids',
    role: 'High-pitched slapstick comedy sidekick',
    pitch: 1.85,
    rate: 1.35,
    preferredGender: 'male',
    sampleHindi: 'Bhaago re bhaago! Master ji danda lekar aa rahe hain!',
    sampleEnglish: 'Run for your lives! The principal is coming right this way!',
  },
  mithu_parrot: {
    id: 'mithu_parrot',
    name: 'Mithu Tota (Talking Bird)',
    category: 'cartoon_kids',
    role: 'Crisp high-pitched talking parrot for Panchatantra fables',
    pitch: 1.92,
    rate: 1.28,
    preferredGender: 'male',
    sampleHindi: 'Mithu ko hari mirch aur meetha amrood bahut pasand hai! Tai-tai!',
    sampleEnglish: 'Squawk! The clever parrot knows all the secrets of the enchanted forest!',
  },
  robot_ai: {
    id: 'robot_ai',
    name: 'Cyber Bot 3000 (Sci-Fi Robot)',
    category: 'cartoon_kids',
    role: 'Monotone futuristic droid for sci-fi & tech explainers',
    pitch: 0.58,
    rate: 1.0,
    preferredGender: 'male',
    sampleHindi: 'System online. Animate Studio me sabhi sensors kaam kar rahe hain.',
    sampleEnglish: 'System initialized. All animation protocols are operating at maximum efficiency.',
  },
  story_narrator: {
    id: 'story_narrator',
    name: 'Kahani Sutradhar (Moral Narrator)',
    category: 'cinematic',
    role: 'Rich, soothing Panchatantra & bedtime story narrator',
    pitch: 0.85,
    rate: 0.9,
    preferredGender: 'male',
    sampleHindi: 'Bahut samay pehle ki baat hai, Narmada nadi ke kinare ek sundar gaon tha.',
    sampleEnglish: 'Once upon a time, nestled beside a shimmering river, stood a peaceful village.',
  },
  movie_trailer: {
    id: 'movie_trailer',
    name: 'Epic Blockbuster Trailer Voice',
    category: 'cinematic',
    role: 'Deep thunderous cinema intro & action promo voice',
    pitch: 0.55,
    rate: 0.84,
    preferredGender: 'male',
    sampleHindi: 'Jab andhera badhega, tab uthega ek aisa yoddha jo itihaas badal dega!',
    sampleEnglish: 'In a world on the brink of darkness, one hero will rise to change destiny.',
  },
  horror_ghost: {
    id: 'horror_ghost',
    name: 'Bhootni / Haunted Whisper',
    category: 'cinematic',
    role: 'Eerie, chilling slow voice for horror haveli stories',
    pitch: 0.62,
    rate: 0.72,
    preferredGender: 'female',
    sampleHindi: 'Iss purani haveli me raat ko koi aata hai... darwaza mat kholna...',
    sampleEnglish: 'Do not open the ancient manor door after midnight... someone is watching...',
  },
  news_anchor: {
    id: 'news_anchor',
    name: 'Breaking News Anchor',
    category: 'cinematic',
    role: 'Crisp, fast, authoritative television news reporter',
    pitch: 1.02,
    rate: 1.24,
    preferredGender: 'female',
    sampleHindi: 'Namaskar! Aaj ki sabse badi breaking news seedhe Animate Studio se!',
    sampleEnglish: 'Good evening! Breaking news coming in live from the animation headquarters!',
  },
  police_inspector: {
    id: 'police_inspector',
    name: 'Inspector Vikram (Cop / Detective)',
    category: 'cinematic',
    role: 'Commanding police officer & crime thriller investigator',
    pitch: 0.76,
    rate: 1.04,
    preferredGender: 'male',
    sampleHindi: 'Kanoon ke haath bahut lambe hote hain! Charo taraf se gher lo!',
    sampleEnglish: 'Freeze right there! You are surrounded by the special investigation squad!',
  },
  royal_maharaja: {
    id: 'royal_maharaja',
    name: 'Maharaja Vikramaditya (Royal King)',
    category: 'cinematic',
    role: 'Majestic, regal emperor voice for historical & mythological epics',
    pitch: 0.68,
    rate: 0.86,
    preferredGender: 'male',
    sampleHindi: 'Darbar me nyay hoga! Hamare rajya me har praja sukhi rahegi!',
    sampleEnglish: 'By royal decree, justice and honor shall prevail across the entire kingdom!',
  },
};

export const audioEngine = new AudioEngine();


