import { useState, useEffect, useRef, useCallback } from 'react';
import "../assets/css/home.css";
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import useScrollReveal    from '../hooks/useScrollReveal';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useProgressBar     from '../hooks/useProgressBar';
import useTilt            from '../hooks/useTilt';
import usePageLoader      from '../hooks/usePageLoader';

/* ── Data ─────────────────────────────────────────────────── */
const SLIDES = [
  {
    bg:  'linear-gradient(135deg,#0a0810 0%,#3A0F5E 40%,#5C1A8A 70%,#C9980A 100%)',
    img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600&q=80',
  },
  {
    bg:  'linear-gradient(135deg,#0a0810,#1a0a2e,#5C1A8A)',
    img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=80',
  },
  {
    bg:  'linear-gradient(135deg,#0a0810,#2a1a00,#8A6607)',
    img: 'https://images.unsplash.com/photo-1540747913346-19212a4b423d?w=1600&q=80',
  },
  {
    bg:  'linear-gradient(135deg,#0a0810,#3A0F5E,#1a3a1a)',
    img: 'https://images.unsplash.com/photo-1551958219-acbc595d9e2d?w=1600&q=80',
  },
  {
    bg:  'linear-gradient(135deg,#0a0810,#5C1A8A,#C9980A)',
    img: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&q=80',
  },
];

const STATS = [
  { icon: '👥', count: 42,  label: 'Total Active Players',  delay: 0   },
  { icon: '🛡️', count: 156, label: 'Matches Played',        delay: 120 },
  { icon: '🏆', count: 12,  label: 'Tournaments Entered',   delay: 240 },
];

const TOP_SCORERS = [
  { rank: 1, initials: 'MS', name: 'Marcus Silva',  pos: 'Forward / Striker', goals: 12 },
  { rank: 2, initials: 'JW', name: 'Jordan Webb',   pos: 'Forward / Striker', goals: 8  },
  { rank: 3, initials: 'LG', name: 'Leon Garet',    pos: 'Forward / Striker', goals: 7  },
];

