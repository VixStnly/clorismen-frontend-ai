import { CONFIG, LOCAL, PRODUCTS, fbError, rp } from '../config.js';
import { useInView } from '../hooks/useInView.js';
import { useOrder } from '../state/OrderContext.jsx';

const stackKeys = (n) => {
  const order = ['facewash', 'micellar', 'serum', 'sunscreen'];
  const k = n === 1 ? order : n === 2 ? [...order, 'micellar', 'facewash'] : [...order, 'micellar', 'facewash', 'serum', 'sunscreen'];
  return k.slice(0, n === 1 ? 4 : n === 2 ? 5 : 6);
};

function PackageCard({ p, i }) {
  const { selIdx, setPkg } = useOrder();
  const [ref, inView] = useInView();
  return (
    <div ref={ref} data-rx="" data-reveal="" data-pkg={i} style={{ '--d': `${i * 0.1}s` }}
      className={`pkg glass ${p.hot ? 'hot' : ''}${selIdx === i ? ' sel' : ''}${inView ? ' in' : ''}`}
      onClick={() => setPkg(i)}>
      {p.hot ? <span className="ribbon">⭐ PALING HEMAT</span> : null}
      <div className="tier">{['🟢', '🔵', '🟣'][i]} {p.tier}</div>
      <div className="stack">
        {stackKeys(p.qty).map((x, k) => <img key={k} src={LOCAL[x]} onError={fbError(PRODUCTS[x])} alt="" loading="lazy" />)}
      </div>
      <div className="p">{rp(p.price)}</div>
      <div className="s">{p.save}</div>
      <div className="d">{p.desc}</div>
      <a href="#order" className={`btn ${p.hot ? 'btn-primary' : 'btn-ghost'}`}>Pilih {p.qty} Paket</a>
    </div>
  );
}

export default function PackageCards() {
  return (
    <div className="pkgs" id="pkgs">
      {CONFIG.packages.map((p, i) => <PackageCard key={p.slug} p={p} i={i} />)}
    </div>
  );
}
