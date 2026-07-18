/**
 * VRMAvatar — primary 3D avatar (cute VRoid style, expression-capable).
 *
 * Loads the official VRoid sample characters (male/female per gender toggle,
 * or any uploaded .vrm) and drives everything from the store:
 *   expression → VRM blendshapes (+ auto-blink)
 *   colors     → MToon material tints by VRoid material name
 *                (_HAIR/Brow → hair, EyeIris → eye, _SKIN → skin,
 *                 Tops → primary, Bottoms → secondary, Shoes/Accessory → accent)
 *   body type  → shape/size scale
 * Tints multiply the base texture, so they shade toward the chosen color
 * rather than flat-replacing it (free-asset limitation).
 *
 * Must be loaded with next/dynamic({ ssr: false }) — WebGL.
 */

import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { GLTFLoader } from 'three-stdlib';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { useAvatarStore } from '@stores/avatarStore';
import { AvatarColors } from '@apptypes/avatar';

// Our expression ids -> VRM preset expression names (three-vrm normalizes
// VRM0 presets: joy→happy, sorrow→sad, fun→relaxed).
const EXPR: Record<string, string> = {
  expr_happy: 'happy',
  expr_love: 'happy',
  expr_sad: 'sad',
  expr_angry: 'angry',
  expr_surprised: 'surprised',
  expr_cool: 'relaxed',
  expr_wink: 'blinkLeft',
  expr_neutral: 'neutral',
};
const RESET = ['happy', 'sad', 'angry', 'surprised', 'relaxed', 'neutral', 'blinkLeft', 'aa'];

// Body-type → shape/size scale (matches the Quaternius 3D path).
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

// Head-shape → head-bone scale so the Head panel visibly reshapes the 3D face.
const HEAD_SCALE: Record<string, [number, number, number]> = {
  head_round: [1.06, 1.0, 1.04],
  head_oval: [0.96, 1.1, 0.96],
  head_square: [1.08, 0.98, 1.0],
  head_heart: [1.08, 1.02, 0.98],
  head_diamond: [0.92, 1.06, 0.92],
};

// VRoid material name → which palette color tints it.
const colorFor = (mat: string, c: AvatarColors): string | null => {
  if (/HAIR|FaceBrow/i.test(mat)) return c.hairColor;
  if (/EyeIris/i.test(mat)) return c.eyeColor;
  if (/_SKIN/i.test(mat)) return c.skinTone;
  if (/Tops/i.test(mat)) return c.outfitPrimary;
  if (/Bottoms/i.test(mat)) return c.outfitSecondary;
  if (/Shoes|Accessory/i.test(mat)) return c.accentColor;
  return null; // eye whites, mouth, eyelines: leave as authored
};

function VRMModel({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    // three-stdlib and three-vrm ship slightly different GLTF @types; they're
    // runtime-compatible, so cast to bridge the type gap.
    (loader as any).register((parser: any) => new VRMLoaderPlugin(parser));
  });
  // vrm is present for .vrm files; plain GLB has none.
  const vrm = gltf.userData.vrm as VRM | undefined;
  const object = vrm?.scene ?? gltf.scene;
  const expr = useAvatarStore((s) => s.config.selection.expression);
  const body = useAvatarStore((s) => s.config.selection.body);
  const head = useAvatarStore((s) => s.config.selection.head);
  const colors = useAvatarStore((s) => s.config.colors);
  const group = useRef<THREE.Group>(null);
  const scale = BODY_SCALE[body] ?? [1, 1, 1];

  useEffect(() => {
    if (vrm) VRMUtils.rotateVRM0(vrm); // face +Z for VRM 0.x models
    return () => { if (vrm) VRMUtils.deepDispose(vrm.scene); };
  }, [vrm]);

  // Live palette tint on MToon materials, by VRoid material name.
  useEffect(() => {
    object.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!(mesh as any).isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        const hex = colorFor(m.name, colors);
        if (!hex) return;
        const anyM = m as any;
        if (anyM.color) anyM.color.set(hex);
        // MToon shade color: darker version of the tint for consistent toning
        if (anyM.shadeColorFactor) anyM.shadeColorFactor.set(hex).multiplyScalar(0.75);
      });
    });
  }, [object, colors]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // gentle whole-model breathing bob (works for VRM and plain GLB)
    if (group.current) group.current.position.y = Math.sin(t * 1.6) * 0.008;

    if (!vrm) return; // plain GLB: no expressions/bones below
    const em = vrm.expressionManager;
    if (em) {
      RESET.forEach((n) => em.setValue(n, 0));
      em.setValue(EXPR[expr] || 'neutral', 1);
      // VRM0 samples have no 'surprised' preset — approximate with open mouth
      if (expr === 'expr_surprised') em.setValue('aa', 0.7);
      // cheap auto-blink: a quick dip every ~4s
      const b = t % 4;
      em.setValue('blink', b > 3.85 ? 1 - Math.abs((b - 3.925) / 0.075) : 0);
    }
    // bring arms down out of the T-pose rest into a relaxed A-pose
    // (VRM0 normalized rigs need the opposite sign from VRM1)
    const dir = (vrm.meta as any)?.metaVersion === '0' ? -1 : 1;
    const la = vrm.humanoid?.getNormalizedBoneNode('leftUpperArm');
    const ra = vrm.humanoid?.getNormalizedBoneNode('rightUpperArm');
    if (la) la.rotation.z = dir * -1.15;
    if (ra) ra.rotation.z = dir * 1.15;
    // idle sway on spine + head so it feels alive
    const spine = vrm.humanoid?.getNormalizedBoneNode('spine');
    if (spine) spine.rotation.z = Math.sin(t * 1.6) * 0.015;
    const headBone = vrm.humanoid?.getNormalizedBoneNode('head');
    if (headBone) {
      headBone.rotation.y = Math.sin(t * 0.7) * 0.06;
      const hs = HEAD_SCALE[head] ?? [1, 1, 1];
      headBone.scale.set(hs[0], hs[1], hs[2]);
    }
    vrm.update(delta);
  });

  return <group ref={group} scale={scale}><primitive object={object} /></group>;
}

const VRMAvatar: React.FC = () => {
  const gender = useAvatarStore((s) => s.config.selection.gender);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  // Gender toggle picks the VRoid sample character; an upload overrides it.
  const url = fileUrl ?? `/models/${gender}.vrm`;

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileUrl(URL.createObjectURL(file));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.1, 4], fov: 30 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        <Suspense fallback={null}>
          <VRMModel key={url} url={url} />
        </Suspense>
        <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={4} blur={2.5} far={3} />
        <OrbitControls enablePan={false} minDistance={1.5} maxDistance={7} target={[0, 1, 0]} />
      </Canvas>

      <label style={pickerBtn}>
        Upload .vrm/.glb
        <input type="file" accept=".vrm,.glb,.gltf" onChange={onFile} style={{ display: 'none' }} />
      </label>
    </div>
  );
};

const pickerBtn: React.CSSProperties = {
  position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
  background: 'rgba(255,255,255,0.9)', color: '#4b3fa0', fontWeight: 600, fontSize: 13,
  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
};

export default VRMAvatar;
