import React, { useState, useEffect, useRef } from 'react';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../../../backend/api/api.js';
import '../assets/css/global.css';
import '../assets/css/daily.css';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useTilt             from '../hooks/useTilt';
import usePageLoader       from '../hooks/usePageLoader';

const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Skeleton = ({ width='100%', height='20px', style={} }) => (
  <div style={{ width, height, borderRadius:'6px', background:'linear-gradient(90deg,var(--bg-card) 25%,rgba(255,255,255,0.05) 50%,var(--bg-card) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite', ...style }} />
);

const useRepeatReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { setTimeout(() => e.target.classList.add('revealed'), Number(e.target.dataset.delay||0)); }
        else { e.target.classList.remove('revealed'); }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

export default function Daily() {
  usePageLoader(); useRepeatReveal(); useCounterAnimation(); useTilt();

  const [entry,      setEntry]      = useState(null);
  const [allDates,   setAllDates]   = useState([]);
  const [activeDate, setActiveDate] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showCal,    setShowCal]    = useState(false);
  const [calDate,    setCalDate]    = useState('');

  const scrollRef     = useRef(null);
  const activePillRef = useRef(null);

  const fetchEntry = async (date=null) => {
    try {
      setLoading(true); setError(null);
      const data = await api.daily(date);
      setEntry(data.entry);
      if (data.all_dates?.length) {
        setAllDates(data.all_dates);
        setActiveDate(data.entry?.date || data.all_dates[0]);
      }
    } catch {
      setError('No match found for this date.');
      setEntry(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEntry(); }, []);

  useEffect(() => {
    if (activePillRef.current)
      activePillRef.current.scrollIntoView({ inline:'center', behavior:'smooth' });
  }, [allDates]);

  const handleCalChange = (e) => {
    const val = e.target.value;
    setCalDate(val);
    if (val) { setShowCal(false); fetchEntry(val); setActiveDate(val); }
  };

  const match      = entry?.match || null;
  const motmPlayer = entry?.motm_player || null;

  // Split goals and appearances by team
  const homeGoals    = match?.goals?.filter(g => g.team_name === match.home_team_name && !g.is_own_goal) || [];
  const awayGoals    = match?.goals?.filter(g => g.team_name === match.away_team_name && !g.is_own_goal) || [];
  const homeSquad    = match?.appearances?.filter(a => a.team_name === match.home_team_name) || [];
  const awaySquad    = match?.appearances?.filter(a => a.team_name === match.away_team_name) || [];

  // Assists per player in this match
  const assistMap = {};
  match?.appearances?.forEach(a => { if (a.assists > 0) assistMap[a.player_name] = a.assists; });

  const posCls = { GK:'gk', DEF:'def', MID:'mid', FWD:'fwd' };

  return (
    <>
      <div className="page-loader" id="loader"><div className="loader-logo">GOLDEN ROCK FC</div><div className="loader-bar"><div className="loader-bar-fill"/></div></div>
      <div className="bg-mesh"/><div className="bg-grain"/>
      <Navbar/>
      <div className="page-wrapper">

        {/* ── Date Ribbon + Calendar ─────────────────────── */}
        <div className="date-ribbon" style={{ alignItems:'center', gap:'8px' }}>
          <button className="date-nav-btn" onClick={() => scrollRef.current?.scrollBy({ left:-200, behavior:'smooth' })}>‹</button>

          <div className="date-scroll" ref={scrollRef}>
            {loading && !allDates.length ? (
              [1,2,3,4,5].map(i => <div key={i} className="date-pill"><Skeleton height="12px" width="28px" style={{margin:'2px auto'}}/><Skeleton height="18px" width="20px" style={{margin:'2px auto'}}/><Skeleton height="10px" width="24px" style={{margin:'2px auto'}}/></div>)
            ) : allDates.map(dateStr => {
              const d = new Date(dateStr);
              const isActive = dateStr === activeDate;
              return (
                <button key={dateStr} ref={isActive ? activePillRef : null}
                  className={`date-pill${isActive ? ' active' : ''}`}
                  onClick={() => { setActiveDate(dateStr); fetchEntry(dateStr); }}
                >
                  <span className="day-name">{DAYS[d.getDay()]}</span>
                  <span className="day-num">{d.getDate()}</span>
                  <span className="day-month">{MONTHS[d.getMonth()]}</span>
                </button>
              );
            })}
          </div>

          <button className="date-nav-btn" onClick={() => scrollRef.current?.scrollBy({ left:200, behavior:'smooth' })}>›</button>

          {/* Calendar icon button */}
          <div style={{ position:'relative', marginLeft:'8px' }}>
            <button
              className="date-nav-btn"
              onClick={() => setShowCal(v => !v)}
              title="Pick a date"
              style={{ fontSize:'1.1rem', padding:'6px 10px' }}
            >
              📅
            </button>
            {showCal && (
              <div style={{
                position:'absolute', top:'110%', right:0, zIndex:100,
                background:'var(--bg-card)', border:'1px solid var(--border-bright)',
                borderRadius:'10px', padding:'12px', boxShadow:'0 8px 32px rgba(0,0,0,0.5)'
              }}>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-muted)', marginBottom:'8px', letterSpacing:'0.1em' }}>
                  PICK A DATE
                </p>
                <input
                  type="date"
                  value={calDate}
                  onChange={handleCalChange}
                  style={{
                    background:'var(--bg-deep)', border:'1px solid var(--border)',
                    color:'var(--ivory)', padding:'8px 12px', borderRadius:'6px',
                    fontFamily:'var(--font-mono)', fontSize:'0.8rem', cursor:'pointer'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <section className="section">

          {error && (
            <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.85rem' }}>
              <div style={{ fontSize:'2rem', marginBottom:'12px' }}>📭</div>
              No match scheduled for this date.
            </div>
          )}

          {!error && loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
              <div className="card" style={{ padding:'24px' }}>
                <Skeleton height="20px" width="40%" style={{marginBottom:'16px'}}/>
                <Skeleton height="80px"/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                <div className="card" style={{padding:'24px'}}><Skeleton height="16px" width="60%" style={{marginBottom:'12px'}}/><Skeleton height="14px" style={{marginBottom:'8px'}}/><Skeleton height="14px"/></div>
                <div className="card" style={{padding:'24px'}}><Skeleton height="16px" width="40%" style={{marginBottom:'12px'}}/><Skeleton height="60px"/></div>
              </div>
            </div>
          )}

          {!error && !loading && !match && (
            <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.85rem' }}>
              <div style={{ fontSize:'2rem', marginBottom:'12px' }}>📭</div>
              No match data for this date.
            </div>
          )}

          {!error && !loading && match && (
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
                    <div className={`badge badge-${match.result}`} style={{marginTop:'8px'}}>
                      {match.result.toUpperCase()}
                    </div>
                  </div>
                  <div className="daily-team">
                    <div className="daily-team-crest away">⏱️</div>
                    <h3>{match.away_team_name}</h3>
                  </div>
                </div>
              </div>

              {/* Scorers + Assists + Notes */}
              <div className="daily-details-grid">
                <div className="daily-scorers card" data-reveal data-delay="80">

                  {/* Home scorers & assists */}
                  <div className="daily-scorers-col">
                    <h4>⚡ {match.home_team_name}</h4>
                    {homeGoals.length > 0 ? homeGoals.map((g, i) => (
                      <div className="scorer-row" key={i}>
                        <span>⚽ {g.player_name}</span>
                        <span className="goal-min">{g.minute}'</span>
                      </div>
                    )) : <div className="scorer-row" style={{color:'var(--text-muted)'}}>No goals</div>}

                    {/* Assists for home team */}
                    {homeSquad.filter(a => a.assists > 0).length > 0 && (
                      <>
                        <div style={{ marginTop:'10px', fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--gold)', letterSpacing:'0.1em' }}>ASSISTS</div>
                        {homeSquad.filter(a => a.assists > 0).map((a, i) => (
                          <div className="scorer-row" key={i}>
                            <span>🎯 {a.player_name}</span>
                            <span className="goal-min">{a.assists}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Away scorers & assists */}
                  <div className="daily-scorers-col" style={{opacity:0.75}}>
                    <h4>⚡ {match.away_team_name}</h4>
                    {awayGoals.length > 0 ? awayGoals.map((g, i) => (
                      <div className="scorer-row" key={i}>
                        <span style={{color:'var(--text-muted)'}}>⚽ {g.player_name}</span>
                        <span className="goal-min">{g.minute}'</span>
                      </div>
                    )) : <div className="scorer-row" style={{color:'var(--text-muted)'}}>No goals</div>}

                    {awaySquad.filter(a => a.assists > 0).length > 0 && (
                      <>
                        <div style={{ marginTop:'10px', fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--gold)', letterSpacing:'0.1em' }}>ASSISTS</div>
                        {awaySquad.filter(a => a.assists > 0).map((a, i) => (
                          <div className="scorer-row" key={i}>
                            <span style={{color:'var(--text-muted)'}}>🎯 {a.player_name}</span>
                            <span className="goal-min">{a.assists}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                </div>

                <div className="daily-notes card" data-reveal data-delay="160">
                  <h4>📋 NOTES</h4>
                  <p>{entry?.notes || 'No notes recorded for this match.'}</p>
                </div>
              </div>

              {/* Both Squads + MOTM */}
              <div className="daily-squad-motm">

                <div className="squad-section card" data-reveal data-delay="80">
                  <div className="squad-section-header">
                    <h3>Match Squads</h3>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--text-muted)'}}>
                      {match.venue}
                    </span>
                  </div>

                  {/* Home Squad */}
                  <div style={{ marginBottom:'20px' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--gold)', letterSpacing:'0.1em', marginBottom:'10px' }}>
                      {match.home_team_name}
                    </div>
                    <div className="squad-grid">
                      {homeSquad.length > 0 ? homeSquad.map((a, i) => (
                        <div key={i} className={`squad-tag ${posCls[a.player_position] || 'fwd'}`}>
                          {a.player_name} <em>{a.player_position}</em>
                          {a.is_substitute && <em> SUB</em>}
                        </div>
                      )) : <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>No squad data</span>}
                    </div>
                  </div>

                  {/* Away Squad */}
                  <div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--gold)', letterSpacing:'0.1em', marginBottom:'10px' }}>
                      {match.away_team_name}
                    </div>
                    <div className="squad-grid">
                      {awaySquad.length > 0 ? awaySquad.map((a, i) => (
                        <div key={i} className={`squad-tag ${posCls[a.player_position] || 'fwd'}`} style={{opacity:0.8}}>
                          {a.player_name} <em>{a.player_position}</em>
                          {a.is_substitute && <em> SUB</em>}
                        </div>
                      )) : <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>No squad data</span>}
                    </div>
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
                    <div style={{color:'var(--text-muted)', fontSize:'0.8rem', padding:'20px 0'}}>No MOTM assigned.</div>
                  )}
                </div>

              </div>
            </>
          )}

        </section>
      </div>
      <Footer/>
    </>
  );
}