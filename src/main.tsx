import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { SettingsProvider } from './contexts/SettingsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { FirebaseProvider } from './contexts/FirebaseProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <FirebaseProvider>
        <AuthProvider>
          <SettingsProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </SettingsProvider>
        </AuthProvider>
      </FirebaseProvider>
    </ErrorBoundary>
  </StrictMode>,
);
