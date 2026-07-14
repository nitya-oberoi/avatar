/**
 * Avatar3D
 * A procedural 3D cartoon avatar built from Three.js primitives and driven
 * by the shared avatar config. Rotatable via OrbitControls.
 *
 * This is intentionally asset-free (no GLB models) so it works out of the
 * box. Every config field maps to geometry/material here, and real rigged
 * models can later replace these primitives behind the same data model.
 *
 * Must be loaded with next/dynamic({ ssr: false }) — it touches WebGL.
 */

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, RoundedBox } from '@react-three/drei';
import { useAvatarStore } from '@stores/avatarStore';
import { AvatarConfig } from '@apptypes/avatar';

const HEAD_Y = 1.35;
const HEAD_R = 1;

/* ----------------------------- Head ------------------------------ */

const HEAD_SCALES: Record<string, [number, number, number]> = {
  head_round: [1, 1, 1],
  head_oval: [0.9, 1.14, 0.95],
  head_heart: [1.08, 1.0, 0.98],
  head_diamond: [0.94, 1.1, 0.9],
};

const Head: React.FC<{ shape: string; skin: string }> = ({ shape, skin }) => {
  if (shape === 'head_square') {
    return (
      <RoundedBox
        args={[1.7, 1.95, 1.7]}
        radius={0.5}
        smoothness={6}
        position={[0, HEAD_Y, 0]}
      >
        <meshStandardMaterial color={skin} roughness={0.7} />
      </RoundedBox>
    );
  }
  const scale = HEAD_SCALES[shape] ?? HEAD_SCALES.head_round;
  return (
    <mesh position={[0, HEAD_Y, 0]} scale={scale}>
      <sphereGeometry args={[HEAD_R, 64, 64]} />
      <meshStandardMaterial color={skin} roughness={0.7} />
    </mesh>
  );
};

const Ears: React.FC<{ skin: string }> = ({ skin }) => (
  <>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.95, HEAD_Y - 0.05, 0.05]} scale={[0.5, 0.7, 0.5]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
    ))}
  </>
);

/* ----------------------------- Eyes ------------------------------ */

const Eye: React.FC<{ x: number; eyeColor: string }> = ({ x, eyeColor }) => (
  <group position={[x, HEAD_Y + 0.12, 0.74]}>
    {/* white */}
    <mesh scale={[0.85, 1, 0.7]}>
      <sphereGeometry args={[0.27, 32, 32]} />
      <meshStandardMaterial color="#ffffff" roughness={0.25} />
    </mesh>
    {/* iris */}
    <mesh position={[0, 0, 0.15]}>
      <sphereGeometry args={[0.14, 32, 32]} />
      <meshStandardMaterial color={eyeColor} roughness={0.35} />
    </mesh>
    {/* pupil */}
    <mesh position={[0, 0, 0.23]}>
      <sphereGeometry args={[0.075, 24, 24]} />
      <meshStandardMaterial color="#241d18" />
    </mesh>
    {/* catchlight */}
    <mesh position={[-0.05, 0.07, 0.28]}>
      <sphereGeometry args={[0.035, 16, 16]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
    </mesh>
  </group>
);

const Brow: React.FC<{ x: number; tilt: number; color: string }> = ({ x, tilt, color }) => (
  <mesh position={[x, HEAD_Y + 0.4, 0.82]} rotation={[0, 0, tilt]}>
    <boxGeometry args={[0.32, 0.07, 0.08]} />
    <meshStandardMaterial color={color} roughness={0.8} />
  </mesh>
);

/* ----------------------------- Mouth ----------------------------- */

const Mouth: React.FC<{ expr: string }> = ({ expr }) => {
  const y = HEAD_Y - 0.42;
  const z = 0.82;
  const lip = '#b5485f';

  if (expr === 'expr_surprised') {
    return (
      <mesh position={[0, y, z]}>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshStandardMaterial color="#5c2b38" />
      </mesh>
    );
  }
  if (expr === 'expr_happy' || expr === 'expr_love' || expr === 'expr_cool' || expr === 'expr_wink') {
    // smile: bottom half of a torus ring
    return (
      <mesh position={[0, y + 0.05, z]} rotation={[Math.PI / 2, Math.PI, 0]}>
        <torusGeometry args={[0.2, 0.045, 12, 24, Math.PI]} />
        <meshStandardMaterial color={lip} roughness={0.5} />
      </mesh>
    );
  }
  if (expr === 'expr_sad' || expr === 'expr_angry') {
    // frown: top half of torus
    return (
      <mesh position={[0, y - 0.05, z]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.04, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#5c2b38" roughness={0.6} />
      </mesh>
    );
  }
  // neutral
  return (
    <mesh position={[0, y, z]}>
      <boxGeometry args={[0.32, 0.055, 0.06]} />
      <meshStandardMaterial color="#5c2b38" />
    </mesh>
  );
};

const Nose: React.FC<{ skin: string }> = ({ skin }) => (
  <mesh position={[0, HEAD_Y - 0.12, 0.92]} scale={[0.7, 0.8, 0.7]}>
    <sphereGeometry args={[0.1, 20, 20]} />
    <meshStandardMaterial color={skin} roughness={0.7} />
  </mesh>
);

const Blush: React.FC = () => (
  <>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.5, HEAD_Y - 0.18, 0.78]} scale={[1, 0.7, 0.4]}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color="#ff8fa6" transparent opacity={0.4} roughness={0.9} />
      </mesh>
    ))}
  </>
);

