import React, { useState, useEffect } from 'react';
import { Play, SkipForward, RotateCcw, Eye } from 'lucide-react';

interface TreeNodeVisual {
  id: number;
  val: string;
  x: number;
  y: number;
  leftId?: number;
  rightId?: number;
}

// Coordinate layout builder
const buildTreeFromArr = (arr: (number | null)[]): Record<number, TreeNodeVisual> => {
  const result: Record<number, TreeNodeVisual> = {};
  if (arr.length === 0 || arr[0] === null) return result;
  
  const queue: { idx: number; id: number; x: number; y: number; level: number }[] = [
    { idx: 0, id: 1, x: 200, y: 35, level: 0 }
  ];
  
  let nextNodeId = 2;
  
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.idx >= arr.length || arr[curr.idx] === null) continue;
    
    const nodeVal = String(arr[curr.idx]);
    const node: TreeNodeVisual = {
      id: curr.id,
      val: nodeVal,
      x: curr.x,
      y: curr.y
    };
    
    const leftIdx = 2 * curr.idx + 1;
    if (leftIdx < arr.length && arr[leftIdx] !== null) {
      const leftId = nextNodeId++;
      const xShift = 100 / Math.pow(1.6, curr.level); // adaptive coordinate sizing
      node.leftId = leftId;
      queue.push({
        idx: leftIdx,
        id: leftId,
        x: curr.x - xShift,
        y: curr.y + 55,
        level: curr.level + 1
      });
    }
    
    const rightIdx = 2 * curr.idx + 2;
    if (rightIdx < arr.length && arr[rightIdx] !== null) {
      const rightId = nextNodeId++;
      const xShift = 100 / Math.pow(1.6, curr.level);
      node.rightId = rightId;
      queue.push({
        idx: rightIdx,
        id: rightId,
        x: curr.x + xShift,
        y: curr.y + 55,
        level: curr.level + 1
      });
    }
    
    result[curr.id] = node;
  }
  
  return result;
};

// Generates traversal orders on custom tree
const getTraversalOrder = (tree: Record<number, TreeNodeVisual>, type: string): number[] => {
  const order: number[] = [];
  if (!tree[1]) return order;
  
  const traverse = (nodeId: number | undefined) => {
    if (!nodeId || !tree[nodeId]) return;
    const node = tree[nodeId];
    if (type === 'preorder') order.push(nodeId);
    traverse(node.leftId);
    if (type === 'inorder') order.push(nodeId);
    traverse(node.rightId);
    if (type === 'postorder') order.push(nodeId);
  };
  
  if (type === 'levelorder') {
    const queue = [1];
    while (queue.length > 0) {
      const currId = queue.shift()!;
      if (tree[currId]) {
        order.push(currId);
        const node = tree[currId];
        if (node.leftId) queue.push(node.leftId);
        if (node.rightId) queue.push(node.rightId);
      }
    }
  } else {
    traverse(1);
  }
  
  return order;
};

