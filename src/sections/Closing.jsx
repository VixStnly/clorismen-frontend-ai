import { CONFIG, rp, waLink } from '../config.js';
import { useMainPrice } from '../lib/catalog.js';
import { useWaNumber } from '../lib/waNumber.js';

export default function Closing() {
  useWaNumber();
  const main = useMainPrice();
  return (
    <>
      <section className="sp closing" style={{background: "radial-gradient(60% 60% at 50% 100%,rgba(44,124,255,.25),transparent 70%),var(--bg2)"}}>
        <div className="bg-grid"></div>
        <div className="wrap" style={{position: "relative"}}>
          <p className="lead" data-reveal="" style={{fontSize: "20px"}}>Tiap hari muka lo nempel debu, polusi, dan minyak. Itu nggak bisa lo hindari.</p>
          <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Yang bisa lo pilih: mau dibiarin numpuk, atau <span className="grad-text">dibersihin dengan cara yang benar.</span></h2>
          <div className="ps" data-reveal=""><b className="p">P.S.</b> Malam ini, coba tes kapas setelah cuci muka. Kalau kapasnya masih kotor, lo udah tahu jawabannya. Harga website <b>{rp(main.price)}</b> + Ebook gratis cuma sampai <b>{CONFIG.endText}</b>.</div>
          <a href="#order" className="btn btn-primary btn-lg" data-reveal="">Amankan Clean Skin Series Gue <i className="fa-solid fa-lock"></i></a>
          <p className="wa-line" data-reveal="">💬 Masih ragu? <a href={waLink()} target="_blank" rel="noopener">Chat admin di WhatsApp</a></p>
        </div>
      </section>
    </>
  );
}
