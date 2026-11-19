import Coverflow from '../components/Coverflow.jsx';

export default function Collab() {
  return (
    <>
      <section className="sp collab" id="kolaborasi">
        <div className="streaks"></div>
        <div className="wrap">
          <div className="sec-head center" style={{marginBottom: "0"}}>
            <div className="collab-label" data-reveal="">OFFICIAL COLLABORATION</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Udah Dipercaya Juga oleh <span className="grad-text">Nama-Nama Ini</span></h2>
            <p className="lead" data-reveal="" style={{'--d': ".16s"}}>Clorismen udah berkolaborasi dengan banyak figur publik dan influencer Indonesia, di antaranya:</p>
          </div>
        </div>
        <Coverflow />
        <div className="wrap">
          <p className="collab-quote" data-reveal="">Kalau mereka aja percaya, giliran lo buktiin sendiri.</p>
          <div className="center" style={{marginTop: "34px"}} data-reveal=""><a href="#order" className="btn btn-primary btn-lg">Ambil Promonya Sekarang <i className="fa-solid fa-arrow-down"></i></a></div>
        </div>
      </section>
    </>
  );
}
