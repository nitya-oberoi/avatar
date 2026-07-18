/**
 * Avatar Renderer — full-body Bitmoji-style flat cartoon SVG.
 *
 * Bitmoji signature = chibi proportions: huge head (wider than the body),
 * short torso, stubby limbs, flat colours, thick uniform dark outlines,
 * big friendly features. Drawn in a fixed 300x380 space, scaled by viewBox.
 *
 * Layers back→front: back-hair, legs+shoes, torso+arms, neck, ears, head,
 * face, front-hair, accessories.
 */

import { AvatarConfig, AvatarColors, AvatarSelection } from '@apptypes/avatar';

const CX = 150;
const OL = '#33251f';
const OLW = 3.5;
const EYE_Y = 102;
const EYE_DX = 26;

const stroke = `stroke="${OL}" stroke-width="${OLW}" stroke-linejoin="round" stroke-linecap="round"`;

export const renderAvatarSVG = (config: AvatarConfig, size = 300): string => {
  const w = Math.round(size * (300 / 380));
  const uid = hashId(config.id + config.selection.head);
  const hair = renderHair(config, `hg-${uid}`);
  const hg = headGeom(config.selection.head, config.selection.gender);
  return `
    <svg width="${w}" height="${size}" viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="head-${uid}">${hg.path} ${headScale(hg.f)} /></clipPath>
        ${hairGradient(`hg-${uid}`, config.colors.hairColor)}
      </defs>
      <ellipse cx="${CX}" cy="366" rx="72" ry="12" fill="#000" opacity="0.10"/>
      ${rig(config, uid, hair)}
    </svg>
  `.trim();
};

// Assemble the avatar into rigged part groups so a stylesheet can animate each
// limb independently (real walk/run/jump cycles, not a whole-body wobble).
// Class names are LITERAL (not CSS-module-hashed); the creator stylesheet
// targets them via :global(). Draw order preserves the original stacking:
// hair-back → legs → arms → body(+neck) → head(+face+front-hair+accessories).
const rig = (c: AvatarConfig, uid: string, hair: HairLayers): string => {
  const legs = renderLegs(c, uid);
  const torso = renderTorso(c, uid);
  return `
    <g class="avp-root">
      ${hair.back}
      <g class="avp-legL">${legs.left}</g>
      <g class="avp-legR">${legs.right}</g>
      <g class="avp-armL">${torso.armL}</g>
      <g class="avp-armR">${torso.armR}</g>
      <g class="avp-body">${torso.body}${renderNeck(c)}</g>
      <g class="avp-head">${renderEars(c)}${renderHead(c)}${renderFaceShadow(c, uid)}${renderFace(c)}${hair.front}${renderAccessories(c)}</g>
    </g>`;
};

// Soft cel-shading on the face: light from top-left, so a darker-skin ellipse
// offset toward bottom-right (clipped to the head) leaves a lit top-left
// crescent. Plus a fringe shadow under the hairline.
const renderFaceShadow = (c: AvatarConfig, uid: string): string => {
  const sh = darken(c.colors.skinTone, 12);
  return `
    <g clip-path="url(#head-${uid})">
      <ellipse cx="${CX + 15}" cy="112" rx="66" ry="62" fill="${sh}" opacity="0.32"/>
      <path d="M90 60 Q150 92 210 60 L210 78 Q150 104 90 78 Z" fill="${darken(c.colors.skinTone, 16)}" opacity="0.30"/>
    </g>`;
};

/* ------------------------------- body ---------------------------- */

// Gender + body-trait silhouette. Male = broad shoulders / narrow hips (V);
// female = narrower shoulders / wider hips (hourglass). `weight` scales limb
// thickness, leg width, and stance so the range runs petite → plus-size.
const bodyGeom = (c: AvatarConfig) => {
  const female = c.selection.gender === 'female';
  let shoulder = female ? 36 : 49; // half-width at shoulders
  let hip = female ? 46 : 37; // half-width at hips
  let weight = 1; // overall build (0.8 petite → 1.4 round)
  switch (c.selection.body) {
    case 'body_petite': shoulder -= 9; hip -= 7; weight = 0.8; break;
    case 'body_slim': shoulder -= 6; hip -= 6; weight = 0.84; break;
    case 'body_athletic': shoulder += 9; hip -= 1; weight = 1.06; break;
    case 'body_curvy': shoulder -= 1; hip += 10; weight = 1.08; break;
    case 'body_broad': shoulder += 13; hip += 6; weight = 1.22; break;
    case 'body_plus': shoulder += 5; hip += 12; weight = 1.28; break;
    case 'body_round': shoulder += 8; hip += 16; weight = 1.4; break;
    // body_standard: defaults
  }
  return { shoulder, hip, female, weight };
};

const renderLegs = (c: AvatarConfig, uid: string): { left: string; right: string } => {
  const pants = c.colors.outfitSecondary;
  const shade = darken(pants, 13);
  const shoes = c.colors.accentColor;
  const { hip, weight } = bodyGeom(c);
  // legs thicken with build and spread with the hips
  const legW = Math.round(Math.max(17, Math.min(42, 24 + (weight - 1) * 32)));
  const spread = Math.round(Math.max(hip * 0.3, legW * 0.6));
  const cxL = CX - spread, cxR = CX + spread;
  // each leg: base fill + inner-edge shadow + outer highlight (clipped to leg)
  const leg = (cx: number, i: number) => {
    const x = Math.round(cx - legW / 2);
    return `
    <rect x="${x}" y="258" width="${legW}" height="90" rx="12" fill="${pants}" ${stroke}/>
    <clipPath id="leg-${uid}-${i}"><rect x="${x}" y="258" width="${legW}" height="90" rx="12"/></clipPath>
    <g clip-path="url(#leg-${uid}-${i})">
      <rect x="${x + legW - 11}" y="258" width="11" height="90" fill="${shade}" opacity="0.5"/>
      <rect x="${x + 2}" y="258" width="4" height="90" fill="${lighten(pants, 16)}" opacity="0.5"/>
    </g>`;
  };
  // rounded shoe that overlaps the leg bottom, scaled to the leg width
  const sw = legW * 0.56 + 3;
  const shoe = (cx: number) => `
    <path d="M${cx - sw} 340 Q${cx - sw - 2} 360 ${cx - sw * 0.6} 367 Q${cx} 370 ${cx + sw * 0.6} 367 Q${cx + sw + 2} 360 ${cx + sw} 340 Z" fill="${shoes}" ${stroke}/>
    <path d="M${cx - sw + 1} 361 Q${cx} 366 ${cx + sw - 1} 361" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
    <path d="M${cx - sw * 0.66} 348 Q${cx} 351 ${cx + sw * 0.66} 348" fill="none" stroke="${lighten(shoes, 22)}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`;
  return { left: `${leg(cxL, 0)}${shoe(cxL)}`, right: `${leg(cxR, 1)}${shoe(cxR)}` };
};

