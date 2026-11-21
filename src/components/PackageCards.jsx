import { LOCAL, PRODUCTS, fbError, rp } from '../config.js';
import { useInView } from '../hooks/useInView.js';
import { useOrder } from '../state/OrderContext.jsx';
import { useLandingPackages } from '../lib/catalog.js';

const stackKeys = (n) => {
  const order = ['facewash', 'micellar', 'serum', 'sunscreen'];
  const k = n === 1 ? order : n === 2 ? [...order, 'micellar', 'facewash'] : [...order, 'micellar', 'facewash', 'serum', 'sunscreen'];
  return k.slice(0, n === 1 ? 4 : n === 2 ? 5 : 6);
};

function PackageCard({ p, i }) {
  const { selIdx, setPkg } = useOrder();
  const [ref, inView] = useInView();
  const soldOut = !p.inStock;
  const pick = () => { if (!soldOut) setPkg(i); };
  return (
    <div ref={ref} data-rx="" data-reveal="" data-pkg={i} style={{ '--d': `${i * 0.1}s` }}
      className={`pkg glass ${p.hot && !soldOut ? 'hot' : ''}${selIdx === i ? ' sel' : ''}${soldOut ? ' soldout' : ''}${inView ? ' in' : ''}`}
      onClick={pick} aria-disabled={soldOut ? 'true' : undefined}>
      {soldOut ? <span className="ribbon ribbon-out">STOK HABIS</span> : p.hot ? <span className="ribbon">⭐ PALING HEMAT</span> : null}
      <div className="tier">{['🟢', '🔵', '🟣'][i % 3]} {p.title}</div>
      <div className="stack">
        {p.image
          ? <img src={p.image} alt={p.title} loading="lazy" decoding="async" className="stack-photo" />
          : stackKeys(Math.min(3, p.qty)).map((x, k) => <img key={k} src={LOCAL[x]} onError={fbError(PRODUCTS[x])} alt="" loading="lazy" />)}
      </div>
      <div className="p">{rp(p.price)}</div>
      <div className="s">{soldOut ? '' : p.save}</div>
      <div className="d">{p.desc}</div>
      {soldOut
        ? <span className="btn btn-ghost" aria-disabled="true">Stok Habis</span>
        : <a href="#order" className={`btn ${p.hot ? 'btn-primary' : 'btn-ghost'}`}>{p.title.length <= 20 ? `Pilih ${p.title}` : 'Pilih Paket Ini'}</a>}
    </div>
  );
}

export default function PackageCards() {
  const pkgs = useLandingPackages();
  return (
    <div className="pkgs" id="pkgs">
      {pkgs.map((p, i) => <PackageCard key={p.slug} p={p} i={i} />)}
    </div>
  );
}
