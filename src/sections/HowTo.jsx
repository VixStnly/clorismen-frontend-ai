import ProdImg from '../components/ProdImg.jsx';

export default function HowTo() {
  return (
    <>
      <section className="sp" id="cara-pakai" style={{background: "linear-gradient(180deg,var(--bg),var(--bg2))"}}>
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow" data-reveal="">Cara Pakai</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Cuma <span className="grad-text">2–3 Menit</span> Sehari</h2>
          </div>
          <div className="routine">
            <div className="rt pagi glass" data-reveal="" style={{'--d': "0s"}}>
              <div className="when"><div className="ic"><i className="fa-solid fa-sun"></i></div><div><b>PAGI</b><small>± 2 menit</small></div></div>
              <ol className="steps"><li>Face Wash <ProdImg k="facewash" alt="" /></li><li>Brightening Serum <ProdImg k="serum" alt="" /></li><li>Sunscreen <ProdImg k="sunscreen" alt="" /></li></ol>
            </div>
            <div className="rt siang glass" data-reveal="" style={{'--d': ".1s"}}>
              <div className="when"><div className="ic"><i className="fa-solid fa-motorcycle"></i></div><div><b>SIANG / ABIS AKTIVITAS</b><small>Di mana aja</small></div></div>
              <ol className="steps"><li>Semprot Micellar Water <ProdImg k="micellar" alt="" /></li><li>Usap pakai kapas, selesai</li></ol>
            </div>
            <div className="rt malam glass" data-reveal="" style={{'--d': ".2s"}}>
              <div className="when"><div className="ic"><i className="fa-solid fa-moon"></i></div><div><b>MALAM</b><small>± 3 menit</small></div></div>
              <ol className="steps"><li>Micellar Water <ProdImg k="micellar" alt="" /></li><li>Face Wash <ProdImg k="facewash" alt="" /></li><li>Brightening Serum <ProdImg k="serum" alt="" /></li></ol>
            </div>
          </div>
          <div className="tip glass" data-reveal="">
            <div className="bulb"><i className="fa-solid fa-lightbulb"></i></div>
            <div>
              <h4 className="h3" style={{fontSize: "20px", marginBottom: "6px"}}>Kenapa malam pakai Micellar Water dulu?</h4>
              <p>Seharian muka lo nempel debu, polusi &amp; sunscreen. Micellar Water angkat dulu kotoran itu, lalu Face Wash bersihin sisanya. Ini yang namanya <span className="tag2">double cleansing</span>, <b>rahasia muka bersih maksimal.</b></p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