const GALLERY_ITEMS = [
  { cls: 'large', img: 'https://images.unsplash.com/photo-1551958219-acbc595d9e2d?w=800&q=80',   cap: 'Match Day Victory', delay: 0   },
  { cls: '',      img: 'https://images.unsplash.com/photo-1484482340112-e1e2682b4856?w=600&q=80', cap: 'Training Ground',   delay: 80  },
  { cls: '',      img: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=600&q=80', cap: 'Team Spirit',       delay: 160 },
  { cls: '',      img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80', cap: 'Trophy Lift 2023',  delay: 240 },
  { cls: '',      img: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&q=80', cap: 'Stadium Atmosphere',delay: 320 },
  { cls: '',      img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80', cap: 'Goal Celebration',  delay: 400 },
  
];

const SNAPSHOT = [
  { label: 'Goals Scored',    count: 38, width: 76, delay: 0   },
  { label: 'Clean Sheets',    count: 12, width: 60, delay: 100 },
  { label: 'Win Rate',        count: 84, width: 84, delay: 200, suffix: '%' },
  { label: 'Avg. Possession', count: 62, width: 62, delay: 300, suffix: '%' },
];

/* ═══════════════════════════════════════════════════════════
   HOME COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Home() {
  /* ── Global hooks ──────────────────────────────────────── */
  usePageLoader();
  
  useScrollReveal();
  useCounterAnimation();
  useProgressBar();
  useTilt();

  /* ── Hero Slideshow ────────────────────────────────────── */
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const goTo = useCallback((n) => {
    setCurrent((prev) => {
      const next = ((n % SLIDES.length) + SLIDES.length) % SLIDES.length;
      return next;
    });
  }, []);

  const startAuto = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setCurrent((c) => (c + 1) % SLIDES.length),
      5000
    );
  }, []);

  useEffect(() => {
    startAuto();
    return () => clearInterval(timerRef.current);
  }, [startAuto]);

  /* ── Swipe support ─────────────────────────────────────── */
  const touchStartX = useRef(0);
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      goTo(dx < 0 ? current + 1 : current - 1);
      startAuto();
    }
  };

  /* ── Hero Parallax ─────────────────────────────────────── */
  const heroContentRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const el = heroContentRef.current;
      if (!el) return;
      const y = window.scrollY;
      el.style.transform = `translateY(${y * 0.35}px)`;
      el.style.opacity = Math.max(0, 1 - y / 500);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Gallery Lightbox ──────────────────────────────────── */
  const [lightbox, setLightbox] = useState({ open: false, src: '', caption: '' });

  const openLightbox = (src, caption) => {
    setLightbox({ open: true, src, caption });
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    setLightbox({ open: false, src: '', caption: '' });
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && lightbox.open) closeLightbox(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox.open]);

  /* ── Ripple on btn click ───────────────────────────────── */
  const addRipple = (e) => {
    const btn = e.currentTarget;
    const r = btn.getBoundingClientRect();
    const rip = document.createElement('span');
    rip.style.cssText = `
      position:absolute;border-radius:50%;pointer-events:none;
      background:rgba(255,255,255,0.25);
      width:2px;height:2px;
      left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;
      transform:scale(0);
      animation:ripple-expand 0.55s ease forwards;
    `;
    if (!document.querySelector('#ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = '@keyframes ripple-expand{to{transform:scale(200);opacity:0}}';
      document.head.appendChild(style);
    }
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(rip);
    setTimeout(() => rip.remove(), 600);
  };

  /* ── Floating Particles ────────────────────────────────── */
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let W, H, particles = [], raf;

    const resize = () => {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['rgba(201,152,10,', 'rgba(92,26,138,', 'rgba(240,236,216,'];

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = H + 10;
        this.vy = -(Math.random() * 0.8 + 0.3);
        this.vx = (Math.random() - 0.5) * 0.4;
        this.r  = Math.random() * 2.5 + 0.5;
        this.c  = colors[Math.floor(Math.random() * colors.length)];
        this.a  = Math.random() * 0.6 + 0.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.a -= 0.0012;
        if (this.y < -10 || this.a <= 0) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.c + this.a + ')';
        ctx.fill();
      }
    }

    for (let i = 0; i < 80; i++) {
      const p = new Particle();
      p.y = Math.random() * H;
      particles.push(p);
    }

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => { p.update(); p.draw(); });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
    
      {/* ── Page Loader ────────────────────────────────────── */}
      <div className="page-loader" id="loader">
        <div className="loader-logo">GOLDEN ROCK FC</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>



      {/* ── Background ─────────────────────────────────────── */}
      <div className="bg-mesh" />
      <div className="bg-grain" />
      <Navbar/>
      <div className="page-wrapper">

        {/* ══ HERO ════════════════════════════════════════════ */}
        <section className="hero-section">
          {/* Particle canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position:      'absolute',
              inset:         0,
              pointerEvents: 'none',
              zIndex:        1,
              opacity:       0.35,
            }}
          />

          {/* Slideshow */}
          <div
            className="hero-slideshow"
            id="heroSlideshow"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {SLIDES.map((slide, i) => (
              <div
                key={i}
                className={`slide${i === current ? ' active' : ''}`}
                style={{ background: slide.bg }}
              >
                <div className="slide-overlay" />
                <div
                  className="slide-bg"
                  style={{ backgroundImage: `url('${slide.img}')` }}
                />
              </div>
            ))}

            {/* Dots */}
            <div className="slide-dots">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`dot${i === current ? ' active' : ''}`}
                  data-slide={i}
                  onClick={() => { goTo(i); startAuto(); }}
                />
              ))}
            </div>

            {/* Arrows */}
            <button
              className="slide-arrow prev"
              id="slidePrev"
              onClick={() => { goTo(current - 1); startAuto(); }}
            >
              ‹
            </button>
            <button
              className="slide-arrow next"
              id="slideNext"
              onClick={() => { goTo(current + 1); startAuto(); }}
            >
              ›
            </button>
          </div>

          {/* Hero Content */}
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
                <a href="/matches" className="btn btn-primary" onClick={addRipple}>
                  View Match Center
                </a>
                <a href="/club" className="btn btn-outline" onClick={addRipple}>
                  The Club
                </a>
              </div>
            </div>

            {/* Season badge */}
            
          </div>
        </section>

        {/* ══ STATS ═══════════════════════════════════════════ */}
        <section className="section stats-section">
          <div className="stats-grid">
            {STATS.map(({ icon, count, label, delay }) => (
              <div
                key={label}
                className="stat-card tilt-card"
                data-reveal
                data-delay={delay}
              >
                <span className="stat-icon">{icon}</span>
                <span className="stat-number" data-count={count}>0</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ══ MATCH CENTER ════════════════════════════════════ */}
        <section className="section">
          <div className="section-header" data-reveal>
            <div>
              <span className="section-eyebrow">Latest Action</span>
              <h2 className="section-title">Match <span>Center</span></h2>
              <p className="section-subtitle">Keep up with the latest results and leaderboards</p>
            </div>
            <a href="/matches" className="btn btn-outline" style={{ alignSelf: 'flex-end' }}>
              All Match Archives →
            </a>
          </div>

          <div className="match-center-grid">
            {/* Match Result Card */}
            <div className="match-result-card card tilt-card" data-reveal data-delay="100">
              <div className="match-meta">
                <span>📅 Saturday, 12 Oct 2024</span>
                <span>📍 Rival Grounds Stadium</span>
                <span className="badge badge-win">WIN</span>
              </div>
              <div className="match-score-row">
                <div className="team home-team">
                  <div className="team-crest">⚽</div>
                  <span className="team-name">Golden Rock FC</span>
                </div>
                <div className="match-score">
                  <span className="score-num">3</span>
                  <span className="score-sep">–</span>
                  <span className="score-num">1</span>
                </div>
                <div className="team away-team">
                  <div className="team-crest">🔵</div>
                  <span className="team-name">Rival City FC</span>
                </div>
              </div>
              <div className="match-details">
                <div className="goals-list">
                  <div className="goals-header">Goalscorers</div>
                  <div className="goal-item"><span>Jordan Webb</span><span className="goal-min">34'</span></div>
                  <div className="goal-item"><span>Marcus 'Lightning' Silva</span><span className="goal-min">67'</span></div>
                  <div className="goal-item"><span>Marcus 'Lightning' Silva</span><span className="goal-min">88'</span></div>
                </div>
                <div className="motm-card">
                  <span className="motm-label">⭐ MAN OF THE MATCH</span>
                  <strong className="motm-name">Marcus Silva</strong>
                  <p>Scored a clinical brace and provided the assist for the second goal. Dominated the midfield with 92% pass accuracy.</p>
                </div>
              </div>
            </div>

            {/* Top Scorers */}
            <div className="top-scorers-card card" data-reveal data-delay="200">
              <div className="card-header">
                <span>🏆 Top Scorers</span>
                <span className="badge badge-gold">This Month</span>
              </div>
              <div className="scorer-list">
                {TOP_SCORERS.map(({ rank, initials, name, pos, goals }) => (
                  <div key={name} className={`scorer-item rank-${rank}`}>
                    <span className="scorer-rank">{rank}</span>
                    <div className="scorer-avatar">{initials}</div>
                    <div className="scorer-info">
                      <strong>{name}</strong>
                      <span>{pos}</span>
                    </div>
                    <div className="scorer-goals">
                      <span data-count={goals}>0</span>
                      <small>GOALS</small>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="/players"
                className="btn btn-outline"
                style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
              >
                View Full Squad →
              </a>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ══ GALLERY ══════════════════════════════════════════ */}
        <section className="section gallery-section">
          <div className="section-header" data-reveal>
            <div>
              <span className="section-eyebrow">Club Gallery</span>
              <h2 className="section-title">Our <span>Moments</span></h2>
              <p className="section-subtitle">Capturing the passion, the pride, and the golden moments</p>
            </div>
          </div>

          <div className="gallery-grid" id="galleryGrid">
            {GALLERY_ITEMS.map(({ cls, img, cap, delay }) => (
              <div
                key={cap}
                className={`gallery-item${cls ? ' ' + cls : ''} tilt-card`}
                data-reveal
                data-delay={delay}
                onClick={() => openLightbox(img, cap)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="gallery-img"
                  style={{ backgroundImage: `url('${img}')` }}
                />
                <div className="gallery-overlay"><span>{cap}</span></div>
              </div>
            ))}
          </div>

          {/* Lightbox */}
          <div
            className={`lightbox${lightbox.open ? ' open' : ''}`}
            id="lightbox"
            onClick={(e) => e.target === e.currentTarget && closeLightbox()}
          >
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>
            <img id="lightboxImg" src={lightbox.src} alt={lightbox.caption} />
            <div className="lightbox-caption">{lightbox.caption}</div>
          </div>
        </section>

        
      </div>
    <Footer/>
    </>
  );
}