const renderTorso = (c: AvatarConfig, uid: string): { armL: string; armR: string; body: string } => {
  const p = c.colors.outfitPrimary;
  const skin = c.colors.skinTone;
  const { shoulder, hip, female, weight } = bodyGeom(c);
  const wAdj = Math.round((weight - 1) * 12); // thicker limbs for heavier builds
  const sl = CX - shoulder, sr = CX + shoulder;
  const hl = CX - hip, hr = CX + hip;

  // Torso: female gets a waist pinch, male stays straight.
  const torsoPath = female
    ? `M${sl} 182 Q${CX} 172 ${sr} 182 Q${sr + 4} 212 ${sr - 8} 232 Q${hr} 248 ${hr} 264 L${hl} 264 Q${hl} 248 ${sl + 8} 232 Q${sl - 4} 212 ${sl} 182 Z`
    : `M${sl} 182 Q${CX} 170 ${sr} 182 Q${sr + 6} 224 ${sr - 4} 264 L${sl + 4} 264 Q${sl - 6} 224 ${sl} 182 Z`;
  // base fill + cel-shading clipped to the shirt (light top-left)
  const dk = darken(p, 15);
  const bot = 264;
  const torso = `<path d="${torsoPath}" fill="${p}" ${stroke}/>
    <clipPath id="torso-${uid}"><path d="${torsoPath}"/></clipPath>
    <g clip-path="url(#torso-${uid})">
      <!-- right-side body shadow (light from top-left) -->
      <ellipse cx="${sr + 2}" cy="242" rx="30" ry="56" fill="${dk}" opacity="0.34"/>
      <!-- underarm creases where the arms press the fabric -->
      <path d="M${sl + 2} 194 Q${sl + 24} 208 ${sl + 20} 242" fill="none" stroke="${dk}" stroke-width="7" stroke-linecap="round" opacity="0.25"/>
      <path d="M${sr - 2} 194 Q${sr - 24} 208 ${sr - 20} 242" fill="none" stroke="${dk}" stroke-width="7" stroke-linecap="round" opacity="0.25"/>
      <!-- fabric folds rising from the waist -->
      <path d="M${CX - 13} ${bot - 12} Q${CX - 6} 232 ${CX - 3} 208" fill="none" stroke="${dk}" stroke-width="4" stroke-linecap="round" opacity="0.28"/>
      <path d="M${CX + 15} ${bot - 10} Q${CX + 7} 232 ${CX + 3} 210" fill="none" stroke="${dk}" stroke-width="4" stroke-linecap="round" opacity="0.28"/>
      <!-- hem shadow -->
      <path d="M${sl} ${bot - 14} Q${CX} ${bot} ${sr} ${bot - 14} L${sr} ${bot + 6} Q${CX} ${bot + 12} ${sl} ${bot + 6} Z" fill="${dk}" opacity="0.3"/>
      <!-- soft center-left highlight -->
      <path d="M${sl + 8} 192 Q${CX - 6} 202 ${sl + 12} 252" fill="none" stroke="${lighten(p, 17)}" stroke-width="7" stroke-linecap="round" opacity="0.4"/>
      <!-- collar shadow under the neckline -->
      <path d="M${CX - 17} 183 Q${CX} 196 ${CX + 17} 183 Q${CX} 204 ${CX - 17} 183 Z" fill="${dk}" opacity="0.3"/>
    </g>`;

  // Arms: fuller skin capsule hanging along the body, ending in a rounded
  // mitten hand; a short puffed sleeve caps the shoulder. Thicker for male.
  const armSkin = (female ? 14 : 17) + wAdj;
  const armOL = armSkin + 5;
  const sleeveP = (female ? 19 : 23) + wAdj;
  const sleeveOL = sleeveP + 5;
  const arm = (dir: 1 | -1) => {
    const topX = CX + dir * (shoulder - 2);
    const midX = CX + dir * (shoulder + 9);
    const handX = CX + dir * (shoulder + 6);
    const armPath = `M${topX} 196 Q${midX} 226 ${handX} 250`;
    return `
      <path d="${armPath}" fill="none" stroke="${OL}" stroke-width="${armOL}" stroke-linecap="round"/>
      <path d="${armPath}" fill="none" stroke="${skin}" stroke-width="${armSkin}" stroke-linecap="round"/>
      <path d="${armPath}" fill="none" stroke="${lighten(skin, 12)}" stroke-width="4" stroke-linecap="round" opacity="0.4"/>
      <ellipse cx="${handX}" cy="256" rx="12" ry="13" fill="${skin}" ${stroke}/>
      <ellipse cx="${handX - dir * 9}" cy="252" rx="5.5" ry="6.5" fill="${skin}" ${stroke}/>
      <path d="M${CX + dir * (shoulder - 8)} 184 Q${CX + dir * (shoulder + 14)} 188 ${midX} 216" fill="none" stroke="${OL}" stroke-width="${sleeveOL}" stroke-linecap="round"/>
      <path d="M${CX + dir * (shoulder - 8)} 184 Q${CX + dir * (shoulder + 14)} 188 ${midX} 216" fill="none" stroke="${p}" stroke-width="${sleeveP}" stroke-linecap="round"/>
      <path d="M${CX + dir * (shoulder - 6)} 190 Q${CX + dir * (shoulder + 10)} 194 ${midX - dir * 1} 214" fill="none" stroke="${lighten(p, 14)}" stroke-width="4" stroke-linecap="round" opacity="0.45"/>
      <path d="M${CX + dir * (shoulder + 2)} 214 Q${midX} 218 ${midX + dir * 3} 222" fill="none" stroke="${darken(p, 16)}" stroke-width="3" stroke-linecap="round" opacity="0.4"/>`;
  };

  return { armL: arm(-1), armR: arm(1), body: `${torso}${outfitDetail(c, sl, sr)}` };
};

