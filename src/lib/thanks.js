// Pindah ke halaman terima kasih ber-token (/terima-kasih/{token}). Dipakai landing utama & VIP.
// replace() supaya tombol Back tidak kembali ke form dengan popup bayar yang sudah tertutup.
export function goThanks(data) {
  const path = data?.thanks_path && /^\/terima-kasih\/[A-Za-z0-9]{40}$/.test(data.thanks_path) ? data.thanks_path : null;
  if (path) window.location.replace(path);
}
