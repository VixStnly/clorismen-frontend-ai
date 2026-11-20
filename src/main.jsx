import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Routing sederhana tanpa library: tiap halaman dimuat terpisah (CSS-nya juga terpisah).
const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
const LEGAL = ['/faq', '/refund-policy', '/terms-and-conditions', '/privacy-policy', '/kontak'];
const load = path === '/vip-paket-clorismen'
  ? import('./vip/VipPage.jsx')
  : LEGAL.includes(path)
    ? import('./legal/LegalPage.jsx') // halaman informasi untuk verifikasi payment gateway
    : import('./LandingEntry.jsx');

const root = createRoot(document.getElementById('root'));
load.then(({ default: Page }) => {
  root.render(
    <StrictMode>
      <Page />
    </StrictMode>,
  );
});