/* ----------------------------- Hair ------------------------------ */

const Hair: React.FC<{ style: string; color: string }> = ({ style, color }) => {
  const mat = <meshStandardMaterial color={color} roughness={0.85} />;

  // Top dome cap shared by most styles (covers crown, above the eyes).
  const cap = (
    <mesh position={[0, HEAD_Y + 0.05, -0.02]} scale={[1.08, 1.08, 1.08]}>
      <sphereGeometry args={[HEAD_R, 48, 48, 0, Math.PI * 2, 0, 1.15]} />
      {mat}
    </mesh>
  );

  const backMass = (sy: number, y: number) => (
    <mesh position={[0, HEAD_Y + y, -0.35]} scale={[1.05, sy, 0.75]}>
      <sphereGeometry args={[HEAD_R, 40, 40]} />
      {mat}
    </mesh>
  );

  switch (style) {
    case 'hair_short':
      return cap;
    case 'hair_long':
      return (
        <group>
          {backMass(1.35, -0.55)}
          {cap}
        </group>
      );
    case 'hair_bob':
      return (
        <group>
          {backMass(1.0, -0.15)}
          {cap}
        </group>
      );
    case 'hair_wavy':
      return (
        <group>
          {backMass(1.25, -0.4)}
          {cap}
        </group>
      );
    case 'hair_bun':
      return (
        <group>
          {cap}
          <mesh position={[0, HEAD_Y + 1.05, -0.1]}>
            <sphereGeometry args={[0.32, 24, 24]} />
            {mat}
          </mesh>
        </group>
      );
    case 'hair_spiky':
      return (
        <group>
          {cap}
          {[-0.5, -0.2, 0.1, 0.4].map((x, i) => (
            <mesh key={i} position={[x, HEAD_Y + 0.95, 0]} rotation={[0, 0, (i - 1.5) * 0.25]}>
              <coneGeometry args={[0.16, 0.5, 12]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
    case 'hair_braids':
      return (
        <group>
          {backMass(0.9, -0.05)}
          {cap}
          {[-1, 1].map((s) =>
            [0, 1, 2, 3].map((j) => (
              <mesh key={`${s}-${j}`} position={[s * (0.95 + j * 0.03), HEAD_Y - 0.2 - j * 0.35, -0.05]}>
                <sphereGeometry args={[0.16 - j * 0.02, 16, 16]} />
                {mat}
              </mesh>
            ))
          )}
        </group>
      );
    case 'hair_curly':
      return (
        <group>
          {[
            [0, 1.05, 0], [-0.55, 0.95, 0], [0.55, 0.95, 0],
            [-0.85, 0.55, 0], [0.85, 0.55, 0], [-0.8, 0.1, 0], [0.8, 0.1, 0],
            [0, 1.1, -0.4], [-0.5, 0.9, -0.5], [0.5, 0.9, -0.5],
          ].map(([x, y, z], i) => (
            <mesh key={i} position={[x, HEAD_Y + y - 0.2, z]}>
              <sphereGeometry args={[0.3, 20, 20]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
    default:
      return cap;
  }
};

/* -------------------------- Body / Outfit ------------------------ */

const Body: React.FC<{ config: AvatarConfig }> = ({ config }) => {
  const { outfitPrimary, outfitSecondary, accentColor, skinTone } = config.colors;
  return (
    <group>
      {/* neck */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.5, 24]} />
        <meshStandardMaterial color={skinTone} roughness={0.7} />
      </mesh>
      {/* torso / shoulders */}
      <RoundedBox args={[2.1, 1.6, 1.15]} radius={0.45} smoothness={5} position={[0, -0.55, 0]}>
        <meshStandardMaterial color={outfitPrimary} roughness={0.6} />
      </RoundedBox>
      {/* collar accent */}
      <mesh position={[0, 0.18, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.08, 12, 24]} />
        <meshStandardMaterial color={outfitSecondary} roughness={0.6} />
      </mesh>
      {/* centre motif */}
      <mesh position={[0, -0.5, 0.62]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} />
      </mesh>
    </group>
  );
};

/* --------------------------- Accessories ------------------------- */

const Accessories: React.FC<{ config: AvatarConfig }> = ({ config }) => {
  const acc = config.selection.accessories;
  const accent = config.colors.accentColor;
  const has = (id: string) => acc.includes(id);

  return (
    <group>
      {(has('acc_glasses') || has('acc_sunglasses')) &&
        [-0.42, 0.42].map((x) => (
          <group key={x} position={[x, HEAD_Y + 0.12, 0.9]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.24, 0.035, 12, 24]} />
              <meshStandardMaterial color={accent} roughness={0.4} metalness={0.3} />
            </mesh>
            {has('acc_sunglasses') && (
              <mesh position={[0, 0, -0.02]}>
                <circleGeometry args={[0.24, 24]} />
                <meshStandardMaterial color="#221d1a" transparent opacity={0.8} />
              </mesh>
            )}
          </group>
        ))}
      {(has('acc_glasses') || has('acc_sunglasses')) && (
        <mesh position={[0, HEAD_Y + 0.12, 0.92]}>
          <boxGeometry args={[0.28, 0.04, 0.04]} />
          <meshStandardMaterial color={accent} roughness={0.4} metalness={0.3} />
        </mesh>
      )}

      {(has('acc_hat') || has('acc_cap')) && (
        <group position={[0, HEAD_Y + 0.75, 0]}>
          <mesh>
            <cylinderGeometry args={[0.75, 0.8, 0.55, 32]} />
            <meshStandardMaterial color={accent} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.28, has('acc_cap') ? 0.5 : 0]}>
            <cylinderGeometry args={[has('acc_cap') ? 0.5 : 1.15, has('acc_cap') ? 0.5 : 1.15, 0.08, 32]} />
            <meshStandardMaterial color={accent} roughness={0.6} />
          </mesh>
        </group>
      )}

      {(has('acc_crown') || has('acc_tiara')) && (
        <group position={[0, HEAD_Y + 0.72, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.7, 0.09, 12, 32]} />
            <meshStandardMaterial color={accent} roughness={0.3} metalness={0.6} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.7, 0.18, Math.sin(a) * 0.7]}>
                <coneGeometry args={[0.1, 0.3, 8]} />
                <meshStandardMaterial color={accent} roughness={0.3} metalness={0.6} />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

/* --------------------------- Full model -------------------------- */

const AvatarModel: React.FC = () => {
  const config = useAvatarStore((s) => s.config);
  const { skinTone, eyeColor, hairColor } = config.colors;
  const expr = config.selection.expression;

  // Brow tilt per expression (radians).
  let browTilt = 0.05;
  if (expr === 'expr_angry') browTilt = -0.35;
  else if (expr === 'expr_sad') browTilt = 0.35;
  else if (expr === 'expr_surprised') browTilt = 0.1;

  return (
    <group position={[0, 0.1, 0]}>
      <Body config={config} />
      <Head shape={config.selection.head} skin={skinTone} />
      <Ears skin={skinTone} />
      <Blush />
      <Brow x={-0.42} tilt={browTilt} color={hairColor} />
      <Brow x={0.42} tilt={-browTilt} color={hairColor} />
      <Eye x={-0.42} eyeColor={eyeColor} />
      <Eye x={0.42} eyeColor={eyeColor} />
      <Nose skin={skinTone} />
      <Mouth expr={expr} />
      <Hair style={config.selection.hair} color={hairColor} />
      <Accessories config={config} />
    </group>
  );
};

/* ----------------------------- Scene ----------------------------- */

const Avatar3D: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.8, 7], fov: 33 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <hemisphereLight args={['#ffffff', '#b0b0d0', 0.6]} />
        <directionalLight position={[4, 6, 5]} intensity={1.3} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.4} />

        <AvatarModel />

        <ContactShadows position={[0, -1.5, 0]} opacity={0.35} scale={6} blur={2.5} far={4} />
        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.9}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
};

export default Avatar3D;
