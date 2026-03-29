import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/global.css';
import '../assets/css/admin.css';
import usePageLoader from '../hooks/usePageLoader';
import useTilt       from '../hooks/useTilt';

/* ═══════════════════════════════════════════════════════════
   FORGOT PASSWORD MODAL
═══════════════════════════════════════════════════════════ */
const ForgotModal = ({ onClose }) => {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleReset = () => {
    setSent(true);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ maxWidth: '400px', width: '90%', padding: '32px', textAlign: 'center' }}>
        <button
          onClick={onClose}
          style={{ float: 'right', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          ✕
        </button>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--ivory)', marginBottom: '8px', clear: 'both' }}>
          Reset Password
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Enter your admin email and we'll send a reset link.
        </p>
        <input type="email" placeholder="admin@goldenrockfc.com" style={{ textAlign: 'center' }} />
        <button
          className="btn btn-primary"
          onClick={handleReset}
          style={{ width: '100%', justifyContent: 'center', marginTop: '14px' }}
        >
          Send Reset Link
        </button>
        {sent && (
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
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

  /* ── Form state ────────────────────────────────────────── */
  const [email,       setEmail]       = useState('admin@goldenrockfc.com');
  const [password,    setPassword]    = useState('password');
  const [showPw,      setShowPw]      = useState(false);
  const [human,       setHuman]       = useState(false);

  /* ── Error / feedback state ────────────────────────────── */
  const [emailError,  setEmailError]  = useState(false);
  const [passError,   setPassError]   = useState(false);
  const [feedback,    setFeedback]    = useState({ msg: '', cls: '' });
  const [loginState,  setLoginState]  = useState('idle'); // idle | loading | done
  const [shake,       setShake]       = useState(false);

  /* ── Modal state ───────────────────────────────────────── */
  const [forgotOpen,  setForgotOpen]  = useState(false);

  /* ── Enter key support ─────────────────────────────────── */
  const handleKey = (e) => { if (e.key === 'Enter') attemptLogin(); };

  /* ── Password toggle ───────────────────────────────────── */
  const togglePw = () => setShowPw((v) => !v);

  /* ── Login logic ───────────────────────────────────────── */
  const attemptLogin = () => {
    // Reset errors
    setEmailError(false);
    setPassError(false);
    setFeedback({ msg: '', cls: '' });

    let valid = true;

    if (!email || !email.includes('@')) { setEmailError(true); valid = false; }
    if (!password || password.length < 6) { setPassError(true); valid = false; }
    if (!human) {
      setFeedback({ msg: '⚠ Please confirm you are not a robot.', cls: 'error' });
      return;
    }
    if (!valid) return;

    setLoginState('loading');

    setTimeout(() => {
      setLoginState('idle');
      if (email && password.length >= 6) {
        setFeedback({ msg: '✓ Access granted. Redirecting…', cls: 'success' });
        setTimeout(() => {
          alert('✓ Welcome to Golden Rock FC Admin Portal!\n\n(Dashboard page would load here in production.)');
          setFeedback({ msg: '', cls: '' });
        }, 1800);
      } else {
        setFeedback({ msg: '✗ Invalid credentials. Please try again.', cls: 'error' });
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }, 1800);
  };

  return (
    <>
      {/* Page Loader */}
      <div className="page-loader" id="loader">
        <div className="loader-logo">GOLDEN ROCK FC</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>

      {/* Background */}
      <div className="bg-mesh" />
      <div className="bg-grain" />

      {/* Animated orbs */}
      <div className="admin-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Grid lines */}
      <div className="grid-lines" />

      {/* Forgot Password Modal */}
      {forgotOpen && <ForgotModal onClose={() => setForgotOpen(false)} />}

      <div className="admin-wrapper">

        {/* Back link */}
        <a href="/" className="admin-back-link">← Return to Public Website</a>

        {/* Login Card */}
        <div className={`admin-card card tilt-card${shake ? ' shake' : ''}`}>

          <div className="admin-accent-line" />

          {/* Logo */}
          <div className="admin-logo-wrap">
            <div className="admin-logo-icon">🛡️</div>
            <div className="admin-logo-line" />
          </div>

          {/* Title */}
          <h1 className="admin-title">ADMIN PORTAL</h1>
          <p className="admin-subtitle">Authorized personnel only. Secure login required.</p>

          {/* Form */}
          <div className="admin-form">

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="adminEmail">Administrator Email</label>
              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input
                  type="email"
                  id="adminEmail"
                  placeholder="admin@goldenrockfc.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(false); }}
                  onKeyDown={handleKey}
                />
              </div>
              {emailError && (
                <div className="input-error show">Please enter a valid email.</div>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="adminPass">Security Password</label>
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => setForgotOpen(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  id="adminPass"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPassError(false); }}
                  onKeyDown={handleKey}
                />
                <button
                  className="pw-toggle"
                  onClick={togglePw}
                  type="button"
                  id="pwToggle"
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              {passError && (
                <div className="input-error show">Password must be at least 6 characters.</div>
              )}
            </div>

            {/* Captcha */}
            <div className="captcha-row">
              <label className="captcha-label">
                <input
                  type="checkbox"
                  checked={human}
                  onChange={(e) => setHuman(e.target.checked)}
                />
                {' '}I am not a robot
              </label>
              <span className="captcha-icon">🤖</span>
            </div>

            {/* Login Button */}
            <button
              className={`btn btn-primary login-btn${loginState === 'loading' ? ' loading' : ''}`}
              onClick={attemptLogin}
              disabled={loginState === 'loading'}
            >
              {loginState === 'loading' ? '⏳ Authenticating…' : '🔐 Secure Login'}
            </button>

            {/* Feedback */}
            {feedback.msg && (
              <div className={`login-feedback ${feedback.cls}`}>{feedback.msg}</div>
            )}

            {/* Security badge */}
            <div className="security-badge">
              <span>🛡️</span>
              <span>END-TO-END ENCRYPTED SESSION</span>
            </div>

          </div>

          {/* Footer info */}
          <div className="admin-footer-info">
            <p>OFFICIAL CLUB MANAGEMENT SYSTEM V2.4.0</p>
            <p style={{ marginTop: '12px', fontSize: '0.75rem', lineHeight: 1.7, color: 'var(--text-muted)', maxWidth: '360px', textAlign: 'center' }}>
              Access to this system is restricted to authorized Golden Rock FC staff. All login
              attempts and session activities are logged for security auditing purposes.
              Unauthorized access is strictly prohibited and subject to legal action.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}