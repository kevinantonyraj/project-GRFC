import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

import '../assets/css/club.css';
import useScrollReveal     from '../hooks/useScrollReveal';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useTilt             from '../hooks/useTilt';
import usePageLoader       from '../hooks/usePageLoader';

/* ── Data ────────────────────────────────────────────────── */
const TRAINING = [
  { day: 'Monday',    desc: 'Tactical & Strategy',       time: '18:00 – 20:00' },
  { day: 'Wednesday', desc: 'Physical Conditioning',     time: '17:30 – 19:30' },
  { day: 'Friday',    desc: 'Set Pieces & Drills',       time: '18:00 – 20:00' },
];

const IDENTITY = [
  { icon: '🕰️', label: 'Established', value: 'August 2008 (16 Years)' },
  { icon: '📍', label: 'Home Ground', value: 'The Electric Arena, Thunder City' },
  { icon: '⭐', label: 'Motto',       value: '"Fortis in Victoria, Unitas in Corde"', sub: '(Strength in Victory, Unity in Heart)' },
];

const ASSETS = [
  { icon: '⚽', count: 18,  label: 'Match Balls'     },
  { icon: '🥅', count: 4,   label: 'Training Nets'   },
  { icon: '🔶', count: 120, label: 'Cones & Markers'  },
  { icon: '🩺', count: 3,   label: 'First Aid Kits'  },
];

