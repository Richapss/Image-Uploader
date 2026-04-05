const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { getDb } = require('../database/db');
cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Memulai pengecekan dan penghapusan otomatis...');
    try {
        const db = await getDb();
        const expiredImages = await db.all(`
            SELECT * FROM images 
            WHERE last_access < datetime('now', '-14 days')
        `);
        if (expiredImages.length === 0) {
            console.log('[CRON] Tidak ada gambar kadaluarsa yang perlu dihapus.');
            return;
        }
        for (const img of expiredImages) {
            const filePath = path.join(__dirname, '../uploads', img.filename);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`[CRON] Terhapus (File fisik): ${img.filename}`);
                }
            } catch (err) {
                console.error(`[CRON] Gagal menghapus file fisik ${img.filename}:`, err);
            }
            await db.run(`DELETE FROM images WHERE id = ?`, [img.id]);
            console.log(`[CRON] Terhapus (Database DB): id ${img.id}`);
        }
    } catch (error) {
        console.error('[CRON] Terjadi error saat mengeksekusi penghapusan:', error);
    }
});
