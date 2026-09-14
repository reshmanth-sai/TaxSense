import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Analytics } from '@vercel/analytics/react';
import './index.css';

const isDeployed = !/^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|\d+\.\d+\.\d+\.\d+)$/.test(window.location.hostname);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        {/* Vercel Web Analytics: cookieless page-view counts only, no personal
            data, no cross-site tracking. Disclosed in the privacy policy.
            Only mounted on a real deployment -- locally /_vercel/insights/
            doesn't exist and the SPA fallback would hand the script tag HTML. */}
        {isDeployed && <Analytics />}
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
