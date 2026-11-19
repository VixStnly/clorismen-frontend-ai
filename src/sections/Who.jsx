

export default function Who() {
  return (
    <>
      <section className="sp-sm" id="cocok">
        <div className="wrap">
          <div className="sec-head center" style={{marginBottom: "40px"}}>
            <div className="eyebrow" data-reveal="">Cocok Buat Siapa?</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Dibikin Buat <span className="grad-text">Cowok yang Aktif</span></h2>
          </div>
          <div className="who">
            <div className="who-c glass" data-reveal="" style={{'--d': "0s"}}><div className="ic"><i className="fa-solid fa-motorcycle"></i></div><p>Pengendara motor &amp; ojol</p><span className="ok"><i className="fa-solid fa-check"></i> Cocok</span></div>
            <div className="who-c glass" data-reveal="" style={{'--d': ".06s"}}><div className="ic"><i className="fa-solid fa-helmet-safety"></i></div><p>Pekerja lapangan, sales, kurir</p><span className="ok"><i className="fa-solid fa-check"></i> Cocok</span></div>
            <div className="who-c glass" data-reveal="" style={{'--d': ".12s"}}><div className="ic"><i className="fa-solid fa-briefcase"></i></div><p>Mahasiswa &amp; pekerja kantoran yang commute</p><span className="ok"><i className="fa-solid fa-check"></i> Cocok</span></div>
            <div className="who-c glass" data-reveal="" style={{'--d': ".18s"}}><div className="ic"><i className="fa-solid fa-dumbbell"></i></div><p>Rajin olahraga &amp; sering keringetan</p><span className="ok"><i className="fa-solid fa-check"></i> Cocok</span></div>
            <div className="who-c glass" data-reveal="" style={{'--d': ".24s"}}><div className="ic"><i className="fa-solid fa-droplet"></i></div><p>Kulit berminyak &amp; gampang komedo</p><span className="ok"><i className="fa-solid fa-check"></i> Cocok</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
