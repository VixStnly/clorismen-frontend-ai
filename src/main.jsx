import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Routing sederhana tanpa library: tiap halaman dimuat terpisah (CSS-nya juga terpisah).
const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
const load = path === '/vip-paket-clorismen'
  ? import('./vip/VipPage.jsx')
  : import('./LandingEntry.jsx');

const root = createRoot(document.getElementById('root'));
load.then(({ default: Page }) => {
  root.render(
    <StrictMode>
      <Page />
    </StrictMode>,
  );
});
