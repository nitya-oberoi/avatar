/**
 * Avatar Renderer — flat, bold-outlined cartoon (Bitmoji-style) SVG.
 *
 * Bitmoji's look = big head, small body, flat colours, thick dark outlines,
 * simple expressive features, big friendly smile. All drawn in a fixed
 * 0..300 space and scaled by the viewBox. Every config field maps here.
 *
 * Layers back→front: back-hair, body, neck, ears, head, face, front-hair, accessories.
 */

import { AvatarConfig } from '@apptypes/avatar';

const CX = 150;
const HEAD_CY = 118;
const OL = '#33251f'; // outline colour
const OLW = 3.5; // outline width
const EYE_Y = 120;
const EYE_DX = 30;

const stroke = `stroke="${OL}" stroke-width="${OLW}" stroke-linejoin="round" stroke-linecap="round"`;

export const renderAvatarSVG = (config: AvatarConfig, size = 300): string => {
  const hair = renderHair(config);
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      ${hair.back}
      ${renderBody(config)}
      ${renderNeck(config)}
      ${renderEars(config)}
      ${renderHead(config)}
      ${renderFace(config)}
      ${hair.front}
      ${renderAccessories(config)}
    </svg>
  `.trim();
};

/* ------------------------------- body ---------------------------- */

const renderBody = (c: AvatarConfig): string => {
  const p = c.colors.outfitPrimary;
  const s = c.colors.outfitSecondary;
  const a = c.colors.accentColor;
  // Male = broader, squarer shoulders; female = narrower, softer.
  const shoulders =
    c.selection.gender === 'male'
      ? `<path d="M28 300 Q30 236 150 226 Q270 236 272 300 Z" fill="${p}" ${stroke}/>`
      : `<path d="M46 300 Q50 234 150 226 Q250 234 254 300 Z" fill="${p}" ${stroke}/>`;

  const collars: Record<string, string> = {
    outfit_casual: `<path d="M118 228 Q150 250 182 228" fill="none" ${stroke}/>`,
    outfit_formal: `<path d="M126 226 L150 262 L174 226" fill="none" ${stroke}/><path d="M148 260 L150 300 L152 260 Z" fill="${a}" ${stroke}/>`,
    outfit_sporty: `<path d="M120 230 Q150 250 180 230" fill="none" ${stroke}/><path d="M150 250 L150 300" ${stroke}/>`,
    outfit_magical: `<path d="M118 228 Q150 250 182 228" fill="none" ${stroke}/><path d="M150 250 l5 12 12 2 -9 9 3 13 -11 -7 -11 7 3 -13 -9 -9 12 -2 Z" fill="${a}" ${stroke}/>`,
    outfit_explorer: `<path d="M118 228 Q150 250 182 228" fill="none" ${stroke}/><rect x="145" y="252" width="10" height="46" rx="4" fill="${s}" ${stroke}/>`,
    outfit_futuristic: `<path d="M122 228 L150 258 L178 228" fill="none" ${stroke}/><circle cx="150" cy="284" r="7" fill="${a}" ${stroke}/>`,
    outfit_vintage: `<path d="M120 226 Q150 240 180 226" fill="none" ${stroke}/>`,
    outfit_boho: `<path d="M116 230 Q150 256 184 230" fill="none" ${stroke}/><circle cx="150" cy="272" r="4" fill="${a}"/>`,
  };
  return `<g>${shoulders}${collars[c.selection.outfit] || collars.outfit_casual}</g>`;
};

const renderNeck = (c: AvatarConfig): string => {
  const skin = c.colors.skinTone;
  return `<path d="M128 186 L128 232 Q150 244 172 232 L172 186 Z" fill="${skin}" ${stroke}/>
          <path d="M128 200 Q150 214 172 200 L172 190 Q150 202 128 190 Z" fill="${darken(skin, 12)}" opacity="0.4"/>`;
};

const renderEars = (c: AvatarConfig): string => {
  const skin = c.colors.skinTone;
  const { sideX } = headGeom(c.selection.head);
  const ear = (x: number) =>
    `<circle cx="${x}" cy="126" r="12" fill="${skin}" ${stroke}/>`;
  return `${ear(CX - sideX)}${ear(CX + sideX)}`;
};

/* ------------------------------- head ---------------------------- */

const headGeom = (shape: string): { sideX: number; path: string } => {
  switch (shape) {
    case 'head_oval':
      return { sideX: 62, path: ellipse(CX, HEAD_CY, 62, 84) };
    case 'head_square':
      return { sideX: 70, path: `<rect x="80" y="40" width="140" height="150" rx="42"` };
    case 'head_heart':
      return { sideX: 72, path: `<path d="M78 100 Q75 44 150 42 Q225 44 222 100 Q216 156 150 194 Q84 156 78 100 Z"` };
    case 'head_diamond':
      return { sideX: 70, path: `<path d="M150 40 Q216 70 220 118 Q216 172 150 196 Q84 172 80 118 Q84 70 150 40 Z"` };
    default:
      return { sideX: 72, path: ellipse(CX, HEAD_CY, 72, 82) };
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
  const w = c.selection.gender === 'male' ? 8 : 5.5; // male = thicker brows
  let o = 98, i = 96; // outer/inner y
  if (e === 'expr_angry') { o = 94; i = 104; }
  else if (e === 'expr_sad') { o = 104; i = 94; }
  else if (e === 'expr_surprised') { o = 88; i = 86; }
  return `
    <path d="M${CX - 44} ${o} Q${CX - 30} ${i - 3} ${CX - 15} ${i}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>
    <path d="M${CX + 15} ${i} Q${CX + 30} ${i - 3} ${CX + 44} ${o}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
};

