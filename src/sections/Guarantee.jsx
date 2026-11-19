

export default function Guarantee() {
  return (
    <>
      <section className="sp-sm" id="garansi">
        <div className="wrap">
          <div className="sec-head center" style={{marginBottom: "40px"}}>
            <div className="eyebrow" data-reveal="">Garansi</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Belanja <span className="grad-text">Tanpa Was-was</span></h2>
          </div>
          <div className="guar">
            <div className="g-c glass" data-reveal=""><div className="shield"><i className="fa-solid fa-certificate"></i></div><h3 className="h3">100% Original</h3><p>Dikirim langsung dari Clorismen Official.</p></div>
            <div className="g-c glass" data-reveal="" style={{'--d': ".1s"}}><div className="shield"><i className="fa-solid fa-rotate"></i></div><h3 className="h3">Rusak/Salah Kirim = Ganti Baru</h3><p>Cukup kirim video unboxing ke admin.</p></div>
            <div className="g-c glass" data-reveal="" style={{'--d': ".2s"}}><div className="shield"><i className="fa-brands fa-whatsapp"></i></div><h3 className="h3">Admin Siap Bantu</h3><p>Konsultasi skincare gratis via WhatsApp setelah order.</p></div>
          </div>
        </div>
      </section>
    </>
  );
}
