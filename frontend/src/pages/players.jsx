import React, { useState, useEffect } from 'react';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../../../backend/api/api.js';
import '../assets/css/global.css';
import '../assets/css/players.css';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useTilt             from '../hooks/useTilt';
import usePageLoader       from '../hooks/usePageLoader';

const TIME_FILTERS = ['Today', 'This Month', 'This Season', 'All Time'];

/* ── Float counter ───────────────────────────────────────── */
const useFloatCounter = () => {
  useEffect(() => {
    const els = document.querySelectorAll('[data-count-float]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = parseFloat(el.dataset.countFloat);
        const dur = 1600, start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / dur, 1);
          const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
          el.textContent = (ease * target).toFixed(1);
          if (p < 1) requestAnimationFrame(tick); else el.textContent = target.toFixed(1);
        };
        requestAnimationFrame(tick);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

/* ── Repeating Scroll Reveal ─────────────────────────────── */
const useRepeatScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => entry.target.classList.add('revealed'), Number(delay));
          } else {
            entry.target.classList.remove('revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

/* ── Skeleton ────────────────────────────────────────────── */
const Skeleton = ({ width = '100%', height = '20px', style = {} }) => (
  <div style={{
    width, height, borderRadius: '6px',
    background: 'linear-gradient(90deg,var(--bg-card) 25%,rgba(255,255,255,0.05) 50%,var(--bg-card) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...style,
  }} />
);

/* ── Honours List ────────────────────────────────────────── */
const HonoursList = ({ items, statKey, statLabel, loading }) => (
  <div className="honours-list">
    {loading ? (
      [1,2,3].map(i => (
        <div key={i} style={{ padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Skeleton height="32px" width="32px" style={{ borderRadius: '50%' }} />
          <Skeleton height="14px" width="55%" />
          <Skeleton height="20px" width="30px" style={{ marginLeft: 'auto' }} />
        </div>
      ))
    ) : items.length > 0 ? (
      items.slice(0, 3).map((item, idx) => (
        <div key={item.id} className={`honour-item rank-${['gold','silver','bronze'][idx]}`}>
          <span className="h-rank">{idx + 1}</span>
          <div className="h-avatar">{item.initials}</div>
          <div className="h-info">
            <strong>{item.name}</strong>
            <span>{idx === 0 ? 'LEADING 1' : `RANK ${idx + 1}`}</span>
          </div>
          <div className="h-stat">
            <span data-count={item[statKey]}>0</span>
            <small>{statLabel}</small>
          </div>
        </div>
      ))
    ) : (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        No data yet.
      </div>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   PLAYERS COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Players() {
  usePageLoader();
  useRepeatScrollReveal();
  useCounterAnimation();
  useFloatCounter();
  useTilt();

  /* ── API state ─────────────────────────────────────────── */
  const [players,  setPlayers]  = useState([]);
  const [honours,  setHonours]  = useState({ top_scorers: [], top_assists: [], top_motm: [] });
  const [snapshot, setSnapshot] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [p, h, s] = await Promise.all([
          api.players(),
          api.honours(),
          api.snapshot(),
        ]);
        setPlayers(p);
        setHonours(h);
        setSnapshot(s);
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* ── UI state ──────────────────────────────────────────── */
  const [activeFilter, setActiveFilter] = useState('This Season');
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadState,    setLoadState]    = useState('idle');

  const handleLoad = () => {
    setLoadState('loading');
    setTimeout(() => { setVisibleCount(players.length); setLoadState('done'); }, 1000);
  };

  const visiblePlayers = players.slice(0, visibleCount);
  const goalsPerGame   = snapshot
    ? (snapshot.total_goals / (snapshot.total_matches || 1)).toFixed(1)
    : '0.0';

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="page-loader" id="loader">
        <div className="loader-logo">GOLDEN ROCK FC</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>
      <div className="bg-mesh" /><div className="bg-grain" />

      <Navbar />

      <div className="page-wrapper">
        <section className="section">

          {/* Honours Board */}
          <div className="honours-board" data-reveal>
            <div className="honours-header">
              <span className="section-eyebrow">Elite Performers</span>
              <h1 className="section-title">Honours <span>Board</span></h1>
              <p className="section-subtitle">Recognizing elite performers across the campaign.</p>
            </div>
            <div className="time-filter">
              {TIME_FILTERS.map(f => (
                <button key={f} className={`tf-btn${activeFilter === f ? ' active' : ''}`} onClick={() => setActiveFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: '#f87171', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '12px' }}>
              ⚠ {error}
            </p>
          )}

          {/* Honours Grid */}
          <div className="honours-grid">
            <div className="honours-card card" data-reveal data-delay="0">
              <div className="honours-card-header">
                <span>🏆 TOP SCORERS</span>
                <a href="#" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.65rem' }}>
                  View Full Rankings →
                </a>
              </div>
              <HonoursList items={honours.top_scorers} statKey="total_goals" statLabel="GOALS" loading={loading} />
            </div>

            <div className="honours-card card" data-reveal data-delay="120">
              <div className="honours-card-header">
                <span>⭐ MAN OF THE MATCH</span>
                <span className="badge badge-gold">Elite Performance</span>
              </div>
              <HonoursList items={honours.top_motm} statKey="total_motm" statLabel="AWARDS" loading={loading} />
            </div>
          </div>

          <div className="divider" style={{ margin: '40px 0' }} />

          {/* Squad Profiles */}
          <div className="squad-profiles-header" data-reveal>
            <span className="section-eyebrow">Full Roster</span>
            <h2 className="section-title">Squad <span>Profiles</span></h2>
          </div>

          <div className="squad-profiles-grid">
            {loading ? (
              [1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="player-card card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Skeleton height="60px" width="60px" style={{ borderRadius: '50%', margin: '0 auto' }} />
                  <Skeleton height="12px" width="50%" style={{ margin: '0 auto' }} />
                  <Skeleton height="16px" width="70%" style={{ margin: '0 auto' }} />
                  <Skeleton height="12px" width="30%" style={{ margin: '0 auto' }} />
                </div>
              ))
            ) : visiblePlayers.length > 0 ? (
              visiblePlayers.map((p, idx) => (
                <a
                  key={p.id}
                  href={`/player-profile/${p.id}`}
                  className={`player-card card tilt-card${p.is_featured ? ' featured' : ''}`}
                  data-reveal
                  data-delay={idx * 80}
                >
                  <div
                    className="player-card-bg"
                    style={{ background: p.avatar_bg || 'linear-gradient(135deg,rgba(92,26,138,0.2),rgba(201,152,10,0.1))' }}
                  />
                  <div className={`player-avatar-frame${p.is_featured ? ' gold' : ''}`}>{p.initials}</div>
                  <span className="player-position">{p.position}</span>
                  <h4>{p.name}</h4>
                  <span className="player-number">#{p.number}</span>
                  {p.role_tag && (
                    <span className={`player-role-tag${p.is_featured ? ' gold-tag' : ''}`}>{p.role_tag}</span>
                  )}
                  <div className="player-stats-row">
                    <div><span data-count={p.total_appearances || 0}>0</span><small>APP</small></div>
                    <div><span data-count={p.total_goals       || 0}>0</span><small>GLS</small></div>
                    <div><span data-count={p.total_assists     || 0}>0</span><small>AST</small></div>
                  </div>
                </a>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                No players found. Add players via the admin panel.
              </div>
            )}
          </div>

          {/* Count + Load More */}
          {!loading && players.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.12em' }} data-reveal>
              Showing {Math.min(visibleCount, players.length)} of {players.length} squad members
            </div>
          )}

          {!loading && visibleCount < players.length && (
            <div style={{ textAlign: 'center', marginTop: '16px' }} data-reveal>
              <button
                className="btn btn-primary"
                onClick={handleLoad}
                disabled={loadState === 'loading'}
                style={{ opacity: loadState === 'done' ? 0.4 : 1 }}
              >
                {loadState === 'idle'    && 'Load More Players'}
                {loadState === 'loading' && 'Loading…'}
                {loadState === 'done'    && 'All Players Loaded'}
              </button>
            </div>
          )}

          {/* Season Stats Strip */}
          <div className="season-stats-strip" data-reveal>
            <div className="season-stat">
              <span className="season-stat-icon">⚡</span>
              <span className="stat-number" data-count-float={goalsPerGame}>0</span>
              <span className="stat-label">Goals Per Game Avg</span>
            </div>
            <div className="season-stat-div" />
            <div className="season-stat">
              <span className="season-stat-icon">🧤</span>
              <span className="stat-number" data-count={snapshot?.clean_sheets || 0}>0</span>
              <span className="stat-label">Clean Sheets Overall</span>
            </div>
            <div className="season-stat-div" />
            <div className="season-stat">
              <span className="season-stat-icon">📈</span>
              <span className="stat-number" data-count={snapshot?.win_rate || 0}>0</span>
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