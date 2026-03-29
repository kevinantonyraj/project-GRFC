import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../assets/css/global.css';
import '../assets/css/tournaments.css';
import useScrollReveal     from '../hooks/useScrollReveal';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useTilt             from '../hooks/useTilt';
import usePageLoader       from '../hooks/usePageLoader';

/* ── Data ────────────────────────────────────────────────── */
const FILTERS = [
  { label: 'All',          value: 'all'      },
  { label: 'Champions',    value: 'champions' },
  { label: 'Runners Up',   value: 'runners'  },
  { label: 'Semi-Finals',  value: 'semis'    },
];

const TOURNAMENTS = [
  {
    id:      1,
    result:  'champions',
    badge:   { cls: 'badge-gold',   label: 'Champions'   },
    trophy:  true,
    barCls:  'champions-bar',
    title:   'Thunder Summer Cup 2023',
    dates:   '📅 Aug 2023 · 📍 Thunder City Stadium',
    stats:   [{ count: 16, label: 'Teams' }, { count: 6, label: 'Matches' }, { count: 14, label: 'Goals', gold: true }],
    squad:   ['Jo','Ch','Ok','Ro','Ev','Pe'],
    delay:   0,
  },
  {
    id:      2,
    result:  'runners',
    badge:   { cls: 'badge-draw',   label: 'Runners Up'  },
    trophy:  false,
    barCls:  'runners-bar',
    title:   'Regional Elite Invitational',
    dates:   '📅 Jul 2023 · 📍 Green Valley Sports Complex',
    stats:   [{ count: 8, label: 'Teams' }, { count: 4, label: 'Matches' }, { count: 9, label: 'Goals', gold: true }],
    squad:   ['Jo','Ch','Ok'],
    delay:   100,
  },
  {
    id:      3,
    result:  'champions',
    badge:   { cls: 'badge-gold',   label: 'Champions'   },
    trophy:  true,
    barCls:  'champions-bar',
    title:   'City Founders Trophy',
    dates:   '📅 Mar 12 – 15, 2023 · 📍 Old Town Arena',
    stats:   [{ count: 12, label: 'Teams' }, { count: 5, label: 'Matches' }, { count: 11, label: 'Goals', gold: true }],
    squad:   ['Jo','Ro','Pe'],
    delay:   200,
  },
  {
    id:      4,
    result:  'semis',
    badge:   { cls: 'badge-violet', label: 'Semi-Finals' },
    trophy:  false,
    barCls:  'semis-bar',
    title:   'Winter Futsal Masters',
    dates:   '📅 Jan 05 – 08, 2023 · 📍 Thunder Indoor Arena',
    stats:   [{ count: 24, label: 'Teams' }, { count: 7, label: 'Matches' }, { count: 22, label: 'Goals', gold: true }],
    squad:   ['Ch','Ok','Ev'],
    delay:   300,
  },
];

const PARTNERS = [
  { initials: 'SS', name: 'Shadow Strikers FC',  last: 'Nov 12, 2023', bg: '' },
  { initials: 'LU', name: 'Lightning United',    last: 'Oct 28, 2023', bg: 'linear-gradient(135deg,#1a2a4a,#0a3a6a)' },
  { initials: 'OB', name: 'Oceanic Blue',        last: 'Sep 15, 2023', bg: 'linear-gradient(135deg,#0a1a3a,#1a2a5a)' },
  { initials: 'RP', name: 'Red Peak Warriors',   last: 'Aug 02, 2023', bg: 'linear-gradient(135deg,#3a0a0a,#6a1a1a)' },
  { initials: 'GG', name: 'Golden Gate Rovers',  last: 'Jul 19, 2023', bg: 'linear-gradient(135deg,#0a3a0a,#1a5a1a)' },
  { initials: 'IC', name: 'Iron City FC',        last: 'Jun 24, 2023', bg: 'linear-gradient(135deg,#1a1a3a,#2a2a5a)' },
];

