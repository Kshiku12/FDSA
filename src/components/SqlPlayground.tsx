import React, { useState } from 'react';
import type { UserProgress } from '../types';
import { Database, Play, Send, Table, Terminal, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SqlPlaygroundProps {
  progress: UserProgress;
  toggleSqlQuestionComplete: (id: string) => void;
}

interface SQLChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starterQuery: string;
  expectedResult: any[];
}

const mockEmployees = [
  { id: 1, name: 'Amit Sharma', role: 'SDE-2', salary: 95000, dept_id: 101 },
  { id: 2, name: 'Neha Gupta', role: 'SDE-1', salary: 70000, dept_id: 101 },
  { id: 3, name: 'Rohan Verma', role: 'Product Manager', salary: 110000, dept_id: 102 },
  { id: 4, name: 'Siddharth Roy', role: 'Data Scientist', salary: 85000, dept_id: 103 },
  { id: 5, name: 'Priya Iyer', role: 'QA Lead', salary: 75000, dept_id: 101 },
  { id: 6, name: 'Vikram Rao', role: 'HR Director', salary: 65000, dept_id: 104 }
];

const mockDepartments = [
  { id: 101, name: 'Engineering', location: 'Bangalore' },
  { id: 102, name: 'Product', location: 'Mumbai' },
  { id: 103, name: 'Data & Analytics', location: 'Bangalore' },
  { id: 104, name: 'Human Resources', location: 'Delhi' },
  { id: 105, name: 'Marketing', location: 'Hyderabad' }
];

const sqlChallenges: SQLChallenge[] = [
  {
    id: 'sql-1',
    title: 'High Earners',
    description: 'Write a query to select the **name** and **salary** of all employees who earn more than **$80,000** annually, sorted by salary in descending order.',
    difficulty: 'Easy',
    starterQuery: 'SELECT name, salary \nFROM Employees \nWHERE salary > ... \nORDER BY ...;',
    expectedResult: [
      { name: 'Rohan Verma', salary: 110000 },
      { name: 'Amit Sharma', salary: 95000 },
      { name: 'Siddharth Roy', salary: 85000 }
    ]
  },
  {
    id: 'sql-2',
    title: 'Department Mapping (Joins)',
    description: 'Fetch the employee **name**, their **role**, and their **department name** (as `dept_name`) by joining the `Employees` and `Departments` tables.',
    difficulty: 'Medium',
    starterQuery: 'SELECT E.name, E.role, D.name AS dept_name \nFROM Employees E \nJOIN Departments D ON ...;',
    expectedResult: [
      { name: 'Amit Sharma', role: 'SDE-2', dept_name: 'Engineering' },
      { name: 'Neha Gupta', role: 'SDE-1', dept_name: 'Engineering' },
      { name: 'Rohan Verma', role: 'Product Manager', dept_name: 'Product' },
      { name: 'Siddharth Roy', role: 'Data Scientist', dept_name: 'Data & Analytics' },
      { name: 'Priya Iyer', role: 'QA Lead', dept_name: 'Engineering' },
      { name: 'Vikram Rao', role: 'HR Director', dept_name: 'Human Resources' }
    ]
  },
  {
    id: 'sql-3',
    title: 'Bangalore Techies',
    description: 'Find the **names** of all employees whose department is located in **Bangalore**.',
    difficulty: 'Medium',
    starterQuery: 'SELECT E.name \nFROM Employees E \nJOIN Departments D ON E.dept_id = D.id \nWHERE D.location = ...;',
    expectedResult: [
      { name: 'Amit Sharma' },
      { name: 'Neha Gupta' },
      { name: 'Siddharth Roy' },
      { name: 'Priya Iyer' }
    ]
  },
  {
    id: 'sql-4',
    title: 'Max Salary in Tech',
    description: 'Find the highest salary among all employees working in the **Engineering** department.',
    difficulty: 'Hard',
    starterQuery: 'SELECT MAX(salary) AS max_salary \nFROM Employees E \nJOIN Departments D ON E.dept_id = D.id \nWHERE D.name = \'Engineering\';',
    expectedResult: [
      { max_salary: 95000 }
    ]
  }
];

