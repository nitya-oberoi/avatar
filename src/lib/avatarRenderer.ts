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

import { AvatarConfig } from '@apptypes/avatar';

const CX = 150;
const OL = '#33251f';
const OLW = 3.5;
const EYE_Y = 102;
const EYE_DX = 26;

const stroke = `stroke="${OL}" stroke-width="${OLW}" stroke-linejoin="round" stroke-linecap="round"`;

export const renderAvatarSVG = (config: AvatarConfig, size = 300): string => {
  const hair = renderHair(config);
  const w = Math.round(size * (300 / 380));
  const uid = hashId(config.id + config.selection.head);
  const headShape = headGeom(config.selection.head).path;
  return `
    <svg width="${w}" height="${size}" viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="head-${uid}">${headShape} /></clipPath></defs>
      <ellipse cx="${CX}" cy="366" rx="72" ry="12" fill="#000" opacity="0.10"/>
      ${hair.back}
      ${renderLegs(config, uid)}
      ${renderTorso(config, uid)}
      ${renderNeck(config)}
      ${renderEars(config)}
      ${renderHead(config)}
      ${renderFaceShadow(config, uid)}
      ${renderFace(config)}
      ${hair.front}
      ${renderAccessories(config)}
    </svg>
  `.trim();
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

// Small silhouette tweaks per body trait.
const bodyGeom = (c: AvatarConfig) => {
  const female = c.selection.gender === 'female';
  let shoulder = female ? 38 : 46; // half-width at shoulders
  let hip = female ? 42 : 42; // half-width at hips
  switch (c.selection.body) {
    case 'body_slim': shoulder -= 6; hip -= 5; break;
    case 'body_athletic': shoulder += 7; break;
    case 'body_curvy': hip += 8; break;
  }
  return { shoulder, hip, female };
};

const renderLegs = (c: AvatarConfig, uid: string): string => {
  const pants = c.colors.outfitSecondary;
  const shade = darken(pants, 13);
  const shoes = c.colors.accentColor;
  // each leg: base fill + inner-edge shadow + outer highlight (clipped to leg)
  const leg = (x: number, i: number) => `
    <rect x="${x}" y="258" width="27" height="90" rx="12" fill="${pants}" ${stroke}/>
    <clipPath id="leg-${uid}-${i}"><rect x="${x}" y="258" width="27" height="90" rx="12"/></clipPath>
    <g clip-path="url(#leg-${uid}-${i})">
      <rect x="${x + 16}" y="258" width="11" height="90" fill="${shade}" opacity="0.5"/>
      <rect x="${x + 2}" y="258" width="4" height="90" fill="${lighten(pants, 16)}" opacity="0.5"/>
    </g>`;
  // full-width rounded shoe that overlaps the leg bottom (no pinched ankle);
  // symmetric front-facing toe with a sole line.
  const shoe = (cx: number) => `
    <path d="M${cx - 15} 340 Q${cx - 17} 360 ${cx - 9} 367 Q${cx} 370 ${cx + 9} 367 Q${cx + 17} 360 ${cx + 15} 340 Z" fill="${shoes}" ${stroke}/>
    <path d="M${cx - 14} 361 Q${cx} 366 ${cx + 14} 361" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
    <path d="M${cx - 10} 348 Q${cx} 351 ${cx + 10} 348" fill="none" stroke="${lighten(shoes, 22)}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`;
  return `${leg(119, 0)}${leg(154, 1)}${shoe(132)}${shoe(167)}`;
};

const renderTorso = (c: AvatarConfig, uid: string): string => {
  const p = c.colors.outfitPrimary;
  const skin = c.colors.skinTone;
  const { shoulder, hip, female } = bodyGeom(c);
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
  // mitten hand; a short puffed sleeve caps the shoulder.
  const arm = (dir: 1 | -1) => {
    const topX = CX + dir * (shoulder - 2);
    const midX = CX + dir * (shoulder + 9);
    const handX = CX + dir * (shoulder + 6);
    const armPath = `M${topX} 196 Q${midX} 226 ${handX} 250`;
    return `
      <path d="${armPath}" fill="none" stroke="${OL}" stroke-width="20" stroke-linecap="round"/>
      <path d="${armPath}" fill="none" stroke="${skin}" stroke-width="15" stroke-linecap="round"/>
      <path d="${armPath}" fill="none" stroke="${lighten(skin, 12)}" stroke-width="4" stroke-linecap="round" opacity="0.4"/>
      <ellipse cx="${handX}" cy="256" rx="12" ry="13" fill="${skin}" ${stroke}/>
      <ellipse cx="${handX - dir * 9}" cy="252" rx="5.5" ry="6.5" fill="${skin}" ${stroke}/>
      <path d="M${CX + dir * (shoulder - 8)} 184 Q${CX + dir * (shoulder + 14)} 188 ${midX} 216" fill="none" stroke="${OL}" stroke-width="25" stroke-linecap="round"/>
      <path d="M${CX + dir * (shoulder - 8)} 184 Q${CX + dir * (shoulder + 14)} 188 ${midX} 216" fill="none" stroke="${p}" stroke-width="20" stroke-linecap="round"/>
      <path d="M${CX + dir * (shoulder - 6)} 190 Q${CX + dir * (shoulder + 10)} 194 ${midX - dir * 1} 214" fill="none" stroke="${lighten(p, 14)}" stroke-width="4" stroke-linecap="round" opacity="0.45"/>
      <path d="M${CX + dir * (shoulder + 2)} 214 Q${midX} 218 ${midX + dir * 3} 222" fill="none" stroke="${darken(p, 16)}" stroke-width="3" stroke-linecap="round" opacity="0.4"/>`;
  };

  return `${arm(-1)}${arm(1)}${torso}${outfitDetail(c, sl, sr)}`;
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

const renderNeck = (c: AvatarConfig): string =>
  `<path d="M138 148 L138 184 Q150 192 162 184 L162 148 Z" fill="${c.colors.skinTone}" ${stroke}/>`;

const renderEars = (c: AvatarConfig): string => {
  const { sideX } = headGeom(c.selection.head);
  const ear = (x: number) => `<circle cx="${x}" cy="104" r="10" fill="${c.colors.skinTone}" ${stroke}/>`;
  return `${ear(CX - sideX)}${ear(CX + sideX)}`;
};

/* ------------------------------- head ---------------------------- */

// sideX = half-width at ear level; topY = top of the skull; browW = half-width
// at the forehead/fringe line (~y88) so the fringe hugs the actual silhouette.
const headGeom = (shape: string): { sideX: number; topY: number; browW: number; path: string } => {
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

const renderHead = (c: AvatarConfig): string =>
  `${headGeom(c.selection.head).path} fill="${c.colors.skinTone}" ${stroke}/>`;

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
  const w = c.selection.gender === 'male' ? 7 : 5;
  let o = 84, i = 82; // outer / inner y
  if (e === 'expr_angry') { o = 80; i = 90; }
  else if (e === 'expr_sad') { o = 90; i = 80; }
  else if (e === 'expr_surprised') { o = 75; i = 73; }
  return `
    <path d="M${CX - 40} ${o} Q${CX - 28} ${i - 3} ${CX - 14} ${i}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>
    <path d="M${CX + 14} ${i} Q${CX + 28} ${i - 3} ${CX + 40} ${o}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
};

const renderEyes = (c: AvatarConfig): string => {
  const eye = c.colors.eyeColor;
  const e = c.selection.expression;
  const female = c.selection.gender === 'female';

  const open = (x: number) => {
    const dir = x < CX ? -1 : 1;
    const lash = female
      ? `<path d="M${x + dir * 10} ${EYE_Y - 9} q${dir * 5} -3 ${dir * 8} 0" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>`
      : '';
    return `
    <ellipse cx="${x}" cy="${EYE_Y}" rx="11" ry="13" fill="#fff" ${stroke}/>
    <circle cx="${x}" cy="${EYE_Y + 2}" r="7" fill="${eye}"/>
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
  const smile = `
    <path d="M${CX - 24} 132 Q${CX} 137 ${CX + 24} 132 Q${CX + 20} 156 ${CX} 159 Q${CX - 20} 156 ${CX - 24} 132 Z" fill="#8d3746" ${stroke}/>
    <path d="M${CX - 20} 134 Q${CX} 138 ${CX + 20} 134 L${CX + 17} 141 Q${CX} 145 ${CX - 17} 141 Z" fill="#fff"/>
    <path d="M${CX - 10} 152 Q${CX} 157 ${CX + 10} 152 Q${CX} 155 ${CX - 10} 152 Z" fill="#e07088"/>`;
  const mouths: Record<string, string> = {
    expr_happy: smile,
    expr_love: smile,
    expr_neutral: `<path d="M${CX - 15} 138 Q${CX} 146 ${CX + 15} 138" fill="none" ${stroke}/>`,
    expr_cool: `<path d="M${CX - 14} 138 Q${CX + 4} 148 ${CX + 17} 134" fill="none" ${stroke}/>`,
    expr_sad: `<path d="M${CX - 14} 144 Q${CX} 134 ${CX + 14} 144" fill="none" ${stroke}/>`,
    expr_angry: `<path d="M${CX - 14} 142 Q${CX} 137 ${CX + 14} 142" fill="none" ${stroke}/>`,
    expr_surprised: `<ellipse cx="${CX}" cy="142" rx="8" ry="11" fill="#8d3746" ${stroke}/>`,
    expr_wink: `<path d="M${CX - 15} 137 Q${CX} 149 ${CX + 17} 135" fill="none" ${stroke}/>`,
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

const renderHair = (c: AvatarConfig): HairLayers => {
  const col = c.colors.hairColor;
  const hi = lighten(col, 20);
  const { sideX, topY, browW } = headGeom(c.selection.head);
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
      Q${CX - w * 0.62} ${fr - 3} ${CX - w} ${fr - 6} Z" fill="${col}" ${stroke}/>`
    + `<path d="M${CX - w * 0.5} ${topY + 10} Q${CX - w * 0.1} ${peak + 8} ${CX + w * 0.25} ${peak + 12}" fill="none" stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>`;
  const back = (ry: number, cy: number) =>
    `<ellipse cx="${CX}" cy="${cy}" rx="${sideX + 16}" ry="${ry}" fill="${col}" ${stroke}/>`;

  switch (c.selection.hair) {
    case 'hair_short': return { back: '', front: cap };
    case 'hair_long': return { back: back(112, 128), front: cap };
    case 'hair_bob': return { back: back(72, 108), front: cap };
    case 'hair_wavy':
      return {
        back: `${back(104, 124)}${[86, 118, 182, 214].map((x) => `<circle cx="${x}" cy="222" r="16" fill="${col}" ${stroke}/>`).join('')}`,
        front: cap,
      };
    case 'hair_bun':
      return { back: `<circle cx="${CX}" cy="26" r="21" fill="${col}" ${stroke}/>`, front: cap };
    case 'hair_spiky':
      return { back: '', front: `${cap}<path d="M96 52 L110 14 L126 48 L142 12 L158 48 L174 14 L188 52 L200 26 L208 60 Z" fill="${col}" ${stroke}/>` };
    case 'hair_braids':
      // back hair mass; braids hang beside the face over the shoulders (front)
      return { back: back(58, 96), front: `${cap}${braid(84, col)}${braid(216, col)}` };
    case 'hair_curly': {
      // one cohesive scalloped afro (no messy internal outlines) + fringe + sheen
      const mass = `<path d="${scallop(CX, 84, 82, 84, 12)}" fill="${col}" ${stroke}/>`;
      const fringe = `<path d="${scallop(CX, 66, 62, 30, 9)}" fill="${col}"/>`;
      const sheen = `<path d="${scallop(CX - 22, 60, 30, 22, 6)}" fill="${lighten(col, 18)}" opacity="0.5"/>`;
      return { back: mass, front: `${fringe}${sheen}` };
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
const braid = (bx: number, col: string): string => {
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
        + `<ellipse cx="${bx}" cy="${k.y}" rx="${k.rx}" ry="${k.ry}" fill="${col}" ${stroke}/>`
        + `<ellipse cx="${bx - k.rx * 0.3}" cy="${k.y - k.ry * 0.3}" rx="${k.rx * 0.4}" ry="${k.ry * 0.4}" fill="${hi}" opacity="0.45"/>`
        + `</g>`;
    })
    .join('');
  const tie = `<rect x="${bx - 7}" y="${botY - 4}" width="14" height="7" rx="3" fill="${darken(col, 22)}" ${stroke}/>`;
  const tassel = [-4, 0, 4].map((dx) => `<path d="M${bx + dx} ${botY + 2} q${dx * 0.5} 7 ${dx * 0.6} 12" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`).join('');
  return `${seg}${tie}${tassel}`;
};

/* --------------------------- accessories ------------------------- */

const renderAccessories = (c: AvatarConfig): string => {
  const acc = c.selection.accessories;
  const a = c.colors.accentColor;
  const { sideX } = headGeom(c.selection.head);
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
