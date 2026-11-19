import { useEffect } from 'react';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const countUp = (el) => {
  const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), plain = 'plain' in el.dataset;
  const t0 = performance.now(), dur = 1800;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur), v = to * (1 - Math.pow(1 - k, 4));
    el.textContent = plain ? Math.round(v) : v.toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

/**
 * Perilaku halaman yang sama persis dengan versi HTML:
 * reveal on scroll + counter, spotlight hero, tilt kartu, posisi nav, scroll state nav.
 * Elemen `data-rx` mengurus reveal-nya sendiri lewat React (useInView).
 */
export function useGlobalEffects() {
  useEffect(() => {
    const cleanups = [];

    // Reveal + counters
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('[data-reveal]:not([data-rx]), #timeline').forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // Spotlight hero
    const hero = $('.hero'), spot = $('#spot');
    if (hero && spot) {
      const mv = (e) => {
        const r = hero.getBoundingClientRect();
        spot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        spot.style.setProperty('--my', (e.clientY - r.top) + 'px');
      };
      hero.addEventListener('mousemove', mv);
      cleanups.push(() => hero.removeEventListener('mousemove', mv));
    }

    // Tilt
    if (matchMedia('(hover:hover)').matches) {
      $$('[data-tilt]').forEach((el) => {
        const mv = (e) => {
          const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
        };
        const lv = () => { el.style.transform = ''; };
        el.addEventListener('mousemove', mv);
        el.addEventListener('mouseleave', lv);
        cleanups.push(() => { el.removeEventListener('mousemove', mv); el.removeEventListener('mouseleave', lv); });
      });
    }

    // Nav + mobile bar
    const nav = $('#nav'), mbar = $('#mbar'), orderSec = $('#order');
    const fitNav = () => { nav.style.top = $('.topbar').offsetHeight + 'px'; };
    fitNav();
    const onScroll = () => {
      nav.classList.toggle('scrolled', scrollY > 30);
      const r = orderSec.getBoundingClientRect();
      mbar.classList.toggle('show', scrollY > 700 && !(r.top < innerHeight && r.bottom > 0));
    };
    addEventListener('resize', fitNav);
    addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => { removeEventListener('resize', fitNav); removeEventListener('scroll', onScroll); });

    return () => cleanups.forEach((fn) => fn());
  }, []);
}
