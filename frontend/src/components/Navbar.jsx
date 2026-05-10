import React, { useState, useEffect } from 'react';
import logoIcon from '../assets/icons/grfc_icon.png'; 
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Daily',       href: '/daily' },
  { label: 'Matches',     href: '/matches' },
  { label: 'Players',     href: '/players' },
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'Club',        href: '/club' },
];

const Navbar = () => {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState('');

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* close on Escape */
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setMobileOpen(false); }
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  const activePath = window.location.pathname;
  const isActive   = (href) => href === '/' ? activePath === '/' : activePath.startsWith(href);

  return (
    <>
      {/* Search overlay */}
      {searchOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: '16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <button
            onClick={() => setSearchOpen(false)}
            style={{
              position: 'absolute', top: '24px', right: '32px',
              background: 'none', border: 'none',
              color: 'var(--ivory)', fontSize: '1.5rem', cursor: 'pointer',
            }}
          >
            ✕
          </button>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase',
          }}>
            Search Golden Rock FC
          </p>
          <input
            autoFocus
            type="text"
            placeholder="Players, matches, tournaments…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              maxWidth: '520px', width: '90%',
              fontSize: '1.2rem', textAlign: 'center',
              background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
              padding: '12px 20px', borderRadius: '8px', color: 'var(--ivory)',
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Navbar */}
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="nav-logo">
          <img src={logoIcon} width="60" height="50" alt="Football" />
          <span className="nav-logo-text">Golden Rock FC</span>
        </Link>

        <ul className="nav-links">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link to={href} className={isActive(href) ? 'active' : ''}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <Link to="/admin" className="btn-admin">Admin</Link>
          <button
            className="hamburger"
            aria-label="Menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(4px, 4.5px)' : '' }} />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4.5px)' : '' }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className="mobile-menu" style={{ display: mobileOpen ? 'flex' : 'none' }}>
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            to ={href}
            className={isActive(href) ? 'active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </Link>
        ))}
        <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin Portal</Link>
      </div>
    </>
  );
};

export default Navbar;