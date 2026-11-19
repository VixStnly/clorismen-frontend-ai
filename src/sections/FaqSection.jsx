import Faq from '../components/Faq.jsx';

export default function FaqSection() {
  return (
    <>
      <section className="sp" id="faq" style={{background: "linear-gradient(180deg,var(--bg),var(--bg2))"}}>
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow" data-reveal="">FAQ</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Yang Sering <span className="grad-text">Ditanyain</span></h2>
          </div>
          <Faq />
        </div>
      </section>
    </>
  );
}