const renderEyes = (c: AvatarConfig): string => {
  const eye = c.colors.eyeColor;
  const e = c.selection.expression;
  const female = c.selection.gender === 'female';

  const open = (x: number) => {
    const dir = x < CX ? -1 : 1; // lash flicks toward the outer corner
    const lash = female
      ? `<path d="M${x + dir * 12} ${EYE_Y - 10} q${dir * 6} -3 ${dir * 9} 1" fill="none" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>`
      : '';
    return `
    <ellipse cx="${x}" cy="${EYE_Y}" rx="13" ry="16" fill="#fff" ${stroke}/>
    <circle cx="${x}" cy="${EYE_Y + 3}" r="9" fill="${eye}"/>
    <circle cx="${x}" cy="${EYE_Y + 3}" r="4.5" fill="#1a1512"/>
    <circle cx="${x - 4}" cy="${EYE_Y - 3}" r="3.5" fill="#fff"/>
    ${lash}`;
  };

  const happyClosed = (x: number) => `
    <path d="M${x - 13} ${EYE_Y + 4} Q${x} ${EYE_Y - 10} ${x + 13} ${EYE_Y + 4}" fill="none" stroke="${OL}" stroke-width="4" stroke-linecap="round"/>`;

  const L = CX - EYE_DX, R = CX + EYE_DX;
  if (e === 'expr_wink') return `${open(L)}${happyClosed(R)}`;
  if (e === 'expr_happy' || e === 'expr_love') return `${happyClosed(L)}${happyClosed(R)}`;
  return `${open(L)}${open(R)}`;
};

const renderNose = (c: AvatarConfig): string =>
  `<path d="M${CX - 5} 136 Q${CX} 144 ${CX + 5} 136" fill="none" stroke="${darken(c.colors.skinTone, 22)}" stroke-width="3" stroke-linecap="round"/>`;

const renderMouth = (c: AvatarConfig): string => {
  const y = 158;
  const e = c.selection.expression;
  const smile = `
    <path d="M${CX - 26} ${y - 2} Q${CX} ${y + 4} ${CX + 26} ${y - 2} Q${CX} ${y + 30} ${CX - 26} ${y - 2} Z" fill="#7a2e3a" ${stroke}/>
    <path d="M${CX - 22} ${y} Q${CX} ${y + 4} ${CX + 22} ${y} L${CX + 18} ${y + 9} Q${CX} ${y + 12} ${CX - 18} ${y + 9} Z" fill="#fff"/>
    <path d="M${CX - 12} ${y + 20} Q${CX} ${y + 26} ${CX + 12} ${y + 20} Q${CX} ${y + 24} ${CX - 12} ${y + 20} Z" fill="#e07088"/>`;
  const mouths: Record<string, string> = {
    expr_happy: smile,
    expr_love: smile,
    expr_neutral: `<path d="M${CX - 18} ${y + 4} Q${CX} ${y + 14} ${CX + 18} ${y + 4}" fill="none" ${stroke}/>`,
    expr_cool: `<path d="M${CX - 18} ${y + 2} Q${CX + 4} ${y + 14} ${CX + 20} ${y - 2}" fill="none" ${stroke}/>`,
    expr_sad: `<path d="M${CX - 16} ${y + 10} Q${CX} ${y} ${CX + 16} ${y + 10}" fill="none" ${stroke}/>`,
    expr_angry: `<path d="M${CX - 16} ${y + 8} Q${CX} ${y + 2} ${CX + 16} ${y + 8}" fill="none" ${stroke}/>`,
    expr_surprised: `<ellipse cx="${CX}" cy="${y + 8}" rx="9" ry="12" fill="#7a2e3a" ${stroke}/>`,
    expr_wink: `<path d="M${CX - 18} ${y + 2} Q${CX} ${y + 16} ${CX + 20} ${y}" fill="none" ${stroke}/>`,
  };
  return mouths[e] || mouths.expr_neutral;
};