// Per-outfit decoration on the torso (neckline + one motif).
const outfitDetail = (c: AvatarConfig, sl: number, sr: number): string => {
  const s = c.colors.outfitSecondary;
  const a = c.colors.accentColor;
  const neckline = `<path d="M${CX - 16} 182 Q${CX} 194 ${CX + 16} 182" fill="none" ${stroke}/>`;
  const details: Record<string, string> = {
    outfit_casual: neckline,
    outfit_formal: `<path d="M${CX - 14} 182 L${CX} 202 L${CX + 14} 182" fill="none" ${stroke}/><path d="M${CX - 4} 200 L${CX} 240 L${CX + 4} 200 Z" fill="${a}" ${stroke}/>`,
    outfit_sporty: `${neckline}<path d="M${CX} 196 L${CX} 262" stroke="${s}" stroke-width="4"/><path d="M${sl + 6} 210 L${sl + 14} 210 M${sr - 14} 210 L${sr - 6} 210" stroke="${s}" stroke-width="4"/>`,
    outfit_magical: `${neckline}<path d="M${CX} 210 l4.5 10 11 1.5 -8 8 2 11 -9.5 -5.5 -9.5 5.5 2 -11 -8 -8 11 -1.5 Z" fill="${a}" ${stroke}/>`,
    outfit_explorer: `${neckline}<circle cx="${CX}" cy="206" r="3.5" fill="${a}"/><circle cx="${CX}" cy="222" r="3.5" fill="${a}"/><circle cx="${CX}" cy="238" r="3.5" fill="${a}"/>`,
    outfit_futuristic: `<path d="M${CX - 14} 182 L${CX} 200 L${CX + 14} 182" fill="none" ${stroke}/><path d="M${sl + 4} 250 L${sr - 4} 250" stroke="${a}" stroke-width="5"/><circle cx="${CX}" cy="222" r="6" fill="${a}" ${stroke}/>`,
    outfit_vintage: `${neckline}<path d="M${sl + 2} 236 L${sr - 2} 236" stroke="${s}" stroke-width="6"/>`,
    outfit_boho: `${neckline}<circle cx="${CX}" cy="206" r="4" fill="${a}"/><circle cx="${CX - 12}" cy="212" r="3" fill="${a}"/><circle cx="${CX + 12}" cy="212" r="3" fill="${a}"/>`,
  };
  return details[c.selection.outfit] || neckline;
};

const renderNeck = (c: AvatarConfig): string => {
  // Male: thicker, squarer neck. Female: slimmer.
  const w = c.selection.gender === 'male' ? 18 : 12;
  const l = CX - w, r = CX + w;
  return `<path d="M${l} 148 L${l} 184 Q${CX} 191 ${r} 184 L${r} 148 Z" fill="${c.colors.skinTone}" ${stroke}/>`;
};

const renderEars = (c: AvatarConfig): string => {
  const { sideX } = headGeom(c.selection.head, c.selection.gender);
  const ear = (x: number) => `<circle cx="${x}" cy="104" r="10" fill="${c.colors.skinTone}" ${stroke}/>`;
  return `${ear(CX - sideX)}${ear(CX + sideX)}`;
};

/* ------------------------------- head ---------------------------- */

// sideX = half-width at ear level; topY = top of the skull; browW = half-width
// at the forehead/fringe line (~y88) so the fringe hugs the actual silhouette.
// f = a gender jaw/face width factor: male faces render wider/squarer, female
// narrower. It is baked into sideX/browW (so ears + hair follow) and returned
// so renderHead can scale the head path itself.
type HeadGeom = { sideX: number; topY: number; browW: number; path: string; f: number };

const headGeomBase = (shape: string): Omit<HeadGeom, 'f'> => {
  switch (shape) {
    case 'head_oval':
      return { sideX: 56, topY: 36, browW: 52, path: `<ellipse cx="${CX}" cy="100" rx="56" ry="64"` };
    case 'head_square':
      return { sideX: 60, topY: 42, browW: 58, path: `<rect x="90" y="42" width="120" height="118" rx="34"` };
    case 'head_heart':
      return { sideX: 62, topY: 40, browW: 60, path: `<path d="M90 92 Q88 42 150 40 Q212 42 210 92 Q206 132 150 162 Q94 132 90 92 Z"` };
    case 'head_diamond':
      return { sideX: 58, topY: 42, browW: 48, path: `<path d="M150 40 Q206 64 210 100 Q206 140 150 162 Q94 140 90 100 Q94 64 150 40 Z"` };
    default:
      return { sideX: 64, topY: 40, browW: 60, path: `<ellipse cx="${CX}" cy="100" rx="64" ry="60"` };
  }
};

const headGeom = (shape: string, gender: string): HeadGeom => {
  const f = gender === 'male' ? 1.06 : 0.95;
  const b = headGeomBase(shape);
  return { sideX: Math.round(b.sideX * f), topY: b.topY, browW: b.browW * f, path: b.path, f };
};

// Horizontal scale about the face centre — widens (male) / narrows (female) the head.
const headScale = (f: number): string => `transform="matrix(${f} 0 0 1 ${(CX * (1 - f)).toFixed(2)} 0)"`;

const renderHead = (c: AvatarConfig): string => {
  const { path, f } = headGeom(c.selection.head, c.selection.gender);
  return `${path} ${headScale(f)} fill="${c.colors.skinTone}" ${stroke}/>`;
};

/* ------------------------------- face ---------------------------- */

const renderFace = (c: AvatarConfig): string => `
  ${renderBrows(c)}
  ${renderEyes(c)}
  ${renderNose(c)}
  ${renderMouth(c)}
  ${renderBlush(c)}
`;

