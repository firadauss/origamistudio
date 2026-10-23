# Origami Studio — Versi HTML, CSS, JavaScript (statis)

Tanpa PHP, tanpa database. Upload seluruh isi folder ke hosting apa pun (cPanel, Netlify, GitHub Pages, Vercel, dll.) atau jalankan lewat server lokal.

## Struktur
- `index.html`, `about.html`, `services.html`, `portfolio.html`, `news.html`, `contact.html`, `404.html`
- `news/*.html` — satu file per artikel
- `assets/css/style.css`, `assets/js/main.js`, `assets/img/`
- `sitemap.xml`, `robots.txt`

## Yang perlu diganti
1. **Kontak**: cari `hello@origamistudio.id`, `+62 812-0000-0000`, `6281200000000`, dan alamat di semua file `.html` (Find & Replace di editor).
2. **Pengaturan form & berita**: bagian atas `assets/js/main.js` (`SETTINGS`: nomor WhatsApp, email tujuan, artikel per halaman).
3. **Domain**: ganti `https://origamistudio.id` di `canonical`, `sitemap.xml`, dan `robots.txt` dengan domain Anda.

## Perbedaan dari versi PHP
- Formulir kontak membuka WhatsApp / aplikasi email dengan pesan terisi (situs statis tidak bisa mengirim email sendiri).
- Filter, pencarian, dan pagination News berjalan di JavaScript.
- Menambah artikel: salin salah satu file di `news/`, ubah isinya, tambahkan kartunya di `news.html` (salin satu blok `<article class="card post-card ...">`, isi `data-cat` dan `data-search`), dan daftarkan di `sitemap.xml`.
