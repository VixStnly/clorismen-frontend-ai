import { LOCAL, PRODUCTS, fbError } from '../config.js';

/** Foto produk: file lokal, otomatis fallback ke Google Drive kalau belum ada. */
export default function ProdImg({ k, alt = '', style }) {
  return <img src={LOCAL[k]} alt={alt} style={style} decoding="async" onError={fbError(PRODUCTS[k])} />;
}
