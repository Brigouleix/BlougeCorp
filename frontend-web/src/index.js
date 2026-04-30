import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Supprimer les erreurs Leaflet qui parasitent l'overlay CRA (capture phase = avant CRA)
window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
        !msg ||
        msg === 'Script error.' ||
        msg === 'Script error' ||
        msg.includes('ResizeObserver loop') ||
        msg.includes('_leaflet_pos') ||
        msg.includes('leaflet')
    ) {
        event.stopImmediatePropagation();
        event.preventDefault();
    }
}, true);

// Patch ResizeObserver pour éviter l'erreur "loop completed" (causée par Leaflet)
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback) {
        super((entries, observer) => {
            window.requestAnimationFrame(() => {
                if (!Array.isArray(entries) || !entries.length) return;
                callback(entries, observer);
            });
        });
    }
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);