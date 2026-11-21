import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { areaToShip } from '../lib/shipping.js';
import '../styles/destination.css';

/*
 * Cari kecamatan / kelurahan / kode pos (RajaOngkir lewat BFF /bff/destinations).
 * Saat dipilih, provinsi, kota, kecamatan & kode pos terisi otomatis di form (masih bisa diubah manual).
 * Kalau layanan pencarian gagal, pembeli tetap bisa mengisi kolom di bawahnya secara manual.
 */
const tc = (s = '') => s.toLowerCase().replace(/(^|[\s(/-])([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b(Dki|Di)\b/g, (m) => m.toUpperCase());
const parts = (d) => {
  const kel = tc(d.subdistrict);
  const kec = tc(d.district);
  return {
    top: kel && kel !== kec ? `Kel. ${kel}, Kec. ${kec}` : `Kec. ${kec}`,
    bottom: [tc(d.city), tc(d.province)].filter(Boolean).join(', ') + (d.zip ? ` ${d.zip}` : ''),
  };
};

export default function AreaSearch({ id = 'fArea', onPick, theme = 'light', inputClassName = '' }) {
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState(null);
  const boxRef = useRef(null);
  const listId = `${id}-list`;

  useEffect(() => {
    const term = q.trim();
    if (term.length < 3 || failed) { setList([]); setLoading(false); return undefined; }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const rows = await api.searchDestinations(term, ctrl.signal);
        setList(Array.isArray(rows) ? rows : []);
        setActive(rows?.length ? 0 : -1);
        setOpen(true);
      } catch {
        if (ctrl.signal.aborted) return;
        setFailed(true);
        setList([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 320);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, failed]);

  useEffect(() => {
    const close = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const pick = (d) => {
    onPick(areaToShip(d));
    setPicked(parts(d));
    setOpen(false); setQ(''); setList([]);
  };

  const onKey = (e) => {
    if (!open || !list.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % list.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + list.length) % list.length); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(list[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className={`dp dp-${theme}`} ref={boxRef}>
      <div className="dp-inp">
        <i className="fa-solid fa-magnifying-glass dp-ic" />
        <input
          id={id}
          className={inputClassName}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={failed}
          placeholder={failed ? 'Pencarian otomatis tidak tersedia, isi manual di bawah' : 'Ketik kecamatan atau kode pos, contoh: Coblong'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => { if (list.length) setOpen(true); }}
          onKeyDown={onKey}
        />
        {loading ? <i className="fa-solid fa-spinner fa-spin dp-spin" /> : null}
      </div>
      {picked && !q ? <small className="dp-hint dp-ok"><i className="fa-solid fa-circle-check" /> Terisi otomatis: {picked.top}, {picked.bottom}</small>
        : failed ? null
          : q.trim().length > 0 && q.trim().length < 3 ? <small className="dp-hint">Ketik minimal 3 huruf.</small>
            : <small className="dp-hint">Pilih dari daftar, provinsi, kota, kecamatan & kode pos langsung terisi.</small>}
      {open && !failed && q.trim().length >= 3 && !loading ? (
        <ul className="dp-list" id={listId} role="listbox">
          {list.length ? list.map((d, i) => {
            const p = parts(d);
            return (
              <li key={d.id} role="option" aria-selected={i === active} className={i === active ? 'is-active' : ''}
                onPointerDown={(e) => { e.preventDefault(); pick(d); }} onMouseEnter={() => setActive(i)}>
                <b>{p.top}</b><span>{p.bottom}</span>
              </li>
            );
          }) : <li className="dp-empty">Tidak ditemukan. Coba ejaan lain, nama kota, atau isi manual di bawah.</li>}
        </ul>
      ) : null}
    </div>
  );
}
