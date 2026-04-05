const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const checkDiskSpace = require('check-disk-space').default;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Tidak ada gambar yang diupload.' });
        }
        const ext = path.extname(req.file.originalname);
        const id = uuidv4() + ext;
        const filename = req.file.filename;
        const db = await getDb();
        await db.run(
            `INSERT INTO images (id, filename, upload_at, last_access) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [id, filename]
        );
        const domain = process.env.DOMAIN || `http://localhost:${process.env.PORT || 3000}`;
        const imageUrl = `${domain}/i/${id}`;
        res.json({
            message: 'Upload berhasil',
            id: id,
            url: imageUrl
        });
    } catch (error) {
        console.error('Error saat upload:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});
router.get('/i/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDb();
        const image = await db.get(`SELECT * FROM images WHERE id = ?`, [id]);
        if (!image) {
            return res.status(404).send('Gambar tidak ditemukan atau sudah dihapus (kadaluarsa).');
        }
        await db.run(`UPDATE images SET last_access = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
        const filePath = path.join(__dirname, '../uploads', image.filename);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error saat mengambil gambar:', error);
        res.status(500).send('Terjadi kesalahan pada server.');
    }
});
router.get('/api/disk-status', async (req, res) => {
    try {
        const drivePath = process.platform === 'win32' ? 'C:\\' : '/';
        const diskInfo = await checkDiskSpace(drivePath);
        const totalGB = (diskInfo.size / 1024 / 1024 / 1024).toFixed(1);
        const freeGB = (diskInfo.free / 1024 / 1024 / 1024).toFixed(1);
        const usedGB = (totalGB - freeGB).toFixed(1);
        const usedPercent = Math.round(((diskInfo.size - diskInfo.free) / diskInfo.size) * 100);
        const freePercent = 100 - usedPercent;
        res.json({
            usedPercent,
            freePercent,
            usedGB,
            freeGB,
            totalGB
        });
    } catch (error) {
        console.error('Error saat cek disk:', error);
        res.status(500).json({ error: 'Gagal membaca info disk.' });
    }
});
module.exports = router;