const renderBrows = (c: AvatarConfig): string => {
  const col = darken(c.colors.hairColor, 5);
  const e = c.selection.expression;
  const male = c.selection.gender === 'male';
  const w = male ? 8 : 4.5; // male thicker, female thinner
  const arch = male ? 1 : 5; // male flatter, female more arched
  let o = 84, i = 82; // outer / inner y
  if (e === 'expr_angry') { o = 80; i = 90; }
  else if (e === 'expr_sad') { o = 90; i = 80; }
  else if (e === 'expr_surprised') { o = 75; i = 73; }
  // male brows sit lower (closer to the eyes); female higher.
  const gy = male ? 4 : -2;
  o += gy; i += gy;
  return `
    <path d="M${CX - 40} ${o} Q${CX - 28} ${i - arch} ${CX - 14} ${i}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>
    <path d="M${CX + 14} ${i} Q${CX + 28} ${i - arch} ${CX + 40} ${o}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
};

const renderEyes = (c: AvatarConfig): string => {
  const eye = c.colors.eyeColor;
  const e = c.selection.expression;
  const female = c.selection.gender === 'female';

  // Female: larger, rounder eyes with lashes. Male: smaller, narrower.
  const rx = female ? 12 : 10;
  const ry = female ? 14.5 : 11.5;
  const iris = female ? 7.5 : 6.5;
  const open = (x: number) => {
    const dir = x < CX ? -1 : 1;
    const lash = female
      ? `<path d="M${x + dir * 11} ${EYE_Y - 10} q${dir * 5} -3 ${dir * 9} 1" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>`
      : '';
    return `
    <ellipse cx="${x}" cy="${EYE_Y}" rx="${rx}" ry="${ry}" fill="#fff" ${stroke}/>
    <circle cx="${x}" cy="${EYE_Y + 2}" r="${iris}" fill="${eye}"/>
    <circle cx="${x}" cy="${EYE_Y + 2}" r="3.5" fill="#1a1512"/>
    <circle cx="${x - 3}" cy="${EYE_Y - 2}" r="2.5" fill="#fff"/>
    ${lash}`;
  };

  const happyClosed = (x: number) => `
    <path d="M${x - 11} ${EYE_Y + 3} Q${x} ${EYE_Y - 9} ${x + 11} ${EYE_Y + 3}" fill="none" stroke="${OL}" stroke-width="4" stroke-linecap="round"/>`;

  const heart = (x: number) => `
    <path d="M${x} ${EYE_Y + 8} L${x - 9} ${EYE_Y - 1} Q${x - 12} ${EYE_Y - 9} ${x - 5} ${EYE_Y - 9} Q${x} ${EYE_Y - 8} ${x} ${EYE_Y - 4} Q${x} ${EYE_Y - 8} ${x + 5} ${EYE_Y - 9} Q${x + 12} ${EYE_Y - 9} ${x + 9} ${EYE_Y - 1} Z" fill="#ff4d6d" ${stroke}/>`;

  const L = CX - EYE_DX, R = CX + EYE_DX;
  if (e === 'expr_wink') return `${open(L)}${happyClosed(R)}`;
  if (e === 'expr_love') return `${heart(L)}${heart(R)}`;
  if (e === 'expr_happy') return `${happyClosed(L)}${happyClosed(R)}`;
  return `${open(L)}${open(R)}`;
};

const renderNose = (c: AvatarConfig): string =>
  `<path d="M${CX - 4} 119 Q${CX} 125 ${CX + 4} 119" fill="none" stroke="${darken(c.colors.skinTone, 22)}" stroke-width="3" stroke-linecap="round"/>`;

const renderMouth = (c: AvatarConfig): string => {
  const e = c.selection.expression;
  const male = c.selection.gender === 'male';
  // Female: pinker lip line + a fuller lower lip. Male: plain dark, a touch wider.
  const lip = male ? OL : '#a24a5b';
  const mw = male ? 16 : 12;
  const ms = `fill="none" stroke="${lip}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"`;
  const lowerLip = male ? '' : `<path d="M${CX - 9} 141 Q${CX} 147 ${CX + 9} 141" fill="none" stroke="#cf7382" stroke-width="4.5" stroke-linecap="round" opacity="0.75"/>`;
  const smile = `
    <path d="M${CX - 24} 132 Q${CX} 137 ${CX + 24} 132 Q${CX + 20} 156 ${CX} 159 Q${CX - 20} 156 ${CX - 24} 132 Z" fill="#8d3746" ${stroke}/>
    <path d="M${CX - 20} 134 Q${CX} 138 ${CX + 20} 134 L${CX + 17} 141 Q${CX} 145 ${CX - 17} 141 Z" fill="#fff"/>
    <path d="M${CX - 10} 152 Q${CX} 157 ${CX + 10} 152 Q${CX} 155 ${CX - 10} 152 Z" fill="#e07088"/>`;
  const mouths: Record<string, string> = {
    expr_happy: smile,
    expr_love: smile,
    expr_neutral: `<path d="M${CX - mw} 138 Q${CX} 146 ${CX + mw} 138" ${ms}/>${lowerLip}`,
    expr_cool: `<path d="M${CX - 14} 138 Q${CX + 4} 148 ${CX + 17} 134" ${ms}/>`,
    expr_sad: `<path d="M${CX - 14} 144 Q${CX} 134 ${CX + 14} 144" ${ms}/>`,
    expr_angry: `<path d="M${CX - 14} 142 Q${CX} 137 ${CX + 14} 142" ${ms}/>`,
    expr_surprised: `<ellipse cx="${CX}" cy="142" rx="8" ry="11" fill="#8d3746" ${stroke}/>`,
    expr_wink: `<path d="M${CX - 15} 137 Q${CX} 149 ${CX + 17} 135" ${ms}/>`,
  };
  return mouths[e] || mouths.expr_neutral;
};

const renderBlush = (c: AvatarConfig): string => {
  const op = c.selection.gender === 'female' ? 0.55 : 0.25;
  return `
  <ellipse cx="${CX - 42}" cy="122" rx="10" ry="6" fill="#ff9db0" opacity="${op}"/>
  <ellipse cx="${CX + 42}" cy="122" rx="10" ry="6" fill="#ff9db0" opacity="${op}"/>`;
};

/* ------------------------------- hair ---------------------------- */

interface HairLayers { back: string; front: string; }

// Vertical hair gradient: lit crown → base → shadowed underside. Applied to
// every hair shape (objectBoundingBox), giving flat styles real depth.
const hairGradient = (id: string, hex: string): string =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="${lighten(hex, 20)}"/>` +
  `<stop offset="0.42" stop-color="${hex}"/>` +
  `<stop offset="1" stop-color="${darken(hex, 22)}"/></linearGradient>`;

const renderHair = (c: AvatarConfig, gradId: string): HairLayers => {
  const col = c.colors.hairColor;
  const fillRef = `url(#${gradId})`;
  const hi = lighten(col, 20);
  const { sideX, topY, browW } = headGeom(c.selection.head, c.selection.gender);
  // Front cap fitted to the head: peaks above the skull, hugs the temples,
  // and ends in a smooth centre-parted fringe just above the brows.
  const w = browW + 3;
  const peak = topY - 15;
  const fr = 88; // fringe bottom (brows begin ~82)
  const cap = `<path d="M${CX - w} ${fr - 6}
      C${CX - w - 2} ${topY + 4} ${CX - w * 0.5} ${peak} ${CX} ${peak}
      C${CX + w * 0.5} ${peak} ${CX + w + 2} ${topY + 4} ${CX + w} ${fr - 6}
      Q${CX + w * 0.62} ${fr - 3} ${CX + w * 0.34} ${fr - 10}
      Q${CX + w * 0.13} ${fr} ${CX} ${fr - 9}
      Q${CX - w * 0.13} ${fr} ${CX - w * 0.34} ${fr - 10}
      Q${CX - w * 0.62} ${fr - 3} ${CX - w} ${fr - 6} Z" fill="${fillRef}" ${stroke}/>`
    + `<path d="M${CX - w * 0.5} ${topY + 10} Q${CX - w * 0.1} ${peak + 8} ${CX + w * 0.25} ${peak + 12}" fill="none" stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>`;
  const back = (ry: number, cy: number) =>
    `<ellipse cx="${CX}" cy="${cy}" rx="${sideX + 16}" ry="${ry}" fill="${fillRef}" ${stroke}/>`;

  switch (c.selection.hair) {
    case 'hair_short': return { back: '', front: cap };
    case 'hair_long': return { back: back(112, 128), front: cap };
    case 'hair_bob': return { back: back(72, 108), front: cap };
    case 'hair_wavy':
      return {
        back: `${back(104, 124)}${[86, 118, 182, 214].map((x) => `<circle cx="${x}" cy="222" r="16" fill="${fillRef}" ${stroke}/>`).join('')}`,
        front: cap,
      };
    case 'hair_bun':
      return { back: `<circle cx="${CX}" cy="26" r="21" fill="${fillRef}" ${stroke}/>`, front: cap };
    case 'hair_spiky': {
      // One jagged silhouette: swept sides, tall fanned spikes, spiky fringe.
      const spikes = `<path d="M86 98 L80 58 L96 66 L90 30 L106 40 L104 12 L122 34 L128 8 L146 32 L150 2 L154 32 L172 8 L178 34 L196 12 L194 40 L210 30 L204 66 L220 58 L214 98 L200 84 L190 96 L176 82 L164 94 L150 82 L136 94 L124 82 L110 96 L100 84 Z" fill="${fillRef}" ${stroke}/>`;
      const sheen = `<path d="M118 34 L128 14 L136 34 M168 34 L176 16 L182 34" fill="none" stroke="${lighten(col, 20)}" stroke-width="3.5" stroke-linecap="round" opacity="0.5"/>`;
      return { back: '', front: `${spikes}${sheen}` };
    }
    case 'hair_braids':
      // back hair mass; braids hang beside the face over the shoulders (front)
      return { back: back(58, 96), front: `${cap}${braid(84, col, fillRef)}${braid(216, col, fillRef)}` };
    case 'hair_curly': {
      // one cohesive scalloped afro (no messy internal outlines) + fringe + sheen
      const mass = `<path d="${scallop(CX, 84, 82, 84, 12)}" fill="${fillRef}" ${stroke}/>`;
      const fringe = `<path d="${scallop(CX, 66, 62, 30, 9)}" fill="${fillRef}"/>`;
      const sheen = `<path d="${scallop(CX - 22, 60, 30, 22, 6)}" fill="${lighten(col, 18)}" opacity="0.5"/>`;
      return { back: mass, front: `${fringe}${sheen}` };
    }
    case 'hair_pixie':
      return { back: '', front: `${cap}<path d="M104 66 Q140 50 178 70" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"/>` };
    case 'hair_afro': {
      const mass = `<path d="${scallop(CX, 74, 95, 92, 14)}" fill="${fillRef}" ${stroke}/>`;
      const fringe = `<path d="${scallop(CX, 54, 70, 30, 10)}" fill="${fillRef}"/>`;
      const sheen = `<path d="${scallop(CX - 28, 50, 36, 26, 6)}" fill="${lighten(col, 16)}" opacity="0.45"/>`;
      return { back: mass, front: `${fringe}${sheen}` };
    }
    case 'hair_mohawk':
      return { back: '', front: `<path d="M128 66 L134 8 L143 44 L150 4 L157 44 L166 8 L172 66 Q150 56 128 66 Z" fill="${fillRef}" ${stroke}/><path d="M143 50 Q150 58 157 50" fill="none" stroke="${lighten(col, 16)}" stroke-width="4" stroke-linecap="round" opacity="0.4"/>` };
    case 'hair_ponytail':
      return {
        back: `<path d="M184 64 Q232 100 224 168 Q216 208 194 216 Q214 188 207 154 Q202 118 174 92 Z" fill="${fillRef}" ${stroke}/><rect x="178" y="58" width="16" height="9" rx="4" fill="${darken(col, 20)}" ${stroke}/>`,
        front: cap,
      };
    case 'hair_pigtails': {
      const puff = (x: number) => `<ellipse cx="${x}" cy="100" rx="20" ry="31" fill="${fillRef}" ${stroke}/><rect x="${x - 7}" y="72" width="14" height="8" rx="4" fill="${darken(col, 20)}" ${stroke}/>`;
      return { back: `${puff(84)}${puff(216)}`, front: cap };
    }
    case 'hair_topknot':
      return { back: `<circle cx="${CX}" cy="20" r="17" fill="${fillRef}" ${stroke}/><rect x="${CX - 9}" y="30" width="18" height="8" rx="4" fill="${darken(col, 20)}"/>`, front: cap };
    case 'hair_curly_long': {
      // long, soft curls framing the face and hanging past the shoulders:
      // one bumpy silhouette (curls) + a curly fringe.
      const mass = `<path d="M78 96 Q62 120 74 142 Q58 164 72 186 Q56 210 74 230 Q66 252 94 252 Q120 260 150 256 Q180 260 206 252 Q234 252 226 230 Q244 210 228 186 Q242 164 226 142 Q238 120 222 96 Q224 40 150 32 Q76 40 78 96 Z" fill="${fillRef}" ${stroke}/>`;
      const sheen = `<path d="M84 130 Q78 160 88 196" fill="none" stroke="${lighten(col, 14)}" stroke-width="5" stroke-linecap="round" opacity="0.4"/>`;
      const fringe = `<path d="${scallop(CX, 66, 62, 30, 9)}" fill="${fillRef}"/>`;
      const fsheen = `<path d="${scallop(CX - 22, 60, 30, 22, 6)}" fill="${lighten(col, 16)}" opacity="0.45"/>`;
      return { back: `${mass}${sheen}`, front: `${fringe}${fsheen}` };
    }
    case 'hair_ringlets': {
      // very long with tighter ringlet bumps down each side.
      const mass = `<path d="M80 96 Q64 112 78 128 Q62 146 78 162 Q62 182 78 198 Q62 220 78 238 Q68 262 96 264 Q123 270 150 266 Q177 270 204 264 Q232 262 222 238 Q238 220 222 198 Q238 182 222 162 Q238 146 222 128 Q236 112 220 96 Q224 40 150 32 Q76 40 80 96 Z" fill="${fillRef}" ${stroke}/>`;
      const fringe = `<path d="${scallop(CX, 64, 60, 28, 10)}" fill="${fillRef}"/>`;
      const fsheen = `<path d="${scallop(CX - 20, 58, 28, 20, 6)}" fill="${lighten(col, 16)}" opacity="0.45"/>`;
      return { back: mass, front: `${fringe}${fsheen}` };
    }
    case 'hair_bangs': {
      // straight blunt fringe (flat bottom) + medium length behind.
      const w = browW + 3;
      const bangs = `<path d="M${CX - w} 90 C${CX - w - 2} ${topY + 2} ${CX - w * 0.5} ${topY - 14} ${CX} ${topY - 14} C${CX + w * 0.5} ${topY - 14} ${CX + w + 2} ${topY + 2} ${CX + w} 90 Z" fill="${fillRef}" ${stroke}/>`;
      const hi = `<path d="M${CX - w * 0.5} ${topY - 2} Q${CX - w * 0.1} ${topY - 10} ${CX + w * 0.2} ${topY - 8}" fill="none" stroke="${lighten(col, 20)}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>`;
      return { back: back(90, 116), front: `${bangs}${hi}` };
    }
    case 'hair_sidepart': {
      // full swept-over top; fringe sweeps low on the right, part on the left.
      const shape = `<path d="M76 102 C68 50 96 34 150 32 C204 34 226 54 222 104 C216 80 192 72 168 84 Q150 60 118 88 C102 76 84 82 76 102 Z" fill="${fillRef}" ${stroke}/>`;
      const part = `<path d="M122 42 Q114 66 110 90" fill="none" stroke="${darken(col, 18)}" stroke-width="3" stroke-linecap="round" opacity="0.5"/>`;
      const hi = `<path d="M138 50 Q170 44 198 62" fill="none" stroke="${lighten(col, 16)}" stroke-width="4" stroke-linecap="round" opacity="0.4"/>`;
      return { back: '', front: `${shape}${part}${hi}` };
    }
    case 'hair_undercut': {
      // shaved sides, tall swept quiff on the crown.
      const top = `<path d="M92 70 C82 26 124 20 152 20 C186 20 220 34 208 72 C200 50 178 46 158 56 Q150 40 122 52 Q108 44 100 62 C97 56 94 64 92 70 Z" fill="${fillRef}" ${stroke}/>`;
      const hi = `<path d="M120 42 Q152 30 186 48" fill="none" stroke="${lighten(col, 18)}" stroke-width="4" stroke-linecap="round" opacity="0.45"/>`;
      return { back: '', front: `${top}${hi}` };
    }
    case 'hair_curly_bob': {
      // chin-length curly bob with bumpy edges + curly fringe.
      const mass = `<path d="M76 96 Q62 116 74 138 Q66 156 90 162 Q120 170 150 166 Q180 170 210 162 Q234 156 226 138 Q238 116 224 96 Q224 40 150 32 Q76 40 76 96 Z" fill="${fillRef}" ${stroke}/>`;
      const fringe = `<path d="${scallop(CX, 66, 62, 30, 9)}" fill="${fillRef}"/>`;
      const fsheen = `<path d="${scallop(CX - 22, 60, 30, 22, 6)}" fill="${lighten(col, 16)}" opacity="0.45"/>`;
      return { back: mass, front: `${fringe}${fsheen}` };
    }
    case 'hair_curly_pony': {
      // curly fringe + a bumpy (curly) ponytail hanging to the side.
      const tail = `<path d="M182 62 Q236 92 230 138 Q246 168 224 190 Q238 210 214 224 Q228 202 214 184 Q226 160 206 144 Q216 118 190 106 Z" fill="${fillRef}" ${stroke}/><rect x="176" y="56" width="16" height="9" rx="4" fill="${darken(col, 20)}" ${stroke}/>`;
      const fringe = `<path d="${scallop(CX, 66, 60, 28, 9)}" fill="${fillRef}"/>`;
      const fsheen = `<path d="${scallop(CX - 20, 60, 28, 20, 6)}" fill="${lighten(col, 16)}" opacity="0.45"/>`;
      return { back: tail, front: `${fringe}${fsheen}` };
    }
    case 'hair_crew': {
      // neat short rounded crew cut.
      const s = `<path d="M84 98 C80 56 106 44 150 44 C194 44 220 56 216 98 C208 78 186 72 150 76 C114 72 92 78 84 98 Z" fill="${fillRef}" ${stroke}/>`;
      const hi = `<path d="M108 60 Q150 50 192 62" fill="none" stroke="${lighten(col, 16)}" stroke-width="4" stroke-linecap="round" opacity="0.4"/>`;
      return { back: '', front: `${s}${hi}` };
    }
    case 'hair_quiff': {
      // short sides + a swept tuft lifted at the front-centre.
      const base = `<path d="M84 100 C80 58 106 46 150 46 C194 46 220 58 216 100 C210 80 188 74 150 78 C112 74 90 80 84 100 Z" fill="${fillRef}" ${stroke}/>`;
      const tuft = `<path d="M114 60 Q122 20 152 28 Q186 22 178 58 Q150 46 114 60 Z" fill="${fillRef}" ${stroke}/>`;
      const hi = `<path d="M128 46 Q152 36 172 48" fill="none" stroke="${lighten(col, 18)}" stroke-width="4" stroke-linecap="round" opacity="0.45"/>`;
      return { back: '', front: `${base}${tuft}${hi}` };
    }
    case 'hair_fauxhawk': {
      // short sides + a raised spiky ridge down the centre.
      const base = `<path d="M86 100 C82 60 108 48 150 48 C192 48 218 60 214 100 C208 80 186 74 150 78 C114 74 92 80 86 100 Z" fill="${fillRef}" ${stroke}/>`;
      const ridge = `<path d="M130 60 L136 16 L145 46 L152 12 L159 46 L168 16 L174 60 Q150 52 130 60 Z" fill="${fillRef}" ${stroke}/>`;
      return { back: '', front: `${base}${ridge}` };
    }
    case 'hair_tousled': {
      // messy, tufted, slightly swept short hair.
      const s = `<path d="M78 104 Q72 56 98 44 Q96 32 116 42 Q120 28 140 42 Q150 30 168 44 Q182 34 196 50 Q214 48 222 74 Q228 92 224 104 Q214 80 192 82 Q204 64 182 66 Q192 52 166 62 Q176 48 150 58 Q118 48 98 70 Q86 64 78 104 Z" fill="${fillRef}" ${stroke}/>`;
      const hi = `<path d="M108 58 Q136 44 166 56" fill="none" stroke="${lighten(col, 18)}" stroke-width="4" stroke-linecap="round" opacity="0.45"/>`;
      return { back: '', front: `${s}${hi}` };
    }
    case 'hair_swoop': {
      // big side-swept fringe sweeping across the forehead.
      const base = `<path d="M76 102 C66 50 96 34 150 34 C206 36 228 56 222 104 C214 80 190 72 154 82 C120 92 94 92 76 102 Z" fill="${fillRef}" ${stroke}/>`;
      const swoop = `<path d="M104 46 Q168 40 216 92 Q198 70 166 70 Q136 66 114 84 Q100 66 104 46 Z" fill="${fillRef}" ${stroke}/>`;
      const hi = `<path d="M120 52 Q160 50 196 78" fill="none" stroke="${lighten(col, 16)}" stroke-width="4" stroke-linecap="round" opacity="0.4"/>`;
      return { back: '', front: `${base}${swoop}${hi}` };
    }
    case 'hair_shaggy': {
      // longer messy shag with pointy fringe ends, covering the ears.
      const s = `<path d="M72 110 Q66 60 78 44 Q92 30 116 40 Q130 26 150 38 Q170 26 186 42 Q208 34 220 56 Q232 74 228 110 Q222 90 210 92 L204 108 Q192 90 184 104 L178 88 Q166 96 158 108 L152 90 Q140 98 132 108 L126 90 Q112 96 106 108 L100 90 Q86 92 82 106 Q76 92 72 110 Z" fill="${fillRef}" ${stroke}/>`;
      const hi = `<path d="M96 56 Q140 42 190 58" fill="none" stroke="${lighten(col, 16)}" stroke-width="4" stroke-linecap="round" opacity="0.4"/>`;
      return { back: '', front: `${s}${hi}` };
    }
    default: return { back: back(112, 128), front: cap };
  }
};

// Scalloped blob outline (flower-like), for curly/afro hair. Deterministic.
const scallop = (cx: number, cy: number, rx: number, ry: number, bumps: number): string => {
  let d = '';
  for (let i = 0; i < bumps; i++) {
    const a0 = (i / bumps) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / bumps) * Math.PI * 2 - Math.PI / 2;
    const am = (a0 + a1) / 2;
    const x0 = (cx + Math.cos(a0) * rx).toFixed(1);
    const y0 = (cy + Math.sin(a0) * ry).toFixed(1);
    const x1 = (cx + Math.cos(a1) * rx).toFixed(1);
    const y1 = (cy + Math.sin(a1) * ry).toFixed(1);
    const bx = (cx + Math.cos(am) * rx * 1.24).toFixed(1);
    const by = (cy + Math.sin(am) * ry * 1.24).toFixed(1);
    d += (i === 0 ? `M${x0} ${y0}` : '') + ` Q${bx} ${by} ${x1} ${y1}`;
  }
  return d + 'Z';
};

