import React from 'react';
import MainLayout from './components/MainLayout';
import { QuranProvider } from './contexts/QuranContext';
import { AudioProvider } from './contexts/AudioContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <QuranProvider>
        <AudioProvider>
          <MainLayout />
        </AudioProvider>
      </QuranProvider>
    </ThemeProvider>
  );
}

export default App;