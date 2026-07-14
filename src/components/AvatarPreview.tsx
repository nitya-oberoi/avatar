/**
 * AvatarPreview Component
 * Displays the complete avatar as an interactive SVG
 */

import React, { useMemo } from 'react';
import { useAvatarStore } from '@stores/avatarStore';
import { renderAvatarSVG } from '@lib/avatarRenderer';
import styles from './AvatarPreview.module.css';

interface AvatarPreviewProps {
  size?: number;
  interactive?: boolean;
  showGrid?: boolean;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  size = 300,
  interactive = true,
  showGrid = false,
}) => {
  const config = useAvatarStore((state) => state.config);

  // Memoize SVG rendering to avoid unnecessary recalculations
  const svgString = useMemo(() => {
    return renderAvatarSVG(config, size);
  }, [config, size]);

  return (
    <div
      className={styles.container}
      style={{
        width: size,
        height: size,
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      <div
        className={styles.preview}
        dangerouslySetInnerHTML={{ __html: svgString }}
      />

      {showGrid && <div className={styles.grid} />}
    </div>
  );
};

export default AvatarPreview;
