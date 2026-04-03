import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { SettingsProvider } from './contexts/SettingsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { FirebaseProvider } from './components/FirebaseProvider';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <FirebaseProvider>
        <SettingsProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </SettingsProvider>
      </FirebaseProvider>
    </ErrorBoundary>
  </StrictMode>,
);
