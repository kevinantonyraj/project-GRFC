import React, { useState, useEffect, useRef } from 'react';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../../../backend/api/api.js';
import '../assets/css/global.css';
import '../assets/css/daily.css';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useTilt             from '../hooks/useTilt';
import usePageLoader       from '../hooks/usePageLoader';

/* ── Constants ───────────────────────────────────────────── */
const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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

/* ═══════════════════════════════════════════════════════════
   DAILY COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Daily() {
  usePageLoader();
  useRepeatScrollReveal();
  useCounterAnimation();
  useTilt();

  /* ── API state ─────────────────────────────────────────── */
  const [entry,     setEntry]     = useState(null);
  const [allDates,  setAllDates]  = useState([]);
  const [activeDate,setActiveDate]= useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  /* ── Fetch daily entry ─────────────────────────────────── */
  const fetchEntry = async (date = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.daily(date);
      setEntry(data.entry);
      if (data.all_dates && data.all_dates.length > 0) {
        setAllDates(data.all_dates);
        setActiveDate(data.entry?.date || data.all_dates[0]);
      }
    } catch (err) {
      setError('Failed to load daily data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntry(); }, []);

  /* ── Date scroll ref ───────────────────────────────────── */
  const scrollRef     = useRef(null);
  const activePillRef = useRef(null);

  useEffect(() => {
    if (activePillRef.current) {
      activePillRef.current.scrollIntoView({ inline: 'center', behavior: 'smooth' });
    }
  }, [allDates]);

  const scrollDate = dir => scrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });

  /* ── Build pill from date string ───────────────────────── */
  const buildPill = (dateStr) => {
    const d = new Date(dateStr);
    return {
      dateStr,
      dayName:  DAYS[d.getDay()],
      dayNum:   d.getDate(),
      month:    MONTHS[d.getMonth()],
    };
  };

  /* ── Derived data ──────────────────────────────────────── */
  const match      = entry?.match       || null;
  const motmPlayer = entry?.motm_player || null;

  /* ── Squad split by team ─────────────────────────────────*/
  const homeSquad = match?.appearances?.filter(a => a.team_name === match.home_team_name) || [];
  const awaySquad = match?.appearances?.filter(a => a.team_name === match.away_team_name) || [];
  const homeGoals = match?.goals?.filter(g => g.team_name === match.home_team_name)       || [];
  const awayGoals = match?.goals?.filter(g => g.team_name === match.away_team_name)       || [];

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

        {/* ── Date Ribbon ──────────────────────────────────── */}
        <div className="date-ribbon">
          <button className="date-nav-btn" onClick={() => scrollDate(-1)}>‹</button>
          <div className="date-scroll" ref={scrollRef}>
            {loading && allDates.length === 0 ? (
              [1,2,3,4,5,6,7].map(i => (
                <div key={i} className="date-pill">
                  <Skeleton height="12px" width="28px" style={{ margin: '2px auto' }} />
                  <Skeleton height="18px" width="20px" style={{ margin: '2px auto' }} />
                  <Skeleton height="10px" width="24px" style={{ margin: '2px auto' }} />
                </div>
              ))
            ) : (
              allDates.map(dateStr => {
                const pill = buildPill(dateStr);
                const isActive = dateStr === activeDate;
                return (
                  <button
                    key={dateStr}
                    ref={isActive ? activePillRef : null}
                    className={`date-pill${isActive ? ' active' : ''}`}
                    onClick={() => { setActiveDate(dateStr); fetchEntry(dateStr); }}
                  >
                    <span className="day-name">{pill.dayName}</span>
                    <span className="day-num">{pill.dayNum}</span>
                    <span className="day-month">{pill.month}</span>
                  </button>
                );
              })
            )}
          </div>
          <button className="date-nav-btn" onClick={() => scrollDate(1)}>›</button>
        </div>

        {/* ── Main Content ─────────────────────────────────── */}
        <section className="section">

          {error && (
            <p style={{ color: '#f87171', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '20px' }}>
              ⚠ {error}
            </p>
          )}

          {loading ? (
            /* Loading state */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <Skeleton height="20px" width="40%" style={{ marginBottom: '16px' }} />
                <Skeleton height="80px" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="card" style={{ padding: '24px' }}>
                  <Skeleton height="16px" width="60%" style={{ marginBottom: '12px' }} />
                  <Skeleton height="14px" style={{ marginBottom: '8px' }} />
                  <Skeleton height="14px" style={{ marginBottom: '8px' }} />
                  <Skeleton height="14px" />
                </div>
                <div className="card" style={{ padding: '24px' }}>
                  <Skeleton height="16px" width="40%" style={{ marginBottom: '12px' }} />
                  <Skeleton height="60px" />
                </div>
              </div>
            </div>
          ) : !match ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              No match data for this date.
            </div>
          ) : (
            <>
              {/* Match Result Card */}
              <div className="daily-match-card card tilt-card" data-reveal>
                <div className="daily-match-header">
                  <span className="badge badge-violet">{match.competition}</span>
                  <span className="daily-date">
                    📅 {new Date(match.date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'short', year:'numeric' })}
                  </span>
                  <span className="daily-venue">📍 {match.venue}</span>
                  <span className="daily-time">
                    🕗 {new Date(match.date).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
                  </span>
                </div>

                <div className="daily-score-block">
                  <div className="daily-team">
                    <div className="daily-team-crest home">✅</div>
                    <h3>{match.home_team_name}</h3>
                  </div>
                  <div className="daily-score-center">
                    <div className="daily-score-nums">
                      <span className="ds-home">{match.home_score}</span>
                      <span className="ds-dash">—</span>
                      <span className="ds-away">{match.away_score}</span>
                    </div>
                    <div className={`badge badge-${match.result}`} style={{ marginTop: '8px' }}>
                      {match.result.toUpperCase()}
                    </div>
                  </div>
                  <div className="daily-team">
                    <div className="daily-team-crest away">⏱️</div>
                    <h3>{match.away_team_name}</h3>
                  </div>
                </div>
              </div>

              {/* Scorers + Notes */}
              <div className="daily-details-grid">
                <div className="daily-scorers card" data-reveal data-delay="80">

                  {/* Home scorers */}
                  <div className="daily-scorers-col">
                    <h4>⚡ {match.home_team_name} SCORERS</h4>
                    {homeGoals.length > 0 ? (
                      homeGoals.map((g, i) => (
                        <div className="scorer-row" key={i}>
                          <span>⚡ {g.player_name}</span>
                          <span className="goal-min">{g.minute}'</span>
                        </div>
                      ))
                    ) : (
                      <div className="scorer-row" style={{ color: 'var(--text-muted)' }}>No goals</div>
                    )}
                  </div>

                  {/* Away scorers */}
                  <div className="daily-scorers-col" style={{ opacity: 0.6 }}>
                    <h4>⚡ {match.away_team_name} SCORERS</h4>
                    {awayGoals.length > 0 ? (
                      awayGoals.map((g, i) => (
                        <div className="scorer-row" key={i}>
                          <span style={{ color: 'var(--text-muted)' }}>⚡ {g.player_name}</span>
                          <span className="goal-min">{g.minute}'</span>
                        </div>
                      ))
                    ) : (
                      <div className="scorer-row" style={{ color: 'var(--text-muted)' }}>No goals</div>
                    )}
                  </div>

                </div>

                {/* Notes */}
                <div className="daily-notes card" data-reveal data-delay="160">
                  <h4>📋 NOTES</h4>
                  <p>{entry?.notes || 'No notes recorded for this match.'}</p>
                </div>
              </div>

              {/* Squad + MOTM */}
              <div className="daily-squad-motm">

                {/* Squad */}
                <div className="squad-section card" data-reveal data-delay="80">
                  <div className="squad-section-header">
                    <h3>The Squad</h3>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {match.venue} | {match.appearances?.length || 0} Players Active
                    </span>
                  </div>
                  <div className="squad-grid">
                    {match.appearances?.map((app, i) => (
                      <div
                        key={i}
                        className={`squad-tag ${app.player_position?.toLowerCase() === 'gk' ? 'gk' :
                          app.player_position?.toLowerCase() === 'def' ? 'def' :
                          app.player_position?.toLowerCase() === 'mid' ? 'mid' : 'fwd'}`}
                      >
                        {app.player_name} <em>{app.player_position}</em>
                        {app.is_substitute && <em> SUB</em>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* MOTM */}
                <div className="motm-section card tilt-card" data-reveal data-delay="160">
                  <div className="motm-stars">⭐ ⭐ ⭐</div>
                  <div className="motm-title-label">MAN OF THE MATCH</div>
                  {motmPlayer ? (
                    <>
                      <div className="motm-avatar-big">{motmPlayer.initials}</div>
                      <h3 className="motm-player-name">{motmPlayer.name.toUpperCase()}</h3>
                      <span className="motm-pos">{motmPlayer.position} · #{motmPlayer.number}</span>
                      <div className="motm-stats-row">
                        <div><span>{entry.motm_goals}</span><small>Goals</small></div>
                        <div><span>{entry.motm_assists}</span><small>Assists</small></div>
                        <div><span>{entry.motm_rating || '—'}</span><small>Rating</small></div>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px 0' }}>
                      No MOTM assigned.
                    </div>
                  )}
                </div>

              </div>
            </>
          )}

        </section>
      </div>

      <Footer />
    </>
  );
}