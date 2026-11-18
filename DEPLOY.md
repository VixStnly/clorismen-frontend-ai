# Deploy Clorismen Landing Page ke Coolify (v4.7.x)

Website ini statis (1 file `index.html` + folder `images/`), dijalankan di container **Nginx** lewat `Dockerfile`.

## 1. Siapkan repo Git
Coolify mengambil source dari Git. Dari folder `C:\xampp\htdocs\clorismen-landing`:

```bash
git init
git add .
git commit -m "Clorismen landing page"
git branch -M main
git remote add origin https://github.com/<akun>/clorismen-landing.git
git push -u origin main
```

> `index-lama.html` tidak ikut ke Git (ada di `.gitignore`).

## 2. Buat resource di Coolify
1. Buka panel Coolify → **Projects** → pilih/buat project → **+ New** → **Resource**.
2. Pilih **Public Repository** (atau **Private Repository (with GitHub App)** kalau repo private).
3. Isi URL repo, branch `main`.
4. **Build Pack: `Dockerfile`** (bukan Nixpacks).
   - Base Directory: `/`
   - Dockerfile Location: `/Dockerfile`
5. **Ports Exposes: `80`**.
6. **Domains**: isi domain lengkap dengan `https://`, misalnya `https://clorismen.com`
   (Coolify otomatis bikin sertifikat SSL Let's Encrypt).
7. Klik **Deploy**.

## 3. DNS domain
Arahkan domain ke IP server Coolify:

| Type | Name | Value |
|------|------|-------|
| A    | `@`  | `31.97.67.66` |
| A    | `www`| `31.97.67.66` |

Kalau pakai Cloudflare, set SSL/TLS ke **Full**.

## 4. Update website
Edit file → `git commit` → `git push`. Lalu klik **Redeploy** di Coolify,
atau aktifkan **Auto Deploy** (webhook GitHub) di tab *Webhooks* agar deploy otomatis setiap push.

## 5. Cek
- `https://<domain>/healthz` → harus menampilkan `ok`
- Status container di Coolify: **Running (healthy)**

## Pengaturan di `index.html` (blok `CONFIG` di bagian atas `<script>`)
- `waNumber` — nomor WhatsApp admin (sekarang `6285217866413`)
- `promoEnd` / `endText` — tanggal akhir promo
- `serumPrice`, `sunPrice` — harga satuan serum & sunscreen
- `quotaLeft`, `quotaTotal` — kuota promo (opsional)
