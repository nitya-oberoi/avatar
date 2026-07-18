import React, { useMemo } from 'react';
import { renderAvatarSVG } from '@lib/avatarRenderer';
import { useAvatarStore } from '@stores/avatarStore';
import type { AvatarAnimation } from '@/avatar-core';
import styles from './creator.module.css';

const BAR: AvatarAnimation[] = ['idle', 'walk', 'run', 'jump', 'attack'];
const RAIL: { a: AvatarAnimation; icon: string }[] = [
  { a: 'dance', icon: '💃' },
  { a: 'celebrate', icon: '🎉' },
];

interface Props {
  animation: AvatarAnimation;
  onAnimation: (a: AvatarAnimation) => void;
}

/** Large preview: our SVG avatar on a game-style scene + animation controls. */
export const AvatarStage: React.FC<Props> = ({ animation, onAnimation }) => {
  const config = useAvatarStore((s) => s.config);
  const svg = useMemo(() => renderAvatarSVG(config, 320), [config]);
  const animClass = styles[`anim_${animation}`] ?? '';

  return (
    <div className={styles.stage}>
      <div className={styles.ground} />
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
