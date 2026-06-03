import { useState } from 'react';
import { useProgress } from './hooks/useProgress';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DsaTopics } from './components/DsaTopics';
import { CsCore } from './components/CsCore';
import { CompanyTracks } from './components/CompanyTracks';
import { CodingSandbox } from './components/CodingSandbox';
import { MockTestSimulator } from './components/MockTestSimulator';
import { SqlPlayground } from './components/SqlPlayground';
import type { Problem } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  
  const {
    progress,
    toggleProblemComplete,
    toggleProblemInProgress,
    toggleCsQuestionComplete,
    toggleSqlQuestionComplete,
    saveMockTestAttempt,
    importProblem,
    saveNote,
    clearProgress
  } = useProgress();

  const handleSelectProblem = (problem: Problem | null) => {
    setSelectedProblem(problem);
  };

  const handleClearProgressWrapper = () => {
    clearProgress();
  };

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