// A twisted-rope plait: overlapping oval knots tilted in alternating directions
// so it unmistakably reads as braided, tapering to a tie + tassel.
const braid = (bx: number, col: string, fillRef: string): string => {
  const hi = lighten(col, 16);
  const knots = [
    { y: 122, rx: 15, ry: 12 },
    { y: 138, rx: 14, ry: 12 },
    { y: 154, rx: 12, ry: 11 },
    { y: 169, rx: 11, ry: 10 },
    { y: 183, rx: 9, ry: 9 },
    { y: 195, rx: 7, ry: 8 },
  ];
  const botY = 202;
  const seg = knots
    .map((k, i) => {
      const rot = i % 2 === 0 ? 20 : -20; // alternate tilt = the weave
      return `<g transform="rotate(${rot} ${bx} ${k.y})">`
        + `<ellipse cx="${bx}" cy="${k.y}" rx="${k.rx}" ry="${k.ry}" fill="${fillRef}" ${stroke}/>`
        + `<ellipse cx="${bx - k.rx * 0.3}" cy="${k.y - k.ry * 0.3}" rx="${k.rx * 0.4}" ry="${k.ry * 0.4}" fill="${hi}" opacity="0.45"/>`
        + `</g>`;
    })
    .join('');
  const tie = `<rect x="${bx - 7}" y="${botY - 4}" width="14" height="7" rx="3" fill="${darken(col, 22)}" ${stroke}/>`;
  const tassel = [-4, 0, 4].map((dx) => `<path d="M${bx + dx} ${botY + 2} q${dx * 0.5} 7 ${dx * 0.6} 12" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`).join('');
  return `${seg}${tie}${tassel}`;
};

