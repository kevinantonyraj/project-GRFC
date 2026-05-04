import { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "qrcode.react";

export default function WhatsAppPanel() {
  const [status, setStatus] = useState(null);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://localhost:5001";

  // 🔄 Fetch Status
  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/status`);
      setStatus(res.data);

      // If not ready → get QR
      if (!res.data.ready) {
        fetchQR();
      } else {
        setQr(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 📷 Fetch QR
  const fetchQR = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/qr`);
      if (res.data.qr) {
        setQr(res.data.qr);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔁 Restart WhatsApp
  const restartWhatsApp = async () => {
    try {
      setLoading(true);
      await axios.get(`${BASE_URL}/restart`);
      setTimeout(fetchStatus, 3000);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // 🔄 Auto refresh every 5 sec
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: "#111",
      padding: "20px",
      borderRadius: "10px",
      color: "#fff"
    }}>
      <h2>WhatsApp Connection</h2>

      {/* STATUS */}
      {status?.ready ? (
        <p style={{ color: "lightgreen" }}>🟢 Connected</p>
      ) : (
        <p style={{ color: "orange" }}>🟠 Disconnected</p>
      )}

      {/* QR CODE */}
      {!status?.ready && qr && (
        <div style={{ marginTop: "20px" }}>
          <p>Scan QR to reconnect:</p>
          <QRCode value={qr} size={220} />
        </div>
      )}

      {/* BUTTON */}
      <button
        onClick={restartWhatsApp}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#d4af37",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        {loading ? "Restarting..." : "Reconnect WhatsApp"}
      </button>
    </div>
  );
}