import { CONFIG, rp } from '../config.js';
import ProdImg from '../components/ProdImg.jsx';
import Bubbles from '../components/Bubbles.jsx';

export default function Hero() {
  return (
    <>
      <header className="hero" id="top">
        <div className="mesh"></div>
        <div className="bg-grid"></div>
        <div className="spot" id="spot"></div>
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <div className="chip" data-reveal=""><span className="tag">BARU</span> Clean Skin Series · Perawatan 4 Langkah</div>
            <h1 className="h-display" data-reveal="" style={{'--d': ".08s"}}>
              <span className="gloss-text">30 Hari dari Sekarang, Lo Bisa Ngaca dan Bilang:</span>
              <span className="quote grad-text"><em>“Gila, Muka Gue Beda.”</em></span>
            </h1>
            <p className="sub" data-reveal="" style={{'--d': ".16s"}}><b>Clorismen Clean Skin Series</b>: 4 langkah perawatan wajah pria (Micellar Water, Face Wash, Brightening Serum &amp; Sunscreen) yang bantu angkat debu, polusi &amp; minyak yang nggak keangkat sabun biasa. Muka lebih bersih, nggak kusam, dan seger seharian. <span className="hl">Hemat Rp133.000 + GRATIS Ebook “Strategi Tampil Lebih Baik Sebagai Seorang Pria Dalam Waktu 30 Hari”</span>, khusus order di website.</p>
            <div className="trust" data-reveal="" style={{'--d': ".24s"}}>
              <span className="star"><i className="fa-solid fa-star"></i> 4.8/5</span>
              <span><i className="fa-solid fa-box"></i> 10.000+ paket terjual</span>
              <span><i className="fa-solid fa-circle-check"></i> Terdaftar BPOM</span>
              <span><i className="fa-solid fa-shield-halved"></i> Tanpa hidroquinon &amp; merkuri</span>
            </div>
            <div className="hero-cta" data-reveal="" style={{'--d': ".32s"}}>
              <a href="#order" className="btn btn-primary btn-lg">Ambil Promonya Sekarang <i className="fa-solid fa-arrow-down"></i></a>
              <div className="price-chip"><s>Rp332.000</s><b>{rp(CONFIG.price)}</b><small>Hemat Rp133.000</small></div>
            </div>
          </div>

          <div className="hero-visual" data-reveal="zoom" style={{'--d': ".2s"}}>
            <div className="hero-ring"></div>
            <div className="hero-ring r2"></div>
            <div className="hero-arch"><img src="/images/opt/hero-model.webp" srcSet="/images/opt/hero-model-560.webp 560w, /images/opt/hero-model.webp 896w" sizes="(max-width: 760px) 90vw, 520px" alt="Cowok dengan wajah bersih dan segar" fetchPriority="high" decoding="async" /></div>
            <Bubbles />
            <div className="fbadge glass fb1"><div className="ic"><i className="fa-solid fa-star"></i></div><div><b>4.8/5</b><small>79.000+ ulasan</small></div></div>
            <div className="fbadge glass fb2"><div className="ic"><i className="fa-solid fa-droplet"></i></div><div><b>Tanpa Bilas</b><small>Micellar Water Spray</small></div></div>
            <div className="hero-products">
              <div className="podium"></div>
              <div className="hp h-fw"><ProdImg k="facewash" alt="Face Wash 3in1" eager /></div>
              <div className="hp h-ss"><ProdImg k="sunscreen" alt="Sunscreen" eager /></div>
              <div className="hp h-se"><ProdImg k="serum" alt="Brightening Serum" eager /></div>
              <div className="hp h-mic"><ProdImg k="micellar" alt="Micellar Water Spray" eager /></div>
            </div>
          </div>
        </div>
      </header>

      <div className="marquee" aria-hidden="true">
        <div className="track">
          <span><b>Angkat</b></span><span>Bersihkan</span><span><b>Rawat</b></span><span>Lindungi</span><span>Muka Bersih Maksimal</span>
          <span><b>Angkat</b></span><span>Bersihkan</span><span><b>Rawat</b></span><span>Lindungi</span><span>Muka Bersih Maksimal</span>
        </div>
      </div>
    </>
  );
}
