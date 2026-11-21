import { rp } from '../config.js';
import { useMainPrice } from '../lib/catalog.js';
import { TopTimer } from '../components/Countdown.jsx';

export default function Topbar() {
  const main = useMainPrice();
  return (
    <>
      <div className="noise"></div>


      <div className="topbar">
        <div className="inner">
          <span className="pill">PROMO KHUSUS WEBSITE</span>
          <span className="tb-long">🔥 Clean Skin Series cuma <b>{rp(main.price)}</b>{main.compare ? <> <s>{rp(main.compare)}</s></> : null} + Gratis Ongkir + Bonus Ebook</span>
          <span className="tb-short">🔥 Promo web <b>{rp(main.price)}</b> + Ongkir & Ebook gratis</span>
          <TopTimer />
        </div>
      </div>
    </>
  );
}
