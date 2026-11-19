import { FeaturedReviews } from '../components/Reviews.jsx';

export default function Testimonials() {
  return (
    <>
      <section className="sp" id="testimoni" style={{background: "linear-gradient(180deg,var(--bg),var(--bg2))"}}>
        <div className="wrap">
          <div className="sec-head center" style={{marginBottom: "36px"}}>
            <div className="eyebrow" data-reveal="">Bukti Sosial</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Kata Mereka yang <span className="grad-text">Udah Pakai</span></h2>
          </div>
          <div className="proof-strip" data-reveal="">
            <div className="glass"><i className="fa-solid fa-star" style={{color: "var(--gold)"}}></i><b>4.8/5</b><span>rating</span></div>
            <div className="glass"><i className="fa-solid fa-box" style={{color: "var(--lime)"}}></i><b>10.000+</b><span>paket Clean Skin Series terjual</span></div>
            <div className="glass"><i className="fa-solid fa-droplet" style={{color: "var(--cyan)"}}></i><b>10.000+</b><span>Micellar Water &amp; Face Wash 3in1 masing-masing terjual satuan</span></div>
          </div>
          <FeaturedReviews />
        </div>
      </section>
    </>
  );
}
