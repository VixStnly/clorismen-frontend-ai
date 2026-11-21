/* =========================================================
   KONFIGURASI HALAMAN /skin-check — ubah teks di sini
   Pertanyaan, jawaban, dan rekomendasi SUDAH DISIAPKAN (tidak ada AI / analisa real-time).
   Nama kartu, harga, foto, dan stok paket diambil dari ERP (Master Produk) berdasarkan `slug`.
   Produk dibuat dengan: php artisan db:seed --class=SkinCheckPackageSeeder (clorismen-erp)
   ========================================================= */

export const PRODUCTS = {
  facewash: { name: 'Power Face Wash', short: 'Face Wash', img: '/images/opt/prod-facewash.webp', w: 220, h: 560, tag: '3-in-1 Cleansing', tagIcon: 'fa-soap' },
  serum: { name: 'Brightening Serum', short: 'Serum', img: '/images/opt/prod-serum.webp', w: 249, h: 560, tag: 'Brightening', tagIcon: 'fa-wand-magic-sparkles' },
  sunscreen: { name: 'Pro Sunscreen', short: 'Sunscreen', img: '/images/opt/prod-sunscreen.webp', w: 199, h: 560, tag: 'UV Protection', tagIcon: 'fa-sun' },
  micellar: { name: 'Micellar Water Spray', short: 'Micellar', img: '/images/opt/prod-micellar.webp', w: 157, h: 560, tag: 'Tanpa Bilas', tagIcon: 'fa-droplet' },
};

// Etalase 4 produk di hero intro (seperti hero landing utama). Bukan paket: tidak punya slug/harga.
export const SHOWCASE = { items: ['facewash', 'micellar', 'serum', 'sunscreen'] };

// `name` hanya cadangan kalau judul kartu (landing_title) di Master Produk kosong. Harga TIDAK ditulis di sini.
export const PACKAGES = [
  { id: 'starter', slug: 'skin-check-starter-kit', name: 'Starter Kit', items: ['facewash'], desc: 'Satu langkah untuk mulai rutinitas cuci wajah yang konsisten.' },
  { id: 'daily', slug: 'skin-check-daily-protection-kit', name: 'Daily Protection Kit', items: ['facewash', 'sunscreen'], desc: 'Dua langkah: bersihkan wajah, lalu lindungi dari sinar matahari.' },
  { id: 'complete', slug: 'skin-check-complete-upgrade-kit', name: 'Complete Upgrade Kit', items: ['facewash', 'serum', 'sunscreen'], desc: 'Tiga produk untuk rutinitas pagi dan malam yang lebih lengkap.' },
  // Paket landing utama (4 produk). Harga & stok dari ERP. Judul kartu di ERP "1 Paket" (untuk landing), jadi
  // `erpText: false` = nama & deskripsi dari sini; `photo: false` = selalu tampil susunan 4 produk, bukan foto paket.
  { id: 'cleanskin', slug: 'clean-skin-series-1-paket', name: 'Clean Skin Series', erpText: false, photo: false, items: ['micellar', 'facewash', 'serum', 'sunscreen'], desc: 'Rutinitas paling lengkap: micellar buat angkat kotoran, sunscreen & minyak tanpa bilas, lalu cuci muka, serum, dan sunscreen.' },
];

