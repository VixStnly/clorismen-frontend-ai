/* =========================================================
   KONFIGURASI HALAMAN /vip-paket-clorismen — ubah di sini
   Semua angka bertanda "GANTI" masih CONTOH. Wajib dikoreksi sebelum iklan jalan.
   ========================================================= */
export const VIP = {
  waNumber: '6285217866413',

  // Pilihan paket. `slug` = slug produk di ERP (Master Produk). Harga di ERP harus sama dengan `price`,
  // karena total pembayaran Midtrans selalu dihitung ulang dari database ERP.
  packages: [
    {
      id: 'reguler',
      slug: 'clean-skin-series-1-paket',     // sudah ada di ERP
      name: 'Paket Reguler',
      desc: 'Perawatan 30 hari + Bonus E-Book',
      price: 199000,
      marketplace: 249000,                    // GANTI: harga Official Store marketplace
      perks: ['Paket lengkap 30 hari', 'Bonus E-Book eksklusif', 'Gratis ongkir'],
    },
    {
      id: 'vip',
      slug: 'paket-vip-komplit',             // sudah ada di ERP (VipPackageSeeder). Harga ERP = `price`
      name: 'Paket VIP Komplit',
      desc: 'Perawatan 30 hari + E-Book + Konsultasi Ahli Kesehatan Kulit',
      price: 279000,                          // GANTI
      marketplace: 359000,                    // GANTI
      hot: true,
      perks: ['Paket lengkap 30 hari', 'Bonus E-Book eksklusif', 'Konsultasi langsung Ahli Kesehatan Kulit', 'Gratis ongkir'],
    },
  ],

  // Order bump. Kalau `slug` diisi, bump ikut dikirim sebagai item ke ERP (masuk total Midtrans).
  // Kalau null, bump dicatat di catatan pesanan dan dikonfirmasi admin.
  bump: {
    slug: 'micellar-water-travel-size',       // sudah ada di ERP (VipPackageSeeder). Harga ERP = `price`
    name: 'Micellar Water Travel Size',       // GANTI
    price: 39000,                             // GANTI
    normal: 79000,                            // GANTI
    img: '/images/opt/vip-prod-micellar.webp',
  },

  ebookTitle: 'Rahasia Pria yang Diidamkan Wanita',
  ebookValue: 149000,
  ebookUrl: null,                             // GANTI: link download e-book (tampil setelah pembayaran lunas)

  slotsLeft: 7,                               // GANTI: isi angka kuota yang benar, atau null untuk menyembunyikan

  // Meta Pixel diatur lewat env VITE_META_PIXEL_ID saat build (lihat src/lib/pixel.js)

  // Review card "Day 1 vs Day 14" (Section 4). Pembeli asli, sudah setuju ceritanya ditampilkan.
  // Foto: 1 foto tunggal pembeli memegang box paket, cahaya natural (BUKAN foto before-after).
  // Simpan fotonya di images/vip/review-rizky.webp. Selama file belum ada, tampil kotak placeholder.
  storyReview: {
    name: 'Rizky Pratama',
    meta: '28 th, Karyawan Swasta — Jakarta',
    title: '“Dulu kirain cuci muka doang cukup, ternyata salah total...”',
    // Foto asli pembeli belum ada → pakai foto model + paket, diberi label "Foto ilustrasi (model)".
    // Kalau nanti ada foto asli: photo: '/images/vip/review-rizky.webp', photoIllustration: false
    photo: '/images/opt/vip-review-ilustrasi.webp',
    photoIllustration: true,
    rating: 4.9,
    days: [
      { label: 'Day 1', sub: 'Awal Pakai', text: 'Jujur, awalnya gue males ribet soal skincare. Biasanya cuma cuci muka pakai sabun apa aja di kamar mandi. Masalahnya tiap siang muka udah kayak kilang minyak, kusam, dan jerawat gampang muncul pas banyak kerjaan lapangan. Akhirnya gue mutusin nyoba ambil Paket Lengkap Clorismen karena lebih ngefek daripada beli sabunnya doang.' },
      { label: 'Day 7', sub: 'Minggu ke-1', text: 'Yang paling kerasa pertama kali itu kontrol minyaknya. Dipakai pagi sebelum berangkat kerja, sampai sore muka nggak gampang lepek atau kusam lagi. Teksturnya ringan, langsung nyerap, nggak bikin muka dempul atau lengket sama sekali.' },
      { label: 'Day 14', sub: 'Minggu ke-2', text: 'Bekas jerawat mulai memudar, tekstur kulit jauh lebih bersih, dan rekan kerja sama pasangan mulai ngeh kalau muka gue kelihatan lebih fresh dan terawat. Ditambah lagi, gue juga praktekin tips dari bonus E-book yang dikasih di paket ini — ngaruh banget ke cara pembawaan diri sehari-hari.' },
    ],
    quote: '“Untung kemaren langsung ambil paket di halaman ini, bukan beli satuan di marketplace. Harganya jauh lebih hemat, dapat bonus e-book, dan dapat pendampingan konsultasi.”',
  },

  legal: {
    company: 'Clorismen Official',
    address: '[Alamat kantor / gudang resmi]',   // GANTI
    bpom: [                                      // GANTI: nomor registrasi BPOM tiap produk
      { name: 'Micellar Water', no: '[NA...]' },
      { name: 'Face Wash 3in1', no: '[NA...]' },
      { name: 'Brightening Serum', no: '[NA...]' },
      { name: 'Sunscreen', no: '[NA...]' },
    ],
  },
};

export const rp = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID');
export const waUrl = (txt) => `https://wa.me/${VIP.waNumber}?text=${encodeURIComponent(txt)}`;
