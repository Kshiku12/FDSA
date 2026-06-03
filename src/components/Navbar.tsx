import React from 'react';
import { LayoutDashboard, BookOpen, GraduationCap, Building2, Flame, RotateCcw, ShieldCheck, Timer, Database, LogOut } from 'lucide-react';
import type { UserProgress, UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  progress: UserProgress;
  clearProgress: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  progress,
  clearProgress,
  currentUser,
  onLogout
}) => {
  const totalSolved = progress.completedProblemIds.length;
  const currentStreak = progress.streaks?.current || 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dsa', label: 'DSA Sheet', icon: BookOpen },
    { id: 'cs-core', label: 'CS Core', icon: GraduationCap },
    { id: 'companies', label: 'Company Track', icon: Building2 },
    { id: 'mock-test', label: 'Mock OT', icon: Timer },
    { id: 'sql-sandbox', label: 'SQL Sandbox', icon: Database },
  ];

  return (
    <nav className="navbar-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: 'var(--nav-height)',
      background: 'rgba(5, 8, 20, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 5%',
      zIndex: 1000,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-cyan) 100%)',
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glow-shadow-cyan)',
        }}>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', fontFamily: 'var(--font-display)' }}>F</span>
        </div>
        <span className="text-gradient" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          userSelect: 'none'
        }}>
          FDSA
        </span>
        <span style={{
          fontSize: '0.65rem',
          background: 'rgba(6, 182, 212, 0.1)',
          color: 'var(--accent-cyan)',
          padding: '2px 6px',
          borderRadius: 4,
          border: '1px solid rgba(6, 182, 212, 0.2)',
          fontWeight: 600,
          marginLeft: 4,
        }}>
          FREE
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                border: 'none',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all var(--transition-fast)',
                borderBottom: isActive ? '2px solid var(--accent-purple)' : '2px solid transparent',
              }}
              className="nav-btn-hover"
            >
              <Icon size={16} style={{ color: isActive ? 'var(--accent-purple)' : 'inherit' }} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Stats Widgets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Streak Flame */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(245, 158, 11, 0.08)',
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid rgba(245, 158, 11, 0.15)',
        }}>
          <Flame size={16} style={{
            color: 'var(--accent-amber)',
            fill: currentStreak > 0 ? 'var(--accent-amber)' : 'none',
            animation: currentStreak > 0 ? 'pulseGlow 2s infinite' : 'none'
          }} />
          <span style={{
            color: 'var(--accent-amber)',
            fontWeight: 700,
            fontSize: '0.9rem',
            fontFamily: 'var(--font-display)'
          }}>
            {currentStreak} Days
          </span>
        </div>

        {/* Problems Solved */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(16, 185, 129, 0.08)',
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid rgba(16, 185, 129, 0.15)',
        }}>
          <ShieldCheck size={16} style={{ color: 'var(--accent-emerald)' }} />
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>
            {totalSolved} Solved
          </span>
        </div>

        {/* Reset Progress */}
        <button
          onClick={clearProgress}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--transition-fast), background var(--transition-fast)'
          }}
          title="Reset All Progress"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent-rose)';
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-dim)';
            e.currentTarget.style.background = 'none';
          }}
        >
          <RotateCcw size={16} />
        </button>

        {/* User profile / Log out */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderLeft: '1px solid var(--border-light)',
          paddingLeft: 16,
          marginLeft: 4
        }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--accent-purple)' }}
                />
              ) : (
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--accent-purple)',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)'
                }}>
                  {currentUser.name[0].toUpperCase()}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#fff',
                  maxWidth: '75px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: 1 }}>
                  {currentUser.provider === 'google' ? 'Google' : 'Local'}
                </span>
              </div>

              <button
                onClick={onLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color var(--transition-fast), background var(--transition-fast)'
                }}
                title="Logout"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-rose)';
                  e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-dim)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                fontSize: '0.65rem',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-dim)',
                padding: '3px 8px',
                borderRadius: 6,
                border: '1px solid var(--border-light)',
                fontWeight: 600,
                letterSpacing: '0.02em'
              }}>
                GUEST
              </div>
              <button
                onClick={onLogout} // Logout for guest triggers transition back to authentication screen
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  padding: '2px 4px'
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