export const QUESTIONS = [
  {
    id: 'activity',
    tone: 'sky',
    ask: 'Sehari-hari lu lebih banyak beraktivitas di mana?',
    label: 'Aktivitas',
    options: [
      { v: 'indoor', icon: 'fa-building', t: 'Kebanyakan di dalam ruangan', s: 'Kantor, rumah, kampus', short: 'Lebih sering indoor' },
      { v: 'mix', icon: 'fa-arrows-rotate', t: 'Campuran dalam & luar', s: 'Bolak-balik, kadang di jalan', short: 'Campuran indoor–outdoor' },
      { v: 'outdoor', icon: 'fa-sun', t: 'Sering di luar ruangan', s: 'Lapangan, naik motor, olahraga', short: 'Sering outdoor' },
    ],
  },
  {
    id: 'skin',
    tone: 'teal',
    ask: 'Wajah lu biasanya terasa seperti apa menjelang sore?',
    label: 'Kondisi kulit',
    options: [
      { v: 'oily', icon: 'fa-droplet', t: 'Cepat berminyak & mengkilap', s: 'Apalagi di dahi dan hidung', short: 'Cenderung berminyak' },
      { v: 'dull', icon: 'fa-cloud', t: 'Terlihat kusam & capek', s: 'Kurang segar di foto', short: 'Tampak kusam' },
      { v: 'normal', icon: 'fa-face-smile', t: 'Biasa aja, nggak ada keluhan', s: 'Mau mulai rawat dari sekarang', short: 'Normal' },
      { v: 'dry', icon: 'fa-leaf', t: 'Kering atau terasa ketarik', s: 'Terutama setelah cuci muka', short: 'Cenderung kering' },
    ],
  },
  {
    id: 'goal',
    tone: 'violet',
    ask: 'Apa yang paling pengin lu dapat dari rutinitas ini?',
    label: 'Fokus utama',
    options: [
      { v: 'clean', icon: 'fa-soap', t: 'Wajah bersih & segar', s: 'Nggak lepek seharian', short: 'Wajah bersih & segar' },
      { v: 'protect', icon: 'fa-shield-halved', t: 'Terlindungi dari matahari', s: 'Biar nggak makin kusam', short: 'Perlindungan UV' },
      { v: 'bright', icon: 'fa-wand-magic-sparkles', t: 'Wajah tampak lebih cerah', s: 'Lebih percaya diri', short: 'Tampak lebih cerah' },
      { v: 'start', icon: 'fa-seedling', t: 'Sekadar mulai yang benar', s: 'Belum tahu harus mulai dari mana', short: 'Mulai dari dasar' },
    ],
  },
  {
    id: 'routine',
    tone: 'amber',
    ask: 'Sekarang rutinitas wajah lu seperti apa?',
    label: 'Rutinitas sekarang',
    options: [
      { v: 'none', icon: 'fa-shower', t: 'Cuma bilas air / sabun mandi', s: 'Belum punya produk wajah', short: 'Belum ada rutinitas' },
      { v: 'wash', icon: 'fa-pump-soap', t: 'Sudah pakai sabun cuci muka', s: 'Tapi belum ada produk lain', short: 'Baru cuci muka' },
      { v: 'more', icon: 'fa-flask', t: 'Sudah pakai lebih dari satu produk', s: 'Mau upgrade / ganti', short: 'Sudah beberapa produk' },
    ],
  },
  {
    id: 'steps',
    tone: 'blue',
    ask: 'Terakhir: berapa langkah yang sanggup lu jalani tiap hari?',
    label: 'Gaya perawatan',
    options: [
      { v: '1', icon: 'fa-1', t: '1 langkah aja', s: 'Yang penting praktis', short: 'Mau 1 langkah' },
      { v: '2', icon: 'fa-2', t: '2 langkah masih oke', s: 'Pagi sedikit lebih lengkap', short: 'Siap 2 langkah' },
      { v: '3', icon: 'fa-3', t: '3 langkah, gas', s: 'Pagi dan malam', short: 'Siap 3 langkah' },
    ],
  },
];

/** Jawaban valid saja (dipakai juga untuk membersihkan data dari sessionStorage). */
export function cleanAnswers(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  QUESTIONS.forEach((q) => {
    const v = raw[q.id];
    if (typeof v === 'string' && q.options.some((o) => o.v === v)) out[q.id] = v;
  });
  return out;
}

export const optionOf = (qid, v) => QUESTIONS.find((q) => q.id === qid)?.options.find((o) => o.v === v);

/**
 * Aturan rekomendasi yang sudah dipetakan (bukan AI): jawaban → id paket.
 * - Clean Skin Series (4 produk): 3 langkah DAN (sering di luar ruangan ATAU sudah pakai beberapa produk).
 * - Complete Upgrade Kit (3 produk): 3 langkah lainnya, atau 2 langkah + fokus wajah cerah + sudah pakai beberapa produk.
 * - Daily Protection Kit (2 produk): 2 langkah lainnya, atau 1 langkah tapi sering di luar / fokus perlindungan UV.
 * - Starter Kit (1 produk): 1 langkah lainnya.
 */
