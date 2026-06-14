import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import "../assets/css/home.css";
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import useScrollReveal    from '../hooks/useScrollReveal';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useProgressBar     from '../hooks/useProgressBar';
import useTilt            from '../hooks/useTilt';
import usePageLoader      from '../hooks/usePageLoader';

import location from '../assets/icons/location.png';
import calender from '../assets/icons/calendar.svg';
import { Helmet } from "react-helmet-async";

import img1 from '../assets/images/img1.jpeg';
import img2 from '../assets/images/img2.jpeg';
import img3 from '../assets/images/img3.jpeg';
import img4 from '../assets/images/img4.jpeg';

const SLIDES = [
  { bg: 'linear-gradient(135deg,#0a0810 0%,#3A0F5E 40%,#5C1A8A 70%,#C9980A 100%)', img: img4 },
  { bg: 'linear-gradient(135deg,#0a0810,#1a0a2e,#5C1A8A)',                          img: img1 },
  { bg: 'linear-gradient(135deg,#0a0810,#2a1a00,#8A6607)',                          img: img2 },
  { bg: 'linear-gradient(135deg,#0a0810,#3A0F5E,#1a3a1a)',                          img: img3 },
  { bg: 'linear-gradient(135deg,#0a0810,#5C1A8A,#C9980A)',                          img: img4 },
];

const GALLERY_ITEMS = [
  {
    cls: 'large', cap: 'Match Day Victory', delay: 0,
    images: [
      'https://cdn.britannica.com/72/273872-050-464E077C/Royal-Challengers-Bengaluru-Team-Celebrate-Victory-In-2025-IPL-Final-Match-Against-Punjab-Kings-In-Ahmedabad.jpg',
      'https://www.mumbaiindians.com/static-assets/waf-images/83/60/4a/4-3/592-444/C3p3FQ8cRU.png',
      
    ],
  },
  {
    cls: '', cap: 'Training Ground', delay: 80,
    images: [
      '/images/img1.jpg',
      '../assets/images/img2.jpg',
    ],
  },
  {
    cls: '', cap: 'Team Spirit', delay: 160,
    images: [
      'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=600&q=80',
      'https://images.unsplash.com/photo-1540747913346-19212a4b423d?w=600&q=80',
    ],
  },
  {
    cls: '', cap: 'Trophy Lift', delay: 240,
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
      'https://images.unsplash.com/photo-1551958219-acbc595d9e2d?w=600&q=80',
    ],
  },
  {
    cls: '', cap: 'Stadium Atmosphere', delay: 320,
    images: [
      'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
    ],
  },
  {
    cls: '', cap: 'Goal Celebration', delay: 400,
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
      'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=600&q=80',
    ],
  },
];

const Skeleton = ({ width = '100%', height = '20px', style = {} }) => (
  <div style={{
    width, height, borderRadius: '6px',
    background: 'linear-gradient(90deg,var(--bg-card) 25%,rgba(255,255,255,0.05) 50%,var(--bg-card) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...style,
  }} />
);

const GalleryItem = ({ item, onOpen }) => {
  const [imgIndex,  setImgIndex]  = useState(0);
  const [nextIndex, setNextIndex] = useState(1 % item.images.length);
  const [fading,    setFading]    = useState(false);

  useEffect(() => {
    if (item.images.length <= 1) return;

    const interval = setInterval(() => {
      setFading(true);

      setTimeout(() => {
        setImgIndex(i  => (i + 1) % item.images.length);
        setNextIndex(i => (i + 1) % item.images.length);
        setFading(false);
      }, 800);

    }, 3000);

    return () => clearInterval(interval);
  }, [item.images.length]);

  return (
    <div
      className={`gallery-item${item.cls ? ' ' + item.cls : ''} tilt-card`}
      data-reveal
      data-delay={item.delay}
      onClick={() => onOpen(item.images[imgIndex], item.cap)}
      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      <div
        className="gallery-img"
        style={{
          backgroundImage: `url('${item.images[imgIndex]}')`,
          position: 'absolute', inset: 0,
          transition: 'opacity 0.8s ease',
          opacity: fading ? 0 : 1,
        }}
      />

      <div
        className="gallery-img"
        style={{
          backgroundImage: `url('${item.images[nextIndex]}')`,
          position: 'absolute', inset: 0,
          transition: 'opacity 0.8s ease',
          opacity: fading ? 1 : 0,
        }}
      />

      <div className="gallery-overlay" style={{ position: 'relative', zIndex: 2 }}>
        <span>{item.cap}</span>
      </div>
    </div>
  );
};


