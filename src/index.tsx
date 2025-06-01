import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from '@application/state/store';
import { ToastProvider } from '@shared/services/ToastProvider';
import { logWebVitalsReport } from '@shared/utils/webVitals';
import App from '@ui/App';
import '@infrastructure/i18n';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Element with id "root" not found in the DOM.');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// Llamar a la función después de un breve retraso
setTimeout(logWebVitalsReport, 1000);
