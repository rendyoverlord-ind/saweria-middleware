const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Antrean untuk menyimpan donasi
let donationQueue = [];

// 1. Endpoint Webhook untuk menerima donasi dari Saweria
app.post('/webhook', (req, res) => {
    const donationData = req.body;
    console.log('Donasi baru diterima dari Saweria:', donationData);

    // Masukkan ke antrean
    donationQueue.push(donationData);

    res.status(200).send({ status: 'success', message: 'Donasi berhasil diterima' });
});

// 2. Endpoint Polling untuk Roblox (diakses setiap 5 detik oleh Roblox)
app.get('/get-donations', (req, res) => {
    // Ambil semua donasi dari antrean lalu kosongkan antrean
    const currentDonations = [...donationQueue];
    donationQueue = [];

    res.status(200).json({
        status: 'success',
        donations: currentDonations
    });
});

// Test endpoint untuk cek server berjalan
app.get('/', (req, res) => {
    res.send('Saweria Roblox Middleware is Running!');
});

// Menjalankan server pada PORT dinamis (Railway)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server middleware berjalan di port ${PORT}`);
});