export const TreeVisualizer: React.FC<{ initialArray?: string }> = ({ initialArray }) => {
  const defaultVal = initialArray || '[1, 2, 3, 4, 5, 6, 7]';
  const [inputText, setInputText] = useState<string>(defaultVal);
  const [treeNodes, setTreeNodes] = useState<Record<number, TreeNodeVisual>>(() => {
    try {
      const parsed = JSON.parse(defaultVal);
      if (Array.isArray(parsed)) return buildTreeFromArr(parsed);
    } catch(e) {}
    return buildTreeFromArr([1, 2, 3, 4, 5, 6, 7]);
  });
  const [traversalType, setTraversalType] = useState<'inorder' | 'preorder' | 'postorder' | 'levelorder'>('inorder');
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<number | null>(null);

  useEffect(() => {
    if (initialArray) {
      setInputText(initialArray);
      try {
        const parsed = JSON.parse(initialArray);
        if (Array.isArray(parsed)) {
          setTreeNodes(buildTreeFromArr(parsed));
          resetVisualizer();
        }
      } catch (e) {}
    }
  }, [initialArray]);

  const order = getTraversalOrder(treeNodes, traversalType);

  useEffect(() => {
    resetVisualizer();
  }, [traversalType, treeNodes]);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        handleStepForward();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, order]);

  const handleLoadTree = () => {
    try {
      const parsed = JSON.parse(inputText);
      if (!Array.isArray(parsed)) throw new Error('Input must be a valid array');
      const nodes = buildTreeFromArr(parsed);
      setTreeNodes(nodes);
      resetVisualizer();
    } catch (err: any) {
      alert(`Invalid tree array format: ${err.message}. E.g. [1, 2, 3, null, 5]`);
    }
  };

  const resetVisualizer = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    setVisitedNodes([]);
    setCurrentNodeId(null);
  };

  const handleStepForward = () => {
    if (currentStep + 1 < order.length) {
      const nextStep = currentStep + 1;
      const nextNodeId = order[nextStep];
      setCurrentStep(nextStep);
      setCurrentNodeId(nextNodeId);
      setVisitedNodes(prev => [...prev, nextNodeId]);
    } else {
      setIsPlaying(false);
      setCurrentNodeId(null);
    }
  };

  const startAutoPlay = () => {
    if (currentStep + 1 >= order.length) {
      setCurrentStep(-1);
      setVisitedNodes([]);
      setCurrentNodeId(null);
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(true);
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
          placeholder="e.g. [1, 2, 3, null, 4]"
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
        <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={handleLoadTree}>
          <Eye size={12} /> Render Tree
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
          <option value="inorder">Inorder (L - Root - R)</option>
          <option value="preorder">Preorder (Root - L - R)</option>
          <option value="postorder">Postorder (L - R - Root)</option>
          <option value="levelorder">Level-Order (BFS)</option>
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
            disabled={isPlaying || currentStep + 1 >= order.length}
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
        justifyContent: 'center',
        position: 'relative',
        height: 250
      }}>
        {Object.keys(treeNodes).length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }} className="flex-center">Empty tree. Input valid array.</div>
        ) : (
          <svg width="400" height="230" style={{ overflow: 'visible' }}>
            {/* Render Connections */}
            {Object.values(treeNodes).map(node => {
              const lines = [];
              if (node.leftId && treeNodes[node.leftId]) {
                const leftChild = treeNodes[node.leftId];
                lines.push(
                  <line
                    key={`l-${node.id}`}
                    x1={node.x}
                    y1={node.y}
                    x2={leftChild.x}
                    y2={leftChild.y}
                    stroke={visitedNodes.includes(node.id) && visitedNodes.includes(leftChild.id) ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.08)'}
                    strokeWidth={visitedNodes.includes(node.id) && visitedNodes.includes(leftChild.id) ? 3 : 1.5}
                    style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
                  />
                );
              }
              if (node.rightId && treeNodes[node.rightId]) {
                const rightChild = treeNodes[node.rightId];
                lines.push(
                  <line
                    key={`r-${node.id}`}
                    x1={node.x}
                    y1={node.y}
                    x2={rightChild.x}
                    y2={rightChild.y}
                    stroke={visitedNodes.includes(node.id) && visitedNodes.includes(rightChild.id) ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.08)'}
                    strokeWidth={visitedNodes.includes(node.id) && visitedNodes.includes(rightChild.id) ? 3 : 1.5}
                    style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
                  />
                );
              }
              return lines;
            })}

            {/* Render Nodes */}
            {Object.values(treeNodes).map(node => {
              const isCurrent = currentNodeId === node.id;
              const isVisited = visitedNodes.includes(node.id);

              let strokeColor = 'rgba(255, 255, 255, 0.15)';
              let fillBg = 'var(--bg-dark)';
              let labelColor = 'var(--text-main)';

              if (isCurrent) {
                strokeColor = 'var(--accent-cyan)';
                fillBg = 'rgba(6, 182, 212, 0.3)';
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
                    r="18"
                    fill={fillBg}
                    stroke={strokeColor}
                    strokeWidth={isCurrent ? 3 : 1.5}
                    className={isCurrent ? 'visual-node-visiting' : ''}
                    style={{ transition: 'all 0.3s' }}
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill={labelColor}
                    fontWeight="bold"
                    fontSize="0.85rem"
                  >
                    {node.val}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Traversal Output Sequence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
          Visited Sequence:
        </span>
        <div style={{
          display: 'flex',
          gap: 6,
          background: 'rgba(5, 8, 20, 0.4)',
          border: '1px solid var(--border-light)',
          borderRadius: 8,
          padding: '10px 14px',
          minHeight: 42,
          alignItems: 'center',
          overflowX: 'auto'
        }}>
          {visitedNodes.map((nId, idx) => (
            <div
              key={idx}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid var(--accent-purple)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                flexShrink: 0
              }}
              className="flex-center"
            >
              {treeNodes[nId]?.val}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default TreeVisualizer;
