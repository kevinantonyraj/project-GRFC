import React from 'react';
import logoIcon from '../assets/icons/grfc_icon.png'; 
import whatsappIcon from '../assets/icons/whatsapp.avif';
import instaIcon from '../assets/icons/insta.jpg';

const QUICK_LINKS = [
  { label: 'Match Schedule', href: '/matches' },
  { label: 'Our Squad',      href: '/players' },
  { label: 'Tournaments',    href: '/tournaments' },
  { label: 'About Club',     href: '/club' },
];

const SOCIAL = [
  { icon: whatsappIcon,  label: 'whatsapp', href: '#' },
  { icon: instaIcon, label: 'Instagram',   href: '#' },
  
];

const Footer = () => {
  return (
    <footer>
      <div className="footer-grid">

        {/* Brand */}
        <div className="footer-brand">
          <a href="/" className="nav-logo" style={{ marginBottom: '10px', display: 'inline-flex' }}>
            <img src={logoIcon} width="50" height="50" alt="Football" />
            <span className="nav-logo-text">Golden Rock FC</span>
          </a>
          <p>Official website of Golden Rock FC. Excellence in football since 2023.</p>
          
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
            <li><a href="#"> Railway Ground, Ponmalai</a></li>
            <li><span>Trichy city</span></li>
          </ul>
        </div>

        {/* Follow */}
        <div className="footer-col">
          <h4>Follow Us</h4>
          <div className="footer-social" style={{ marginTop: '4px' }}>
            {SOCIAL.map((item) => (
  <a href={item.href} key={item.label}>
    <img src={item.icon} alt={item.label} width="24" height="24" />
    {item.label}
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