

export default function Ebook() {
  return (
    <>
      <section className="sp ebook" id="bonus">
        <div className="wrap ebook-grid">
          <div className="book-scene" data-reveal="zoom">
            <div className="halo"></div>
            <div className="book">
              <div className="back"></div>
              <div className="spine"><span>CLORISMEN · 30 HARI</span></div>
              <div className="pages"></div>
              <div className="top"></div>
              <div className="front">
                <div className="cover">
                  <div className="lines"></div>
                  <div className="cv-top"><img src="images/logo-white.png" alt="Clorismen" /><span>EBOOK EKSKLUSIF</span></div>
                  <div className="big30">30<small>HARI</small></div>
                  <div className="ttl">Strategi Tampil <em>Lebih Baik</em> Sebagai Seorang Pria</div>
                  <div className="bar4"><i></i><i></i><i></i><i></i></div>
                  <div className="foot">Kulit · Grooming · Gaya · Percaya Diri</div>
                </div>
              </div>
            </div>
            <div className="book-shadow"></div>
          </div>
          <div data-reveal="right">
            <div className="eyebrow">Bonus Eksklusif · Khusus Website</div>
            <h2 className="h2" style={{marginTop: "14px", fontSize: "clamp(28px,3.6vw,46px)"}}>Ebook “Strategi Tampil Lebih Baik Sebagai Seorang Pria Dalam Waktu <span className="grad-text">30 Hari</span>”</h2>
            <div className="value"><span>Nilai</span><s>Rp149.000</s><i className="fa-solid fa-arrow-right" style={{color: "var(--muted)"}}></i><b>GRATIS</b></div>
            <p className="lead" style={{marginBottom: "22px"}}>Muka bersih itu langkah pertama. Ebook ini bantu lo upgrade <b style={{color: "#fff"}}>keseluruhan penampilan</b> dalam 30 hari:</p>
            <div className="weeks">
              <div className="wk"><div className="n">MGG<b>1</b></div><div><h5>Kulit &amp; Wajah</h5><p>Rutinitas skincare yang benar, kesalahan cuci muka yang bikin kusam</p></div></div>
              <div className="wk"><div className="n">MGG<b>2</b></div><div><h5>Grooming</h5><p>Potongan rambut sesuai bentuk wajah, rapiin alis &amp; jenggot, bau badan &amp; napas</p></div></div>
              <div className="wk"><div className="n">MGG<b>3</b></div><div><h5>Gaya</h5><p>Pakaian basic yang bikin rapi tanpa mahal, cara pakai parfum yang benar</p></div></div>
              <div className="wk"><div className="n">MGG<b>4</b></div><div><h5>Percaya Diri</h5><p>Postur, bahasa tubuh, kontak mata &amp; cara membawa diri</p></div></div>
              <div className="wk plus"><div className="n">PLUS<b>+</b></div><div><h5>Checklist &amp; Template</h5><p>Checklist harian 30 hari + template foto progres hari ke-1 vs hari ke-30</p></div></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
