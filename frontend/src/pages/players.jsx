import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

import '../assets/css/players.css';
import useScrollReveal      from '../hooks/useScrollReveal';
import useCounterAnimation  from '../hooks/useCounterAnimation';
import useTilt              from '../hooks/useTilt';
import usePageLoader        from '../hooks/usePageLoader';

/* ── Data ────────────────────────────────────────────────── */
const TIME_FILTERS = ['Today', 'This Month', 'This Season', 'All Time'];

const TOP_SCORERS = [
  { rank: 'gold',   initials: 'MS', name: "Marcus 'Lightning' Silva", sub: 'LEADING 1', count: 12, label: 'GOALS'  },
  { rank: 'silver', initials: 'DB', name: 'David Beckham-Jr',          sub: 'RANK 2',    count: 9,  label: 'GOALS'  },
  { rank: 'bronze', initials: 'JA', name: 'Julian Alvarez',            sub: 'RANK 3',    count: 7,  label: 'GOALS'  },
];

const MOTM_LIST = [
  { rank: 'gold',   initials: 'AG', name: 'Alex Grealish',             sub: 'LEADING 1', count: 5,  label: 'AWARDS' },
  { rank: 'silver', initials: 'VT', name: 'Virgil Van Thunder',        sub: 'RANK 2',    count: 4,  label: 'AWARDS' },
  { rank: 'bronze', initials: 'MS', name: "Marcus 'Lightning' Silva",  sub: 'RANK 3',    count: 3,  label: 'AWARDS' },
];

const PLAYERS = [
  {
    initials: 'PC', position: 'GOALKEEPER', name: "Petr 'Wall' Cech", number: '#01',
    tag: 'Captain', tagCls: '',
    bg: 'linear-gradient(135deg,rgba(92,26,138,0.3),rgba(201,152,10,0.1))',
    avatarCls: '', delay: 0,
    stats: [{ count: 15, label: 'APP' }, { count: 8, label: 'CS' }, { count: null, label: 'AST' }],
  },
  {
    initials: 'VT', position: 'DEFENDER', name: 'Virgil Van Thunder', number: '#04',
    tag: 'Vice-Captain', tagCls: '',
    bg: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(92,26,138,0.15))',
    avatarCls: '', delay: 80,
    stats: [{ count: 14, label: 'APP' }, { count: 2, label: 'GLS' }, { count: 0, label: 'AST' }],
  },
  {
    initials: 'KW', position: 'DEFENDER', name: 'Kyle Walker', number: '#02',
    tag: null, tagCls: '',
    bg: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(92,26,138,0.15))',
    avatarCls: '', delay: 160,
    stats: [{ count: 12, label: 'APP' }, { count: 0, label: 'GLS' }, { count: 0, label: 'AST' }],
  },
  {
    initials: 'AG', position: 'MIDFIELDER', name: 'Alex Grealish', number: '#08',
    tag: 'Playmaker', tagCls: '',
    bg: 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(201,152,10,0.1))',
    avatarCls: '', delay: 240,
    stats: [{ count: 15, label: 'APP' }, { count: 5, label: 'GLS' }, { count: 11, label: 'AST' }],
  },
  {
    initials: 'MS', position: 'FORWARD', name: "Marcus 'Lightning' Silva", number: '#10',
    tag: 'Golden Boot', tagCls: 'gold-tag', featured: true,
    bg: 'linear-gradient(135deg,rgba(201,152,10,0.2),rgba(92,26,138,0.2))',
    avatarCls: 'gold', delay: 320,
    stats: [{ count: 14, label: 'APP' }, { count: 22, label: 'GLS' }, { count: 4, label: 'AST' }],
  },
  {
    initials: 'DB', position: 'MIDFIELDER', name: 'David Beckham-Jr', number: '#07',
    tag: 'Set-Piece Specialist', tagCls: '',
    bg: 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(92,26,138,0.1))',
    avatarCls: '', delay: 400,
    stats: [{ count: 13, label: 'APP' }, { count: 4, label: 'GLS' }, { count: 9, label: 'AST' }],
  },
  {
    initials: 'MH', position: 'FORWARD', name: 'Mohamed Salah', number: '#11',
    tag: null, tagCls: '',
    bg: 'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(201,152,10,0.08))',
    avatarCls: '', delay: 480,
    stats: [{ count: 10, label: 'APP' }, { count: 8, label: 'GLS' }, { count: 2, label: 'AST' }],
  },
  {
    initials: 'JS', position: 'DEFENDER', name: 'John Stones', number: '#05',
    tag: 'Rock', tagCls: '',
    bg: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(92,26,138,0.1))',
    avatarCls: '', delay: 560,
    stats: [{ count: 9, label: 'APP' }, { count: 1, label: 'GLS' }, { count: 0, label: 'AST' }],
  },
];

