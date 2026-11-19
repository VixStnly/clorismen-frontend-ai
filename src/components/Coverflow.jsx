import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { INFLUENCERS } from '../data.js';
import { fbError } from '../config.js';

const n = INFLUENCERS.length;

export default function Coverflow() {
  const [active, setActive] = useState(2);
  const [lb, setLb] = useState(null);
  const [w, setW] = useState(0);
  const [mob, setMob] = useState(false);
  const [hover, setHover] = useState(false);
  const [tick, setTick] = useState(0); // reset timer tiap interaksi
  const stageRef = useRef(null);
  const sx = useRef(null);

  useLayoutEffect(() => {
    const measure = () => {
      const c = stageRef.current && stageRef.current.querySelector('.ccard');
      if (c) setW(c.offsetWidth);
      setMob(innerWidth < 760);
    };
    measure();
    addEventListener('resize', measure);
    return () => removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (hover || lb !== null) return undefined;
    const id = setInterval(() => setActive((a) => (a + 1) % n), 3800);
    return () => clearInterval(id);
  }, [hover, lb, tick]);

  const go = useCallback((i) => { setActive(((i % n) + n) % n); setTick((t) => t + 1); }, []);
  const close = useCallback(() => { setLb(null); setTick((t) => t + 1); }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [close]);

  const cardStyle = (i) => {
    let o = i - active;
    if (o > n / 2) o -= n;
    if (o < -n / 2) o += n;
    const a = Math.abs(o);
    const x = o * (mob ? w * 0.78 : w * 0.96) - Math.sign(o) * (a > 1 ? (mob ? w * 0.1 : w * 0.06) * (a - 1) : 0);
    const s = a === 0 ? 1.08 : a === 1 ? 0.9 : 0.78;
    const y = a === 0 ? -6 : a === 1 ? 26 : 50;
    const hide = a > (mob ? 1 : 2);
    return { a, style: {
      transform: `translateX(${x}px) translateY(${y}px) scale(${s})`,
      zIndex: 10 - a, opacity: hide ? 0 : 1, pointerEvents: hide ? 'none' : 'auto',
    } };
  };

  const lbp = lb !== null ? INFLUENCERS[lb] : null;

  return (
    <>
      <div className="stage" id="stage" data-reveal="zoom" ref={stageRef}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        onPointerDown={(e) => { sx.current = e.clientX; }}
        onPointerUp={(e) => {
          if (sx.current === null) return;
          const dx = e.clientX - sx.current;
          if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
          sx.current = null;
        }}>
        <div className="floor" />
        {INFLUENCERS.map((p, i) => {
          const { a, style } = cardStyle(i);
          return (
            <div key={p.name} className={`ccard${a === 0 ? ' active' : ''}`} style={{ '--tint': p.tint, ...style }}
              onClick={(e) => {
                if (e.target.closest('[data-open]')) { e.preventDefault(); setLb(i); return; }
                if (i !== active) go(i); else setLb(i);
                setTick((t) => t + 1);
              }}>
              <div className="frame"><div className="inner">
                <img className="photo" src={p.img} onError={fbError(p.id)} alt={`${p.name} berkolaborasi dengan Clorismen`} loading="lazy" decoding="async" draggable="false" />
                <div className="tint2" /><div className="tint" />
                <div className="bigname"><span>{p.big[0]}</span><span>{p.big[1]}</span></div>
                <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="badge-new">COLLAB</span>
                <div className="glare" />
                <div className="info">
                  <div className="role">{p.role}</div>
                  <div className="name">{p.name}</div>
                  <div className="meta">{p.meta}</div>
                  <div className="bar" />
                  <a className="more" href="#" data-open={i}>Selengkapnya <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '12px' }} /></a>
                </div>
              </div></div>
            </div>
          );
        })}
      </div>
      <div className="stage-ctrl">
        <button type="button" className="arw" id="cPrev" aria-label="Sebelumnya" onClick={() => go(active - 1)}><i className="fa-solid fa-chevron-left" /></button>
        <div className="dots" id="cDots">
          {INFLUENCERS.map((p, i) => <button type="button" key={p.name} aria-label={`Kartu ${i + 1}`} className={i === active ? 'on' : ''} onClick={() => go(i)} />)}
        </div>
        <button type="button" className="arw" id="cNext" aria-label="Berikutnya" onClick={() => go(active + 1)}><i className="fa-solid fa-chevron-right" /></button>
      </div>

      <div className={`lightbox${lbp ? ' open' : ''}`} id="lightbox" aria-hidden={lbp ? 'false' : 'true'}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
        <div className="box glass">
          <button type="button" className="close" id="lbClose" aria-label="Tutup" onClick={close}><i className="fa-solid fa-xmark" /></button>
          <div className="media" id="lbMedia">
            {lbp ? (lbp.video
              ? <video src={lbp.video} autoPlay controls playsInline />
              : <img src={lbp.img} onError={fbError(lbp.id)} alt={lbp.name} />) : null}
          </div>
          <div className="txt">
            <div className="eyebrow" id="lbRole">{lbp ? lbp.role : ''}</div>
            <div className="h2" id="lbName" style={{ fontSize: '38px' }}>{lbp ? lbp.name : ''}</div>
            <p style={{ color: 'var(--muted)' }} id="lbDesc">{lbp ? `${lbp.name} berkolaborasi dengan Clorismen. Kalau mereka aja percaya, giliran lo buktiin sendiri.` : ''}</p>
            <a href="#order" className="btn btn-primary" id="lbCta" style={{ marginTop: '10px' }} onClick={close}>Ambil Promonya <i className="fa-solid fa-arrow-down" /></a>
          </div>
        </div>
      </div>
    </>
  );
}
