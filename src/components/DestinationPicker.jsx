import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import '../styles/destination.css';

/*
 * Pilih kecamatan/kelurahan dengan autocomplete RajaOngkir (lewat BFF /bff/destinations).
 * Dipakai di landing utama (tema gelap) dan halaman VIP (tema terang): atur lewat prop `theme`.
 * Kalau layanan pencarian gagal, otomatis berubah jadi isian manual supaya order tetap bisa jalan.
 */
const titleCase = (s = '') => s.toLowerCase()
  .replace(/(^|[\s(/-])([a-z])/g, (m, a, b) => a + b.toUpperCase())
  .replace(/\b(Dki|Di|Ntb|Ntt)\b/g, (m) => m.toUpperCase());

function destParts(d) {
  const kel = titleCase(d.subdistrict);
  const kec = titleCase(d.district);
  return {
    top: kel && kel !== kec ? `Kel. ${kel}, Kec. ${kec}` : `Kec. ${kec}`,
    bottom: [titleCase(d.city), titleCase(d.province)].filter(Boolean).join(', ') + (d.zip ? ` ${d.zip}` : ''),
  };
}

/** Teks wilayah untuk disimpan di alamat order. */
export function destText(d) {
  if (!d) return '';
  if (d.manual) return d.text.trim();
  const p = destParts(d);
  return `${p.top}, ${p.bottom}`;
}

/** Valid kalau dipilih dari daftar, atau (saat mode manual) diketik minimal 5 huruf. */
export const destValid = (d) => !!d && (d.manual ? d.text.trim().length >= 5 : !!d.id);

export default function DestinationPicker({ id = 'fDest', inputRef, value, onChange, invalid, theme = 'light', inputClassName = '', invalidStyle }) {
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);
  const boxRef = useRef(null);
  const listId = `${id}-list`;

  useEffect(() => {
    const term = q.trim();
    if (value && !value.manual) return undefined;
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
  }, [q, value, failed]);

  useEffect(() => {
    const close = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const pick = (d) => { onChange(d); setOpen(false); setQ(''); setList([]); };
  const clear = () => { onChange(null); setQ(''); setTimeout(() => inputRef?.current?.focus(), 0); };

  const onKey = (e) => {
    if (!open || !list.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % list.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + list.length) % list.length); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(list[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  if (value && !value.manual) {
    const p = destParts(value);
    return (
      <div className={`dp dp-${theme}`}>
        <div className="dp-picked">
          <i className="fa-solid fa-location-dot" />
          <div><b>{p.top}</b><span>{p.bottom}</span></div>
          <button type="button" onClick={clear} ref={inputRef}>Ganti</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`dp dp-${theme}`} ref={boxRef}>
      <div className="dp-inp">
        <i className="fa-solid fa-magnifying-glass dp-ic" />
        <input
          ref={inputRef}
          id={id}
          className={`${inputClassName}${invalid ? ' is-bad' : ''}`}
          style={invalid ? invalidStyle : undefined}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={failed ? 'Ketik kecamatan, kota, dan kode pos' : 'Ketik nama kecamatan, contoh: Ciomas'}
          value={failed ? (value?.text || q) : q}
          onChange={(e) => {
            setQ(e.target.value);
            if (failed) onChange(e.target.value.trim() ? { manual: true, text: e.target.value } : null);
          }}
          onFocus={() => { if (list.length) setOpen(true); }}
          onKeyDown={onKey}
        />
        {loading ? <i className="fa-solid fa-spinner fa-spin dp-spin" /> : null}
      </div>
      {failed ? <small className="dp-hint">Pencarian otomatis sedang tidak tersedia, silakan ketik manual.</small>
        : q.trim().length > 0 && q.trim().length < 3 ? <small className="dp-hint">Ketik minimal 3 huruf.</small> : null}
      {open && !failed && q.trim().length >= 3 && !loading ? (
        <ul className="dp-list" id={listId} role="listbox">
          {list.length ? list.map((d, i) => {
            const p = destParts(d);
            return (
              <li key={d.id} role="option" aria-selected={i === active} className={i === active ? 'is-active' : ''}
                onPointerDown={(e) => { e.preventDefault(); pick(d); }} onMouseEnter={() => setActive(i)}>
                <b>{p.top}</b><span>{p.bottom}</span>
              </li>
            );
          }) : <li className="dp-empty">Kecamatan tidak ditemukan. Coba ejaan lain atau nama kota.</li>}
        </ul>
      ) : null}
    </div>
  );
}
