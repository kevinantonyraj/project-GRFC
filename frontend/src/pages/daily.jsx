import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

import '../assets/css/daily.css';
import useScrollReveal      from '../hooks/useScrollReveal';
import useCounterAnimation  from '../hooks/useCounterAnimation';
import useTilt              from '../hooks/useTilt';
import usePageLoader        from '../hooks/usePageLoader';

/* ── Constants ───────────────────────────────────────────── */
const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ACTIVE_DATE = new Date(2023, 10, 4); // Nov 4 2023

/* build 15 pills: 7 before, active, 7 after */
const buildPills = () => {
  const pills = [];
  for (let i = -7; i <= 7; i++) {
    const d = new Date(ACTIVE_DATE);
    d.setDate(ACTIVE_DATE.getDate() + i);
    pills.push({
      id:       i,
      dayName:  DAYS[d.getDay()],
      dayNum:   d.getDate(),
      month:    MONTHS[d.getMonth()],
      isActive: i === 0,
    });
  }
  return pills;
};

const PILLS = buildPills();

/* ── Match data ──────────────────────────────────────────── */
const HOME_SCORERS = [
  { name: 'Erling Haaland',  min: "14'" },
  { name: 'Kevin De Bruyne', min: "42'" },
  { name: 'Phil Foden',      min: "78'" },
];
const AWAY_SCORERS = [
  { name: 'M. Rashford', min: "56'" },
];

const SQUAD = [
  { num: '01', name: 'M. Sterling',   role: 'GK',  cls: 'gk'  },
  { num: '04', name: 'J. Henderson',  role: 'DEF', cls: 'def' },
  { num: '09', name: 'T. Silva',      role: 'DEF', cls: 'def' },
  { num: '02', name: 'K. Walker',     role: 'DEF', cls: 'def' },
  { num: '03', name: 'R. Dias',       role: 'DEF', cls: 'def' },
  { num: '17', name: 'K. De Bruyne', role: 'MID', cls: 'mid' },
  { num: '16', name: 'Rodri',         role: 'MID', cls: 'mid' },
  { num: '20', name: 'B. Silva',      role: 'MID', cls: 'mid' },
  { num: '47', name: 'P. Foden',      role: 'FWD', cls: 'fwd' },
  { num: '09', name: 'E. Haaland',    role: 'FWD', cls: 'fwd' },
  { num: '10', name: 'J. Grealish',   role: 'FWD', cls: 'fwd' },
  { num: '16', name: 'J. Alvarez',    role: 'SUB', cls: 'fwd' },
  { num: '08', name: 'M. Kovacic',    role: 'SUB', cls: 'sub' },
  { num: '05', name: 'N. Ake',        role: 'SUB', cls: 'sub' },
  { num: '18', name: 'Stefan Ortega', role: 'SUB', cls: 'sub' },
];