const renderBlush = (c: AvatarConfig): string => {
  const op = c.selection.gender === 'female' ? 0.55 : 0.25; // subtler on male
  return `
  <ellipse cx="${CX - 46}" cy="146" rx="12" ry="7" fill="#ff9db0" opacity="${op}"/>
  <ellipse cx="${CX + 46}" cy="146" rx="12" ry="7" fill="#ff9db0" opacity="${op}"/>`;
};

/* ------------------------------- hair ---------------------------- */

interface HairLayers { back: string; front: string; }

const renderHair = (c: AvatarConfig): HairLayers => {
  const col = c.colors.hairColor;
  // Front cap: covers crown, fringe stops above the brows (~y88).
  const cap = `<path d="M74 100 Q60 26 150 22 Q240 26 226 100 Q198 88 172 96 Q150 78 128 96 Q102 88 74 100 Z" fill="${col}" ${stroke}/>`;
  const back = (ry: number, cy: number) =>
    `<ellipse cx="${CX}" cy="${cy}" rx="90" ry="${ry}" fill="${col}" ${stroke}/>`;

  switch (c.selection.hair) {
    case 'hair_short': return { back: '', front: cap };
    case 'hair_long': return { back: back(108, 150), front: cap };
    case 'hair_bob': return { back: back(84, 128), front: cap };
    case 'hair_wavy': return { back: back(104, 148), front: cap };
    case 'hair_bun':
      return { back: `<circle cx="${CX}" cy="40" r="24" fill="${col}" ${stroke}/>`, front: cap };
    case 'hair_spiky':
      return { back: '', front: `${cap}<path d="M88 56 L104 18 L122 54 L140 16 L156 54 L174 18 L190 58 L206 26 L216 62 Z" fill="${col}" ${stroke}/>` };
    case 'hair_braids':
      return { back: `${back(72, 116)}${braid(72, col)}${braid(228, col)}`, front: cap };
    case 'hair_curly':
      return {
        back: [[86,96],[78,128],[86,160],[214,96],[222,128],[214,160],[150,38],[110,42],[190,42]]
          .map(([x,y]) => `<circle cx="${x}" cy="${y}" r="24" fill="${col}" ${stroke}/>`).join(''),
        front: [[110,68],[150,54],[190,68],[128,80],[172,80]]
          .map(([x,y]) => `<circle cx="${x}" cy="${y}" r="20" fill="${col}" ${stroke}/>`).join(''),
      };
    default: return { back: back(108, 150), front: cap };
  }
};

const braid = (x: number, col: string): string => {
  const s = x < CX ? -1 : 1;
  return [[0,152,14],[3,178,13],[6,204,12],[9,228,10]]
    .map(([dx,y,r]) => `<circle cx="${x + s*dx}" cy="${y}" r="${r}" fill="${col}" ${stroke}/>`).join('');
};

/* --------------------------- accessories ------------------------- */

const renderAccessories = (c: AvatarConfig): string => {
  const acc = c.selection.accessories;
  const a = c.colors.accentColor;
  const has = (id: string) => acc.includes(id);
  let out = '';

  if (has('acc_glasses') || has('acc_sunglasses')) {
    const lens = has('acc_sunglasses') ? '#2a2320' : '#ffffff';
    const op = has('acc_sunglasses') ? '1' : '0.15';
    out += `
      <rect x="${CX - 46}" y="${EYE_Y - 14}" width="32" height="28" rx="10" fill="${lens}" fill-opacity="${op}" stroke="${a}" stroke-width="4"/>
      <rect x="${CX + 14}" y="${EYE_Y - 14}" width="32" height="28" rx="10" fill="${lens}" fill-opacity="${op}" stroke="${a}" stroke-width="4"/>
      <path d="M${CX - 14} ${EYE_Y} L${CX + 14} ${EYE_Y}" stroke="${a}" stroke-width="4"/>`;
  }
  if (has('acc_hat') || has('acc_cap')) {
    out += `<path d="M66 58 Q150 18 234 58 L240 74 Q150 52 60 74 Z" fill="${a}" ${stroke}/>`;
  }
  if (has('acc_crown') || has('acc_tiara')) {
    out += `<path d="M104 56 L116 26 L134 50 L150 20 L166 50 L184 26 L196 56 Z" fill="${a}" ${stroke}/>`;
  }
  return out;
};

/* ------------------------------- utils --------------------------- */

const ellipse = (cx: number, cy: number, rx: number, ry: number): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"`;

const darken = (color: string, percent: number): string => {
  if (!/^#?[0-9a-fA-F]{6}$/.test(color)) return color;
  const n = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const cl = (v: number) => Math.max(0, Math.min(255, v));
  const R = cl((n >> 16) - amt), G = cl(((n >> 8) & 0xff) - amt), B = cl((n & 0xff) - amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};
