import PackageCards from '../components/PackageCards.jsx';

export default function Packages() {
  return (
    <>
      <section className="sp" id="paket" style={{background: "linear-gradient(180deg,var(--bg),var(--bg2))"}}>
        <div className="wrap">
          <div className="sec-head center">
            <div className="eyebrow" data-reveal="">Pilih Jumlah Paket</div>
            <h2 className="h2" data-reveal="" style={{'--d': ".08s"}}>Makin Banyak, <span className="grad-text">Makin Hemat</span></h2>
          </div>
          <PackageCards />
        </div>
      </section>
    </>
  );
}
