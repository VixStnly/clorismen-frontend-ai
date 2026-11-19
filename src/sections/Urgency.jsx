import { Countdown, Quota } from '../components/Countdown.jsx';

export default function Urgency() {
  return (
    <>
      <section className="sp-sm" id="urgensi">
        <div className="wrap">
          <div className="urg glass" data-reveal="">
            <div className="eyebrow" style={{color: "#ff8fa3", justifyContent: "center"}}>Jangan Sampai Kelewat</div>
            <h2 className="h2" style={{fontSize: "clamp(26px,3.4vw,42px)", marginTop: "12px"}}>⏰ Harga website + bonus ebook berakhir dalam:</h2>
            <Countdown />
            <Quota />
          </div>
        </div>
      </section>
    </>
  );
}
