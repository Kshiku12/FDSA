import React, { useState } from 'react';
import type { CompanyTrack, Problem, UserProgress } from '../types';
import { companySheets } from '../data/companySheets';
import { dsaProblems } from '../data/dsaProblems';
import { ArrowRight, Award, Compass, MessageSquareCode } from 'lucide-react';

interface CompanyTracksProps {
  progress: UserProgress;
  setSelectedProblem: (problem: Problem | null) => void;
  setActiveTab: (tab: string) => void;
}

export const CompanyTracks: React.FC<CompanyTracksProps> = ({ progress, setSelectedProblem, setActiveTab }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const selectedCompany = companySheets.find(c => c.id === selectedCompanyId);

  // Calculate company progress
  const getCompanyProgress = (company: CompanyTrack) => {
    const solved = company.problemIds.filter(id => progress.completedProblemIds.includes(id)).length;
    const total = company.problemIds.length;
    const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { solved, total, percent };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div>
        <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Company Tracks</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
          Target your prep towards specific patterns and questions asked at top product firms and startups.
        </p>
      </div>

      {!selectedCompanyId ? (
        /* Company List Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {companySheets.map(company => {
            const { solved, total, percent } = getCompanyProgress(company);
            return (
              <div
                key={company.id}
                onClick={() => setSelectedCompanyId(company.id)}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Decorative Brand Light */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 6,
                  height: '100%',
                  background: company.accentColor
                }} />

                {/* Company Name Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: company.color,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }} className="flex-center">
                    {company.logo}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{company.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Difficulty: {company.difficulty}</span>
                  </div>
                </div>

                {/* Focus topics summary */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {company.focusTopics.slice(0, 3).map(topic => (
                    <span key={topic} style={{
                      fontSize: '0.65rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      color: 'var(--text-muted)'
                    }}>
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Curated Questions</span>
                    <span style={{ fontWeight: 600 }}>{percent}% ({solved}/{total})</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: company.accentColor,
                      width: `${percent}%`,
                      transition: 'width 0.4s ease-out'
                    }} />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  color: company.accentColor,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  alignItems: 'center',
                  gap: 4
                }}>
                  View Preparation Track <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Company View */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
          {/* Left panel: Company details & Interview Pattern */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Back Button */}
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedCompanyId(null)}
              style={{ width: 'fit-content', padding: '6px 12px', fontSize: '0.8rem' }}
            >
              ← Back to tracks
            </button>

            {/* Profile Summary Card */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: selectedCompany?.color,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.4rem'
                }} className="flex-center">
                  {selectedCompany?.logo}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{selectedCompany?.name}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Difficulty: {selectedCompany?.difficulty}</span>
                </div>
              </div>

              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)' }} />

              {/* Focus topics */}
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Focus Areas:</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {selectedCompany?.focusTopics.map(topic => (
                    <span key={topic} style={{
                      fontSize: '0.7rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      padding: '3px 8px',
                      borderRadius: 6,
                      color: 'var(--text-main)'
                    }}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preparation Strategy Tips */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Compass size={16} style={{ color: 'var(--accent-cyan)' }} /> Placement Guidelines
              </h3>
              <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {selectedCompany?.id === 'google' && (
                  <>
                    <li>Expect abstract problem definitions; formulate math constraints.</li>
                    <li>Always discuss edge cases before code (empty arrays, large coordinates, recursion stack limits).</li>
                    <li>Focus heavily on DFS/BFS, graph cycles, topological sorts, and trie structures.</li>
                  </>
                )}
                {selectedCompany?.id === 'amazon' && (
                  <>
                    <li>Devote significant effort to Amazon Leadership Principles; they carry 50% weight in reviews.</li>
                    <li>Ensure you write complete, working code; dry-run it yourself with a sample test input.</li>
                    <li>Common concepts: Priority Queues, Binary Trees, sliding window.</li>
                  </>
                )}
                {selectedCompany?.id === 'microsoft' && (
                  <>
                    <li>Microsoft loves tree structure traversals, reversing list subsegments, and hash table mappings.</li>
                    <li>Be ready to refactor: "If space constraints were O(1), how would you modify the solution?"</li>
                    <li>Understand standard OOPs architectures.</li>
                  </>
                )}
                {selectedCompany?.id === 'swiggy' && (
                  <>
                    <li>Be prepared for Machine Coding Round: you must design modular, clean classes with interfaces.</li>
                    <li>Practice DP and Grid-based backtracking (like robot pathfinding, coin change).</li>
                    <li>Revise core CS subjects (especially DB transactions and indexing).</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Right panel: Interview Structure & Curated questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Interview Rounds structure */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquareCode size={18} style={{ color: selectedCompany?.accentColor }} />
                Hiring Pattern & Rounds
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {selectedCompany?.interviewPattern.map((round, idx) => (
                  <div key={idx} style={{
                    padding: '14px 18px',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 10,
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: -10,
                      top: 14,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: selectedCompany.accentColor,
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }} className="flex-center">
                      {idx + 1}
                    </span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginLeft: 6, marginBottom: 4 }}>{round.roundName}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 6, lineHeight: 1.4 }}>{round.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Curated Company Question Sheet */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} style={{ color: 'var(--accent-amber)' }} />
                Most Frequent Questions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedCompany?.problemIds.map(probId => {
                  const problem = dsaProblems.find(p => p.id === probId);
                  if (!problem) return null;

                  const isCompleted = progress.completedProblemIds.includes(problem.id);
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
                        background: isCompleted ? 'rgba(16, 185, 129, 0.02)' : 'rgba(255,255,255,0.01)',
                        border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.04)'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: isCompleted ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)'
                        }} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{problem.title}</span>
                        <span className={`badge ${diffClass}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{problem.difficulty}</span>
                      </div>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 8 }}
                        onClick={() => {
                          setSelectedProblem(problem);
                          setActiveTab('dsa');
                        }}
                      >
                        Solve
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
