import React, { useRef, useEffect, useState } from 'react';
import { VisemeShape, VISEME_MAP, VisemeType } from '../utils/phonemeEngine';
import { Activity, Volume2, Mic, Play, Pause, Sparkles, User } from 'lucide-react';

interface PhonemeLivePreviewProps {
  currentViseme: VisemeShape;
  isPlaying: boolean;
  currentWord?: string;
  onManualVisemeSelect?: (v: VisemeShape) => void;
  characterSkin?: string;
  audioLevel?: number; // 0 to 1
}

export const PhonemeLivePreview: React.FC<PhonemeLivePreviewProps> = ({
  currentViseme,
  isPlaying,
  currentWord,
  onManualVisemeSelect,
  characterSkin = '#d99763',
  audioLevel = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewCharModel, setPreviewCharModel] = useState<'village_man' | 'pandit' | 'woman' | 'modern'>('village_man');
  const [blink, setBlink] = useState<boolean>(false);

  // Periodic natural blinking
  useEffect(() => {
    const timer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Real-time audio waveform canvas renderer
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const numBars = 32;

    const render = () => {
      phase += 0.18;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw background glow
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        // Frequency simulation based on audioLevel and isPlaying
        const baseAmp = isPlaying ? Math.max(0.2, audioLevel) : 0.05;
        const wave = Math.sin(phase + i * 0.35) * 0.4 + Math.cos(phase * 1.5 + i * 0.2) * 0.3;
        const barHeight = Math.max(3, (baseAmp * 0.8 + wave * (isPlaying ? 0.4 : 0.05)) * (height - 8));

        const x = i * (barWidth + 2) + 2;
        const y = (height - barHeight) / 2;

        // Gradient for neon effect
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(0.5, '#3b82f6');
          grad.addColorStop(1, '#818cf8');
        } else {
          grad.addColorStop(0, '#334155');
          grad.addColorStop(1, '#1e293b');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, audioLevel]);

  // Dynamic mouth dimensions based on currentViseme and audio amplitude
  const mouthOpenAmount = isPlaying
    ? Math.max(currentViseme.mouthOpen, currentViseme.viseme === 'MBP' ? 0 : 4)
    : currentViseme.mouthOpen;

  const mouthWidth = currentViseme.mouthWidth;
  const mouthCurve = currentViseme.mouthCurve;

  const skin = previewCharModel === 'pandit' ? '#e5a575' : previewCharModel === 'woman' ? '#eab388' : characterSkin;
  const skinShadow = '#a86539';

  return (
    <div className="bg-[#17191f] border border-[#2b2f3e] rounded-2xl p-4 shadow-xl flex flex-col gap-3 max-w-sm w-full select-none">
      {/* WINDOW HEADER */}
      <div className="flex items-center justify-between border-b border-[#2b2f3e] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Volume2 size={13} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Phoneme Lip-Sync Live Preview</span>
              {isPlaying && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            </h4>
            <p className="text-[10px] text-gray-400">Audio waveform & mouth shape sync</p>
          </div>
        </div>

        {/* Character switcher */}
        <select
          value={previewCharModel}
          onChange={(e) => setPreviewCharModel(e.target.value as any)}
          className="px-2 py-1 bg-[#131418] border border-[#2b2f3e] rounded text-[10px] text-gray-300 focus:outline-none"
        >
          <option value="village_man">Ramesh (Village Man)</option>
          <option value="pandit">Pandit Ji</option>
          <option value="woman">Village Mother</option>
          <option value="modern">Modern Youth</option>
        </select>
      </div>

      {/* CENTER VIEWPORT: CARTOON FACE WITH REAL-TIME PHONEME MOUTH */}
      <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-xl bg-gradient-to-b from-[#141824] to-[#0e111a] border border-[#2b2f3e] flex items-center justify-center overflow-hidden shadow-inner">
        {/* Subtle grid in preview */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />

        <svg viewBox="-80 -80 160 160" className="w-full h-full overflow-visible">
          {/* Ground drop shadow */}
          <ellipse cx="0" cy="65" rx="35" ry="8" fill="#000000" opacity="0.25" />

          {/* Neck */}
          <line x1="0" y1="20" x2="0" y2="55" stroke={skinShadow} strokeWidth="22" strokeLinecap="round" />

          {/* Torso / Shirt Collar */}
          <path
            d="M -30 50 Q 0 45 30 50 L 35 75 L -35 75 Z"
            fill={previewCharModel === 'pandit' ? '#f97316' : '#10b981'}
          />

          {/* Head base */}
          <ellipse cx="0" cy="0" rx="36" ry="42" fill={skin} stroke={skinShadow} strokeWidth="1" />

          {/* Ears */}
          <ellipse cx="-36" cy="2" rx="7" ry="12" fill={skin} stroke={skinShadow} strokeWidth="1.5" />
          <ellipse cx="36" cy="2" rx="7" ry="12" fill={skin} stroke={skinShadow} strokeWidth="1.5" />
          {previewCharModel === 'woman' && (
            <>
              <circle cx="-36" cy="12" r="3" fill="#fbbf24" />
              <circle cx="36" cy="12" r="3" fill="#fbbf24" />
            </>
          )}

          {/* Eyes */}
          <g id="preview-eyes">
            {/* Left Eyebrow */}
            <path d="M -22 -14 Q -14 -18 -6 -13" stroke="#1f2937" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            {/* Left Eye */}
            {blink ? (
              <line x1="-20" y1="-5" x2="-6" y2="-5" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              <>
                <ellipse cx="-13" cy="-5" rx="7.5" ry="6.5" fill="#ffffff" />
                <circle cx="-12" cy="-5" r="3.6" fill="#1f2937" />
                <circle cx="-13.5" cy="-6.5" r="1.3" fill="#ffffff" />
              </>
            )}

            {/* Right Eyebrow */}
            <path d="M 6 -13 Q 14 -18 22 -14" stroke="#1f2937" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            {/* Right Eye */}
            {blink ? (
              <line x1="6" y1="-5" x2="20" y2="-5" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              <>
                <ellipse cx="13" cy="-5" rx="7.5" ry="6.5" fill="#ffffff" />
                <circle cx="12" cy="-5" r="3.6" fill="#1f2937" />
                <circle cx="10.5" cy="-6.5" r="1.3" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Nose */}
          <path d="M -3 -6 Q 0 8 6 10 Q 0 16 -6 12 Z" fill={skinShadow} opacity="0.85" />

          {/* Mustache for men */}
          {previewCharModel !== 'woman' && (
            <path d="M -22 17 Q -10 13 0 17 Q 10 13 22 17 Q 14 24 0 19 Q -14 24 -22 17 Z" fill="#1f2937" />
          )}

          {/* ================= DYNAMIC PHONEME-SYNCED MOUTH ================= */}
          <g id="phoneme-mouth" transform="translate(0, 24)">
            {mouthOpenAmount > 2 ? (
              <g>
                {/* Inside mouth dark cavity */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx={mouthWidth * 0.55}
                  ry={mouthOpenAmount * 0.6}
                  fill="#581c87"
                  stroke="#374151"
                  strokeWidth="1.5"
                />

                {/* Upper Teeth Bar */}
                {currentViseme.showTeethUpper && (
                  <path
                    d={`M ${-mouthWidth * 0.4} ${-mouthOpenAmount * 0.35} Q 0 ${-mouthOpenAmount * 0.3} ${mouthWidth * 0.4} ${-mouthOpenAmount * 0.35} L ${mouthWidth * 0.35} ${-mouthOpenAmount * 0.1} Q 0 ${-mouthOpenAmount * 0.05} ${-mouthWidth * 0.35} ${-mouthOpenAmount * 0.1} Z`}
                    fill="#ffffff"
                  />
                )}

                {/* Lower Teeth Bar */}
                {currentViseme.showTeethLower && (
                  <path
                    d={`M ${-mouthWidth * 0.35} ${mouthOpenAmount * 0.25} Q 0 ${mouthOpenAmount * 0.2} ${mouthWidth * 0.35} ${mouthOpenAmount * 0.25} L ${mouthWidth * 0.3} ${mouthOpenAmount * 0.45} Q 0 ${mouthOpenAmount * 0.4} ${-mouthWidth * 0.3} ${mouthOpenAmount * 0.45} Z`}
                    fill="#ffffff"
                  />
                )}

                {/* Tongue Tip */}
                {currentViseme.showTongue && (
                  <ellipse
                    cx="0"
                    cy={mouthOpenAmount * 0.15}
                    rx={mouthWidth * 0.3}
                    ry={mouthOpenAmount * 0.28}
                    fill="#f43f5e"
                  />
                )}

                {/* Lips Border */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx={mouthWidth * 0.55}
                  ry={mouthOpenAmount * 0.6}
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="1.8"
                />
              </g>
            ) : (
              /* Closed / Neutral / MBP Lip Line */
              <path
                d={`M ${-mouthWidth * 0.5} ${-mouthCurve * 0.3} Q 0 ${mouthCurve * 0.6} ${mouthWidth * 0.5} ${-mouthCurve * 0.3}`}
                stroke="#1f2937"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>

          {/* Hair / Headwear */}
          {previewCharModel === 'pandit' ? (
            <g id="pandit-pagdi">
              <ellipse cx="0" cy="-36" rx="43" ry="26" fill="#f97316" />
              <path d="M -38 -26 Q -10 -50 38 -30 Q 42 -15 36 -5 Q 10 -25 -34 -12 Z" fill="#ea580c" />
              <circle cx="2" cy="-45" r="7" fill="#fbbf24" />
            </g>
          ) : previewCharModel === 'woman' ? (
            <g id="woman-hair">
              <path d="M -36 -10 Q -38 -45 0 -45 Q 38 -45 36 -10 Q 22 -30 0 -30 Q -22 -30 -36 -10 Z" fill="#111827" />
              <circle cx="0" cy="-14" r="2.5" fill="#ef4444" /> {/* Bindi */}
            </g>
          ) : (
            <path
              d="M -36 -15 Q -40 -48 0 -48 Q 40 -48 36 -15 Q 26 -30 0 -32 Q -26 -30 -36 -15 Z"
              fill="#1f2937"
            />
          )}
        </svg>

        {/* Current Spoken Word Tag */}
        {isPlaying && currentWord && (
          <div className="absolute bottom-2 inset-x-2 text-center">
            <span className="px-2 py-0.5 rounded bg-black/75 border border-blue-500/50 text-[10px] font-mono text-blue-300 font-bold truncate inline-block max-w-full">
              "{currentWord}"
            </span>
          </div>
        )}
      </div>

      {/* PHONEME STATUS BADGE */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#131418] border border-[#2b2f3e]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
            Phoneme:
          </span>
          <span className="text-xs font-mono font-bold text-blue-400">
            [{currentViseme.viseme}]
          </span>
        </div>
        <span className="text-[11px] text-gray-300 font-medium">
          {currentViseme.label}
        </span>
      </div>

      {/* AUDIO WAVEFORM SPECTRUM CANVAS */}
      <div>
        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1 px-1">
          <span className="flex items-center gap-1 font-semibold text-gray-300">
            <Activity size={11} className={isPlaying ? 'text-emerald-400 animate-pulse' : 'text-gray-500'} />
            Waveform Frequency Spectrum
          </span>
          <span className="font-mono text-blue-400 font-bold">
            {isPlaying ? `${Math.round(audioLevel * 100)}% VU` : 'Idle'}
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={320}
          height={40}
          className="w-full h-10 rounded-lg border border-[#2b2f3e]"
        />
      </div>

      {/* PHONEME QUICK MANUAL TESTER (Interactive pills) */}
      <div>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5 px-1">
          Test Mouth Visemes Manually:
        </span>
        <div className="grid grid-cols-4 gap-1">
          {(['REST', 'AA', 'EE', 'OH', 'OO', 'MBP', 'FV', 'LDT'] as VisemeType[]).map((vKey) => (
            <button
              key={vKey}
              onClick={() => onManualVisemeSelect && onManualVisemeSelect(VISEME_MAP[vKey])}
              className={`py-1 rounded text-[10px] font-mono font-bold transition-all border ${
                currentViseme.viseme === vKey
                  ? 'bg-blue-600 text-white border-blue-400 shadow'
                  : 'bg-[#131418] text-gray-400 hover:text-white border-[#2b2f3e]'
              }`}
            >
              {vKey}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
