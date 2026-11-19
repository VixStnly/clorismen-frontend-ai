import { useState } from 'react';

export default function Agit() {
  const [pos, setPos] = useState(50);
  return (
    <>
      <section className="sp agit" id="tes-kapas">
        <div className="wrap agit-grid">
          <div data-reveal="left">
            <div className="cotton-wrap" id="cotton" style={{'--pos': pos + '%'}}>
              <div className="cotton-layer dirty"><div className="pad"><div className="grime"></div></div></div>
              <div className="cotton-layer clean"><div className="pad"></div>
                <span className="sparkle" style={{left: "24%", top: "22%"}}>✦</span><span className="sparkle" style={{right: "20%", top: "30%", animationDelay: "-.7s"}}>✦</span><span className="sparkle" style={{right: "28%", bottom: "20%", animationDelay: "-1.3s"}}>✦</span>
              </div>
              <span className="cotton-tag l">Sabun biasa</span>
              <span className="cotton-tag r">Clean Skin Series</span>
              <div className="cotton-handle"></div>
              <input type="range" min="0" max="100" defaultValue="50" onChange={e => setPos(e.target.value)} aria-label="Geser untuk membandingkan" id="cottonRange" />
            </div>
            <p className="cotton-note">Geser untuk bandingin · ilustrasi</p>
          </div>
          <div className="agit-copy" data-reveal="right">
            <div className="eyebrow">Kenapa Cuci Muka Biasa Nggak Cukup</div>
            <h2 className="h2" style={{marginTop: "14px"}}>Coba Tes Ini <span className="grad-text">Malam Ini.</span></h2>
            <p className="lead" style={{marginTop: "14px"}}>Abis cuci muka pakai sabun biasa, usap muka lo pakai kapas basah.</p>
            <div className="test"><b>Kalau kapasnya masih kotor</b>, berarti masih ada debu, polusi, dan minyak yang ketinggalan di pori-pori lo.</div>
            <p style={{fontWeight: "700"}}>Kotoran sisa ini yang bikin:</p>
            <ul className="effects">
              <li><i className="fa-solid fa-circle-exclamation"></i> Pori <b>tersumbat</b>, lalu muncul komedo &amp; jerawat</li>
              <li><i className="fa-solid fa-circle-exclamation"></i> Kulit <b>kusam</b> karena kotoran numpuk di permukaan</li>
              <li><i className="fa-solid fa-circle-exclamation"></i> Skincare yang lo pakai <b>nggak meresap maksimal</b></li>
            </ul>
            <p className="cycle">Dan kalau lo nggak pakai sunscreen, matahari bikin kulit makin gelap dan belang tiap hari. <b>Ini kayak lingkaran setan.</b></p>
          </div>
        </div>
      </section>
    </>
  );
}
