import React, { useState, useEffect, useMemo } from 'react';
import { Play, SkipForward, RotateCcw } from 'lucide-react';

interface GraphNodeVisual {
  id: number;
  label: string;
  x: number;
  y: number;
}

interface Edge {
  u: number;
  v: number;
}

// BFS Frames Generator
const generateBfsFrames = (nodes: number[], edges: Edge[]) => {
  if (nodes.length === 0) return [];
  const adj: Record<number, number[]> = {};
  nodes.forEach(n => adj[n] = []);
  edges.forEach(({ u, v }) => {
    if (adj[u]) adj[u].push(v);
    if (adj[v]) adj[v].push(u);
  });
  // Sort adj lists for deterministic order
  nodes.forEach(n => adj[n].sort((a, b) => a - b));

  const startNode = Math.min(...nodes);
  const frames: { current: number | null; queue: number[]; visited: number[] }[] = [];
  const visited: number[] = [];
  const queue: number[] = [startNode];
  const inQueueSet = new Set<number>([startNode]);
  const visitedSet = new Set<number>();

  // Initial frame
  frames.push({
    current: null,
    queue: [...queue],
    visited: []
  });

  while (queue.length > 0) {
    const curr = queue.shift()!;
    visited.push(curr);
    visitedSet.add(curr);

    // Get neighbors not visited and not in queue
    const neighbors = adj[curr] || [];
    neighbors.forEach(neigh => {
      if (!visitedSet.has(neigh) && !inQueueSet.has(neigh)) {
        queue.push(neigh);
        inQueueSet.add(neigh);
      }
    });

    frames.push({
      current: curr,
      queue: [...queue],
      visited: [...visited]
    });
  }
  return frames;
};

// DFS Stack Frames Generator
const generateDfsFrames = (nodes: number[], edges: Edge[]) => {
  if (nodes.length === 0) return [];
  const adj: Record<number, number[]> = {};
  nodes.forEach(n => adj[n] = []);
  edges.forEach(({ u, v }) => {
    if (adj[u]) adj[u].push(v);
    if (adj[v]) adj[v].push(u);
  });
  nodes.forEach(n => adj[n].sort((a, b) => b - a)); // Reverse sort for stack pop order

  const startNode = Math.min(...nodes);
  const frames: { current: number | null; stack: number[]; visited: number[] }[] = [];
  const visited: number[] = [];
  const visitedSet = new Set<number>();
  const stack: number[] = [startNode];

  // Initial frame
  frames.push({
    current: null,
    stack: [...stack],
    visited: []
  });

  while (stack.length > 0) {
    const curr = stack.pop()!;
    if (visitedSet.has(curr)) {
      continue;
    }
    visited.push(curr);
    visitedSet.add(curr);

    frames.push({
      current: curr,
      stack: [...stack],
      visited: [...visited]
    });

    const neighbors = adj[curr] || [];
    neighbors.forEach(neigh => {
      if (!visitedSet.has(neigh)) {
        stack.push(neigh);
      }
    });

    frames.push({
      current: curr,
      stack: [...stack],
      visited: [...visited]
    });
  }

  // Final idle frame
  frames.push({
    current: null,
    stack: [],
    visited: [...visited]
  });

  return frames;
};