export function recommend(a) {
  const steps = Number(a.steps || 2);
  if (steps >= 3) return a.activity === 'outdoor' || a.routine === 'more' ? 'cleanskin' : 'complete';
  if (steps === 2) return a.goal === 'bright' && a.routine === 'more' ? 'complete' : 'daily';
  // 1 langkah: tetap disarankan sunscreen kalau sering di luar atau fokusnya perlindungan
  return a.activity === 'outdoor' || a.goal === 'protect' ? 'daily' : 'starter';
}

/** Alasan (maks. 3) yang ditampilkan di hasil, disusun dari jawaban. */
export function reasons(a, pkgId) {
  const pkg = PACKAGES.find((p) => p.id === pkgId);
  const has = (k) => pkg?.items.includes(k);
  const out = [];
  const wash = {
    oily: 'Power Face Wash membersihkan minyak dan kotoran yang menumpuk seharian, jadi wajah nggak gampang lepek.',
    dull: 'Power Face Wash jadi langkah dasar membersihkan debu dan kotoran yang bikin wajah tampak kusam.',
    dry: 'Power Face Wash dipakai secukupnya untuk membersihkan wajah; bilas tuntas dan jangan digosok terlalu keras.',
    normal: 'Power Face Wash jadi langkah dasar supaya wajah bersih setiap pagi dan malam.',
  };
  if (has('micellar')) {
    out.push(a.activity === 'outdoor'
      ? 'Lu sering di luar, jadi malamnya Micellar Water Spray dipakai duluan buat angkat sisa sunscreen, debu, dan keringat tanpa bilas, baru cuci muka.'
      : 'Lu udah biasa pakai beberapa produk, jadi Micellar Water Spray jadi pembersih pertama di malam hari (tanpa bilas) sebelum cuci muka.');
    out.push(wash[a.skin] || wash.normal);
    out.push(a.goal === 'bright'
      ? 'Brightening Serum di malam hari mendukung fokus lu supaya wajah tampak lebih cerah, dan Pro Sunscreen jaga wajah tiap pagi.'
      : 'Malamnya Brightening Serum, paginya Pro Sunscreen. Empat produk ini saling melengkapi dari pagi sampai malam.');
    return out;
  }
  out.push(wash[a.skin] || wash.normal);
  if (has('sunscreen')) {
    out.push(a.activity === 'outdoor'
      ? 'Lu sering di luar ruangan, jadi Pro Sunscreen penting dipakai tiap pagi dan diulang saat aktivitas panjang.'
      : a.activity === 'mix'
        ? 'Aktivitas lu campuran dalam dan luar, jadi Pro Sunscreen di pagi hari tetap relevan.'
        : 'Walau lebih sering di dalam ruangan, Pro Sunscreen tetap berguna saat lu keluar di siang hari.');
  }
  if (has('serum')) {
    out.push(a.goal === 'bright'
      ? 'Brightening Serum di malam hari mendukung fokus lu supaya wajah tampak lebih cerah.'
      : 'Brightening Serum jadi langkah tambahan malam hari karena lu siap rutinitas yang lebih lengkap.');
  }
  if (pkgId === 'starter') {
    out.push('Satu produk dulu supaya kebiasaan terbentuk. Sunscreen bisa ditambah saat lu mulai sering keluar siang hari.');
  }
  if (pkgId === 'daily' && a.steps === '1') {
    out.push('Lu pilih 1 langkah, tapi sunscreen cuma butuh 1 menit di pagi hari. Malamnya cukup cuci muka.');
  }
  return out.slice(0, 3);
}

/** Kalimat ringkas dari konsultan untuk kartu hasil. */
export function consultantNote(a, pkgId) {
  const act = { indoor: 'lebih sering di dalam ruangan', mix: 'bolak-balik di dalam dan luar ruangan', outdoor: 'sering beraktivitas di luar ruangan' }[a.activity] || 'punya aktivitas yang padat';
  const goal = { clean: 'wajah bersih dan segar', protect: 'wajah terlindungi dari matahari', bright: 'wajah tampak lebih cerah', start: 'mulai rutinitas yang benar' }[a.goal] || 'rutinitas yang simpel';
  const plan = {
    starter: 'mulai dari satu langkah dulu: cuci wajah pagi dan malam dengan rutin',
    daily: 'cukup dua langkah: bersihkan wajah, lalu pakai sunscreen sebelum keluar',
    complete: 'pakai rutinitas lengkap: face wash dan sunscreen di pagi hari, lalu serum di malam hari',
    cleanskin: 'langsung pakai rutinitas paling lengkap: pagi face wash dan sunscreen, malam micellar buat angkat kotoran dan sunscreen, cuci muka, lalu serum',
  }[pkgId];
  return `Karena lu ${act} dan pengin ${goal}, saran gue ${plan}.`;
}

