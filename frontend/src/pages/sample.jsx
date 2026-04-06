import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../../../backend/api/api.js';
import '../assets/css/global.css';
import '../assets/css/home.css';
import useScrollReveal    from '../hooks/useScrollReveal';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useProgressBar     from '../hooks/useProgressBar';
import useTilt            from '../hooks/useTilt';
import usePageLoader      from '../hooks/usePageLoader';

/* ── Static slideshow data ───────────────────────────────── */
const SLIDES = [
  { bg: 'linear-gradient(135deg,#0a0810 0%,#3A0F5E 40%,#5C1A8A 70%,#C9980A 100%)', img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600&q=80' },
  { bg: 'linear-gradient(135deg,#0a0810,#1a0a2e,#5C1A8A)',                          img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=80' },
  { bg: 'linear-gradient(135deg,#0a0810,#2a1a00,#8A6607)',                          img: 'https://images.unsplash.com/photo-1540747913346-19212a4b423d?w=1600&q=80' },
  { bg: 'linear-gradient(135deg,#0a0810,#3A0F5E,#1a3a1a)',                          img: 'https://images.unsplash.com/photo-1551958219-acbc595d9e2d?w=1600&q=80'  },
  { bg: 'linear-gradient(135deg,#0a0810,#5C1A8A,#C9980A)',                          img: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&q=80' },
];

const GALLERY_ITEMS = [
  { cls: 'large', img: 'https://images.unsplash.com/photo-1551958219-acbc595d9e2d?w=800&q=80',   cap: 'Match Day Victory',  delay: 0   },
  { cls: '',      img: 'https://images.unsplash.com/photo-1484482340112-e1e2682b4856?w=600&q=80', cap: 'Training Ground',    delay: 80  },
  { cls: '',      img: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=600&q=80', cap: 'Team Spirit',        delay: 160 },
  { cls: '',      img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80', cap: 'Trophy Lift 2023',   delay: 240 },
  { cls: '',      img: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&q=80', cap: 'Stadium Atmosphere', delay: 320 },
  { cls: '',      img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80', cap: 'Goal Celebration',   delay: 400 },
  
];

/* ── Skeleton loader ─────────────────────────────────────── */
const Skeleton = ({ width = '100%', height = '20px', style = {} }) => (
  <div style={{
    width, height, borderRadius: '6px',
    background: 'linear-gradient(90deg,var(--bg-card) 25%,rgba(255,255,255,0.05) 50%,var(--bg-card) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...style,
  }} />
);

/* ═══════════════════════════════════════════════════════════
   HOME COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Home() {
  usePageLoader();
  
  useScrollReveal();
  useCounterAnimation();
  useProgressBar();
  useTilt();

  /* ── API state ─────────────────────────────────────────── */
  const [homeData, setHomeData] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [home, snap] = await Promise.all([api.home(), api.snapshot()]);
        setHomeData(home);
        setSnapshot(snap);
      } catch (err) {
        setError('Failed to load data. Make sure the Django server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* ── Slideshow ─────────────────────────────────────────── */
  const [current, setCurrent] = useState(0);
  const timerRef    = useRef(null);
  const touchStartX = useRef(0);

  const startAuto = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
  }, []);

  useEffect(() => { startAuto(); return () => clearInterval(timerRef.current); }, [startAuto]);

  const navigate = dir => {
    clearInterval(timerRef.current);
    setCurrent(c => (c + dir + SLIDES.length) % SLIDES.length);
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
  };

  /* ── Parallax ──────────────────────────────────────────── */
  const heroContentRef = useRef(null);
  useEffect(() => {
    const fn = () => {
      const el = heroContentRef.current;
      if (!el) return;
      const y = window.scrollY;
      el.style.transform = `translateY(${y * 0.35}px)`;
      el.style.opacity   = Math.max(0, 1 - y / 500);
    };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ── Particles ─────────────────────────────────────────── */
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let W, H, particles = [], raf;
    const resize = () => { W = canvas.width = hero.offsetWidth; H = canvas.height = hero.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const colors = ['rgba(201,152,10,', 'rgba(92,26,138,', 'rgba(240,236,216,'];
    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W; this.y = H + 10;
        this.vy = -(Math.random() * 0.8 + 0.3); this.vx = (Math.random() - 0.5) * 0.4;
        this.r = Math.random() * 2.5 + 0.5;
        this.c = colors[Math.floor(Math.random() * colors.length)];
        this.a = Math.random() * 0.6 + 0.2;
      }
      update() { this.x += this.vx; this.y += this.vy; this.a -= 0.0012; if (this.y < -10 || this.a <= 0) this.reset(); }
      draw()   { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fillStyle = this.c + this.a + ')'; ctx.fill(); }
    }
    for (let i = 0; i < 80; i++) { const p = new Particle(); p.y = Math.random() * H; particles.push(p); }
    const tick = () => { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.update(); p.draw(); }); raf = requestAnimationFrame(tick); };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  /* ── Lightbox ──────────────────────────────────────────── */
  const [lightbox, setLightbox] = useState({ open: false, src: '', caption: '' });
  const openLightbox  = (src, caption) => { setLightbox({ open: true, src, caption }); document.body.style.overflow = 'hidden'; };
  const closeLightbox = ()             => { setLightbox({ open: false, src: '', caption: '' }); document.body.style.overflow = ''; };
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape' && lightbox.open) closeLightbox(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [lightbox.open]);

  /* ── Derived from API ──────────────────────────────────── */
  const seasonStats = homeData?.season_stats || {};
  const topScorers  = homeData?.top_scorers  || [];
  const lastMatch   = homeData?.last_match   || null;

  const STATS = [
    { icon: '👥', count: seasonStats.total_players || 0, label: 'Total Active Players', delay: 0   },
    { icon: '🛡️', count: seasonStats.total_matches || 0, label: 'Matches Played',       delay: 120 },
    { icon: '🏆', count: snapshot?.total_goals     || 0, label: 'Goals Scored',         delay: 240 },
  ];

  const SNAPSHOT_DATA = [
    { label: 'Goals Scored',    count: snapshot?.total_goals  || 0, width: snapshot?.total_goals  || 0, delay: 0,   suffix: ''  },
    { label: 'Clean Sheets',    count: snapshot?.clean_sheets || 0, width: snapshot?.clean_sheets || 0, delay: 100, suffix: ''  },
    { label: 'Win Rate',        count: snapshot?.win_rate     || 0, width: snapshot?.win_rate     || 0, delay: 200, suffix: '%' },
    { label: 'Avg. Possession', count: 62,                          width: 62,                          delay: 300, suffix: '%' },
  ];

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

        {/* ══ HERO ══════════════════════════════════════════ */}
        <section className="hero-section">
          <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:1, opacity:0.35 }} />
          <div className="hero-slideshow" id="heroSlideshow"
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1); }}
          >
            {SLIDES.map((s, i) => (
              <div key={i} className={`slide${i === current ? ' active' : ''}`} style={{ background: s.bg }}>
                <div className="slide-overlay" />
                <div className="slide-bg" style={{ backgroundImage: `url('${s.img}')` }} />
              </div>
            ))}
            <div className="slide-dots">
              {SLIDES.map((_, i) => <button key={i} className={`dot${i === current ? ' active' : ''}`} onClick={() => navigate(i - current)} />)}
            </div>
            <button className="slide-arrow prev" onClick={() => navigate(-1)}>‹</button>
            <button className="slide-arrow next" onClick={() => navigate(1)}>›</button>
          </div>

          <div className="hero-content" ref={heroContentRef}>
            <div className="hero-text">
              <span className="hero-est animate-fade-up">EST. 2008 · THUNDER CITY, TC</span>
              <h1 className="hero-title">
                <span className="hero-title-line1 animate-fade-up" style={{ animationDelay: '0.1s' }}>GOLDEN</span>
                <span className="hero-title-line2 animate-fade-up" style={{ animationDelay: '0.2s' }}>ROCK FC</span>
              </h1>
              <p className="hero-desc animate-fade-up" style={{ animationDelay: '0.35s' }}>
                Forging legends in the heart of Thunder City.<br />
                <em>Experience the roar of victory and the strike of excellence.</em>
              </p>
              <div className="hero-actions animate-fade-up" style={{ animationDelay: '0.5s' }}>
                <a href="/matches" className="btn btn-primary">View Match Center</a>
                <a href="/club"    className="btn btn-outline">The Club</a>
              </div>
            </div>
            
          </div>
        </section>

        {/* ══ STATS ═════════════════════════════════════════ */}
        <section className="section stats-section">
          <div className="stats-grid">
            {STATS.map(({ icon, count, label, delay }) => (
              <div key={label} className="stat-card tilt-card" data-reveal data-delay={delay}>
                <span className="stat-icon">{icon}</span>
                {loading
                  ? <Skeleton height="40px" width="80px" style={{ margin: '8px auto' }} />
                  : <span className="stat-number" data-count={count}>0</span>
                }
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ══ MATCH CENTER ══════════════════════════════════ */}
        <section className="section">
          <div className="section-header" data-reveal>
            <div>
              <span className="section-eyebrow">Latest Action</span>
              <h2 className="section-title">Match <span>Center</span></h2>
              <p className="section-subtitle">Keep up with the latest results and leaderboards</p>
            </div>
            <a href="/matches" className="btn btn-outline" style={{ alignSelf: 'flex-end' }}>All Match Archives →</a>
          </div>

          {error && (
            <p style={{ color: '#f87171', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '12px' }}>
              ⚠ {error}
            </p>
          )}

          <div className="match-center-grid">

            {/* Last match */}
            <div className="match-result-card card tilt-card" data-reveal data-delay="100">
              {loading ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Skeleton height="14px" width="50%" /><Skeleton height="60px" /><Skeleton height="14px" width="70%" />
                </div>
              ) : lastMatch ? (
                <>
                  <div className="match-meta">
                    <span>📅 {new Date(lastMatch.date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'short', year:'numeric' })}</span>
                    <span>📍 {lastMatch.venue}</span>
                    <span className={`badge badge-${lastMatch.result}`}>{lastMatch.result.toUpperCase()}</span>
                  </div>
                  <div className="match-score-row">
                    <div className="team home-team">
                      <div className="team-crest">⚽</div>
                      <span className="team-name">{lastMatch.home_team_name}</span>
                    </div>
                    <div className="match-score">
                      <span className="score-num">{lastMatch.home_score}</span>
                      <span className="score-sep">–</span>
                      <span className="score-num">{lastMatch.away_score}</span>
                    </div>
                    <div className="team away-team">
                      <div className="team-crest">🔵</div>
                      <span className="team-name">{lastMatch.away_team_name}</span>
                    </div>
                  </div>
                  <div className="match-details">
                    <div className="goals-list">
                      <div className="goals-header">Goalscorers</div>
                      {lastMatch.goals?.filter(g => !g.is_own_goal).map((g, i) => (
                        <div className="goal-item" key={i}>
                          <span>{g.player_name}</span><span className="goal-min">{g.minute}'</span>
                        </div>
                      ))}
                    </div>
                    {lastMatch.appearances?.find(a => a.is_motm) && (
                      <div className="motm-card">
                        <span className="motm-label">⭐ MAN OF THE MATCH</span>
                        <strong className="motm-name">{lastMatch.appearances.find(a => a.is_motm)?.player_name}</strong>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  No matches recorded yet.
                </div>
              )}
            </div>

            {/* Top scorers */}
            <div className="top-scorers-card card" data-reveal data-delay="200">
              <div className="card-header">
                <span>🏆 Top Scorers</span>
                <span className="badge badge-gold">This Season</span>
              </div>
              <div className="scorer-list">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} style={{ padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Skeleton height="36px" width="36px" style={{ borderRadius: '50%' }} />
                      <Skeleton height="16px" width="60%" />
                      <Skeleton height="20px" width="30px" style={{ marginLeft: 'auto' }} />
                    </div>
                  ))
                ) : topScorers.length > 0 ? (
                  topScorers.map(({ id, name, initials, position, total_goals }, idx) => (
                    <div key={id} className={`scorer-item rank-${idx + 1}`}>
                      <span className="scorer-rank">{idx + 1}</span>
                      <div className="scorer-avatar">{initials}</div>
                      <div className="scorer-info"><strong>{name}</strong><span>{position}</span></div>
                      <div className="scorer-goals">
                        <span data-count={total_goals}>0</span><small>GOALS</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No scorer data yet.
                  </div>
                )}
              </div>
              <a href="/players" className="btn btn-outline" style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}>
                View Full Squad →
              </a>
            </div>

          </div>
        </section>

        <div className="divider" />

        {/* ══ GALLERY ═══════════════════════════════════════ */}
        <section className="section gallery-section">
          <div className="section-header" data-reveal>
            <div>
              <span className="section-eyebrow">Club Gallery</span>
              <h2 className="section-title">Our <span>Moments</span></h2>
              <p className="section-subtitle">Capturing the passion, the pride, and the golden moments</p>
            </div>
          </div>
          <div className="gallery-grid">
            {GALLERY_ITEMS.map(({ cls, img, cap, delay }) => (
              <div key={cap} className={`gallery-item${cls ? ' ' + cls : ''} tilt-card`}
                data-reveal data-delay={delay} onClick={() => openLightbox(img, cap)} style={{ cursor: 'pointer' }}>
                <div className="gallery-img" style={{ backgroundImage: `url('${img}')` }} />
                <div className="gallery-overlay"><span>{cap}</span></div>
              </div>
            ))}
          </div>
          <div className={`lightbox${lightbox.open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && closeLightbox()}>
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>
            <img src={lightbox.src} alt={lightbox.caption} />
            <div className="lightbox-caption">{lightbox.caption}</div>
          </div>
        </section>

        <div className="divider" />

        {/* ══ SEASON SNAPSHOT ═══════════════════════════════ */}
        <section className="section snapshot-section">
          <div data-reveal>
            <span className="section-eyebrow">Season 2024/25</span>
            <h2 className="section-title">Season <span>Snapshot</span></h2>
          </div>
          <div className="snapshot-grid">
            {SNAPSHOT_DATA.map(({ label, count, width, delay, suffix }) => (
              <div key={label} className="snapshot-item" data-reveal data-delay={delay}>
                <div className="snapshot-label">{label}</div>
                <div className="snapshot-value">
                  {loading
                    ? <Skeleton height="36px" width="60px" />
                    : <><span data-count={count}>0</span>{suffix}</>
                  }
                </div>
                <div className="progress-bar"><div className="progress-fill" data-width={width} /></div>
              </div>
            ))}
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}