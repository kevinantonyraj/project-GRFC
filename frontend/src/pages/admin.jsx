import React, { useState, useEffect } from 'react';
import '../assets/css/global.css';
import '../assets/css/admin.css';
import usePageLoader from '../hooks/usePageLoader';
import useTilt       from '../hooks/useTilt';
import { authApi, saveTokens, getToken } from '../../../backend/api/auth.js';

/* ── Forgot Password Modal ───────────────────────────────── */
const ForgotModal = ({ onClose }) => {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleReset = () => {
    setSent(true);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(12px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ maxWidth:'400px', width:'90%', padding:'32px', textAlign:'center' }}>
        <button onClick={onClose} style={{ float:'right', background:'none', border:'none', color:'var(--text-muted)', fontSize:'1.2rem', cursor:'pointer' }}>✕</button>
        <h3 style={{ fontFamily:'var(--font-serif)', fontSize:'1.3rem', color:'var(--ivory)', marginBottom:'8px', clear:'both' }}>Reset Password</h3>
        <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'20px' }}>Enter your admin email and we'll send a reset link.</p>
        <input type="email" placeholder="admin@goldenrockfc.com" style={{ textAlign:'center', width:'100%' }} />
        <button className="btn btn-primary" onClick={handleReset} style={{ width:'100%', justifyContent:'center', marginTop:'14px' }}>
          Send Reset Link
        </button>
        {sent && (
          <div style={{ marginTop:'12px', fontSize:'0.85rem', color:'#4ade80', fontFamily:'var(--font-mono)' }}>
            ✓ Reset link sent! Check your inbox.
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ADMIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Admin() {
  usePageLoader();
  useTilt();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [human,      setHuman]      = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [feedback, setFeedback] = useState({ msg: '', cls: '' });
  const [loginState, setLoginState] = useState('idle');
  const [shake, setShake] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  // ── If already logged in, go straight to portal ─────────
  useEffect(() => {
    if (getToken()) {
      // Verify token is still valid before redirecting
      authApi.verify().then(res => {
        if (res.success) window.location.href = '/admin-portal';
      });
    }
  }, []);

  const handleKey = e => { if (e.key === 'Enter') attemptLogin(); };

  const attemptLogin = async () => {
    setEmailError(false);
    setPassError(false);
    setFeedback({ msg: '', cls: '' });

    // Client-side validation
    let valid = true;
    if (!email) { setEmailError(true); valid = false; }
    if (!password || password.length < 6) { setPassError(true); valid = false; }
    if (!human) {
      setFeedback({ msg: '⚠ Please confirm you are not a robot.', cls: 'error' });
      return;
    }
    if (!human) {
      setFeedback({ msg: '⚠ Please confirm you are not a robot.', cls: 'error' });
      return;
    }
    if (!valid) return;

    setLoginState('loading');

    try {
      const res = await authApi.login(email, password);

      if (res.success) {
        // Save tokens to localStorage
        saveTokens(res.data.access, res.data.refresh, res.data.user);
        setFeedback({ msg: '✓ Access granted. Redirecting…', cls: 'success' });
        // Redirect to admin portal after short delay
        setTimeout(() => {
          window.location.href = '/admin-portal';
        }, 1000);
      } else {
        setFeedback({ msg: `✗ ${res.message || 'Invalid credentials. Please try again.'}`, cls: 'error' });
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setFeedback({ msg: '✗ Server error. Make sure the backend is running.', cls: 'error' });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoginState('idle');
    }
  };
  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="page-loader" id="loader">
        <div className="loader-logo">GOLDEN ROCK FC</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>

      <div className="bg-mesh" />
      <div className="bg-grain" />

      {forgotOpen && <ForgotModal onClose={() => setForgotOpen(false)} />}

      <div className="admin-wrapper">
        <a href="/" className="admin-back-link">← Return to Public Website</a>

        <div className={`admin-card card tilt-card${shake ? ' shake' : ''}`}>
          <h1 className="admin-title">ADMIN PORTAL</h1>

          <div className="admin-form">

            {/* Email */}
            <input
              type="text"
              placeholder="Username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKey}
            />

            {/* Password */}
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKey}
            />

            <label>
              <input type="checkbox" checked={human} onChange={e => setHuman(e.target.checked)} />
              I am not a robot
            </label>

            <button
              className={`btn btn-primary ${loginState === 'loading' ? 'loading' : ''}`}
              onClick={attemptLogin}
              disabled={loginState === 'loading'}
            >
              {loginState === 'loading' ? '⏳ Logging in...' : 'Login'}
            </button>

            {feedback.msg && (
              <div className={`login-feedback ${feedback.cls}`}>
                {feedback.msg}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}