export const GraphVisualizer: React.FC = () => {
  const [edgeInput, setEdgeInput] = useState<string>('0-1, 0-2, 1-3, 2-3, 3-4');
  const [parsedEdges, setParsedEdges] = useState<Edge[]>([
    { u: 0, v: 1 },
    { u: 0, v: 2 },
    { u: 1, v: 3 },
    { u: 2, v: 3 },
    { u: 3, v: 4 }
  ]);
  const [traversalType, setTraversalType] = useState<'bfs' | 'dfs'>('bfs');
  const [step, setStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Extract unique nodes
  const uniqueNodes = useMemo(() => {
    const nodesSet = new Set<number>();
    parsedEdges.forEach(e => {
      nodesSet.add(e.u);
      nodesSet.add(e.v);
    });
    return Array.from(nodesSet).sort((a, b) => a - b);
  }, [parsedEdges]);

  // Compute Layout coordinates on a circle
  const graphNodes = useMemo<GraphNodeVisual[]>(() => {
    const N = uniqueNodes.length;
    const R = 75; // circle radius
    return uniqueNodes.map((nodeId, idx) => {
      const angle = N > 1 ? (2 * Math.PI * idx) / N : 0;
      return {
        id: nodeId,
        label: String(nodeId),
        x: N > 1 ? 200 + R * Math.cos(angle) : 200,
        y: N > 1 ? 115 + R * Math.sin(angle) : 115
      };
    });
  }, [uniqueNodes]);

  // Generate BFS / DFS frames
  const bfsFrames = useMemo(() => generateBfsFrames(uniqueNodes, parsedEdges), [uniqueNodes, parsedEdges]);
  const dfsFrames = useMemo(() => generateDfsFrames(uniqueNodes, parsedEdges), [uniqueNodes, parsedEdges]);

  const frames = traversalType === 'bfs' ? bfsFrames : dfsFrames;

  useEffect(() => {
    resetVisualizer();
  }, [traversalType, parsedEdges]);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        handleStepForward();
      }, 1200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, step, frames]);

  const handleUpdateGraph = () => {
    try {
      const edgeList: Edge[] = [];
      const parts = edgeInput.split(',').map(p => p.trim());
      parts.forEach(p => {
        if (!p) return;
        const pair = p.split('-').map(n => parseInt(n.trim()));
        if (pair.length === 2 && !isNaN(pair[0]) && !isNaN(pair[1])) {
          edgeList.push({ u: pair[0], v: pair[1] });
        } else {
          throw new Error(`Invalid format in pair: "${p}"`);
        }
      });

      if (edgeList.length === 0) {
        throw new Error('Graph must contain at least one edge.');
      }

      setParsedEdges(edgeList);
    } catch (err: any) {
      alert(`Invalid graph format: ${err.message}. Use format: 0-1, 1-2, 2-3`);
    }
  };

  const resetVisualizer = () => {
    setStep(-1);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (step + 1 < frames.length) {
      setStep(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const startAutoPlay = () => {
    if (step + 1 >= frames.length) {
      setStep(-1);
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(true);
    }
  };

  // Get current frame state
  const activeFrame = step >= 0 && step < frames.length ? frames[step] : { current: null as number | null, queue: [] as number[], stack: [] as number[], visited: [] as number[] };
  const currentActive = activeFrame.current;
  const structList = (traversalType === 'bfs' ? (activeFrame as any).queue : (activeFrame as any).stack) as number[] || [];
  const visited = (activeFrame.visited || []) as number[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Edge Input Loader */}
      <div style={{
        display: 'flex',
        gap: 8,
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '10px',
        borderRadius: 10,
        border: '1px solid var(--border-light)'
      }}>
        <input
          type="text"
          value={edgeInput}
          onChange={(e) => setEdgeInput(e.target.value)}
          placeholder="e.g. 0-1, 1-2, 2-3, 3-0"
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
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          onClick={handleUpdateGraph}
        >
          Update Graph
        </button>
      </div>

      {/* Controls header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-light)',
        padding: '10px 14px',
        borderRadius: 10
      }}>
        <select
          value={traversalType}
          onChange={(e) => setTraversalType(e.target.value as any)}
          style={{
            background: 'var(--bg-dark)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-light)',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: '0.85rem',
            outline: 'none'
          }}
        >
          <option value="bfs">Breadth First Search (Queue)</option>
          <option value="dfs">Depth First Search (Stack)</option>
        </select>

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
            disabled={isPlaying || step + 1 >= frames.length}
          >
            <SkipForward size={12} /> Next
          </button>
          <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={resetVisualizer}>
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* SVG Canvas Graph */}
      <div className="glass-panel" style={{
        padding: '20px',
        background: 'rgba(5, 8, 20, 0.4)',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        height: 250
      }}>
        <svg width="400" height="230" style={{ overflow: 'visible' }}>
          {/* Render Edges */}
          {parsedEdges.map((edge, idx) => {
            const uNode = graphNodes.find(n => n.id === edge.u);
            const vNode = graphNodes.find(n => n.id === edge.v);
            
            if (!uNode || !vNode) return null;

            // Determine line highlight
            const isTraversed = visited.includes(edge.u) && visited.includes(edge.v);
            
            return (
              <line
                key={idx}
                x1={uNode.x}
                y1={uNode.y}
                x2={vNode.x}
                y2={vNode.y}
                stroke={isTraversed ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.08)'}
                strokeWidth={isTraversed ? 3 : 1.5}
                style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
              />
            );
          })}

          {/* Render Nodes */}
          {graphNodes.map(node => {
            const isActive = currentActive === node.id;
            const isVisited = visited.includes(node.id);
            const inStruct = structList.includes(node.id);

            let strokeColor = 'rgba(255, 255, 255, 0.15)';
            let fillBg = 'var(--bg-dark)';
            let labelColor = 'var(--text-main)';

            if (isActive) {
              strokeColor = 'var(--accent-cyan)';
              fillBg = 'rgba(6, 182, 212, 0.3)';
            } else if (inStruct) {
              strokeColor = 'var(--accent-amber)';
              fillBg = 'rgba(245, 158, 11, 0.15)';
            } else if (isVisited) {
              strokeColor = 'var(--accent-purple)';
              fillBg = 'rgba(139, 92, 246, 0.15)';
              labelColor = 'var(--accent-purple)';
            }

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="16"
                  fill={fillBg}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 3 : 1.5}
                  className={isActive ? 'visual-node-visiting' : ''}
                  style={{ transition: 'all 0.3s' }}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill={labelColor}
                  fontWeight="bold"
                  fontSize="0.8rem"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* State visualizer footer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Queue/Stack representation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            {traversalType === 'bfs' ? 'Active Queue (FIFO):' : 'Active Stack (LIFO):'}
          </span>
          <div style={{
            display: 'flex',
            gap: 6,
            background: 'rgba(5, 8, 20, 0.4)',
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            padding: '8px 12px',
            minHeight: 40,
            alignItems: 'center',
            overflowX: 'auto'
          }}>
            {structList.map((nId: number, idx: number) => (
              <div
                key={idx}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid var(--accent-amber)',
                  color: 'var(--accent-amber)',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
                className="flex-center"
              >
                {nId}
              </div>
            ))}
          </div>
        </div>

        {/* Visited list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            Visited Order:
          </span>
          <div style={{
            display: 'flex',
            gap: 6,
            background: 'rgba(5, 8, 20, 0.4)',
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            padding: '8px 12px',
            minHeight: 40,
            alignItems: 'center',
            overflowX: 'auto'
          }}>
            {visited.map((nId: number, idx: number) => (
              <div
                key={idx}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid var(--accent-purple)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
                className="flex-center"
              >
                {nId}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;
