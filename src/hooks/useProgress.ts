import { useState, useEffect } from 'react';
import type { UserProgress, MockTestAttempt, Problem, UserProfile } from '../types';

const BASE_STORAGE_KEY = 'fdsa_user_progress_v2';

const defaultProgress: UserProgress = {
  completedProblemIds: [],
  inProgressProblemIds: [],
  completedCsQuestionIds: [],
  completedSqlQuestionIds: [],
  importedProblems: [],
  mockTestAttempts: [],
  notes: {},
  streaks: {
    current: 0,
    lastActiveDate: null,
    history: [],
  },
};

export const useProgress = (currentUser: UserProfile | null) => {
  const getStorageKey = () => {
    if (currentUser) {
      return `${BASE_STORAGE_KEY}_${currentUser.email}`;
    }
    return `${BASE_STORAGE_KEY}_guest`;
  };

  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  // Load from localStorage when active user changes
  useEffect(() => {
    const key = getStorageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserProgress;
        setProgress({
          ...defaultProgress,
          ...parsed,
          streaks: {
            ...defaultProgress.streaks,
            ...(parsed.streaks || {}),
          },
          completedSqlQuestionIds: parsed.completedSqlQuestionIds || [],
          mockTestAttempts: parsed.mockTestAttempts || [],
          importedProblems: parsed.importedProblems || [],
        });
      } catch (e) {
        console.error('Failed to parse progress data:', e);
        setProgress(defaultProgress);
      }
    } else {
      setProgress(defaultProgress);
    }
  }, [currentUser]);

  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem(getStorageKey(), JSON.stringify(newProgress));
  };

  const toggleProblemComplete = (problemId: string) => {
    const isCompleted = progress.completedProblemIds.includes(problemId);
    let completed = [...progress.completedProblemIds];
    let inProgress = [...progress.inProgressProblemIds];

    if (isCompleted) {
      completed = completed.filter(id => id !== problemId);
    } else {
      completed.push(problemId);
      inProgress = inProgress.filter(id => id !== problemId);
      recordActivity();
    }

    saveProgress({
      ...progress,
      completedProblemIds: completed,
      inProgressProblemIds: inProgress,
    });
  };

  const toggleProblemInProgress = (problemId: string) => {
    if (progress.completedProblemIds.includes(problemId)) return;

    const isInProgress = progress.inProgressProblemIds.includes(problemId);
    let inProgress = [...progress.inProgressProblemIds];

    if (isInProgress) {
      inProgress = inProgress.filter(id => id !== problemId);
    } else {
      inProgress.push(problemId);
    }

    saveProgress({
      ...progress,
      inProgressProblemIds: inProgress,
    });
  };

  const toggleCsQuestionComplete = (questionId: string) => {
    const isCompleted = progress.completedCsQuestionIds.includes(questionId);
    let completed = [...progress.completedCsQuestionIds];

    if (isCompleted) {
      completed = completed.filter(id => id !== questionId);
    } else {
      completed.push(questionId);
      recordActivity();
    }

    saveProgress({
      ...progress,
      completedCsQuestionIds: completed,
    });
  };

  const toggleSqlQuestionComplete = (sqlQuestionId: string) => {
    const isCompleted = progress.completedSqlQuestionIds.includes(sqlQuestionId);
    let completed = [...progress.completedSqlQuestionIds];

    if (isCompleted) {
      completed = completed.filter(id => id !== sqlQuestionId);
    } else {
      completed.push(sqlQuestionId);
      recordActivity();
    }

    saveProgress({
      ...progress,
      completedSqlQuestionIds: completed,
    });
  };

  const saveMockTestAttempt = (attempt: MockTestAttempt) => {
    const attempts = progress.mockTestAttempts ? [...progress.mockTestAttempts] : [];
    const index = attempts.findIndex(a => a.id === attempt.id);
    
    if (index >= 0) {
      attempts[index] = attempt;
    } else {
      attempts.push(attempt);
    }

    saveProgress({
      ...progress,
      mockTestAttempts: attempts
    });
  };

  const importProblem = (problem: Problem) => {
    const imported = progress.importedProblems ? [...progress.importedProblems] : [];
    if (!imported.some(p => p.id === problem.id)) {
      imported.push(problem);
    }
    saveProgress({
      ...progress,
      importedProblems: imported
    });
  };

  const saveNote = (problemId: string, noteText: string) => {
    saveProgress({
      ...progress,
      notes: {
        ...progress.notes,
        [problemId]: noteText,
      },
    });
  };

  const recordActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    const history = progress.streaks.history ? [...progress.streaks.history] : [];
    
    if (!history.includes(today)) {
      history.push(today);
    }

    let currentStreak = progress.streaks.current || 0;
    const lastActive = progress.streaks.lastActiveDate;

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    saveProgress({
      ...progress,
      streaks: {
        current: currentStreak,
        lastActiveDate: today,
        history,
      },
    });
  };

  const clearProgress = () => {
    if (window.confirm('Are you sure you want to reset all your progress data? This cannot be undone.')) {
      saveProgress(defaultProgress);
    }
  };

  return {
    progress,
    toggleProblemComplete,
    toggleProblemInProgress,
    toggleCsQuestionComplete,
    toggleSqlQuestionComplete,
    saveMockTestAttempt,
    importProblem,
    saveNote,
    recordActivity,
    clearProgress,
  };
};
