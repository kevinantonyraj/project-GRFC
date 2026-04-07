import React, { useState, useEffect } from 'react';
import Navbar  from '../components/Navbar.jsx';
import Footer  from '../components/Footer.jsx';
import { api } from '../../../backend/api/api.js';
import '../assets/css/global.css';
import '../assets/css/club.css';
import useCounterAnimation from '../hooks/useCounterAnimation';
import useTilt             from '../hooks/useTilt';
import usePageLoader       from '../hooks/usePageLoader';

const TRAINING = [
  { day:'Monday',    desc:'Tactical & Strategy',   time:'18:00 – 20:00' },
  { day:'Wednesday', desc:'Physical Conditioning', time:'17:30 – 19:30' },
  { day:'Friday',    desc:'Set Pieces & Drills',   time:'18:00 – 20:00' },
];

const IDENTITY = [
  { icon:'🕰️', label:'Established', value:'August 2008 (16 Years)' },
  { icon:'📍', label:'Home Ground', value:'The Electric Arena, Thunder City' },
  { icon:'⭐', label:'Motto',       value:'"Fortis in Victoria, Unitas in Corde"', sub:'(Strength in Victory, Unity in Heart)' },
];

const ASSETS = [
  { icon:'⚽', count:18,  label:'Match Balls'    },
  { icon:'🥅', count:4,   label:'Training Nets'  },
  { icon:'🔶', count:120, label:'Cones & Markers' },
  { icon:'🩺', count:3,   label:'First Aid Kits' },
];

const Skeleton = ({ width='100%', height='20px', style={} }) => (
  <div style={{ width, height, borderRadius:'6px', background:'linear-gradient(90deg,var(--bg-card) 25%,rgba(255,255,255,0.05) 50%,var(--bg-card) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite', ...style }}/>
);

const useRepeatReveal = () => {
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
  }, []);
};

/* ── Staff Modal ─────────────────────────────────────────── */
const StaffModal = ({ member, onClose }) => {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(12px)', zIndex:9990, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ maxWidth:'400px', width:'90%', padding:'32px', textAlign:'center', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:'16px', right:'16px', background:'none', border:'none', color:'var(--text-muted)', fontSize:'1.2rem', cursor:'pointer' }}>✕</button>
        <div className="staff-avatar" style={{ width:'72px', height:'72px', fontSize:'1.4rem', margin:'0 auto 16px', ...(member.avatar_style ? { background: member.avatar_style } : {}) }}>
          {member.initials}
        </div>
        <h3 style={{ fontFamily:'var(--font-serif)', fontSize:'1.3rem', color:'var(--ivory)', marginBottom:'4px' }}>{member.name}</h3>
        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', letterSpacing:'0.12em', color:'var(--gold)', textTransform:'uppercase', marginBottom:'8px' }}>{member.role}</p>
        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text-muted)', marginBottom:'16px' }}>Joined: {member.joined_date}</p>
        <p style={{ fontSize:'0.92rem', color:'var(--ivory-d)', lineHeight:1.7, fontStyle:'italic' }}>{member.bio}</p>
      </div>
    </div>
  );
};

