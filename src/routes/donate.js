const express = require('express');
const router = express.Router();
const PAYINAJA_BASE_URL = 'https://payinaja.web.id/api/v1';
function getApiKey() {
    return process.env.PAYINAJA_API_KEY;
}
router.post('/api/donate/create', async (req, res) => {
    try {
        const { amount, name } = req.body;
        if (!amount || isNaN(amount) || parseInt(amount) < 100) {
            return res.status(400).json({ error: 'Nominal donasi minimal Rp 100.' });
        }
        const reference_id = 'DONATE-' + Date.now();
        const response = await fetch(`${PAYINAJA_BASE_URL}/qris/create`, {
            method: 'POST',
            headers: {
                'x-api-key': getApiKey(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: parseInt(amount),
                reference_id,
                customer_name: name || 'Donatur Anonim'
            })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            return res.status(response.status).json({ error: data.message || 'Gagal membuat QRIS.' });
        }
        res.json({
            success: true,
            trx_id: data.data.payinaja_trx_id,
            qris_image_url: data.data.qris_image_url,
            amount_requested: data.data.amount_requested,
            total_amount: data.data.total_amount,
            fee: data.data.fee
        });
    } catch (error) {
        console.error('Error membuat donasi QRIS:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});
router.get('/api/donate/status/:trx_id', async (req, res) => {
    try {
        const { trx_id } = req.params;
        const response = await fetch(`${PAYINAJA_BASE_URL}/transaction/${trx_id}`, {
            method: 'GET',
            headers: {
                'x-api-key': getApiKey()
            }
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            return res.status(response.status).json({ error: data.message || 'Transaksi tidak ditemukan.' });
        }
        res.json({
            success: true,
            status: data.data.status,
            trx_id: data.data.trx_id,
            amount: data.data.net_amount,
            total_amount: data.data.total_amount,
            payment_method: data.data.payment_method,
            created_at: data.data.created_at
        });
    } catch (error) {
        console.error('Error cek status donasi:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});
router.get('/api/donate/transactions', async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const response = await fetch(`${PAYINAJA_BASE_URL}/transactions?limit=${limit}`, {
            method: 'GET',
            headers: {
                'x-api-key': getApiKey()
            }
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            return res.status(response.status).json({ error: data.message || 'Gagal mengambil riwayat.' });
        }
        const successTrx = data.data
            .filter(t => t.status === 'success')
            .map(t => ({
                trx_id: t.trx_id,
                amount: t.amount,
                payment_method: t.payment_method,
                created_at: t.created_at
            }));
        res.json({ success: true, data: successTrx });
    } catch (error) {
        console.error('Error ambil riwayat donasi:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});
module.exports = router;
