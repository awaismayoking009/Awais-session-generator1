const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
const path = require('path');
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const router = express.Router();

router.get('/', async (req, res) => {
    const id = makeid();
    const tempDir = path.join(__dirname, 'temp', id);
    const phoneNumber = (req.query.number || '').replace(/\D/g, '');
    const { state, saveCreds } = await useMultiFileAuthState(tempDir);
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })) },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: Browsers.macOS("Desktop") // Important
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on("connection.update", async (s) => {
        if (s.connection === "open") {
            await delay(5000);
            const session = "AWAIS-MAYO-MD~" + Buffer.from(fs.readFileSync(path.join(tempDir, 'creds.json'))).toString('base64');
            await sock.sendMessage(sock.user.id, { text: `🚀 *SESSION ID:* ${session}` });
            process.exit(0);
        }
    });
    if (!sock.authState.creds.registered) {
        await delay(1500);
        const code = await sock.requestPairingCode(phoneNumber);
        if (!res.headersSent) res.send({ code });
    }
});
module.exports = router;
  
