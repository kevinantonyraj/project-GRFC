import React, { useState, useEffect } from 'react';
import '../assets/css/global.css';
import '../assets/css/admin.css';
import usePageLoader from '../hooks/usePageLoader';
import useTilt       from '../hooks/useTilt';
import { authApi, saveTokens, getToken } from '../utils/auth.js';
import { Link, useNavigate } from 'react-router-dom';


export default function Admin() {
  const navigate = useNavigate();
  usePageLoader();
  useTilt();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  //const [human,      setHuman]      = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passError,  setPassError]  = useState(false);
  const [feedback,   setFeedback]   = useState({ msg: '', cls: '' });
  const [loginState, setLoginState] = useState('idle');
  const [shake,      setShake]      = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    if (getToken()) {
    
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

    
    let valid = true;
    if (!email || !email.includes('@')) { setEmailError(true); valid = false; }
    if (!password || password.length < 6) { setPassError(true); valid = false; }
    
    if (!valid) return;

    setLoginState('loading');

    try {
      const res = await authApi.login(email, password);

      if (res.success) {
        
        saveTokens(res.data.access, res.data.refresh, res.data.user);
        setFeedback({ msg: '✓ Access granted. Redirecting…', cls: 'success' });
     
        setTimeout(() => {
          navigate('/admin-portal');
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

  return (
    <>
      <div className="page-loader" id="loader">
        <div className="loader-logo">GOLDEN ROCK FC</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>
      <div className="bg-mesh" /><div className="bg-grain" />
      <div className="admin-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>
      <div className="grid-lines" />

      

      <div className="admin-wrapper">
        <Link to="/" className="admin-back-link">← Return to Public Website</Link>

        <div className={`admin-card card tilt-card${shake ? ' shake' : ''}`}>
          <div className="admin-accent-line" />

          

          <h1 className="admin-title">ADMIN PORTAL</h1>
          <div className="admin-form">

            <div className="form-group">
              <label className="form-label" htmlFor="adminEmail">Email</label>
              <div className="input-wrap">
                
                <input
                  type="email"
                  id="adminEmail"
                  
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(false); }}
                  onKeyDown={handleKey}
                />
              </div>
              {emailError && <div className="input-error show">Please enter a valid email.</div>}
            </div>

            
            <div className="form-group">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label className="form-label" htmlFor="adminPass">Password</label>
              
              </div>
              <div className="input-wrap">
                
                <input
                  type={showPw ? 'text' : 'password'}
                  id="adminPass"
                  
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPassError(false); }}
                  onKeyDown={handleKey}
                />
                <button className="pw-toggle" type="button" onClick={() => setShowPw(v => !v)}>
                  {showPw ? '👀' : '👁'}
                </button>
              </div>
              {passError && <div className="input-error show">Password must be at least 6 characters.</div>}
            </div>

            

            
            <button
              className={`btn btn-primary login-btn${loginState === 'loading' ? ' loading' : ''}`}
              onClick={attemptLogin}
              disabled={loginState === 'loading'}
            >
              {loginState === 'loading' ? ' Authenticating…' : ' LogIn'}
            </button>

            {feedback.msg && (
              <div className={`login-feedback ${feedback.cls}`}>{feedback.msg}</div>
            )}

            

          </div>
        </div>
      </div>
    </>
  );
}