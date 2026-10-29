import React, { useState, useRef, useEffect } from 'react';
import {
  AudioTrackItem,
  RealHumanVoiceType,
  VoiceModulationConfig,
  SceneElement,
} from '../types/studio';
import { audioEngine, REAL_HUMAN_VOICE_CONFIGS } from '../utils/audioEngine';
import {
  VisemeShape as PhonemeVisemeShape,
  VISEME_MAP,
  VisemeType,
  charToViseme,
  generatePhonemeTimeline,
  sampleVisemeAtTime,
} from '../utils/phonemeEngine';
import { PhonemeLivePreview } from './PhonemeLivePreview';
import {
  Volume2,
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  Plus,
  Check,
  Sliders,
  Sparkles,
  User,
  RotateCcw,
} from 'lucide-react';

interface AudioVoiceStudioProps {
  onAddAudioToTimeline: (track: AudioTrackItem) => void;
  sceneCharacters?: SceneElement[];
}

export const AudioVoiceStudio: React.FC<AudioVoiceStudioProps> = ({
  onAddAudioToTimeline,
  sceneCharacters = [],
}) => {
  const [activeTab, setActiveTab] = useState<
    'human_voices' | 'animal_sfx' | 'tts' | 'record' | 'upload'
  >('human_voices');

  // Voice Library Filter Category
  const [voiceCategoryFilter, setVoiceCategoryFilter] = useState<
    'all' | 'desi' | 'cartoon_kids' | 'cinematic'
  >('all');

  // Selected Voice Persona (from 20+ library)
  const [selectedHumanVoice, setSelectedHumanVoice] =
    useState<RealHumanVoiceType>('dada_ji');
  const [humanDialogueText, setHumanDialogueText] = useState<string>(
    REAL_HUMAN_VOICE_CONFIGS.dada_ji.sampleHindi
  );

  // Voice Editor / Modulation Controls ("voices ko edit karne ka bhi option dalo")
  const [voiceModulation, setVoiceModulation] = useState<VoiceModulationConfig>({
    pitch: REAL_HUMAN_VOICE_CONFIGS.dada_ji.pitch,
    rate: REAL_HUMAN_VOICE_CONFIGS.dada_ji.rate,
    emotion: 'neutral',
    ageShift: 'adult',
    reverb: 15,
    bassBoost: 2,
  });

  // Auto Lip-Sync & Target Character
  const [autoLipSyncEnabled, setAutoLipSyncEnabled] = useState<boolean>(true);
  const [targetCharacterId, setTargetCharacterId] = useState<string>(
    sceneCharacters[0]?.id || 'auto'
  );

  // Custom TTS State
  const [ttsText, setTtsText] = useState<string>(
    'Namaste dosto! Animate Studio me aapka swagat hai. Aaj hum banayenge ek shaandaar 2D animation story.'
  );
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [ttsAddedToast, setTtsAddedToast] = useState<boolean>(false);

  // Live Phoneme & Waveform Preview State
  const [currentViseme, setCurrentViseme] = useState<PhonemeVisemeShape>(VISEME_MAP.REST);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const phonemeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // SFX Categories
  const [sfxCategory, setSfxCategory] = useState<'animal' | 'work' | 'nature' | 'human'>('animal');

  // Mic Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioName, setRecordedAudioName] = useState<string>('My Voiceover Take 1');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedDuration, setUploadedDuration] = useState<number>(3.5);

  useEffect(() => {
    const updateVoices = () => {
      const v = audioEngine.getAvailableVoices();
      setAvailableVoices(v);
      if (v.length > 0 && !selectedVoice) {
        const preferred = v.find(
          (voice) =>
            voice.lang.includes('hi') || voice.lang.includes('en-IN') || voice.lang.includes('en')
        );
        if (preferred) setSelectedVoice(preferred.name);
      }
    };
    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice]);

  const handleSelectVoiceProfile = (key: RealHumanVoiceType) => {
    const prof = REAL_HUMAN_VOICE_CONFIGS[key];
    setSelectedHumanVoice(key);
    setHumanDialogueText(prof.sampleHindi);
    setVoiceModulation((prev) => ({
      ...prev,
      pitch: prof.pitch,
      rate: prof.rate,
    }));
  };

  const handleResetVoiceModulation = () => {
    const prof = REAL_HUMAN_VOICE_CONFIGS[selectedHumanVoice];
    setVoiceModulation({
      pitch: prof.pitch,
      rate: prof.rate,
      emotion: 'neutral',
      ageShift: 'adult',
      reverb: 10,
      bassBoost: 0,
    });
  };

  const handlePlayRealHumanVoice = (profileKey: RealHumanVoiceType) => {
    if (isSpeaking) {
      audioEngine.stopSpeech();
      setIsSpeaking(false);
      if (phonemeIntervalRef.current) clearInterval(phonemeIntervalRef.current);
      setCurrentViseme(VISEME_MAP.REST);
      setCurrentWord('');
      setAudioLevel(0);
      return;
    }

    const profile = REAL_HUMAN_VOICE_CONFIGS[profileKey] || REAL_HUMAN_VOICE_CONFIGS.dada_ji;
    const text = humanDialogueText.trim() || profile.sampleHindi;
    const effectiveRate = voiceModulation.rate || profile.rate;
    const wordCount = text.split(/\s+/).length;
    const estDuration = Math.max(1.8, Math.round((wordCount / (2.4 * effectiveRate)) * 10) / 10);
    const timeline = generatePhonemeTimeline(text, estDuration);
    const startTime = performance.now();

    setIsSpeaking(true);
    setAudioLevel(0.75);

    const timer = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed >= estDuration) {
        clearInterval(timer);
        setCurrentViseme(VISEME_MAP.REST);
        setCurrentWord('');
        setAudioLevel(0);
        setIsSpeaking(false);
        return;
      }
      const viseme = sampleVisemeAtTime(timeline, elapsed);
      setCurrentViseme(viseme);
      setAudioLevel(0.4 + Math.random() * 0.5);
    }, 60);
    phonemeIntervalRef.current = timer;

    audioEngine.speakRealHumanVoice(profileKey, text, {
      customPitch: voiceModulation.pitch,
      customRate: voiceModulation.rate,
      emotion: voiceModulation.emotion,
      ageShift: voiceModulation.ageShift,
      reverb: voiceModulation.reverb,
      onEnd: () => {
        clearInterval(timer);
        setCurrentViseme(VISEME_MAP.REST);
        setCurrentWord('');
        setAudioLevel(0);
        setIsSpeaking(false);
      },
      onError: () => {
        clearInterval(timer);
        setCurrentViseme(VISEME_MAP.REST);
        setCurrentWord('');
        setAudioLevel(0);
        setIsSpeaking(false);
      },
    });
  };

  const handleAddHumanVoiceToTimeline = () => {
    const profile =
      REAL_HUMAN_VOICE_CONFIGS[selectedHumanVoice] || REAL_HUMAN_VOICE_CONFIGS.dada_ji;
    const text = humanDialogueText.trim() || profile.sampleHindi;
    const effectiveRate = voiceModulation.rate || profile.rate;
    const wordCount = text.split(/\s+/).length;
    const estDuration = Math.max(1.8, Math.round((wordCount / (2.4 * effectiveRate)) * 10) / 10);

    const track: AudioTrackItem = {
      id: `audio_human_${Date.now()}`,
      name: `${profile.name}: "${text.slice(0, 22)}..."`,
      type: 'tts',
      category: 'human',
      startTime: 0,
      duration: estDuration,
      volume: 1.0,
      text,
      humanVoiceProfile: selectedHumanVoice,
      voiceModulation: { ...voiceModulation },
      autoLipSync: autoLipSyncEnabled,
      targetCharacterId: targetCharacterId === 'auto' ? undefined : targetCharacterId,
    };
    onAddAudioToTimeline(track);
    setTtsAddedToast(true);
    setTimeout(() => setTtsAddedToast(false), 2200);
  };

  const handleSpeakTTS = () => {
    if (isSpeaking) {
      audioEngine.stopSpeech();
      setIsSpeaking(false);
      if (phonemeIntervalRef.current) clearInterval(phonemeIntervalRef.current);
      setCurrentViseme(VISEME_MAP.REST);
      setCurrentWord('');
      setAudioLevel(0);
      return;
    }

    const wordCount = ttsText.trim().split(/\s+/).length;
    const estimatedDuration = Math.max(
      1.5,
      Math.round((wordCount / (2.5 * speechRate)) * 10) / 10
    );
    const timeline = generatePhonemeTimeline(ttsText, estimatedDuration);
    const startTime = performance.now();

    setIsSpeaking(true);
    setAudioLevel(0.7);

    const timer = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed >= estimatedDuration) {
        clearInterval(timer);
        setCurrentViseme(VISEME_MAP.REST);
        setCurrentWord('');
        setAudioLevel(0);
        return;
      }
      const viseme = sampleVisemeAtTime(timeline, elapsed);
      setCurrentViseme(viseme);
      setAudioLevel(0.4 + Math.random() * 0.5);
    }, 60);
    phonemeIntervalRef.current = timer;

    audioEngine.speakText(ttsText, {
      pitch: speechPitch,
      rate: speechRate,
      voiceName: selectedVoice,
      onBoundary: (charIndex, charLength) => {
        const word = ttsText.slice(charIndex, charIndex + (charLength || 6)).trim();
        if (word) setCurrentWord(word);
        const char = ttsText[charIndex] || ' ';
        const vType = charToViseme(char);
        setCurrentViseme(VISEME_MAP[vType] || VISEME_MAP.REST);
      },
      onEnd: () => {
        setIsSpeaking(false);
        if (phonemeIntervalRef.current) clearInterval(phonemeIntervalRef.current);
        setCurrentViseme(VISEME_MAP.REST);
        setCurrentWord('');
        setAudioLevel(0);
      },
      onError: () => {
        setIsSpeaking(false);
        if (phonemeIntervalRef.current) clearInterval(phonemeIntervalRef.current);
        setCurrentViseme(VISEME_MAP.REST);
        setCurrentWord('');
        setAudioLevel(0);
      },
    });
  };

  const handleAddTTSToTimeline = () => {
    const wordCount = ttsText.trim().split(/\s+/).length;
    const estimatedDuration = Math.max(
      1.5,
      Math.round((wordCount / (2.5 * speechRate)) * 10) / 10
    );

    const track: AudioTrackItem = {
      id: `audio_tts_${Date.now()}`,
      name: `TTS Voice: "${ttsText.slice(0, 24)}..."`,
      type: 'tts',
      category: 'human',
      startTime: 0,
      duration: estimatedDuration,
      volume: 1.0,
      text: ttsText,
      voiceName: selectedVoice,
      voiceModulation: {
        pitch: speechPitch,
        rate: speechRate,
        emotion: voiceModulation.emotion,
        ageShift: voiceModulation.ageShift,
        reverb: voiceModulation.reverb,
        bassBoost: voiceModulation.bassBoost,
      },
      autoLipSync: autoLipSyncEnabled,
      targetCharacterId: targetCharacterId === 'auto' ? undefined : targetCharacterId,
    };

    onAddAudioToTimeline(track);
    setTtsAddedToast(true);
    setTimeout(() => setTtsAddedToast(false), 2200);
  };

  const SFX_ITEMS = {
    animal: [
      { id: 'cow', name: 'Village Cow (हम्बा / Gau Mata)', icon: '🐄', desc: 'Resonant deep low moo', fn: () => audioEngine.playAnimalSound('cow'), visemes: ['OH', 'OH', 'OO', 'REST'] as VisemeType[] },
      { id: 'dog', name: 'Village Dog (भौं-भौं / Bark)', icon: '🐕', desc: 'Dual energetic bark', fn: () => audioEngine.playAnimalSound('dog'), visemes: ['AA', 'SZ', 'REST', 'AA', 'SZ', 'REST'] as VisemeType[] },
      { id: 'rooster', name: 'Rooster (कुक्कड़ू-कूँ / Morning Crow)', icon: '🐓', desc: 'Loud crisp morning wakeup call', fn: () => audioEngine.playAnimalSound('rooster'), visemes: ['AA', 'OH', 'AA', 'REST'] as VisemeType[] },
      { id: 'cat', name: 'Friendly Cat (म्याऊँ / Meow)', icon: '🐱', desc: 'Melodic gentle meow', fn: () => audioEngine.playAnimalSound('cat'), visemes: ['EE', 'AA', 'OO', 'REST'] as VisemeType[] },
      { id: 'goat', name: 'Farm Goat (मैं-मैं / Bleat)', icon: '🐐', desc: 'Vibrato bleat sound', fn: () => audioEngine.playAnimalSound('goat'), visemes: ['AA', 'EE', 'AA', 'REST'] as VisemeType[] },
      { id: 'elephant', name: 'Royal Elephant (चिंघाड़ / Trumpet)', icon: '🐘', desc: 'Grand brassy elephant trumpet sweep', fn: () => audioEngine.playAnimalSound('elephant'), visemes: ['AA', 'OH', 'REST'] as VisemeType[] },
      { id: 'horse', name: 'Village Horse (हिनहिनाहट / Whinny)', icon: '🐎', desc: 'High flutter neigh & gallop vibrato', fn: () => audioEngine.playAnimalSound('horse'), visemes: ['EE', 'AA', 'REST'] as VisemeType[] },
      { id: 'buffalo', name: 'Deep Buffalo (भैंस का रंभाना)', icon: '🐃', desc: 'Heavy guttural snort and low moo', fn: () => audioEngine.playAnimalSound('buffalo'), visemes: ['OH', 'OO', 'REST'] as VisemeType[] },
      { id: 'monkey', name: 'Jungle Bandar (बंदर की खों-खों)', icon: '🐒', desc: 'Rhythmic chattering bursts', fn: () => audioEngine.playAnimalSound('monkey'), visemes: ['AA', 'EE', 'AA', 'REST'] as VisemeType[] },
      { id: 'lion', name: 'Sher Tiger Roar (शेर की दहाड़)', icon: '🐅', desc: 'Deep subwoofer bass rumble', fn: () => audioEngine.playAnimalSound('lion'), visemes: ['AA', 'OH', 'REST'] as VisemeType[] },
      { id: 'bird', name: 'Morning Birds (चहचहाहट)', icon: '🐦', desc: 'Playful sweet chirp sequence', fn: () => audioEngine.playAnimalSound('bird'), visemes: ['EE', 'REST', 'EE', 'REST'] as VisemeType[] },
    ],
    work: [
      { id: 'hammer', name: 'Lohar Iron Hammer Clang', icon: '🔨', desc: 'Sharp metallic strike on anvil', fn: () => audioEngine.playWorkSound('hammer'), visemes: ['SZ', 'REST'] as VisemeType[] },
      { id: 'shutter', name: 'Kirana Shop Metal Shutter', icon: '🏬', desc: 'Rolling steel shutter closing', fn: () => audioEngine.playWorkSound('shutter'), visemes: ['SZ', 'REST'] as VisemeType[] },
      { id: 'tractor', name: 'Farm Tractor Diesel Chug', icon: '🚜', desc: 'Rhythmic heavy 4-stroke thumping', fn: () => audioEngine.playWorkSound('tractor'), visemes: ['MBP', 'OH', 'MBP', 'REST'] as VisemeType[] },
      { id: 'drill', name: 'Electric Workshop Drill', icon: '⚙️', desc: 'High torque motor whine', fn: () => audioEngine.playWorkSound('drill'), visemes: ['SZ', 'REST'] as VisemeType[] },
      { id: 'saw', name: 'Carpenter Wood Sawing', icon: '🪚', desc: 'Rough back-and-forth friction', fn: () => audioEngine.playWorkSound('saw'), visemes: ['SZ', 'REST'] as VisemeType[] },
      { id: 'typing', name: 'Office Keyboard Typing', icon: '⌨️', desc: 'Clicky typewriter cluster', fn: () => audioEngine.playWorkSound('typing'), visemes: ['LDT', 'REST'] as VisemeType[] },
    ],
    nature: [
      { id: 'rain', name: 'Monsoon Rain & Thunder', icon: '⛈️', desc: 'Deep thunder roll & storm drops', fn: () => audioEngine.playNatureSound('rain'), visemes: ['OH', 'REST'] as VisemeType[] },
      { id: 'river', name: 'Ganga River Flow / Stream', icon: '🌊', desc: 'Gentle bubbling water stream', fn: () => audioEngine.playNatureSound('river'), visemes: ['REST'] as VisemeType[] },
      { id: 'crickets', name: 'Night Village Crickets', icon: '🦗', desc: 'Nocturnal ambient cicada pulse', fn: () => audioEngine.playNatureSound('crickets'), visemes: ['EE', 'REST'] as VisemeType[] },
      { id: 'wind', name: 'Mountain Wind Breeze', icon: '🍃', desc: 'Whistling airy gust', fn: () => audioEngine.playNatureSound('wind'), visemes: ['OO', 'REST'] as VisemeType[] },
      { id: 'campfire', name: 'Night Bonfire / Campfire', icon: '🔥', desc: 'Warm crackling dry wood embers', fn: () => audioEngine.playNatureSound('campfire'), visemes: ['REST'] as VisemeType[] },
    ],
    human: [
      { id: 'laugh', name: 'Hearty Indian Laugh', icon: '😂', desc: 'Cheerful laughter burst', fn: () => audioEngine.playHumanReaction('laugh'), visemes: ['AA', 'EE', 'AA', 'EE', 'REST'] as VisemeType[] },
      { id: 'gasp', name: 'Astonished Shock Gasp', icon: '😲', desc: 'Sudden intake dramatic breath', fn: () => audioEngine.playHumanReaction('gasp'), visemes: ['OH', 'AA', 'REST'] as VisemeType[] },
      { id: 'cheer', name: 'Crowd Celebration Cheer', icon: '🎉', desc: 'Jubilant ascending shout', fn: () => audioEngine.playHumanReaction('cheer'), visemes: ['AA', 'EE', 'REST'] as VisemeType[] },
      { id: 'sigh', name: 'Relieved Soft Sigh', icon: '😌', desc: 'Comfortable descending breath', fn: () => audioEngine.playHumanReaction('sigh'), visemes: ['OH', 'REST'] as VisemeType[] },
    ],
  };

  const handlePlaySFXWithPreview = (sfx: any) => {
    sfx.fn();
    const visemes = sfx.visemes || ['AA', 'REST'];
    let step = 0;
    setAudioLevel(0.85);
    setCurrentWord(sfx.name);

    const sfxTimer = setInterval(() => {
      if (step >= visemes.length) {
        clearInterval(sfxTimer);
        setCurrentViseme(VISEME_MAP.REST);
        setAudioLevel(0);
        setCurrentWord('');
        return;
      }
      setCurrentViseme(VISEME_MAP[visemes[step] as VisemeType] || VISEME_MAP.REST);
      setAudioLevel(0.5 + Math.random() * 0.4);
      step++;
    }, 200);
  };

  const handleAddSFXToTimeline = (item: { id: string; name: string }) => {
    const track: AudioTrackItem = {
      id: `audio_sfx_${Date.now()}`,
      name: item.name,
      type: 'sfx',
      category: sfxCategory,
      startTime: 0,
      duration: sfxCategory === 'nature' ? 4.0 : 2.0,
      volume: 0.9,
      soundType: item.id,
    };
    onAddAudioToTimeline(track);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);
      setAudioLevel(0.65);

      const micMouthCycle: VisemeType[] = ['AA', 'EE', 'OH', 'MBP', 'LDT', 'SZ'];
      let cycleIdx = 0;

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
        cycleIdx = (cycleIdx + 1) % micMouthCycle.length;
        setCurrentViseme(VISEME_MAP[micMouthCycle[cycleIdx]]);
        setAudioLevel(0.4 + Math.random() * 0.5);
      }, 300);
    } catch {
      // ignore if mic not available in headless environment
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setAudioLevel(0);
      setCurrentViseme(VISEME_MAP.REST);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  const handleAddRecordedAudio = () => {
    if (!recordedAudioUrl) return;
    const track: AudioTrackItem = {
      id: `audio_rec_${Date.now()}`,
      name: recordedAudioName || 'Microphone Voiceover',
      type: 'recorded',
      category: 'human',
      startTime: 0,
      duration: Math.max(1, recordingSeconds),
      volume: 1.0,
      audioBlobUrl: recordedAudioUrl,
      autoLipSync: autoLipSyncEnabled,
    };
    onAddAudioToTimeline(track);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      try {
        const decoded = await audioEngine.decodeAudioFile(file);
        setUploadedFileUrl(decoded.audioUrl);
        setUploadedDuration(decoded.duration);
      } catch {
        const url = URL.createObjectURL(file);
        setUploadedFileUrl(url);
        setUploadedDuration(4.0);
      }
    }
  };

  const handleAddUploadedAudio = () => {
    if (!uploadedFileUrl) return;
    const track: AudioTrackItem = {
      id: `audio_upload_${Date.now()}`,
      name: uploadedFileName || 'Uploaded Audio Track',
      type: 'upload',
      startTime: 0,
      duration: uploadedDuration,
      volume: 1.0,
      audioBlobUrl: uploadedFileUrl,
    };
    onAddAudioToTimeline(track);
  };

  // Filtered 20+ Voices
  const voiceEntries = Object.entries(REAL_HUMAN_VOICE_CONFIGS).filter(([, prof]) => {
    if (voiceCategoryFilter === 'all') return true;
    return prof.category === voiceCategoryFilter;
  });

  return (
    <div className="flex flex-col h-full bg-[#131418] text-gray-200">
      {/* HEADER WITH TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-[#1a1c23] border-b border-[#2b2f3e]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
            <Volume2 size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Animate Studio — Voice Library, Voice Editor & Auto Lip-Sync
            </h2>
            <p className="text-xs text-gray-400">
              20+ character voices, custom pitch/speed/emotion voice editor, and 1-click timeline lip-sync
            </p>
          </div>
        </div>

        <div className="flex bg-[#131418] p-1 rounded-lg border border-[#2b2f3e] gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('human_voices')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'human_voices'
                ? 'bg-[#2563eb] text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            20+ Voice Library & Voice Editor
          </button>
          <button
            onClick={() => setActiveTab('tts')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'tts'
                ? 'bg-[#2563eb] text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Custom Text to Speech
          </button>
          <button
            onClick={() => {
              setActiveTab('animal_sfx');
              setSfxCategory('animal');
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'animal_sfx'
                ? 'bg-[#2563eb] text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Animals & Weather SFX
          </button>
          <button
            onClick={() => setActiveTab('record')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'record'
                ? 'bg-[#2563eb] text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mic Recorder
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'upload'
                ? 'bg-[#2563eb] text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Import Audio
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">
        {/* LEFT COLUMN: ACTIVE TAB CONTROLS */}
        <div className="flex-1 flex flex-col gap-5">
          {/* TAB 1: 20+ VOICE LIBRARY + VOICE EDITOR + AUTO LIP-SYNC */}
          {activeTab === 'human_voices' && (
            <div className="flex flex-col gap-5 bg-[#17191f] border border-[#2b2f3e] rounded-2xl p-5 shadow-xl">
              {/* Category Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  1. Select Voice from Library ({voiceEntries.length} Voices)
                </label>
                <div className="flex gap-1.5">
                  {[
                    { id: 'all', label: 'All Voices (20)' },
                    { id: 'desi', label: 'Desi & Village' },
                    { id: 'cartoon_kids', label: 'Kids & Cartoon' },
                    { id: 'cinematic', label: 'Cinematic & Story' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setVoiceCategoryFilter(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        voiceCategoryFilter === cat.id
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-[#131418] text-gray-400 hover:text-white border border-[#2b2f3e]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {voiceEntries.map(([key, prof]) => {
                  const isSelected = selectedHumanVoice === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectVoiceProfile(key as RealHumanVoiceType)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                          : 'bg-[#131418] border-[#2b2f3e] hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{prof.name}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{prof.role}</p>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                            prof.preferredGender === 'female'
                              ? 'bg-pink-900/40 text-pink-300'
                              : 'bg-blue-900/40 text-blue-300'
                          }`}
                        >
                          {prof.preferredGender === 'female' ? 'Female' : 'Male'}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 italic truncate mt-2 bg-[#1b1d25] px-2 py-1 rounded border border-[#2b2f3e]/50">
                        "{prof.sampleHindi}"
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VOICE EDITOR & MODULATION PANEL ("voices ko edit karne ka bhi option dalo") */}
              <div className="p-4 rounded-xl bg-[#131418] border border-purple-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders size={14} className="text-purple-400" /> 2. Voice Editor & Sound Shaper
                  </span>
                  <button
                    onClick={handleResetVoiceModulation}
                    className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <RotateCcw size={11} /> Reset Voice
                  </button>
                </div>

                {/* Sliders Row: Pitch, Speed, Bass, Reverb */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>Voice Pitch</span>
                      <span className="font-mono text-purple-300">
                        {voiceModulation.pitch.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.9"
                      step="0.05"
                      value={voiceModulation.pitch}
                      onChange={(e) =>
                        setVoiceModulation({
                          ...voiceModulation,
                          pitch: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>Speaking Speed</span>
                      <span className="font-mono text-purple-300">
                        {voiceModulation.rate.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.05"
                      value={voiceModulation.rate}
                      onChange={(e) =>
                        setVoiceModulation({
                          ...voiceModulation,
                          rate: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>Bass / Depth</span>
                      <span className="font-mono text-purple-300">
                        {voiceModulation.bassBoost > 0
                          ? `+${voiceModulation.bassBoost}`
                          : voiceModulation.bassBoost}
                        dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-6"
                      max="10"
                      step="1"
                      value={voiceModulation.bassBoost}
                      onChange={(e) =>
                        setVoiceModulation({
                          ...voiceModulation,
                          bassBoost: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>Room Echo</span>
                      <span className="font-mono text-purple-300">{voiceModulation.reverb}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={voiceModulation.reverb}
                      onChange={(e) =>
                        setVoiceModulation({
                          ...voiceModulation,
                          reverb: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>

                {/* Emotion & Age Shift Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                      Voice Emotion / Tone:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(
                        ['neutral', 'happy', 'sad', 'angry', 'whisper', 'dramatic'] as const
                      ).map((emo) => (
                        <button
                          key={emo}
                          onClick={() => setVoiceModulation({ ...voiceModulation, emotion: emo })}
                          className={`px-2 py-1 rounded text-[10px] font-bold capitalize transition-all ${
                            voiceModulation.emotion === emo
                              ? 'bg-purple-600 text-white shadow'
                              : 'bg-[#1c1f29] text-gray-400 hover:text-white'
                          }`}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                      Character Age Filter:
                    </span>
                    <div className="flex gap-1">
                      {(['child', 'youth', 'adult', 'elder'] as const).map((age) => (
                        <button
                          key={age}
                          onClick={() => setVoiceModulation({ ...voiceModulation, ageShift: age })}
                          className={`flex-1 py-1 rounded text-[10px] font-bold capitalize transition-all ${
                            voiceModulation.ageShift === age
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-[#1c1f29] text-gray-400 hover:text-white'
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dialogue Script Input + Auto Lip-Sync Target */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    3. Dialogue Script for {REAL_HUMAN_VOICE_CONFIGS[selectedHumanVoice]?.name}
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() =>
                        setHumanDialogueText(
                          REAL_HUMAN_VOICE_CONFIGS[selectedHumanVoice]?.sampleHindi || ''
                        )
                      }
                      className="px-2 py-0.5 bg-[#131418] hover:bg-[#252836] border border-[#2b2f3e] rounded text-[11px] text-gray-300"
                    >
                      Hindi Sample
                    </button>
                    <button
                      onClick={() =>
                        setHumanDialogueText(
                          REAL_HUMAN_VOICE_CONFIGS[selectedHumanVoice]?.sampleEnglish || ''
                        )
                      }
                      className="px-2 py-0.5 bg-[#131418] hover:bg-[#252836] border border-[#2b2f3e] rounded text-[11px] text-gray-300"
                    >
                      English Sample
                    </button>
                  </div>
                </div>

                <textarea
                  value={humanDialogueText}
                  onChange={(e) => setHumanDialogueText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#131418] border border-[#2b2f3e] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                  placeholder="Type Hindi, Hinglish, or English dialogue here..."
                />

                {/* Auto Lip-Sync & Target Character Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#131418] border border-[#2b2f3e]">
                  <label className="flex items-center gap-2 text-xs font-bold text-rose-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoLipSyncEnabled}
                      onChange={(e) => setAutoLipSyncEnabled(e.target.checked)}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <Sparkles size={14} className="text-rose-400" />
                    <span>Auto-Generate Character Lip-Sync Keyframes on Timeline</span>
                  </label>

                  {sceneCharacters.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <User size={13} className="text-blue-400" />
                      <span className="text-gray-400">Speaker:</span>
                      <select
                        value={targetCharacterId}
                        onChange={(e) => setTargetCharacterId(e.target.value)}
                        className="px-2.5 py-1 bg-[#1b1e28] border border-[#2b2f3e] rounded-lg text-xs text-white font-semibold"
                      >
                        <option value="auto">Active / First Character</option>
                        {sceneCharacters.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Play & Add Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => handlePlayRealHumanVoice(selectedHumanVoice)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${
                    isSpeaking
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isSpeaking ? <Pause size={16} /> : <Play size={16} />}
                  <span>
                    {isSpeaking ? 'Stop Speaking' : 'AuditionEdited Voice + Live Lip-Sync'}
                  </span>
                </button>

                <button
                  onClick={handleAddHumanVoiceToTimeline}
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                >
                  {ttsAddedToast ? <Check size={16} /> : <Plus size={16} />}
                  <span>
                    {ttsAddedToast ? 'Synced to Timeline!' : 'Add with Auto Lip-Sync'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM TEXT TO SPEECH */}
          {activeTab === 'tts' && (
            <div className="flex flex-col gap-5 bg-[#17191f] border border-[#2b2f3e] rounded-2xl p-5 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Dialogue / Narration Script (Hindi, Hinglish, English)
                </label>
                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#131418] border border-[#2b2f3e] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                  placeholder="Enter character dialogue or scene narration..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#131418] rounded-xl border border-[#2b2f3e]">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    System Voice Engine
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#17191f] border border-[#2b2f3e] rounded-lg text-xs text-white focus:outline-none"
                  >
                    {availableVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                    {availableVoices.length === 0 && (
                      <option value="">Default Studio Synthesizer</option>
                    )}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Voice Pitch</span>
                    <span className="font-mono">{speechPitch}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Speaking Speed</span>
                    <span className="font-mono">{speechRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.6"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSpeakTTS}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all ${
                    isSpeaking
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-[#222530] hover:bg-[#2b2f3e] text-white border border-[#2b2f3e]'
                  }`}
                >
                  {isSpeaking ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isSpeaking ? 'Stop Audition' : 'Audition & Sync Lip-Shape'}</span>
                </button>

                <button
                  onClick={handleAddTTSToTimeline}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
                >
                  {ttsAddedToast ? <Check size={14} /> : <Plus size={14} />}
                  <span>
                    {ttsAddedToast ? 'Synced to Timeline!' : 'Add TTS with Auto Lip-Sync'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ANIMAL & WEATHER SFX */}
          {activeTab === 'animal_sfx' && (
            <div className="flex flex-col gap-5 bg-[#17191f] border border-[#2b2f3e] rounded-2xl p-5 shadow-xl">
              <div className="flex bg-[#131418] p-1 rounded-xl border border-[#2b2f3e] overflow-x-auto gap-1">
                {[
                  { id: 'animal', label: 'Animals (जानवर)', icon: '🐄' },
                  { id: 'work', label: 'Village Work & Tools', icon: '🔨' },
                  { id: 'nature', label: 'Nature & Weather', icon: '⛈️' },
                  { id: 'human', label: 'Human Reactions', icon: '😂' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSfxCategory(cat.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      sfxCategory === cat.id
                        ? 'bg-[#2563eb] text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SFX_ITEMS[sfxCategory].map((sfx) => (
                  <div
                    key={sfx.id}
                    className="p-3.5 bg-[#131418] border border-[#2b2f3e] rounded-xl flex items-center justify-between gap-3 hover:border-gray-500 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#222530] text-xl flex items-center justify-center border border-[#2b2f3e]">
                        {sfx.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{sfx.name}</div>
                        <div className="text-[11px] text-gray-400">{sfx.desc}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePlaySFXWithPreview(sfx)}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-colors border border-blue-500/30"
                        title="Listen to Sound"
                      >
                        <Play size={14} />
                      </button>
                      <button
                        onClick={() => handleAddSFXToTimeline(sfx)}
                        className="p-2 bg-[#222530] hover:bg-emerald-600 text-gray-300 hover:text-white rounded-lg transition-colors border border-[#2b2f3e]"
                        title="Add Sound to Timeline"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MIC RECORDER */}
          {activeTab === 'record' && (
            <div className="flex flex-col items-center justify-center gap-5 bg-[#17191f] border border-[#2b2f3e] rounded-2xl p-6 shadow-xl text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600/10 border-2 border-blue-500/40 flex items-center justify-center text-blue-400">
                <Mic size={28} className={isRecording ? 'text-red-500 animate-pulse' : ''} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">Record Your Own Voiceover</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  Speak into your microphone — watch the live mouth shape change in sync!
                </p>
              </div>

              <div className="text-2xl font-mono font-bold text-white tracking-widest">
                00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
              </div>

              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
                >
                  <Mic size={14} /> Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-red-400 border border-red-500/50 rounded-xl text-xs font-semibold shadow-lg transition-all animate-pulse"
                >
                  <Square size={14} className="fill-current" /> Stop Recording
                </button>
              )}

              {recordedAudioUrl && !isRecording && (
                <div className="w-full max-w-md p-3.5 bg-[#131418] border border-[#2b2f3e] rounded-xl flex flex-col gap-2.5 text-left">
                  <input
                    type="text"
                    value={recordedAudioName}
                    onChange={(e) => setRecordedAudioName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#17191f] border border-[#2b2f3e] rounded-md text-xs text-white"
                  />
                  <audio controls src={recordedAudioUrl} className="w-full h-8" />
                  <button
                    onClick={handleAddRecordedAudio}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
                  >
                    <Plus size={13} /> Add Recording with Lip-Sync
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: UPLOAD AUDIO */}
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center gap-5 bg-[#17191f] border border-[#2b2f3e] rounded-2xl p-6 shadow-xl text-center">
              <div className="w-16 h-16 rounded-full bg-purple-600/10 border-2 border-purple-500/40 flex items-center justify-center text-purple-400">
                <Upload size={28} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">Upload Custom Audio File</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  Upload MP3, WAV, or OGG files to attach directly to your cartoon scene.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg"
              >
                <Upload size={14} /> Select File from Device
              </button>

              {uploadedFileUrl && (
                <div className="w-full max-w-md p-4 bg-[#131418] border border-[#2b2f3e] rounded-xl flex flex-col gap-3 text-left shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white truncate max-w-[220px]">
                      {uploadedFileName}
                    </span>
                    <span className="text-blue-400 font-mono text-[11px]">
                      {uploadedDuration.toFixed(1)}s
                    </span>
                  </div>
                  <audio controls src={uploadedFileUrl} className="w-full h-8" />
                  <button
                    onClick={handleAddUploadedAudio}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
                  >
                    <Plus size={13} /> Add Uploaded Track to Scene
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE PHONEME & MOUTH LIP-SYNC PREVIEW */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <PhonemeLivePreview
            currentViseme={currentViseme}
            isSpeaking={isSpeaking || isRecording}
            spokenText={currentWord || (activeTab === 'human_voices' ? humanDialogueText : ttsText)}
            audioLevel={audioLevel}
          />
        </div>
      </div>
    </div>
  );
};
