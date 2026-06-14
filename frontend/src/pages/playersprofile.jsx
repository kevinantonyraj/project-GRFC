import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../utils/api.js';
import '../assets/css/global.css';
import '../assets/css/player-profile.css';
import useCounterAnimation  from '../hooks/useCounterAnimation';
import useProgressBar       from '../hooks/useProgressBar';
import useTilt              from '../hooks/useTilt';
import usePageLoader        from '../hooks/usePageLoader';
import { Helmet } from "react-helmet-async";
const Skeleton = ({ width = '100%', height = '20px', style = {} }) => (
  <div style={{
    width, height, borderRadius: '6px',
    background: 'linear-gradient(90deg,var(--bg-card) 25%,rgba(255,255,255,0.05) 50%,var(--bg-card) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...style,
  }} />
);

const useRepeatScrollReveal = (deps = []) => {
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
  }, deps);
};

export default function PlayerProfile() {
  const { id } = useParams(); 

  usePageLoader();
  
  
  useProgressBar();
  useTilt();

  /* ── API state ─────────────────────────────────────────── */
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useRepeatScrollReveal([data]);
  useCounterAnimation([data]);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const res = await api.playerById(id);
        setData(res);
      } catch (err) {
        setError('Failed to load player data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPlayer();
  }, [id]);

  const player       = data?.player        || null;
  const stats        = data?.career_stats  || {};
  const matchHistory = data?.match_history || [];

  const goalProgress  = Math.min((stats.total_goals   / 30) * 100, 100); 
  const availProgress = Math.min((stats.total_matches / 38) * 100, 100); 

  const resultColor = { win: '#4ade80', draw: 'var(--gold-l)', loss: '#f87171' };

  return (
    <>
      <Helmet>
        <title>Player Profile | Golden Rock FC</title>

        <meta
          name="description"
          content="View detailed football player profiles including statistics, achievements, goals, assists, match appearances, and performance history."
        />

        <meta
          name="keywords"
          content="football player profile, player statistics, football achievements, goals, assists, player history"
        />

        <meta
          property="og:title"
          content="Player Profile | Golden Rock FC"
        />

        <meta
          property="og:description"
          content="Detailed football player profiles with goals, assists, achievements, and match history."
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
          href="https://goldenrockfc.onrender.com/playersprofile"
        />
      </Helmet>

      <div className="page-loader" id="loader">
        <div className="loader-logo">GOLDEN ROCK FC</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>
      <div className="bg-mesh" /><div className="bg-grain" />

      <Navbar />

      <div className="page-wrapper">
        <section className="section">

          {/* Breadcrumb */}
          <div className="breadcrumb" data-reveal>
            <Link to="/">Home</Link> › <Link to="/players">Players</Link> ›{' '}
            <span>{loading ? '...' : player?.name || 'Player'}</span>
          </div>

          {error && (
            <p style={{ color: '#f87171', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '20px' }}>
              ⚠ {error}
            </p>
          )}

          {/* Hero Profile */}
          {loading ? (
            <div className="card" style={{ padding: '40px', display: 'flex', gap: '32px', alignItems: 'center' }}>
              <Skeleton height="120px" width="120px" style={{ borderRadius: '50%' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Skeleton height="16px" width="30%" />
                <Skeleton height="40px" width="60%" />
                <Skeleton height="16px" width="40%" />
              </div>
            </div>
          ) : player && (
            <div className="profile-hero card tilt-card" data-reveal>
              <div className="profile-hero-bg" />
              <div className="profile-hero-image">
                <div className="profile-avatar-xl">{player.initials}</div>
              </div>
              <div className="profile-hero-info">
                <div className="profile-badges">
                  {player.role_tag && <span className="badge badge-gold">{player.role_tag}</span>}
                  <span className="badge badge-violet">{player.position}</span>
                </div>
                <h1 className="profile-name">
                  {player.name.split(' ').map((word, i) => (
                    <span key={i} className={i === 1 && player.nickname ? 'gold-line' : ''}>{word}</span>
                  ))}
                </h1>
                <div className="profile-number">#{player.number}</div>
                <div className="profile-meta">
                  <span>🏆 {player.position}</span>
                  <span>📅 Joined {player.joined_year}</span>
                  {player.current_team && <span>⚽ {player.current_team.name}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {!loading && stats && (
            <div className="profile-quick-stats" data-reveal data-delay="100">
              <div className="quick-stat tilt-card">
                <span className="qs-label">TOTAL GOALS</span>
                <span className="qs-value" data-count={stats.total_goals || 0}>0</span>
                <div className="qs-icon" style={{ background: 'linear-gradient(135deg,var(--gold-d),var(--gold))' }}>🎯</div>
              </div>
              <div className="quick-stat tilt-card">
                <span className="qs-label">ASSISTS</span>
                <span className="qs-value" data-count={stats.total_assists || 0}>0</span>
                <div className="qs-icon" style={{ background: 'linear-gradient(135deg,var(--violet-d),var(--violet))' }}>⚡</div>
              </div>
              <div className="quick-stat tilt-card">
                <span className="qs-label">MATCHES</span>
                <span className="qs-value" data-count={stats.total_matches || 0}>0</span>
                <div className="qs-icon" style={{ background: 'linear-gradient(135deg,#0a2a1a,#1a4a2a)' }}>⚽</div>
              </div>
              <div className="quick-stat tilt-card">
                <span className="qs-label">MOTM AWARDS</span>
                <span className="qs-value" data-count={stats.total_motm || 0}>0</span>
                <div className="qs-icon" style={{ background: 'linear-gradient(135deg,var(--gold-d),var(--gold))' }}>⭐</div>
              </div>
            </div>
          )}

          {/* Main Grid */}
          {!loading && (
            <div className="profile-main-grid">

              {/* Match History Table */}
              <div className="profile-history card" data-reveal>
                <div className="card-header" style={{ padding: '20px 20px 0' }}>
                  <span>🕒 Recent Match History</span>
                </div>
                <div style={{ padding: '0 20px 20px' }}>
                  {matchHistory.length > 0 ? (
                    <table style={{ marginTop: '16px' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Opponent</th>
                          <th>Result</th>
                          <th>Goals</th>
                          <th>Ast</th>
                          <th>Rating</th>
                          <th>Award</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchHistory.map((m, i) => (
                          <tr key={i}>
                            <td>{m.date}</td>
                            <td>{m.opponent}</td>
                            <td>
                              <span style={{ color: resultColor[m.result] || 'inherit' }}>
                                {m.result.toUpperCase()} {m.score}
                              </span>
                            </td>
                            <td>{m.goals}</td>
                            <td>{m.assists}</td>
                            <td style={{ color: parseFloat(m.rating) >= 9 ? 'var(--gold)' : 'inherit' }}>
                              {m.rating}
                            </td>
                            <td>
                              {m.is_motm
                                ? <span className="badge badge-gold" style={{ fontSize: '0.55rem' }}>MOTM</span>
                                : '—'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No match history yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="profile-sidebar">

                <div className="summary-card card" data-reveal data-delay="80">
                  <div className="card-header" style={{ padding: '20px 20px 0' }}>
                    <span>📊 Season Summary</span>
                  </div>
                  <div style={{ padding: '16px 20px 20px' }}>

                    <div className="summary-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--ivory-d)' }}>
                          Progress to Goal Target (30)
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gold)' }}>
                          {Math.round(goalProgress)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" data-width={Math.round(goalProgress)} />
                      </div>
                    </div>

                    <div className="summary-item" style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--ivory-d)' }}>
                          Match Availability
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gold)' }}>
                          {Math.round(availProgress)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" data-width={Math.round(availProgress)} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* MOTM count card */}
                <div className="awards-card card" data-reveal data-delay="160">
                  <div className="card-header" style={{ padding: '20px 20px 0' }}>
                    <span>🏆 Career Highlights</span>
                  </div>
                  <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="award-row">
                      <strong>Total Goals</strong>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)' }}>
                        {stats.total_goals || 0}
                      </span>
                    </div>
                    <div className="award-row">
                      <strong>Total Assists</strong>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)' }}>
                        {stats.total_assists || 0}
                      </span>
                    </div>
                    <div className="award-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                      <strong>MOTM Awards</strong>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)' }}>
                        x{stats.total_motm || 0}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </section>
      </div>

      <Footer />
    </>
  );
}