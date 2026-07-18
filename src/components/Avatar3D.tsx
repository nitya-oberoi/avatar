/**
 * Avatar3D — Path B: in-app 3D avatar customizer (slot compositor).
 *
 * The Quaternius CC0 packs give whole themed characters that all share one
 * 62-bone skeleton, each exposing named parts (_Head / _Body / _Legs|Pants /
 * _Feet). We compose across them: the OUTFIT panel picks the character that
 * supplies top/bottom/shoes; the HAIR panel picks a character whose _Head
 * (baked hairstyle + face) is shown. We render both cloned characters, hide
 * the meshes we don't want from each, and drive both animation mixers off the
 * same clock so the grafted head stays locked to the body. Everything is
 * toon-shaded and tinted live from the palette.
 *
 * Must be loaded with next/dynamic({ ssr: false }) — WebGL.
 */

import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { useAvatarStore } from '@stores/avatarStore';
import { AvatarColors } from '@apptypes/avatar';

type Gender = 'male' | 'female';

// Which character supplies the clothes (body + legs + feet) per outfit id.
const OUTFIT_CHAR: Record<Gender, Record<string, string>> = {
  male: { casual: 'Casual_2', formal: 'Suit', sporty: 'Casual_Hoodie', magical: 'King', explorer: 'Adventurer', futuristic: 'Spacesuit', vintage: 'Farmer', boho: 'Worker' },
  female: { casual: 'Casual', formal: 'Formal', sporty: 'Adventurer', magical: 'Medieval', explorer: 'Soldier', futuristic: 'SciFi', vintage: 'Punk', boho: 'Punk' },
};
// Which character supplies the head (baked hairstyle) per hair id.
const HEAD_CHAR: Record<Gender, Record<string, string>> = {
  male: { short: 'Casual_2', long: 'Punk', bob: 'Casual_Hoodie', wavy: 'Beach', bun: 'King', spiky: 'Swat', braids: 'Farmer', curly: 'Worker' },
  female: { short: 'Casual', long: 'Adventurer', bob: 'Formal', wavy: 'SciFi', bun: 'Formal', braids: 'Medieval', spiky: 'Punk', curly: 'Soldier' },
};
// Body-type → non-uniform scale on the whole avatar (shape + size). Applied to
// both clones together so the grafted head stays aligned with the body.
const BODY_SCALE: Record<string, [number, number, number]> = {
  body_petite: [0.85, 0.9, 0.85],
  body_slim: [0.9, 1.02, 0.9],
  body_standard: [1, 1, 1],
  body_athletic: [1.09, 1.0, 1.0],
  body_curvy: [1.13, 0.98, 1.08],
  body_broad: [1.18, 1.0, 1.05],
  body_plus: [1.2, 1.0, 1.16],
  body_round: [1.3, 0.98, 1.22],
};
const DEFAULT_CHAR: Record<Gender, string> = { male: 'Casual_2', female: 'Casual' };
const ALL_CHARS: Record<Gender, string[]> = {
  male: ['Adventurer', 'Beach', 'Casual_2', 'Casual_Hoodie', 'Farmer', 'King', 'Punk', 'Spacesuit', 'Suit', 'Swat', 'Worker'],
  female: ['Adventurer', 'Casual', 'Formal', 'Medieval', 'Punk', 'SciFi', 'Soldier'],
};

const path = (g: Gender, c: string) => `/models/parts/${g}/${c}.gltf`;
const strip = (id: string) => id.replace(/^[a-z]+_/, '');

// 3-step toon ramp shared by every material.
const gradientMap = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
gradientMap.needsUpdate = true;

type Slot = 'head' | 'body' | 'legs' | 'feet' | null;
const nameToSlot = (name: string): Slot => {
  const n = name.toLowerCase();
  if (n.includes('head')) return 'head';
  if (n.includes('body')) return 'body';
  if (n.includes('legs') || n.includes('pants')) return 'legs';
  if (n.includes('feet')) return 'feet';
  return null; // Backpack / Pistol / Sword, or a bare "Cube.NNN" primitive
};
// Multi-material parts load as a GROUP named "<Char>_Body" whose child meshes
// are bare "Cube.NNN"; single-material parts are a directly-named mesh. So walk
// up the ancestry to find the descriptive part name.
const slotOf = (o: THREE.Object3D): Slot => {
  let n: THREE.Object3D | null = o;
  while (n) {
    const s = nameToSlot(n.name);
    if (s) return s;
    n = n.parent;
  }
  return null;
};

