import React, { useState, useMemo } from 'react';
import type { Problem, UserProgress, Topic } from '../types';
import { dsaTopics } from '../data/dsaProblems';
import { Search, ChevronDown, ChevronRight, CheckSquare, Square, ExternalLink, Plus } from 'lucide-react';

interface DsaTopicsProps {
  progress: UserProgress;
  toggleProblemComplete: (id: string) => void;
  setSelectedProblem: (problem: Problem | null) => void;
  importProblem: (problem: Problem) => void;
}

// Scaffolder helper for custom LeetCode problems
const scaffoldLeetCodeProblem = (input: string, difficulty: 'Easy' | 'Medium' | 'Hard'): Problem => {
  let slug = input.trim();
  if (slug.includes('leetcode.com/problems/')) {
    const parts = slug.split('leetcode.com/problems/');
    slug = parts[1].split('/')[0];
  }
  
  slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
  if (!slug) {
    throw new Error('Could not parse a valid problem slug.');
  }

  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const camelCaseName = slug
    .split('-')
    .map((word, idx) => idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  return {
    id: `imported-${slug}`,
    title,
    slug,
    difficulty,
    topicId: 'imported',
    subtopicId: `imported-${difficulty.toLowerCase()}`,
    description: `Design a solution for "${title}". This custom problem was imported from LeetCode for offline practice.`,
    constraints: [
      "Verify time and space complexity constraints.",
      "Handle large input bounds gracefully."
    ],
    examples: [
      {
        input: "Refer to LeetCode for example cases.",
        output: "Refer to LeetCode for outputs."
      }
    ],
    testCases: [
      {
        input: "[]",
        output: "[]"
      }
    ],
    companies: ["LeetCode"],
    starterCode: {
      javascript: `function ${camelCaseName}(nums) {\n    // Write your code here\n    \n};`,
      python: `class Solution:\n    def ${camelCaseName}(self, nums) -> any:\n        pass`,
      cpp: `class Solution {\npublic:\n    any ${camelCaseName}(any nums) {\n        \n    }\n};`,
      java: `class Solution {\n    public Object ${camelCaseName}(Object nums) {\n        \n    }\n}`
    },
    solution: {
      intuition: `To solve "${title}", consider using standard approaches. Utilize hash maps, sliding windows, or dynamic programming tables to minimize complexity.`,
      algorithm: `1. Setup pointers or state tracking variables.\n2. Iterate through elements (or process binary trees/graphs if applicable).\n3. Apply comparison logic.\n4. Return the calculated answer.`,
      complexity: {
        time: "O(N)",
        space: "O(1)"
      },
      code: {
        javascript: `function ${camelCaseName}(nums) {\n    // Optimal code template\n    return null;\n}`,
        python: `def ${camelCaseName}(nums):\n    # Optimal code template\n    return None`,
        cpp: `// C++ Optimal Solution template`,
        java: `// Java Optimal Solution template`
      },
      youtubeUrl: `https://www.youtube.com/results?search_query=neetcode+striver+${encodeURIComponent(title)}+solution`
    }
  };
};

export const DsaTopics: React.FC<DsaTopicsProps> = ({
  progress,
  toggleProblemComplete,
  setSelectedProblem,
  importProblem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    'arrays': true,
    'linkedlists': true,
    'trees': true,
  });

  // Importer states
  const [leetcodeInput, setLeetcodeInput] = useState('');
  const [importDifficulty, setImportDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [importError, setImportError] = useState('');

  const toggleTopicExpand = (topicId: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  // Filter problems within subtopics
  const filterProblem = (problem: Problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          problem.companies.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  };

  // Build topics list dynamically by adding any custom imported problems
  const allTopics = useMemo(() => {
    const standardTopics = [...dsaTopics];
    if (progress.importedProblems && progress.importedProblems.length > 0) {
      const importedTopic: Topic = {
        id: 'imported',
        name: 'Imported Custom Problems',
        description: 'Problems imported by slug or link from LeetCode.',
        subtopics: [
          {
            id: 'imported-easy',
            name: 'Easy Problems',
            problems: progress.importedProblems.filter(p => p.difficulty === 'Easy')
          },
          {
            id: 'imported-medium',
            name: 'Medium Problems',
            problems: progress.importedProblems.filter(p => p.difficulty === 'Medium')
          },
          {
            id: 'imported-hard',
            name: 'Hard Problems',
            problems: progress.importedProblems.filter(p => p.difficulty === 'Hard')
          }
        ].filter(sub => sub.problems.length > 0)
      };
      
      // Auto expand imported topic when created
      setExpandedTopics(prev => ({ ...prev, 'imported': true }));

      return [...standardTopics, importedTopic];
    }
    return standardTopics;
  }, [progress.importedProblems]);

  const handleImport = () => {
    setImportError('');
    if (!leetcodeInput.trim()) {
      setImportError('Please enter a LeetCode URL or slug.');
      return;
    }

    try {
      let slug = leetcodeInput.trim();
      if (slug.includes('leetcode.com/problems/')) {
        const parts = slug.split('leetcode.com/problems/');
        slug = parts[1].split('/')[0];
      }
      
      slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
      if (!slug) {
        throw new Error('Could not parse a valid problem slug.');
      }

      // Check standard problems
      const existing = dsaTopics.flatMap(t => t.subtopics.flatMap(s => s.problems)).find(p => p.slug === slug || p.id === slug);
      if (existing) {
        setLeetcodeInput('');
        setSelectedProblem(existing);
        alert(`Problem "${existing.title}" is already in the sheet! Redirected to sandbox.`);
        return;
      }

      // Check imported problems
      const alreadyImported = progress.importedProblems?.find(p => p.id === `imported-${slug}`);
      if (alreadyImported) {
        setLeetcodeInput('');
        setSelectedProblem(alreadyImported);
        alert(`Problem "${alreadyImported.title}" was already imported! Redirected to sandbox.`);
        return;
      }

      const newProblem = scaffoldLeetCodeProblem(leetcodeInput, importDifficulty);
      importProblem(newProblem);
      setLeetcodeInput('');
      setSelectedProblem(newProblem);
      alert(`Successfully imported "${newProblem.title}"! Redirected to sandbox.`);
    } catch (err: any) {
      setImportError(err.message || 'Failed to import problem. Check format.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div>
        <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>DSA Placement Sheet</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
          Curated A2Z-style worksheets spanning arrays, linked lists, trees, graphs, and dynamic programming.
        </p>
      </div>

      {/* LeetCode Importer Form */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        border: '1px solid rgba(139, 92, 246, 0.25)',
        background: 'rgba(139, 92, 246, 0.03)',
        boxShadow: '0 0 15px rgba(139, 92, 246, 0.05)',
        borderRadius: 12
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
            <Plus size={16} /> Quick LeetCode Importer
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Scaffold any LeetCode question by URL or slug to practice offline
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter LeetCode URL or Slug (e.g., two-sum or https://leetcode.com/problems/two-sum/)"
            value={leetcodeInput}
            onChange={(e) => setLeetcodeInput(e.target.value)}
            style={{
              flex: 1,
              minWidth: 250,
              background: 'rgba(5, 8, 20, 0.45)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <select
            value={importDifficulty}
            onChange={(e) => setImportDifficulty(e.target.value as any)}
            style={{
              background: 'rgba(5, 8, 20, 0.45)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <button
            onClick={handleImport}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 8 }}
          >
            Import
          </button>
        </div>
        {importError && (
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', margin: 0 }}>{importError}</div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-light)',
          borderRadius: 8,
          padding: '6px 12px',
          width: '100%',
          maxWidth: 320,
        }}>
          <Search size={16} style={{ color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search problems or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              outline: 'none',
              fontSize: '0.9rem',
              width: '100%'
            }}
          />
        </div>

        {/* Difficulty filter buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              style={{
                background: difficultyFilter === diff ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${difficultyFilter === diff ? 'var(--accent-purple)' : 'var(--border-light)'}`,
                color: difficultyFilter === diff ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '6px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.8rem',
                transition: 'all var(--transition-fast)'
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Topics List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {allTopics.map(topic => {
          // Count total and solved in this topic
          const allProblemsInTopic: Problem[] = [];
          topic.subtopics.forEach(sub => {
            sub.problems.forEach(p => allProblemsInTopic.push(p));
          });

          const solvedInTopic = allProblemsInTopic.filter(p => progress.completedProblemIds.includes(p.id)).length;
          const totalInTopic = allProblemsInTopic.length;
          
          const filteredProblemsCount = allProblemsInTopic.filter(filterProblem).length;

          // Hide topic completely if filters are active and no problems match
          if (filteredProblemsCount === 0 && (searchQuery || difficultyFilter !== 'All')) {
            return null;
          }

          const isExpanded = expandedTopics[topic.id] || false;

          return (
            <div key={topic.id} className="glass-panel" style={{ overflow: 'hidden' }}>
              {/* Accordion Header */}
              <div 
                onClick={() => toggleTopicExpand(topic.id)}
                style={{
                  padding: '18px 24px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {isExpanded ? <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{topic.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{topic.description}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Progress Indicator */}
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: solvedInTopic === totalInTopic ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                    color: solvedInTopic === totalInTopic ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: `1px solid ${solvedInTopic === totalInTopic ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-light)'}`
                  }}>
                    {solvedInTopic} / {totalInTopic} Solved
                  </span>
                </div>
              </div>

              {/* Accordion Body */}
              {isExpanded && (
                <div style={{ padding: '8px 24px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {topic.subtopics.map(subtopic => {
                    const matchingProblems = subtopic.problems.filter(filterProblem);
                    
                    if (matchingProblems.length === 0) return null;

                    return (
                      <div key={subtopic.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {/* Subtopic Header */}
                        <div style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--accent-cyan)',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          marginTop: 8
                        }}>
                          {subtopic.name}
                        </div>

                        {/* Problems Table/List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {matchingProblems.map(problem => {
                            const isCompleted = progress.completedProblemIds.includes(problem.id);
                            const isInProgress = progress.inProgressProblemIds.includes(problem.id);

                            let diffClass = 'badge-easy';
                            if (problem.difficulty === 'Medium') diffClass = 'badge-medium';
                            if (problem.difficulty === 'Hard') diffClass = 'badge-hard';

                            return (
                              <div
                                key={problem.id}
                                className="glass-panel"
                                style={{
                                  padding: '12px 18px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: isCompleted ? 'rgba(16, 185, 129, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                                  border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)'}`,
                                  borderRadius: 10,
                                  transition: 'all var(--transition-fast)'
                                }}
                              >
                                {/* Left side: Checkbox + Title + Difficulty */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                                  {/* Completion Checkbox */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleProblemComplete(problem.id);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: isCompleted ? 'var(--accent-emerald)' : 'var(--text-dim)',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    {isCompleted ? <CheckSquare size={20} style={{ fill: 'rgba(16,185,129,0.1)' }} /> : <Square size={20} />}
                                  </button>

                                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                                    <span 
                                      onClick={() => setSelectedProblem(problem)}
                                      style={{
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        color: isCompleted ? 'rgba(255,255,255,0.7)' : 'var(--text-main)',
                                        borderBottom: '1px solid transparent',
                                        transition: 'all 0.2s'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isCompleted) e.currentTarget.style.color = 'var(--accent-cyan)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.color = isCompleted ? 'rgba(255,255,255,0.7)' : 'var(--text-main)';
                                      }}
                                    >
                                      {problem.title}
                                    </span>
                                    <span className={`badge ${diffClass}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                      {problem.difficulty}
                                    </span>

                                    {/* Company tags */}
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginLeft: 8 }}>
                                      {problem.companies.map(company => (
                                        <span
                                          key={company}
                                          style={{
                                            fontSize: '0.65rem',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            color: 'var(--text-muted)',
                                            padding: '1px 6px',
                                            borderRadius: 4,
                                          }}
                                        >
                                          {company}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Right side: Progress Status + Action Button */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  {isInProgress && !isCompleted && (
                                    <span style={{
                                      fontSize: '0.75rem',
                                      color: 'var(--accent-amber)',
                                      background: 'rgba(245, 158, 11, 0.08)',
                                      padding: '2px 8px',
                                      borderRadius: 6,
                                      border: '1px solid rgba(245, 158, 11, 0.15)',
                                    }}>
                                      In Progress
                                    </span>
                                  )}
                                  <button
                                    onClick={() => setSelectedProblem(problem)}
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 8 }}
                                  >
                                    Solve <ExternalLink size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
