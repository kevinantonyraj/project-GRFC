import React, { useState, useEffect } from 'react';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../../../backend/api/api.js';
import '../assets/css/global.css';
import '../assets/css/matches.css';
import useTilt       from '../hooks/useTilt';
import usePageLoader from '../hooks/usePageLoader';

const FILTERS = [
  { label:'All',           value:'all'        },
  { label:'Wins',          value:'win'        },
  { label:'Draws',         value:'draw'       },
  { label:'Losses',        value:'loss'       },
  { label:'Internal',      value:'internal'   },
  { label:'Tournament',    value:'tournament' },
];

const BADGE = {
  win:  { cls:'badge-win',  label:'⊙ WIN'  },
  draw: { cls:'badge-draw', label:'⊖ DRAW' },
  loss: { cls:'badge-loss', label:'⊗ LOSS' },
};

const Skeleton = ({ width='100%', height='20px', style={} }) => (
  <div style={{ width, height, borderRadius:'6px', background:'linear-gradient(90deg,var(--bg-card) 25%,rgba(255,255,255,0.05) 50%,var(--bg-card) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite', ...style }}/>
);

const useRepeatReveal = (deps = []) => {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setTimeout(() => e.target.classList.add('revealed'), Number(e.target.dataset.delay||0));
        else e.target.classList.remove('revealed');
      });
    }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, deps);
};

/* ── Single Match Row ────────────────────────────────────── */
const MatchRow = ({ match, index }) => {
  const [open, setOpen] = useState(false);
  const badge = BADGE[match.result] || BADGE.draw;
  const posCls = { GK:'gk', DEF:'def', MID:'mid', FWD:'fwd' };

  return (
    <div className="match-row card" data-result={match.result} data-reveal data-delay={index * 60}>

      <div className="match-row-main">
        <div className="match-team away-side">
          <div className="team-badge away-badge" style={match.home_team_badge ? { background: match.home_team_badge } : {}}>
            {match.home_team_code}
          </div>
          <div>
            <div className="team-placement">{match.match_type === 'internal' ? 'TEAM A' : 'AWAY'}</div>
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
          <div className="team-badge home-badge" style={match.away_team_badge ? { background: match.away_team_badge } : {}}>
            {match.away_team_code}
          </div>
          <div>
            <div className="team-placement">{match.match_type === 'internal' ? 'TEAM B' : 'HOME'}</div>
            <strong>{match.away_team_name}</strong>
          </div>
        </div>
      </div>

      <div className="match-row-footer">
        <span>
          📅 {new Date(match.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
          {' · '}
          {new Date(match.date).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
        </span>
        <span>📍 {match.venue}</span>
        {match.match_type === 'internal'   && <span className="badge badge-violet">⚡ Internal</span>}
        {match.match_type === 'external'   && <span className="badge badge-gold">🏟 External</span>}
        {match.match_type === 'friendly'   && <span className="badge badge-win">🤝 Friendly</span>}
        {match.match_type === 'tournament' && <span className="badge badge-loss">🏆 Tournament</span>}

        <button className="match-expand-btn" onClick={() => setOpen(o => !o)}>
          {open ? 'HIDE DETAILS ▴' : 'VIEW SQUAD & SCORERS ▾'}
        </button>
      </div>

      {/* Expandable panel */}
      <div className={`match-detail-panel${open ? ' open' : ''}`}>

        {/* Scorers */}
        <div className="detail-scorers">
          {match.goals?.filter(g => !g.is_own_goal).length > 0 ? (
            <>
              <strong>Scorers</strong>
              {match.goals.filter(g => !g.is_own_goal).map((g, i) => (
                <div className="goal-item" key={i}>
                  <span>{g.player_name} <small style={{color:'var(--text-muted)'}}>({g.team_name})</small></span>
                  <span className="goal-min">{g.minute}'</span>
                </div>
              ))}
            </>
          ) : <strong>No goals scored</strong>}

          {/* Assists */}
          {match.appearances?.filter(a => a.assists > 0).length > 0 && (
            <>
              <strong style={{ marginTop:'10px', display:'block', color:'var(--gold)' }}>Assists</strong>
              {match.appearances.filter(a => a.assists > 0).map((a, i) => (
                <div className="goal-item" key={i}>
                  <span>🎯 {a.player_name} <small style={{color:'var(--text-muted)'}}>({a.team_name})</small></span>
                  <span className="goal-min">{a.assists}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Squad */}
        {match.appearances?.length > 0 && (
          <div className="detail-squad">
            <strong>Squad</strong>
            <div className="mini-squad-tags">
              {match.appearances.map((a, i) => (
                <span key={i} className={`squad-tag ${posCls[a.player_position] || 'fwd'}`}>
                  {a.player_name} {a.player_position}
                  {a.is_motm && ' ⭐'}
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
  usePageLoader();  useTilt();

  const [matches,      setMatches]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loadState,    setLoadState]    = useState('idle');
  useRepeatReveal([matches]);
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true); setError(null);
        // For internal/tournament, fetch all then filter client-side
        // because Django result filter only covers win/draw/loss
        const resultFilter = ['win','draw','loss'].includes(activeFilter) ? activeFilter : null;
        let data = await api.matches(resultFilter);
        if (activeFilter === 'internal')   data = data.filter(m => m.match_type === 'internal');
        if (activeFilter === 'tournament') data = data.filter(m => m.match_type === 'tournament');
        setMatches(data);
      } catch { setError('Failed to load matches.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [activeFilter]);

  return (
    <>
      <div className="page-loader" id="loader"><div className="loader-logo">GOLDEN ROCK FC</div><div className="loader-bar"><div className="loader-bar-fill"/></div></div>
      <div className="bg-mesh"/><div className="bg-grain"/>
      <Navbar/>
      <div className="page-wrapper">
        <section className="section">

          <div className="page-hero" data-reveal>
            <span className="section-eyebrow">Complete Record</span>
            <h1 className="section-title">Match <span>History</span></h1>
            <p className="section-subtitle">Track our latest results, scorers, and seasonal performance across all competitions.</p>
          </div>

          {/* Filters */}
          <div className="filter-bar" data-reveal data-delay="100">
            <span className="filter-label">🔧 FILTERS:</span>
            {FILTERS.map(({ label, value }) => (
              <button
                key={value}
                className={`filter-btn${activeFilter === value ? ' active' : ''}`}
                onClick={() => { setActiveFilter(value); setLoadState('idle'); }}
              >
                {label}
              </button>
            ))}
          </div>

          {error && <p style={{ color:'#f87171', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:'0.8rem', padding:'12px' }}>⚠ {error}</p>}

          <div className="match-list">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="card" style={{ padding:'20px', marginBottom:'12px', display:'flex', flexDirection:'column', gap:'12px' }}>
                  <Skeleton height="16px" width="40%"/><Skeleton height="60px"/><Skeleton height="14px" width="60%"/>
                </div>
              ))
            ) : matches.length > 0 ? (
              matches.map((match, idx) => <MatchRow key={match.id} match={match} index={idx}/>)
            ) : (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>
                No matches found for this filter.
              </div>
            )}
          </div>

          <div style={{ textAlign:'center', marginTop:'40px' }} data-reveal>
            <button
              className="btn btn-outline"
              onClick={() => setLoadState('done')}
              disabled={loadState === 'done'}
              style={{ opacity: loadState === 'done' ? 0.4 : 1 }}
            >
              {loadState === 'done' ? 'No More Records' : 'Load Previous Season'}
            </button>
          </div>

        </section>
      </div>
      <Footer/>
    </>
  );
}