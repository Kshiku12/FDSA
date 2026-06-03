import React, { useState, useEffect, useMemo } from 'react';
import { Play, SkipForward, RotateCcw } from 'lucide-react';

interface DPCell {
  index: number;
  val: string | number;
  state: 'empty' | 'base' | 'active' | 'dependency' | 'filled';
}

export const DpVisualizer: React.FC = () => {
  const [nVal, setNVal] = useState<number>(6);
  const [step, setStep] = useState<number>(-1); // -1: initialized, i: solving dp[i+3], maxStep: completed
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Pre-calculate climbing stairs (Fibonacci) values up to 12
  const dpValues = useMemo(() => {
    const vals = [0, 1, 2];
    for (let i = 3; i <= 12; i++) {
      vals[i] = vals[i - 1] + vals[i - 2];
    }
    return vals;
  }, []);

  const getInitialCells = (n: number): DPCell[] => {
    const arr: DPCell[] = [];
    for (let i = 0; i <= n; i++) {
      if (i === 0) arr.push({ index: 0, val: 0, state: 'base' });
      else if (i === 1) arr.push({ index: 1, val: 1, state: 'base' });
      else if (i === 2) arr.push({ index: 2, val: 2, state: 'base' });
      else arr.push({ index: i, val: '?', state: 'empty' });
    }
    return arr;
  };

  const [cells, setCells] = useState<DPCell[]>(getInitialCells(6));

  useEffect(() => {
    resetVisualizer();
  }, [nVal]);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        handleStepForward();
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, step, nVal]);

  const resetVisualizer = () => {
    setCells(getInitialCells(nVal));
    setStep(-1);
    setIsPlaying(false);
  };

  const maxStep = nVal - 2; // e.g., for N=6, we solve for 3, 4, 5, 6 (4 steps: 0, 1, 2, 3)

  const handleStepForward = () => {
    const nextStep = step + 1;
    if (nextStep > maxStep) {
      setIsPlaying(false);
      return;
    }

    setStep(nextStep);

    if (nextStep === maxStep) {
      // Final completed state
      setIsPlaying(false);
      setCells(prev => prev.map(c => {
        if (c.index > 2) {
          return { ...c, val: dpValues[c.index], state: 'filled' };
        }
        return c;
      }));
      return;
    }

    const targetIdx = nextStep + 3;

    // Highlight solving node & dependencies
    setCells(prev => prev.map(c => {
      if (c.index === targetIdx) return { ...c, state: 'active' };
      if (c.index === targetIdx - 1 || c.index === targetIdx - 2) return { ...c, state: 'dependency' };
      if (c.index < targetIdx - 2 && c.index > 2) return { ...c, state: 'filled' };
      if (c.index <= 2) return { ...c, state: 'base' };
      return { ...c, state: 'empty', val: '?' };
    }));

    // Resolve value with delay
    setTimeout(() => {
      setCells(prev => prev.map(c => {
        if (c.index === targetIdx) {
          return { ...c, val: dpValues[targetIdx], state: 'filled' };
        }
        if (c.index === targetIdx - 1 || c.index === targetIdx - 2) {
          return { ...c, state: c.index <= 2 ? 'base' : 'filled' };
        }
        return c;
      }));
    }, 700);
  };

  const startAutoPlay = () => {
    if (step >= maxStep) {
      resetVisualizer();
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(true);
    }
  };

  const getExplanation = () => {
    if (step === -1) {
      return `DP Table initialized for N = ${nVal}. dp[1] = 1 way, dp[2] = 2 ways. These are our base cases.`;
    }
    if (step === maxStep) {
      return `DP Table filled successfully! The solution to climb N = ${nVal} steps is dp[${nVal}] = ${dpValues[nVal]} ways.`;
    }
    const targetIdx = step + 3;
    return `Computing dp[${targetIdx}] = dp[${targetIdx - 1}] + dp[${targetIdx - 2}]. Subproblems values fetched from table: dp[${targetIdx}] = ${dpValues[targetIdx - 1]} + ${dpValues[targetIdx - 2]} = ${dpValues[targetIdx]} ways.`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Control panel header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-light)',
        padding: '10px 14px',
        borderRadius: 10
      }}>
        {/* N size chooser */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Select N:</span>
          <select
            value={nVal}
            onChange={(e) => setNVal(parseInt(e.target.value))}
            style={{
              background: 'var(--bg-dark)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-light)',
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(x => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isPlaying ? (
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setIsPlaying(false)}>
              Pause
            </button>
          ) : (
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={startAutoPlay}>
              <Play size={12} fill="currentColor" /> Play
            </button>
          )}
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            onClick={handleStepForward}
            disabled={isPlaying || step >= maxStep}
          >
            <SkipForward size={12} /> Next
          </button>
          <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={resetVisualizer}>
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Grid rendering area */}
      <div className="glass-panel" style={{
        padding: '24px',
        background: 'rgba(5, 8, 20, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        height: 240
      }}>
        {/* DP Array */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {cells.map(cell => {
            let cellBg = 'rgba(255, 255, 255, 0.02)';
            let cellBorder = 'var(--border-light)';
            let glow = 'none';

            if (cell.state === 'base') {
              cellBg = 'rgba(255, 255, 255, 0.05)';
              cellBorder = 'rgba(255, 255, 255, 0.2)';
            } else if (cell.state === 'active') {
              cellBg = 'rgba(6, 182, 212, 0.15)';
              cellBorder = 'var(--accent-cyan)';
              glow = '0 0 10px rgba(6, 182, 212, 0.3)';
            } else if (cell.state === 'dependency') {
              cellBg = 'rgba(139, 92, 246, 0.2)';
              cellBorder = 'var(--accent-purple)';
              glow = '0 0 10px rgba(139, 92, 246, 0.3)';
            } else if (cell.state === 'filled') {
              cellBg = 'rgba(16, 185, 129, 0.12)';
              cellBorder = 'var(--accent-emerald)';
            }

            return (
              <div 
                key={cell.index} 
                className="flex-center"
                style={{
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>i = {cell.index}</span>
                <div 
                  className="flex-center"
                  style={{
                    width: 44,
                    height: 44,
                    background: cellBg,
                    border: `2px solid ${cellBorder}`,
                    boxShadow: glow,
                    borderRadius: 8,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: cell.state === 'empty' ? 'var(--text-dim)' : 'var(--text-main)',
                    transition: 'all 0.4s ease'
                  }}
                >
                  {cell.val}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Formula Display */}
        <div style={{
          background: 'rgba(5, 8, 20, 0.6)',
          border: '1px solid var(--border-light)',
          borderRadius: 8,
          padding: '8px 18px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--accent-cyan)',
        }}>
          {step >= 0 && step < maxStep && (
            <span>dp[{step + 3}] = dp[{step + 2}] + dp[{step + 1}] &rArr; {dpValues[step + 2]} + {dpValues[step + 1]} = {dpValues[step + 3]}</span>
          )}
          {(step === -1 || step === maxStep) && <span>dp[i] = dp[i-1] + dp[i-2]</span>}
        </div>
      </div>

      {/* Explanation text */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.01)',
        border: '1px solid var(--border-light)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        lineHeight: 1.4,
        minHeight: 52
      }}>
        {getExplanation()}
      </div>
    </div>
  );
};

export default DpVisualizer;
