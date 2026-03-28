import React from 'react';

const QUICK_LINKS = [
  { label: 'Match Schedule', href: '/matches' },
  { label: 'Our Squad',      href: '/players' },
  { label: 'Tournaments',    href: '/tournaments' },
  { label: 'About Club',     href: '/club' },
];

const SOCIAL = [
  { icon: '𝕏',  label: 'Twitter / X', href: '#' },
  { icon: '📸', label: 'Instagram',   href: '#' },
  { icon: '𝔽',  label: 'Facebook',    href: '#' },
];

const Footer = () => {
  return (
    <footer>
      <div className="footer-grid">

        {/* Brand */}
        <div className="footer-brand">
          <a href="/" className="nav-logo" style={{ marginBottom: '10px', display: 'inline-flex' }}>
            <div className="nav-logo-icon" style={{ width: '34px', height: '34px' }}>⚽</div>
            <span className="nav-logo-text">Golden Rock FC</span>
          </a>
          <p>Official website of Golden Rock FC. Excellence in football since 2008.</p>
          <div className="footer-social" style={{ marginTop: '16px' }}>
            {SOCIAL.map(({ icon, label, href }) => (
              <a key={label} href={href} className="social-btn" aria-label={label}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            {QUICK_LINKS.map(({ label, href }) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:info@goldenrockfc.com">✉ info@goldenrockfc.com</a></li>
            <li><a href="#">📍 Main Stadium Road</a></li>
            <li><span>Thunder City, TC 12345</span></li>
          </ul>
        </div>

        {/* Follow */}
        <div className="footer-col">
          <h4>Follow Us</h4>
          <div className="footer-social" style={{ marginTop: '4px' }}>
            {SOCIAL.map(({ icon, label, href }) => (
              <a key={label} href={href} className="social-btn" aria-label={label}>
                {icon}
              </a>
            ))}
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 Golden Rock FC. All rights reserved. Professional Football Management System.</p>
      </div>
    </footer>
  );
};

export default Footer;