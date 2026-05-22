import React, { useState, useEffect, useRef } from 'react';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../utils/api.js';
import '../assets/css/global.css';
import '../assets/css/players.css';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useTilt             from '../hooks/useTilt';
import usePageLoader       from '../hooks/usePageLoader';
import { Link } from 'react-router-dom';


const useFloatCounter = (deps = []) => {
  useEffect(() => {
    const els = document.querySelectorAll('[data-count-float]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = parseFloat(el.dataset.countFloat);
        const dur = 1600, start = performance.now();
        const tick = now => {
          const p = Math.min((now-start)/dur, 1), ease = p<0.5?2*p*p:-1+(4-2*p)*p;
          el.textContent = (ease*target).toFixed(1);
          if (p<1) requestAnimationFrame(tick); else el.textContent = target.toFixed(1);
        };
        requestAnimationFrame(tick); obs.unobserve(e.target);
      });
    }, { threshold:0.5 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, deps);
};

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

const Skeleton = ({ width='100%', height='20px', style={} }) => (
  <div style={{ width, height, borderRadius:'6px', background:'linear-gradient(90deg,var(--bg-card) 25%,rgba(255,255,255,0.05) 50%,var(--bg-card) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite', ...style }}/>
);

const RANK_STYLE = ['gold','silver','bronze'];

