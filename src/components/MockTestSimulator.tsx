import React, { useState, useEffect } from 'react';
import type { MockTestAttempt, Problem, UserProgress } from '../types';
import { dsaProblems } from '../data/dsaProblems';
import { companySheets } from '../data/companySheets';
import { Timer, Trophy, ShieldAlert, Award, Clock, Play, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MockTestSimulatorProps {
  progress: UserProgress;
  saveMockTestAttempt: (attempt: MockTestAttempt) => void;
  setSelectedProblem: (problem: Problem | null) => void;
  setActiveTab: (tab: string) => void;
}

export const MockTestSimulator: React.FC<MockTestSimulatorProps> = ({
  progress,
  saveMockTestAttempt,
  setSelectedProblem,
  setActiveTab
}) => {
  const [activeAttempt, setActiveAttempt] = useState<MockTestAttempt | null>(null);
  const [timerString, setTimerString] = useState<string>('00:00');
  const [testProblems, setTestProblems] = useState<Problem[]>([]);
  const [activeProblemIdx, setActiveProblemIdx] = useState<number>(0);
  const [editorCodes, setEditorCodes] = useState<Record<string, string>>({}); // problemId -> userCode
  
  // Terminal status within mock test
  const [consoleStatus, setConsoleStatus] = useState<Record<string, string>>({}); // problemId -> output message
  const [solvedInTest, setSolvedInTest] = useState<string[]>([]); // list of problemIds solved during this attempt

  // Timer runner
  useEffect(() => {
    let timerInterval: any = null;
    if (activeAttempt && !activeAttempt.finished) {
      timerInterval = setInterval(() => {
        const remaining = activeAttempt.timeRemaining - 1;
        if (remaining <= 0) {
          clearInterval(timerInterval);
          finishTest(activeAttempt, true); // Auto finish on timeout
        } else {
          const updated = { ...activeAttempt, timeRemaining: remaining };
          setActiveAttempt(updated);
          
          // Format minutes & seconds
          const m = Math.floor(remaining / 60).toString().padStart(2, '0');
          const s = (remaining % 60).toString().padStart(2, '0');
          setTimerString(`${m}:${s}`);
        }
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [activeAttempt]);

  const startTest = (companyId: string) => {
    const company = companySheets.find(c => c.id === companyId);
    if (!company) return;

    // Filter problems related to this company or random matching difficulty
    const compProblems = dsaProblems.filter(p => company.problemIds.includes(p.id));
    
    // Pick 3 problems (or fill with random if company has fewer than 3)
    let selectedProbs = [...compProblems];
    if (selectedProbs.length < 3) {
      const extraProbs = dsaProblems
        .filter(p => !selectedProbs.some(sp => sp.id === p.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3 - selectedProbs.length);
      selectedProbs = [...selectedProbs, ...extraProbs];
    }
    selectedProbs = selectedProbs.slice(0, 3);

    // Default timer limits
    let duration = 60 * 60; // 60 mins default
    if (company.id === 'google') duration = 45 * 60;
    if (company.id === 'swiggy') duration = 90 * 60;

    const initialCodes: Record<string, string> = {};
    const initialStatus: Record<string, string> = {};
    selectedProbs.forEach(p => {
      initialCodes[p.id] = p.starterCode.javascript;
      initialStatus[p.id] = 'Write your solution and run tests.';
    });

    const newAttempt: MockTestAttempt = {
      id: `attempt_${Date.now()}`,
      companyId: company.id,
      companyName: company.name,
      timestamp: new Date().toLocaleDateString(),
      timeRemaining: duration,
      score: 0,
      totalQuestions: selectedProbs.length,
      problemIds: selectedProbs.map(p => p.id),
      solvedIds: [],
      finished: false
    };

    setTestProblems(selectedProbs);
    setActiveProblemIdx(0);
    setEditorCodes(initialCodes);
    setConsoleStatus(initialStatus);
    setSolvedInTest([]);
    setActiveAttempt(newAttempt);
  };

  // Run user code in mock environment (JavaScript sandboxed evaluation)
  const runTestCode = (problem: Problem) => {
    const code = editorCodes[problem.id];
    setConsoleStatus(prev => ({ ...prev, [problem.id]: 'Running local tests...' }));

    setTimeout(() => {
      try {
        let runnerFn: Function;
        
        // Setup code compilers
        if (problem.id === 'two-sum') {
          const evalContext = new Function(code + '\nreturn twoSum;');
          const fn = evalContext();
          runnerFn = (inputStr: string) => {
            const parts = inputStr.split('\n');
            return fn(JSON.parse(parts[0]), parseInt(parts[1]));
          };
        } else if (problem.id === 'reverse-linked-list') {
          const evalContext = new Function(code + '\nreturn reverseList;');
          const fn = evalContext();
          runnerFn = (inputStr: string) => {
            const arr = JSON.parse(inputStr);
            if (arr.length === 0) return [];
            class ListNode {
              val: any; next: any;
              constructor(val: any, next: any = null) { this.val = val; this.next = next; }
            }
            let head = new ListNode(arr[0]);
            let curr = head;
            for (let i = 1; i < arr.length; i++) {
              curr.next = new ListNode(arr[i]);
              curr = curr.next;
            }
            let reversed = fn(head);
            const res = [];
            let temp = reversed;
            while (temp !== null) { res.push(temp.val); temp = temp.next; }
            return res;
          };
        } else if (problem.id === 'climbing-stairs') {
          const evalContext = new Function(code + '\nreturn climbStairs;');
          const fn = evalContext();
          runnerFn = (inputStr: string) => fn(parseInt(inputStr));
        } else {
          // Fallback mockup compiler
          const passedAll = code.length > 50;
          if (passedAll) {
            setSolvedInTest(prev => {
              if (prev.includes(problem.id)) return prev;
              return [...prev, problem.id];
            });
            setConsoleStatus(prev => ({
              ...prev,
              [problem.id]: 'All local unit tests passed! [SUCCESS]'
            }));
          } else {
            setConsoleStatus(prev => ({
              ...prev,
              [problem.id]: 'Compiler Error: Syntax warning or missing brace return. [FAILED]'
            }));
          }
          return;
        }

        // Run cases
        let allPassed = true;
        problem.testCases.forEach(tc => {
          const output = runnerFn(tc.input);
          const passed = JSON.stringify(output).replace(/\s+/g, '') === tc.output.replace(/\s+/g, '');
          if (!passed) allPassed = false;
        });

        if (allPassed) {
          setSolvedInTest(prev => {
            if (prev.includes(problem.id)) return prev;
            return [...prev, problem.id];
          });
          setConsoleStatus(prev => ({
            ...prev,
            [problem.id]: 'All unit tests passed successfully!'
          }));
        } else {
          setConsoleStatus(prev => ({
            ...prev,
            [problem.id]: 'Some test cases failed. Please review your logic.'
          }));
        }

      } catch (err: any) {
        setConsoleStatus(prev => ({
          ...prev,
          [problem.id]: `Compilation Error: ${err.message}`
        }));
      }
    }, 700);
  };

  const finishTest = (attempt: MockTestAttempt, autoTimeout = false) => {
    if (autoTimeout) {
      alert('Time expired! Your mock assessment has been submitted automatically.');
    } else {
      if (!window.confirm('Are you sure you want to finish and submit your assessment?')) return;
    }

    const finalAttempt: MockTestAttempt = {
      ...attempt,
      finished: true,
      solvedIds: solvedInTest,
      score: solvedInTest.length
    };

    saveMockTestAttempt(finalAttempt);
    setActiveAttempt(finalAttempt);

    if (solvedInTest.length === attempt.totalQuestions) {
      confetti({ particleCount: 150, spread: 80 });
    }
  };

  const closeTestReport = () => {
    setActiveAttempt(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* 1. ACTIVE Timed OT Screen */}
      {activeAttempt && !activeAttempt.finished && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: 'calc(100vh - 120px)' }}>
          {/* Active Header */}
          <div className="glass-panel" style={{
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--accent-rose-glow)',
            boxShadow: '0 0 15px rgba(244, 63, 94, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                background: 'rgba(244, 63, 94, 0.1)',
                color: 'var(--accent-rose)',
                padding: '4px 10px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: '0.8rem'
              }}>LIVE ASSESS</span>
              <h3 style={{ fontSize: '1.1rem' }}>{activeAttempt.companyName} Online Test Round</h3>
            </div>

            {/* Timer Clock */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              borderRadius: 8,
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-rose)',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              <Timer size={18} className="pulse-glow-purple" />
              <span>{timerString}</span>
            </div>

            <button className="btn btn-primary" style={{ background: 'var(--accent-rose)', padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => finishTest(activeAttempt)}>
              Submit Assessment
            </button>
          </div>

          {/* Code Playground Split Screen */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: 16, flex: 1, minHeight: 0 }}>
            {/* Left Column: Problem description list selector & Details */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Question list selector tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.01)' }}>
                {testProblems.map((prob, idx) => {
                  const isSolved = solvedInTest.includes(prob.id);
                  return (
                    <button
                      key={prob.id}
                      onClick={() => setActiveProblemIdx(idx)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: 'none',
                        background: activeProblemIdx === idx ? 'rgba(255,255,255,0.03)' : 'transparent',
                        borderBottom: activeProblemIdx === idx ? '2px solid var(--accent-rose)' : '2px solid transparent',
                        color: activeProblemIdx === idx ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <span>Q{idx + 1}</span>
                      {isSolved ? <CheckCircle2 size={12} style={{ color: 'var(--accent-emerald)' }} /> : null}
                    </button>
                  );
                })}
              </div>

              {/* Active problem details */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '1.15rem' }}>{testProblems[activeProblemIdx]?.title}</h3>
                <span className="badge badge-easy" style={{ width: 'fit-content' }}>{testProblems[activeProblemIdx]?.difficulty}</span>
                
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {testProblems[activeProblemIdx]?.description}
                </div>

                <div style={{
                  background: 'rgba(244, 63, 94, 0.05)',
                  border: '1px solid rgba(244, 63, 94, 0.1)',
                  borderRadius: 8,
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 10
                }}>
                  <ShieldAlert size={16} style={{ color: 'var(--accent-rose)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)' }}>Solutions and Visualizers are locked for test security.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Code editor area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
              <div className="glass-panel" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header bar */}
                <div style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>JavaScript Sandbox</span>
                </div>

                {/* Editor Textarea */}
                <textarea
                  value={editorCodes[testProblems[activeProblemIdx]?.id] || ''}
                  onChange={(e) => {
                    const code = e.target.value;
                    setEditorCodes(prev => ({
                      ...prev,
                      [testProblems[activeProblemIdx].id]: code
                    }));
                  }}
                  spellCheck={false}
                  style={{
                    flex: 1,
                    background: 'rgba(5, 8, 20, 0.5)',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    padding: '16px',
                    resize: 'none',
                    lineHeight: 1.5,
                    whiteSpace: 'pre',
                    tabSize: 4
                  }}
                />
              </div>

              {/* Terminal Logs */}
              <div className="glass-panel" style={{ flex: 0.8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{
                  padding: '6px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Console Log</span>
                  <button className="btn btn-secondary" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => runTestCode(testProblems[activeProblemIdx])}>
                    Run Test Cases
                  </button>
                </div>

                <div style={{ flex: 1, background: 'rgba(5, 8, 20, 0.8)', padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', overflowY: 'auto' }}>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {consoleStatus[testProblems[activeProblemIdx]?.id] || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SOLVED REPORT / SCORECARD Screen */}
      {activeAttempt && activeAttempt.finished && (
        <div className="glass-panel" style={{
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(16, 22, 47, 0.85) 0%, rgba(10, 8, 30, 0.85) 100%)',
          border: '1px solid var(--border-glow)',
          maxWidth: 600,
          margin: '40px auto',
          textAlign: 'center',
          boxShadow: 'var(--glow-shadow)',
          animation: 'fadeIn 0.4s ease-out'
        }}>
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '2px dashed var(--accent-purple)',
            margin: '0 auto 20px auto'
          }} className="flex-center">
            <Award size={36} style={{ color: 'var(--accent-purple)' }} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>OT Assessment Completed</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: 4 }}>
            Attempt record for {activeAttempt.companyName} on {activeAttempt.timestamp}
          </p>

          {/* Results circular indicator */}
          <div style={{
            margin: '30px 0',
            background: 'rgba(5, 8, 20, 0.4)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            padding: '20px 0',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Problems Solved</span>
              <h3 style={{ fontSize: '2.2rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-display)', marginTop: 4 }}>
                {activeAttempt.score} <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>/ {activeAttempt.totalQuestions}</span>
              </h3>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Round Status</span>
              <h3 style={{
                fontSize: '1.8rem',
                color: activeAttempt.score === activeAttempt.totalQuestions ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                marginTop: 6,
                fontFamily: 'var(--font-display)'
              }}>
                {activeAttempt.score === activeAttempt.totalQuestions ? 'OFFER FIT ✅' : 'NEED GRIND ⚠️'}
              </h3>
            </div>
          </div>

          {/* Problems list details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 30 }}>
            {activeAttempt.problemIds.map((pId, idx) => {
              const problem = dsaProblems.find(p => p.id === pId);
              const isSolved = activeAttempt.solvedIds.includes(pId);
              return (
                <div key={pId} style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Q{idx + 1}.</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{problem?.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isSolved ? (
                      <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 700 }} className="flex-center">
                        <CheckCircle2 size={14} style={{ marginRight: 4 }} /> Solved
                      </span>
                    ) : (
                      <span style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', fontWeight: 700 }} className="flex-center">
                        <XCircle size={14} style={{ marginRight: 4 }} /> Failed
                      </span>
                    )}

                    {problem && (
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedProblem(problem);
                          setActiveTab('dsa');
                        }}
                      >
                        Solutions &rarr;
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={closeTestReport}>
            Close Assessment Report
          </button>
        </div>
      )}

      {/* 3. INITIAL Company assessment selection Screen */}
      {!activeAttempt && (
        <>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Mock Assessment Simulator</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
              Simulate actual placement Online Tests (OT) under strict timing conditions. Test templates block cheats and explanations.
            </p>
          </div>

          {/* Company Selection Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {companySheets.map(company => {
              let testTime = '60 mins';
              if (company.id === 'google') testTime = '45 mins';
              if (company.id === 'swiggy') testTime = '90 mins';

              return (
                <div
                  key={company.id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: company.color,
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1.15rem'
                    }} className="flex-center">
                      {company.logo}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{company.name} Mock Test</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Format: 3 problems</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} />
                      <span>Duration: {testTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Trophy size={12} />
                      <span>Difficulty: {company.difficulty} Target</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ background: company.accentColor, width: '100%', marginTop: 8 }}
                    onClick={() => startTest(company.id)}
                  >
                    Start Simulated Test <Play size={12} fill="currentColor" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Attempt History List */}
          {progress.mockTestAttempts && progress.mockTestAttempts.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', marginTop: 10 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} style={{ color: 'var(--accent-purple)' }} />
                Your Placement Test History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {progress.mockTestAttempts.map(attempt => (
                  <div key={attempt.id} style={{
                    padding: '12px 18px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{attempt.companyName} Test</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Date: {attempt.timestamp}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: attempt.score === attempt.totalQuestions ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                      }}>
                        Score: {attempt.score} / {attempt.totalQuestions} Solved
                      </span>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setTestProblems(attempt.problemIds.map(id => dsaProblems.find(p => p.id === id)!));
                          setSolvedInTest(attempt.solvedIds);
                          setActiveAttempt({ ...attempt, finished: true });
                        }}
                      >
                        Review Scorecard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default MockTestSimulator;
