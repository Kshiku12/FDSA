export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  input: string;
  output: string;
}

export interface CodeTemplates {
  javascript: string;
  python: string;
  cpp: string;
  java: string;
}

export interface ProblemSolution {
  intuition: string;
  algorithm: string;
  complexity: {
    time: string;
    space: string;
  };
  code: CodeTemplates;
  youtubeUrl?: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topicId: string;
  subtopicId: string;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: TestCase[];
  companies: string[];
  starterCode: CodeTemplates;
  solution: ProblemSolution;
}

export interface SubTopic {
  id: string;
  name: string;
  problems: Problem[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  subtopics: SubTopic[];
}

export interface CSQuestion {
  id: string;
  subject: 'OS' | 'DBMS' | 'CN' | 'System Design' | 'OOPs';
  category: string;
  question: string;
  answer: string;
  visualConcept?: string;
}

export interface CompanyTrack {
  id: string;
  name: string;
  logo: string;
  color: string;
  accentColor: string;
  difficulty: string;
  interviewPattern: {
    roundName: string;
    description: string;
  }[];
  focusTopics: string[];
  problemIds: string[];
}

export interface MockTestAttempt {
  id: string;
  companyId: string;
  companyName: string;
  timestamp: string;
  timeRemaining: number; // in seconds
  score: number;
  totalQuestions: number;
  problemIds: string[];
  solvedIds: string[];
  finished: boolean;
}

export interface SqlChallenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  schema: string;
  expectedQuery: string;
  initialQuery: string;
  tables: {
    name: string;
    columns: string[];
    rows: Record<string, any>[];
  }[];
}

export interface UserProgress {
  completedProblemIds: string[];
  inProgressProblemIds: string[];
  completedCsQuestionIds: string[];
  completedSqlQuestionIds: string[];
  importedProblems: Problem[];
  mockTestAttempts: MockTestAttempt[];
  notes: Record<string, string>;
  streaks: {
    current: number;
    lastActiveDate: string | null;
    history: string[];
  };
  emailSettings?: {
    enabled: boolean;
    emailAddress: string;
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  provider: 'local' | 'google';
}

