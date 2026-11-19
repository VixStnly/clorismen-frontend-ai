import { PROD_INFO } from '../data.js';
import { LOCAL, PRODUCTS, fbError } from '../config.js';

export default function ProductCards() {
  return (
    <div className="prod-grid" id="prodGrid">
      {PROD_INFO.map((p, i) => (
        <article key={p.key} className={`prod ${p.star ? 'star' : ''}`} style={{ '--c': p.c, '--d': `${i * 0.08}s` }} data-reveal="" data-tilt="">
          <div className="studio">
            <span className="stepno">{p.step} · {p.verb}</span>
            {p.star ? <span className="crown">★ BINTANG UTAMA</span> : null}
            <span className="verb">{p.verb}</span>
            <div className="ped" />
            <div className="refl"><img src={LOCAL[p.key]} onError={fbError(PRODUCTS[p.key])} alt="" loading="lazy" /></div>
            <div className="pimg"><img src={LOCAL[p.key]} onError={fbError(PRODUCTS[p.key])} alt={p.title} loading="lazy" /></div>
            <div className="sweep" />
          </div>
          <div className="body">
            <h3 className="h3">{p.title}</h3>
            <p dangerouslySetInnerHTML={{ __html: p.desc }} />
            {p.perk ? <div className="perk" dangerouslySetInnerHTML={{ __html: p.perk }} /> : null}
            <div className="ing" dangerouslySetInnerHTML={{ __html: p.ing }} />
          </div>
        </article>
      ))}
    </div>
  );
}
