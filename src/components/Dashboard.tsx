import React, { useState, useEffect } from 'react';
import type { Problem, UserProgress, UserProfile } from '../types';
import { dsaProblems, dsaTopics } from '../data/dsaProblems';
import { csCoreQuestions } from '../data/csCoreQuestions';
import { companySheets } from '../data/companySheets';
import { Flame, CheckCircle, Clock, Award, Play, Share2, Sparkles, BookOpen, Mail, Settings, Send, Eye, X, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  setActiveTab: (tab: string) => void;
  setSelectedProblem: (problem: Problem | null) => void;
  updateEmailSettings: (settings: NonNullable<UserProgress['emailSettings']>) => void;
  currentUser: UserProfile | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  setActiveTab,
  setSelectedProblem,
  updateEmailSettings,
  currentUser
}) => {
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
  const solvedCompanies = companySheets.filter(company => 
    company.problemIds.every(id => completedIds.includes(id))
  ).length;

  // Streak calculation
  const currentStreak = progress.streaks?.current || 0;

  // Recommendations: find first 3 unsolved problems
  const recommendedProblems = dsaProblems
    .filter(p => !completedIds.includes(p.id))
    .slice(0, 3);

  // SVG Chart states
  const [hoveredBar, setHoveredBar] = useState<null | {
    name: string;
    solved: number;
    total: number;
    percent: number;
    x: number;
    y: number;
  }>(null);

  // Email Config State
  const initialSettings = progress.emailSettings || {
    enabled: false,
    emailAddress: currentUser?.email || '',
    serviceId: '',
    templateId: '',
    publicKey: ''
  };

  const [emailEnabled, setEmailEnabled] = useState(initialSettings.enabled);
  const [emailAddress, setEmailAddress] = useState(initialSettings.emailAddress);
  const [serviceId, setServiceId] = useState(initialSettings.serviceId);
  const [templateId, setTemplateId] = useState(initialSettings.templateId);
  const [publicKey, setPublicKey] = useState(initialSettings.publicKey);

  const [showStreakWarning, setShowStreakWarning] = useState(false);
  const [emailAlertStatus, setEmailAlertStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Daily Streak Alert Checker
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActive = progress.streaks?.lastActiveDate;
    
    // Warn if they have a streak and haven't coded today yet
    if (lastActive && lastActive !== todayStr && currentStreak > 0) {
      setShowStreakWarning(true);
    } else {
      setShowStreakWarning(false);
    }
  }, [progress, currentStreak]);

  // Handle saving configurations
  const handleSaveEmailSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailSettings({
      enabled: emailEnabled,
      emailAddress,
      serviceId,
      templateId,
      publicKey
    });
    alert('Email settings updated successfully!');
  };

  // Mock Developer Streak Breaker to test alerts
  const handleSimulateStreakSkip = () => {
    // Trigger local state updates to test the alert box
    setShowStreakWarning(true);
    alert('Streak skip simulated! (You coded yesterday but not today). The Streak Rescue Warning banner is now active.');
  };

  // Send Email Alert logic
  const sendEmailAlert = async (isTest = false) => {
    const targetEmail = emailAddress || currentUser?.email || 'candidate@example.com';
    const emailName = currentUser?.name || 'Developer';
    const currentDay = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const recProb = recommendedProblems[0];
    const recUrl = recProb 
      ? `${window.location.origin}/?problem=${recProb.slug}`
      : window.location.origin;

    if (!serviceId || !templateId || !publicKey) {
      // If not configured, pop up the simulation sandbox preview so they see the template immediately
      setShowEmailPreview(true);
      return;
    }

    setEmailAlertStatus('sending');
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            name: emailName,
            user_name: emailName,
            to_email: targetEmail,
            time: currentDay,
            streak_days: String(currentStreak || 1),
            problem_link: recUrl,
            message: `⚠️ Streak Guard Warning: You skipped coding today on FDSA. Keep your interview prep momentum. Solve a problem to save your streak!`
          }
        })
      });

      if (response.ok) {
        setEmailAlertStatus('success');
        alert(isTest ? `Test email successfully dispatched to ${targetEmail}!` : 'Streak warning email successfully dispatched!');
      } else {
        const text = await response.text();
        throw new Error(text || 'Dispatched response returned failure status');
      }
    } catch (err: any) {
      console.error('EmailJS error:', err);
      setEmailAlertStatus('error');
      // If dispatch fails, pop the visual preview modal anyway
      setShowEmailPreview(true);
    } finally {
      setTimeout(() => setEmailAlertStatus('idle'), 3000);
    }
  };

  // Compute 10 DSA topics completion stats
  const topicStats = dsaTopics.map(topic => {
    const problems = dsaProblems.filter(p => p.topicId === topic.id);
    const solved = problems.filter(p => completedIds.includes(p.id)).length;
    const percent = problems.length > 0 ? Math.round((solved / problems.length) * 100) : 0;
    return {
      id: topic.id,
      name: topic.name,
      solved,
      total: problems.length,
      percent
    };
  });

  // Generate GitHub-style heatmap (last 105 days, i.e., 15 weeks * 7 days)
  const renderHeatmap = () => {
    const today = new Date();
    const history = progress.streaks?.history || [];

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 104);

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

  const copyResumeShare = () => {
    const text = `🎯 FDSA Placement Readiness Report:
- Candidate: ${currentUser?.name || 'Kshitij'}
- Total DSA Solved: ${solvedDsa}/${totalDsa} (${dsaPercent}%)
- CS core Completed: ${solvedCs}/${totalCs} (${csPercent}%)
- Target Companies Unlocked: ${solvedCompanies}/${totalCompanies}
- Current Active Streak: ${currentStreak} Days
🔥 Practice for free on FDSA!`;
    navigator.clipboard.writeText(text);
    alert('Progress report copied to clipboard! You can share it on LinkedIn or your Resume.');
  };

  const activeProblem = recommendedProblems[0];
  const problemLinkVal = activeProblem 
    ? `${window.location.origin}/?problem=${activeProblem.slug}`
    : window.location.origin;
  
  const currentDayVal = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'relative' }}>
      
      {/* ⚠️ Streak skipped alert banner */}
      {showStreakWarning && (
        <div className="glass-panel" style={{
          padding: '16px 24px',
          background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.15) 0%, rgba(5, 5, 15, 0.4) 100%)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 4px 15px rgba(244, 63, 94, 0.1)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              background: 'rgba(244, 63, 94, 0.2)',
              width: 42,
              height: 42,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-rose)'
            }}>
              <AlertTriangle size={22} className="pulse-glow-rose" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Streak Protection Active 🔥</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 2 }}>
                You skipped coding today. Solve a problem now to secure your <strong>{currentStreak} Day</strong> streak!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => sendEmailAlert(false)}
              className="btn btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderColor: 'rgba(244, 63, 94, 0.3)',
                color: 'var(--accent-rose)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              disabled={emailAlertStatus === 'sending'}
            >
              <Send size={12} />
              {emailAlertStatus === 'sending' ? 'Sending...' : 'Email Streak Rescue'}
            </button>
            
            {activeProblem && (
              <button
                className="btn btn-primary"
                style={{
                  background: 'var(--accent-rose)',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onClick={() => {
                  setSelectedProblem(activeProblem);
                  setActiveTab('dsa');
                }}
              >
                <Play size={12} fill="currentColor" /> Rescue Streak
              </button>
            )}
          </div>
        </div>
      )}

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
          <h1 className="text-gradient-purple-cyan" style={{ fontSize: '2.4rem', marginTop: 4, marginBottom: 8, fontWeight: 800 }}>
            Welcome, {currentUser?.name || 'Guest Grind'} ⚡
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 600 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
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

      {/* Interactive SVG Chart Section */}
      <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} style={{ color: 'var(--accent-purple)' }} />
              DSA Subject Strength Chart
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Interactive review of topic solve rates. Hover over bars to inspect details.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'linear-gradient(to top, var(--accent-purple) 0%, var(--accent-cyan) 100%)' }} />
              <span>Solved Rate %</span>
            </div>
          </div>
        </div>

        {/* SVG Container */}
        <div style={{ position: 'relative', width: '100%', overflow: 'visible', background: 'rgba(5, 8, 20, 0.4)', borderRadius: 12, padding: '16px 8px 8px 8px', border: '1px solid var(--border-light)' }}>
          <svg viewBox="0 0 640 180" width="100%" height="100%" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="var(--accent-purple)" />
                <stop offset="100%" stopColor="var(--accent-cyan)" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            <line x1="40" y1="140" x2="620" y2="140" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="40" y1="112.5" x2="620" y2="112.5" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="40" y1="85" x2="620" y2="85" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="40" y1="57.5" x2="620" y2="57.5" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="40" y1="30" x2="620" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

            {/* Y-axis labels */}
            <text x="12" y="144" fill="var(--text-dim)" fontSize="10" fontWeight="600">0%</text>
            <text x="12" y="89" fill="var(--text-dim)" fontSize="10" fontWeight="600">50%</text>
            <text x="12" y="34" fill="var(--text-dim)" fontSize="10" fontWeight="600">100%</text>

            {/* Bars */}
            {topicStats.map((stat, idx) => {
              const xPos = 40 + idx * 58;
              const barHeight = (stat.percent / 100) * 110;
              const yPos = 140 - barHeight;
              const isHovered = hoveredBar?.name === stat.name;

              return (
                <g key={stat.id}>
                  {/* Hover detector background bar */}
                  <rect
                    x={xPos - 8}
                    y="20"
                    width="42"
                    height="130"
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => {
                      setHoveredBar({
                        name: stat.name,
                        solved: stat.solved,
                        total: stat.total,
                        percent: stat.percent,
                        x: xPos + 13,
                        y: yPos - 12
                      });
                    }}
                    onMouseLeave={() => setHoveredBar(null)}
                    onClick={() => {
                      setActiveTab('dsa');
                    }}
                  />
                  {/* Real visual bar */}
                  <rect
                    x={xPos}
                    y={yPos}
                    width="26"
                    height={Math.max(4, barHeight)}
                    rx="4"
                    fill="url(#barGradient)"
                    style={{
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: isHovered ? 1 : 0.8,
                      filter: isHovered ? 'drop-shadow(0 0 6px var(--accent-cyan))' : 'none'
                    }}
                  />
                  {/* X-axis labels */}
                  <text
                    x={xPos + 13}
                    y="158"
                    textAnchor="middle"
                    fill={isHovered ? '#fff' : 'var(--text-dim)'}
                    fontSize="9"
                    fontWeight="700"
                    style={{ transition: 'color 0.2s', cursor: 'pointer' }}
                  >
                    {stat.name.substring(0, 3).toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* SVG Tooltip */}
          {hoveredBar && (
            <div style={{
              position: 'absolute',
              top: `${Math.max(0, hoveredBar.y - 45)}px`,
              left: `${Math.max(10, Math.min(500, hoveredBar.x))}px`,
              background: 'rgba(10, 12, 26, 0.95)',
              border: '1px solid var(--accent-cyan)',
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.25)',
              borderRadius: 6,
              padding: '6px 10px',
              pointerEvents: 'none',
              zIndex: 10,
              transform: 'translateX(-50%)',
              animation: 'fadeIn 0.15s ease-out'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{hoveredBar.name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', marginTop: 2, whiteSpace: 'nowrap', fontWeight: 600 }}>
                {hoveredBar.solved} / {hoveredBar.total} Solved ({hoveredBar.percent}%)
              </div>
            </div>
          )}
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

        {/* Right Column: Badges & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Email Protection settings Widget */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-light)' }}>
            <button
              onClick={() => setShowSettingsPanel(!showSettingsPanel)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.05rem',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={16} style={{ color: 'var(--accent-rose)' }} />
                Streak Guard Notifier
              </span>
              <Settings size={16} style={{
                color: 'var(--text-dim)',
                transform: showSettingsPanel ? 'rotate(45deg)' : 'none',
                transition: 'transform 0.3s'
              }} />
            </button>

            {/* Config drawer */}
            {showSettingsPanel ? (
              <form onSubmit={handleSaveEmailSettings} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18, animation: 'fadeIn 0.25s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enable Email Alerts</label>
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent-purple)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>DESTINATION EMAIL</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="name@example.com"
                    style={{
                      background: 'rgba(5, 8, 20, 0.4)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 6,
                      color: '#fff',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* EmailJS credential values wrapper */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700 }}>EMAILJS SDK CREDENTIALS (OPTIONAL)</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input
                      type="text"
                      placeholder="Service ID"
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      style={{ background: 'rgba(5, 8, 20, 0.4)', border: '1px solid var(--border-light)', borderRadius: 6, color: '#fff', padding: '4px 8px', fontSize: '0.75rem', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input
                      type="text"
                      placeholder="Template ID"
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      style={{ background: 'rgba(5, 8, 20, 0.4)', border: '1px solid var(--border-light)', borderRadius: 6, color: '#fff', padding: '4px 8px', fontSize: '0.75rem', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input
                      type="text"
                      placeholder="Public Key"
                      value={publicKey}
                      onChange={(e) => setPublicKey(e.target.value)}
                      style={{ background: 'rgba(5, 8, 20, 0.4)', border: '1px solid var(--border-light)', borderRadius: 6, color: '#fff', padding: '4px 8px', fontSize: '0.75rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => sendEmailAlert(true)}
                    style={{ padding: '6px', fontSize: '0.75rem' }}
                  >
                    Test Mail
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '6px', fontSize: '0.75rem', background: 'var(--accent-purple)' }}
                  >
                    Save Config
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Status: {emailEnabled ? 'Enabled ✅' : 'Disabled ❌'}</span>
                <span>Email: {emailAddress ? emailAddress : 'Not set'}</span>
              </div>
            )}

            {/* Simulate button in footer */}
            {showSettingsPanel && (
              <button
                onClick={handleSimulateStreakSkip}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  width: '100%',
                  textAlign: 'center',
                  marginTop: 10
                }}
              >
                Simulate Skipped Day Warning Alert
              </button>
            )}
          </div>

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
              <div>CANDIDATE: {currentUser?.name?.toUpperCase() || 'DEVELOPER'}</div>
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

      {/* 📧 Visual sandbox email preview modal */}
      {showEmailPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          animation: 'fadeIn 0.25s ease-out'
        }} onClick={() => setShowEmailPreview(false)}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '560px',
            background: 'var(--bg-dark)',
            border: '1px solid var(--border-glow)',
            boxShadow: 'var(--glow-shadow)',
            borderRadius: 14,
            padding: '24px',
            position: 'relative',
            animation: 'scaleIn 0.25s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
              <h3 style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={16} style={{ color: 'var(--accent-cyan)' }} />
                Streak Rescue Mail Sandbox Simulator
              </h3>
              <button
                onClick={() => setShowEmailPreview(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.4 }}>
              This simulates the exact HTML email dispatched to your inbox. Customize credentials in the Streak Notifier drawer to enable real deliveries.
            </p>

            {/* Email frame */}
            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: 8,
              overflowY: 'auto',
              maxHeight: '340px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {/* Inserted customized HTML email template */}
              <div style={{ fontFamily: 'system-ui, sans-serif, Arial', fontSize: '12px', maxWidth: '100%', margin: '0 auto', padding: '16px', borderRadius: '8px', backgroundColor: '#ffffff', color: '#1e293b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ color: '#64748b', marginBottom: '12px', fontSize: '11px' }}>A streak alert from <strong>FDSA Placement Prep</strong> has been received. Kindly respond at your earliest convenience.</div>
                <div
                  style={{
                    marginTop: '12px',
                    padding: '14px 0',
                    borderWidth: '1px 0',
                    borderStyle: 'dashed',
                    borderColor: '#cbd5e1'
                  }}
                >
                  <table role="presentation" style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top', width: '50px' }}>
                          <div
                            style={{
                              padding: '8px',
                              margin: '0 8px 0 0',
                              backgroundColor: '#fffbeb',
                              border: '1px solid #fef3c7',
                              borderRadius: '6px',
                              fontSize: '24px',
                              textAlign: 'center',
                              lineHeight: '1'
                            }}
                            role="img"
                          >
                            🔥
                          </div>
                        </td>
                        <td style={{ verticalAlign: 'top' }}>
                          <div style={{ color: '#0f172a', fontSize: '14px', marginBottom: '2px' }}>
                            <strong>FDSA Streak Guard</strong>
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '10px' }}>{currentDayVal}</div>
                          <p style={{ fontSize: '12px', lineHeight: '1.5', color: '#334155', margin: '0 0 12px 0' }}>
                            Hi <strong>{currentUser?.name || 'Developer'}</strong>,<br/><br/>
                            ⚠️ You have skipped coding today on FDSA! Your active coding streak of <strong>{currentStreak || 1} Days</strong> is in danger of being broken. Don't lose your placement preparation momentum.
                          </p>
                          <a href={problemLinkVal} target="_blank" rel="noopener noreferrer"
                             style={{
                               display: 'inline-block',
                               padding: '8px 16px',
                               background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                               color: '#ffffff',
                               fontFamily: 'sans-serif',
                               fontSize: '11px',
                               fontWeight: 'bold',
                               textDecoration: 'none',
                               borderRadius: '5px',
                               boxShadow: '0 2px 4px rgba(139, 92, 246, 0.15)'
                             }}
                          >
                            Rescue Streak on FDSA ⚡
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: '12px', fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>
                  Practice daily. Master DSA. Crack FAANG. All worksheets are 100% free.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setShowEmailPreview(false)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Dashboard;
