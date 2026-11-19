

export default function Nav() {
  return (
    <>
      <nav className="nav" id="nav">
        <div className="wrap inner">
          <a href="#top" className="logo" aria-label="Clorismen"><img src="/images/opt/logo-white.webp" alt="Clorismen" fetchPriority="high" /></a>
          <ul>
            <li><a href="#solusi">Isi Paket</a></li>
            <li><a href="#cara-pakai">Cara Pakai</a></li>
            <li><a href="#kolaborasi">Kolaborasi</a></li>
            <li><a href="#bonus">Bonus Ebook</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <a href="#order" className="btn btn-primary">Pesan Sekarang</a>
        </div>
      </nav>
    </>
  );
}
