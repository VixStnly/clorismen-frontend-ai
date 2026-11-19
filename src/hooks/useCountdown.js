import { useEffect, useState } from 'react';
import { CONFIG } from '../config.js';

const end = new Date(CONFIG.promoEnd).getTime();
const pad = (n) => String(n).padStart(2, '0');

export function useCountdown() {
  const calc = () => {
    const t = Math.max(0, end - Date.now());
    return {
      t,
      d: pad(Math.floor(t / 864e5)),
      h: pad(Math.floor((t % 864e5) / 36e5)),
      m: pad(Math.floor((t % 36e5) / 6e4)),
      s: pad(Math.floor((t % 6e4) / 1e3)),
    };
  };
  const [v, setV] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setV(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return v;
}