export default function Home() {
  usePageLoader();
  
  useCounterAnimation();
  useProgressBar();
  useTilt();

  const [homeData, setHomeData] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  useScrollReveal([homeData]);

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

  const [current, setCurrent] = useState(0);
  const timerRef    = useRef(null);
  const touchStartX = useRef(0);

  const startAuto = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
  }, []);

  useEffect(() => {
    startAuto();
    return () => clearInterval(timerRef.current);
  }, [startAuto]);

  const navigate = dir => {
    clearInterval(timerRef.current);
    setCurrent(c => (c + dir + SLIDES.length) % SLIDES.length);
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
  };

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
        this.x  = Math.random() * W; this.y  = H + 10;
        this.vy = -(Math.random() * 0.8 + 0.3); this.vx = (Math.random() - 0.5) * 0.4;
        this.r  = Math.random() * 2.5 + 0.5;
        this.c  = colors[Math.floor(Math.random() * colors.length)];
        this.a  = Math.random() * 0.6 + 0.2;
      }
      update() { this.x += this.vx; this.y += this.vy; this.a -= 0.0012; if (this.y < -10 || this.a <= 0) this.reset(); }
      draw()   { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fillStyle = this.c + this.a + ')'; ctx.fill(); }
    }
    for (let i = 0; i < 80; i++) { const p = new Particle(); p.y = Math.random() * H; particles.push(p); }
    const tick = () => { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.update(); p.draw(); }); raf = requestAnimationFrame(tick); };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  const [lightbox, setLightbox] = useState({ open: false, src: '', caption: '' });
  const openLightbox  = (src, caption) => { setLightbox({ open: true, src, caption }); document.body.style.overflow = 'hidden'; };
  const closeLightbox = ()             => { setLightbox({ open: false, src: '', caption: '' }); document.body.style.overflow = ''; };
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape' && lightbox.open) closeLightbox(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [lightbox.open]);

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

  return (
    <>
      <Helmet>
        <title>Home | Golden Rock FC</title>
        <meta
          name="description"
          content="Golden Rock FC is a football management platform to track matches, tournaments, clubs, player statistics, and daily football updates."
        />
        <meta
          name="keywords"
          content="football platform, football management, player statistics, football tournaments, football matches, football clubs"
        />
        <meta
          property="og:title"
          content="Golden Rock FC"
        />

        <meta
          property="og:description"
          content="Football management platform for matches, tournaments, clubs, and player statistics."
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
          href="https://goldenrockfc.onrender.com/"
        />
      </Helmet>


      <div className="page-loader" id="loader">
        <div className="loader-logo">GOLDEN ROCK FC</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>
      <div className="bg-mesh" /><div className="bg-grain" />

      <Navbar />

      <div className="page-wrapper">

        {/* ══ HERO  */}
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
              {SLIDES.map((_, i) => (
                <button key={i} className={`dot${i === current ? ' active' : ''}`} onClick={() => navigate(i - current)} />
              ))}
            </div>
            <button className="slide-arrow prev" onClick={() => navigate(-1)}>‹</button>
            <button className="slide-arrow next" onClick={() => navigate(1)}>›</button>
          </div>

          <div className="hero-content" ref={heroContentRef}>
            <div className="hero-text" style={{
                width: 'fit-content', 
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                padding: '30px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.12)'
              }}>
              
              <h1 className="hero-title">
                <span className="hero-title-line1 animate-fade-up" style={{ animationDelay: '0.1s' }}>GOLDEN</span>
                <span className="hero-title-line2 animate-fade-up" style={{ animationDelay: '0.2s' }}>ROCK FC</span>
              </h1>
              <p className="hero-desc animate-fade-up" style={{ animationDelay: '0.35s' }}>
                Forging legends in the heart of Thunder City.<br />
                <em>Experience the roar of victory and the strike of excellence.</em>
              </p>
              <div className="hero-actions animate-fade-up" style={{ animationDelay: '0.5s' }}>
                <Link to="/matches" className="btn btn-primary">View Match Center</Link>
                <Link to="/club"    className="btn btn-outline">The Club</Link>
              </div>
            </div>
            
          </div>  
        </section>

        {/* ══ STATS ═════════════════════════════════════════ */}
        <section className="section stats-section">
          <div className="stats-grid">
            {STATS.map(({ icon, count, label, delay }) => (
              <div key={label} className="stat-card tilt-card" data-reveal data-delay={delay} style={{ height: '150px' }}>
                <span className="stat-icon"></span>
                {loading
                  ? <Skeleton height="40px" width="80px" style={{ margin: '8px auto' }} />
                  : <span className="stat-number" data-count={count}>{count}</span>
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
            <Link to="/matches" className="btn btn-outline" style={{ alignSelf: 'flex-end' }}>All Match Archives →</Link>
          </div>

          {error && (
            <p style={{ color: '#f87171', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '12px' }}>
              ⚠ {error}
            </p>
          )}

          <div className="match-center-grid" key={lastMatch?.id || 'empty'}>
            <div className="match-result-card card tilt-card" data-reveal data-delay="100">
              {loading ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Skeleton height="14px" width="50%" />
                  <Skeleton height="60px" />
                  <Skeleton height="14px" width="70%" />
                </div>
              ) : lastMatch ? (
                <>
                  
                  <div className="match-meta">
                    <span><img src={calender} width="15" height="15" alt="calendar" /> {new Date(lastMatch.date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'short', year:'numeric' })}</span>
                    <span><img src={location} width="15" height="15" alt="location" /> {lastMatch.venue}</span>
                    <span className={`badge badge-${lastMatch.result}`}>{lastMatch.result.toUpperCase()}</span>

                    {lastMatch.match_type === 'internal'   && <span className="badge badge-violet">⚡ Internal</span>}
                    {lastMatch.match_type === 'external'   && <span className="badge badge-gold">🏟 External</span>}
                    {lastMatch.match_type === 'friendly'   && <span className="badge badge-win">🤝 Friendly</span>}
                    {lastMatch.match_type === 'tournament' && <span className="badge badge-loss">🏆 Tournament</span>}

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
                          <span>{g.player_name}</span>
                          <span className="goal-min">{g.minute}'</span>
                        </div>
                      ))}
                    </div>
                    {lastMatch.appearances?.find(a => a.is_motm) && (
                      <div className="motm-card">
                        <span className="motm-label">⭐ MAN OF THE MATCH</span>
                        <strong className="motm-name">
                          {lastMatch.appearances.find(a => a.is_motm)?.player_name}
                        </strong>
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
                        <span data-count={total_goals}>{total_goals}</span><small>GOALS</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No scorer data yet.
                  </div>
                )}
              </div>
              <Link to="/players" className="btn btn-outline" style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}>
                View Full Squad →
              </Link>
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
            {GALLERY_ITEMS.map(item => (
              <GalleryItem key={item.cap} item={item} onOpen={openLightbox} />
            ))}
          </div>

          <div
            className={`lightbox${lightbox.open ? ' open' : ''}`}
            onClick={e => e.target === e.currentTarget && closeLightbox()}
          >
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>
            <img src={lightbox.src} alt={lightbox.caption} />
            <div className="lightbox-caption">{lightbox.caption}</div>
          </div>
        </section>

        <div className="divider" />

        

      </div>
      <Footer />
    </>
  );
}
