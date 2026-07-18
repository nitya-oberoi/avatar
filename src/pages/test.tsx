/**
 * Test Page
 * Verify Zustand store functionality
 */

import Head from 'next/head';
import { useAvatarStore } from '@stores/avatarStore';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const store = useAvatarStore();
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    runTests();
    // Run once on mount; runTests reads the store imperatively.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runTests = async () => {
    const results: string[] = [];

    // Test 1: Initial state
    try {
      const config = store.getConfig();
      if (config.id && config.selection && config.colors) {
        results.push('✅ Test 1: Initial state loaded correctly');
      } else {
        results.push('❌ Test 1: Initial state missing properties');
      }
    } catch (e) {
      results.push(`❌ Test 1 Error: ${e}`);
    }

    // Test 2: Select trait
    try {
      store.selectTrait('head', 'head_oval');
      const config = store.getConfig();
      if (config.selection.head === 'head_oval') {
        results.push('✅ Test 2: Trait selection working');
      } else {
        results.push('❌ Test 2: Trait selection failed');
      }
    } catch (e) {
      results.push(`❌ Test 2 Error: ${e}`);
    }

    // Test 3: Select color
    try {
      store.selectColor('hairColor', '#FF0000');
      const config = store.getConfig();
      if (config.colors.hairColor === '#FF0000') {
        results.push('✅ Test 3: Color selection working');
      } else {
        results.push('❌ Test 3: Color selection failed');
      }
    } catch (e) {
      results.push(`❌ Test 3 Error: ${e}`);
    }

    // Test 4: Add accessory
    try {
      store.addAccessory('acc_glasses');
      const config = store.getConfig();
      if (config.selection.accessories.includes('acc_glasses')) {
        results.push('✅ Test 4: Add accessory working');
      } else {
        results.push('❌ Test 4: Add accessory failed');
      }
    } catch (e) {
      results.push(`❌ Test 4 Error: ${e}`);
    }

    // Test 5: Remove accessory
    try {
      store.removeAccessory('acc_glasses');
      const config = store.getConfig();
      if (!config.selection.accessories.includes('acc_glasses')) {
        results.push('✅ Test 5: Remove accessory working');
      } else {
        results.push('❌ Test 5: Remove accessory failed');
      }
    } catch (e) {
      results.push(`❌ Test 5 Error: ${e}`);
    }

    // Test 6: Undo/Redo
    try {
      const beforeUndo = store.getConfig();
      store.undo();
      const afterUndo = store.getConfig();
      if (
        beforeUndo.selection.head !== afterUndo.selection.head &&
        store.canRedo()
      ) {
        results.push('✅ Test 6: Undo/Redo working');
      } else {
        results.push('❌ Test 6: Undo/Redo failed');
      }
    } catch (e) {
      results.push(`❌ Test 6 Error: ${e}`);
    }

    // Test 7: Randomize
    try {
      const before = store.getConfig();
      store.randomizeAvatar();
      const after = store.getConfig();
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        results.push('✅ Test 7: Randomize working');
      } else {
        results.push('❌ Test 7: Randomize failed');
      }
    } catch (e) {
      results.push(`❌ Test 7 Error: ${e}`);
    }

    // Test 8: Export JSON
    try {
      const json = store.exportJSON();
      const parsed = JSON.parse(json);
      if (parsed.id && parsed.selection) {
        results.push('✅ Test 8: Export JSON working');
      } else {
        results.push('❌ Test 8: Export JSON invalid');
      }
    } catch (e) {
      results.push(`❌ Test 8 Error: ${e}`);
    }

    // Test 9: Import JSON
    try {
      const testConfig = {
        id: 'test-id',
        version: 1,
        selection: {
          body: 'body_standard',
          head: 'head_round',
          hair: 'hair_short',
          top: 'top_tshirt',
          bottom: 'bottom_jeans',
          shoes: 'shoes_sneakers',
          accessories: [],
          expression: 'expr_happy',
        },
        colors: {
          skinTone: '#E8B4A0',
          hairColor: '#000000',
          eyeColor: '#6B4423',
          outfitPrimary: '#FF6B9D',
          outfitSecondary: '#FFC857',
          accentColor: '#1E88E5',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      store.importJSON(JSON.stringify(testConfig));
      const imported = store.getConfig();
      if (imported.selection.hair === 'hair_short') {
        results.push('✅ Test 9: Import JSON working');
      } else {
        results.push('❌ Test 9: Import JSON failed');
      }
    } catch (e) {
      results.push(`❌ Test 9 Error: ${e}`);
    }

    // Test 10: LocalStorage
    try {
      store.saveToLocal();
      const saved = localStorage.getItem('avatarConfig');
      if (saved) {
        results.push('✅ Test 10: LocalStorage save working');
      } else {
        results.push('❌ Test 10: LocalStorage save failed');
      }
    } catch (e) {
      results.push(`❌ Test 10 Error: ${e}`);
    }

    setTestResults(results);
  };

  const passCount = testResults.filter((r) => r.startsWith('✅')).length;
  const totalCount = testResults.length;

  return (
    <>
      <Head>
        <title>Avatar Store Tests</title>
      </Head>

      <main style={styles.container}>
        <div style={styles.card}>
          <h1>🧪 Avatar Store Test Suite</h1>

          <div
            style={{
              ...styles.result,
              backgroundColor:
                passCount === totalCount ? '#d4edda' : '#fff3cd',
            }}
          >
            <h2 style={{ margin: 0 }}>
              {passCount}/{totalCount} Tests Passed
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
              {passCount === totalCount ? '✅ All tests passed!' : '⚠️ Some tests failed'}
            </p>
          </div>

          <div style={styles.results}>
            {testResults.map((result, i) => (
              <div key={i} style={styles.resultItem}>
                {result}
              </div>
            ))}
          </div>

          <button
            style={styles.button}
            onClick={() => {
              setTestResults([]);
              runTests();
            }}
          >
            🔄 Re-run Tests
          </button>
        </div>
      </main>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  result: {
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ddd',
  } as React.CSSProperties,
  results: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginBottom: '20px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
  } as React.CSSProperties,
  resultItem: {
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  button: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    background: '#667eea',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,
};
