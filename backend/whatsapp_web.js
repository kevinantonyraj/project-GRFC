const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

require('dotenv').config();  

const PORT = process.env.WHATSAPP_SERVICE_PORT ;

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth()
});

let isReady = false;
let qrCodeData = null;

client.on("qr", qr => {
    console.log("Scan QR:");
    qrcode.generate(qr, { small: true });
    qrCodeData = qr;
});

client.on("ready", () => {
    console.log("WhatsApp Ready!");
    isReady = true;
});


client.on("authenticated", () => {
    console.log("Authenticated");
});

client.on("disconnected", () => {
    console.log("Disconnected");
    isReady = false;
});

client.initialize();

app.get("/status", (req, res) => {
    res.json({
        ready: isReady,
        qrAvailable: !!qrCodeData
    });
});

app.get("/qr", (req, res) => {
    if (qrCodeData) {
        res.json({ qr: qrCodeData });
    } else {
        res.json({ message: "No QR available" });
    }
});

app.get("/restart", async (req, res) => {
    try {
        await client.destroy();
        await client.initialize();
        res.send("WhatsApp client restarted");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post("/send-group", async (req, res) => {
    try {
        const { groupId, message } = req.body;

        if (!isReady) {
            return res.status(400).json({
                error: "WhatsApp not ready"
            });
        }

        await client.sendMessage(groupId, message);

        res.json({
            success: true
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

app.get("/test-send", async (req, res) => {
    try {
        await client.sendMessage("YOUR_GROUP_ID", "Direct test message");
        res.send("Sent");
    } catch (err) {
        res.send(err.message);
    }
});

app.listen(PORT, () => {
    console.log(`WhatsApp Service Running on port ${PORT}`);
});