/* --------------------------- thumbnails -------------------------- */

// A hairstyle preview: the hair on a neutral, faceless mannequin head, cropped
// to the head — like Snapchat's hair grid. Used by the creator's hair items.
export const renderHairThumbnail = (hairId: string, hairColor = '#3D2817', size = 88): string => {
  const c: AvatarConfig = {
    id: 'thumb',
    version: 1,
    selection: {
      gender: 'female',
      body: 'body_standard',
      head: 'head_round',
      hair: hairId,
      outfit: 'outfit_casual',
      accessories: [],
      expression: 'expr_neutral',
    },
    colors: {
      skinTone: '#EFCBB4',
      hairColor,
      eyeColor: '#6B4423',
      outfitPrimary: '#cccccc',
      outfitSecondary: '#cccccc',
      accentColor: '#cccccc',
    },
    createdAt: 0,
    updatedAt: 0,
  };
  const gid = `hg-thumb-${hairId}`;
  const hair = renderHair(c, gid);
  return `<svg width="${size}" height="${size}" viewBox="54 8 192 192" xmlns="http://www.w3.org/2000/svg">
    <defs>${hairGradient(gid, hairColor)}</defs>
    ${hair.back}${renderEars(c)}${renderHead(c)}${hair.front}
  </svg>`;
};

