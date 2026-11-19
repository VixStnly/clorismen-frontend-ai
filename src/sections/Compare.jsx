import { CONFIG, rp } from '../config.js';
import ProdImg from '../components/ProdImg.jsx';

export default function Compare() {
  return (
    <>
      <section className="sp" id="banding">
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow" data-reveal="">Hitung Sendiri</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Beli Satuan vs <span className="grad-text">Beli Paket</span></h2>
          </div>
          <div className="cmp glass" data-reveal="">
            <table>
              <thead><tr><th>Item</th><th>Beli Satuan</th><th className="hi">Clean Skin Series di Website</th></tr></thead>
              <tbody>
                <tr><td><span className="pimg-s"><ProdImg k="micellar" alt="" />Micellar Water 100ml</span></td><td>Rp99.000</td><td className="hi"><span className="yes"><i className="fa-solid fa-check"></i> Termasuk</span></td></tr>
                <tr><td><span className="pimg-s"><ProdImg k="facewash" alt="" />Face Wash 3in1</span></td><td>Rp120.000</td><td className="hi"><span className="yes"><i className="fa-solid fa-check"></i> Termasuk</span></td></tr>
                <tr><td><span className="pimg-s"><ProdImg k="serum" alt="" />Brightening Serum</span></td><td>{CONFIG.serumPrice ? rp(CONFIG.serumPrice) : 'Rp[xx.000]'}</td><td className="hi"><span className="yes"><i className="fa-solid fa-check"></i> Termasuk</span></td></tr>
                <tr><td><span className="pimg-s"><ProdImg k="sunscreen" alt="" />Sunscreen</span></td><td>{CONFIG.sunPrice ? rp(CONFIG.sunPrice) : 'Rp[xx.000]'}</td><td className="hi"><span className="yes"><i className="fa-solid fa-check"></i> Termasuk</span></td></tr>
                <tr><td><i className="fa-solid fa-book-open" style={{color: "var(--lime)", marginRight: "10px"}}></i>Ebook 30 Hari</td><td><span className="no"><i className="fa-solid fa-xmark"></i></span></td><td className="hi"><span className="yes"><i className="fa-solid fa-gift"></i> GRATIS</span></td></tr>
                <tr><td><i className="fa-solid fa-truck-fast" style={{color: "var(--cyan)", marginRight: "10px"}}></i>Ongkir</td><td>Bayar</td><td className="hi"><span className="yes"><i className="fa-solid fa-check"></i> GRATIS</span></td></tr>
                <tr><td>Total</td><td>Rp332.000+</td><td className="hi">{rp(CONFIG.price)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