/* ═══════════════════════════════════════════════════════════
   DAILY COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Daily() {
  /* ── Global hooks ──────────────────────────────────────── */
  usePageLoader();
  useScrollReveal();
  useCounterAnimation();
  useTilt();

  /* ── Date pills ────────────────────────────────────────── */
  const [activePill, setActivePill] = useState(0); // offset from ACTIVE_DATE
  const scrollRef   = useRef(null);
  const activePillRef = useRef(null);

  /* scroll active pill into centre on mount */
  useEffect(() => {
    if (activePillRef.current) {
      activePillRef.current.scrollIntoView({ inline: 'center', behavior: 'smooth' });
    }
  }, []);

  const scrollDate = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Page Loader ──────────────────────────────────── */}
      <div className="page-loader" id="loader">
        <div className="loader-logo">GOLDEN ROCK FC</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>

      {/* ── Background ───────────────────────────────────── */}
      <div className="bg-mesh" />
      <div className="bg-grain" />

      <Navbar />

      <div className="page-wrapper">

        {/* ── Date Ribbon ────────────────────────────────── */}
        <div className="date-ribbon">
          <button className="date-nav-btn" onClick={() => scrollDate(-1)}>‹</button>

          <div className="date-scroll" ref={scrollRef}>
            {PILLS.map((pill) => (
              <button
                key={pill.id}
                ref={pill.id === activePill ? activePillRef : null}
                className={`date-pill${pill.id === activePill ? ' active' : ''}`}
                onClick={() => setActivePill(pill.id)}
              >
                <span className="day-name">{pill.dayName}</span>
                <span className="day-num">{pill.dayNum}</span>
                <span className="day-month">{pill.month}</span>
              </button>
            ))}
          </div>

          <button className="date-nav-btn" onClick={() => scrollDate(1)}>›</button>
        </div>

        {/* ── Main Content ───────────────────────────────── */}
        <section className="section">

          {/* Match Result Card */}
          <div className="daily-match-card card tilt-card" data-reveal>
            <div className="daily-match-header">
              <span className="badge badge-violet">PREMIER LEAGUE</span>
              <span className="daily-date">📅 Saturday, Nov 04, 2023</span>
              <span className="daily-venue">📍 Thunder Arena</span>
              <span className="daily-time">🕗 20:00 BST</span>
            </div>

            <div className="daily-score-block">
              <div className="daily-team">
                <div className="daily-team-crest home">✅</div>
                <h3>FC THUNDER 1</h3>
              </div>
              <div className="daily-score-center">
                <div className="daily-score-nums">
                  <span className="ds-home">3</span>
                  <span className="ds-dash">—</span>
                  <span className="ds-away">1</span>
                </div>
                <div className="badge badge-win" style={{ marginTop: '8px' }}>VICTORY</div>
              </div>
              <div className="daily-team">
                <div className="daily-team-crest away">⏱️</div>
                <h3>FC THUNDER 2</h3>
              </div>
            </div>
          </div>

          {/* Scorers + Notes */}
          <div className="daily-details-grid">

            <div className="daily-scorers card" data-reveal data-delay="80">
              <div className="daily-scorers-col">
                <h4>⚡ THUNDER GOAL SCORERS</h4>
                {HOME_SCORERS.map(({ name, min }) => (
                  <div className="scorer-row" key={name}>
                    <span>⚡ {name}</span>
                    <span className="goal-min">{min}</span>
                  </div>
                ))}
              </div>
              <div className="daily-scorers-col" style={{ opacity: 0.6 }}>
                <h4>⚡ KODIAK GOAL SCORERS</h4>
                {AWAY_SCORERS.map(({ name, min }) => (
                  <div className="scorer-row" key={name}>
                    <span style={{ color: 'var(--text-muted)' }}>⚡ {name}</span>
                    <span className="goal-min">{min}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="daily-notes card" data-reveal data-delay="160">
              <h4>📋 NOTES</h4>
              <p>
                "Thunder dominated possession (68%) throughout the first half. The high press
                from Haaland forced three turnovers leading to the opening goal. Substitutions
                in the 70th minute solidified the midfield defensive structure."
              </p>
            </div>

          </div>

          {/* Squad + MOTM */}
          <div className="daily-squad-motm">

            <div className="squad-section card" data-reveal data-delay="80">
              <div className="squad-section-header">
                <h3>The Squad</h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Thunder Arena | 15 Players Active
                </span>
              </div>
              <div className="squad-grid">
                {SQUAD.map(({ num, name, role, cls }) => (
                  <div key={`${num}-${name}`} className={`squad-tag ${cls}`}>
                    #{num} {name} <em>{role}</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="motm-section card tilt-card" data-reveal data-delay="160">
              <div className="motm-stars">⭐ ⭐ ⭐</div>
              <div className="motm-title-label">MAN OF THE MATCH</div>
              <div className="motm-avatar-big">EH</div>
              <h3 className="motm-player-name">ERLING HAALAND</h3>
              <span className="motm-pos">Forward · #09</span>
              <div className="motm-stats-row">
                <div><span>2</span><small>Goals</small></div>
                <div><span>1</span><small>Assists</small></div>
                <div><span>9.2</span><small>Rating</small></div>
              </div>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}