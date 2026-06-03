import React, { useState } from 'react';
import type { UserProgress } from '../types';
import { csCoreQuestions } from '../data/csCoreQuestions';
import { CheckSquare, Square, ChevronDown, ChevronUp, GraduationCap, Trophy, RefreshCw } from 'lucide-react';

interface CsCoreProps {
  progress: UserProgress;
  toggleCsQuestionComplete: (id: string) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  subject: string;
}

const quizQuestionsPool: QuizQuestion[] = [
  {
    subject: 'OS',
    question: 'Which CPU scheduling algorithm can lead to starvation/indefinite blocking of processes?',
    options: ['Round Robin', 'Shortest Job First (non-preemptive)', 'First In First Out', 'Priority Scheduling'],
    answerIndex: 3,
    explanation: 'Priority Scheduling can lead to starvation because low-priority processes may never execute if high-priority processes are constantly entering the queue. SJF can also cause starvation for long jobs, but Priority Scheduling is the most direct cause when low priority is starved.'
  },
  {
    subject: 'DBMS',
    question: 'In ACID properties, which property ensures that database transactions survive system crashes?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    answerIndex: 3,
    explanation: 'Durability ensures that once a transaction has committed, its changes are permanently written to non-volatile storage and will survive any crash.'
  },
  {
    subject: 'CN',
    question: 'Which OSI layer is responsible for routing packets across different network networks?',
    options: ['Transport Layer', 'Network Layer', 'Data Link Layer', 'Physical Layer'],
    answerIndex: 1,
    explanation: 'The Network Layer handles packet routing, logical addressing (IP addresses), and finding the best path through a network.'
  },
  {
    subject: 'System Design',
    question: 'Which caching write strategy writes to the cache and the database synchronously?',
    options: ['Write-Back', 'Write-Through', 'Cache-Aside', 'Lazy Loading'],
    answerIndex: 1,
    explanation: 'Write-Through writes to the cache and the database at the same time, ensuring the cache is never stale at the expense of write latency.'
  },
  {
    subject: 'OOPs',
    question: 'Which OOP concept states that "Software entities should be open for extension but closed for modification"?',
    options: ['Single Responsibility Principle', 'Liskov Substitution Principle', 'Open/Closed Principle', 'Dependency Inversion Principle'],
    answerIndex: 2,
    explanation: 'The Open/Closed Principle (OCP) states that software classes/modules should be open for extension (adding new behaviors) but closed for modification.'
  }
];

