const express = require('express');
const QRCode = require('qrcode');
const app = express();
const port = 3000;

// JSON verilerini işlemek için middleware
app.use(express.json());

// QR kodu oluşturan endpoint
app.post('/generate-qr', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text parameter is required' });
        }

        // QR kodu oluştur (data URL olarak)
        const qrCode = await QRCode.toDataURL(text);

        res.json({ qrCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`QR API listening at http://localhost:${port}`);
});
