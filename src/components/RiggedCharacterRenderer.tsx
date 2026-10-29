import React, { useRef, useState } from 'react';
import {
  CharacterConfig,
  CharacterViewAngle,
  Expression,
  CustomExpressionData,
  HandPoseType,
  EyePoseType,
  FingerCurlState,
} from '../types/studio';
import { JointMap, DEFAULT_NEUTRAL_POSE } from '../utils/riggingLogic';
import {
  getHandPoseFingers,
  getEyePoseGeometry,
} from '../utils/characterAssemblyLogic';

interface RiggedCharacterRendererProps {
  config: CharacterConfig;
  showSkeleton?: boolean;
  interactiveRig?: boolean;
  onJointMove?: (jointName: string, newX: number, newY: number) => void;
  width?: number;
  height?: number;
  overridePose?: JointMap;
  overrideExpression?: Expression;
  overrideViewAngle?: CharacterViewAngle;
  customExpression?: CustomExpressionData;
}

export const RiggedCharacterRenderer: React.FC<RiggedCharacterRendererProps> = ({
  config,
  showSkeleton = false,
  interactiveRig = false,
  onJointMove,
  width = 240,
  height = 340,
  overridePose,
  overrideExpression,
  overrideViewAngle,
  customExpression,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeJoint, setActiveJoint] = useState<string | null>(null);

  const viewAngle: CharacterViewAngle = overrideViewAngle || config.viewAngle || 'front';
  const expression: Expression = overrideExpression || config.expression || 'neutral';
  const exprData: CustomExpressionData | undefined = customExpression || config.customExpression;

  // Combine default with character's stored pose or overridePose
  const basePose: JointMap = {
    ...DEFAULT_NEUTRAL_POSE,
    ...(config.pose || {}),
    ...(overridePose || {}),
  };

  const handlePointerDown = (jointName: string, e: React.PointerEvent) => {
    if (!interactiveRig || !onJointMove) return;
    e.stopPropagation();
    setActiveJoint(jointName);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeJoint || !onJointMove || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const viewBoxX = ((e.clientX - rect.left) / rect.width) * 300 - 150;
    const viewBoxY = ((e.clientY - rect.top) / rect.height) * 400 - 200;

    const adjustedX = config.flipX ? -viewBoxX : viewBoxX;
    onJointMove(activeJoint, Math.round(adjustedX), Math.round(viewBoxY));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeJoint) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {}
      setActiveJoint(null);
    }
  };

  const J = (name: string) => basePose[name] || DEFAULT_NEUTRAL_POSE[name] || { x: 0, y: 0, angle: 0 };

  const headJ = J('head');
  const neckJ = J('neck');
  const torsoJ = J('torso');
  const pelvisJ = J('pelvis');

  const lShoulder = J('leftShoulder');
  const lElbow = J('leftElbow');
  const lHand = J('leftHand');

  const rShoulder = J('rightShoulder');
  const rElbow = J('rightElbow');
  const rHand = J('rightHand');

  const lHip = J('leftHip');
  const lKnee = J('leftKnee');
  const lFoot = J('leftFoot');

  const rHip = J('rightHip');
  const rKnee = J('rightKnee');
  const rFoot = J('rightFoot');

  // Colors & Styles
  const skin = config.skinColor || '#d99763';
  const skinShadow = '#a86539';
  const shirt = config.shirtColor || '#10b981';
  const bottom = config.bottomColor || '#e0f2fe';
  const hairColor = config.hairColor || (config.hairStyle === 'elder_white' ? '#f3f4f6' : '#1f2937');
  const eyeColor = config.eyeColor || '#1f2937';
  const eyeStyle = config.eyeStyle || 'almond_indian';
  const noseStyle = config.noseStyle || 'classic_pointed';
  const earStyle = config.earStyle || 'round_normal';
  const eyebrowStyle = config.eyebrowStyle || 'thick_natural';

  // Custom Expression Offset Math
  const ebOffset = exprData?.eyebrowHeight ?? 0;
  const ebTilt = exprData?.eyebrowTilt ?? 0;
  const eyeScaleY = exprData?.eyeScaleY ?? 1.0;
  const mouthCurve = exprData?.mouthCurve ?? (expression === 'happy' || expression === 'smile' ? 8 : expression === 'sad' ? -8 : expression === 'crying' ? -10 : expression === 'smug' ? 4 : 0);
  const mouthOpen = exprData?.mouthOpen ?? (expression === 'talking' ? 12 : expression === 'laughing' ? 14 : expression === 'shocked' ? 16 : 2);
  // Eye Pose Geometry
  const activeEyePose: EyePoseType = config.eyePose || (expression === 'crying' ? 'crying_tears' : expression === 'wink' ? 'wink_right' : 'neutral');
  const eyeGeom = getEyePoseGeometry(activeEyePose, {
    lidOpen: exprData?.eyeScaleY ?? 1.0,
    pupilX: config.modularParts?.eyes?.pupilX,
    pupilY: config.modularParts?.eyes?.pupilY,
    pupilSize: config.modularParts?.eyes?.pupilSize,
  });

  const showTears = exprData?.tears || expression === 'crying' || eyeGeom.showTears;
  const showBlush = exprData?.blush || expression === 'happy' || expression === 'laughing' || activeEyePose === 'happy_squint';
  const showSweat = exprData?.sweatDrop || expression === 'scared' || expression === 'shocked' || activeEyePose === 'wide_shock';

  const renderArticulatedHand = (
    x: number,
    y: number,
    elbowX: number,
    elbowY: number,
    isLeft: boolean,
    pose: HandPoseType = 'open_palm',
    customCurls?: Partial<FingerCurlState>
  ) => {
    const f = getHandPoseFingers(pose, customCurls);
    const angleRad = Math.atan2(y - elbowY, x - elbowX);
    const deg = (angleRad * 180) / Math.PI;

    if (pose === 'namaste') {
      return (
        <g transform={`translate(${x}, ${y}) rotate(${isLeft ? 65 : -65})`}>
          <ellipse cx="0" cy="0" rx="6" ry="11" fill={skin} stroke={skinShadow} strokeWidth="1" />
          <path d="M -3 -10 L 0 -15 L 3 -10 Z" fill={skin} />
          <line x1="0" y1="-12" x2="0" y2="4" stroke={skinShadow} strokeWidth="1" />
        </g>
      );
    }

    return (
      <g transform={`translate(${x}, ${y}) rotate(${deg - 90})`}>
        {/* Lathi Stick / Prop when gripping */}
        {pose === 'grip_lathi' && (
          <line x1="-32" y1="0" x2="32" y2="0" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
        )}
        {/* Palm base */}
        <ellipse cx="0" cy="0" rx="7.5" ry="6" fill={skin} stroke={skinShadow} strokeWidth="1" />

        {/* 5 Articulated Fingers */}
        {/* Thumb */}
        <line
          x1={isLeft ? -4 : 4}
          y1="-1"
          x2={(isLeft ? -4 : 4) + (isLeft ? -4.5 : 4.5) * (1 - f.thumb * 0.007)}
          y2={-1 - (f.thumb > 80 ? 1 : 6) * (1 - f.thumb * 0.005)}
          stroke={skin}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Index */}
        <line
          x1="-4.5"
          y1="-5"
          x2={pose === 'peace' ? -6 : -4.5}
          y2={-5 - (f.index > 80 ? 2 : 9) * (1 - f.index * 0.007)}
          stroke={skin}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* Middle */}
        <line
          x1="-1.5"
          y1="-6"
          x2={pose === 'peace' ? 1.5 : -1.5}
          y2={-6 - (f.middle > 80 ? 2 : 10) * (1 - f.middle * 0.007)}
          stroke={skin}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* Ring */}
        <line
          x1="1.5"
          y1="-6"
          x2="1.5"
          y2={-6 - (f.ring > 80 ? 2 : 8.5) * (1 - f.ring * 0.007)}
          stroke={skin}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        {/* Pinky */}
        <line
          x1="4.5"
          y1="-5"
          x2="4.5"
          y2={-5 - (f.pinky > 80 ? 2 : 7) * (1 - f.pinky * 0.007)}
          stroke={skin}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
    );
  };

  return (
    <div className="relative inline-block select-none" style={{ width, height }}>
      <svg
        ref={svgRef}
        viewBox="-150 -200 300 400"
        className="w-full h-full overflow-visible"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          <filter id={`shadow-${config.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
          </filter>
        </defs>

        <g transform={config.flipX ? 'scale(-1, 1)' : undefined}>
          {/* GROUND SHADOW */}
          <ellipse cx="0" cy="115" rx="50" ry="10" fill="#000000" opacity="0.18" />

          {/* ================= BODY & LIMBS RENDERING ================= */}
          {/* PROFILE ANGLE BODY */}
          {viewAngle === 'profile' ? (
            <g id="body-profile">
              {/* Back Leg */}
              <line x1="-5" y1={lHip.y} x2="-10" y2={lKnee.y} stroke={config.clothesStyle === 'modern_jeans' ? bottom : skin} strokeWidth="15" strokeLinecap="round" />
              <line x1="-10" y1={lKnee.y} x2="-15" y2={lFoot.y} stroke={config.clothesStyle === 'modern_jeans' ? bottom : skin} strokeWidth="13" strokeLinecap="round" />
              <ellipse cx="-15" cy={lFoot.y} rx="12" ry="5" fill="#582f0e" />

              {/* Front Leg */}
              <line x1="5" y1={rHip.y} x2="10" y2={rKnee.y} stroke={config.clothesStyle === 'modern_jeans' ? bottom : skin} strokeWidth="17" strokeLinecap="round" />
              <line x1="10" y1={rKnee.y} x2="12" y2={rFoot.y} stroke={config.clothesStyle === 'modern_jeans' ? bottom : skin} strokeWidth="14" strokeLinecap="round" />
              <ellipse cx="15" cy={rFoot.y} rx="14" ry="6" fill="#582f0e" />

              {/* Lower clothes drape */}
              {config.clothesStyle === 'dhoti_kurta' && (
                <path d="M -15 0 Q 15 20 8 60 L -12 60 Z" fill={bottom} stroke="#d1d5db" strokeWidth="1.5" />
              )}
              {config.clothesStyle === 'lungi_shirt' && (
                <path d="M -15 -5 L 18 -5 L 14 65 L -16 65 Z" fill={bottom} stroke="#93c5fd" strokeWidth="1.5" />
              )}
              {config.clothesStyle === 'saree' && (
                <path d="M -18 -5 L 18 -5 L 16 95 L -16 95 Z" fill={bottom} stroke="#f472b6" strokeWidth="2" />
              )}

              {/* Torso Profile */}
              <path
                d="M -16 -55 Q 0 -58 14 -55 L 18 10 Q 0 16 -18 10 Z"
                fill={shirt}
                filter={`url(#shadow-${config.id})`}
              />

              {/* Profile Front Arm */}
              <line x1="2" y1="-50" x2="18" y2="-20" stroke={config.clothesStyle === 'farmer_vest' ? skin : shirt} strokeWidth="15" strokeLinecap="round" />
              <line x1="18" y1="-20" x2="24" y2="10" stroke={skin} strokeWidth="12" strokeLinecap="round" />
              <circle cx="24" cy="10" r="7.5" fill={skin} />
            </g>
          ) : (
            /* FRONT / 3/4 FRONT / 3/4 BACK / BACK BODY */
            <g id="body-standard">
              {/* LEFT LEG */}
              <g id="left-leg">
                <line x1={lHip.x} y1={lHip.y} x2={lKnee.x} y2={lKnee.y} stroke={config.clothesStyle === 'lungi_shirt' ? bottom : skin} strokeWidth={config.clothesStyle === 'dhoti_kurta' ? 22 : 18} strokeLinecap="round" />
                <line x1={lKnee.x} y1={lKnee.y} x2={lFoot.x} y2={lFoot.y} stroke={config.clothesStyle === 'modern_jeans' ? bottom : skin} strokeWidth={14} strokeLinecap="round" />
                <ellipse cx={lFoot.x - 3} cy={lFoot.y} rx="12" ry="5" fill="#582f0e" />
              </g>

              {/* RIGHT LEG */}
              <g id="right-leg">
                <line x1={rHip.x} y1={rHip.y} x2={rKnee.x} y2={rKnee.y} stroke={config.clothesStyle === 'lungi_shirt' ? bottom : skin} strokeWidth={config.clothesStyle === 'dhoti_kurta' ? 22 : 18} strokeLinecap="round" />
                <line x1={rKnee.x} y1={rKnee.y} x2={rFoot.x} y2={rFoot.y} stroke={config.clothesStyle === 'modern_jeans' ? bottom : skin} strokeWidth={14} strokeLinecap="round" />
                <ellipse cx={rFoot.x + 3} cy={rFoot.y} rx="12" ry="5" fill="#582f0e" />
              </g>

              {/* LOWER CLOTHES */}
              <g id="lower-clothes">
                {config.clothesStyle === 'dhoti_kurta' && (
                  <path d={`M ${lHip.x - 12} ${lHip.y} Q 0 ${pelvisJ.y + 25} ${rHip.x + 12} ${rHip.y} L ${rKnee.x + 8} ${rKnee.y} Q 0 ${pelvisJ.y + 45} ${lKnee.x - 8} ${lKnee.y} Z`} fill={bottom} stroke="#d1d5db" strokeWidth="1.5" />
                )}
                {config.clothesStyle === 'lungi_shirt' && (
                  <path d={`M ${lHip.x - 14} ${lHip.y - 5} L ${rHip.x + 14} ${rHip.y - 5} L ${rKnee.x + 10} ${rKnee.y + 20} L ${lKnee.x - 10} ${lKnee.y + 20} Z`} fill={bottom} stroke="#93c5fd" strokeWidth="1.5" />
                )}
                {config.clothesStyle === 'saree' && (
                  <path d={`M ${lHip.x - 16} ${lHip.y} L ${rHip.x + 16} ${rHip.y} L ${rFoot.x + 8} ${rFoot.y - 2} L ${lFoot.x - 8} ${lFoot.y - 2} Z`} fill={bottom} stroke="#f472b6" strokeWidth="2" />
                )}
              </g>

              {/* LEFT ARM */}
              <g id="left-arm">
                <line x1={lShoulder.x} y1={lShoulder.y} x2={lElbow.x} y2={lElbow.y} stroke={config.clothesStyle === 'farmer_vest' ? skin : shirt} strokeWidth="15" strokeLinecap="round" />
                <line x1={lElbow.x} y1={lElbow.y} x2={lHand.x} y2={lHand.y} stroke={skin} strokeWidth="12" strokeLinecap="round" />
                {renderArticulatedHand(lHand.x, lHand.y, lElbow.x, lElbow.y, true, config.leftHandPose || 'open_palm', config.fingerCurls?.left)}
              </g>

              {/* TORSO */}
              <g id="torso">
                <path
                  d={`M ${lShoulder.x} ${lShoulder.y} Q ${torsoJ.x} ${torsoJ.y - 20} ${rShoulder.x} ${rShoulder.y} L ${rHip.x + 10} ${rHip.y + 10} Q ${pelvisJ.x} ${pelvisJ.y + 15} ${lHip.x - 10} ${lHip.y + 10} Z`}
                  fill={shirt}
                  filter={`url(#shadow-${config.id})`}
                />

                {/* Saree Pallu Drape across chest */}
                {config.clothesStyle === 'saree' && (
                  <path
                    d={`M ${rHip.x} ${rHip.y} Q ${torsoJ.x} ${torsoJ.y} ${lShoulder.x} ${lShoulder.y - 6} L ${lShoulder.x - 14} ${lShoulder.y + 10} Q ${torsoJ.x - 5} ${torsoJ.y + 22} ${rHip.x - 10} ${rHip.y + 12} Z`}
                    fill="#f472b6"
                    stroke="#db2777"
                    strokeWidth="1.5"
                  />
                )}

                {/* Denim Jacket Lapels & Buttons */}
                {config.clothesStyle === 'jacket_denim' && (
                  <g>
                    <path d={`M ${lShoulder.x + 5} ${lShoulder.y + 10} L ${torsoJ.x - 8} ${torsoJ.y} L ${lHip.x + 5} ${lHip.y}`} stroke="#1e3a8a" strokeWidth="2" fill="none" />
                    <path d={`M ${rShoulder.x - 5} ${rShoulder.y + 10} L ${torsoJ.x + 8} ${torsoJ.y} L ${rHip.x - 5} ${rHip.y}`} stroke="#1e3a8a" strokeWidth="2" fill="none" />
                    <rect x={torsoJ.x - 18} y={torsoJ.y - 15} width="12" height="7" rx="1.5" fill="#1e40af" stroke="#93c5fd" strokeWidth="1" />
                    <rect x={torsoJ.x + 6} y={torsoJ.y - 15} width="12" height="7" rx="1.5" fill="#1e40af" stroke="#93c5fd" strokeWidth="1" />
                  </g>
                )}

                {/* Royal Kurta Gold Zari Border */}
                {config.clothesStyle === 'royal_kurta' && (
                  <path
                    d={`M ${neckJ.x} ${neckJ.y + 10} L ${neckJ.x} ${pelvisJ.y + 15}`}
                    stroke="#fbbf24"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                )}

                {/* Gamchha / Angavastram drape over right shoulder */}
                {(config.clothesStyle === 'angavastram' || config.clothingConfig?.accessory === 'gamchha') && (
                  <path
                    d={`M ${rShoulder.x - 4} ${rShoulder.y - 6} Q ${torsoJ.x} ${torsoJ.y + 15} ${lHip.x - 6} ${lHip.y + 25} L ${lHip.x + 6} ${lHip.y + 25} Q ${torsoJ.x + 8} ${torsoJ.y + 10} ${rShoulder.x + 10} ${rShoulder.y - 4} Z`}
                    fill="#ea580c"
                    stroke="#c2410c"
                    strokeWidth="1.2"
                  />
                )}

                {/* Back seams if viewing from rear */}
                {(viewAngle === 'back' || viewAngle === 'three_quarter_back') ? (
                  <path d={`M ${neckJ.x} ${neckJ.y + 15} L ${pelvisJ.x} ${pelvisJ.y + 10}`} stroke="#1f2937" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />
                ) : (
                  /* Front buttons & collar */
                  <>
                    <path d={`M ${neckJ.x - 8} ${neckJ.y + 10} Q ${neckJ.x} ${neckJ.y + 26} ${neckJ.x + 8} ${neckJ.y + 10}`} fill="none" stroke={skinShadow} strokeWidth="3" />
                    <circle cx={torsoJ.x} cy={torsoJ.y - 10} r="2" fill="#374151" />
                    <circle cx={torsoJ.x} cy={torsoJ.y + 5} r="2" fill="#374151" />
                    <circle cx={torsoJ.x} cy={torsoJ.y + 20} r="2" fill="#374151" />
                  </>
                )}
              </g>

              {/* RIGHT ARM */}
              <g id="right-arm">
                <line x1={rShoulder.x} y1={rShoulder.y} x2={rElbow.x} y2={rElbow.y} stroke={config.clothesStyle === 'farmer_vest' ? skin : shirt} strokeWidth="15" strokeLinecap="round" />
                <line x1={rElbow.x} y1={rElbow.y} x2={rHand.x} y2={rHand.y} stroke={skin} strokeWidth="12" strokeLinecap="round" />
                {renderArticulatedHand(rHand.x, rHand.y, rElbow.x, rElbow.y, false, config.rightHandPose || 'open_palm', config.fingerCurls?.right)}
              </g>
            </g>
          )}

          {/* NECK */}
          <line x1={neckJ.x} y1={neckJ.y} x2={headJ.x} y2={headJ.y + 15} stroke={skinShadow} strokeWidth="16" strokeLinecap="round" />

          {/* ================= HEAD & FACE MULTI-ANGLE RENDERING ================= */}
          <g id="head-group" transform={`translate(${headJ.x}, ${headJ.y}) rotate(${headJ.angle})`}>
            {/* 1. BACK VIEW (180° REAR) */}
            {viewAngle === 'back' && (
              <g id="face-back">
                {/* Back of skull */}
                <ellipse cx="0" cy="0" rx="34" ry="40" fill={skin} filter={`url(#shadow-${config.id})`} />
                {/* Back of ears */}
                <path d="M -34 -6 Q -42 2 -34 10 Z" fill={skinShadow} />
                <path d="M 34 -6 Q 42 2 34 10 Z" fill={skinShadow} />

                {/* Back Hair Styles */}
                {config.hairStyle === 'classic_fade' && (
                  <path d="M -34 -15 Q -38 -45 0 -45 Q 38 -45 34 -15 L 30 18 Q 0 25 -30 18 Z" fill={hairColor} />
                )}
                {config.hairStyle === 'village_turban' && (
                  <g>
                    <ellipse cx="0" cy="-30" rx="43" ry="26" fill="#f97316" />
                    <path d="M -20 -35 Q 0 -50 20 -35 Q 30 -10 0 5 Q -30 -10 -20 -35 Z" fill="#ea580c" />
                    {/* Turban back tail drape (turra/shamla) */}
                    <path d="M -8 -15 Q -14 30 -4 45 Q 4 30 2 -15 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />
                  </g>
                )}
                {config.hairStyle === 'priest_topknot' && (
                  <g>
                    <path d="M -30 -15 Q -25 -40 0 -40 Q 25 -40 30 -15 L 20 15 Q 0 20 -20 15 Z" fill={hairColor} />
                    <circle cx="0" cy="-35" r="11" fill={hairColor} />
                    <path d="M -3 -30 Q 8 -10 12 10" stroke={hairColor} strokeWidth="4" strokeLinecap="round" fill="none" />
                  </g>
                )}
                {config.hairStyle === 'women_braid' && (
                  <g>
                    <path d="M -34 -10 Q -35 -45 0 -45 Q 35 -45 34 -10 L 25 15 Q 0 22 -25 15 Z" fill={hairColor} />
                    {/* Full long back braid */}
                    <path d="M 0 10 Q 5 45 -2 85 Q 4 125 0 145" stroke={hairColor} strokeWidth="13" strokeLinecap="round" fill="none" />
                    <circle cx="0" cy="145" r="6" fill="#ec4899" />
                  </g>
                )}
              </g>
            )}

            {/* 2. THREE-QUARTER BACK VIEW */}
            {viewAngle === 'three_quarter_back' && (
              <g id="face-three-quarter-back">
                {/* Asymmetric 3/4 back skull */}
                <ellipse cx="5" cy="0" rx="33" ry="39" fill={skin} filter={`url(#shadow-${config.id})`} />
                {/* One ear edge visible */}
                <path d="M -28 -4 Q -35 3 -28 10 Z" fill={skinShadow} />

                {/* Hair in 3/4 back */}
                {config.hairStyle === 'classic_fade' && (
                  <path d="M -30 -15 Q -35 -45 5 -45 Q 38 -45 36 -10 L 32 18 Q 5 26 -24 16 Z" fill={hairColor} />
                )}
                {config.hairStyle === 'village_turban' && (
                  <g>
                    <ellipse cx="6" cy="-28" rx="42" ry="26" fill="#f97316" />
                    <path d="M -15 -35 Q 10 -50 25 -30 Q 35 -5 10 5 Q -20 -10 -15 -35 Z" fill="#ea580c" />
                    <path d="M -2 -15 Q -6 25 2 40 Q 8 25 6 -15 Z" fill="#ea580c" />
                  </g>
                )}
                {config.hairStyle === 'women_braid' && (
                  <g>
                    <path d="M -30 -10 Q -30 -45 5 -45 Q 36 -45 34 -10 L 26 15 Q 5 22 -20 15 Z" fill={hairColor} />
                    <path d="M 8 10 Q 14 45 4 85 Q 10 120 8 140" stroke={hairColor} strokeWidth="12" strokeLinecap="round" fill="none" />
                    <circle cx="8" cy="140" r="5" fill="#ec4899" />
                  </g>
                )}
              </g>
            )}

            {/* 3. PROFILE VIEW (90° SIDE VIEW) */}
            {viewAngle === 'profile' && (
              <g id="face-profile">
                {/* Distinct Profile Silhouette (Forehead -> Nose Bridge -> Lips -> Chin -> Jaw) */}
                <path
                  d="M -10 -40 Q 15 -42 22 -20 L 26 -12 L 38 4 L 28 8 L 30 15 L 25 18 L 27 26 Q 22 36 10 38 L -15 32 Q -28 20 -25 -10 Z"
                  fill={skin}
                  filter={`url(#shadow-${config.id})`}
                />

                {/* Single Profile Ear */}
                <g id="profile-ear">
                  <ellipse cx="-8" cy="4" rx={earStyle === 'large_elder' ? 8 : 6} ry={earStyle === 'large_elder' ? 14 : 11} fill={skin} stroke={skinShadow} strokeWidth="1.5" />
                  {earStyle === 'earring_gold' && (
                    <circle cx="-8" cy="14" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                  )}
                </g>

                {/* Profile Eye (Angled triangle) */}
                <g id="profile-eye">
                  <path d="M 16 -8 L 26 -5 L 18 -1 Z" fill="#ffffff" />
                  <circle cx="21" cy="-4" r="2.5" fill={eyeColor} />
                  {/* Eyebrow Profile */}
                  <path
                    d={`M 14 ${-14 + ebOffset} Q 20 ${-18 + ebOffset + ebTilt} 26 ${-12 + ebOffset + ebTilt}`}
                    stroke="#1f2937"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>

                {/* Profile Nose & Piercing */}
                {noseStyle === 'nath_pierced' && (
                  <g>
                    <circle cx="34" cy="5" r="5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
                    <circle cx="37" cy="7" r="1.5" fill="#ef4444" />
                  </g>
                )}

                {/* Profile Mustache */}
                {config.facialHair === 'thick_mustache' && (
                  <path d="M 22 10 Q 34 10 30 18 Q 24 16 22 13 Z" fill="#1f2937" />
                )}
                {config.facialHair === 'rajput_curled' && (
                  <path d="M 20 8 Q 36 8 35 15 Q 38 10 36 6 Q 26 12 20 8 Z" fill="#111827" />
                )}
                {config.facialHair === 'elder_white_beard' && (
                  <path d="M 12 12 Q 32 15 28 36 Q 16 45 8 36 Z" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
                )}

                {/* Profile Hair / Turban */}
                {config.hairStyle === 'classic_fade' && (
                  <path d="M -22 -15 Q -25 -45 10 -45 Q 24 -42 22 -20 L 14 -22 Q -5 -35 -18 -15 Z" fill={hairColor} />
                )}
                {config.hairStyle === 'village_turban' && (
                  <g>
                    <path d="M -24 -20 Q -5 -50 24 -35 Q 32 -15 20 -5 Q 0 -25 -20 -10 Z" fill="#ea580c" />
                    <circle cx="10" cy="-40" r="7" fill="#fbbf24" />
                  </g>
                )}
              </g>
            )}

            {/* 4. THREE-QUARTER FRONT VIEW (Dynamic 35° perspective) */}
            {viewAngle === 'three_quarter_front' && (
              <g id="face-three-quarter-front">
                {/* 3/4 Head Oval offset */}
                <ellipse cx="6" cy="0" rx="33" ry="39" fill={skin} filter={`url(#shadow-${config.id})`} />

                {/* Far Ear tucked, Near Ear clear */}
                <g id="three-quarter-ears">
                  <ellipse cx="-26" cy="2" rx="5" ry="9" fill={skin} stroke={skinShadow} strokeWidth="1.2" />
                  {earStyle === 'earring_gold' && (
                    <circle cx="-26" cy="10" r="2.5" fill="#fbbf24" />
                  )}
                </g>

                {/* 3/4 Eyes (Foreshortened) */}
                <g id="three-quarter-eyes">
                  {/* Far Eye (narrower) */}
                  <ellipse cx="-8" cy="-4" rx="5" ry={5 * eyeScaleY} fill="#ffffff" />
                  <circle cx="-8" cy="-4" r="2.6" fill={eyeColor} />
                  <path
                    d={`M -14 ${-12 + ebOffset} Q -8 ${-15 + ebOffset + ebTilt} -3 ${-11 + ebOffset + ebTilt}`}
                    stroke="#1f2937"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Near Eye (larger, full) */}
                  {expression === 'wink' ? (
                    <path d="M 12 -4 Q 18 -1 24 -4" stroke="#1f2937" strokeWidth="2.2" fill="none" />
                  ) : (
                    <>
                      <ellipse cx="18" cy="-4" rx="7.5" ry={6.5 * eyeScaleY} fill="#ffffff" />
                      <circle cx="17.5" cy="-4" r="3.6" fill={eyeColor} />
                      <circle cx="16" cy="-5.5" r="1.3" fill="#ffffff" />
                      <path
                        d={`M 11 ${-13 + ebOffset} Q 18 ${-17 + ebOffset + ebTilt} 25 ${-12 + ebOffset + ebTilt}`}
                        stroke="#1f2937"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </>
                  )}
                </g>

                {/* 3/4 Nose */}
                <path d="M 3 -6 Q 10 6 15 8 Q 8 13 4 10 Z" fill={skinShadow} opacity="0.85" />
                {noseStyle === 'nath_pierced' && (
                  <circle cx="15" cy="8" r="4.5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
                )}

                {/* 3/4 Mouth with expression */}
                <g id="three-quarter-mouth">
                  {mouthOpen > 4 ? (
                    <ellipse cx="8" cy="22" rx="6" ry={mouthOpen * 0.5} fill="#641220" stroke="#374151" strokeWidth="1.5" />
                  ) : (
                    <path
                      d={`M 1 ${20 - mouthCurve * 0.4} Q 8 ${20 + mouthCurve * 0.6} 17 ${20 - mouthCurve * 0.4}`}
                      stroke="#374151"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </g>

                {/* 3/4 Mustache */}
                {config.facialHair === 'thick_mustache' && (
                  <path d="M -12 17 Q 6 13 22 16 Q 14 23 4 18 Q -4 23 -12 17 Z" fill="#1f2937" />
                )}

                {/* 3/4 Hair/Turban */}
                {config.hairStyle === 'classic_fade' && (
                  <path d="M -26 -15 Q -30 -45 8 -45 Q 40 -45 36 -12 Q 22 -28 4 -28 Q -18 -26 -26 -15 Z" fill={hairColor} />
                )}
                {config.hairStyle === 'village_turban' && (
                  <g>
                    <ellipse cx="6" cy="-33" rx="42" ry="25" fill="#f97316" />
                    <path d="M -32 -25 Q -4 -48 40 -28 Q 42 -12 36 -3 Q 6 -24 -26 -10 Z" fill="#ea580c" />
                    <circle cx="8" cy="-44" r="7" fill="#fbbf24" />
                  </g>
                )}
              </g>
            )}

            {/* 5. FULL FRONT VIEW (DEFAULT) */}
            {viewAngle === 'front' && (
              <g id="face-front">
                {/* Face base oval */}
                <ellipse cx="0" cy="0" rx="34" ry="40" fill={skin} filter={`url(#shadow-${config.id})`} />

                {/* Ears with selected style */}
                <g id="ears">
                  {/* Left Ear */}
                  <ellipse
                    cx="-34"
                    cy="2"
                    rx={earStyle === 'large_elder' ? 9 : earStyle === 'small_tucked' ? 5 : 7}
                    ry={earStyle === 'large_elder' ? 15 : earStyle === 'small_tucked' ? 9 : 12}
                    fill={skin}
                    stroke={skinShadow}
                    strokeWidth="1.5"
                  />
                  {earStyle === 'earring_gold' && (
                    <circle cx="-34" cy="12" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                  )}

                  {/* Right Ear */}
                  <ellipse
                    cx="34"
                    cy="2"
                    rx={earStyle === 'large_elder' ? 9 : earStyle === 'small_tucked' ? 5 : 7}
                    ry={earStyle === 'large_elder' ? 15 : earStyle === 'small_tucked' ? 9 : 12}
                    fill={skin}
                    stroke={skinShadow}
                    strokeWidth="1.5"
                  />
                  {earStyle === 'earring_gold' && (
                    <circle cx="34" cy="12" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                  )}
                </g>

                {/* Nose with selected style */}
                <g id="nose">
                  {noseStyle === 'button_round' ? (
                    <circle cx="0" cy="8" r="4.5" fill={skinShadow} opacity="0.85" />
                  ) : noseStyle === 'broad_village' ? (
                    <path d="M -7 4 Q 0 11 7 4 Q 4 15 -4 15 Z" fill={skinShadow} opacity="0.85" />
                  ) : noseStyle === 'sharp_aquiline' ? (
                    <path d="M -3 -8 L 0 10 L 6 9 Q 0 16 -5 12 Z" fill={skinShadow} opacity="0.85" />
                  ) : (
                    /* Classic pointed */
                    <path d="M -3 -6 Q 0 8 6 10 Q 0 16 -6 12 Q -8 7 -3 -6" fill={skinShadow} opacity="0.85" />
                  )}

                  {/* Traditional Nath Nose Ring */}
                  {noseStyle === 'nath_pierced' && (
                    <g>
                      <path d="M -3 -6 Q 0 8 6 10 Q 0 16 -6 12 Z" fill={skinShadow} opacity="0.85" />
                      <circle cx="8" cy="11" r="5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
                      <circle cx="11" cy="13" r="1.5" fill="#ef4444" />
                    </g>
                  )}
                </g>

                {/* Eyes with selected style and expressions */}
                <g id="eyes">
                  {/* Left Eyebrow */}
                  <path
                    d={
                      expression === 'angry' || activeEyePose === 'angry_glare'
                        ? `M -20 ${-7 + ebOffset} L -6 ${-15 + ebOffset + ebTilt + eyeGeom.eyebrowTiltAdjust}`
                        : expression === 'sad' || activeEyePose === 'crying_tears'
                        ? `M -20 ${-15 + ebOffset} L -6 ${-8 + ebOffset + ebTilt + eyeGeom.eyebrowTiltAdjust}`
                        : `M -20 ${-13 + ebOffset} Q -13 ${-16 + ebOffset + ebTilt + eyeGeom.eyebrowTiltAdjust} -6 ${-12 + ebOffset + ebTilt + eyeGeom.eyebrowTiltAdjust}`
                    }
                    stroke="#1f2937"
                    strokeWidth={eyebrowStyle === 'bushy_elder' ? '4.2' : eyebrowStyle === 'thin_groomed' ? '1.8' : '2.8'}
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Left Eye */}
                  {eyeGeom.isBlink || eyeGeom.isWinkLeft || eyeStyle === 'closed_peaceful' ? (
                    <path d="M -19 -4 Q -13 1 -7 -4" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  ) : activeEyePose === 'happy_squint' ? (
                    <path d="M -19 -3 Q -13 -9 -7 -3" stroke="#1f2937" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  ) : (
                    <>
                      <ellipse
                        cx="-13"
                        cy="-4"
                        rx={eyeStyle === 'wide_cartoon' ? 8.5 : 7.2}
                        ry={Math.max(1, (eyeStyle === 'wide_cartoon' ? 7.2 : 6.0) * eyeGeom.lidOpen)}
                        fill="#ffffff"
                        stroke="#e5e7eb"
                        strokeWidth="0.8"
                      />
                      {/* Left Pupil with dynamic offset */}
                      <circle
                        cx={-13 + eyeGeom.pupilOffsetX}
                        cy={-4 + eyeGeom.pupilOffsetY}
                        r={Math.max(1.5, (eyeStyle === 'wide_cartoon' ? 4 : 3.4) * eyeGeom.pupilRadiusScale)}
                        fill={eyeColor}
                      />
                      {/* Pupil catchlight shine */}
                      <circle
                        cx={-14.5 + eyeGeom.pupilOffsetX * 0.5}
                        cy={-5.5 + eyeGeom.pupilOffsetY * 0.5}
                        r="1.4"
                        fill="#ffffff"
                      />
                      {activeEyePose === 'crying_tears' && (
                        <circle cx={-11} cy={-2} r="1.6" fill="#38bdf8" opacity="0.9" />
                      )}
                    </>
                  )}

                  {/* Right Eyebrow */}
                  <path
                    d={
                      expression === 'angry' || activeEyePose === 'angry_glare'
                        ? `M 6 ${-15 + ebOffset + ebTilt + eyeGeom.eyebrowTiltAdjust} L 20 ${-7 + ebOffset}`
                        : expression === 'sad' || activeEyePose === 'crying_tears'
                        ? `M 6 ${-8 + ebOffset + ebTilt + eyeGeom.eyebrowTiltAdjust} L 20 ${-15 + ebOffset}`
                        : `M 6 ${-12 + ebOffset + ebTilt + eyeGeom.eyebrowTiltAdjust} Q 13 ${-16 + ebOffset + ebTilt + eyeGeom.eyebrowTiltAdjust} 20 ${-13 + ebOffset}`
                    }
                    stroke="#1f2937"
                    strokeWidth={eyebrowStyle === 'bushy_elder' ? '4.2' : eyebrowStyle === 'thin_groomed' ? '1.8' : '2.8'}
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Right Eye */}
                  {eyeGeom.isBlink || eyeGeom.isWinkRight || expression === 'wink' || eyeStyle === 'closed_peaceful' ? (
                    <path d="M 7 -4 Q 13 1 19 -4" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  ) : activeEyePose === 'happy_squint' ? (
                    <path d="M 7 -3 Q 13 -9 19 -3" stroke="#1f2937" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  ) : (
                    <>
                      <ellipse
                        cx="13"
                        cy="-4"
                        rx={eyeStyle === 'wide_cartoon' ? 8.5 : 7.2}
                        ry={Math.max(1, (eyeStyle === 'wide_cartoon' ? 7.2 : 6.0) * eyeGeom.lidOpen)}
                        fill="#ffffff"
                        stroke="#e5e7eb"
                        strokeWidth="0.8"
                      />
                      {/* Right Pupil with dynamic offset */}
                      <circle
                        cx={13 + eyeGeom.pupilOffsetX}
                        cy={-4 + eyeGeom.pupilOffsetY}
                        r={Math.max(1.5, (eyeStyle === 'wide_cartoon' ? 4 : 3.4) * eyeGeom.pupilRadiusScale)}
                        fill={eyeColor}
                      />
                      {/* Pupil catchlight shine */}
                      <circle
                        cx={11.5 + eyeGeom.pupilOffsetX * 0.5}
                        cy={-5.5 + eyeGeom.pupilOffsetY * 0.5}
                        r="1.4"
                        fill="#ffffff"
                      />
                      {activeEyePose === 'crying_tears' && (
                        <circle cx={15} cy={-2} r="1.6" fill="#38bdf8" opacity="0.9" />
                      )}
                    </>
                  )}
                </g>

                {/* Emotional Overlays: Blush, Tears, Sweat */}
                {showBlush && (
                  <g id="blush">
                    <circle cx="-18" cy="8" r="6" fill="#f43f5e" opacity="0.35" />
                    <circle cx="18" cy="8" r="6" fill="#f43f5e" opacity="0.35" />
                  </g>
                )}

                {showTears && (
                  <g id="tears">
                    <path d="M -13 2 Q -15 14 -12 18 Q -10 14 -13 2 Z" fill="#38bdf8" />
                    <path d="M 13 2 Q 15 14 12 18 Q 10 14 13 2 Z" fill="#38bdf8" />
                  </g>
                )}

                {showSweat && (
                  <path d="M 24 -18 Q 28 -12 25 -8 Q 22 -12 24 -18 Z" fill="#38bdf8" opacity="0.8" />
                )}

                {/* Mouth with Expression / Custom Curve */}
                <g id="mouth">
                  {mouthOpen > 4 ? (
                    <ellipse cx="0" cy="22" rx="7.5" ry={mouthOpen * 0.55} fill="#881337" stroke="#374151" strokeWidth="1.5">
                      <path d="M -4 20 Q 0 22 4 20" stroke="#fecdd3" strokeWidth="1.5" />
                    </ellipse>
                  ) : (
                    <path
                      d={`M -9 ${20 - mouthCurve * 0.4} Q 0 ${20 + mouthCurve * 0.7} 9 ${20 - mouthCurve * 0.4}`}
                      stroke="#374151"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </g>

                {/* Mustache & Beard */}
                {config.facialHair === 'thick_mustache' && (
                  <path d="M -22 17 Q -10 13 0 17 Q 10 13 22 17 Q 14 24 0 19 Q -14 24 -22 17 Z" fill="#1f2937" />
                )}
                {config.facialHair === 'rajput_curled' && (
                  <path d="M -26 13 Q -12 13 0 17 Q 12 13 26 13 Q 28 9 25 7 Q 18 12 0 18 Q -18 12 -25 7 Q -28 9 -26 13 Z" fill="#111827" />
                )}
                {config.facialHair === 'elder_white_beard' && (
                  <g>
                    <path d="M -18 17 Q 0 15 18 17 Q 12 21 0 19 Q -12 21 -18 17 Z" fill="#e5e7eb" />
                    <path d="M -26 12 Q -30 35 0 44 Q 30 35 26 12 Q 18 30 0 34 Q -18 30 -26 12 Z" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
                  </g>
                )}

                {/* Hair / Headwear */}
                {config.hairStyle === 'classic_fade' && (
                  <path d="M -34 -15 Q -38 -45 0 -45 Q 38 -45 34 -15 Q 26 -28 0 -30 Q -26 -28 -34 -15 Z" fill={hairColor} />
                )}
                {config.hairStyle === 'village_turban' && (
                  <g id="turban">
                    <ellipse cx="0" cy="-35" rx="42" ry="25" fill="#f97316" />
                    <path d="M -40 -25 Q -10 -48 38 -30 Q 42 -15 36 -5 Q 10 -25 -34 -12 Z" fill="#ea580c" />
                    <circle cx="2" cy="-45" r="7" fill="#fbbf24" />
                    <path d="M -25 -42 Q -32 -60 -20 -55 Q -15 -42 -22 -35 Z" fill="#ea580c" />
                  </g>
                )}
                {config.hairStyle === 'priest_topknot' && (
                  <g id="topknot">
                    <path d="M -30 -15 Q -25 -35 0 -35 Q 25 -35 30 -15 Z" fill={hairColor} />
                    <circle cx="0" cy="-40" r="10" fill={hairColor} />
                    <line x1="0" y1="-12" x2="0" y2="-2" stroke="#dc2626" strokeWidth="2.5" />
                    <circle cx="0" cy="-1" r="1.5" fill="#fbbf24" />
                  </g>
                )}
                {config.hairStyle === 'women_braid' && (
                  <g id="braid">
                    <path d="M -34 -10 Q -35 -40 0 -40 Q 35 -40 34 -10 Q 20 -28 0 -28 Q -20 -28 -34 -10 Z" fill={hairColor} />
                    <path d="M 28 0 Q 38 40 32 80" stroke={hairColor} strokeWidth="10" strokeLinecap="round" fill="none" />
                    <circle cx="32" cy="80" r="5" fill="#ec4899" />
                  </g>
                )}
              </g>
            )}
          </g>

          {/* SKELETON BONES OVERLAY */}
          {showSkeleton && (
            <g id="skeleton-overlay" className="pointer-events-none">
              <g stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.85">
                <line x1={headJ.x} y1={headJ.y} x2={neckJ.x} y2={neckJ.y} />
                <line x1={neckJ.x} y1={neckJ.y} x2={torsoJ.x} y2={torsoJ.y} />
                <line x1={torsoJ.x} y1={torsoJ.y} x2={pelvisJ.x} y2={pelvisJ.y} />
                <line x1={neckJ.x} y1={neckJ.y} x2={lShoulder.x} y2={lShoulder.y} />
                <line x1={lShoulder.x} y1={lShoulder.y} x2={lElbow.x} y2={lElbow.y} />
                <line x1={lElbow.x} y1={lElbow.y} x2={lHand.x} y2={lHand.y} />
                <line x1={neckJ.x} y1={neckJ.y} x2={rShoulder.x} y2={rShoulder.y} />
                <line x1={rShoulder.x} y1={rShoulder.y} x2={rElbow.x} y2={rElbow.y} />
                <line x1={rElbow.x} y1={rElbow.y} x2={rHand.x} y2={rHand.y} />
                <line x1={pelvisJ.x} y1={pelvisJ.y} x2={lHip.x} y2={lHip.y} />
                <line x1={lHip.x} y1={lHip.y} x2={lKnee.x} y2={lKnee.y} />
                <line x1={lKnee.x} y1={lKnee.y} x2={lFoot.x} y2={lFoot.y} />
                <line x1={pelvisJ.x} y1={pelvisJ.y} x2={rHip.x} y2={rHip.y} />
                <line x1={rHip.x} y1={rHip.y} x2={rKnee.x} y2={rKnee.y} />
                <line x1={rKnee.x} y1={rKnee.y} x2={rFoot.x} y2={rFoot.y} />
              </g>

              {Object.entries(basePose).map(([name, joint]) => {
                const isSelected = activeJoint === name;
                return (
                  <g
                    key={name}
                    transform={`translate(${joint.x}, ${joint.y})`}
                    className={interactiveRig ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none'}
                    onPointerDown={(e) => handlePointerDown(name, e)}
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? 8 : 6}
                      fill={isSelected ? '#38bdf8' : '#ffffff'}
                      stroke={isSelected ? '#ffffff' : '#0284c7'}
                      strokeWidth="2.5"
                    />
                  </g>
                );
              })}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
