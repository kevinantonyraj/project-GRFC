import React, { useState, useEffect } from 'react';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../../../backend/api/api.js';
import '../assets/css/global.css';
import '../assets/css/matches.css';
import useTilt       from '../hooks/useTilt';
import usePageLoader from '../hooks/usePageLoader';

/* ── Filter options ──────────────────────────────────────── */
const FILTERS = [
  { label: 'All',        value: 'all'  },
  { label: 'Wins',       value: 'win'  },
  { label: 'Draws',      value: 'draw' },
  { label: 'Losses',     value: 'loss' },
];

const BADGE = {
  win:  { cls: 'badge-win',  label: '⊙ WIN'  },
  draw: { cls: 'badge-draw', label: '⊖ DRAW' },
  loss: { cls: 'badge-loss', label: '⊗ LOSS' },
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

/* ── Single Match Row ────────────────────────────────────── */
const MatchRow = ({ match, index }) => {
  const [open, setOpen] = useState(false);
  const badge = BADGE[match.result] || BADGE.draw;

  return (
    <div
      className="match-row card"
      data-result={match.result}
      data-reveal
      data-delay={index * 80}
    >
      {/* Main row */}
      <div className="match-row-main">
        <div className="match-team away-side">
          <div
            className="team-badge away-badge"
            style={match.home_team_badge ? { background: match.home_team_badge } : {}}
          >
            {match.home_team_code}
          </div>
          <div>
            <div className="team-placement">
              {match.match_type === 'internal' ? 'TEAM A' : 'AWAY'}
            </div>
            <strong>{match.home_team_name}</strong>
          </div>
        </div>

        <div className="match-row-center">
          <span className="competition-tag">{match.competition}</span>
          <div className="match-row-score">
            <span className="rs-away">{match.home_score}</span>
            <span className="rs-colon">:</span>
            <span className="rs-home">{match.away_score}</span>
          </div>
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
        </div>

        <div className="match-team home-side">
          <div
            className="team-badge home-badge"
            style={match.away_team_badge ? { background: match.away_team_badge } : {}}
          >
            {match.away_team_code}
          </div>
          <div>
            <div className="team-placement">
              {match.match_type === 'internal' ? 'TEAM B' : 'HOME'}
            </div>
            <strong>{match.away_team_name}</strong>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="match-row-footer">
        <span>
          📅 {new Date(match.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
          {' · '}
          {new Date(match.date).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
        </span>
        <span>📍 {match.venue}</span>
        <button className="match-expand-btn" onClick={() => setOpen(o => !o)}>
          {open ? 'HIDE DETAILS ▴' : 'VIEW SQUAD & SCORERS ▾'}
        </button>
      </div>

      {/* Expandable panel */}
      <div className={`match-detail-panel${open ? ' open' : ''}`}>
        <div className="detail-scorers">
          {match.goals?.filter(g => !g.is_own_goal).length > 0 ? (
            <>
              <strong>Scorers</strong>
              {match.goals.filter(g => !g.is_own_goal).map((g, i) => (
                <div className="goal-item" key={i}>
                  <span>{g.player_name}</span>
                  <span className="goal-min">{g.minute}'</span>
                </div>
              ))}
            </>
          ) : (
            <strong>No goals scored</strong>
          )}
        </div>

        {match.appearances?.length > 0 && (
          <div className="detail-squad">
            <strong>Squad</strong>
            <div className="mini-squad-tags">
              {match.appearances.map((a, i) => (
                <span
                  key={i}
                  className={`squad-tag ${
                    a.player_position === 'GK'  ? 'gk'  :
                    a.player_position === 'DEF' ? 'def' :
                    a.player_position === 'MID' ? 'mid' : 'fwd'
                  }`}
                >
                  {a.player_name} {a.player_position}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MATCHES COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Matches() {
  usePageLoader();
  useRepeatScrollReveal();
  useTilt();

  /* ── API state ─────────────────────────────────────────── */
  const [matches,      setMatches]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loadState,    setLoadState]    = useState('idle');

  /* ── Fetch on filter change ────────────────────────────── */
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.matches(activeFilter);
        setMatches(data);
      } catch (err) {
        setError('Failed to load matches.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [activeFilter]);

  const handleLoadMore = () => {
    setLoadState('loading');
    setTimeout(() => setLoadState('done'), 1200);
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
      <div className="bg-mesh" /><div className="bg-grain" />

      <Navbar />

      <div className="page-wrapper">
        <section className="section">

          {/* Page Header */}
          <div className="page-hero" data-reveal>
            <span className="section-eyebrow">Complete Record</span>
            <h1 className="section-title">Match <span>History</span></h1>
            <p className="section-subtitle">
              Track our latest results, scorers, and seasonal performance across all competitions.
            </p>
          </div>

          {/* Filters */}
          <div className="filter-bar" data-reveal data-delay="100">
            <span className="filter-label">🔧 FILTERS:</span>
            {FILTERS.map(({ label, value }) => (
              <button
                key={value}
                className={`filter-btn${activeFilter === value ? ' active' : ''}`}
                onClick={() => setActiveFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <p style={{ color: '#f87171', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '12px' }}>
              ⚠ {error}
            </p>
          )}

          {/* Match List */}
          <div className="match-list">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="card" style={{ padding: '20px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Skeleton height="16px" width="40%" />
                  <Skeleton height="60px" />
                  <Skeleton height="14px" width="60%" />
                </div>
              ))
            ) : matches.length > 0 ? (
              matches.map((match, idx) => (
                <MatchRow key={match.id} match={match} index={idx} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                No matches found.
              </div>
            )}
          </div>

          {/* Load More */}
          <div style={{ textAlign: 'center', marginTop: '40px' }} data-reveal>
            <button
              className="btn btn-outline"
              onClick={handleLoadMore}
              disabled={loadState === 'done'}
              style={{ opacity: loadState === 'done' ? 0.4 : 1 }}
            >
              {loadState === 'idle'    && 'Load Previous Season'}
              {loadState === 'loading' && 'Loading…'}
              {loadState === 'done'    && 'No More Records'}
            </button>
          </div>

        </section>
      </div>

      <Footer />
    </>
  );
}