import React, { useState, useEffect } from 'react';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../utils/api.js';
import '../assets/css/global.css';
import '../assets/css/tournaments.css';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useTilt             from '../hooks/useTilt';
import usePageLoader       from '../hooks/usePageLoader';
import { Link } from 'react-router-dom';
import calender from '../assets/icons/calendar.svg';
import location from '../assets/icons/location.png';
import { Helmet } from "react-helmet-async";

const FILTERS = [
  { label:'All',         value:'all'       },
  { label:'Champions',   value:'champions' },
  { label:'Runners Up',  value:'runners'   },
  { label:'Semi-Finals', value:'semis'     },
];

const RESULT_BADGE = {
  champions: { cls:'badge-gold',   label:'Champions'    },
  runners:   { cls:'badge-draw',   label:'Runners Up'   },
  semis:     { cls:'badge-violet', label:'Semi-Finals'  },
  quarters:  { cls:'badge-violet', label:'Quarter Finals'},
};

const RESULT_BAR = {
  champions:'champions-bar', runners:'runners-bar', semis:'semis-bar', quarters:'semis-bar',
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

export default function Tournaments() {
  usePageLoader();  ; useTilt();

  const [tournaments,  setTournaments]  = useState([]);
  const [partners,     setPartners]     = useState([]);
  const [totalTitles,  setTotalTitles]  = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useRepeatReveal([tournaments]);
  useCounterAnimation([tournaments, totalTitles]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true); setError(null);
        const [tourData, clubData] = await Promise.all([
          api.tournaments(activeFilter),
          api.club(),
        ]);
        setTournaments(tourData);
        setPartners(clubData.partners || []);
        if (activeFilter === 'all')
          setTotalTitles(tourData.filter(t => t.result === 'champions').length);
      } catch { setError('Failed to load tournament data.'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [activeFilter]);

  return (
    <>
      <Helmet>
        <title>Tournaments | Golden Rock FC</title>

        <meta
          name="description"
          content="Browse football tournaments, fixtures, standings, match schedules, participating clubs, and tournament results on Golden Rock FC."
        />

        <meta
          name="keywords"
          content="football tournaments, tournament fixtures, football standings, tournament schedules, tournament results"
        />

        <meta
          property="og:title"
          content="Tournaments | Golden Rock FC"
        />

        <meta
          property="og:description"
          content="Explore football tournaments, standings, fixtures, and tournament results."
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
          href="https://goldenrockfc.onrender.com/tournament"
        />
      </Helmet>
      
      <div className="page-loader" id="loader"><div className="loader-logo">GOLDEN ROCK FC</div><div className="loader-bar"><div className="loader-bar-fill"/></div></div>
      <div className="bg-mesh"/><div className="bg-grain"/>
      <Navbar/>
      <div className="page-wrapper">

        {/* Hero Banner */}
        <div className="tournament-hero-banner">
          <div className="tournament-hero-content">
            <div data-reveal>
              <span className="section-eyebrow">Our Legacy</span>
              <h1 className="section-title">Tournament <span>History</span></h1>
              <p className="section-subtitle">Celebrating our legacy on the pitch. From local cups to regional titles.</p>
            </div>
            <div className="titles-badge tilt-card" data-reveal data-delay="150">
              <span className="titles-icon">🏆</span>
              <span className="titles-count" data-count={totalTitles}>0</span>
              <span className="titles-label">Titles Won</span>
            </div>
          </div>
        </div>

        <section className="section">

          {/* Filters */}
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

          <div className="past-campaigns-header" data-reveal>
            <span className="section-eyebrow">Archive</span>
            <h2 className="section-title" style={{fontSize:'1.8rem'}}>Past <span>Campaigns</span></h2>
          </div>

          {error && <p style={{ color:'#f87171', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:'0.8rem', padding:'12px' }}>⚠ {error}</p>}

          {/* Tournament Cards */}
          <div className="tournament-cards-grid">
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="card" style={{padding:'20px', display:'flex', flexDirection:'column', gap:'12px'}}>
                  <Skeleton height="14px" width="40%"/><Skeleton height="20px" width="70%"/><Skeleton height="14px" width="60%"/><Skeleton height="40px"/>
                </div>
              ))
            ) : tournaments.length > 0 ? (
              tournaments.map((t, idx) => {
                const badge  = RESULT_BADGE[t.result] || RESULT_BADGE.semis;
                const barCls = RESULT_BAR[t.result]   || 'semis-bar';
                return (
                  <div key={t.id} className="tournament-card card tilt-card" data-reveal data-delay={idx * 100}>
                    <div className={`tc-status-bar ${barCls}`}/>
                    <div className="tc-header">
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      {t.result === 'champions' && <span className="tc-trophy">🏆</span>}
                    </div>
                    <h3 className="tc-title">{t.name}</h3>
                    <div className="tc-dates"><img src={calender} width="15" height="15" alt="calendar" /> {t.dates} · <img src={location} width="15" height="15" alt="location" /> {t.venue}</div>
                    <div className="tc-stats">
                      <div><span data-count={t.total_teams}>0</span><small>Teams</small></div>
                      <div><span data-count={t.total_matches}>0</span><small>Matches</small></div>
                      <div><span data-count={t.total_goals}>0</span><small className="gold-text">Goals</small></div>
                    </div>
                    {t.tournament_squads?.length > 0 && (
                      <div className="tc-squad">
                        <span className="tc-squad-label">Tournament Squad</span>
                        <div className="tc-squad-avatars">
                          {t.tournament_squads.map((s, i) => (
                            <div className="tsa" key={i} title={s.player_name}>{s.player_initials}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* View Details → goes to tournament detail page */}
                    <Link
                      to={`/tournament/${t.id}`}
                      className="btn btn-outline"
                      style={{ width:'90%', justifyContent:'center', marginTop:'12px' }}
                    >
                      View Tournament Details →
                    </Link>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>
                No tournaments found.
              </div>
            )}
          </div>

          <div className="divider" style={{margin:'0 0 60px'}}/>

          {/* Partners */}
          <div data-reveal>
            <span className="section-eyebrow">Network</span>
            <h2 className="section-title" style={{fontSize:'1.8rem'}}>Friendly <span>Partners</span></h2>
            <p className="section-subtitle">Fellow clubs and friendly rivals we compete with outside official tournaments.</p>
          </div>

          <div className="partners-grid" data-reveal data-delay="100">
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="card" style={{padding:'16px', display:'flex', gap:'12px', alignItems:'center'}}>
                  <Skeleton height="44px" width="44px" style={{borderRadius:'50%'}}/><Skeleton height="16px" width="55%"/>
                </div>
              ))
            ) : partners.length > 0 ? (
              partners.map(p => (
                <div className="partner-card card" key={p.id}>
                  <div className="partner-badge" style={p.badge_bg ? {background:p.badge_bg} : {}}>{p.initials}</div>
                  <div>
                    <strong>{p.name}</strong>
                    <span>Last met: {new Date(p.last_met).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                  </div>
                  <Link to={`/partner/${p.id}`} className="btn btn-outline" style={{ padding:'6px 14px', fontSize:'0.65rem', marginLeft:'auto' }}>View</Link>
                </div>
              ))
            ) : (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px', color:'var(--text-muted)', fontSize:'0.8rem' }}>No partners added yet.</div>
            )}
          </div>

        </section>
      </div>
      <Footer/>
    </>
  );
}