export const CsCore: React.FC<CsCoreProps> = ({ progress, toggleCsQuestionComplete }) => {
  const [activeSubject, setActiveSubject] = useState<'All' | 'OS' | 'DBMS' | 'CN' | 'System Design' | 'OOPs'>('All');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  
  // Quiz states
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredQuestions = csCoreQuestions.filter(
    q => activeSubject === 'All' || q.subject === activeSubject
  );

  const startQuiz = () => {
    setQuizActive(true);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return; // Answer locked
    setSelectedOption(idx);
    if (idx === quizQuestionsPool[currentQuizIndex].answerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    setSelectedOption(null);
    if (currentQuizIndex + 1 < quizQuestionsPool.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>CS Core Subjects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
            Review high-frequency interview worksheets for Operating Systems, Databases, Computer Networks, and System Design.
          </p>
        </div>

        {/* Start Quiz button */}
        {!quizActive && (
          <button 
            className="btn btn-primary pulse-glow-purple" 
            onClick={startQuiz}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Trophy size={16} /> Take Quick Quiz
          </button>
        )}
      </div>

      {/* QUIZ INTERFACE */}
      {quizActive && (
        <div className="glass-panel" style={{
          padding: '24px 30px',
          background: 'linear-gradient(135deg, rgba(16, 22, 47, 0.8) 0%, rgba(13, 10, 38, 0.8) 100%)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--glow-shadow)',
          position: 'relative',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 14, marginBottom: 20 }}>
            <span style={{ fontWeight: 700, color: 'var(--accent-purple)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <GraduationCap size={20} /> CS Placement Practice Quiz
            </span>
            <button 
              className="btn btn-ghost" 
              style={{ padding: '2px 8px', fontSize: '0.8rem' }}
              onClick={() => setQuizActive(false)}
            >
              Exit Quiz
            </button>
          </div>

          {!quizFinished ? (
            <div>
              {/* Progress Indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 8 }}>
                <span>Question {currentQuizIndex + 1} of {quizQuestionsPool.length}</span>
                <span>Subject: {quizQuestionsPool[currentQuizIndex].subject}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2, marginBottom: 20 }}>
                <div style={{
                  height: '100%',
                  background: 'var(--accent-purple)',
                  width: `${((currentQuizIndex + 1) / quizQuestionsPool.length) * 100}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* Question */}
              <h2 style={{ fontSize: '1.25rem', marginBottom: 20, fontWeight: 600 }}>
                {quizQuestionsPool[currentQuizIndex].question}
              </h2>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {quizQuestionsPool[currentQuizIndex].options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === quizQuestionsPool[currentQuizIndex].answerIndex;
                  
                  let optionBg = 'rgba(255,255,255,0.03)';
                  let optionBorder = 'var(--border-light)';
                  
                  if (selectedOption !== null) {
                    if (isCorrect) {
                      optionBg = 'rgba(16, 185, 129, 0.08)';
                      optionBorder = 'rgba(16, 185, 129, 0.4)';
                    } else if (isSelected) {
                      optionBg = 'rgba(244, 63, 94, 0.08)';
                      optionBorder = 'rgba(244, 63, 94, 0.4)';
                    }
                  } else {
                    // Hover effect handled by JS
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={selectedOption !== null}
                      style={{
                        background: optionBg,
                        border: `1px solid ${optionBorder}`,
                        borderRadius: 10,
                        padding: '14px 20px',
                        color: isSelected ? '#fff' : 'var(--text-main)',
                        textAlign: 'left',
                        cursor: selectedOption === null ? 'pointer' : 'default',
                        fontSize: '0.95rem',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Explanation block */}
              {selectedOption !== null && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 10,
                  padding: '16px',
                  border: '1px solid var(--border-light)',
                  marginBottom: 20
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '0.85rem', marginBottom: 4 }}>EXPLANATION:</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {quizQuestionsPool[currentQuizIndex].explanation}
                  </p>
                </div>
              )}

              {/* Bottom Actions */}
              {selectedOption !== null && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={nextQuizQuestion}>
                    {currentQuizIndex + 1 === quizQuestionsPool.length ? 'Finish Quiz' : 'Next Question'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0' }} className="flex-center">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  border: '2px dashed var(--accent-emerald)',
                }} className="flex-center">
                  <Trophy size={36} style={{ color: 'var(--accent-emerald)' }} />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Quiz Completed!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                  You scored <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{score}</span> out of {quizQuestionsPool.length}.
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <button className="btn btn-secondary" onClick={startQuiz}>
                    <RefreshCw size={14} /> Try Again
                  </button>
                  <button className="btn btn-primary" onClick={() => setQuizActive(false)}>
                    Back to worksheets
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subject Toggles */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['All', 'OS', 'DBMS', 'CN', 'System Design', 'OOPs'] as const).map(sub => (
          <button
            key={sub}
            onClick={() => setActiveSubject(sub)}
            style={{
              background: activeSubject === sub ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${activeSubject === sub ? 'var(--accent-cyan)' : 'var(--border-light)'}`,
              color: activeSubject === sub ? 'var(--text-main)' : 'var(--text-muted)',
              padding: '8px 18px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            {sub === 'CN' ? 'Computer Networks' : sub}
          </button>
        ))}
      </div>

      {/* Question Accordion Grid */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filteredQuestions.map(q => {
          const isExpanded = expandedQuestions[q.id] || false;
          const isCompleted = progress.completedCsQuestionIds.includes(q.id);

          return (
            <div 
              key={q.id} 
              className="glass-panel" 
              style={{
                border: isExpanded ? '1px solid var(--border-glow)' : '1px solid var(--border-light)',
                boxShadow: isExpanded ? 'var(--glow-shadow)' : 'none',
                background: isCompleted ? 'rgba(16, 185, 129, 0.02)' : 'var(--bg-card)',
                transition: 'all var(--transition-normal)'
              }}
            >
              {/* Question Header */}
              <div 
                onClick={() => toggleQuestion(q.id)}
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                  {/* Mark Prepared checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCsQuestionComplete(q.id);
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: '0.65rem',
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                        color: 'var(--accent-cyan)',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontWeight: 700
                      }}>
                        {q.subject}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{q.category}</span>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: isExpanded ? '#fff' : 'var(--text-main)' }}>
                      {q.question}
                    </span>
                  </div>
                </div>

                <div style={{ paddingLeft: 12 }}>
                  {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </div>

              {/* Question Body */}
              {isExpanded && (
                <div style={{
                  padding: '0 24px 24px 58px',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: 20
                }}>
                  {/* Answer Text formatting */}
                  <div 
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      color: 'var(--text-main)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    {/* Render basic markdown blocks manually for clean styled content */}
                    {q.answer.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return <h4 key={pIdx} style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem', marginTop: 10, marginBottom: 4 }}>{paragraph.replace('### ', '')}</h4>;
                      }
                      if (paragraph.startsWith('#### ')) {
                        return <h5 key={pIdx} style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginTop: 8 }}>{paragraph.replace('#### ', '')}</h5>;
                      }
                      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                        return (
                          <ul key={pIdx} style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {paragraph.split('\n').map((li, liIdx) => (
                              <li key={liIdx} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {li.substring(2)}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (paragraph.startsWith('| ')) {
                        // Render standard Markdown table
                        const rows = paragraph.split('\n');
                        const headers = rows[0].split('|').map(x => x.trim()).filter(Boolean);
                        const dataRows = rows.slice(2).map(r => r.split('|').map(x => x.trim()).filter(Boolean));

                        return (
                          <div key={pIdx} style={{ overflowX: 'auto', margin: '12px 0' }}>
                            <table style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              fontSize: '0.85rem',
                              border: '1px solid var(--border-light)',
                              textAlign: 'left'
                            }}>
                              <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                                  {headers.map((h, hIdx) => (
                                    <th key={hIdx} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)', fontWeight: 600 }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {dataRows.map((dr, drIdx) => (
                                  <tr key={drIdx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    {dr.map((val, valIdx) => (
                                      <td key={valIdx} style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{val}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      return (
                        <p key={pIdx} style={{ color: 'var(--text-muted)' }}>
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>

                  {/* Render Visual Concept Diagram if present */}
                  {q.visualConcept && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontWeight: 600, color: 'var(--accent-purple)', fontSize: '0.8rem', marginBottom: 8, textTransform: 'uppercase' }}>
                        Visual Concept:
                      </div>
                      <pre style={{
                        background: 'rgba(5, 8, 20, 0.5)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: 8,
                        padding: '14px',
                        color: 'var(--accent-cyan)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        overflowX: 'auto',
                        lineHeight: 1.4
                      }}>
                        {q.visualConcept}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
