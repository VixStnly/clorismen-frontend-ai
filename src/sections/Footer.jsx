import { CONFIG, rp, waLink } from '../config.js';

export default function Footer() {
  return (
    <>
      <footer>
        <div className="wrap inner">
          <img src="images/logo-white.png" alt="Clorismen" />
          <span>© 2026 Clorismen Official · Skincare untuk kulit cowok Indonesia sejak 2016</span>
        </div>
      </footer>

      <a className="wa-fab" href={waLink()} target="_blank" rel="noopener" aria-label="Chat admin via WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
      <div className="mbar" id="mbar"><div className="pp"><s>Rp332.000</s><b>{rp(CONFIG.price)}</b></div><a href="#order" className="btn btn-primary">Pesan Sekarang</a></div>
    </>
  );
}
