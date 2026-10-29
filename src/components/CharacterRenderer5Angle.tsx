import React from 'react';
import {
  CharacterConfig,
  CharacterViewAngle,
  BodyPartCategory,
  VisemeShape,
  EyeExpression,
} from '../types/studio';
import {
  getPartDefinition,
  getDefaultPartsMap,
  renderEyeSpecial,
  renderVisemeShape,
  DEFAULT_Z_INDICES,
} from '../utils/partLibrary';

interface CharacterRenderer5AngleProps {
  config: CharacterConfig;
  overrideAngle?: CharacterViewAngle;
  overrideExpression?: EyeExpression;
  overrideViseme?: VisemeShape;
  overridePupilLook?: { x: number; y: number };
  overrideLimbAngles?: Record<string, number>;
  width?: number | string;
  height?: number | string;
  showSkeleton?: boolean;
  interactive?: boolean;
}

export const CharacterRenderer5Angle: React.FC<CharacterRenderer5AngleProps> = ({
  config,
  overrideAngle,
  overrideExpression,
  overrideViseme,
  overridePupilLook,
  overrideLimbAngles,
  width = 240,
  height = 360,
  showSkeleton = false,
}) => {
  const angle: CharacterViewAngle = overrideAngle || config.viewAngle || 'front';
  const expression: EyeExpression =
    overrideExpression || config.eyeExpression || (config.expression as any) || 'neutral';
  const viseme: VisemeShape = overrideViseme || config.viseme || 'closed';
  const pupilLook = overridePupilLook || config.pupilLook || { x: 0, y: 0 };
  const limbAngles = overrideLimbAngles || config.bodyPartAngles || {};

  const headTilt = limbAngles.headTilt || 0;
  const torsoLean = limbAngles.torsoLean || 0;
  const leftArm = limbAngles.leftArm || 0;
  const rightArm = limbAngles.rightArm || 0;
  const leftLeg = limbAngles.leftLeg || 0;
  const rightLeg = limbAngles.rightLeg || 0;
  const bodyBob = limbAngles.bodyBob || 0;

  const defaultParts = getDefaultPartsMap();
  const selectedParts = config.selectedParts || {};

  const categoriesToRender: BodyPartCategory[] = [
    'shoes',
    'clothesBottom',
    'clothesTop',
    'head',
    'ears',
    'earrings',
    'eyes',
    'eyebrows',
    'nose',
    'mouth',
    'mustache',
    'hair',
    'hands',
  ];

  // Sort by z-index for the active angle
  const sortedCategories = [...categoriesToRender].sort((a, b) => {
    const zA = DEFAULT_Z_INDICES[a]?.[angle] ?? 10;
    const zB = DEFAULT_Z_INDICES[b]?.[angle] ?? 10;
    return zA - zB;
  });

  const getSpriteForPart = (
    cat: BodyPartCategory
  ): { svgContent: string; color: string; hasWarning: boolean } => {
    const sel = selectedParts[cat] || defaultParts[cat];
    const color = sel?.color || defaultParts[cat]?.color || '#ffffff';

    if (sel?.partId === 'none' || sel?.partId === 'earring_none' || sel?.partId === 'mustache_none') {
      return { svgContent: '', color, hasWarning: false };
    }

    if ((sel as any)?.customSprites?.[angle]) {
      const customStr = (sel as any).customSprites[angle]!;
      if (customStr.startsWith('data:image')) {
        return {
          svgContent: `<image href="${customStr}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet" />`,
          color,
          hasWarning: false,
        };
      }
      return { svgContent: customStr, color, hasWarning: false };
    }

    const partDef = getPartDefinition(cat, sel?.partId || defaultParts[cat]?.partId);
    if (!partDef) {
      return { svgContent: '', color, hasWarning: false };
    }

    let spriteStr = '';
    switch (angle) {
      case 'front':
        spriteStr = partDef.sprites.front;
        break;
      case 'three_quarter_front':
        spriteStr = partDef.sprites.threeQuarterFront;
        break;
      case 'profile':
        spriteStr = partDef.sprites.profile;
        break;
      case 'three_quarter_back':
        spriteStr = partDef.sprites.threeQuarterBack;
        break;
      case 'back':
        spriteStr = partDef.sprites.back;
        break;
      default:
        spriteStr = partDef.sprites.front;
    }

    if (!spriteStr) {
      return { svgContent: '', color, hasWarning: true };
    }

    return { svgContent: spriteStr, color, hasWarning: false };
  };

  let missingPartName: string | null = null;
  for (const cat of categoriesToRender) {
    const { hasWarning } = getSpriteForPart(cat);
    if (hasWarning) {
      missingPartName = cat;
      break;
    }
  }

  // Compute dynamic limb transform per category so poses & motions animate the character
  const getCategoryPoseTransform = (cat: BodyPartCategory): string => {
    const headCategories: BodyPartCategory[] = [
      'head',
      'hair',
      'ears',
      'earrings',
      'eyes',
      'eyebrows',
      'nose',
      'mouth',
      'mustache',
    ];
    if (headCategories.includes(cat)) {
      return `translate(70, ${70 + bodyBob}) rotate(${headTilt + torsoLean * 0.4}, 50, 75)`;
    }
    if (cat === 'clothesTop' || cat === 'torso') {
      return `translate(70, ${150 + bodyBob}) rotate(${torsoLean}, 50, 45)`;
    }
    if (cat === 'hands') {
      const avgArmAngle = (leftArm + rightArm) * 0.35;
      const armLiftY = Math.min(0, (leftArm + rightArm) * 0.12);
      return `translate(70, ${190 + bodyBob + armLiftY}) rotate(${avgArmAngle + torsoLean * 0.5}, 50, 10)`;
    }
    if (cat === 'clothesBottom') {
      const legSwing = (leftLeg - rightLeg) * 0.22;
      return `translate(${70 + legSwing * 0.3}, ${210 + bodyBob * 0.6}) rotate(${legSwing}, 50, 20)`;
    }
    if (cat === 'shoes') {
      const stepOffset = (leftLeg - rightLeg) * 0.35;
      const stepLift = -Math.abs(leftLeg - rightLeg) * 0.08;
      return `translate(${70 + stepOffset}, ${280 + stepLift}) rotate(${(leftLeg + rightLeg) * 0.18}, 50, 20)`;
    }
    return `translate(70, ${70 + bodyBob})`;
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none"
      style={{
        width,
        height,
        transform: config.flipX ? 'scaleX(-1)' : undefined,
      }}
    >
      {missingPartName && (
        <div className="absolute top-1 left-1 right-1 z-50 bg-amber-600/90 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
          Missing sprite for {missingPartName} at {angle} view
        </div>
      )}

      <svg viewBox="0 0 240 360" className="w-full h-full overflow-visible drop-shadow-lg">
        <g id="character-root">
          {sortedCategories.map((cat) => {
            const { svgContent, color } = getSpriteForPart(cat);
            const trans = getCategoryPoseTransform(cat);

            if (cat === 'eyes') {
              if (angle === 'back' || angle === 'three_quarter_back') return null;
              const eyeMarkup = renderEyeSpecial(angle, expression, pupilLook, color);
              return (
                <g
                  key={cat}
                  id={`cat-${cat}`}
                  transform={trans}
                  dangerouslySetInnerHTML={{ __html: eyeMarkup }}
                />
              );
            }

            if (cat === 'mouth') {
              if (angle === 'back' || angle === 'three_quarter_back') return null;
              const mouthMarkup = renderVisemeShape(viseme, angle, color);
              return (
                <g
                  key={cat}
                  id={`cat-${cat}`}
                  transform={trans}
                  dangerouslySetInnerHTML={{ __html: mouthMarkup }}
                />
              );
            }

            if (!svgContent) return null;

            let innerSvg = svgContent;
            if (svgContent.startsWith('<svg')) {
              innerSvg = svgContent.replace(/<svg[^>]*>|<\/svg>/gi, '');
            }

            return (
              <g
                key={cat}
                id={`cat-${cat}`}
                transform={trans}
                style={{ '--part-color': color } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: innerSvg }}
              />
            );
          })}

          {/* SKELETON MODE OVERLAY */}
          {showSkeleton && (
            <g
              id="skeleton-wireframe"
              stroke="#38bdf8"
              strokeWidth="2.5"
              opacity="0.9"
              transform={`translate(0, ${bodyBob})`}
            >
              {/* Head Pivot */}
              <circle
                cx={120 + headTilt * 0.3}
                cy={110}
                r="6"
                fill="#0ea5e9"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Spine */}
              <line x1={120 + headTilt * 0.3} y1="110" x2={120 + torsoLean * 0.4} y2="225" />
              {/* Shoulders */}
              <line x1="85" y1="165" x2="155" y2="165" />
              {/* Left Arm */}
              <g transform={`rotate(${leftArm}, 85, 165)`}>
                <line x1="85" y1="165" x2="65" y2="210" />
                <line x1="65" y1="210" x2="55" y2="250" />
                <circle cx="65" cy="210" r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                <circle cx="55" cy="250" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              </g>
              {/* Right Arm */}
              <g transform={`rotate(${rightArm}, 155, 165)`}>
                <line x1="155" y1="165" x2="175" y2="210" />
                <line x1="175" y1="210" x2="185" y2="250" />
                <circle cx="175" cy="210" r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                <circle cx="185" cy="250" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              </g>
              {/* Pelvis / Hips */}
              <line x1="95" y1="230" x2="145" y2="230" />
              {/* Left Leg */}
              <g transform={`rotate(${leftLeg}, 95, 230)`}>
                <line x1="95" y1="230" x2="90" y2="290" />
                <line x1="90" y1="290" x2="85" y2="340" />
                <circle cx="90" cy="290" r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                <circle cx="85" cy="340" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              </g>
              {/* Right Leg */}
              <g transform={`rotate(${rightLeg}, 145, 230)`}>
                <line x1="145" y1="230" x2="150" y2="290" />
                <line x1="150" y1="290" x2="155" y2="340" />
                <circle cx="150" cy="290" r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                <circle cx="155" cy="340" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              </g>
              {/* Core Joint Nodes */}
              {[
                { x: 120, y: 165 },
                { x: 85, y: 165 },
                { x: 155, y: 165 },
                { x: 120, y: 230 },
                { x: 95, y: 230 },
                { x: 145, y: 230 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
              ))}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
