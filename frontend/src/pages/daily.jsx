import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../../../backend/api/api.js';
import '../assets/css/global.css';
import '../assets/css/daily.css';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useTilt             from '../hooks/useTilt';
import usePageLoader       from '../hooks/usePageLoader';

/* ── Constants ───────────────────────────────────────────── */
const DAYS_SHORT  = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const DAYS_FULL   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS_SHORT= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ── Helpers ─────────────────────────────────────────────── */
const toYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

/* ── Skeleton ────────────────────────────────────────────── */
const Skeleton = ({ width='100%', height='20px', style={} }) => (
  <div style={{
    width, height, borderRadius:'6px',
    background:'linear-gradient(90deg,var(--bg-card) 25%,rgba(255,255,255,0.05) 50%,var(--bg-card) 75%)',
    backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite', ...style,
  }}/>
);

/* ── Repeating scroll reveal ─────────────────────────────── */
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

/* ══════════════════════════════════════════════════════════
   CUSTOM CALENDAR COMPONENT
   - Full month grid with navigation
   - Highlights dates that have match data (from allDates)
   - Highlights selected date in gold
   - Today marked with a dot
   - Positioned on left side of the ribbon
══════════════════════════════════════════════════════════ */
const CalendarPicker = ({ allDates, activeDate, onSelect, onClose }) => {
  const today    = new Date();
  const initDate = activeDate ? new Date(activeDate + 'T00:00:00') : today;

  const [viewYear,  setViewYear]  = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const daysInMonth   = getDaysInMonth(viewYear, viewMonth);
  const firstDay      = getFirstDayOfMonth(viewYear, viewMonth);
  const matchDateSet  = new Set(allDates);
  const todayStr      = toYMD(today);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    onSelect(dateStr);
  };

  // Build grid cells: blanks for offset + day numbers
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        left: 0,
        zIndex: 500,
        width: '300px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-bright)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,152,10,0.15)',
        backdropFilter: 'blur(20px)',
        animation: 'fadeInDown 0.2s ease',
      }}
    >
      {/* Inject animation keyframe once */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* Header — month navigation */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <button
          onClick={prevMonth}
          style={{
            background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)',
            borderRadius:'8px', color:'var(--ivory)', width:'32px', height:'32px',
            cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(201,152,10,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
        >
          ‹
        </button>

        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--ivory)', fontWeight:600 }}>
            {MONTHS_FULL[viewMonth]}
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--gold)', letterSpacing:'0.1em' }}>
            {viewYear}
          </div>
        </div>

        <button
          onClick={nextMonth}
          style={{
            background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)',
            borderRadius:'8px', color:'var(--ivory)', width:'32px', height:'32px',
            cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(201,152,10,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'2px', marginBottom:'6px' }}>
        {DAYS_FULL.map(d => (
          <div key={d} style={{
            textAlign:'center', fontFamily:'var(--font-mono)',
            fontSize:'0.58rem', color:'var(--text-muted)',
            letterSpacing:'0.05em', padding:'4px 0',
          }}>
            {d.slice(0,1)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'3px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`}/>;

          const dateStr   = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const isActive  = dateStr === activeDate;
          const hasMatch  = matchDateSet.has(dateStr);
          const isToday   = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(day)}
              style={{
                aspectRatio: '1',
                border: isActive
                  ? '2px solid var(--gold)'
                  : hasMatch
                    ? '1px solid rgba(201,152,10,0.4)'
                    : '1px solid transparent',
                borderRadius: '8px',
                background: isActive
                  ? 'linear-gradient(135deg, var(--gold-d), var(--gold))'
                  : hasMatch
                    ? 'rgba(201,152,10,0.1)'
                    : 'transparent',
                color: isActive ? '#0a0810' : hasMatch ? 'var(--ivory)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: isActive || hasMatch ? 700 : 400,
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1px',
                transition: 'all 0.15s',
                padding: '2px',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = 'rgba(201,152,10,0.2)';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = hasMatch ? 'rgba(201,152,10,0.1)' : 'transparent';
              }}
              title={hasMatch ? `Match on ${dateStr}` : dateStr}
            >
              {day}
              {/* Today dot */}
              {isToday && (
                <div style={{
                  width:'4px', height:'4px', borderRadius:'50%',
                  background: isActive ? '#0a0810' : 'var(--gold)',
                  position:'absolute', bottom:'3px',
                }}/>
              )}
              {/* Match dot (if has match but not active) */}
              {hasMatch && !isActive && !isToday && (
                <div style={{
                  width:'3px', height:'3px', borderRadius:'50%',
                  background:'var(--gold)', position:'absolute', bottom:'3px',
                }}/>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop:'16px', paddingTop:'12px', borderTop:'1px solid var(--border)',
        display:'flex', gap:'16px', flexWrap:'wrap',
      }}>
        {[
          { color:'linear-gradient(135deg,var(--gold-d),var(--gold))', label:'Selected'   },
          { color:'rgba(201,152,10,0.15)',                              label:'Has match'  },
          { color:'transparent',                                         label:'No match'   },
        ].map(({ color, label }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div style={{
              width:'12px', height:'12px', borderRadius:'4px',
              background:color, border:'1px solid var(--border)',
            }}/>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text-muted)', letterSpacing:'0.05em' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Quick jump to today */}
      <button
        onClick={() => { onSelect(todayStr); }}
        style={{
          marginTop:'12px', width:'100%', padding:'8px',
          background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)',
          borderRadius:'8px', color:'var(--text-muted)', fontFamily:'var(--font-mono)',
          fontSize:'0.68rem', cursor:'pointer', letterSpacing:'0.08em',
          transition:'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background='rgba(201,152,10,0.1)'; e.currentTarget.style.color='var(--gold)'; e.currentTarget.style.borderColor='var(--gold)'; }}
        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)'; }}
      >
        JUMP TO TODAY
      </button>
    </div>
  );
};

/* ── Calendar Trigger Button ─────────────────────────────── */
const CalendarButton = ({ activeDate, allDates, onSelect }) => {
  const [open, setOpen] = useState(false);

  const displayDate = activeDate
    ? new Date(activeDate + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
    : 'Pick a date';

  return (
    <div style={{ position:'relative', flexShrink:0 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 16px',
          background: open ? 'rgba(201,152,10,0.15)' : 'rgba(255,255,255,0.05)',
          border: open ? '1px solid var(--gold)' : '1px solid var(--border)',
          borderRadius: '10px',
          color: open ? 'var(--gold)' : 'var(--ivory)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background='rgba(201,152,10,0.1)'; e.currentTarget.style.borderColor='rgba(201,152,10,0.5)'; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='var(--border)'; } }}
      >
        {/* Calendar icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>{displayDate}</span>
        <span style={{ opacity:0.5, fontSize:'0.6rem' }}>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <CalendarPicker
          allDates={allDates}
          activeDate={activeDate}
          onSelect={(date) => { onSelect(date); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   DAILY COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Daily() {
  usePageLoader(); ; useCounterAnimation(); useTilt();

  const [entry,      setEntry]      = useState(null);
  const [allDates,   setAllDates]   = useState([]);
  const [activeDate, setActiveDate] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useRepeatReveal([entry]);

  const scrollRef     = useRef(null);
  const activePillRef = useRef(null);

  const fetchEntry = useCallback(async (date=null) => {
  try {
    setLoading(true);
    setError(null);
    const data = await api.daily(date);

    // Sort dates newest → oldest
    const sorted = (data.all_dates || []).sort((a,b) => new Date(b) - new Date(a));
    
    const unique = [...new Set(sorted)];
    setAllDates(unique);

    if (data.entry && data.entry.length > 0) {
      setEntry(data.entry);
      setActiveDate(data.date || unique[0]);
      setError(null);
    } else {
      setEntry([]);
      if (date) {
        setError('No match found for this date.');
      } else if (unique.length > 0) {
        // dates exist but selected date has no entry — load latest
        fetchEntry(unique[0]);
        return;
      } else {
        setError('No daily entries yet.');
      }
    }
  } catch {
    setError('Failed to load. Make sure the server is running.');
    setEntry([]);
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => { fetchEntry(); }, [fetchEntry]);

  useEffect(() => {
    if (activePillRef.current)
      activePillRef.current.scrollIntoView({ inline:'center', behavior:'smooth' });
  }, [allDates]);

  const handleDateSelect = (dateStr) => {
    setActiveDate(dateStr);
    fetchEntry(dateStr);
  };

  /* ── Derived data ──────────────────────────────────────── 
  const match      = entry?.match || null;
  const motmPlayer = entry?.motm_player || null;

  const homeGoals = match?.goals?.filter(g => g.team_name === match.home_team_name && !g.is_own_goal) || [];
  const awayGoals = match?.goals?.filter(g => g.team_name === match.away_team_name && !g.is_own_goal) || [];
  const homeSquad = match?.appearances?.filter(a => a.team_name === match.home_team_name) || [];
  const awaySquad = match?.appearances?.filter(a => a.team_name === match.away_team_name) || [];  */ 

  const posCls = { GK:'gk', DEF:'def', MID:'mid', FWD:'fwd' };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="page-loader" id="loader">
        <div className="loader-logo">GOLDEN ROCK FC</div>
        <div className="loader-bar"><div className="loader-bar-fill"/></div>
      </div>
      <div className="bg-mesh"/><div className="bg-grain"/>
      <Navbar/>

      <div className="page-wrapper">

        {/* ══ DATE RIBBON ════════════════════════════════════ */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 0',
          position: 'relative',
        }}>

          {/* ── Calendar picker on LEFT ───────────────────── */}
          <CalendarButton
            activeDate={activeDate}
            allDates={allDates}
            onSelect={handleDateSelect}
          />

          {/* ── Divider ───────────────────────────────────── */}
          <div style={{ width:'1px', height:'36px', background:'var(--border)', flexShrink:0 }}/>

          {/* ── Scroll left arrow ─────────────────────────── */}
          <button
            className="date-nav-btn"
            onClick={() => scrollRef.current?.scrollBy({ left:-200, behavior:'smooth' })}
          >
            ‹
          </button>

          {/* ── Pill ribbon ───────────────────────────────── */}
          <div
            className="date-scroll"
            ref={scrollRef}
            style={{ flex:1, overflowX:'auto', display:'flex', gap:'6px' }}
          >
            {loading && !allDates.length ? (
              [1,2,3,4,5,6,7].map(i => (
                <div key={i} className="date-pill" style={{ flexShrink:0 }}>
                  <Skeleton height="10px" width="28px" style={{margin:'2px auto'}}/>
                  <Skeleton height="16px" width="18px" style={{margin:'2px auto'}}/>
                  <Skeleton height="8px"  width="22px" style={{margin:'2px auto'}}/>
                </div>
              ))
            ) : allDates.map(dateStr => {
              const d = new Date(dateStr + 'T00:00:00');
              const isActive = dateStr === activeDate;
              return (
                <button
                  key={dateStr}
                  ref={isActive ? activePillRef : null}
                  className={`date-pill${isActive ? ' active' : ''}`}
                  style={{ flexShrink:0 }}
                  onClick={() => handleDateSelect(dateStr)}
                >
                  <span className="day-name">{DAYS_SHORT[d.getDay()]}</span>
                  <span className="day-num">{d.getDate()}</span>
                  <span className="day-month">{MONTHS_SHORT[d.getMonth()]}</span>
                </button>
              );
            })}
          </div>

          {/* ── Scroll right arrow ────────────────────────── */}
          <button
            className="date-nav-btn"
            onClick={() => scrollRef.current?.scrollBy({ left:200, behavior:'smooth' })}
          >
            ›
          </button>
        </div>

        {/* ══ MAIN CONTENT ═══════════════════════════════════ */}
        <section className="section">

          {/* Error / no match */}
          {error && (
            <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.85rem' }}>
              <div style={{ fontSize:'3rem', marginBottom:'16px' }}>📭</div>
              <div style={{ color:'var(--ivory)', fontSize:'1rem', marginBottom:'8px' }}>No match found</div>
              <div>No match was scheduled or recorded for this date.</div>
              <div style={{ marginTop:'16px', fontSize:'0.72rem' }}>
                Use the calendar on the left to pick a date with a match (shown in gold).
              </div>
            </div>
          )}

          {/* Loading */}
          {!error && loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
              <div className="card" style={{padding:'24px'}}>
                <Skeleton height="20px" width="40%" style={{marginBottom:'16px'}}/>
                <Skeleton height="80px"/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                <div className="card" style={{padding:'24px'}}><Skeleton height="14px" style={{marginBottom:'8px'}}/><Skeleton height="14px" style={{marginBottom:'8px'}}/><Skeleton height="14px"/></div>
                <div className="card" style={{padding:'24px'}}><Skeleton height="60px"/></div>
              </div>
            </div>
          )}

          {/* No match but no error */}
          {!error && !loading && entry.length === 0 && (
            <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.85rem' }}>
              <div style={{ fontSize:'3rem', marginBottom:'16px' }}>📭</div>
              <div style={{ color:'var(--ivory)', fontSize:'1rem', marginBottom:'8px' }}>No match data</div>
              <div>No match data available for this date.</div>
            </div>
          )}

          {/* Match content */}
          {!error && !loading && entry.length > 0 && (
            <>
              {entry.map((item, idx) => (
                <div key={item.id} style={{ marginBottom:'28px' }}>

                  {/* Match Result Card */}
                  <div className="daily-match-card card tilt-card" data-reveal>
                    <div className="daily-match-header">
                      <span className="badge badge-violet">{item.competition}</span>

                      <span className="daily-date">
                        📅 {new Date(item.kick_off).toLocaleDateString('en-GB', {
                          weekday:'long',
                          day:'numeric',
                          month:'short',
                          year:'numeric'
                        })}
                      </span>

                      <span className="daily-venue">📍 {item.venue}</span>

                      <span className="daily-time">
                        🕗 {new Date(item.kick_off).toLocaleTimeString('en-GB', {
                          hour:'2-digit',
                          minute:'2-digit'
                        })}
                      </span>
                    </div>

                    <div className="daily-score-block">
                      <div className="daily-team">
                        <div className="daily-team-crest home">🏠</div>
                        <h3>{item.home_team_name}</h3>
                      </div>

                      <div className="daily-score-center">
                        <div className="daily-score-nums">
                          <span className="ds-home">{item.home_score}</span>
                          <span className="ds-dash">—</span>
                          <span className="ds-away">{item.away_score}</span>
                        </div>

                        <div
                          className={`badge badge-${item.result}`}
                          style={{ marginTop:'8px' }}
                        >
                          {item.result?.toUpperCase()}
                        </div>
                      </div>

                      <div className="daily-team">
                        <div className="daily-team-crest away">🚩</div>
                        <h3>{item.away_team_name}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <div
                      className="daily-notes card"
                      style={{ marginTop:'14px' }}
                      data-reveal
                    >
                      <h4>📋 NOTES</h4>
                      <p>{item.notes}</p>
                    </div>
                  )}

                  {/* MOTM */}
                  {item.motm_player_name && (
                    <div
                      className="motm-section card tilt-card"
                      style={{ marginTop:'14px' }}
                      data-reveal
                    >
                      <div className="motm-stars">⭐ ⭐ ⭐</div>
                      <div className="motm-title-label">MAN OF THE MATCH</div>

                      <h3 className="motm-player-name">
                        {item.motm_player_name.toUpperCase()}
                      </h3>

                      <div className="motm-stats-row">
                        <div>
                          <span>{item.motm_goals}</span>
                          <small>Goals</small>
                        </div>

                        <div>
                          <span>{item.motm_assists}</span>
                          <small>Assists</small>
                        </div>

                        <div>
                          <span>{item.motm_rating || '—'}</span>
                          <small>Rating</small>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </>
          )}

        </section>
      </div>
      <Footer/>
    </>
  );
}