import { TestimonialMarquee } from '../components/Reviews.jsx';

export default function SocialProof() {
  return (
    <>
      <section className="sp" id="bukti">
        <div className="orb" style={{width: "420px", height: "420px", background: "#2c7cff", left: "-160px", top: "80px", opacity: ".25"}}></div>
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow" data-reveal="">Dipercaya Sejak 2016</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Sejak 2016, Cowok Indonesia Udah <span className="grad-text">Percayain Mukanya</span> ke Clorismen</h2>
            <p className="lead" data-reveal="" style={{'--d': ".16s"}}>Hampir <b style={{color: "#fff"}}>10 tahun</b> kami fokus di satu hal: bikin skincare yang beneran cocok buat <b style={{color: "#fff"}}>kulit cowok Indonesia</b>, yang tiap hari kena panas, debu, dan polusi. Bukan brand kemarin sore yang cuma ikut tren.</p>
          </div>
          <div className="stats">
            <div className="stat glass" data-reveal="" style={{'--d': "0s"}}><div className="ico"><i className="fa-solid fa-calendar-check"></i></div><div className="num gloss-text"><span data-count="2016" data-plain="">0</span></div><div className="lbl">Berdiri sejak 2016 — <b>10 tahun</b> merawat kulit cowok Indonesia</div></div>
            <div className="stat glass" data-reveal="" style={{'--d': ".08s"}}><div className="ico"><i className="fa-solid fa-star"></i></div><div className="num gloss-text"><span data-count="4.8" data-dec="1">0</span>/5</div><div className="lbl">Rating dari <b>79.000+ ulasan</b> pembeli</div></div>
            <div className="stat glass" data-reveal="" style={{'--d': ".16s"}}><div className="ico"><i className="fa-solid fa-bag-shopping"></i></div><div className="num gloss-text"><span data-count="757">0</span>rb+</div><div className="lbl"><b>757.000+ produk terjual</b> di Tokopedia aja</div></div>
            <div className="stat glass" data-reveal="" style={{'--d': ".24s"}}><div className="ico"><i className="fa-solid fa-box-open"></i></div><div className="num gloss-text"><span data-count="10">0</span>rb+</div><div className="lbl"><b>10.000+ paket</b> Clean Skin Series terjual</div></div>
          </div>

          <div className="sub-head">
            <div>
              <div className="eyebrow">Ulasan Asli Pembeli</div>
              <h3 className="h3" style={{marginTop: "10px", fontSize: "clamp(24px,2.6vw,34px)"}}>Ini Kata Mereka yang Udah Pakai</h3>
            </div>
          </div>
        </div>
        <TestimonialMarquee />
        <div className="wrap">

          <div className="center" style={{marginTop: "46px"}} data-reveal="">
            <a href="#order" className="btn btn-primary btn-lg">Gue Mau Coba Juga <i className="fa-solid fa-arrow-down"></i></a>
          </div>
        </div>
      </section>
    </>
  );
}
