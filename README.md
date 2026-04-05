# Simple Image Uploader & Donation System

Sebuah platform aplikasi web **Open Source** berbasis Node.js untuk mengunggah gambar secara anonim dengan sistem perlindungan mandiri file usang *(auto-deletion)* serta sistem donasi terintegrasi QRIS secara *real-time*.

📖 **[Lihat Dokumentasi API Lengkap →](http://localhost:3001/docs)**

## ✨ Fitur Utama

- ☁️ **Upload Anonim Sederhana** - Unggah gambar menggunakan antarmuka *drag and drop* yang minimalis dan sangat mudah digunakan.
- 🔗 **Link UUID Aman** - Setelah diunggah, file tersembunyi dengan proteksi format UUID acak (`/i/8b2d2943...a4.png`) guna menghindari akses pihak yang tidak diinginkan secara sembarangan.
- 🕒 **Auto-Delete (Kedaluwarsa 14 Hari)** - Didukung oleh SQLite & Node-cron, Server akan menelusuri data pada jam 12 malam setiap harinya untuk menghapus otomatis gambar yang sudah **tidak diakses selama lebih dari 14 hari**, guna menghemat penyimpanan VPS Anda secara mandiri. "Napas" (timer) gambar secara otomatis akan bertambah (ter-refresh) setiap kali URL-nya diakses.
- 💾 **Monitoring Disk Internal** - Terdapat *progress bar* pemantauan penyimpanan Hardisk/SSD dari spesifikasi server hosting agar selalu terpantau sebelum meluap.
- ❤️ **Integrasi QRIS Real-Time (Payinaja)** - Dukungan sistem donasi di halaman depan! Pengguna bisa membuat kode QR donasi dari Payinaja dan server akan otomatis menangkap (*polling*) status berhasil untuk memunculkan notifikasi tanpa memuat ulang *(refresh)* halaman. Juga menampilkan log Toast *pop-up* mini dari history transaksi yang telah terjadi.

## 🧰 Teknologi yang Digunakan

- **Backend / Core Engine**: `Node.js`, `Express.js`
- **File Handler / Storage Manager**: `Multer`, `fs` (Sistem File Lokal)
- **Database System**: `SQLite3`
- **Automation / Scheduler**: `Node-Cron`
- **Integrasi Pembayaran API**: API *Payinaja* Payment Gateway
- **Frontend**: Vanilla HTML, CSS terintegrasi untuk Styling modern, Native JS (`Fetch API`)

## 🚀 Cara Instalasi (Pengembangan Lokal / VPS)

Pastikan kamu memiliki **Node.js** terpasang di sistem operasi kamu.

**1. Salin Repositori**
```bash
git clone https://github.com/Richapss/Image-Uploader.git
cd Image-Uploader
```

**2. Install Module (Dependencies)**
```bash
npm install
```

**3. Konfigurasi Environment**
Gandakan file template yang disediakan ke file variabel baru:
```bash
cp .env.example .env
```
Buka file `.env` di teks editor, lalu isikan kredensial kamu (Secara khusus isikan *API KEY* Payinaja jika menggunakan sistem donasinya).

**4. Jalankan Server!**
Kamu dapat menjalankan dengan skrip dev maupun node standar:
```bash
npm run dev
# Atau jika server produksi:
# node server.js
```
*Note: Tabel `.sqlite` beserta foldernya akan dibangun secara otomatis saat server dioperasikan pertama kali.*
Buka alamat `http://localhost:3001` (sesuai `.env`) di peramban web (*browser*).


## 📚 Catatan Keamanan
1. API KEY diletakkan pada File Environment (`.env`) dan diamankan di filter `.gitignore` agar tidak tersebar ke jaringan publik (seperti repositori di GitHub).
2. Direktori `./src/uploads` diblokir akses rute aslinya oleh *Express Service*, sehingga siapapun yang sekadar iseng mencoba mengakses letak asli dari direktori (*grazing*) **tidak akan** menemukannya.
