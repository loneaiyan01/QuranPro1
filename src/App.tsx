import React from 'react';
import MainLayout from './components/MainLayout';
import { QuranProvider } from './contexts/QuranContext';
import { AudioProvider } from './contexts/AudioContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QuranProvider>
          <AudioProvider>
            <MainLayout />
          </AudioProvider>
        </QuranProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;