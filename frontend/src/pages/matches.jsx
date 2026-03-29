import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

import '../assets/css/matches.css';
import useScrollReveal from '../hooks/useScrollReveal';
import useTilt         from '../hooks/useTilt';
import usePageLoader   from '../hooks/usePageLoader';

/* ── Match Data ──────────────────────────────────────────── */
const MATCHES = [
  {
    id:          1,
    result:      'win',
    competition: { label: 'Premier League', cls: '' },
    teamA:       { code: 'RS', name: 'Royal Strikers',  side: 'AWAY', style: {} },
    teamB:       { code: 'GR', name: 'Golden Rock FC',  side: 'HOME', style: {} },
    scoreA:      3,
    scoreB:      1,
    date:        'Oct 24, 2023 · 19:00',
    venue:       'Thunder Arena',
    scorers:     [
      { name: 'Marcus Silva',  min: "23'" },
      { name: 'Jordan Webb',   min: "67'" },
      { name: 'Marcus Silva',  min: "89'" },
    ],
    squad: [
      { name: 'Sterling',   role: 'GK',  cls: 'gk'  },
      { name: 'Henderson',  role: 'DEF', cls: 'def' },
      { name: 'Walker',     role: 'DEF', cls: 'def' },
      { name: 'De Bruyne',  role: 'MID', cls: 'mid' },
      { name: 'Silva',      role: 'FWD', cls: 'fwd' },
      { name: 'Webb',       role: 'FWD', cls: 'fwd' },
    ],
    delay: 0,
  },
  {
    id:          2,
    result:      'draw',
    competition: { label: 'Premier League', cls: '' },
    teamA:       { code: 'IW', name: 'Iron Wall FC',   side: 'HOME', style: { background: 'linear-gradient(135deg,#1a2a4a,#2a3a6a)' } },
    teamB:       { code: 'GR', name: 'Golden Rock FC', side: 'AWAY', style: {} },
    scoreA:      0,
    scoreB:      0,
    date:        'Oct 18, 2023 · 20:30',
    venue:       'The Fortress',
    scorers:     [],
    squad:       [],
    delay:       80,
  },
  {
    id:          3,
    result:      'loss',
    competition: { label: 'Champions Cup', cls: 'champions' },
    teamA:       { code: 'TU', name: 'Titan United',   side: 'HOME', style: { background: 'linear-gradient(135deg,#2a1a3a,#4a2a6a)' } },
    teamB:       { code: 'GR', name: 'Golden Rock FC', side: 'AWAY', style: {} },
    scoreA:      2,
    scoreB:      1,
    date:        'Oct 12, 2023 · 18:45',
    venue:       'Titan Stadium',
    scorers:     [{ name: 'Leon Garet', min: "55'" }],
    squad:       [],
    delay:       160,
  },
  {
    id:          4,
    result:      'win',
    competition: { label: 'Premier League', cls: '' },
    teamA:       { code: 'SH', name: 'Sea Hawks',      side: 'AWAY', style: { background: 'linear-gradient(135deg,#0a2a1a,#1a4a2a)' } },
    teamB:       { code: 'GR', name: 'Golden Rock FC', side: 'HOME', style: {} },
    scoreA:      4,
    scoreB:      0,
    date:        'Oct 05, 2023 · 15:00',
    venue:       'Thunder Arena',
    scorers:     [
      { name: 'Marcus Silva', min: "12'" },
      { name: 'Jordan Webb',  min: "34'" },
      { name: 'Leon Garet',   min: "56'" },
      { name: 'Marcus Silva', min: "78'" },
    ],
    squad:       [],
    delay:       240,
  },
  {
    id:          5,
    result:      'draw',
    competition: { label: 'City Derby', cls: 'derby' },
    teamA:       { code: 'GL', name: 'Golden Lions',   side: 'HOME', style: { background: 'linear-gradient(135deg,#2a1a00,#4a3a00)' } },
    teamB:       { code: 'GR', name: 'Golden Rock FC', side: 'AWAY', style: {} },
    scoreA:      2,
    scoreB:      2,
    date:        'Sep 28, 2023 · 21:00',
    venue:       'Lions Den',
    scorers:     [
      { name: 'David Thorne', min: "22'" },
      { name: 'Jordan Webb',  min: "71'" },
    ],
    squad:       [],
    delay:       320,
  },
];