/* ── Honours Card with expandable full ranking ───────────── */
const HonoursCard = ({ title, badge, items, statKey, statLabel, loading }) => {
  const [expanded, setExpanded] = useState(false);
  const displayItems = expanded ? items : items.slice(0, 3);

  return (
    <div className="honours-card card" data-reveal>
      <div className="honours-card-header">
        <span>{title}</span>
        {badge
          ? <span className="badge badge-gold">{badge}</span>
          : <button
              className="btn btn-outline"
              style={{ padding:'6px 14px', fontSize:'0.65rem' }}
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? 'Show Less ▴' : 'View Full Rankings →'}
            </button>
        }
      </div>

      <div className="honours-list">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} style={{ padding:'12px', display:'flex', gap:'10px', alignItems:'center' }}>
              <Skeleton height="32px" width="32px" style={{borderRadius:'50%'}}/>
              <Skeleton height="14px" width="55%"/>
              <Skeleton height="20px" width="30px" style={{marginLeft:'auto'}}/>
            </div>
          ))
        ) : items.length > 0 ? (
          displayItems.map((item, idx) => (
            <div key={item.id} className={`honour-item rank-${RANK_STYLE[idx] || ''}`}>
              <span className="h-rank">{idx + 1}</span>
              <div className="h-avatar">{item.initials}</div>
              <div className="h-info">
                <strong>{item.name}</strong>
                <span>{item.position} · #{item.number}</span>
              </div>
              <div className="h-stat">
                <span data-count={item[statKey]}>0</span>
                <small>{statLabel}</small>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding:'16px', textAlign:'center', color:'var(--text-muted)', fontSize:'0.8rem' }}>No data yet.</div>
        )}
      </div>

      {/* Full ranking button shown below list too for easy toggle */}
      {!badge && items.length > 3 && (
        <button
          className="btn btn-outline"
          style={{ width:'100%', justifyContent:'center', marginTop:'12px', fontSize:'0.72rem' }}
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? `Show Top 3 ▴` : `Show All ${items.length} Players ▾`}
        </button>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PLAYERS COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Players() {
  usePageLoader();    useTilt();

  const [players,     setPlayers]     = useState([]);
  const [allPlayers,  setAllPlayers]  = useState([]); // unfiltered for search
  const [honours,     setHonours]     = useState({ top_scorers:[], top_assists:[], top_motm:[] });
  const [snapshot,    setSnapshot]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState('');
  const [visibleCount,setVisibleCount]= useState(8);
  const [loadState,   setLoadState]   = useState('idle');
  const searchRef = useRef(null);

  useCounterAnimation([players, honours, snapshot]);
  
  useRepeatReveal([players]);
  useFloatCounter([snapshot]);
  
// Add this inside the Players component, after all other hooks:
useEffect(() => {
  if (loading || players.length === 0) return;

  // Small delay to ensure DOM has updated after React render
  const timer = setTimeout(() => {
    document.querySelectorAll('[data-assist-count]').forEach(el => {
      const target = parseInt(el.dataset.assistCount, 10) || 0;
      el.textContent = target; // just set directly, no animation needed
    });
  }, 200);

  return () => clearTimeout(timer);
}, [loading, players]);


  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [p, h, s] = await Promise.all([api.players(), api.honours(), api.snapshot()]);
        setPlayers(p); setAllPlayers(p); setHonours(h); setSnapshot(s);
      } catch { setError('Failed to load data.'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  // Client-side search filter
  useEffect(() => {
    if (!search.trim()) { setPlayers(allPlayers); return; }
    const q = search.toLowerCase();
    setPlayers(allPlayers.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.nickname || '').toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q) ||
      String(p.number).includes(q)
    ));
    setVisibleCount(8);
  }, [search, allPlayers]);

  const visiblePlayers = players.slice(0, visibleCount);
  const goalsPerGame   = snapshot ? (snapshot.total_goals/(snapshot.total_matches||1)).toFixed(1) : '0.0';

  return (
    <>
      <Helmet>
        <title>Players | Golden Rock FC</title>

        <meta
          name="description"
          content="Explore football player statistics, performance records, rankings, goals, assists, and match history on Golden Rock FC."
        />

        <meta
          name="keywords"
          content="football players, player statistics, goals, assists, football rankings, player performance"
        />

        <meta
          property="og:title"
          content="Players | Golden Rock FC"
        />

        <meta
          property="og:description"
          content="View football player statistics, rankings, goals, assists, and performance details."
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
          href="https://goldenrockfc.onrender.com/players"
        />
      </Helmet>
      
      <div className="page-loader" id="loader"><div className="loader-logo">GOLDEN ROCK FC</div><div className="loader-bar"><div className="loader-bar-fill"/></div></div>
      <div className="bg-mesh"/><div className="bg-grain"/>
      <Navbar/>
      <div className="page-wrapper">
        <section className="section">

          {/* Honours Board Header */}
          <div className="honours-board" data-reveal>
            <div className="honours-header">
              <span className="section-eyebrow">Elite Performers</span>
              <h1 className="section-title">Honours <span>Board</span></h1>
              <p className="section-subtitle">Overall statistics across all matches played.</p>
            </div>
          </div>

          {error && <p style={{ color:'#f87171', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:'0.8rem', padding:'12px' }}>⚠ {error}</p>}

          {/* Three Honours Cards — Top Scorers, Assists, MOTM */}
          <div className="honours-grid" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <HonoursCard
              title="🏆 TOP SCORERS"
              items={honours.top_scorers}
              statKey="total_goals"
              statLabel="GOALS"
              loading={loading}
            />
            <HonoursCard
              title="🎯 TOP ASSISTS"
              items={honours.top_assists}
              statKey="total_assists"
              statLabel="ASSISTS"
              loading={loading}
            />
            <HonoursCard
              title="⭐ MAN OF THE MATCH"
              badge=""
              items={honours.top_motm}
              statKey="total_motm"
              statLabel="AWARDS"
              loading={loading}
            />
          </div>

          <div className="divider" style={{margin:'40px 0'}}/>

          {/* Squad Profiles Header + Search */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'16px', marginBottom:'24px' }} data-reveal>
            <div>
              <span className="section-eyebrow">Full Roster</span>
              <h2 className="section-title">Squad <span>Profiles</span></h2>
            </div>

            {/* Search bar */}
            <div style={{ position:'relative', minWidth:'240px' }}>
              
              <input
                ref={searchRef}
                type="text"
                placeholder="Search players by name, position…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width:'100%', paddingLeft:'36px', paddingRight:'12px',
                  paddingTop:'10px', paddingBottom:'10px',
                  background:'var(--bg-card)', border:'1px solid var(--border)',
                  borderRadius:'8px', color:'var(--ivory)',
                  fontFamily:'var(--font-mono)', fontSize:'0.75rem',
                  outline:'none', transition:'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.9rem' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Search result count */}
          {search && !loading && (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:'16px', letterSpacing:'0.1em' }}>
              {players.length} result{players.length !== 1 ? 's' : ''} for "{search}"
            </div>
          )}

          {/* Squad Grid */}
          <div className="squad-profiles-grid">
            {loading ? (
              [1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="player-card card" style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>
                  <Skeleton height="60px" width="60px" style={{borderRadius:'50%', margin:'0 auto'}}/>
                  <Skeleton height="12px" width="50%" style={{margin:'0 auto'}}/>
                  <Skeleton height="16px" width="70%" style={{margin:'0 auto'}}/>
                </div>
              ))
            ) : visiblePlayers.length > 0 ? (
              visiblePlayers.map((p, idx) => (
                <Link
                  key={p.id}
                  to={`/player-profile/${p.id}`}
                  className={`player-card card tilt-card${p.is_featured ? ' featured' : ''}`}
                  data-reveal
                  data-delay={idx * 60}
                >
                  <div className="player-card-bg" style={{ background: p.avatar_bg || 'linear-gradient(135deg,rgba(92,26,138,0.2),rgba(201,152,10,0.1))' }}/>
                  <div className={`player-avatar-frame${p.is_featured ? ' gold' : ''}`}>{p.initials}</div>
                  <span className="player-position">{p.position}</span>
                  <h4>{p.name}</h4>
                  <span className="player-number">#{p.number}</span>
                  {p.role_tag && <span className={`player-role-tag${p.is_featured ? ' gold-tag' : ''}`}>{p.role_tag}</span>}
                  <div className="player-stats-row">
                    <div><span >{p.total_appearances||0}</span><small>MAT</small></div>
                    <div><span >{p.total_goals||0}</span><small>GLS</small></div>
                    <div><span data-assist-count={p.total_assists||0}>{p.total_assists||0}</span><small>AST</small></div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>
                {search ? `No players found for "${search}".` : 'No players found. Add players via the admin panel.'}
              </div>
            )}
          </div>

          {/* Showing count + Load More */}
          {!loading && players.length > 0 && (
            <div style={{ textAlign:'center', marginTop:'14px', fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--text-muted)', letterSpacing:'0.12em' }} data-reveal>
              Showing {Math.min(visibleCount, players.length)} of {players.length} squad members
            </div>
          )}

          {!loading && visibleCount < players.length && (
            <div style={{ textAlign:'center', marginTop:'16px' }} data-reveal>
              <button
                className="btn btn-primary"
                onClick={() => { setLoadState('loading'); setTimeout(() => { setVisibleCount(players.length); setLoadState('done'); }, 800); }}
                disabled={loadState === 'loading'}
                style={{ opacity: loadState === 'done' ? 0.4 : 1 }}
              >
                {loadState === 'idle'    && 'Load More Players'}
                {loadState === 'loading' && 'Loading…'}
                {loadState === 'done'    && 'All Players Loaded'}
              </button>
            </div>
          )}

          

        </section>
      </div>
      <Footer/>
    </>
  );
}