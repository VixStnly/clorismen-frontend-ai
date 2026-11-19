import { CONFIG, rp } from '../config.js';
import { TopTimer } from '../components/Countdown.jsx';

export default function Topbar() {
  return (
    <>
      <div className="noise"></div>


      <div className="topbar">
        <div className="inner">
          <span className="pill">PROMO KHUSUS WEBSITE</span>
          <span className="tb-long">🔥 Clean Skin Series cuma <b>{rp(CONFIG.price)}</b> <s>Rp332.000</s> + Gratis Ongkir + Bonus Ebook</span>
          <span className="tb-short">🔥 Promo web <b>{rp(CONFIG.price)}</b> + Ongkir & Ebook gratis</span>
          <TopTimer />
        </div>
      </div>
    </>
  );
}