export const SqlPlayground: React.FC<SqlPlaygroundProps> = ({ progress, toggleSqlQuestionComplete }) => {
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number>(0);
  const [queryText, setQueryText] = useState<string>(sqlChallenges[0].starterQuery);
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [errorText, setErrorText] = useState<string>('');
  const [activeSchemaTab, setActiveSchemaTab] = useState<'employees' | 'departments'>('employees');

  const activeChallenge = sqlChallenges[activeChallengeIdx];

  // Sync starter query when switching challenge
  const handleSelectChallenge = (idx: number) => {
    setActiveChallengeIdx(idx);
    setQueryText(sqlChallenges[idx].starterQuery);
    setQueryResult(null);
    setErrorText('');
  };

  // Mock SQL execution engine
  const executeSQLQuery = (sql: string) => {
    setErrorText('');
    setQueryResult(null);
    
    const cleanSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();
    
    try {
      if (!cleanSql.startsWith('select')) {
        throw new Error('Unsupported Query syntax. FDSA SQL Simulator only supports SELECT projections.');
      }

      // Basic Token Parser
      let results = [...mockEmployees];

      // 1. Check Joins
      if (cleanSql.includes('join departments')) {
        results = mockEmployees.map(emp => {
          const dept = mockDepartments.find(d => d.id === emp.dept_id);
          return {
            ...emp,
            dept_name: dept ? dept.name : null,
            location: dept ? dept.location : null
          };
        });
      }

      // 2. Check filters (WHERE clauses)
      if (cleanSql.includes('where')) {
        // High earners filter
        if (cleanSql.includes('salary > 80000')) {
          results = results.filter(e => e.salary > 80000);
        } else if (cleanSql.includes('location = \'bangalore\'') || cleanSql.includes('location=\'bangalore\'')) {
          results = results.filter((e: any) => e.location === 'Bangalore');
        } else if (cleanSql.includes('d.name = \'engineering\'') || cleanSql.includes('d.name=\'engineering\'')) {
          results = results.filter((e: any) => e.dept_name === 'Engineering');
        }
      }

      // 3. Check Aggregates
      if (cleanSql.includes('max(salary)')) {
        const engineeringEmps = mockEmployees.filter(e => e.dept_id === 101);
        const maxVal = Math.max(...engineeringEmps.map(e => e.salary));
        setQueryResult([{ max_salary: maxVal }]);
        return;
      }

      // 4. Projections (Select columns)
      const selectPart = cleanSql.split('from')[0].replace('select', '').trim();
      const columns = selectPart.split(',').map(c => {
        const parts = c.trim().split(' as ');
        return {
          original: parts[0].includes('.') ? parts[0].split('.')[1] : parts[0],
          alias: parts[1] || null
        };
      });

      let projectedResults = results.map((row: any) => {
        const newRow: Record<string, any> = {};
        columns.forEach(col => {
          const key = col.original;
          const label = col.alias || key;
          
          if (row[key] !== undefined) {
            newRow[label] = row[key];
          } else if (key === 'dept_name' && row.dept_name !== undefined) {
            newRow[label] = row.dept_name;
          }
        });
        return newRow;
      });

      // 5. Order By
      if (cleanSql.includes('order by')) {
        if (cleanSql.includes('salary desc')) {
          projectedResults.sort((a, b) => b.salary - a.salary);
        }
      }

      if (projectedResults.length === 0) {
        throw new Error('No matching records found. Verify query filters.');
      }

      setQueryResult(projectedResults);

    } catch (err: any) {
      setErrorText(err.message || 'Syntax error in SQL statement.');
    }
  };

  // Submit Answer
  const handleSubmitQuery = () => {
    if (!queryResult) {
      alert('Execute the query first to inspect results!');
      return;
    }

    // Compare output tables
    const expected = activeChallenge.expectedResult;
    const actualStr = JSON.stringify(queryResult).replace(/\s+/g, '').toLowerCase();
    const expectedStr = JSON.stringify(expected).replace(/\s+/g, '').toLowerCase();

    if (actualStr === expectedStr) {
      confetti({ particleCount: 80, spread: 60 });
      toggleSqlQuestionComplete(activeChallenge.id);
      alert('Correct Query! Challenge solved successfully.');
    } else {
      alert('Wrong Result! The outputs do not match the expected dataset. Try adjusting projection or ordering.');
    }
  };

  const isCompleted = progress.completedSqlQuestionIds?.includes(activeChallenge.id) || false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div>
        <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>SQL Practice Sandbox</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
          Solve SQL and database query challenges asked in core placement OTs and machine rounds.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Challenges List & Schemas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Challenges selection block */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={16} style={{ color: 'var(--accent-amber)' }} /> Active SQL Tasks
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sqlChallenges.map((challenge, idx) => {
                const isChallengeDone = progress.completedSqlQuestionIds?.includes(challenge.id);
                const isActive = activeChallengeIdx === idx;
                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleSelectChallenge(idx)}
                    style={{
                      padding: '12px 14px',
                      background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                      border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-light)'}`,
                      borderRadius: 8,
                      textAlign: 'left',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span>{idx + 1}. {challenge.title}</span>
                    {isChallengeDone ? (
                      <span style={{ color: 'var(--accent-emerald)', fontSize: '0.75rem', fontWeight: 700 }}>Solved ✅</span>
                    ) : (
                      <span className={`badge ${challenge.difficulty === 'Easy' ? 'badge-easy' : challenge.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`} style={{ fontSize: '0.6rem' }}>
                        {challenge.difficulty}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Database Schema Viewer */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={16} style={{ color: 'var(--accent-cyan)' }} /> Database Tables Schema
            </h3>

            {/* Schema tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <button
                className="btn btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  background: activeSchemaTab === 'employees' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  borderColor: activeSchemaTab === 'employees' ? 'var(--accent-cyan)' : 'var(--border-light)'
                }}
                onClick={() => setActiveSchemaTab('employees')}
              >
                Employees
              </button>
              <button
                className="btn btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  background: activeSchemaTab === 'departments' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  borderColor: activeSchemaTab === 'departments' ? 'var(--accent-cyan)' : 'var(--border-light)'
                }}
                onClick={() => setActiveSchemaTab('departments')}
              >
                Departments
              </button>
            </div>

            {/* Schema details */}
            <div style={{
              background: 'rgba(5, 8, 20, 0.4)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              padding: '10px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              {activeSchemaTab === 'employees' ? (
                <>
                  <div style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>TABLE Employees:</div>
                  <div>- id (INT PRIMARY KEY)</div>
                  <div>- name (VARCHAR)</div>
                  <div>- role (VARCHAR)</div>
                  <div>- salary (INT)</div>
                  <div>- dept_id (INT FOREIGN KEY)</div>
                </>
              ) : (
                <>
                  <div style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>TABLE Departments:</div>
                  <div>- id (INT PRIMARY KEY)</div>
                  <div>- name (VARCHAR)</div>
                  <div>- location (VARCHAR)</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Query Editor & Output tables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Active task description */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{activeChallenge.title}</h2>
              {isCompleted && (
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--accent-emerald)',
                  background: 'rgba(16,185,129,0.1)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  border: '1px solid rgba(16,185,129,0.2)'
                }}>COMPLETED</span>
              )}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{activeChallenge.description}</p>
          </div>

          {/* SQL Code Input Editor */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Terminal size={14} /> Query Editor
              </span>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                  onClick={() => executeSQLQuery(queryText)}
                >
                  <Play size={10} fill="currentColor" /> Run Query
                </button>
                <button
                  className="btn btn-primary"
                  style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                  onClick={handleSubmitQuery}
                >
                  <Send size={10} /> Submit
                </button>
              </div>
            </div>

            <textarea
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                height: 120,
                background: 'rgba(5, 8, 20, 0.45)',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                padding: '14px',
                resize: 'none',
                lineHeight: 1.5,
                tabSize: 4
              }}
            />
          </div>

          {/* Output Display Terminal */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 160 }}>
            <div style={{
              padding: '6px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Table size={12} /> Execution Results
              </span>
            </div>

            <div style={{ flex: 1, padding: '16px', background: 'rgba(5, 8, 20, 0.8)', overflowX: 'auto', overflowY: 'auto' }}>
              {errorText && (
                <div style={{ color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  {errorText}
                </div>
              )}

              {!errorText && !queryResult && (
                <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  Write a query above and execute. Results will load in this table.
                </div>
              )}

              {!errorText && queryResult && (
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'left'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      {Object.keys(queryResult[0] || {}).map(key => (
                        <th key={key} style={{ padding: '6px 8px', color: 'var(--accent-cyan)' }}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} style={{ padding: '6px 8px', color: 'var(--text-main)' }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default SqlPlayground;