const STAFF = [
  {
    initials: 'JA', name: 'John Archer',     role: 'Club Captain',      joined: 'Jan 2012',
    bio: 'Leading the team with 12 years of service at Golden Rock FC.',
    badgeCls: 'badge-gold',   badgeStyle: {},
    avatarStyle: {},
  },
  {
    initials: 'SJ', name: 'Sarah Jenkins',   role: 'Treasurer',         joined: 'Mar 2015',
    bio: 'Managing club finances and budget planning since 2015.',
    badgeCls: 'badge-draw',   badgeStyle: {},
    avatarStyle: { background: 'linear-gradient(135deg,#6a1a1a,#9a2a2a)' },
  },
  {
    initials: 'DW', name: 'David Wu',        role: 'Club Secretary',    joined: 'Jun 2018',
    bio: 'Handles all administrative duties and official correspondence.',
    badgeCls: 'badge-violet', badgeStyle: {},
    avatarStyle: { background: 'linear-gradient(135deg,#1a2a4a,#2a3a6a)' },
  },
  {
    initials: 'MV', name: 'Michael Vance',   role: 'Youth Coordinator', joined: 'Nov 2019',
    bio: 'Manages youth academy development and player pathways.',
    badgeCls: '',
    badgeStyle: { background: 'rgba(34,197,94,0.1)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' },
    avatarStyle: { background: 'linear-gradient(135deg,#0a2a1a,#1a4a2a)' },
  },
  {
    initials: 'ER', name: 'Elena Rodriguez', role: 'Medic',             joined: 'Feb 2021',
    bio: 'Certified sports physiotherapist keeping players match-ready.',
    badgeCls: '',
    badgeStyle: { background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' },
    avatarStyle: { background: 'linear-gradient(135deg,#3a0a2a,#6a1a4a)' },
  },
];

/* ── Staff Modal ─────────────────────────────────────────── */
const StaffModal = ({ member, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 9990,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="staff-modal-card card"
        style={{ maxWidth: '400px', width: '90%', padding: '32px', textAlign: 'center', position: 'relative' }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          ✕
        </button>
        <div
          className="staff-avatar"
          style={{ width: '72px', height: '72px', fontSize: '1.4rem', margin: '0 auto 16px' }}
        >
          {member.initials}
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--ivory)', marginBottom: '4px' }}>
          {member.name}
        </h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '8px' }}>
          {member.role}
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Joined: {member.joined}
        </p>
        <p style={{ fontSize: '0.92rem', color: 'var(--ivory-d)', lineHeight: 1.7, fontStyle: 'italic' }}>
          {member.bio}
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   CLUB COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Club() {
  usePageLoader();
  useScrollReveal();
  useCounterAnimation();
  useTilt();

  const [modalMember, setModalMember] = useState(null);

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

      <Navbar />

      {/* Staff Modal */}
      {modalMember && (
        <StaffModal member={modalMember} onClose={() => setModalMember(null)} />
      )}

      <div className="page-wrapper">
        <section className="section">

          {/* ── Club Header ──────────────────────────────── */}
          <div className="club-header" data-reveal>
            <span className="section-eyebrow">Inside the Club</span>
            <h1 className="section-title">Club <span>Operations</span></h1>
            <p className="section-subtitle">
              Inside look at Golden Rock FC's leadership, infrastructure, and the passionate
              team that drives our success on and off the pitch.
            </p>
          </div>

          {/* ── Leadership Grid ───────────────────────────── */}
          <div className="leadership-grid">

            {/* Coach Card */}
            <div className="coach-card card tilt-card" data-reveal data-delay="0">
              <div className="coach-image-frame">
                <div className="coach-avatar">MC</div>
                <div className="coach-name-overlay">
                  <strong>Marcus Sterling</strong>
                  <span>Head Coach</span>
                </div>
              </div>
              <div className="coach-info">
                <h3>Leadership &amp; Experience</h3>
                <p>
                  Coach Sterling brings 15+ years of professional coaching experience,
                  including a UEFA 'A' License. He joined Golden Rock FC in 2018 and has
                  since led us to two regional championships.
                </p>
                <div className="training-schedule">
                  <h4>🗓️ Weekly Training Schedule</h4>
                  {TRAINING.map(({ day, desc, time }) => (
                    <div className="training-item" key={day}>
                      <div><strong>{day}</strong><span>{desc}</span></div>
                      <span className="training-time">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Club Identity */}
            <div className="club-identity card tilt-card" data-reveal data-delay="120">
              <h3>🔐 Club Identity</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Foundational details of Golden Rock FC
              </p>
              {IDENTITY.map(({ icon, label, value, sub }) => (
                <div className="identity-item" key={label}>
                  <span className="identity-icon">{icon}</span>
                  <div>
                    <strong>{label}</strong>
                    <span style={label === 'Motto' ? { fontStyle: 'italic' } : {}}>
                      {value}
                      {sub && <><br /><small style={{ fontSize: '0.78rem' }}>{sub}</small></>}
                    </span>
                  </div>
                </div>
              ))}
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }}
              >
                💬 Connect on WhatsApp
              </a>
            </div>

          </div>

          <div className="divider" style={{ margin: '40px 0' }} />

          {/* ── Assets & Logistics ───────────────────────── */}
          <div data-reveal>
            <span className="section-eyebrow">Infrastructure</span>
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>
              Club Assets <span>&amp; Logistics</span>
            </h2>
          </div>

          <div className="assets-grid" data-reveal data-delay="80">
            {ASSETS.map(({ icon, count, label }) => (
              <div className="asset-card stat-card tilt-card" key={label}>
                <span className="stat-icon">{icon}</span>
                <span className="stat-number" data-count={count}>0</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>

          <div className="divider" style={{ margin: '40px 0' }} />

          {/* ── Staff & Members ───────────────────────────── */}
          <div className="staff-section card" data-reveal>
            <div className="staff-header">
              <div>
                <h3>👥 Club Staff &amp; Members</h3>
                <p>Dedicated individuals managing the pride of Thunder City</p>
              </div>
              <a href="#" className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.7rem' }}>
                View All Members
              </a>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Designation</th>
                  <th>Joined Since</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {STAFF.map((member) => (
                  <tr className="staff-row" key={member.name}>
                    <td>
                      <div className="staff-member">
                        <div className="staff-avatar" style={member.avatarStyle}>
                          {member.initials}
                        </div>
                        <span>{member.name}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge${member.badgeCls ? ' ' + member.badgeCls : ''}`}
                        style={member.badgeStyle}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td>{member.joined}</td>
                    <td>
                      <button
                        className="staff-detail-btn"
                        onClick={() => setModalMember(member)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>
      </div>

      <Footer />
    </>
  );
}