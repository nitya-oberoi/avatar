import React, { useEffect, useMemo, useState } from 'react';
import { renderAvatarSVG } from '@lib/avatarRenderer';
import { useAvatarStore } from '@stores/avatarStore';
import type { AvatarAnimation } from '@/avatar-core';
import styles from './creator.module.css';

const BAR: AvatarAnimation[] = ['idle', 'walk', 'run', 'jump', 'attack'];
const RAIL: { a: AvatarAnimation; icon: string }[] = [
  { a: 'dance', icon: '💃' },
  { a: 'celebrate', icon: '🎉' },
];

// Selectable stage scenes — pure CSS gradients, no assets.
interface Scene { id: string; label: string; sky: string; ground: string }
const SCENES: Scene[] = [
  { id: 'meadow', label: 'Meadow', sky: 'linear-gradient(180deg, #6db3f2 0%, #a9dbff 55%, #cfe8ff 100%)',
    ground: 'linear-gradient(180deg, #7cc47c, #4f9a4f 60%, #6b4a2f 60%, #543a25)' },
  { id: 'sunset', label: 'Sunset', sky: 'linear-gradient(180deg, #2d1b4e 0%, #8e3b8e 40%, #f4845f 75%, #ffcf6f 100%)',
    ground: 'linear-gradient(180deg, #a4653c, #6e4226 55%, #472a18)' },
  { id: 'beach', label: 'Beach', sky: 'linear-gradient(180deg, #4aa8e0 0%, #9fd9f7 60%, #37b2c8 60%, #2a93b5 74%, #f3ddb0 74%, #e8cd97 100%)',
    ground: 'linear-gradient(180deg, #f3ddb0, #e0c185 70%, #cfae72)' },
  { id: 'night', label: 'Night',
    sky: `radial-gradient(1.5px 1.5px at 18% 22%, #fff 99%, transparent), radial-gradient(2px 2px at 64% 12%, #fff 99%, transparent),
          radial-gradient(1.5px 1.5px at 82% 34%, #ffffffcc 99%, transparent), radial-gradient(1.5px 1.5px at 38% 8%, #ffffffbb 99%, transparent),
          radial-gradient(2px 2px at 50% 30%, #ffffffaa 99%, transparent), radial-gradient(circle at 78% 18%, #f5f3ce 0 4.5%, transparent 5%),
          linear-gradient(180deg, #0b1030 0%, #1b2350 70%, #2a3766 100%)`,
    ground: 'linear-gradient(180deg, #24304f, #1a2238 60%, #131a2c)' },
  { id: 'snow', label: 'Snow', sky: 'linear-gradient(180deg, #b8d4e8 0%, #ddeaf3 60%, #f2f8fc 100%)',
    ground: 'linear-gradient(180deg, #ffffff, #dfe9f0 65%, #c3d3de)' },
  { id: 'studio', label: 'Studio', sky: 'linear-gradient(180deg, #23283c 0%, #3a4160 100%)',
    ground: 'linear-gradient(180deg, #4a5378, #343b57 70%, #262c44)' },
];
const BG_KEY = 'avatarverse:background';

interface Props {
  animation: AvatarAnimation;
  onAnimation: (a: AvatarAnimation) => void;
}

/** Large preview: our SVG avatar on a game-style scene + animation controls. */
export const AvatarStage: React.FC<Props> = ({ animation, onAnimation }) => {
  const config = useAvatarStore((s) => s.config);
  const svg = useMemo(() => renderAvatarSVG(config, 320), [config]);
  const animClass = styles[`anim_${animation}`] ?? '';
  // Deterministic first render (SSR-safe); the saved scene loads after mount.
  const [sceneId, setSceneId] = useState('meadow');
  useEffect(() => {
    try { const s = localStorage.getItem(BG_KEY); if (s && SCENES.some((x) => x.id === s)) setSceneId(s); } catch { /* ignore */ }
  }, []);
  const pickScene = (id: string) => {
    setSceneId(id);
    try { localStorage.setItem(BG_KEY, id); } catch { /* ignore */ }
  };
  const scene = SCENES.find((s) => s.id === sceneId) ?? SCENES[0];

  return (
    <div className={styles.stage} style={{ background: scene.sky }}>
      <div className={styles.ground} style={{ background: scene.ground }} />
      <div className={styles.sceneRail} role="group" aria-label="Background scene">
        {SCENES.map((s) => (
          <button
            key={s.id}
            className={`${styles.sceneChip} ${sceneId === s.id ? styles.sceneChipActive : ''}`}
            style={{ background: s.sky }}
            onClick={() => pickScene(s.id)}
            aria-label={s.label}
            aria-pressed={sceneId === s.id}
            title={s.label}
          />
        ))}
      </div>
      <div className={styles.stageInner}>
        <div
          className={`${styles.avatarWrap} ${animClass}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      <div className={styles.animRail}>
        {RAIL.map((r) => (
          <button
            key={r.a}
            className={`${styles.railBtn} ${animation === r.a ? styles.railBtnActive : ''}`}
            onClick={() => onAnimation(r.a)}
            aria-label={r.a}
            aria-pressed={animation === r.a}
            title={r.a}
          >
            {r.icon}
          </button>
        ))}
      </div>

      <div className={styles.animBar} role="group" aria-label="Animation">
        {BAR.map((a) => (
          <button
            key={a}
            className={`${styles.animBtn} ${animation === a ? styles.animBtnActive : ''}`}
            onClick={() => onAnimation(a)}
            aria-pressed={animation === a}
          >
            {a.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};
