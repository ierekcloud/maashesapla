import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function mount() {
  let container = document.getElementById('root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'root';
    if (document.body) {
      document.body.appendChild(container);
    }
  }
  if (container) {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
