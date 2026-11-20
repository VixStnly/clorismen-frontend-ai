import { useEffect, useState } from 'react';
import { useWaNumber, getWaNumber } from '../lib/waNumber.js';
import './legal.css';

/*
 * Halaman informasi & kebijakan (dibutuhkan untuk verifikasi payment gateway iPaymu):
 * /faq, /refund-policy, /terms-and-conditions, /privacy-policy, /kontak
 * Email, telepon, dan alamat usaha diambil dari ERP (Landing Page CMS → Brand), jadi cukup diubah di sana.
 */
const PAGES = {
  '/faq': 'faq',
  '/refund-policy': 'refund',
  '/terms-and-conditions': 'terms',
  '/privacy-policy': 'privacy',
  '/kontak': 'contact',
};
const NAV = [
  ['/faq', 'FAQ'],
  ['/refund-policy', 'Kebijakan Refund'],
  ['/terms-and-conditions', 'Syarat & Ketentuan'],
  ['/privacy-policy', 'Kebijakan Privasi'],
  ['/kontak', 'Kontak'],
];
const UPDATED = '20 November 2026';

function useBrand() {
  const [brand, setBrand] = useState(null);
  useEffect(() => {
    fetch('/bff/config', { headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((j) => setBrand(j?.data?.content?.brand || {}))
      .catch(() => setBrand({}));
  }, []);
  return brand;
}

const fmtPhone = (n) => (n ? '0' + String(n).replace(/^62/, '') : '');

function Faq() {
  const items = [
    ['Apa itu Clorismen?', 'Clorismen adalah brand skincare khusus pria Indonesia sejak 2016. Produk kami meliputi Micellar Water, Face Wash, Brightening Serum, dan Sunscreen yang dijual dalam bentuk paket Clean Skin Series dan Paket VIP.'],
    ['Apakah produknya aman dan terdaftar BPOM?', 'Ya. Seluruh produk adalah kosmetik perawatan kulit yang terdaftar di BPOM RI dan bebas merkuri serta hidrokuinon. Nomor registrasi tercantum di kemasan.'],
    ['Bagaimana cara memesan?', 'Pilih paket di halaman produk, isi nama, nomor WhatsApp, dan alamat pengiriman, lalu lanjutkan ke pembayaran. Setelah pembayaran berhasil, pesanan langsung tercatat dan dikonfirmasi lewat WhatsApp.'],
    ['Metode pembayaran apa saja yang tersedia?', 'Pembayaran diproses melalui payment gateway resmi (iPaymu): QRIS (semua e-wallet dan m-banking), Virtual Account bank, serta metode lain yang tersedia di halaman pembayaran. Status pembayaran terkonfirmasi otomatis.'],
    ['Berapa lama pesanan dikirim?', 'Pesanan diproses pada hari kerja setelah pembayaran terkonfirmasi. Estimasi pengiriman 2–5 hari kerja tergantung lokasi dan kurir. Nomor resi dikirim lewat WhatsApp.'],
    ['Apakah ada biaya ongkos kirim?', 'Untuk pemesanan melalui website selama promo berlangsung, ongkos kirim gratis ke seluruh Indonesia. Ketentuan yang berlaku ditampilkan di halaman produk saat pemesanan.'],
    ['Satu paket cukup untuk berapa lama?', 'Satu paket Clean Skin Series cukup untuk sekitar 1 bulan pemakaian rutin pagi dan malam.'],
    ['Bagaimana cara mendapatkan bonus E-Book dan konsultasi?', 'Link E-Book dan akses konsultasi dikirim lewat WhatsApp setelah pembayaran terkonfirmasi. Konsultasi bersifat edukasi perawatan kulit, bukan pengganti pemeriksaan medis.'],
    ['Bagaimana jika paket yang saya terima rusak atau tidak sesuai?', 'Hubungi kami maksimal 2×24 jam setelah paket diterima dengan menyertakan video unboxing. Ketentuan lengkapnya ada di halaman Kebijakan Refund.'],
    ['Bagaimana cara menghubungi Clorismen?', 'Hubungi kami lewat WhatsApp atau email yang tercantum di halaman Kontak. Admin aktif pada hari dan jam kerja.'],
  ];
  return (
    <>
      <h1>Pertanyaan yang Sering Ditanyakan (FAQ)</h1>
      <div className="lg-faq">
        {items.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </>
  );
}

function Refund() {
  return (
    <>
      <h1>Kebijakan Pengembalian Dana (Refund Policy)</h1>
      <p className="lg-upd">Terakhir diperbarui: {UPDATED}</p>
      <p>Kebijakan ini berlaku untuk pembelian produk Clorismen melalui website resmi Clorismen.</p>

      <h2>1. Kondisi yang dapat diajukan pengembalian</h2>
      <ul>
        <li>Produk diterima dalam keadaan rusak, pecah, atau bocor.</li>
        <li>Produk yang diterima tidak sesuai dengan pesanan (salah varian atau jumlah kurang).</li>
        <li>Pesanan sudah dibayar tetapi tidak dapat kami proses atau kirim.</li>
      </ul>

      <h2>2. Syarat pengajuan</h2>
      <ul>
        <li>Pengajuan dilakukan maksimal <b>2×24 jam</b> sejak paket diterima, melalui kontak resmi di halaman Kontak.</li>
        <li>Menyertakan nomor pesanan, video unboxing tanpa jeda sejak paket masih tersegel, serta foto produk dan label pengiriman.</li>
        <li>Produk dalam kondisi belum digunakan, kecuali untuk kasus produk cacat.</li>
      </ul>

      <h2>3. Pembatalan pesanan</h2>
      <ul>
        <li>Pesanan yang sudah dibayar dapat dibatalkan selama <b>belum diserahkan ke kurir</b>. Dana dikembalikan penuh.</li>
        <li>Pesanan yang sudah dikirim tidak dapat dibatalkan, tetapi tetap dapat diajukan pengembalian sesuai poin 1.</li>
      </ul>

      <h2>4. Proses dan waktu pengembalian dana</h2>
      <ul>
        <li>Pengajuan diperiksa maksimal 2 hari kerja setelah data lengkap diterima.</li>
        <li>Jika disetujui, pembeli dapat memilih <b>penggantian produk</b> atau <b>pengembalian dana penuh</b>.</li>
        <li>Pengembalian dana ditransfer ke rekening bank atau e-wallet atas nama pembeli maksimal <b>7 hari kerja</b> setelah pengajuan disetujui.</li>
        <li>Ongkos kirim pengembalian produk yang rusak atau salah kirim ditanggung oleh Clorismen.</li>
      </ul>

      <h2>5. Yang tidak termasuk pengembalian</h2>
      <ul>
        <li>Pengajuan melewati batas waktu 2×24 jam atau tanpa video unboxing.</li>
        <li>Produk yang rusak karena kesalahan penggunaan atau penyimpanan setelah diterima.</li>
        <li>Bonus digital (E-Book) dan sesi konsultasi yang sudah diberikan.</li>
      </ul>
      <p>Jika terjadi reaksi kulit setelah pemakaian, hentikan penggunaan dan hubungi kami. Setiap kasus akan kami tangani secara individual.</p>
    </>
  );
}

function Terms() {
  return (
    <>
      <h1>Syarat &amp; Ketentuan</h1>
      <p className="lg-upd">Terakhir diperbarui: {UPDATED}</p>
      <p>Dengan melakukan pemesanan di website resmi Clorismen, Anda menyetujui syarat dan ketentuan berikut.</p>

      <h2>1. Produk</h2>
      <p>Clorismen menjual produk kosmetik perawatan kulit pria yang terdaftar di BPOM RI. Hasil pemakaian dapat berbeda pada setiap orang tergantung jenis kulit dan keteraturan penggunaan. Produk kami bukan obat.</p>

      <h2>2. Harga dan promo</h2>
      <p>Harga yang berlaku adalah harga yang tampil saat pesanan dibuat dan dihitung oleh sistem kami. Harga, bonus, dan promo dapat berubah sewaktu-waktu tanpa mengubah pesanan yang sudah dibayar.</p>

      <h2>3. Pemesanan</h2>
      <p>Pembeli wajib mengisi nama, nomor WhatsApp aktif, dan alamat pengiriman yang benar. Pesanan dengan data tidak lengkap atau tidak dapat dihubungi dapat kami batalkan, dan dana yang sudah dibayar dikembalikan penuh.</p>

      <h2>4. Pembayaran</h2>
      <p>Pembayaran dilakukan melalui payment gateway resmi (iPaymu) dengan metode yang tersedia di halaman pembayaran, seperti QRIS dan Virtual Account. Pesanan diproses setelah pembayaran terkonfirmasi oleh sistem. Clorismen tidak pernah meminta transfer ke rekening pribadi.</p>

      <h2>5. Pengiriman</h2>
      <p>Pesanan dikirim pada hari kerja menggunakan jasa kurir rekanan. Estimasi pengiriman 2–5 hari kerja tergantung lokasi. Keterlambatan dari pihak kurir di luar kendali kami, tetapi akan kami bantu tindak lanjuti.</p>

      <h2>6. Bonus dan konsultasi</h2>
      <p>Bonus E-Book dan konsultasi diberikan sesuai paket yang dibeli dan dikirim lewat WhatsApp. Konsultasi bersifat edukasi perawatan kulit dan bukan pengganti pemeriksaan atau saran medis.</p>

      <h2>7. Pengembalian dana</h2>
      <p>Ketentuan pengembalian barang dan dana mengikuti <a href="/refund-policy">Kebijakan Refund</a>.</p>

      <h2>8. Data pribadi</h2>
      <p>Penggunaan data pribadi mengikuti <a href="/privacy-policy">Kebijakan Privasi</a>.</p>

      <h2>9. Hukum yang berlaku</h2>
      <p>Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Setiap perselisihan diselesaikan terlebih dahulu secara musyawarah.</p>
    </>
  );
}

function Privacy() {
  return (
    <>
      <h1>Kebijakan Privasi</h1>
      <p className="lg-upd">Terakhir diperbarui: {UPDATED}</p>
      <h2>1. Data yang kami kumpulkan</h2>
      <p>Nama, nomor WhatsApp, alamat pengiriman, serta detail pesanan dan status pembayaran. Kami tidak menyimpan data kartu, PIN, atau kata sandi rekening; seluruh pembayaran diproses oleh payment gateway.</p>
      <h2>2. Penggunaan data</h2>
      <p>Data dipakai untuk memproses dan mengirim pesanan, konfirmasi pembayaran, mengirim bonus yang termasuk dalam paket, serta layanan pelanggan.</p>
      <h2>3. Berbagi data</h2>
      <p>Kami tidak menjual data pribadi. Data dibagikan seperlunya kepada mitra pengiriman dan penyedia pembayaran untuk menyelesaikan pesanan.</p>
      <h2>4. Cookie dan iklan</h2>
      <p>Website ini memakai cookie dan piksel iklan untuk mengukur kinerja iklan dan meningkatkan layanan.</p>
      <h2>5. Hak Anda</h2>
      <p>Anda dapat meminta salinan, perbaikan, atau penghapusan data pribadi dengan menghubungi kami melalui halaman <a href="/kontak">Kontak</a>.</p>
    </>
  );
}

function Contact({ brand }) {
  useWaNumber();
  const wa = getWaNumber();
  const phone = brand?.whatsapp_display || fmtPhone(wa);
  return (
    <>
      <h1>Kontak</h1>
      <p>Ada pertanyaan tentang produk, pesanan, atau pembayaran? Hubungi kami melalui kontak resmi berikut.</p>
      <div className="lg-contact">
        <div><i className="fa-brands fa-whatsapp" /><div><b>Telepon / WhatsApp</b><a href={`https://wa.me/${wa}`} target="_blank" rel="noopener">{phone}</a></div></div>
        <div><i className="fa-solid fa-envelope" /><div><b>Email</b>{brand?.email ? <a href={`mailto:${brand.email}`}>{brand.email}</a> : <span className="lg-dim">{brand ? 'Belum diisi' : 'Memuat…'}</span>}</div></div>
        <div><i className="fa-solid fa-location-dot" /><div><b>Alamat usaha</b>{brand?.address ? <span>{brand.address}</span> : <span className="lg-dim">{brand ? 'Belum diisi' : 'Memuat…'}</span>}</div></div>
        <div><i className="fa-solid fa-clock" /><div><b>Jam layanan</b><span>Senin–Sabtu, 09.00–17.00 WIB</span></div></div>
      </div>
    </>
  );
}

export default function LegalPage() {
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  const page = PAGES[path] || 'faq';
  const brand = useBrand();
  const name = brand?.name || 'Clorismen';

  useEffect(() => {
    const title = NAV.find(([p]) => p === path)?.[1] || 'FAQ';
    document.title = `${title} — Clorismen Official`;
  }, [path]);

  return (
    <div className="lg">
      <header className="lg-head">
        <a href="/" className="lg-logo" aria-label="Beranda Clorismen"><img src="/images/opt/logo-white.webp" alt="Clorismen" width="120" height="65" /></a>
        <a href="/" className="lg-back"><i className="fa-solid fa-arrow-left" /> Kembali ke toko</a>
      </header>
      <nav className="lg-nav" aria-label="Informasi">
        {NAV.map(([p, label]) => <a key={p} href={p} className={p === path ? 'on' : ''}>{label}</a>)}
      </nav>
      <main className="lg-main">
        {page === 'faq' && <Faq />}
        {page === 'refund' && <Refund />}
        {page === 'terms' && <Terms />}
        {page === 'privacy' && <Privacy />}
        {page === 'contact' && <Contact brand={brand} />}
      </main>
      <footer className="lg-foot">
        <p><b>{name} Official</b></p>
        {brand?.address ? <p>{brand.address}</p> : null}
        <p>
          {brand?.email ? <>{brand.email} · </> : null}
          {brand?.whatsapp_display || fmtPhone(getWaNumber())}
        </p>
        <p className="lg-links">{NAV.map(([p, label]) => <a key={p} href={p}>{label}</a>)}</p>
        <p className="lg-dim">© {new Date().getFullYear()} {name} Official</p>
      </footer>
    </div>
  );
}