const FILTERS = [
  { label: 'All',         value: 'all'    },
  { label: 'Wins',        value: 'win'    },
  { label: 'Draws',       value: 'draw'   },
  { label: 'Losses',      value: 'loss'   },
  { label: 'This Month',  value: 'month'  },
  { label: 'This Season', value: 'season' },
];

const BADGE = {
  win:  { cls: 'badge-win',  label: '⊙ WIN'  },
  draw: { cls: 'badge-draw', label: '⊖ DRAW' },
  loss: { cls: 'badge-loss', label: '⊗ LOSS' },
};

/* ── Match Row ───────────────────────────────────────────── */
const MatchRow = ({ match, hidden }) => {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((o) => !o);

  const badge = BADGE[match.result];

  return (
    <div
      className={`match-row card${hidden ? ' hidden' : ''}`}
      data-result={match.result}
      data-reveal
      data-delay={match.delay}
    >
      {/* Main row */}
      <div className="match-row-main">
        <div className="match-team away-side">
          <div className="team-badge away-badge" style={match.teamA.style}>{match.teamA.code}</div>
          <div>
            <div className="team-placement">{match.teamA.side}</div>
            <strong>{match.teamA.name}</strong>
          </div>
        </div>

        <div className="match-row-center">
          <span className={`competition-tag${match.competition.cls ? ' ' + match.competition.cls : ''}`}>
            {match.competition.label}
          </span>
          <div className="match-row-score">
            <span className="rs-away">{match.scoreA}</span>
            <span className="rs-colon">:</span>
            <span className="rs-home">{match.scoreB}</span>
          </div>
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
        </div>

        <div className="match-team home-side">
          <div className="team-badge home-badge" style={match.teamB.style}>{match.teamB.code}</div>
          <div>
            <div className="team-placement">{match.teamB.side}</div>
            <strong>{match.teamB.name}</strong>
          </div>
        </div>
      </div>

      {/* Footer row */}
      <div className="match-row-footer">
        <span>📅 {match.date}</span>
        <span>📍 {match.venue}</span>
        <button className="match-expand-btn" onClick={toggle}>
          {open ? 'HIDE DETAILS ▴' : 'VIEW SQUAD & SCORERS ▾'}
        </button>
      </div>

      {/* Expandable detail panel */}
      <div className={`match-detail-panel${open ? ' open' : ''}`}>
        <div className="detail-scorers">
          {match.scorers.length > 0 ? (
            <>
              <strong>Scorers</strong>
              {match.scorers.map(({ name, min }, i) => (
                <div className="goal-item" key={i}>
                  <span>{name}</span>
                  <span className="goal-min">{min}</span>
                </div>
              ))}
            </>
          ) : (
            <strong>No goals scored</strong>
          )}
        </div>

        {match.squad.length > 0 && (
          <div className="detail-squad">
            <strong>Squad</strong>
            <div className="mini-squad-tags">
              {match.squad.map(({ name, role, cls }) => (
                <span key={name} className={`squad-tag ${cls}`}>{name} {role}</span>
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
  useScrollReveal();
  useTilt();

  const [activeFilter, setActiveFilter] = useState('all');
  const [loadState,    setLoadState]    = useState('idle'); // idle | loading | done

  const handleFilter = (value) => setActiveFilter(value);

  const handleLoadMore = () => {
    setLoadState('loading');
    setTimeout(() => setLoadState('done'), 1200);
  };

  const isHidden = (match) => {
    if (activeFilter === 'all') return false;
    return match.result !== activeFilter;
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
                onClick={() => handleFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Match List */}
          <div className="match-list" id="matchList">
            {MATCHES.map((match) => (
              <MatchRow key={match.id} match={match} hidden={isHidden(match)} />
            ))}
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