// A head-shape preview: the chosen head silhouette with ears and a simple face
// (no hair, so the shape reads clearly). Used by the creator's Head items.
export const renderHeadThumbnail = (headId: string, skinTone = '#EFCBB4', size = 88): string => {
  const c: AvatarConfig = {
    id: 'thumb',
    version: 1,
    selection: {
      gender: 'female',
      body: 'body_standard',
      head: headId,
      hair: 'hair_short',
      outfit: 'outfit_casual',
      accessories: [],
      expression: 'expr_happy',
    },
    colors: {
      skinTone,
      hairColor: '#3D2817',
      eyeColor: '#6B4423',
      outfitPrimary: '#cccccc',
      outfitSecondary: '#cccccc',
      accentColor: '#cccccc',
    },
    createdAt: 0,
    updatedAt: 0,
  };
  return `<svg width="${size}" height="${size}" viewBox="60 22 180 164" xmlns="http://www.w3.org/2000/svg">
    ${renderEars(c)}${renderHead(c)}${renderFace(c)}
  </svg>`;
};

// Neutral config for the remaining thumbnails, with per-item overrides applied
// over the caller's live colours (so previews reflect the current palette).
const thumbBase = (sel: Partial<AvatarSelection>, colors: AvatarColors): AvatarConfig => ({
  id: 'thumb',
  version: 1,
  selection: {
    gender: 'female',
    body: 'body_standard',
    head: 'head_round',
    hair: 'hair_short',
    outfit: 'outfit_casual',
    accessories: [],
    expression: 'expr_happy',
    ...sel,
  },
  colors,
  createdAt: 0,
  updatedAt: 0,
});