/** Rutinitas pagi & malam sesuai isi paket. */
export function routineFor(pkgId) {
  const pkg = PACKAGES.find((p) => p.id === pkgId);
  const has = (k) => pkg?.items.includes(k);
  return {
    morning: [
      'Bilas wajah, lalu pijat Power Face Wash ± 30 detik dan bilas sampai bersih.',
      has('sunscreen') ? 'Oleskan Pro Sunscreen merata ± 15 menit sebelum keluar; ulangi bila lama di luar.' : 'Kalau siang mau lama di luar, pertimbangkan tambah sunscreen.',
      ...(has('micellar') ? ['Siang habis aktivitas di luar? Usap wajah pakai Micellar Water di kapas biar segar lagi, tanpa bilas.'] : []),
    ],
    night: [
      ...(has('micellar') ? ['Semprot Micellar Water Spray ke kapas, usap wajah buat angkat sisa sunscreen, debu, dan minyak (tanpa bilas).'] : []),
      'Cuci wajah lagi dengan Power Face Wash untuk mengangkat kotoran seharian.',
      has('serum') ? 'Teteskan 2–3 tetes Brightening Serum, ratakan, lalu biarkan meresap.' : 'Cukup sampai di sini. Konsisten lebih penting daripada banyak produk.',
    ],
  };
}

// Pertanyaan cepat setelah hasil. Jawaban sudah disiapkan tim Clorismen (bukan chat AI).
export const QUICK_QA = [
  { q: 'Kenapa gue dapat paket ini?', a: (ctx) => `Dari jawaban lu (${ctx.summary}), paket ${ctx.pkgName} paling pas dengan jumlah langkah yang lu pilih. Lu tetap bebas ganti ke paket lain.` },
  { q: 'Cara pakainya gimana?', a: (ctx) => `${ctx.pkgName}: pagi pakai face wash${ctx.has('sunscreen') ? ', lalu sunscreen sebelum keluar' : ''}. Malam ${ctx.has('micellar') ? 'usap micellar di kapas dulu (tanpa bilas), lalu ' : ''}cuci muka lagi${ctx.has('serum') ? ', lalu 2–3 tetes serum' : ''}. Ikuti juga petunjuk di kemasan.` },
  { q: 'Kalau kulit gue sensitif?', a: () => 'Jangan langsung pakai semua produk sekaligus. Cek komposisi di kemasan, coba sedikit dulu di area kecil, dan hentikan pemakaian bila terasa perih atau iritasi. Kalau keluhannya berat, konsultasikan ke dokter.' },
  { q: 'Berapa lama sampai kelihatan hasilnya?', a: () => 'Setiap kulit berbeda, jadi kami tidak menjanjikan hasil dalam waktu tertentu. Yang paling berpengaruh adalah konsistensi: pakai rutin minimal 30 hari sambil jaga tidur dan minum air.' },
];

export const FAQ = [
  { q: 'Apakah Skin Check ini diagnosis kulit?', a: 'Bukan. Skin Check membantu memilih rutinitas dasar dari jawaban yang lu pilih. Untuk keluhan kulit yang berat, konsultasikan ke dokter.' },
  { q: 'Apakah hasilnya pasti terlihat dalam 30 hari?', a: 'Tidak ada jaminan hasil pasti. Hasil setiap orang berbeda, tergantung kondisi kulit dan konsistensi pemakaian.' },
  { q: 'Kalau mau paket lain, bisa?', a: 'Bisa. Pilih paket lain di kartu rekomendasi, total pembayaran otomatis mengikuti pilihan lu.' },
  { q: 'Pembayarannya bisa pakai apa?', a: 'Lewat payment gateway resmi: QRIS (semua e-wallet & m-banking) atau Virtual Account bank. Konfirmasi otomatis, pesanan diproses setelah lunas. Tidak ada COD.' },
  { q: 'Ongkirnya berapa?', a: 'Ongkir mengikuti pengaturan tiap paket dan sudah tampil di ringkasan sebelum lu bayar.' },
];