/* ── All Members Modal ───────────────────────────────────── */
const AllMembersModal = ({ staff, onClose, onSelectMember }) => {
  const [search, setSearch] = useState('');
  const filtered = staff.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(12px)', zIndex:9990, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width:'100%', maxWidth:'680px', maxHeight:'80vh', display:'flex', flexDirection:'column', borderRadius:'16px', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'24px 24px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--gold)', letterSpacing:'0.12em', marginBottom:'4px' }}>ALL MEMBERS</div>
            <h3 style={{ fontFamily:'var(--font-serif)', fontSize:'1.3rem', color:'var(--ivory)' }}>
              Club Staff &amp; Members
            </h3>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:'1.2rem', cursor:'pointer' }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', position:'relative' }}>
          <span style={{ position:'absolute', left:'36px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name or role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width:'100%', paddingLeft:'32px', background:'var(--bg-deep)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--ivory)', padding:'10px 10px 10px 36px', fontFamily:'var(--font-mono)', fontSize:'0.75rem', outline:'none' }}
          />
        </div>

        {/* List */}
        <div style={{ overflow:'auto', flex:1, padding:'12px 0' }}>
          {filtered.length > 0 ? filtered.map(member => (
            <div
              key={member.id}
              style={{ display:'flex', alignItems:'center', gap:'16px', padding:'12px 24px', cursor:'pointer', transition:'background 0.15s', borderBottom:'1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => { onClose(); onSelectMember(member); }}
            >
              <div
                className="staff-avatar"
                style={{ width:'44px', height:'44px', fontSize:'1rem', flexShrink:0, ...(member.avatar_style ? {background:member.avatar_style} : {}) }}
              >
                {member.initials}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'var(--ivory)', fontWeight:600, fontSize:'0.9rem' }}>{member.name}</div>
                <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.68rem', marginTop:'2px' }}>{member.role} · Joined {member.joined_date}</div>
              </div>
              <span className={`badge${member.badge_cls ? ' ' + member.badge_cls : ''}`} style={{ fontSize:'0.62rem' }}>{member.role}</span>
              <button
                className="staff-detail-btn"
                onClick={e => { e.stopPropagation(); onClose(); onSelectMember(member); }}
              >
                Details
              </button>
            </div>
          )) : (
            <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>
              No members match "{search}"
            </div>
          )}
        </div>

        {/* Footer count */}
        <div style={{ padding:'12px 24px', borderTop:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--text-muted)' }}>
          {filtered.length} of {staff.length} members
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   CLUB COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Club() {
  usePageLoader(); useRepeatReveal(); useCounterAnimation(); useTilt();

  const [staff,          setStaff]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [modalMember,    setModalMember]    = useState(null);
  const [showAllMembers, setShowAllMembers] = useState(false);

  // How many rows shown in main table
  const TABLE_LIMIT = 5;
  const [tableCount, setTableCount] = useState(TABLE_LIMIT);
  const visibleStaff = staff.slice(0, tableCount);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        setLoading(true);
        const data = await api.club();
        setStaff(data.staff || []);
      } catch { setError('Failed to load club data.'); }
      finally { setLoading(false); }
    };
    fetchClub();
  }, []);

  return (
    <>
      <div className="page-loader" id="loader"><div className="loader-logo">GOLDEN ROCK FC</div><div className="loader-bar"><div className="loader-bar-fill"/></div></div>
      <div className="bg-mesh"/><div className="bg-grain"/>
      <Navbar/>

      {modalMember    && <StaffModal member={modalMember} onClose={() => setModalMember(null)}/>}
      {showAllMembers && <AllMembersModal staff={staff} onClose={() => setShowAllMembers(false)} onSelectMember={m => setModalMember(m)}/>}

      <div className="page-wrapper">
        <section className="section">

          {/* Club Header */}
          <div className="club-header" data-reveal>
            <span className="section-eyebrow">Inside the Club</span>
            <h1 className="section-title">Club <span>Operations</span></h1>
            <p className="section-subtitle">Inside look at Golden Rock FC's leadership, infrastructure, and the passionate team that drives our success on and off the pitch.</p>
          </div>

          {/* Leadership Grid */}
          <div className="leadership-grid">
            <div className="coach-card card tilt-card" data-reveal data-delay="0">
              <div className="coach-image-frame">
                <div className="coach-avatar">MC</div>
                <div className="coach-name-overlay"><strong>Marcus Sterling</strong><span>Head Coach</span></div>
              </div>
              <div className="coach-info">
                <h3>Leadership &amp; Experience</h3>
                <p>Coach Sterling brings 15+ years of professional coaching experience, including a UEFA 'A' License. He joined Golden Rock FC in 2018 and has since led us to two regional championships.</p>
                <div className="training-schedule">
                  <h4>🗓️ Weekly Training Schedule</h4>
                  {TRAINING.map(({ day, desc, time }) => (
                    <div className="training-item" key={day}>
                      <div><strong>{day}</strong><span>{desc}</span></div>
                      <span className="training-time">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="club-identity card tilt-card" data-reveal data-delay="120">
              <h3>🔐 Club Identity</h3>
              <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:'20px' }}>Foundational details of Golden Rock FC</p>
              {IDENTITY.map(({ icon, label, value, sub }) => (
                <div className="identity-item" key={label}>
                  <span className="identity-icon">{icon}</span>
                  <div>
                    <strong>{label}</strong>
                    <span style={label==='Motto'?{fontStyle:'italic'}:{}}>
                      {value}
                      {sub && <><br/><small style={{fontSize:'0.78rem'}}>{sub}</small></>}
                    </span>
                  </div>
                </div>
              ))}
              <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'24px' }}>
                💬 Connect on WhatsApp
              </a>
            </div>
          </div>

          <div className="divider" style={{margin:'40px 0'}}/>

          {/* Assets */}
          <div data-reveal>
            <span className="section-eyebrow">Infrastructure</span>
            <h2 className="section-title" style={{fontSize:'1.8rem'}}>Club Assets <span>&amp; Logistics</span></h2>
          </div>
          <div className="assets-grid" data-reveal data-delay="80">
            {ASSETS.map(({ icon, count, label }) => (
              <div className="asset-card stat-card tilt-card" key={label}>
                <span className="stat-icon">{icon}</span>
                <span className="stat-number" data-count={count}>0</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>

          <div className="divider" style={{margin:'40px 0'}}/>

          {/* Staff Table */}
          <div className="staff-section card" data-reveal>
            <div className="staff-header">
              <div>
                <h3>👥 Club Staff &amp; Members</h3>
                <p>Dedicated individuals managing the pride of Thunder City</p>
              </div>
              {/* View All Members button — opens modal */}
              <button
                className="btn btn-outline"
                style={{ padding:'8px 20px', fontSize:'0.7rem' }}
                onClick={() => setShowAllMembers(true)}
                disabled={loading || staff.length === 0}
              >
                View All Members ({staff.length})
              </button>
            </div>

            {error && <p style={{ color:'#f87171', padding:'12px', fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>⚠ {error}</p>}

            <table>
              <thead>
                <tr><th>Member</th><th>Designation</th><th>Joined Since</th><th>Action</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i}>
                      <td><div style={{display:'flex',gap:'10px',alignItems:'center'}}><Skeleton height="36px" width="36px" style={{borderRadius:'50%'}}/><Skeleton height="14px" width="100px"/></div></td>
                      <td><Skeleton height="22px" width="80px"/></td>
                      <td><Skeleton height="14px" width="60px"/></td>
                      <td><Skeleton height="28px" width="60px"/></td>
                    </tr>
                  ))
                ) : visibleStaff.length > 0 ? (
                  visibleStaff.map(member => (
                    <tr className="staff-row" key={member.id}>
                      <td>
                        <div className="staff-member">
                          <div className="staff-avatar" style={member.avatar_style ? { background:member.avatar_style } : {}}>
                            {member.initials}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td><span className={`badge${member.badge_cls ? ' '+member.badge_cls : ''}`}>{member.role}</span></td>
                      <td>{member.joined_date}</td>
                      <td><button className="staff-detail-btn" onClick={() => setModalMember(member)}>Details</button></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" style={{ textAlign:'center', padding:'30px', color:'var(--text-muted)', fontSize:'0.8rem' }}>No staff members added yet.</td></tr>
                )}
              </tbody>
            </table>

            {/* Show more inside table if more than TABLE_LIMIT */}
            {!loading && staff.length > TABLE_LIMIT && tableCount < staff.length && (
              <div style={{ textAlign:'center', padding:'16px' }}>
                <button
                  className="btn btn-outline"
                  style={{ fontSize:'0.72rem' }}
                  onClick={() => setTableCount(staff.length)}
                >
                  Show All {staff.length} Members ▾
                </button>
              </div>
            )}
            {!loading && tableCount > TABLE_LIMIT && (
              <div style={{ textAlign:'center', padding:'16px' }}>
                <button
                  className="btn btn-outline"
                  style={{ fontSize:'0.72rem' }}
                  onClick={() => setTableCount(TABLE_LIMIT)}
                >
                  Show Less ▴
                </button>
              </div>
            )}
          </div>

        </section>
      </div>
      <Footer/>
    </>
  );
}