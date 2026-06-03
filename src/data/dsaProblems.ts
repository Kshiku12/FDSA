import rawProblems from './problemsDatabaseLarge.json';
import type { Problem, Topic } from '../types';

export const dsaProblems = rawProblems as Problem[];

const topicMetadata = [
  { id: 'arrays', name: 'Arrays & Hashing', desc: 'Fundamental linear structures, maps, prefix sums, and two-pointer scenarios.' },
  { id: 'strings', name: 'Strings', desc: 'String operations, substring matching, anagram check, and patterns.' },
  { id: 'linkedlists', name: 'Linked Lists', desc: 'Singly, doubly and circular pointer references. Traversal and element re-linking.' },
  { id: 'stacks', name: 'Stacks & Queues', desc: 'LIFO and FIFO operations, expression parsing, and sliding windows.' },
  { id: 'trees', name: 'Trees & BST', desc: 'Binary trees, BSTs, Traversals (Pre, Post, In, Level order), and balances.' },
  { id: 'graphs', name: 'Graphs', desc: 'Node connectivity, BFS, DFS, Topological sorting, Shortest Path calculations.' },
  { id: 'dp', name: 'Dynamic Programming', desc: 'Subproblem caching, Memoization patterns, and bottom-up grid tables.' },
  { id: 'greedy', name: 'Greedy Algorithms', desc: 'Local optimal choices, sorting intervals, and greedy scheduling.' },
  { id: 'backtracking', name: 'Backtracking', desc: 'N-Queens, Sudoku, combinations, permutations and search space exploration.' },
  { id: 'advanced', name: 'Advanced Data Structures', desc: 'Tries, segment trees, binary indexed trees, and union-find.' }
];

export const dsaTopics: Topic[] = topicMetadata.map(meta => {
  const problemsInTopic = dsaProblems.filter(p => p.topicId === meta.id);
  
  return {
    id: meta.id,
    name: meta.name,
    description: meta.desc,
    subtopics: [
      {
        id: `${meta.id}-easy`,
        name: 'Easy Problems',
        problems: problemsInTopic.filter(p => p.difficulty === 'Easy')
      },
      {
        id: `${meta.id}-medium`,
        name: 'Medium Problems',
        problems: problemsInTopic.filter(p => p.difficulty === 'Medium')
      },
      {
        id: `${meta.id}-hard`,
        name: 'Hard Problems',
        problems: problemsInTopic.filter(p => p.difficulty === 'Hard')
      }
    ]
  };
});
