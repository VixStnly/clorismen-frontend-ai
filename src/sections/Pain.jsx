

export default function Pain() {
  return (
    <>
      <section className="sp" id="masalah">
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow" data-reveal="">Relate Nggak?</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Lo Pasti Pernah <span style={{color: "var(--red)"}}>Ngalamin Ini</span></h2>
          </div>
          <div className="pain-grid">
            <div className="pain glass" data-reveal="" style={{'--d': "0s"}}><div className="x"><i className="fa-solid fa-xmark"></i></div><p>Lepas helm, muka <b>kusam, lepek &amp; berminyak</b></p></div>
            <div className="pain glass" data-reveal="" style={{'--d': ".06s"}}><div className="x"><i className="fa-solid fa-xmark"></i></div><p>Udah cuci muka, tapi pas diusap kapas <b>masih ada kotoran item</b></p></div>
            <div className="pain glass" data-reveal="" style={{'--d': ".12s"}}><div className="x"><i className="fa-solid fa-xmark"></i></div><p>Pori-pori keliatan <b>besar</b> dan muncul <b>komedo</b></p></div>
            <div className="pain glass" data-reveal="" style={{'--d': ".18s"}}><div className="x"><i className="fa-solid fa-xmark"></i></div><p>Siang hari muka <b>mengkilap</b>, padahal mau meeting atau ketemu orang</p></div>
            <div className="pain glass" data-reveal="" style={{'--d': ".24s"}}><div className="x"><i className="fa-solid fa-xmark"></i></div><p>Wajah keliatan <b>belang</b>: dahi &amp; hidung lebih gelap karena sering kena matahari</p></div>
            <div className="pain glass" data-reveal="" style={{'--d': ".3s"}}><div className="x"><i className="fa-solid fa-xmark"></i></div><p>Jerawat kecil muncul terus, padahal <b>udah rajin cuci muka</b></p></div>
          </div>
        </div>
      </section>
    </>
  );
}
