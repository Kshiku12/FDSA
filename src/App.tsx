import { useState, useEffect } from 'react';
import { useProgress } from './hooks/useProgress';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DsaTopics } from './components/DsaTopics';
import { CsCore } from './components/CsCore';
import { CompanyTracks } from './components/CompanyTracks';
import { CodingSandbox } from './components/CodingSandbox';
import { MockTestSimulator } from './components/MockTestSimulator';
import { SqlPlayground } from './components/SqlPlayground';
import { AuthScreen } from './components/AuthScreen';
import type { Problem, UserProfile } from './types';

const SESSION_USER_KEY = 'fdsa_auth_user';
const SESSION_GUEST_KEY = 'fdsa_auth_guest';

function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // Restore session on startup
  useEffect(() => {
    const savedUser = localStorage.getItem(SESSION_USER_KEY);
    const savedGuest = localStorage.getItem(SESSION_GUEST_KEY);

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser) as UserProfile);
      } catch (e) {
        console.error('Failed to parse saved user session:', e);
      }
    } else if (savedGuest === 'true') {
      setIsGuest(true);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsGuest(false);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    localStorage.removeItem(SESSION_GUEST_KEY);
  };

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    setCurrentUser(null);
    localStorage.setItem(SESSION_GUEST_KEY, 'true');
    localStorage.removeItem(SESSION_USER_KEY);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsGuest(false);
    localStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem(SESSION_GUEST_KEY);
    setSelectedProblem(null);
    setActiveTab('dashboard');
  };

  const {
    progress,
    toggleProblemComplete,
    toggleProblemInProgress,
    toggleCsQuestionComplete,
    toggleSqlQuestionComplete,
    saveMockTestAttempt,
    importProblem,
    saveNote,
    clearProgress,
    updateEmailSettings,
    updateLastEmailedSkippedDate
  } = useProgress(currentUser);

  const handleSelectProblem = (problem: Problem | null) => {
    setSelectedProblem(problem);
  };

  const handleClearProgressWrapper = () => {
    clearProgress();
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(139, 92, 246, 0.1)',
            borderTopColor: 'var(--accent-purple)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Loading FDSA Simulator...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not a guest, show the AuthScreen login/registration
  if (!currentUser && !isGuest) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedProblem(null); // Return to list view
        }}
        progress={progress}
        clearProgress={handleClearProgressWrapper}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {selectedProblem ? (
          /* Editor Sandbox Mode */
          <CodingSandbox
            problem={selectedProblem}
            progress={progress}
            toggleProblemComplete={toggleProblemComplete}
            toggleProblemInProgress={toggleProblemInProgress}
            saveNote={saveNote}
            onBack={() => setSelectedProblem(null)}
          />
        ) : (
          /* standard views */
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                progress={progress}
                setActiveTab={setActiveTab}
                setSelectedProblem={handleSelectProblem}
                updateEmailSettings={updateEmailSettings}
                updateLastEmailedSkippedDate={updateLastEmailedSkippedDate}
                currentUser={currentUser}
              />
            )}
            
            {activeTab === 'dsa' && (
              <DsaTopics
                progress={progress}
                toggleProblemComplete={toggleProblemComplete}
                setSelectedProblem={handleSelectProblem}
                importProblem={importProblem}
              />
            )}
            
            {activeTab === 'cs-core' && (
              <CsCore
                progress={progress}
                toggleCsQuestionComplete={toggleCsQuestionComplete}
              />
            )}
            
            {activeTab === 'companies' && (
              <CompanyTracks
                progress={progress}
                setSelectedProblem={handleSelectProblem}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'mock-test' && (
              <MockTestSimulator
                progress={progress}
                saveMockTestAttempt={saveMockTestAttempt}
                setSelectedProblem={handleSelectProblem}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'sql-sandbox' && (
              <SqlPlayground
                progress={progress}
                toggleSqlQuestionComplete={toggleSqlQuestionComplete}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