const facePreview = (c: AvatarConfig, gid: string, viewBox: string, extra = ''): string => {
  const hair = renderHair(c, gid);
  return `<svg width="88" height="88" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
    <defs>${hairGradient(gid, c.colors.hairColor)}</defs>
    ${hair.back}${renderEars(c)}${renderHead(c)}${renderFace(c)}${hair.front}${extra}
  </svg>`;
};

// Expression preview: a face wearing the given expression.
export const renderExpressionThumbnail = (exprId: string, colors: AvatarColors): string =>
  facePreview(thumbBase({ expression: exprId }, colors), `hg-exp-${exprId}`, '54 8 192 192');

// Accessory preview: a head wearing the given accessory (hats/glasses/etc.).
export const renderAccessoryThumbnail = (accId: string, colors: AvatarColors): string => {
  const c = thumbBase({ accessories: [accId] }, colors);
  return facePreview(c, `hg-acc-${accId}`, '48 0 204 204', renderAccessories(c));
};

// Body preview: the whole avatar, showing the body proportions.
export const renderBodyThumbnail = (bodyId: string, colors: AvatarColors): string =>
  renderAvatarSVG(thumbBase({ body: bodyId }, colors), 96);

// Outfit preview: the torso wearing the outfit (its neckline/motif).
export const renderOutfitThumbnail = (outfitId: string, colors: AvatarColors): string => {
  const c = thumbBase({ outfit: outfitId }, colors);
  const t = renderTorso(c, `ot-${outfitId}`);
  return `<svg width="88" height="88" viewBox="74 170 152 114" xmlns="http://www.w3.org/2000/svg">
    ${t.armL}${t.armR}${t.body}
  </svg>`;
};

/* --------------------------- accessories ------------------------- */

const renderAccessories = (c: AvatarConfig): string => {
  const acc = c.selection.accessories;
  const a = c.colors.accentColor;
  const { sideX } = headGeom(c.selection.head, c.selection.gender);
  const has = (id: string) => acc.includes(id);
  let out = '';

  if (has('acc_glasses') || has('acc_sunglasses') || has('acc_goggles')) {
    const dark = has('acc_sunglasses') || has('acc_goggles');
    out += `
      <rect x="${CX - 41}" y="${EYE_Y - 13}" width="30" height="26" rx="9" fill="${dark ? '#2a2320' : '#fff'}" fill-opacity="${dark ? 1 : 0.15}" stroke="${a}" stroke-width="4"/>
      <rect x="${CX + 11}" y="${EYE_Y - 13}" width="30" height="26" rx="9" fill="${dark ? '#2a2320' : '#fff'}" fill-opacity="${dark ? 1 : 0.15}" stroke="${a}" stroke-width="4"/>
      <path d="M${CX - 11} ${EYE_Y} L${CX + 11} ${EYE_Y}" stroke="${a}" stroke-width="4"/>`;
  }
  if (has('acc_hat') || has('acc_cap')) {
    out += `<path d="M96 44 Q150 6 204 44 L204 56 Q150 42 96 56 Z" fill="${a}" ${stroke}/>
            <path d="M96 50 Q150 34 204 50 L212 64 Q150 46 88 64 Z" fill="${darken(a, 12)}" ${stroke}/>`;
  }
  if (has('acc_beanie')) {
    out += `<path d="M90 74 Q84 16 150 14 Q216 16 210 74 Q150 58 90 74 Z" fill="${a}" ${stroke}/>
            <circle cx="${CX}" cy="16" r="9" fill="${darken(a, 15)}" ${stroke}/>`;
  }
  if (has('acc_crown') || has('acc_tiara')) {
    out += `<path d="M112 46 L122 18 L138 40 L150 14 L162 40 L178 18 L188 46 Z" fill="#f6c445" ${stroke}/>`;
  }
  if (has('acc_earrings')) {
    out += `<circle cx="${CX - sideX}" cy="116" r="4" fill="${a}" ${stroke}/>
            <circle cx="${CX + sideX}" cy="116" r="4" fill="${a}" ${stroke}/>`;
  }
  if (has('acc_necklace')) {
    out += `<path d="M136 184 Q150 198 164 184" fill="none" stroke="${a}" stroke-width="3.5"/>
            <circle cx="${CX}" cy="197" r="5" fill="${a}" ${stroke}/>`;
  }
  return out;
};

/* ------------------------------- utils --------------------------- */

const shift = (color: string, percent: number): string => {
  if (!/^#?[0-9a-fA-F]{6}$/.test(color)) return color;
  const n = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const cl = (v: number) => Math.max(0, Math.min(255, v));
  const R = cl((n >> 16) + amt), G = cl(((n >> 8) & 0xff) + amt), B = cl((n & 0xff) + amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};
const darken = (color: string, percent: number): string => shift(color, -percent);
const lighten = (color: string, percent: number): string => shift(color, percent);

// Deterministic id (same on server + client → no hydration mismatch).
const hashId = (s: string): string => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
};
