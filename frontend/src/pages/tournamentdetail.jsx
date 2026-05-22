import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../utils/api.js';
import '../assets/css/global.css';
import '../assets/css/tournaments.css';
import useTilt       from '../hooks/useTilt';
import usePageLoader from '../hooks/usePageLoader';
import { Link } from 'react-router-dom';
import calender from '../assets/icons/calendar.svg';
import location from '../assets/icons/location.png';

const BADGE_CLS = { win:'badge-win', draw:'badge-draw', loss:'badge-loss' };

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

/* ── Stage label based on match index and total ─────────── */
const getStageLabel = (idx, total) => {
  const remaining = total - idx;
  if (remaining === 1) return 'FINAL';
  if (remaining === 2) return 'SEMI FINAL';
  if (remaining <= 4) return 'QUARTER FINAL';
  if (remaining <= 8) return 'ROUND OF 16';
  return `GROUP STAGE · MATCH ${idx + 1}`;
};

export default function TournamentDetail() {
  const { id } = useParams();
  usePageLoader();  useTilt();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [openMatchId, setOpenMatchId] = useState(null);
  useRepeatReveal([data]);
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.tournamentDetail(id);
        setData(res);
      } catch { setError('Tournament not found.'); }
      finally { setLoading(false); }
    };
    if (id) fetch();
  }, [id]);

  const tournament = data?.tournament || null;
  const matches    = data?.matches    || [];

  // Determine stage reached
  const stageReached = tournament?.result
    ? { champions:'🏆 Champions', runners:'🥈 Runners Up', semis:'🥉 Semi Finals', quarters:'Quarter Finals' }[tournament.result] || tournament.result
    : '—';

  const RESULT_BADGE = {
    champions:{ cls:'badge-gold',   label:'Champions'   },
    runners:  { cls:'badge-draw',   label:'Runners Up'  },
    semis:    { cls:'badge-violet', label:'Semi Finals'  },
    quarters: { cls:'badge-violet', label:'Quarter Finals'},
  };

  return (
    <>
      <Helmet>
        <title>Tournament Details | Golden Rock FC</title>

        <meta
          name="description"
          content="View complete tournament details including fixtures, standings, match results, top scorers, participating teams, and tournament statistics."
        />

        <meta
          name="keywords"
          content="tournament details, football standings, football fixtures, tournament statistics, top scorers, tournament teams"
        />

        <meta
          property="og:title"
          content="Tournament Details | Golden Rock FC"
        />

        <meta
          property="og:description"
          content="Detailed football tournament information including standings, fixtures, and statistics."
        />

        <meta
          property="og:image"
          content="https://goldenrockfc.onrender.com/grfc_icon.webp"
        />

        <meta
          property="og:type"
          content="website"
        />

        <link
          rel="canonical"
          href="https://goldenrockfc.onrender.com/tournamentdetails"
        />
      </Helmet>

      <div className="page-loader" id="loader"><div className="loader-logo">GOLDEN ROCK FC</div><div className="loader-bar"><div className="loader-bar-fill"/></div></div>
      <div className="bg-mesh"/><div className="bg-grain"/>
      <Navbar/>

      <div className="page-wrapper">
        <section className="section">

          {/* Breadcrumb */}
          <div className="breadcrumb" data-reveal>
            <Link to="/">Home</Link> › <Link to="/tournaments">Tournaments</Link> ›{' '}
            <span>{loading ? '...' : tournament?.name || 'Tournament'}</span>
          </div>

          {error && (
            <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.85rem' }}>
              ⚠ {error}
            </div>
          )}

          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <Skeleton height="40px" width="50%"/>
              <Skeleton height="20px" width="30%"/>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginTop:'8px' }}>
                {[1,2,3].map(i => <div key={i} className="card" style={{padding:'20px'}}><Skeleton height="30px"/><Skeleton height="14px" width="60%" style={{marginTop:'8px'}}/></div>)}
              </div>
            </div>
          )}

          {!loading && tournament && (
            <>
              {/* Tournament Hero */}
              <div className="profile-hero card" data-reveal style={{ marginBottom:'32px' }}>
                <div className="profile-hero-bg"/>
                <div style={{ position:'relative', zIndex:2, padding:'32px', display:'flex', gap:'32px', alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ fontSize:'4rem' }}>🏆</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'12px' }}>
                      <span className={`badge ${RESULT_BADGE[tournament.result]?.cls || 'badge-draw'}`}>
                        {RESULT_BADGE[tournament.result]?.label || tournament.result}
                      </span>
                      <span className="badge badge-violet">{tournament.year}</span>
                    </div>
                    <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--ivory)', marginBottom:'8px' }}>
                      {tournament.name}
                    </h1>
                    <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.72rem' }}>
                      <span><img src={calender} width="15" height="15" alt="calendar" /> {tournament.dates}</span>
                      <span><img src={location} width="15" height="15" alt="location" /> {tournament.venue}</span>
                    </div>
                  </div>

                  {/* Stage reached badge */}
                  <div style={{
                    background:'linear-gradient(135deg,var(--gold-d),var(--gold))',
                    borderRadius:'12px', padding:'16px 24px', textAlign:'center', minWidth:'140px'
                  }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'rgba(0,0,0,0.7)', letterSpacing:'0.1em', marginBottom:'4px' }}>STAGE REACHED</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'#0a0810', fontWeight:700 }}>{stageReached}</div>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'12px', marginBottom:'32px' }}>
                {[
                  { icon:'🏟️', value: tournament.total_teams,   label:'Teams'   },
                  { icon:'⚽', value: tournament.total_matches, label:'Matches' },
                  { icon:'🎯', value: tournament.total_goals,   label:'Goals'   },
                ].map(({ icon, value, label }) => (
                  <div key={label} className="card tilt-card" style={{ padding:'20px', textAlign:'center' }} data-reveal>
                    <div style={{ fontSize:'1.6rem', marginBottom:'4px' }}>{icon}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--gold)' }}>{value}</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--text-muted)', letterSpacing:'0.1em' }}>{label.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Tournament Squad */}
              {tournament.tournament_squads?.length > 0 && (
                <div className="card" style={{ padding:'24px', marginBottom:'32px' }} data-reveal>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--gold)', letterSpacing:'0.12em', marginBottom:'16px' }}>
                    TOURNAMENT SQUAD
                  </div>
                  <div className="squad-grid">
                    {tournament.tournament_squads.map((s, i) => (
                      <div key={i} className="squad-tag fwd">
                        {s.player_name} <em>{s.player_initials}</em>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Timeline */}
              <div data-reveal>
                <span className="section-eyebrow">Match by Match</span>
                <h2 className="section-title" style={{fontSize:'1.8rem', marginBottom:'24px'}}>
                  Tournament <span>Journey</span>
                </h2>
              </div>

              {matches.length === 0 ? (
                <div className="card" style={{ padding:'40px', textAlign:'center', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>
                  No match data recorded for this tournament yet.
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                  {matches.map((match, idx) => {
                    const isOpen  = openMatchId === match.id;
                    const badge   = BADGE_CLS[match.result] || 'badge-draw';
                    const stage   = getStageLabel(idx, matches.length);
                    const isGRWin = match.result === 'win';

                    return (
                      <div
                        key={match.id}
                        className="card"
                        data-reveal
                        data-delay={idx * 80}
                        style={{ overflow:'hidden', borderLeft:`3px solid ${isGRWin ? 'var(--gold)' : 'var(--border)'}` }}
                      >
                        {/* Stage label + type badge */}
                        <div style={{ padding:'8px 20px', background:'rgba(255,255,255,0.03)', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--gold)', letterSpacing:'0.15em' }}>
                            {stage}
                          </span>
                          <span className="badge badge-loss" style={{ fontSize:'0.6rem' }}>🏆 Tournament</span>
                          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text-muted)', letterSpacing:'0.08em' }}>
                            🏆 {match.tournament_name || tournament?.name}
                          </span>
                        </div>

                        {/* Main row */}
                        <div style={{ padding:'20px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>

                          {/* Teams & Score */}
                          <div style={{ flex:1, display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
                            <div style={{ textAlign:'center', minWidth:'80px' }}>
                              <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text-muted)', marginBottom:'4px' }}>HOME</div>
                              <div style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', color:'var(--ivory)' }}>{match.home_team_code}</div>
                              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{match.home_team_name}</div>
                            </div>

                            <div style={{ textAlign:'center' }}>
                              <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--ivory)', letterSpacing:'4px' }}>
                                {match.home_score} — {match.away_score}
                              </div>
                              <span className={`badge ${badge}`} style={{ fontSize:'0.6rem' }}>
                                {match.result.toUpperCase()}
                              </span>
                            </div>

                            <div style={{ textAlign:'center', minWidth:'80px' }}>
                              <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text-muted)', marginBottom:'4px' }}>AWAY</div>
                              <div style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', color:'var(--ivory)' }}>{match.away_team_code}</div>
                              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{match.away_team_name}</div>
                            </div>
                          </div>

                          {/* Date + Expand */}
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
                            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--text-muted)' }}>
                              <img src={calender} width="15" height="15" alt="calendar" /> {match.date}
                            </span>
                            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--text-muted)' }}>
                              <img src={location} width="15" height="15" alt="location" /> {match.venue}
                            </span>
                            <button
                              className="match-expand-btn"
                              onClick={() => setOpenMatchId(isOpen ? null : match.id)}
                            >
                              {isOpen ? 'HIDE ▴' : 'DETAILS ▾'}
                            </button>
                          </div>
                        </div>

                        {/* Expandable details */}
                        {isOpen && (
                          <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border)', paddingTop:'16px', display:'flex', gap:'24px', flexWrap:'wrap' }}>

                            {/* Scorers */}
                            <div style={{ flex:1, minWidth:'200px' }}>
                              <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--gold)', letterSpacing:'0.1em', marginBottom:'8px' }}>SCORERS</div>
                              {match.goals?.length > 0 ? match.goals.map((g, i) => (
                                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid var(--border)', fontSize:'0.82rem', color:'var(--ivory-d)' }}>
                                  <span>⚽ {g.player_name} <small style={{color:'var(--text-muted)'}}>({g.team})</small></span>
                                  <span className="goal-min">{g.minute}'</span>
                                </div>
                              )) : <div style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>No goals</div>}
                            </div>

                            {/* MOTM */}
                            {match.motm && (
                              <div style={{ minWidth:'160px' }}>
                                <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--gold)', letterSpacing:'0.1em', marginBottom:'8px' }}>MAN OF THE MATCH</div>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                  <span style={{ fontSize:'1.2rem' }}>⭐</span>
                                  <span style={{ color:'var(--ivory)', fontSize:'0.9rem', fontWeight:600 }}>{match.motm}</span>
                                </div>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </>
          )}

        </section>
      </div>
      <Footer/>
    </>
  );
}