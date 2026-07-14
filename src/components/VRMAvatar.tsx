/**
 * VRMAvatar
 * Loads and displays a real VRM avatar (e.g. exported from VRoid) using
 * @pixiv/three-vrm — the same engine CharacterStudio wraps. Drives the
 * avatar's expression from our store and auto-blinks. Load a .vrm via the
 * file picker (export one from VRoid Studio).
 *
 * ponytail: uses three-vrm directly instead of porting CharacterStudio's
 * blockchain/NFT-coupled characterManager. Add trait-swapping only if we
 * actually build a modular VRM asset pack.
 *
 * Must be loaded with next/dynamic({ ssr: false }) — WebGL.
 */

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { GLTFLoader } from 'three-stdlib';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { useAvatarStore } from '@stores/avatarStore';

// Our expression ids -> VRM preset expression names.
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
const RESET = ['happy', 'sad', 'angry', 'surprised', 'relaxed', 'neutral', 'blinkLeft'];

function VRMModel({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    // three-stdlib and three-vrm ship slightly different GLTF @types; they're
    // runtime-compatible, so cast to bridge the type gap. ponytail: cast, not
    // a transpilePackages config change.
    (loader as any).register((parser: any) => new VRMLoaderPlugin(parser));
  });
  // vrm is present for .vrm files; plain GLB (e.g. Quaternius) has none.
  const vrm = gltf.userData.vrm as VRM | undefined;
  const object = vrm?.scene ?? gltf.scene;
  const expr = useAvatarStore((s) => s.config.selection.expression);

  useEffect(() => {
    if (vrm) VRMUtils.rotateVRM0(vrm); // face +Z for VRM 0.x models
    return () => { if (vrm) VRMUtils.deepDispose(vrm.scene); };
  }, [vrm]);

  useFrame((state, delta) => {
    if (!vrm) return; // plain GLB: no expressions/update loop
    const em = vrm.expressionManager;
    if (em) {
      RESET.forEach((n) => em.setValue(n, 0));
      em.setValue(EXPR[expr] || 'neutral', 1);
      // cheap auto-blink: a quick dip every ~4s
      const t = state.clock.elapsedTime % 4;
      em.setValue('blink', t > 3.85 ? 1 - Math.abs((t - 3.925) / 0.075) : 0);
    }
    vrm.update(delta);
  });

  return <primitive object={object} />;
}

const VRMAvatar: React.FC = () => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUrl(URL.createObjectURL(file));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.2, 3], fov: 30 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        {url && (
          <Suspense fallback={null}>
            <VRMModel url={url} />
          </Suspense>
        )}
        <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={4} blur={2.5} far={3} />
        <OrbitControls enablePan={false} minDistance={1.5} maxDistance={6} target={[0, 1, 0]} />
      </Canvas>

      {!url && (
        <div style={overlay}>
          <p style={{ margin: 0, fontWeight: 600 }}>Load a .vrm or .glb avatar</p>
          <p style={{ margin: '4px 0 12px', fontSize: 12, opacity: 0.8 }}>VRoid export (.vrm) or a Quaternius CC0 base (.glb)</p>
        </div>
      )}

      <label style={pickerBtn}>
        {url ? 'Change .vrm' : 'Choose .vrm'}
        <input type="file" accept=".vrm,.glb" onChange={onFile} style={{ display: 'none' }} />
      </label>
    </div>
  );
};

const overlay: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', pointerEvents: 'none',
};
const pickerBtn: React.CSSProperties = {
  position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
  background: 'rgba(255,255,255,0.9)', color: '#4b3fa0', fontWeight: 600, fontSize: 13,
  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
};

export default VRMAvatar;
