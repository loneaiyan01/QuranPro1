import React from 'react';
import MainLayout from './components/MainLayout';
import { QuranProvider } from './contexts/QuranContext';
import { AudioProvider } from './contexts/AudioContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QuranProvider>
          <AudioProvider>
            <ToastProvider>
              <MainLayout />
            </ToastProvider>
          </AudioProvider>
        </QuranProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
