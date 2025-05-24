const express = require('express');
const QRCode = require('qrcode');
const app = express();
const port = 3000;

// QR kodu oluşturan endpoint (GET ile)
app.get('/qrgen', async (req, res) => {
    try {
        const { text } = req.query; // Query parametresini al

        if (!text) {
            return res.status(400).json({ error: 'Text parameter is required (e.g., /qrgen?text=Merhaba)' });
        }

        // QR kodu oluştur (data URL olarak)
        const qrCode = await QRCode.toDataURL(text);

        // JSON yerine doğrudan resim göndermek isterseniz:
        // const qrImage = await QRCode.toBuffer(text);
        // res.type('png').send(qrImage);

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
