import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

async function prepare() {
  // Only start MSW in development mode
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      // Don't print warnings for requests not handled by MSW
      onUnhandledRequest: 'bypass',
    });
    console.log('[MSW] Mock API ready — /automations and /simulate are intercepted');
  }
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
