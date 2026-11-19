

export default function Results() {
  return (
    <>
      <section className="sp" id="hasil">
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow" data-reveal="">Progress Lo</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Apa yang Bisa <span className="grad-text">Lo Rasain</span></h2>
          </div>
          <div className="tl" id="timeline">
            <div className="prog"></div>
            <div className="ms glass" data-reveal="" style={{'--d': "0s"}}><div className="when">Pemakaian Pertama</div><h4>Langsung terasa lebih bersih</h4><p>Muka terasa lebih bersih, segar &amp; nggak lengket. Kapas nggak sekotor biasanya.</p></div>
            <div className="ms glass" data-reveal="" style={{'--d': ".15s"}}><div className="when">Minggu 1–2</div><h4>Minyak lebih terkontrol</h4><p>Minyak terasa lebih terkontrol, muka keliatan lebih fresh walau abis aktivitas di luar.</p></div>
            <div className="ms glass" data-reveal="" style={{'--d': ".3s"}}><div className="when">Minggu 3–4</div><h4>Warna kulit lebih rata*</h4><p>Tampilan kusam berkurang, warna kulit keliatan lebih rata.</p></div>
          </div>
          <p className="disc">*Hasil tiap orang berbeda, tergantung kondisi kulit &amp; konsistensi pemakaian.</p>
        </div>
      </section>
    </>
  );
}
