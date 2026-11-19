import { CONFIG } from '../config.js';
import { useCountdown } from '../hooks/useCountdown.js';

export function TopTimer() {
  const { t, d, h, m, s } = useCountdown();
  return <span className="tb-timer" id="tbTimer">{t ? `${Number(d)}h ${h}:${m}:${s}` : 'Promo berakhir'}</span>;
}

export function Countdown() {
  const { d, h, m, s } = useCountdown();
  return (
    <div className="cd" id="countdown">
      <div className="u"><b>{d}</b><small>Hari</small></div><span className="sep">:</span>
      <div className="u"><b>{h}</b><small>Jam</small></div><span className="sep">:</span>
      <div className="u"><b>{m}</b><small>Menit</small></div><span className="sep">:</span>
      <div className="u"><b>{s}</b><small>Detik</small></div>
    </div>
  );
}

export function Quota() {
  if (CONFIG.quotaLeft == null || !CONFIG.quotaTotal) return null;
  return (
    <div className="quota" id="quota">
      <p>📦 Kuota promo tersisa: <b id="quotaLeft">{CONFIG.quotaLeft}</b> paket</p>
      <div className="bar"><i id="quotaBar" style={{ '--q': (100 - CONFIG.quotaLeft / CONFIG.quotaTotal * 100) + '%' }} /></div>
    </div>
  );
}
