import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onContinueAsGuest: () => void;
}

const USERS_DB_KEY = 'fdsa_users_db';

// Simple client-side hash function for password storage in localStorage
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return 'fdsa_hash_' + Math.abs(hash).toString(16);
};

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onContinueAsGuest
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize Google Sign-In Button
  useEffect(() => {
    const initGoogleGSI = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: '227740986006-qugudj4qdmfhb5krchkqrh3o9tm25qmn.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'filled_dark',
            size: 'large',
            width: '100%',
            type: 'standard',
            shape: 'rectangular',
            text: 'continue_with',
            logo_alignment: 'left'
          }
        );
      }
    };

    initGoogleGSI();
    // Safety timeout in case the script takes a moment to load
    const timer = setTimeout(initGoogleGSI, 1000);
    return () => clearTimeout(timer);
  }, [mode]);

  const handleGoogleCredentialResponse = (response: any) => {
    try {
      const token = response.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      if (!payload.email) {
        throw new Error('Email not found in Google payload');
      }

      const user: UserProfile = {
        uid: payload.sub || String(Date.now()),
        name: payload.name || payload.given_name || 'Google User',
        email: payload.email,
        photoURL: payload.picture,
        provider: 'google'
      };

      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Google Sign-In decoding error:', err);
      setError('Google Sign-In failed. Please try again.');
    }
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'register') {
      if (!name) {
        setError('Please enter your name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      // Load DB
      const dbStr = localStorage.getItem(USERS_DB_KEY);
      const db: Record<string, { name: string; passwordHash: string; uid: string }> = dbStr
        ? JSON.parse(dbStr)
        : {};

      const lowerEmail = email.toLowerCase().trim();
      if (db[lowerEmail]) {
        setError('An account with this email already exists.');
        return;
      }

      // Save user
      db[lowerEmail] = {
        name,
        passwordHash: hashPassword(password),
        uid: `user_${Date.now()}`
      };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));

      setSuccess('Account created successfully! Switching to Login...');
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setSuccess(null);
      }, 1500);

    } else {
      // Login Mode
      const dbStr = localStorage.getItem(USERS_DB_KEY);
      const db: Record<string, { name: string; passwordHash: string; uid: string }> = dbStr
        ? JSON.parse(dbStr)
        : {};

      const lowerEmail = email.toLowerCase().trim();
      const userRecord = db[lowerEmail];

      if (!userRecord || userRecord.passwordHash !== hashPassword(password)) {
        setError('Invalid email or password.');
        return;
      }

      const user: UserProfile = {
        uid: userRecord.uid,
        name: userRecord.name,
        email: lowerEmail,
        provider: 'local'
      };

      onLoginSuccess(user);
    }
  };

  return (
    <div className="flex-center" style={{
      minHeight: '85vh',
      padding: '20px',
      background: 'radial-gradient(circle at center, rgba(30, 20, 60, 0.4) 0%, rgba(5, 5, 15, 0.4) 100%)',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px 32px',
        border: '1px solid var(--border-glow)',
        boxShadow: 'var(--glow-shadow)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        {/* Glow accent */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '180px',
          height: '4px',
          background: 'linear-gradient(90deg, transparent, var(--accent-purple), transparent)',
          boxShadow: '0 0 20px var(--accent-purple)'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            margin: '0 auto 16px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-purple)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }} className="text-gradient">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            {mode === 'login' ? 'Login to continue your placement preparation' : 'Register to track and persist your DSA progress'}
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          background: 'rgba(5, 8, 20, 0.4)',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: mode === 'login' ? 'rgba(255,255,255,0.06)' : 'transparent',
              borderRadius: '6px',
              color: mode === 'login' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: mode === 'register' ? 'rgba(255,255,255,0.06)' : 'transparent',
              borderRadius: '6px',
              color: mode === 'register' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            borderRadius: '8px',
            padding: '12px 14px',
            color: 'var(--accent-rose)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: '20px',
            animation: 'shake 0.3s ease'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
            padding: '12px 14px',
            color: 'var(--accent-emerald)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: '20px'
          }}>
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLocalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    background: 'rgba(5, 8, 20, 0.3)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-dim)' }} />
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: 'rgba(5, 8, 20, 0.3)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.85rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-dim)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: 'rgba(5, 8, 20, 0.3)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.85rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIRM PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    background: 'rgba(5, 8, 20, 0.3)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: '8px'
            }}
          >
            {mode === 'login' ? 'Sign In' : 'Sign Up'} <ArrowRight size={14} />
          </button>
        </form>

        {/* Separator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '24px 0',
          color: 'var(--text-dim)',
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          <span>Or Continue With</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
        </div>

        {/* Google Authentication Container */}
        <div style={{ marginBottom: '24px' }}>
          <div id="google-signin-button" style={{ width: '100%', overflow: 'hidden', borderRadius: '8px' }}></div>
        </div>

        {/* Guest access & Recruiter Link */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onContinueAsGuest}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
export default AuthScreen;
