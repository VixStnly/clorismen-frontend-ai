import { createContext, useContext, useMemo, useState } from 'react';

const Ctx = createContext(null);

/** State bersama antara kartu paket & form order. */
export function OrderProvider({ children }) {
  const [qtyIdx, setQtyIdx] = useState(0);
  const [selIdx, setSelIdx] = useState(null); // kartu paket yang disorot (belum ada sebelum diklik)
  const [bump, setBump] = useState(false);
  const value = useMemo(() => ({
    qtyIdx, selIdx, bump, setBump,
    setPkg: (i) => { setQtyIdx(i); setSelIdx(i); },
  }), [qtyIdx, selIdx, bump]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useOrder = () => useContext(Ctx);

/**
 * Paket yang sedang dipilih di landing utama (daftar paket dari ERP).
 * Kalau paket terpilih stoknya habis, otomatis pindah ke paket pertama yang masih ada stoknya.
 */
export function useSelectedPackage(pkgs) {
  const { qtyIdx } = useOrder();
  let idx = Math.max(0, Math.min(qtyIdx, pkgs.length - 1));
  if (pkgs[idx] && !pkgs[idx].inStock) {
    const alt = pkgs.findIndex((p) => p.inStock);
    if (alt >= 0) idx = alt;
  }
  return { idx, p: pkgs[idx] };
}