/* ═══════════════════════════════════════════════════════════
   TOURNAMENTS COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Tournaments() {
  usePageLoader();
  useScrollReveal();
  useCounterAnimation();
  useTilt();

  const [activeFilter, setActiveFilter] = useState('all');

  const isHidden = (card) => {
    if (activeFilter === 'all') return false;
    return !card.result.includes(activeFilter.split(' ')[0]);
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

      <Navbar />

      <div className="page-wrapper">

        {/* ── Tournament Hero Banner ──────────────────────── */}
        <div className="tournament-hero-banner">
          <div className="tournament-hero-content">
            <div data-reveal>
              <span className="section-eyebrow">Our Legacy</span>
              <h1 className="section-title">Tournament <span>History</span></h1>
              <p className="section-subtitle">
                Celebrating our legacy on the pitch. From local cups to regional titles,
                every match is a chapter in the Golden Rock story.
              </p>
            </div>
            <div className="titles-badge tilt-card" data-reveal data-delay="150">
              <span className="titles-icon">🏆</span>
              <span className="titles-count" data-count="12">0</span>
              <span className="titles-label">Titles Won</span>
            </div>
          </div>
        </div>

        <section className="section">

          {/* ── Filter Bar ─────────────────────────────────── */}
          <div className="tour-filter-bar" data-reveal>
            {FILTERS.map(({ label, value }) => (
              <button
                key={value}
                className={`tf2-btn${activeFilter === value ? ' active' : ''}`}
                onClick={() => setActiveFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Past Campaigns Header ──────────────────────── */}
          <div className="past-campaigns-header" data-reveal>
            <span className="section-eyebrow">Archive</span>
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>
              Past <span>Campaigns</span>
            </h2>
            <div className="campaign-sort">
              <select style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--ivory)', padding: '6px 12px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', cursor: 'pointer' }}>
                <option>Filter by Year</option>
                <option>2023</option>
                <option>2022</option>
                <option>2021</option>
              </select>
              <select style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--ivory)', padding: '6px 12px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', cursor: 'pointer' }}>
                <option>Sort by Result</option>
                <option>Champions</option>
                <option>Runners Up</option>
              </select>
            </div>
          </div>

          {/* ── Tournament Cards Grid ──────────────────────── */}
          <div className="tournament-cards-grid" id="tourGrid">
            {TOURNAMENTS.map((t) => (
              <div
                key={t.id}
                className="tournament-card card tilt-card"
                data-result={t.result}
                data-reveal
                data-delay={t.delay}
                style={{ display: isHidden(t) ? 'none' : '' }}
              >
                <div className={`tc-status-bar ${t.barCls}`} />
                <div className="tc-header">
                  <span className={`badge ${t.badge.cls}`}>{t.badge.label}</span>
                  {t.trophy && <span className="tc-trophy">🏆</span>}
                </div>
                <h3 className="tc-title">{t.title}</h3>
                <div className="tc-dates">{t.dates}</div>
                <div className="tc-stats">
                  {t.stats.map(({ count, label, gold }) => (
                    <div key={label}>
                      <span data-count={count}>0</span>
                      <small className={gold ? 'gold-text' : ''}>{label}</small>
                    </div>
                  ))}
                </div>
                <div className="tc-squad">
                  <span className="tc-squad-label">Tournament Squad</span>
                  <div className="tc-squad-avatars">
                    {t.squad.map((initials, i) => (
                      <div className="tsa" key={i}>{initials}</div>
                    ))}
                  </div>
                </div>
                <a
                  href="#"
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
                >
                  View Tournament Details →
                </a>
              </div>
            ))}
          </div>

          {/* ── Load More ──────────────────────────────────── */}
          <div style={{ textAlign: 'center', margin: '40px 0' }} data-reveal>
            <button className="btn btn-outline">Load Full History</button>
          </div>

          <div className="divider" style={{ margin: '0 0 60px' }} />

          {/* ── Friendly Partners ──────────────────────────── */}
          <div data-reveal>
            <span className="section-eyebrow">Network</span>
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>
              Friendly <span>Partners</span>
            </h2>
            <p className="section-subtitle">
              Fellow clubs and friendly rivals we compete with outside of official tournaments.
            </p>
          </div>

          <div className="partners-grid" data-reveal data-delay="100">
            {PARTNERS.map(({ initials, name, last, bg }) => (
              <div className="partner-card card" key={name}>
                <div className="partner-badge" style={bg ? { background: bg } : {}}>
                  {initials}
                </div>
                <div>
                  <strong>{name}</strong>
                  <span>Last met: {last}</span>
                </div>
                <a
                  href="#"
                  className="btn btn-outline"
                  style={{ padding: '6px 14px', fontSize: '0.65rem', marginLeft: 'auto' }}
                >
                  View
                </a>
              </div>
            ))}
          </div>

        </section>
      </div>

      <Footer />
    </>
  );
}