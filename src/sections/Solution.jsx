import ProductCards from '../components/ProductCards.jsx';

export default function Solution() {
  return (
    <>
      <section className="sp" id="solusi">
        <div className="orb" style={{width: "520px", height: "520px", background: "#55d9f6", right: "-220px", top: "120px", opacity: ".16"}}></div>
        <div className="wrap">
          <div className="sec-head center" style={{marginBottom: "0"}}>
            <div className="eyebrow" data-reveal="">Solusinya</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Clorismen <span className="grad-text">Clean Skin Series</span></h2>
            <p className="lead" data-reveal="" style={{'--d': ".16s"}}><b style={{color: "#fff"}}>Paket 4-in-1 buat cowok yang mau muka bersih maksimal</b>, nggak cuma “keliatan” bersih. Sistemnya simpel:</p>
            <div className="flow" data-reveal="" style={{'--d': ".24s"}}><span>ANGKAT</span><i className="fa-solid fa-arrow-right"></i><span>BERSIHKAN</span><i className="fa-solid fa-arrow-right"></i><span>RAWAT</span><i className="fa-solid fa-arrow-right"></i><span>LINDUNGI</span></div>
          </div>
          <ProductCards />
        </div>
      </section>
    </>
  );
}
