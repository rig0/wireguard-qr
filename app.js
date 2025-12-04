const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const QRCode = require('qrcode');
const sodium = require('sodium-native');
const {
    validateWireguardConfig,
    validateFormData,
} = require('./validators/wireguard');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Read version from package.json or a version.txt file
const version = require('./package.json').version;

// Add body parser middleware to handle JSON
app.use(express.json());

// Route for the main page
app.get('/', (req, res) => {
    res.render('index', { version });
});

// New endpoint to fetch the version as JSON
app.get('/api/version', (req, res) => {
    res.json({ version }); // Sends the version number as a JSON response
});

// Route to generate the QR code
app.post('/create-qr', async (req, res) => {
    const {
        PrivateKey,
        Address,
        DNS,
        PublicKey,
        PreSharedKey,
        AllowedIPs,
        PersistentKeepAlive,
        Endpoint,
    } = req.body;

    // Validate form data (in-memory only, no storage)
    const validation = validateFormData(req.body);
    if (!validation.valid) {
        console.log(
            `Config validation failed: ${validation.errors.length} errors`
        );
        return res.status(400).json({
            error: 'Configuration validation failed',
            errors: validation.errors,
        });
    }

    // Build config string (ephemeral, not stored)
    const config = `[Interface]
PrivateKey = ${PrivateKey}
Address = ${Address}
DNS = ${DNS}

[Peer]
PublicKey = ${PublicKey}
PreSharedKey = ${PreSharedKey}
AllowedIPs = ${AllowedIPs}
PersistentKeepAlive = ${PersistentKeepAlive}
Endpoint = ${Endpoint}`;

    try {
        const qrCode = await QRCode.toDataURL(config);
        // Return QR code and config string (config sent back to client only)
        res.json({ qrCode, config });
    } catch (error) {
        console.error('QR Code generation error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

app.post('/generate-qr', express.json(), (req, res) => {
    const { config } = req.body;
    if (!config) {
        return res
            .status(400)
            .json({ error: 'No configuration file content provided' });
    }

    // Validate config string (in-memory only, no storage)
    const validation = validateWireguardConfig(config);
    if (!validation.valid) {
        console.log(
            `Config validation failed: ${validation.errors.length} errors`
        );
        return res.status(400).json({
            error: 'Configuration validation failed',
            errors: validation.errors,
        });
    }

    QRCode.toDataURL(config, (err, url) => {
        if (err) {
            console.error('QR Code generation error');
            return res
                .status(500)
                .json({ error: 'Failed to generate QR code' });
        }

        // Return QR code and config string (config sent back to client only)
        res.json({ qrCode: url, config });
    });
});

app.post('/generate-keys', (req, res) => {
    const privateKey = Buffer.alloc(sodium.crypto_box_SECRETKEYBYTES);
    const publicKey = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES);

    sodium.crypto_box_keypair(publicKey, privateKey);

    res.json({
        privateKey: privateKey.toString('base64'),
        publicKey: publicKey.toString('base64'),
    });
});

// Start the server
const PORT = process.env.PORT || 5182;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
