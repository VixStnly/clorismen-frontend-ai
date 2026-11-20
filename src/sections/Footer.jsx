import { CONFIG, rp, waLink } from '../config.js';
import { useWaNumber } from '../lib/waNumber.js';

export default function Footer() {
  useWaNumber();
  return (
    <>
      <footer>
        <div className="wrap inner">
          <img src="/images/opt/logo-white.webp" alt="Clorismen" loading="lazy" decoding="async" />
          <span>© 2026 Clorismen Official · Skincare untuk kulit cowok Indonesia sejak 2016</span>
        </div>
        <nav className="wrap foot-links" aria-label="Informasi">
          <a href="/faq">FAQ</a>
          <a href="/refund-policy">Kebijakan Refund</a>
          <a href="/terms-and-conditions">Syarat &amp; Ketentuan</a>
          <a href="/privacy-policy">Kebijakan Privasi</a>
          <a href="/kontak">Kontak</a>
        </nav>
      </footer>

      <a className="wa-fab" href={waLink()} target="_blank" rel="noopener" aria-label="Chat admin via WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
      <div className="mbar" id="mbar"><div className="pp"><s>Rp332.000</s><b>{rp(CONFIG.price)}</b></div><a href="#order" className="btn btn-primary">Pesan Sekarang</a></div>
    </>
  );
}
