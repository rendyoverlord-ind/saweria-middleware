const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = 'kunci-rahasia-saweria-123';
const donationQueue = [];
const processedIds = new Set();

app.get('/', (req, res) => {
    res.json({ status: 'ok', queueLength: donationQueue.length });
});

// Endpoint untuk menerima webhook dari Saweria
app.post('/saweria-webhook', (req, res) => {
    try {
        const body = req.body;
        const donation = {
            id: body.id || (body.data && body.data.id) || ('saweria_' + Date.now()),
            amount: body.amount || (body.data && body.data.amount) || 0,
            donor_name: body.donor_name || (body.data && body.data.donor_name) || (body.data && body.data.donorName) || 'Anonymous',
            donor_message: body.donor_message || (body.data && body.data.donor_message) || (body.data && body.data.donorMessage) || '',
            created_at: body.created_at || (body.data && body.data.created_at) || new Date().toISOString(),
        };

        const robloxMatch = donation.donor_message.match(/roblox[:\s]+(\w+)/i);
        if (robloxMatch) {
            donation.roblox_username = robloxMatch[1];
        }
        if (!donation.roblox_username && donation.donor_name && !donation.donor_name.includes(' ')) {
            donation.roblox_username = donation.donor_name;
        }

        if (!processedIds.has(donation.id)) {
            processedIds.add(donation.id);
            donationQueue.push(donation);
            console.log('[Saweria] New donation: ' + donation.donor_name + ' - Rp ' + donation.amount);
        }
        res.status(200).json({ status: 'ok' });
    } catch (err) {
        console.error('[Saweria] Webhook error:', err);
        res.status(500).json({ error: 'internal error' });
    }
});

// Endpoint untuk polling dari Roblox
app.get('/poll', (req, res) => {
    const key = req.query.key;
    if (key !== API_KEY) return res.status(403).json({ error: 'unauthorized' });
    const donations = [...donationQueue];
    donationQueue.length = 0;
    res.json({ donations: donations });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('[Saweria] Middleware running on port ' + PORT);
});
