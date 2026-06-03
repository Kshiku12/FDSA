import React from 'react';
import type { Problem, UserProgress } from '../types';
import { dsaProblems, dsaTopics } from '../data/dsaProblems';
import { csCoreQuestions } from '../data/csCoreQuestions';
import { companySheets } from '../data/companySheets';
import { Flame, CheckCircle, Clock, Award, Play, Share2, Sparkles, BookOpen } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  setActiveTab: (tab: string) => void;
  setSelectedProblem: (problem: Problem | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ progress, setActiveTab, setSelectedProblem }) => {
  const completedIds = progress.completedProblemIds;

  // Compute DSA stats
  const totalDsa = dsaProblems.length;
  const solvedDsa = dsaProblems.filter(p => completedIds.includes(p.id)).length;
  const dsaPercent = totalDsa > 0 ? Math.round((solvedDsa / totalDsa) * 100) : 0;

  // Difficulty breakdown
  const easyProblems = dsaProblems.filter(p => p.difficulty === 'Easy');
  const mediumProblems = dsaProblems.filter(p => p.difficulty === 'Medium');
  const hardProblems = dsaProblems.filter(p => p.difficulty === 'Hard');

  const solvedEasy = easyProblems.filter(p => completedIds.includes(p.id)).length;
  const solvedMedium = mediumProblems.filter(p => completedIds.includes(p.id)).length;
  const solvedHard = hardProblems.filter(p => completedIds.includes(p.id)).length;

  // CS Core stats
  const totalCs = csCoreQuestions.length;
  const solvedCs = progress.completedCsQuestionIds.length;
  const csPercent = totalCs > 0 ? Math.round((solvedCs / totalCs) * 100) : 0;

  // Company tracking
  const totalCompanies = companySheets.length;
  // A company is "completed" if all its questions are solved
  const solvedCompanies = companySheets.filter(company => 
    company.problemIds.every(id => completedIds.includes(id))
  ).length;

  // Streak calculation details
  const currentStreak = progress.streaks?.current || 0;

  // Recommendations: find first 3 unsolved problems
  const recommendedProblems = dsaProblems
    .filter(p => !completedIds.includes(p.id))
    .slice(0, 3);

  // Generate GitHub-style heatmap (last 105 days, i.e., 15 weeks * 7 days)
  const renderHeatmap = () => {
    const today = new Date();
    const history = progress.streaks?.history || [];

    // Start 104 days ago to render exactly 105 days (15 columns of 7 rows)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 104);

    // Group cells by column (week) to render columns vertically
    const weeks: React.ReactElement[][] = Array.from({ length: 15 }, () => []);

    for (let i = 0; i < 105; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const isSubmitting = history.includes(dateStr);
      
      const colIndex = Math.floor(i / 7);

      weeks[colIndex].push(
        <div
          key={dateStr}
          style={{
            width: 11,
            height: 11,
            borderRadius: 2,
            background: isSubmitting 
              ? 'var(--accent-emerald)' 
              : 'rgba(255, 255, 255, 0.05)',
            border: isSubmitting 
              ? '1px solid rgba(16, 185, 129, 0.4)' 
              : '1px solid rgba(255, 255, 255, 0.02)',
            boxShadow: isSubmitting ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none',
            cursor: 'pointer',
          }}
          title={`${dateStr}: ${isSubmitting ? 'Solved questions' : 'No activity recorded'}`}
        />
      );
    }

    return (
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '10px 0' }}>
        {weeks.map((week, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {week}
          </div>
        ))}
      </div>
    );
  };

  // Determine badges unlocked
  const badges = [
    {
      id: 'welcome',
      title: 'First Step',
      desc: 'Create account and ready to grind',
      unlocked: true,
      color: 'var(--accent-cyan)'
    },
    {
      id: 'array-adept',
      title: 'Array Adept',
      desc: 'Solve an Array & Hashing question',
      unlocked: dsaProblems.some(p => p.topicId === 'arrays' && completedIds.includes(p.id)),
      color: 'var(--accent-purple)'
    },
    {
      id: 'recursion-mage',
      title: 'Recursion Mage',
      desc: 'Solve a Recursion/Stack question',
      unlocked: dsaProblems.some(p => (p.topicId === 'recursion' || p.topicId === 'linkedlists') && completedIds.includes(p.id)),
      color: 'var(--accent-amber)'
    },
    {
      id: 'tree-whisperer',
      title: 'Tree Whisperer',
      desc: 'Solve a Tree traversal problem',
      unlocked: dsaProblems.some(p => p.topicId === 'trees' && completedIds.includes(p.id)),
      color: 'var(--accent-emerald)'
    },
    {
      id: 'dp-dynamo',
      title: 'DP Dynamo',
      desc: 'Solve a Dynamic Programming task',
      unlocked: dsaProblems.some(p => p.topicId === 'dp' && completedIds.includes(p.id)),
      color: 'var(--accent-rose)'
    },
    {
      id: 'interview-ready',
      title: 'FAANG Apprentice',
      desc: 'Solve 4+ core DSA questions',
      unlocked: completedIds.length >= 4,
      color: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-cyan) 100%)'
    }
  ];

  // Print Profile Functionality
  const copyResumeShare = () => {
    const text = `🎯 FDSA Placement Readiness Report:
- Total DSA Solved: ${solvedDsa}/${totalDsa} (${dsaPercent}%)
- CS core Completed: ${solvedCs}/${totalCs} (${csPercent}%)
- Target Companies Unlocked: ${solvedCompanies}/${totalCompanies}
- Current Active Streak: ${currentStreak} Days
🔥 Practice for free on FDSA!`;
    navigator.clipboard.writeText(text);
    alert('Progress report copied to clipboard! You can share it on LinkedIn or your Resume.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '30px 40px',
        background: 'linear-gradient(135deg, rgba(16, 22, 47, 0.7) 0%, rgba(30, 20, 70, 0.4) 100%)',
        border: '1px solid var(--border-glow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Candidate Board
          </span>
          <h1 className="text-gradient-purple-cyan" style={{ fontSize: '2.5rem', marginTop: 4, marginBottom: 8, fontWeight: 800 }}>
            Ready to crack Placements?
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 600 }}>
            Track progress across DSA sheets, core topics like OS/DBMS, and specific sheets for target product companies. All resources are 100% free.
          </p>
        </div>

        {/* Big Overall Stats Ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 90, height: 90 }} className="flex-center">
            <svg style={{ transform: 'rotate(-90deg)', width: 90, height: 90 }}>
              <circle cx="45" cy="45" r="38" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
              <circle 
                cx="45" 
                cy="45" 
                r="38" 
                stroke="var(--accent-purple)" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - (dsaPercent / 100))}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', flexDirection: 'column' }} className="flex-center">
              <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{dsaPercent}%</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>DSA done</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>DSA Solver: {solvedDsa}/{totalDsa}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>CS Core: {solvedCs}/{totalCs}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-amber)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Companies Unlocked: {solvedCompanies}/{totalCompanies}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row of stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        {/* Streak card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            width: 56,
            height: 56,
            borderRadius: 12,
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }} className="flex-center">
            <Flame size={28} style={{ color: 'var(--accent-amber)', fill: currentStreak > 0 ? 'var(--accent-amber)' : 'none' }} />
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Coding Streak</span>
            <h2 style={{ fontSize: '1.8rem', marginTop: 2, fontFamily: 'var(--font-display)', color: 'var(--accent-amber)' }}>
              {currentStreak} Days
            </h2>
          </div>
        </div>

        {/* Completed Problems Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            width: 56,
            height: 56,
            borderRadius: 12,
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }} className="flex-center">
            <CheckCircle size={28} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Core Problems Solved</span>
            <h2 style={{ fontSize: '1.8rem', marginTop: 2, fontFamily: 'var(--font-display)', color: 'var(--accent-emerald)' }}>
              {solvedDsa} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ {totalDsa}</span>
            </h2>
          </div>
        </div>

        {/* CS Core Questions Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.1)',
            width: 56,
            height: 56,
            borderRadius: 12,
            border: '1px solid rgba(6, 182, 212, 0.2)',
          }} className="flex-center">
            <BookOpen size={28} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>CS Subjects Read</span>
            <h2 style={{ fontSize: '1.8rem', marginTop: 2, fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
              {solvedCs} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ {totalCs}</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended, Heatmap & Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Heatmap and Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Heatmap Widget */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} style={{ color: 'var(--accent-cyan)' }} />
              Activity Heatmap
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Visual log of daily coding submissions and problem checks.
            </p>
            {renderHeatmap()}
          </div>

          {/* Recommended Questions */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
              Smart Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendedProblems.length > 0 ? (
                recommendedProblems.map(problem => {
                  let badgeClass = 'badge-easy';
                  if (problem.difficulty === 'Medium') badgeClass = 'badge-medium';
                  if (problem.difficulty === 'Hard') badgeClass = 'badge-hard';

                  return (
                    <div 
                      key={problem.id} 
                      className="glass-panel"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{problem.title}</span>
                          <span className={`badge ${badgeClass}`}>{problem.difficulty}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Topic: {dsaTopics.find(t => t.id === problem.topicId)?.name || problem.topicId}
                        </span>
                      </div>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 8 }}
                        onClick={() => {
                          setSelectedProblem(problem);
                          setActiveTab('dsa');
                        }}
                      >
                        <Play size={12} fill="currentColor" /> Solve
                      </button>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                  🎉 Incredible! You've solved all questions in our database! Keep practicing!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Badges & Resume readiness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Unlocked Badges */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} style={{ color: 'var(--accent-amber)' }} />
              Earned Achievements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {badges.map(badge => (
                <div 
                  key={badge.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 4px',
                    opacity: badge.unlocked ? 1 : 0.4,
                    filter: badge.unlocked ? 'none' : 'grayscale(100%)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: badge.unlocked ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${badge.unlocked ? badge.color : 'rgba(255,255,255,0.05)'}`,
                    boxShadow: badge.unlocked ? `0 0 10px ${badge.color}33` : 'none',
                  }} className="flex-center">
                    <Award size={20} style={{ color: badge.unlocked ? badge.color : 'var(--text-dim)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: badge.unlocked ? 'var(--text-main)' : 'var(--text-dim)' }}>
                      {badge.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {badge.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Readiness Export */}
          <div className="glass-panel" style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid var(--border-glow)',
            boxShadow: 'var(--glow-shadow)',
          }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 12, color: '#fff' }}>
              Resume Export Report
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Share your verification details directly on your portfolio or resume.
            </p>

            <div style={{
              background: 'rgba(5, 8, 20, 0.6)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 8,
              padding: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)',
              marginBottom: 16,
              lineHeight: 1.5
            }}>
              <div>CANDIDATE: KSHITIJ</div>
              <div>PLATFORM: FDSA LOCAL LEDGER</div>
              <div>STREAK: {currentStreak} ACTIVE DAYS</div>
              <div>DSA PROGRESS: {solvedDsa}/{totalDsa} SOLVED</div>
              <div>CS SYNC: {solvedCs}/{totalCs} QUESTIONS</div>
              <div style={{ color: 'var(--accent-emerald)', marginTop: 4 }}>STATUS: VERIFIED READY FOR OTS</div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem' }}
              onClick={copyResumeShare}
            >
              <Share2 size={14} /> Copy LinkedIn Report
            </button>
          </div>
        </div>
      </div>

      {/* Difficulty stats breakdown */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Solving Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {/* Easy metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>EASY</span>
              <span>{solvedEasy} / {easyProblems.length}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'var(--accent-emerald)',
                width: `${easyProblems.length > 0 ? (solvedEasy / easyProblems.length) * 100 : 0}%`,
                transition: 'width 0.5s ease-out'
              }} />
            </div>
          </div>

          {/* Medium metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>MEDIUM</span>
              <span>{solvedMedium} / {mediumProblems.length}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'var(--accent-amber)',
                width: `${mediumProblems.length > 0 ? (solvedMedium / mediumProblems.length) * 100 : 0}%`,
                transition: 'width 0.5s ease-out'
              }} />
            </div>
          </div>

          {/* Hard metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>HARD</span>
              <span>{solvedHard} / {hardProblems.length}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'var(--accent-rose)',
                width: `${hardProblems.length > 0 ? (solvedHard / hardProblems.length) * 100 : 0}%`,
                transition: 'width 0.5s ease-out'
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