/* ── Float counter (for 3.2 Goals Per Game) ──────────────── */
const useFloatCounter = () => {
  useEffect(() => {
    const els = document.querySelectorAll('[data-count-float]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el     = e.target;
          const target = parseFloat(el.dataset.countFloat);
          const dur    = 1600;
          const start  = performance.now();
          const tick   = (now) => {
            const p    = Math.min((now - start) / dur, 1);
            const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
            el.textContent = (ease * target).toFixed(1);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target.toFixed(1);
          };
          requestAnimationFrame(tick);
          obs.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

/* ── Honours list ────────────────────────────────────────── */
const HonoursList = ({ items }) => (
  <div className="honours-list">
    {items.map(({ rank, initials, name, sub, count, label }) => (
      <div className={`honour-item rank-${rank}`} key={name}>
        <span className="h-rank">{items.indexOf(items.find(i => i.name === name)) + 1}</span>
        <div className="h-avatar">{initials}</div>
        <div className="h-info"><strong>{name}</strong><span>{sub}</span></div>
        <div className="h-stat"><span data-count={count}>0</span><small>{label}</small></div>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   PLAYERS COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Players() {
  usePageLoader();
  useScrollReveal();
  useCounterAnimation();
  useTilt();
  useFloatCounter();

  const [activeFilter, setActiveFilter] = useState('This Season');
  const [loadState,    setLoadState]    = useState('idle');

  const handleLoad = () => {
    setLoadState('loading');
    setTimeout(() => setLoadState('done'), 1000);
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
        <section className="section">

          {/* Honours Board Header */}
          <div className="honours-board" data-reveal>
            <div className="honours-header">
              <span className="section-eyebrow">Elite Performers</span>
              <h1 className="section-title">Honours <span>Board</span></h1>
              <p className="section-subtitle">
                Recognizing elite performers. Track top-tier statistics across the campaign.
              </p>
            </div>
            <div className="time-filter">
              {TIME_FILTERS.map((f) => (
                <button
                  key={f}
                  className={`tf-btn${activeFilter === f ? ' active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Honours Grid */}
          <div className="honours-grid">

            {/* Top Scorers */}
            <div className="honours-card card" data-reveal data-delay="0">
              <div className="honours-card-header">
                <span>🏆 TOP SCORERS</span>
                <a href="#" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.65rem' }}>
                  View Full Rankings →
                </a>
              </div>
              <HonoursList items={TOP_SCORERS} />
            </div>

            {/* MOTM */}
            <div className="honours-card card" data-reveal data-delay="120">
              <div className="honours-card-header">
                <span>⭐ MAN OF THE MATCH</span>
                <span className="badge badge-gold">Elite Performance</span>
              </div>
              <HonoursList items={MOTM_LIST} />
            </div>

          </div>

          <div className="divider" style={{ margin: '40px 0' }} />

          {/* Squad Profiles Header */}
          <div className="squad-profiles-header" data-reveal>
            <span className="section-eyebrow">Full Roster</span>
            <h2 className="section-title">Squad <span>Profiles</span></h2>
          </div>

          {/* Squad Grid */}
          <div className="squad-profiles-grid" id="squadProfilesGrid">
            {PLAYERS.map((p) => (
              <a
                key={p.initials + p.number}
                href="/player-profile"
                className={`player-card card tilt-card${p.featured ? ' featured' : ''}`}
                data-reveal
                data-delay={p.delay}
              >
                <div className="player-card-bg" style={{ background: p.bg }} />
                <div className={`player-avatar-frame${p.avatarCls ? ' ' + p.avatarCls : ''}`}>
                  {p.initials}
                </div>
                <span className="player-position">{p.position}</span>
                <h4>{p.name}</h4>
                <span className="player-number">{p.number}</span>
                {p.tag && (
                  <span className={`player-role-tag${p.tagCls ? ' ' + p.tagCls : ''}`}>{p.tag}</span>
                )}
                <div className="player-stats-row">
                  {p.stats.map(({ count, label }) => (
                    <div key={label}>
                      {count !== null
                        ? <span data-count={count}>0</span>
                        : <span>—</span>
                      }
                      <small>{label}</small>
                    </div>
                  ))}
                </div>
              </a>
            ))}
          </div>

          {/* Showing count */}
          <div
            style={{
              textAlign: 'center', marginTop: '14px',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              color: 'var(--text-muted)', letterSpacing: '0.12em',
            }}
            data-reveal
          >
            Showing 8 of 32 squad members
          </div>

          {/* Load More */}
          <div style={{ textAlign: 'center', marginTop: '16px' }} data-reveal>
            <button
              className="btn btn-primary"
              onClick={handleLoad}
              disabled={loadState === 'done'}
              style={{ opacity: loadState === 'done' ? 0.4 : 1 }}
            >
              {loadState === 'idle'    && 'Load More Players'}
              {loadState === 'loading' && 'Loading…'}
              {loadState === 'done'    && 'All 32 Players Loaded'}
            </button>
          </div>

          {/* Season Stats Strip */}
          <div className="season-stats-strip" data-reveal>
            <div className="season-stat">
              <span className="season-stat-icon">⚡</span>
              <span className="stat-number" data-count-float="3.2">0</span>
              <span className="stat-label">Goals Per Game Avg</span>
            </div>
            <div className="season-stat-div" />
            <div className="season-stat">
              <span className="season-stat-icon">🧤</span>
              <span className="stat-number" data-count="12">0</span>
              <span className="stat-label">Clean Sheets Overall</span>
            </div>
            <div className="season-stat-div" />
            <div className="season-stat">
              <span className="season-stat-icon">📈</span>
              <span className="stat-number" data-count="84">0</span>
              <small style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)' }}>%</small>
              <span className="stat-label">Season Win Rate</span>
            </div>
          </div>

        </section>
      </div>

      <Footer />
    </>
  );
}