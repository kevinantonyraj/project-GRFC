import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../assets/css/player-profile.css';
import useScrollReveal  from '../hooks/useScrollReveal';
import useCounterAnimation  from '../hooks/useCounterAnimation';
import useProgressAnimation from '../hooks/useProgressBar.js';
import useTilt              from '../hooks/useTilt';
import usePageLoader        from '../hooks/usePageLoader';

/* ── Data ────────────────────────────────────────────────── */
const QUICK_STATS = [
  { label: 'TOTAL GOALS', count: 24, icon: '🎯', iconBg: 'linear-gradient(135deg,var(--gold-d),var(--gold))' },
  { label: 'ASSISTS',     count: 12, icon: '⚡', iconBg: 'linear-gradient(135deg,var(--violet-d),var(--violet))' },
  { label: 'MATCHES',     count: 32, icon: '⚽', iconBg: 'linear-gradient(135deg,#0a2a1a,#1a4a2a)' },
];

const MATCH_HISTORY = [
  { date: 'Jan 12, 2024', opponent: 'Iron Wall FC',     result: 'W 3-1', resultCls: '#4ade80', goals: 2, rating: '9.2',  ratingCls: 'var(--gold)', motm: true  },
  { date: 'Jan 05, 2024', opponent: 'City United',      result: 'D 1-1', resultCls: 'var(--gold-l)', goals: 0, rating: '7.5', ratingCls: '',            motm: false },
  { date: 'Dec 28, 2023', opponent: 'Shadow Strikers',  result: 'W 4-0', resultCls: '#4ade80', goals: 3, rating: '10.0', ratingCls: 'var(--gold)', motm: true  },
  { date: 'Dec 20, 2023', opponent: 'Green Giants',     result: 'L 1-2', resultCls: '#f87171', goals: 1, rating: '8.1',  ratingCls: '',            motm: false },
  { date: 'Dec 12, 2023', opponent: 'Oceanic FC',       result: 'W 2-0', resultCls: '#4ade80', goals: 1, rating: '8.4',  ratingCls: '',            motm: false },
];

const AWARDS = [
  { title: 'Champions Cup',       year: '2023', badge: 'badge-win',  label: 'Winner'    },
  { title: 'National League',     year: '2023', badge: 'badge-draw', label: 'Runner-up' },
  { title: 'Thunder Invitationals', year: '2022', badge: 'badge-win', label: 'Winner'   },
];

const PROGRESS_BARS = [
  { label: 'Progress to Goal Target (30)', pct: '80%', width: 80 },
  { label: 'Match Availability',           pct: '94%', width: 94 },
];

/* ═══════════════════════════════════════════════════════════
   PLAYER PROFILE COMPONENT
═══════════════════════════════════════════════════════════ */
export default function PlayerProfile() {
  usePageLoader();
  useScrollReveal();
  useCounterAnimation();
  useProgressAnimation();
  useTilt();

  return (
    <>
      {/* Page Loader */}
      <div className="page-loader" id="loader">
        <div className="loader-logo">GOLDEN ROCK FC</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>

      {/* Background */}
      <div className="bg-mesh" />
      <div className="bg-grain" />

      <Navbar />

      <div className="page-wrapper">
        <section className="section">

          {/* Breadcrumb */}
          <div className="breadcrumb" data-reveal>
            <a href="/">Home</a> › <a href="/players">Players</a> › <span>Marcus Sterling</span>
          </div>

          {/* Hero Profile */}
          <div className="profile-hero card tilt-card" data-reveal>
            <div className="profile-hero-bg" />
            <div className="profile-hero-image">
              <div className="profile-avatar-xl">MS</div>
            </div>
            <div className="profile-hero-info">
              <div className="profile-badges">
                <span className="badge badge-gold">Captain</span>
                <span className="badge badge-violet">Top Scorer 2023</span>
                <span className="badge badge-win">League MVP</span>
              </div>
              <h1 className="profile-name">
                <span>MARCUS</span>
                <span className="gold-line">'THUNDER'</span>
                <span>STERLING</span>
              </h1>
              <div className="profile-number">#09</div>
              <div className="profile-meta">
                <span>🏆 Forward / Striker</span>
                <span>📅 Joined 2019</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="profile-quick-stats" data-reveal data-delay="100">
            {QUICK_STATS.map(({ label, count, icon, iconBg }) => (
              <div className="quick-stat tilt-card" key={label}>
                <span className="qs-label">{label}</span>
                <span className="qs-value" data-count={count}>0</span>
                <div className="qs-icon" style={{ background: iconBg }}>{icon}</div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="profile-main-grid">

            {/* Match History */}
            <div className="profile-history card" data-reveal>
              <div className="card-header" style={{ padding: '20px 20px 0' }}>
                <span>🕒 Recent Match History</span>
              </div>
              <div style={{ padding: '0 20px 20px' }}>
                <table style={{ marginTop: '16px' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Opponent</th>
                      <th>Result</th>
                      <th>Goals</th>
                      <th>Rating</th>
                      <th>Award</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MATCH_HISTORY.map(({ date, opponent, result, resultCls, goals, rating, ratingCls, motm }) => (
                      <tr key={date + opponent}>
                        <td>{date}</td>
                        <td>{opponent}</td>
                        <td><span style={{ color: resultCls }}>{result}</span></td>
                        <td>{goals}</td>
                        <td style={{ color: ratingCls || 'inherit' }}>{rating}</td>
                        <td>
                          {motm
                            ? <span className="badge badge-gold" style={{ fontSize: '0.55rem' }}>MOTM</span>
                            : '—'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar */}
            <div className="profile-sidebar">

              {/* Awards */}
              <div className="awards-card card" data-reveal data-delay="80">
                <div className="card-header" style={{ padding: '20px 20px 0' }}>
                  <span>🏆 Honours &amp; Awards</span>
                </div>
                <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {AWARDS.map(({ title, year, badge, label }) => (
                    <div className="award-row" key={title}>
                      <div><strong>{title}</strong><span>{year}</span></div>
                      <span className={`badge ${badge}`}>{label}</span>
                    </div>
                  ))}
                  <div className="award-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                    <strong>MOTM Awards</strong>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)' }}>x14</span>
                  </div>
                </div>
              </div>

              {/* Season Summary */}
              <div className="summary-card card" data-reveal data-delay="160">
                <div className="card-header" style={{ padding: '20px 20px 0' }}>
                  <span>📊 Season Summary</span>
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  {PROGRESS_BARS.map(({ label, pct, width }, i) => (
                    <div className="summary-item" key={label} style={i > 0 ? { marginTop: '16px' } : {}}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--ivory-d)' }}>{label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gold)' }}>{pct}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" data-width={width} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </section>
      </div>

      <Footer />
    </>
  );
}