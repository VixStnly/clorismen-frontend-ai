import { rp, waLink } from '../config.js';
import { useBrand, useWaNumber, fmtWa, brandSocials } from '../lib/waNumber.js';
import { useMainPrice } from '../lib/catalog.js';

export default function Footer() {
  const wa = useWaNumber();
  const brand = useBrand(); // diatur di ERP: Landing Page CMS → Brand
  const main = useMainPrice();
  const name = brand?.name || 'Clorismen';
  const socials = brandSocials(brand);
  return (
    <>
      <footer>
        <div className="wrap inner">
          <img src="/images/opt/logo-white.webp" alt={name} loading="lazy" decoding="async" />
          <span>© {new Date().getFullYear()} {name} Official · {brand?.tagline || 'Skincare untuk kulit cowok Indonesia sejak 2016'}</span>
        </div>
        <div className="wrap foot-contact">
          {brand?.address ? <span><i className="fa-solid fa-location-dot" /> {brand.address}</span> : null}
          {brand?.email ? <a href={`mailto:${brand.email}`}><i className="fa-solid fa-envelope" /> {brand.email}</a> : null}
          <a href={waLink()} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" /> {brand?.whatsapp_display || fmtWa(wa)}</a>
          {socials.length ? (
            <span className="foot-social">
              {socials.map((s) => <a key={s.href} href={s.href} target="_blank" rel="noopener" aria-label={s.label} title={s.label}><i className={s.icon} /></a>)}
            </span>
          ) : null}
        </div>
        {brand?.footer_note ? <p className="wrap foot-note">{brand.footer_note}</p> : null}
        <nav className="wrap foot-links" aria-label="Informasi">
          <a href="/faq">FAQ</a>
          <a href="/refund-policy">Kebijakan Refund</a>
          <a href="/terms-and-conditions">Syarat &amp; Ketentuan</a>
          <a href="/privacy-policy">Kebijakan Privasi</a>
          <a href="/kontak">Kontak</a>
          <a href="/member">Member Area</a>
        </nav>
      </footer>

      <a className="wa-fab" href={waLink()} target="_blank" rel="noopener" aria-label="Chat admin via WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
      <div className="mbar" id="mbar"><div className="pp">{main.compare ? <s>{rp(main.compare)}</s> : null}<b>{rp(main.price)}</b></div><a href="#order" className="btn btn-primary">Pesan Sekarang</a></div>
    </>
  );
}