const colorFor = (mat: string, slot: string, c: AvatarColors): string | null => {
  const m = mat.toLowerCase();
  if (m.includes('skin')) return c.skinTone;
  if (m.includes('hair') || m.includes('eyebrow')) return c.hairColor;
  if (m.includes('eye')) return c.eyeColor;
  if (slot === 'head') return null; // leave remaining head detail as-authored
  if (slot === 'body') return c.outfitPrimary;
  if (slot === 'legs') return c.outfitSecondary;
  if (slot === 'feet') return c.accentColor;
  return null;
};

// toon-convert + tint every mesh in a clone, keeping only `keep` slots visible.
const dressClone = (root: THREE.Object3D, keep: (s: string | null) => boolean, colors: AvatarColors) => {
  root.traverse((o) => {
    const mesh = o as THREE.SkinnedMesh;
    if (!(mesh as any).isSkinnedMesh) return;
    const slot = slotOf(mesh);
    mesh.visible = keep(slot);
    if (!mesh.visible) return;
    const conv = (m: THREE.Material): THREE.Material => {
      const toon = (m as any).isMeshToonMaterial
        ? (m as THREE.MeshToonMaterial)
        : Object.assign(new THREE.MeshToonMaterial({ gradientMap }), {
            name: m.name,
            color: ((m as any).color as THREE.Color | undefined)?.clone() ?? new THREE.Color('#fff'),
          });
      const hex = colorFor(toon.name, slot ?? '', colors);
      if (hex) toon.color.set(hex);
      return toon;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(conv) : conv(mesh.material);
  });
  const head = root.getObjectByName('Head'); // chibi proportions
  if (head) head.scale.setScalar(1.3);
};

const makeMixer = (root: THREE.Object3D, clips: THREE.AnimationClip[]) => {
  const mixer = new THREE.AnimationMixer(root);
  const clip = THREE.AnimationClip.findByName(clips, 'Idle') || clips.find((c) => /idle/i.test(c.name)) || clips[0];
  if (clip) mixer.clipAction(clip).play();
  return mixer;
};

function Model() {
  const gender = useAvatarStore((s) => s.config.selection.gender) as Gender;
  const colors = useAvatarStore((s) => s.config.colors);
  const outfit = useAvatarStore((s) => s.config.selection.outfit);
  const hair = useAvatarStore((s) => s.config.selection.hair);
  const body = useAvatarStore((s) => s.config.selection.body);

  const chars = ALL_CHARS[gender];
  const outfitName = chars.includes(OUTFIT_CHAR[gender][strip(outfit)]) ? OUTFIT_CHAR[gender][strip(outfit)] : DEFAULT_CHAR[gender];
  const headName = chars.includes(HEAD_CHAR[gender][strip(hair)]) ? HEAD_CHAR[gender][strip(hair)] : outfitName;

  const outfitG = useGLTF(path(gender, outfitName));
  const headG = useGLTF(path(gender, headName));

  // Body clone: everything except the head. Head clone: only the head.
  const bodyClone = useMemo(() => SkeletonUtils.clone(outfitG.scene) as THREE.Object3D, [outfitG]);
  const headClone = useMemo(() => SkeletonUtils.clone(headG.scene) as THREE.Object3D, [headG]);

  useEffect(() => { dressClone(bodyClone, (s) => s !== null && s !== 'head', colors); }, [bodyClone, colors]);
  useEffect(() => { dressClone(headClone, (s) => s === 'head', colors); }, [headClone, colors]);

  // Two mixers, same clock → grafted head stays locked to the body.
  const mixers = useMemo(
    () => [makeMixer(bodyClone, outfitG.animations), makeMixer(headClone, headG.animations)],
    [bodyClone, headClone, outfitG.animations, headG.animations],
  );
  useFrame((_, dt) => mixers.forEach((m) => m.update(dt)));

  const scale = BODY_SCALE[body] ?? [1, 1, 1];
  return (
    <group scale={scale}>
      <primitive object={bodyClone} />
      <primitive object={headClone} />
    </group>
  );
}

// Warm the cache so swaps are instant.
[...ALL_CHARS.male.map((c) => path('male', c)), ...ALL_CHARS.female.map((c) => path('female', c))]
  .forEach((p) => useGLTF.preload(p));

const Avatar3D: React.FC = () => (
  <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.1, 4], fov: 30 }} gl={{ alpha: true }}>
    <ambientLight intensity={1.1} />
    <directionalLight position={[3, 5, 4]} intensity={1.4} />
    <Suspense fallback={null}>
      <Model />
    </Suspense>
    <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={4} blur={2.5} far={3} />
    <OrbitControls enablePan={false} minDistance={1.5} maxDistance={7} target={[0, 1, 0]} />
  </Canvas>
);

export default Avatar3D;
