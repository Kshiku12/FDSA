import type { CompanyTrack } from '../types';

export const companySheets: CompanyTrack[] = [
  {
    id: 'google',
    name: 'Google',
    logo: 'G',
    color: 'linear-gradient(135deg, #4285F4 0%, #34A853 40%, #FBBC05 70%, #EA4335 100%)',
    accentColor: '#4285F4',
    difficulty: 'Hard',
    interviewPattern: [
      {
        roundName: 'Online Assessment (OA)',
        description: 'Typically 2 hard DSA problems on an online editor, timed for 45-60 minutes. Focuses on Graphs, Advanced DP, and Segment Trees.'
      },
      {
        roundName: 'Technical Rounds (3-4 rounds)',
        description: '45-minute sessions with Google engineers. Emphasizes clean code, optimization, explaining edge cases, and runtime complexity. Heavy graph/tree focus.'
      },
      {
        roundName: 'Googleyness Round (1 round)',
        description: 'Behavioral interview checking cultural fit, handling ambiguity, teamwork, and ethics under pressure.'
      }
    ],
    focusTopics: ['Graphs', 'Dynamic Programming', 'Trees', 'Recursion & Backtracking'],
    problemIds: ['two-sum', 'binary-tree-inorder-traversal', 'number-of-islands']
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: 'a',
    color: 'linear-gradient(135deg, #232F3E 0%, #FF9900 100%)',
    accentColor: '#FF9900',
    difficulty: 'Medium to Hard',
    interviewPattern: [
      {
        roundName: 'Online Assessment',
        description: 'Usually contains 2 coding questions (medium difficulty) followed by a work simulation assessing Amazon Leadership Principles.'
      },
      {
        roundName: 'Technical Phone Screen',
        description: '1-2 rounds focusing on core coding skills, linked lists, arrays, and basic tree traversals.'
      },
      {
        roundName: 'Onsite / Loop Rounds',
        description: '3-4 rounds. Each round spends 15-20 minutes on Amazon Leadership Principles (essential!), followed by a technical design or coding problem.'
      }
    ],
    focusTopics: ['Trees & BST', 'Heap', 'Linked Lists', 'Arrays & Strings', 'System Design'],
    problemIds: ['two-sum', 'reverse-linked-list', 'climbing-stairs', 'binary-tree-inorder-traversal', 'number-of-islands']
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: 'M',
    color: 'linear-gradient(135deg, #00A4EF 0%, #7FBA00 50%, #F25022 100%)',
    accentColor: '#00A4EF',
    difficulty: 'Medium',
    interviewPattern: [
      {
        roundName: 'Codility Online Test',
        description: '2-3 coding problems assessing data structures and speed of implementation.'
      },
      {
        roundName: 'Technical Interview 1 & 2',
        description: 'DSA focus, especially Trees, Linked Lists, Stack/Queue, and Hash Tables. Expect follow-up questions asking to optimize space.'
      },
      {
        roundName: 'System Design & Manager Round',
        description: 'Checks low-level and high-level design of scalable products, alongside general computer science fundamentals (OS/DBMS).'
      }
    ],
    focusTopics: ['Linked Lists', 'Trees', 'Arrays & Hashing', 'Stacks & Queues'],
    problemIds: ['two-sum', 'reverse-linked-list', 'binary-tree-inorder-traversal', 'number-of-islands']
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    logo: 'S',
    color: 'linear-gradient(135deg, #FF6600 0%, #fc8019 100%)',
    accentColor: '#FF6600',
    difficulty: 'Medium',
    interviewPattern: [
      {
        roundName: 'Online Assessment',
        description: '2 coding problems on HackerEarth. Primarily focused on Arrays, Strings, and DP.'
      },
      {
        roundName: 'DSA Round (1-2 rounds)',
        description: 'Live coding rounds on structures like HashMaps, Sliding Window, DP grids, and Trees.'
      },
      {
        roundName: 'Machine Coding Round',
        description: '2-hour design round where you write complete, working code for a modular system (e.g., Delivery Assignment System, Wallet).'
      },
      {
        roundName: 'Hiring Manager Round',
        description: 'Discussion on past projects, architectural choices, scale, and general CS core subjects.'
      }
    ],
    focusTopics: ['Dynamic Programming', 'Arrays & Hashing', 'Heaps & Priority Queues', 'Machine Coding'],
    problemIds: ['two-sum', 'climbing-stairs', 'number-of-islands']
  }
];
