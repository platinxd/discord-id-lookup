const express = require('express');
const QRCode = require('qrcode');
const app = express();
const port = 3000;

app.get('/qrgen/:text', async (req, res) => {
    try {
        const { text } = req.params;
        const qrImage = await QRCode.toBuffer(text);
        res.type('png').send(qrImage);
    } catch (error) {
        res.status(500).send('Error generating QR code');
    }
});

app.listen(port, () => {
    console.log(`QR API listening at http://localhost:${port}`);
});
