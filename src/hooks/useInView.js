import { useEffect, useRef, useState } from 'react';

/** Sekali true saat elemen masuk viewport (opsi sama dengan reveal versi HTML). */
export function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { setInView(true); io.disconnect(); }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}
