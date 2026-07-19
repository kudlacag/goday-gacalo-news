import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Function to hide loading screen
const hideLoadingScreen = () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hide');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 800);
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hide loading screen after React renders
// Using requestAnimationFrame to ensure React has rendered
requestAnimationFrame(() => {
  setTimeout(hideLoadingScreen, 100);
});

// Also hide on load as fallback
window.addEventListener('load', () => {
  setTimeout(hideLoadingScreen, 500);
});

// If your app has errors, hide loading screen anyway
window.addEventListener('error', () => {
  hideLoadingScreen();
});