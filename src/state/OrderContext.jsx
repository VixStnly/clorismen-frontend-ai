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
