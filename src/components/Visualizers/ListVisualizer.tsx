import React, { useState, useEffect } from 'react';
import { Play, SkipForward, RotateCcw, Eye } from 'lucide-react';

interface ListNodeVisual {
  id: number;
  val: number;
  x: number;
  y: number;
}

const buildNodesFromInput = (input: string): ListNodeVisual[] => {
  try {
    const vals = input.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    return vals.map((v, idx) => ({
      id: idx + 1,
      val: v,
      x: 50 + idx * 85,
      y: 90
    }));
  } catch (e) {
    return [];
  }
};

export const ListVisualizer: React.FC<{ initialList?: string }> = ({ initialList }) => {
  const defaultVal = initialList || '1, 2, 3, 4';
  const [inputText, setInputText] = useState<string>(defaultVal);
  const [listNodes, setListNodes] = useState<ListNodeVisual[]>(buildNodesFromInput(defaultVal));
  const [step, setStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const [prevId, setPrevId] = useState<number | null>(null);
  const [currId, setCurrId] = useState<number | null>(1);
  const [nextId, setNextId] = useState<number | null>(2);
  
  const [links, setLinks] = useState<Record<number, number | null>>({
    1: 2, 2: 3, 3: 4, 4: null
  });

  useEffect(() => {
    if (initialList) {
      setInputText(initialList);
      const nodes = buildNodesFromInput(initialList);
      if (nodes.length > 0) {
        setListNodes(nodes);
      }
    }
  }, [initialList]);

  useEffect(() => {
    resetVisualizer();
  }, [listNodes]);

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
  }, [isPlaying, step]);

  const handleLoadList = () => {
    const nodes = buildNodesFromInput(inputText);
    if (nodes.length === 0) {
      alert('Please enter a valid list of comma-separated numbers (e.g. 5, 10, 15)');
      return;
    }
    setListNodes(nodes);
  };

  const resetVisualizer = () => {
    setStep(-1);
    setIsPlaying(false);
    setPrevId(null);
    setCurrId(listNodes[0]?.id || null);
    setNextId(listNodes[1]?.id || null);
    
    const initialLinks: Record<number, number | null> = {};
    listNodes.forEach((node, idx) => {
      initialLinks[node.id] = idx + 1 < listNodes.length ? listNodes[idx + 1].id : null;
    });
    setLinks(initialLinks);
  };

  const handleStepForward = () => {
    const nextStep = step + 1;
    setStep(nextStep);

    // Dynamic steps based on current list length
    const totalSteps = listNodes.length * 2 + 1;
    if (nextStep >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    const isShiftStep = nextStep % 2 === 0;

    if (nextStep === 0) {
      // Step 0: next = curr.next
      setNextId(listNodes[1]?.id || null);
    } else if (!isShiftStep) {
      // Reversing link step: curr.next = prev
      const cId = currId;
      if (cId !== null) {
        setLinks(prev => ({ ...prev, [cId]: prevId }));
      }
    } else {
      // Shifting pointers step
      const nextPrev = currId;
      const nextCurr = nextId;
      const nextNextIdx = listNodes.findIndex(n => n.id === nextId) + 1;
      const nextNext = nextNextIdx < listNodes.length ? listNodes[nextNextIdx].id : null;

      setPrevId(nextPrev);
      setCurrId(nextCurr);
      setNextId(nextNext);
    }
  };

  const startAutoPlay = () => {
    const totalSteps = listNodes.length * 2 + 1;
    if (step >= totalSteps - 1) {
      resetVisualizer();
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(true);
    }
  };

  const getExplanation = () => {
    if (step === -1) return "Click Play or Next to start reversing the list.";
    const totalSteps = listNodes.length * 2 + 1;
    if (step >= totalSteps - 1) return `List reversed successfully! Head node is now Node ${prevId}.`;
    
    const isShiftStep = step % 2 === 0;
    if (!isShiftStep) {
      return `Reverse current link: set curr.next = prev (Node ${currId} now points back to Node ${prevId})`;
    } else {
      return `Shift pointers forward: prev moves to ${currId}, curr moves to ${nextId}, next moves to ${nextId ? 'next node' : 'NULL'}`;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Custom input loader */}
      <div style={{
        display: 'flex',
        gap: 8,
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '10px',
        borderRadius: 8,
        border: '1px solid var(--border-light)'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. 10, 20, 30, 40"
          style={{
            flex: 1,
            background: 'var(--bg-dark)',
            color: '#fff',
            border: '1px solid var(--border-light)',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            outline: 'none'
          }}
        />
        <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={handleLoadList}>
          <Eye size={12} /> Render List
        </button>
      </div>

      {/* Control header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-light)',
        padding: '10px 14px',
        borderRadius: 10
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>Reversing Linked List</span>

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
            disabled={isPlaying || step >= listNodes.length * 2}
          >
            <SkipForward size={12} /> Next
          </button>
          <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={resetVisualizer}>
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="glass-panel" style={{
        padding: '20px',
        background: 'rgba(5, 8, 20, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: 240
      }}>
        <svg width="370" height="180" style={{ overflow: 'visible', margin: '0 auto' }}>
          {/* NULL indicators */}
          <g>
            <rect x="0" y="75" width="28" height="28" rx="4" fill="rgba(255,255,255,0.02)" stroke="var(--border-light)" />
            <text x="14" y="93" textAnchor="middle" fill="var(--text-dim)" fontSize="0.65rem">NULL</text>
          </g>

          <g>
            <rect x="340" y="75" width="28" height="28" rx="4" fill="rgba(255,255,255,0.02)" stroke="var(--border-light)" />
            <text x="354" y="93" textAnchor="middle" fill="var(--text-dim)" fontSize="0.65rem">NULL</text>
          </g>

          {/* Render arrows */}
          {listNodes.map(node => {
            const destId = links[node.id];
            if (destId === undefined) return null;

            let x1 = node.x + 18;
            let y1 = node.y;
            let x2 = 0;
            let y2 = node.y;

            if (destId === null) {
              if (node.id === listNodes[0]?.id) {
                x2 = 28; x1 = node.x - 18;
              } else {
                x2 = 340;
              }
            } else {
              const destNode = listNodes.find(n => n.id === destId);
              if (destNode) {
                if (destNode.x < node.x) {
                  x1 = node.x - 18; x2 = destNode.x + 18;
                } else {
                  x2 = destNode.x - 18;
                }
              }
            }

            const isFlipped = x2 < x1;

            return (
              <g key={`arrow-${node.id}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--accent-purple)"
                  strokeWidth="2"
                  markerEnd={`url(#arrow-head-${isFlipped ? 'left' : 'right'})`}
                  style={{ transition: 'all 0.5s' }}
                />
              </g>
            );
          })}

          <defs>
            <marker id="arrow-head-right" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="var(--accent-purple)" />
            </marker>
            <marker id="arrow-head-left" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
              <polygon points="6 0, 0 3, 6 6" fill="var(--accent-purple)" />
            </marker>
          </defs>

          {/* Render Nodes */}
          {listNodes.map(node => {
            const isPrev = prevId === node.id;
            const isCurr = currId === node.id;
            const isNext = nextId === node.id;

            let strokeColor = 'rgba(255, 255, 255, 0.15)';
            let fillBg = 'var(--bg-dark)';

            if (isCurr) {
              strokeColor = 'var(--accent-cyan)';
              fillBg = 'rgba(6, 182, 212, 0.25)';
            } else if (isPrev || isNext) {
              strokeColor = 'var(--accent-purple)';
            }

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="18"
                  fill={fillBg}
                  stroke={strokeColor}
                  strokeWidth={isCurr ? 3 : 1.5}
                  style={{ transition: 'all 0.3s' }}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="var(--text-main)"
                  fontWeight="bold"
                  fontSize="0.85rem"
                >
                  {node.val}
                </text>

                {isPrev && (
                  <g style={{ transition: 'all 0.3s' }}>
                    <rect x={node.x - 18} y={node.y - 44} width="36" height="16" rx="4" fill="rgba(139, 92, 246, 0.2)" stroke="var(--accent-purple)" strokeWidth="1" />
                    <text x={node.x} y={node.y - 33} textAnchor="middle" fill="var(--accent-purple)" fontSize="0.65rem" fontWeight="bold">prev</text>
                  </g>
                )}
                {isCurr && (
                  <g style={{ transition: 'all 0.3s' }}>
                    <rect x={node.x - 18} y={node.y + 26} width="36" height="16" rx="4" fill="rgba(6, 182, 212, 0.2)" stroke="var(--accent-cyan)" strokeWidth="1" />
                    <text x={node.x} y={node.y + 37} textAnchor="middle" fill="var(--accent-cyan)" fontSize="0.65rem" fontWeight="bold">curr</text>
                  </g>
                )}
                {isNext && (
                  <g style={{ transition: 'all 0.3s' }}>
                    <rect x={node.x - 18} y={node.y - 44} width="36" height="16" rx="4" fill="rgba(245, 158, 11, 0.2)" stroke="var(--accent-amber)" strokeWidth="1" />
                    <text x={node.x} y={node.y - 33} textAnchor="middle" fill="var(--accent-amber)" fontSize="0.65rem" fontWeight="bold">next</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
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
export default ListVisualizer;
