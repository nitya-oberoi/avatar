import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useAvatarStore } from '@stores/avatarStore';
import { AvatarPreview } from '@components/AvatarPreview';
import { TraitSelector, ColorPalettePicker, ColorCustomizer } from '@components/TraitSelector';
import { useEffect, useState } from 'react';

// 3D preview touches WebGL — load it client-side only.
const Avatar3D = dynamic(() => import('@components/Avatar3D'), {
  ssr: false,
  loading: () => <div style={{ color: '#fff', padding: 40 }}>Loading 3D…</div>,
});
const VRMAvatar = dynamic(() => import('@components/VRMAvatar'), {
  ssr: false,
  loading: () => <div style={{ color: '#fff', padding: 40 }}>Loading VRM…</div>,
});

export default function Home() {
  const { config, loadFromLocal, randomizeAvatar, undo, redo, canUndo, canRedo, saveToLocal } = useAvatarStore();
  const [view, setView] = useState<'3d' | '2d' | 'vrm'>('2d');

  useEffect(() => {
    loadFromLocal();
  }, [loadFromLocal]);

  // Auto-save when config changes, debounced so dragging the color
  // picker doesn't write to localStorage on every intermediate value.
  useEffect(() => {
    const timer = setTimeout(() => saveToLocal(), 400);
    return () => clearTimeout(timer);
  }, [config, saveToLocal]);

  return (
    <>
      <Head>
        <title>Bitmoji Avatar Creator</title>
        <meta name="description" content="Create cute Bitmoji-style avatars" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={styles.container}>
        <header style={styles.header}>
          <h1>🎨 Bitmoji Avatar Creator</h1>
          <p style={styles.subtitle}>Create your unique avatar</p>
        </header>

        <div style={styles.layout}>
          {/* Left: Preview */}
          <div style={styles.previewColumn}>
            <div style={styles.toggleRow}>
              <button
                style={{ ...styles.toggle, ...(view === '3d' ? styles.toggleActive : {}) }}
                onClick={() => setView('3d')}
              >
                3D
              </button>
              <button
                style={{ ...styles.toggle, ...(view === '2d' ? styles.toggleActive : {}) }}
                onClick={() => setView('2d')}
              >
                2D
              </button>
              <button
                style={{ ...styles.toggle, ...(view === 'vrm' ? styles.toggleActive : {}) }}
                onClick={() => setView('vrm')}
              >
                VRM
              </button>
            </div>

            {view === '2d' ? (
              <AvatarPreview size={350} interactive={true} />
            ) : (
              <div style={styles.canvasWrap}>{view === 'vrm' ? <VRMAvatar /> : <Avatar3D />}</div>
            )}

            <div style={styles.buttonGroup}>
              <button
                style={styles.button}
                onClick={randomizeAvatar}
              >
                🎲 Randomize
              </button>
              <button
                style={{...styles.button, opacity: canUndo() ? 1 : 0.5}}
                onClick={undo}
                disabled={!canUndo()}
              >
                ↶ Undo
              </button>
              <button
                style={{...styles.button, opacity: canRedo() ? 1 : 0.5}}
                onClick={redo}
                disabled={!canRedo()}
              >
                ↷ Redo
              </button>
            </div>
          </div>

          {/* Right: Controls */}
          <div style={styles.controlsColumn}>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Customize Your Avatar</h2>
            </div>

            <div style={styles.toggleRow}>
              {(['female', 'male'] as const).map((g) => (
                <button
                  key={g}
                  style={{ ...styles.toggle, ...(config.selection.gender === g ? styles.toggleActive : {}) }}
                  onClick={() => useAvatarStore.getState().selectTrait('gender', g)}
                >
                  {g === 'female' ? '♀ Female' : '♂ Male'}
                </button>
              ))}
            </div>

            <TraitSelector category="body" />
            <TraitSelector category="head" />
            <TraitSelector category="hair" />
            <TraitSelector category="outfit" />
            <TraitSelector category="expression" />
            <TraitSelector category="accessories" />

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Colors</h2>
              <ColorPalettePicker />

              <div style={styles.customColors}>
                <h4 style={styles.customTitle}>Fine-tune Colors</h4>
                <ColorCustomizer colorKey="skinTone" label="Skin Tone" />
                <ColorCustomizer colorKey="hairColor" label="Hair Color" />
                <ColorCustomizer colorKey="eyeColor" label="Eye Color" />
                <ColorCustomizer colorKey="outfitPrimary" label="Outfit Primary" />
                <ColorCustomizer colorKey="outfitSecondary" label="Outfit Secondary" />
                <ColorCustomizer colorKey="accentColor" label="Accent" />
              </div>
            </div>

            <details style={styles.details}>
              <summary>View Configuration (JSON)</summary>
              <pre style={styles.pre}>{JSON.stringify(config, null, 2)}</pre>
            </details>
          </div>
        </div>

        <footer style={styles.footer}>
          <p>✨ Phase 2.2: Trait Selector Complete | Saved automatically</p>
        </footer>
      </main>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '40px 20px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '16px',
    opacity: 0.9,
  } as React.CSSProperties,
  layout: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
  } as React.CSSProperties,
  previewColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    sticky: 'top' as any,
    top: '20px',
  } as React.CSSProperties,
  toggleRow: {
    display: 'flex',
    gap: '6px',
    background: '#e6e8ef',
    padding: '4px',
    borderRadius: '10px',
    width: 'fit-content',
    alignSelf: 'center',
  } as React.CSSProperties,
  toggle: {
    padding: '6px 20px',
    border: 'none',
    borderRadius: '7px',
    background: 'transparent',
    color: '#555',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,
  toggleActive: {
    background: 'white',
    color: '#667eea',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  } as React.CSSProperties,
  canvasWrap: {
    width: '350px',
    height: '350px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  } as React.CSSProperties,
  controlsColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto' as const,
  } as React.CSSProperties,
  section: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  } as React.CSSProperties,
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#333',
  } as React.CSSProperties,
  customColors: {
    marginTop: '12px',
  } as React.CSSProperties,
  customTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#666',
    margin: '12px 0 8px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  button: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    fontSize: '14px',
  } as React.CSSProperties,
  details: {
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  } as React.CSSProperties,
  pre: {
    backgroundColor: '#f0f0f0',
    padding: '12px',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '300px',
    fontSize: '11px',
    marginTop: '8px',
  } as React.CSSProperties,
  footer: {
    marginTop: '40px',
    padding: '40px 20px',
    textAlign: 'center' as const,
    color: '#666',
    borderTop: '1px solid #e0e0e0',
  } as React.CSSProperties,
};
