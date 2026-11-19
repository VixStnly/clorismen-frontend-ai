import { CONFIG } from '../config.js';
import ProdImg from '../components/ProdImg.jsx';

export default function Offer() {
  return (
    <>
      <section className="sp" id="penawaran">
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow" data-reveal="">Penawaran</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Yang <span className="grad-text">Lo Dapetin</span></h2>
          </div>
          <div className="offer glass gborder" data-reveal="">
            <div className="left">
              <ul className="get">
                <li><span className="ck"><i className="fa-solid fa-check"></i></span>Micellar Water Spray 100ml<ProdImg k="micellar" alt="" /></li>
                <li><span className="ck"><i className="fa-solid fa-check"></i></span>Face Wash 3in1<ProdImg k="facewash" alt="" /></li>
                <li><span className="ck"><i className="fa-solid fa-check"></i></span>Brightening Serum<ProdImg k="serum" alt="" /></li>
                <li><span className="ck"><i className="fa-solid fa-check"></i></span>Sunscreen<ProdImg k="sunscreen" alt="" /></li>
                <li className="bonus"><span className="ck"><i className="fa-solid fa-gift"></i></span><span><b>BONUS #1:</b> Ebook “Tampil Lebih Baik dalam 30 Hari”</span><small>nilai Rp149.000</small></li>
                <li className="bonus"><span className="ck"><i className="fa-solid fa-gift"></i></span><span><b>BONUS #2:</b> <span>Kapas wajah / pouch travel buat bawa Micellar Water</span></span></li>
                <li className="bonus"><span className="ck"><i className="fa-solid fa-gift"></i></span><span><b>BONUS #3:</b> Konsultasi skincare via WhatsApp</span></li>
                <li className="bonus"><span className="ck"><i className="fa-solid fa-gift"></i></span><span><b>BONUS #4:</b> Gratis ongkir</span></li>
              </ul>
            </div>
            <div className="right">
              <div className="price-big">
                <div className="was">Harga Normal: <s>Rp332.000</s></div>
                <div className="eyebrow" style={{justifyContent: "center", marginTop: "18px"}}>Harga Website</div>
                <div className="now gloss-text"><sup>Rp</sup><span>{CONFIG.price.toLocaleString('id-ID')}</span></div>
                <div className="save">Hemat Rp133.000 + bonus ebook senilai Rp149.000!</div>
              </div>
              <a href="#paket" className="btn btn-primary btn-lg btn-block" style={{marginTop: "28px"}}>Pilih Paket Gue <i className="fa-solid fa-arrow-down"></i></a>
              <div className="mini-trust"><span><i className="fa-solid fa-truck-fast"></i>Gratis ongkir</span><span><i className="fa-solid fa-shield-halved"></i>100% original</span></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
