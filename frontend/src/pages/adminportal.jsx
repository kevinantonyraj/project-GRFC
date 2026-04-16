import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../../backend/api/adminapi';
import { authApi, getUser, clearTokens } from '../../../backend/api/auth.js';

/* ════════════════════════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════════════════════════ */
const C = {
  bg:'#0a0810', bgCard:'#12101a', bgDeep:'#080610',
  border:'rgba(255,255,255,0.09)', borderBr:'rgba(201,152,10,0.35)',
  gold:'#C9980A', violet:'#5C1A8A',
  ivory:'#F0ECD8', ivoryD:'#c8c4b0',
  muted:'rgba(240,236,216,0.5)',
  green:'#4ade80', red:'#f87171',
  mono:'"Courier New",monospace', serif:'"Georgia",serif',
};

const S = {
  page:    { display:'flex', height:'100vh', background:C.bg, color:C.ivory, fontFamily:'system-ui,sans-serif', overflow:'hidden', fontSize:'15px' },
  sidebar: { width:'230px', flexShrink:0, background:C.bgCard, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', overflow:'hidden' },
  main:    { flex:1, overflow:'auto', padding:'36px 40px' },
  card:    { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'28px', marginBottom:'22px' },
  cardSm:  { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'18px' },
  h1:      { fontFamily:C.serif, fontSize:'2rem', color:C.ivory, marginBottom:'6px', fontWeight:700 },
  h2:      { fontFamily:C.serif, fontSize:'1.3rem', color:C.ivory, marginBottom:'18px', fontWeight:600 },
  eyebrow: { fontFamily:C.mono, fontSize:'0.7rem', color:C.gold, letterSpacing:'0.15em', textTransform:'uppercase', display:'block', marginBottom:'8px' },
  label:   { fontFamily:C.mono, fontSize:'0.75rem', color:C.muted, letterSpacing:'0.06em', display:'block', marginBottom:'7px', fontWeight:500 },
  input:   { width:'100%', background:C.bgDeep, border:`1px solid ${C.border}`, borderRadius:'9px', color:C.ivory, padding:'12px 14px', fontFamily:'system-ui', fontSize:'0.95rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' },
  select:  { width:'100%', background:C.bgDeep, border:`1px solid ${C.border}`, borderRadius:'9px', color:C.ivory, padding:'12px 14px', fontFamily:'system-ui', fontSize:'0.95rem', outline:'none', boxSizing:'border-box', cursor:'pointer' },
  textarea:{ width:'100%', background:C.bgDeep, border:`1px solid ${C.border}`, borderRadius:'9px', color:C.ivory, padding:'12px 14px', fontFamily:'system-ui', fontSize:'0.95rem', outline:'none', boxSizing:'border-box', resize:'vertical', minHeight:'90px' },
  btnPri:  { background:`linear-gradient(135deg,${C.violet},${C.gold})`, border:'none', borderRadius:'9px', color:C.ivory, padding:'12px 24px', cursor:'pointer', fontSize:'0.95rem', fontWeight:700, transition:'opacity 0.2s' },
  btnSec:  { background:'transparent', border:`1px solid ${C.border}`, borderRadius:'9px', color:C.ivoryD, padding:'10px 18px', cursor:'pointer', fontSize:'0.92rem', transition:'all 0.2s' },
  btnDng:  { background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.35)', borderRadius:'8px', color:C.red, padding:'7px 14px', cursor:'pointer', fontSize:'0.85rem', transition:'all 0.2s' },
  btnSm:   { background:`rgba(201,152,10,0.1)`, border:`1px solid ${C.borderBr}`, borderRadius:'7px', color:C.gold, padding:'6px 12px', cursor:'pointer', fontSize:'0.82rem' },
  row:     { display:'grid', gap:'18px', marginBottom:'18px' },
  flex:    { display:'flex', gap:'12px', alignItems:'center' },
  tag:     { display:'inline-flex', alignItems:'center', gap:'6px', padding:'5px 12px', borderRadius:'20px', fontSize:'0.78rem', fontFamily:C.mono },
};

/* ════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
════════════════════════════════════════════════════════════ */
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:'fixed', bottom:'28px', right:'28px', zIndex:9999, background:type==='ok'?'rgba(74,222,128,0.15)':'rgba(248,113,113,0.15)', border:`1px solid ${type==='ok'?C.green:C.red}`, borderRadius:'12px', padding:'14px 22px', color:type==='ok'?C.green:C.red, fontFamily:C.mono, fontSize:'0.9rem', backdropFilter:'blur(10px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', animation:'slideIn 0.25s ease' }}>
      {type==='ok'?'✓ ':'✗ '}{msg}
    </div>
  );
};
const Spinner = () => <div style={{ textAlign:'center', padding:'48px', color:C.muted, fontFamily:C.mono, fontSize:'0.9rem' }}>Loading…</div>;
const Empty   = ({ msg='No records yet.' }) => <div style={{ textAlign:'center', padding:'48px', color:C.muted, fontFamily:C.mono, fontSize:'0.9rem' }}>{msg}</div>;

const Confirm = ({ msg, onYes, onNo }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ ...S.card, maxWidth:'380px', textAlign:'center' }}>
      <div style={{ fontSize:'2rem', marginBottom:'14px' }}>🗑️</div>
      <p style={{ color:C.ivoryD, marginBottom:'22px', fontSize:'1rem', lineHeight:1.6 }}>{msg}</p>
      <div style={{ display:'flex', gap:'14px', justifyContent:'center' }}>
        <button style={S.btnDng} onClick={onYes}>Yes, Delete</button>
        <button style={S.btnSec} onClick={onNo}>Cancel</button>
      </div>
    </div>
  </div>
);

const FG = ({ label, children, cols=1 }) => (
  <div style={{ gridColumn:`span ${cols}` }}>
    <label style={S.label}>{label}</label>
    {children}
  </div>
);

const CB = ({ id, checked, onChange, label, color=C.gold }) => (
  <label htmlFor={id} style={{ display:'flex', alignItems:'center', gap:'14px', cursor:'pointer', padding:'14px 18px', background:'rgba(255,255,255,0.03)', border:`1px solid ${C.border}`, borderRadius:'10px', userSelect:'none' }}>
    <div style={{ width:'26px', height:'26px', borderRadius:'6px', flexShrink:0, background:checked?color:'transparent', border:`2px solid ${checked?color:C.border}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
      {checked && <span style={{ color:'#0a0810', fontSize:'1rem', fontWeight:900 }}>✓</span>}
    </div>
    <input type="checkbox" id={id} checked={checked} onChange={onChange} style={{ display:'none' }}/>
    <span style={{ fontSize:'1rem', color:C.ivory, fontWeight:500 }}>{label}</span>
  </label>
);

const Badge = ({ text, color='gold' }) => {
  const bg = { gold:'rgba(201,152,10,0.15)', green:'rgba(74,222,128,0.1)', red:'rgba(248,113,113,0.1)', violet:'rgba(92,26,138,0.2)' };
  const fg = { gold:C.gold, green:C.green, red:C.red, violet:'#c084fc' };
  return <span style={{ ...S.tag, background:bg[color]||bg.gold, color:fg[color]||fg.gold, border:`1px solid ${fg[color]||fg.gold}30` }}>{text}</span>;
};

const Table = ({ cols, rows, onEdit, onDelete }) => (
  <div style={{ overflowX:'auto' }}>
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.92rem' }}>
      <thead>
        <tr>{cols.map(c => <th key={c.key} style={{ textAlign:'left', padding:'12px 14px', borderBottom:`1px solid ${C.border}`, fontFamily:C.mono, fontSize:'0.72rem', color:C.muted, letterSpacing:'0.1em', fontWeight:400 }}>{c.label.toUpperCase()}</th>)}<th style={{ width:'120px', borderBottom:`1px solid ${C.border}` }}/></tr>
      </thead>
      <tbody>
        {rows.length===0 ? <tr><td colSpan={cols.length+1}><Empty/></td></tr> : rows.map((row,i) => (
          <tr key={row.id||i} style={{ borderBottom:`1px solid ${C.border}` }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.025)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            {cols.map(c => <td key={c.key} style={{ padding:'12px 14px', color:C.ivoryD }}>{c.render?c.render(row):(row[c.key]??'—')}</td>)}
            <td style={{ padding:'10px 14px' }}><div style={{ display:'flex', gap:'8px' }}>{onEdit&&<button style={S.btnSm} onClick={()=>onEdit(row)}>Edit</button>}{onDelete&&<button style={S.btnDng} onClick={()=>onDelete(row)}>Del</button>}</div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ════════════════════════════════════════════════════════════
   TEAMS
════════════════════════════════════════════════════════════ */
const TeamsSection = ({ toast, refreshBootstrap }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const blank = { name:'', short_code:'', is_golden_rock:false };
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => { setLoading(true); const r = await adminApi.getTeams(); if (r.success) setTeams(r.data); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name||!form.short_code) return toast('Name and short code are required','err');
    const r = editing ? await adminApi.updateTeam(editing.id,form) : await adminApi.createTeam(form);
    if (r.success) { toast(r.message,'ok'); load(); refreshBootstrap(); setEditing(null); setForm(blank); }
    else toast(r.message,'err');
  };
  const del = async (team) => {
    const r = await adminApi.deleteTeam(team.id);
    if (r.success) { toast(r.message,'ok'); load(); refreshBootstrap(); }
    else toast(r.message,'err');
    setConfirm(null);
  };

  return (
    <div>
      {confirm && <Confirm msg={`Delete "${confirm.name}"? This removes all related matches too.`} onYes={()=>del(confirm)} onNo={()=>setConfirm(null)}/>}
      <span style={S.eyebrow}>Club Management</span><h1 style={S.h1}>Teams</h1>
      <div style={S.card}>
        <h2 style={S.h2}>{editing?'✏️ Edit Team':'➕ Add New Team'}</h2>
        <div style={{...S.row, gridTemplateColumns:'1fr 1fr'}}>
          <FG label="Team Name *"><input style={S.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Royal Strikers FC"/></FG>
          <FG label="Short Code * (max 3 characters)"><input style={S.input} value={form.short_code} maxLength={3} onChange={e=>setForm(f=>({...f,short_code:e.target.value.toUpperCase()}))} placeholder="RS"/></FG>
        </div>
        <div style={{marginBottom:'20px'}}>
          <CB id="grCheck" checked={form.is_golden_rock} onChange={e=>setForm(f=>({...f,is_golden_rock:e.target.checked}))} label="This is a Golden Rock FC squad (internal team — not an opponent)"/>
        </div>
        <div style={{display:'flex',gap:'12px'}}>
          <button style={S.btnPri} onClick={save}>{editing?'Update Team':'Add Team'}</button>
          {editing&&<button style={S.btnSec} onClick={()=>{setEditing(null);setForm(blank);}}>Cancel</button>}
        </div>
      </div>
      <div style={S.card}>
        <h2 style={S.h2}>All Teams ({teams.length})</h2>
        {loading?<Spinner/>:<Table cols={[{key:'name',label:'Team Name'},{key:'short_code',label:'Code'},{key:'is_golden_rock',label:'Type',render:r=>r.is_golden_rock?<Badge text="GR Squad" color="gold"/>:<Badge text="Opponent" color="violet"/>}]} rows={teams} onEdit={r=>{setEditing(r);setForm({name:r.name,short_code:r.short_code,is_golden_rock:r.is_golden_rock});}} onDelete={r=>setConfirm(r)}/>}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   PLAYERS
════════════════════════════════════════════════════════════ */
const POSITIONS = ['GK','DEF','MID','FWD'];

const PlayersSection = ({ toast, bootstrap, refreshBootstrap }) => {
  const [players,setPlayers]=useState([]); const [loading,setLoading]=useState(true); const [editing,setEditing]=useState(null); const [confirm,setConfirm]=useState(null);
  const blank={name:'',nickname:'',initials:'',position:'FWD',number:'',role_tag:'',joined_year:new Date().getFullYear(),is_featured:false,is_active:true,current_team:''};
  const [form,setForm]=useState(blank);
  const load=useCallback(async()=>{setLoading(true);const r=await adminApi.getPlayers();if(r.success)setPlayers(r.data);setLoading(false);},[]);
  useEffect(()=>{load();},[load]);
  const autoI=name=>name.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase();
  const save=async()=>{
    if(!form.name||!form.position||!form.number)return toast('Name, position, and number are required','err');
    const payload={...form,current_team:form.current_team||null,nickname:form.nickname||null,role_tag:form.role_tag||null};
    const r=editing?await adminApi.updatePlayer(editing.id,payload):await adminApi.createPlayer(payload);
    if(r.success){toast(r.message,'ok');load();refreshBootstrap();setEditing(null);setForm(blank);}else toast(r.message,'err');
  };
  const del=async(p)=>{const r=await adminApi.deletePlayer(p.id);if(r.success){toast(r.message,'ok');load();refreshBootstrap();}else toast(r.message,'err');setConfirm(null);};
  const teams=(bootstrap?.teams||[]).filter(t=>t.is_golden_rock);
  return (
    <div>
      {confirm&&<Confirm msg={`Delete player "${confirm.name}"?`} onYes={()=>del(confirm)} onNo={()=>setConfirm(null)}/>}
      <span style={S.eyebrow}>Squad Management</span><h1 style={S.h1}>Players</h1>
      <div style={S.card}>
        <h2 style={S.h2}>{editing?'✏️ Edit Player':'➕ Add New Player'}</h2>
        <div style={{...S.row,gridTemplateColumns:'1fr 1fr 1fr'}}>
          <FG label="Full Name *" cols={2}><input style={S.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value,initials:autoI(e.target.value)}))} placeholder="Marcus Silva"/></FG>
          <FG label="Initials (auto)"><input style={S.input} value={form.initials} maxLength={3} onChange={e=>setForm(f=>({...f,initials:e.target.value.toUpperCase()}))} placeholder="MS"/></FG>
          <FG label="Nickname (optional)"><input style={S.input} value={form.nickname||''} onChange={e=>setForm(f=>({...f,nickname:e.target.value}))} placeholder="Lightning"/></FG>
          <FG label="Position *"><select style={S.select} value={form.position} onChange={e=>setForm(f=>({...f,position:e.target.value}))}>{POSITIONS.map(p=><option key={p} value={p}>{p==='GK'?'GK — Goalkeeper':p==='DEF'?'DEF — Defender':p==='MID'?'MID — Midfielder':'FWD — Forward'}</option>)}</select></FG>
          <FG label="Squad Number *"><input style={S.input} type="number" value={form.number} onChange={e=>setForm(f=>({...f,number:e.target.value}))} placeholder="10"/></FG>
          <FG label="Role Tag (optional)"><input style={S.input} value={form.role_tag||''} onChange={e=>setForm(f=>({...f,role_tag:e.target.value}))} placeholder="Captain, Golden Boot…"/></FG>
          <FG label="Year Joined *"><input style={S.input} type="number" value={form.joined_year} onChange={e=>setForm(f=>({...f,joined_year:e.target.value}))} placeholder="2019"/></FG>
          <FG label="Current Team (display only)"><select style={S.select} value={form.current_team||''} onChange={e=>setForm(f=>({...f,current_team:e.target.value}))}><option value="">— None —</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></FG>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'22px'}}>
          <CB id="featuredCheck" checked={form.is_featured} onChange={e=>setForm(f=>({...f,is_featured:e.target.checked}))} label="Featured Player — shown with gold card on Players page" color={C.gold}/>
          <CB id="activeCheck" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} label="Active Squad Member — appears in squad list" color={C.green}/>
        </div>
        <div style={{display:'flex',gap:'12px'}}>
          <button style={S.btnPri} onClick={save}>{editing?'Update Player':'Add Player'}</button>
          {editing&&<button style={S.btnSec} onClick={()=>{setEditing(null);setForm(blank);}}>Cancel</button>}
        </div>
      </div>
      <div style={S.card}>
        <h2 style={S.h2}>Squad ({players.length} players)</h2>
        {loading?<Spinner/>:<Table cols={[{key:'number',label:'#',render:r=>`#${r.number}`},{key:'name',label:'Name'},{key:'position',label:'Pos',render:r=><Badge text={r.position} color={r.position==='GK'?'green':r.position==='DEF'?'violet':r.position==='MID'?'gold':'red'}/>},{key:'is_active',label:'Status',render:r=>r.is_active?<Badge text="Active" color="green"/>:<Badge text="Inactive" color="red"/>},{key:'is_featured',label:'Featured',render:r=>r.is_featured?<Badge text="⭐ Featured" color="gold"/>:''},{key:'joined_year',label:'Joined'}]} rows={players}
          onEdit={r=>{setEditing(r);setForm({name:r.name,nickname:r.nickname||'',initials:r.initials,position:r.position,number:r.number,role_tag:r.role_tag||'',joined_year:r.joined_year,is_featured:r.is_featured,is_active:r.is_active,current_team:r.current_team?.id||''});}}
          onDelete={r=>setConfirm(r)}/>}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MATCHES
   KEY FIX 1: date is sent as-is from datetime-local input
   ("2026-07-05T06:00"). The backend parse_dt() function handles
   this correctly using Django's parse_datetime utility.

   KEY FIX 2: on success → toast shown, all fields reset to blank,
   tab stays on 'add' so user can see the cleared form.
   The match list refreshes so they can confirm the record appears.
════════════════════════════════════════════════════════════ */
const MatchesSection = ({ toast, bootstrap }) => {
  const [matches,  setMatches]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('list');
  const [selMatch, setSelMatch] = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [saving,   setSaving]   = useState(false);

  const blank = { date:'', competition:'', venue:'', home_team:'', away_team:'', home_score:0, away_score:0, result:'win', match_type:'external', notes:'', tournament_id:'' };
  const [form, setForm] = useState(blank);

  const teams   = bootstrap?.teams   || [];
  const players = bootstrap?.players || [];
  const tournaments = bootstrap?.tournaments || []; 

  const load = useCallback(async () => {
    setLoading(true);
    const r = await adminApi.getMatches();
    if (r.success) setMatches(r.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── SAVE MATCH ─────────────────────────────────────────
     The date field value from datetime-local is e.g. "2026-07-05T06:00".
     We send it directly to Django — the backend parse_dt() converts
     the T-separated string to a proper Python datetime before saving.
     Previously we had date = data['date'] which Django accepted as
     a raw string BUT then .date attribute call on the string object
     later crashed with "'str' object has no attribute 'date'".
     The real fix is in admin_views.py using parse_datetime().
  ── ─────────────────────────────────────────────────────── */
  const saveMatch = async () => {
    if (!form.date)         return toast('Date and time are required', 'err');
    if (!form.competition)  return toast('Competition name is required', 'err');
    if (!form.venue)        return toast('Venue is required', 'err');
    if (!form.home_team)    return toast('Home team is required', 'err');
    if (!form.away_team)    return toast('Away team is required', 'err');
    if (form.home_team === form.away_team) return toast('Home and away teams must be different', 'err');

    if (form.match_type === 'tournament' && !form.tournament_id)
      return toast('Please select a tournament', 'err');

    setSaving(true);
    const r = await adminApi.createMatch(form);
    setSaving(false);

    if (r.success) {
      // ✅ Success: show toast, reset ALL fields, reload list
      toast(r.message, 'ok');
      setForm(blank);   // ← resets every field to empty
      load();           // ← refreshes the match list immediately
      // Stay on 'add' tab so user can see the cleared form
    } else {
      // ✗ Error: show what went wrong, keep form filled
      toast(r.message || 'Failed to record match — check the server logs', 'err');
    }
  };

  const delMatch = async (m) => {
    const r = await adminApi.deleteMatch(m.id);
    if (r.success) { toast(r.message, 'ok'); load(); }
    else toast(r.message, 'err');
    setConfirm(null);
  };

  const matchTypeInfo = {
    internal:   { label:'Internal',   color:'violet', note:'→ Shown on Daily page' },
    external:   { label:'External',   color:'gold',   note:'→ Shown on Matches page' },
    friendly:   { label:'Friendly',   color:'green',  note:'→ Shown on Matches page' },
    tournament: { label:'Tournament', color:'red',    note:'→ Shown on Matches page' },
  };

  return (
    <div>
      {confirm && <Confirm msg="Delete this match? All goals, squad entries, and daily entries will be removed." onYes={()=>delMatch(confirm)} onNo={()=>setConfirm(null)}/>}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'26px' }}>
        <div><span style={S.eyebrow}>Match Management</span><h1 style={S.h1}>Matches</h1></div>
        <div style={{ display:'flex', gap:'10px' }}>
          {[{id:'list',label:'📋 All Matches'},{id:'add',label:'➕ Record Match'}].map(t => (
            <button key={t.id} style={{ ...S.btnSec, borderColor:tab===t.id?C.gold:C.border, color:tab===t.id?C.gold:C.ivoryD }} onClick={() => { setTab(t.id); setSelMatch(null); }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── ADD MATCH FORM ─────────────────────────────── */}
      {tab === 'add' && (
        <div style={S.card}>
          <h2 style={S.h2}>➕ Record New Match</h2>

          {/* Match type selector cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'22px' }}>
            {Object.entries(matchTypeInfo).map(([v, info]) => (
              <div key={v} onClick={() => setForm(f=>({...f, match_type:v}))}
                style={{ padding:'14px', borderRadius:'10px', cursor:'pointer', transition:'all 0.15s', border:`2px solid ${form.match_type===v?C.gold:C.border}`, background:form.match_type===v?'rgba(201,152,10,0.08)':'transparent' }}
              >
                <div style={{ fontSize:'0.95rem', fontWeight:600, color:form.match_type===v?C.gold:C.ivory, marginBottom:'4px' }}>{info.label}</div>
                <div style={{ fontSize:'0.75rem', color:C.muted, fontFamily:C.mono }}>{info.note}</div>
              </div>
            ))}
          </div>

          {/* ✅ ADD THIS HERE */}
          {form.match_type === 'tournament' && (
            <div style={{ marginBottom:'18px', padding:'16px', background:'rgba(201,152,10,0.06)', border:`1px solid rgba(201,152,10,0.3)`, borderRadius:'10px' }}>
              <label style={S.label}>🏆 Link to Tournament *</label>
              <select
                style={S.select}
                value={form.tournament_id}
                onChange={e => setForm(f => ({ ...f, tournament_id: e.target.value }))}
              >
                <option value="">— Select tournament —</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.year})
                  </option>
                ))}
              </select>

              {tournaments.length === 0 && (
                <div style={{ marginTop:'8px', fontSize:'0.78rem', color:'#f87171' }}>
                  No tournaments found. Create a tournament first.
                </div>
              )}
            </div>
          )}

          <div style={{ ...S.row, gridTemplateColumns:'1fr 1fr 1fr' }}>
            <FG label="Date & Time *">
              <input type="datetime-local" style={S.input} value={form.date} onChange={e => setForm(f=>({...f, date:e.target.value}))}/>
            </FG>
            <FG label="Competition *">
              <input style={S.input} value={form.competition} onChange={e => setForm(f=>({...f, competition:e.target.value}))} placeholder="Premier League"/>
            </FG>
            <FG label="Venue *">
              <input style={S.input} value={form.venue} onChange={e => setForm(f=>({...f, venue:e.target.value}))} placeholder="Thunder Arena"/>
            </FG>
            <FG label="Home Team *">
              <select style={S.select} value={form.home_team} onChange={e => setForm(f=>({...f, home_team:e.target.value}))}>
                <option value="">— Select home team —</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name} [{t.short_code}]</option>)}
              </select>
            </FG>
            <FG label="Away Team *">
              <select style={S.select} value={form.away_team} onChange={e => setForm(f=>({...f, away_team:e.target.value}))}>
                <option value="">— Select away team —</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name} [{t.short_code}]</option>)}
              </select>
            </FG>
            <FG label="Result *">
              <select style={S.select} value={form.result} onChange={e => setForm(f=>({...f, result:e.target.value}))}>
                <option value="win">Win</option>
                <option value="draw">Draw</option>
                <option value="loss">Loss</option>
              </select>
            </FG>
            <FG label="Home Score">
              <input type="number" min={0} style={S.input} value={form.home_score} onChange={e => setForm(f=>({...f, home_score:Number(e.target.value)}))}/>
            </FG>
            <FG label="Away Score">
              <input type="number" min={0} style={S.input} value={form.away_score} onChange={e => setForm(f=>({...f, away_score:Number(e.target.value)}))}/>
            </FG>
            <FG label="Match Notes (optional)" cols={3}>
              <textarea style={S.textarea} value={form.notes} onChange={e => setForm(f=>({...f, notes:e.target.value}))} placeholder="Optional notes about this match…"/>
            </FG>
          </div>

          <button style={{ ...S.btnPri, opacity:saving?0.6:1 }} onClick={saveMatch} disabled={saving}>
            {saving ? '⏳ Saving…' : '✓ Record Match'}
          </button>
        </div>
      )}

      {/* ── MATCH LIST ────────────────────────────────── */}
      {tab === 'list' && (
        <div style={S.card}>
          {loading ? <Spinner/> : matches.length === 0 ? <Empty msg="No matches yet. Use 'Record Match' to add one."/> : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {matches.map(m => {
                const mtInfo = matchTypeInfo[m.match_type] || matchTypeInfo.external;
                return (
                  <div key={m.id} style={{ ...S.cardSm, display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
                    <div style={{ fontFamily:C.mono, fontSize:'0.78rem', color:C.muted, minWidth:'92px' }}>
                      {new Date(m.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                    </div>
                    <div style={{ flex:1, fontWeight:600, fontSize:'0.95rem' }}>
                      {m.home_team_name} <span style={{color:C.muted}}>vs</span> {m.away_team_name}
                    </div>
                    <div style={{ fontFamily:C.mono, fontSize:'0.85rem', color:C.ivory }}>{m.home_score} – {m.away_score}</div>
                    <Badge text={m.result?.toUpperCase()} color={m.result==='win'?'green':m.result==='draw'?'gold':'red'}/>
                    <Badge text={mtInfo.label} color={mtInfo.color}/>
                    <div style={{ fontFamily:C.mono, fontSize:'0.75rem', color:C.muted }}>{m.competition}</div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button style={S.btnSm} onClick={() => { setSelMatch(m); setTab('detail'); }}>⚽ Add Details</button>
                      <button style={S.btnDng} onClick={() => setConfirm(m)}>Del</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MATCH DETAIL ──────────────────────────────── */}
      {tab === 'detail' && selMatch && (
        <MatchDetail match={selMatch} teams={teams} players={players} toast={toast} onBack={() => { setTab('list'); setSelMatch(null); }}/>
      )}
    </div>
  );
};

/* ── Match Detail ─────────────────────────────────────────── */
const MatchDetail = ({ match, teams, players, toast, onBack }) => {
  const [goals,       setGoals]       = useState([]);
  const [appearances, setAppearances] = useState([]);
  const [daily,       setDaily]       = useState(null);
  const [activeTab,   setActiveTab]   = useState('goals');
  const [gForm, setGForm] = useState({ player_id:'', team_id:'', minute:'', is_own_goal:false });
  const [aForm, setAForm] = useState({ player_id:'', team_id:'', rating:'', assists:0, is_motm:false, is_substitute:false });
  const [dForm, setDForm] = useState({ date:match.date?.split('T')[0]||'', competition:match.competition||'', notes:'', motm_player_id:'', motm_goals:0, motm_assists:0, motm_rating:'' });

  const load = useCallback(async () => {
    const [g, a, d] = await Promise.all([adminApi.getGoals(match.id), adminApi.getAppearances(match.id), adminApi.getDailyByMatch(match.id)]);
    if (g.success) setGoals(g.data);
    if (a.success) setAppearances(a.data);
    if (d.success && d.data) { setDaily(d.data); setDForm({ date:d.data.date, competition:d.data.competition, notes:d.data.notes, motm_player_id:d.data.motm_player_id||'', motm_goals:d.data.motm_goals, motm_assists:d.data.motm_assists, motm_rating:d.data.motm_rating||'' }); }
  }, [match.id]);

  useEffect(() => { load(); }, [load]);

  const addGoal = async () => {
    if (!gForm.player_id||!gForm.team_id||!gForm.minute) return toast('Player, team and minute are required','err');
    const r = await adminApi.createGoal({ match_id:match.id, ...gForm });
    if (r.success) { toast('Goal added ⚽','ok'); load(); setGForm({ player_id:'', team_id:'', minute:'', is_own_goal:false }); }
    else toast(r.message,'err');
  };

  const delGoal = async (id) => { const r = await adminApi.deleteGoal(id); if (r.success) { toast('Goal removed','ok'); load(); } else toast(r.message,'err'); };

  const saveAppearance = async () => {
    if (!aForm.player_id||!aForm.team_id) return toast('Player and team are required','err');
    const r = await adminApi.saveAppearance({ match_id:match.id, ...aForm });
    if (r.success) { toast('Appearance saved','ok'); load(); setAForm({ player_id:'', team_id:'', rating:'', assists:0, is_motm:false, is_substitute:false }); }
    else toast(r.message,'err');
  };

  const delAppearance = async (id) => { const r = await adminApi.deleteAppearance(id); if (r.success) { toast('Removed','ok'); load(); } else toast(r.message,'err'); };

  const saveDaily = async () => {
    if (!dForm.date||!dForm.competition) return toast('Date and competition are required','err');
    const r = await adminApi.saveDailyEntry({ match_id:match.id, ...dForm });
    if (r.success) { toast('Daily entry saved','ok'); load(); } else toast(r.message,'err');
  };

  return (
    <div>
      <button style={{ ...S.btnSec, marginBottom:'22px' }} onClick={onBack}>← Back to Matches</button>
      <div style={{ ...S.card, background:'linear-gradient(135deg,rgba(92,26,138,0.15),rgba(201,152,10,0.08))', borderColor:C.borderBr, marginBottom:'22px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
          <div>
            <div style={{ fontFamily:C.mono, fontSize:'0.75rem', color:C.muted, marginBottom:'6px' }}>{new Date(match.date).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · {match.venue}</div>
            <div style={{ fontFamily:C.serif, fontSize:'1.6rem', color:C.ivory }}>{match.home_team_name} <span style={{color:C.muted,fontSize:'1.1rem'}}>vs</span> {match.away_team_name}</div>
            <div style={{ fontFamily:C.mono, fontSize:'0.8rem', color:C.muted, marginTop:'4px' }}>{match.competition}</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:C.serif, fontSize:'3rem', color:C.gold, letterSpacing:'10px' }}>{match.home_score} — {match.away_score}</div>
            <Badge text={match.result?.toUpperCase()} color={match.result==='win'?'green':match.result==='draw'?'gold':'red'}/>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:'10px', marginBottom:'22px' }}>
        {[{id:'goals',label:'⚽ Goals'},{id:'squad',label:'👥 Squad & Appearances'},{id:'daily',label:'📋 Daily Entry'}].map(t => (
          <button key={t.id} style={{ ...S.btnSec, borderColor:activeTab===t.id?C.gold:C.border, color:activeTab===t.id?C.gold:C.ivoryD }} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'goals' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'22px' }}>
          <div style={S.card}>
            <h2 style={S.h2}>Add Goal</h2>
            <FG label="Goalscorer *"><select style={S.select} value={gForm.player_id} onChange={e=>setGForm(f=>({...f,player_id:e.target.value}))}><option value="">— Select player —</option>{players.map(p=><option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}</select></FG>
            <div style={{height:14}}/>
            <FG label="Scoring Team *"><select style={S.select} value={gForm.team_id} onChange={e=>setGForm(f=>({...f,team_id:e.target.value}))}><option value="">— Select team —</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></FG>
            <div style={{height:14}}/>
            <FG label="Minute *"><input type="number" min={1} max={120} style={S.input} value={gForm.minute} onChange={e=>setGForm(f=>({...f,minute:e.target.value}))} placeholder="23"/></FG>
            <div style={{height:14}}/>
            <div style={{marginBottom:'18px'}}><CB id="ownGoal" checked={gForm.is_own_goal} onChange={e=>setGForm(f=>({...f,is_own_goal:e.target.checked}))} label="Own Goal" color={C.red}/></div>
            <button style={S.btnPri} onClick={addGoal}>Add Goal</button>
          </div>
          <div style={S.card}>
            <h2 style={S.h2}>Goals Recorded ({goals.length})</h2>
            {goals.length===0?<Empty msg="No goals yet"/>:goals.map(g=>(
              <div key={g.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                <div style={{fontSize:'0.95rem'}}><span style={{fontWeight:600}}>{g.player_name}</span><span style={{color:C.muted,marginLeft:'8px',fontSize:'0.82rem'}}>{g.team_name}</span>{g.is_own_goal&&<Badge text="OG" color="red"/>}</div>
                <div style={{display:'flex',gap:'10px',alignItems:'center'}}><span style={{fontFamily:C.mono,color:C.gold,fontSize:'0.9rem'}}>{g.minute}'</span><button style={S.btnDng} onClick={()=>delGoal(g.id)}>✕</button></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'squad' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'22px' }}>
          <div style={S.card}>
            <h2 style={S.h2}>Add Player Appearance</h2>
            <FG label="Player *"><select style={S.select} value={aForm.player_id} onChange={e=>setAForm(f=>({...f,player_id:e.target.value}))}><option value="">— Select player —</option>{players.map(p=><option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}</select></FG>
            <div style={{height:14}}/>
            <FG label="Playing For Team *"><select style={S.select} value={aForm.team_id} onChange={e=>setAForm(f=>({...f,team_id:e.target.value}))}><option value="">— Select team —</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></FG>
            <div style={{height:14}}/>
            <div style={{...S.row,gridTemplateColumns:'1fr 1fr'}}>
              <FG label="Rating (0–10)"><input type="number" min={0} max={10} step={0.1} style={S.input} value={aForm.rating} onChange={e=>setAForm(f=>({...f,rating:e.target.value}))} placeholder="8.5"/></FG>
              <FG label="Assists"><input type="number" min={0} style={S.input} value={aForm.assists} onChange={e=>setAForm(f=>({...f,assists:Number(e.target.value)}))}/></FG>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'18px'}}>
              <CB id="motmCheck" checked={aForm.is_motm} onChange={e=>setAForm(f=>({...f,is_motm:e.target.checked}))} label="Man of the Match ⭐" color={C.gold}/>
              <CB id="subCheck" checked={aForm.is_substitute} onChange={e=>setAForm(f=>({...f,is_substitute:e.target.checked}))} label="Substitute" color={C.violet}/>
            </div>
            <button style={S.btnPri} onClick={saveAppearance}>Save Appearance</button>
          </div>
          <div style={S.card}>
            <h2 style={S.h2}>Squad ({appearances.length} players)</h2>
            {appearances.length===0?<Empty msg="No appearances yet"/>:appearances.map(a=>(
              <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                <div style={{fontSize:'0.95rem'}}><span style={{fontWeight:600}}>{a.player_name}</span><span style={{color:C.muted,marginLeft:'8px',fontSize:'0.8rem'}}>{a.team_name}</span>{a.is_motm&&<span style={{marginLeft:'6px'}}>⭐</span>}{a.is_substitute&&<Badge text="SUB" color="violet"/>}</div>
                <div style={{display:'flex',gap:'10px',alignItems:'center'}}>{a.rating&&<span style={{fontFamily:C.mono,fontSize:'0.82rem',color:C.gold}}>{a.rating}</span>}{a.assists>0&&<span style={{fontFamily:C.mono,fontSize:'0.82rem',color:C.green}}>+{a.assists}A</span>}<button style={S.btnDng} onClick={()=>delAppearance(a.id)}>✕</button></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'daily' && (
        <div style={S.card}>
          <h2 style={S.h2}>{daily?'✏️ Update Daily Entry':'➕ Create Daily Entry'}</h2>
          <div style={{...S.row,gridTemplateColumns:'1fr 1fr 1fr'}}>
            <FG label="Date *"><input type="date" style={S.input} value={dForm.date} onChange={e=>setDForm(f=>({...f,date:e.target.value}))}/></FG>
            <FG label="Competition *" cols={2}><input style={S.input} value={dForm.competition} onChange={e=>setDForm(f=>({...f,competition:e.target.value}))} placeholder="Premier League"/></FG>
            <FG label="Notes / Match Summary" cols={3}><textarea style={S.textarea} value={dForm.notes} onChange={e=>setDForm(f=>({...f,notes:e.target.value}))} placeholder="Tactical notes, key moments…"/></FG>
            <FG label="Man of the Match"><select style={S.select} value={dForm.motm_player_id} onChange={e=>setDForm(f=>({...f,motm_player_id:e.target.value}))}><option value="">— None —</option>{players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></FG>
            <FG label="MOTM Goals"><input type="number" min={0} style={S.input} value={dForm.motm_goals} onChange={e=>setDForm(f=>({...f,motm_goals:Number(e.target.value)}))}/></FG>
            <FG label="MOTM Assists"><input type="number" min={0} style={S.input} value={dForm.motm_assists} onChange={e=>setDForm(f=>({...f,motm_assists:Number(e.target.value)}))}/></FG>
            <FG label="MOTM Rating (0–10)"><input type="number" min={0} max={10} step={0.1} style={S.input} value={dForm.motm_rating} onChange={e=>setDForm(f=>({...f,motm_rating:e.target.value}))} placeholder="9.2"/></FG>
          </div>
          <button style={S.btnPri} onClick={saveDaily}>Save Daily Entry</button>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   TOURNAMENTS
════════════════════════════════════════════════════════════ */
const TournamentsSection = ({ toast, bootstrap }) => {
  const [tours,setTours]=useState([]); const [loading,setLoading]=useState(true); const [confirm,setConfirm]=useState(null); const [selTour,setSelTour]=useState(null); const [editing,setEditing]=useState(null);
  const blank={name:'',result:'champions',dates:'',venue:'',total_teams:0,total_matches:0,total_goals:0,year:new Date().getFullYear()};
  const [form,setForm]=useState(blank);
  const players=bootstrap?.players||[];
  const load=useCallback(async()=>{setLoading(true);const r=await adminApi.getTournaments();if(r.success)setTours(r.data);setLoading(false);},[]);
  useEffect(()=>{load();},[load]);
  const save=async()=>{if(!form.name||!form.dates||!form.venue)return toast('Name, dates and venue required','err');const r=editing?await adminApi.updateTournament(editing.id,form):await adminApi.createTournament(form);if(r.success){toast(r.message,'ok');load();setEditing(null);setForm(blank);}else toast(r.message,'err');};
  const del=async(t)=>{const r=await adminApi.deleteTournament(t.id);if(r.success){toast(r.message,'ok');load();}else toast(r.message,'err');setConfirm(null);};
  const togglePlayer=async(tId,pId,has)=>{const r=has?await adminApi.removeSquadPlayer({tournament_id:tId,player_id:pId}):await adminApi.addSquadPlayer({tournament_id:tId,player_id:pId});if(r.success)load();else toast(r.message,'err');};
  const RESULT_OPTS=[{v:'champions',l:'Champions 🏆'},{v:'runners',l:'Runners Up 🥈'},{v:'semis',l:'Semi Finals 🥉'},{v:'quarters',l:'Quarter Finals'}];
  return (
    <div>
      {confirm&&<Confirm msg={`Delete tournament "${confirm.name}"?`} onYes={()=>del(confirm)} onNo={()=>setConfirm(null)}/>}
      <span style={S.eyebrow}>Tournament Management</span><h1 style={S.h1}>Tournaments</h1>
      <div style={S.card}>
        <h2 style={S.h2}>{editing?'✏️ Edit Tournament':'➕ Add Tournament'}</h2>
        <div style={{...S.row,gridTemplateColumns:'1fr 1fr 1fr'}}>
          <FG label="Tournament Name *" cols={2}><input style={S.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Thunder Summer Cup 2024"/></FG>
          <FG label="Year *"><input type="number" style={S.input} value={form.year} onChange={e=>setForm(f=>({...f,year:Number(e.target.value)}))}/></FG>
          <FG label="Dates *" cols={2}><input style={S.input} value={form.dates} onChange={e=>setForm(f=>({...f,dates:e.target.value}))} placeholder="Aug 10 – 15, 2024"/></FG>
          <FG label="Final Result"><select style={S.select} value={form.result} onChange={e=>setForm(f=>({...f,result:e.target.value}))}>{RESULT_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select></FG>
          <FG label="Venue *" cols={3}><input style={S.input} value={form.venue} onChange={e=>setForm(f=>({...f,venue:e.target.value}))} placeholder="Thunder City Stadium"/></FG>
          <FG label="Total Teams"><input type="number" min={0} style={S.input} value={form.total_teams} onChange={e=>setForm(f=>({...f,total_teams:Number(e.target.value)}))}/></FG>
          <FG label="Total Matches Played"><input type="number" min={0} style={S.input} value={form.total_matches} onChange={e=>setForm(f=>({...f,total_matches:Number(e.target.value)}))}/></FG>
          <FG label="Total Goals Scored"><input type="number" min={0} style={S.input} value={form.total_goals} onChange={e=>setForm(f=>({...f,total_goals:Number(e.target.value)}))}/></FG>
        </div>
        <div style={{display:'flex',gap:'12px'}}>
          <button style={S.btnPri} onClick={save}>{editing?'Update':'Add Tournament'}</button>
          {editing&&<button style={S.btnSec} onClick={()=>{setEditing(null);setForm(blank);}}>Cancel</button>}
        </div>
      </div>
      <div style={S.card}>
        {loading?<Spinner/>:tours.length===0?<Empty/>:(
          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            {tours.map(t=>(
              <div key={t.id} style={S.cardSm}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:selTour?.id===t.id?'18px':'0'}}>
                  <div><span style={{fontWeight:700,fontSize:'1rem',marginRight:'12px'}}>{t.name}</span><Badge text={t.result} color={t.result==='champions'?'gold':'violet'}/><span style={{color:C.muted,fontSize:'0.82rem',marginLeft:'10px'}}>{t.year}</span></div>
                  <div style={{display:'flex',gap:'8px'}}>
                    <button style={S.btnSm} onClick={()=>setSelTour(selTour?.id===t.id?null:t)}>{selTour?.id===t.id?'Close ▴':'Squad ▾'}</button>
                    <button style={S.btnSm} onClick={()=>{setEditing(t);setForm({name:t.name,result:t.result,dates:t.dates,venue:t.venue,total_teams:t.total_teams,total_matches:t.total_matches,total_goals:t.total_goals,year:t.year});}}>Edit</button>
                    <button style={S.btnDng} onClick={()=>setConfirm(t)}>Del</button>
                  </div>
                </div>
                {selTour?.id===t.id&&(
                  <div>
                    <div style={{fontFamily:C.mono,fontSize:'0.7rem',color:C.gold,letterSpacing:'0.1em',marginBottom:'12px'}}>CLICK TO ADD / REMOVE PLAYERS FROM TOURNAMENT SQUAD</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                      {players.map(p=>{const inSquad=t.tournament_squads?.some(s=>s.player_name===p.name);return(<button key={p.id} onClick={()=>togglePlayer(t.id,p.id,inSquad)} style={{padding:'7px 14px',borderRadius:'20px',cursor:'pointer',fontSize:'0.85rem',fontFamily:C.mono,transition:'all 0.15s',background:inSquad?'rgba(201,152,10,0.2)':'transparent',border:inSquad?`1px solid ${C.gold}`:`1px solid ${C.border}`,color:inSquad?C.gold:C.muted}}>{inSquad?'✓ ':''}{p.name}</button>);})}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   CLUB — Staff, Partners, Assets
   KEY FIX: Club Assets now has FIXED 4 options only:
   Match Balls, Training Nets, Cones & Markers, First Aid Kits.
   No free-text label field. User picks the asset type from
   a dropdown and enters only the count.
   Backend uses update_or_create so saving "Match Balls = 20"
   twice just updates the count rather than creating duplicates.
════════════════════════════════════════════════════════════ */

// The 4 fixed asset types — matches ASSET_OPTIONS in admin_views.py
const FIXED_ASSETS = [
  { label:'Match Balls',     icon:'⚽' },
  { label:'Training Nets',   icon:'🥅' },
  { label:'Cones & Markers', icon:'🔶' },
  { label:'First Aid Kits',  icon:'🩺' },
];

const ClubSection = ({ toast }) => {
  const [staff,    setStaff]    = useState([]);
  const [partners, setPartners] = useState([]);
  const [assets,   setAssets]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('staff');
  const [editing,  setEditing]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);

  const blankS = { name:'', initials:'', role:'', joined_date:'', bio:'', badge_cls:'badge-gold' };
  const blankP = { name:'', initials:'', last_met:'' };
  // Asset form: just asset_type (dropdown) + count (number)
  const blankA = { asset_type: FIXED_ASSETS[0].label, count:'' };

  const [sForm, setSForm] = useState(blankS);
  const [pForm, setPForm] = useState(blankP);
  const [aForm, setAForm] = useState(blankA);
  const [aSaving, setASaving] = useState(false);

  const autoI = name => name.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase();

  const load = useCallback(async () => {
    setLoading(true);
    const [s, p, a] = await Promise.all([adminApi.getStaff(), adminApi.getPartners(), adminApi.getAssets()]);
    if (s.success) setStaff(s.data);
    if (p.success) setPartners(p.data);
    if (a.success) setAssets(a.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveStaff = async () => {
    if (!sForm.name||!sForm.role) return toast('Name and role required','err');
    const r = editing?.type==='staff' ? await adminApi.updateStaff(editing.id,sForm) : await adminApi.createStaff(sForm);
    if (r.success) { toast(r.message,'ok'); load(); setEditing(null); setSForm(blankS); } else toast(r.message,'err');
  };

  const savePartner = async () => {
    if (!pForm.name||!pForm.last_met) return toast('Name and last met date required','err');
    const r = editing?.type==='partner' ? await adminApi.updatePartner(editing.id,pForm) : await adminApi.createPartner(pForm);
    if (r.success) { toast(r.message,'ok'); load(); setEditing(null); setPForm(blankP); } else toast(r.message,'err');
  };

  const saveAsset = async () => {
    if (!aForm.asset_type) return toast('Select an asset type','err');
    if (!aForm.count || Number(aForm.count) < 0) return toast('Enter a valid count (0 or more)','err');
    setASaving(true);
    // Send asset_type + count — backend picks icon and label from fixed list
    const r = await adminApi.createAsset({ asset_type: aForm.asset_type, count: Number(aForm.count) });
    setASaving(false);
    if (r.success) {
      toast(r.message, 'ok');
      load();
      setAForm(blankA); // reset form
    } else {
      toast(r.message, 'err');
    }
  };

  const del = async (item) => {
    const fns = { staff:adminApi.deleteStaff, partner:adminApi.deletePartner, asset:adminApi.deleteAsset };
    const r = await fns[item.type](item.id);
    if (r.success) { toast(r.message,'ok'); load(); } else toast(r.message,'err');
    setConfirm(null);
  };

  const BADGE_OPTIONS = ['badge-gold','badge-draw','badge-violet','badge-win','badge-loss'];

  return (
    <div>
      {confirm&&<Confirm msg={`Delete "${confirm.name||confirm.label}"?`} onYes={()=>del(confirm)} onNo={()=>setConfirm(null)}/>}
      <span style={S.eyebrow}>Club Management</span><h1 style={S.h1}>Staff, Partners &amp; Assets</h1>

      <div style={{display:'flex',gap:'10px',marginBottom:'22px'}}>
        {[{id:'staff',l:'👥 Staff Members'},{id:'partners',l:'🤝 Partner Clubs'},{id:'assets',l:'🏟️ Club Assets'}].map(t=>(
          <button key={t.id} style={{...S.btnSec,borderColor:tab===t.id?C.gold:C.border,color:tab===t.id?C.gold:C.ivoryD}} onClick={()=>{setTab(t.id);setEditing(null);}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* STAFF */}
      {tab==='staff'&&(
        <>
          <div style={S.card}>
            <h2 style={S.h2}>{editing?.type==='staff'?'✏️ Edit Staff Member':'➕ Add Staff Member'}</h2>
            <div style={{...S.row,gridTemplateColumns:'1fr 1fr 1fr'}}>
              <FG label="Full Name *" cols={2}><input style={S.input} value={sForm.name} onChange={e=>setSForm(f=>({...f,name:e.target.value,initials:autoI(e.target.value)}))} placeholder="John Archer"/></FG>
              <FG label="Initials"><input style={S.input} value={sForm.initials} maxLength={3} onChange={e=>setSForm(f=>({...f,initials:e.target.value.toUpperCase()}))} placeholder="JA"/></FG>
              <FG label="Role / Designation *" cols={2}><input style={S.input} value={sForm.role} onChange={e=>setSForm(f=>({...f,role:e.target.value}))} placeholder="Club Captain, Treasurer…"/></FG>
              <FG label="Joined Date"><input style={S.input} value={sForm.joined_date} onChange={e=>setSForm(f=>({...f,joined_date:e.target.value}))} placeholder="Jan 2012"/></FG>
              <FG label="Badge Style"><select style={S.select} value={sForm.badge_cls} onChange={e=>setSForm(f=>({...f,badge_cls:e.target.value}))}>{BADGE_OPTIONS.map(b=><option key={b} value={b}>{b}</option>)}</select></FG>
              <FG label="Bio / Description" cols={3}><textarea style={S.textarea} value={sForm.bio} onChange={e=>setSForm(f=>({...f,bio:e.target.value}))} placeholder="Brief description…"/></FG>
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button style={S.btnPri} onClick={saveStaff}>{editing?.type==='staff'?'Update':'Add Staff'}</button>
              {editing?.type==='staff'&&<button style={S.btnSec} onClick={()=>{setEditing(null);setSForm(blankS);}}>Cancel</button>}
            </div>
          </div>
          <div style={S.card}>
            <h2 style={S.h2}>Staff Members ({staff.length})</h2>
            {loading?<Spinner/>:<Table cols={[{key:'initials',label:''},{key:'name',label:'Name'},{key:'role',label:'Role'},{key:'joined_date',label:'Joined'}]} rows={staff}
              onEdit={r=>{setEditing({...r,type:'staff'});setSForm({name:r.name,initials:r.initials,role:r.role,joined_date:r.joined_date,bio:r.bio,badge_cls:r.badge_cls||'badge-gold'});}}
              onDelete={r=>setConfirm({...r,type:'staff'})}/>}
          </div>
        </>
      )}

      {/* PARTNERS */}
      {tab==='partners'&&(
        <>
          <div style={S.card}>
            <h2 style={S.h2}>{editing?.type==='partner'?'✏️ Edit Partner':'➕ Add Partner Club'}</h2>
            <div style={{...S.row,gridTemplateColumns:'1fr 1fr 1fr'}}>
              <FG label="Club Name *" cols={2}><input style={S.input} value={pForm.name} onChange={e=>setPForm(f=>({...f,name:e.target.value,initials:autoI(e.target.value)}))} placeholder="Shadow Strikers FC"/></FG>
              <FG label="Initials"><input style={S.input} value={pForm.initials} maxLength={3} onChange={e=>setPForm(f=>({...f,initials:e.target.value.toUpperCase()}))} placeholder="SS"/></FG>
              <FG label="Last Met Date *" cols={3}><input type="date" style={S.input} value={pForm.last_met} onChange={e=>setPForm(f=>({...f,last_met:e.target.value}))}/></FG>
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button style={S.btnPri} onClick={savePartner}>{editing?.type==='partner'?'Update':'Add Partner'}</button>
              {editing?.type==='partner'&&<button style={S.btnSec} onClick={()=>{setEditing(null);setPForm(blankP);}}>Cancel</button>}
            </div>
          </div>
          <div style={S.card}>
            <h2 style={S.h2}>Partner Clubs ({partners.length})</h2>
            {loading?<Spinner/>:<Table cols={[{key:'initials',label:''},{key:'name',label:'Club Name'},{key:'last_met',label:'Last Met'}]} rows={partners}
              onEdit={r=>{setEditing({...r,type:'partner'});setPForm({name:r.name,initials:r.initials,last_met:r.last_met});}}
              onDelete={r=>setConfirm({...r,type:'partner'})}/>}
          </div>
        </>
      )}

      {/* ASSETS — fixed 4 options, count only */}
      {tab==='assets'&&(
        <>
          <div style={S.card}>
            <h2 style={S.h2}>Update Club Assets</h2>
            <p style={{color:C.muted,fontSize:'0.95rem',marginBottom:'24px',lineHeight:1.7}}>
              Set the current count for each club asset. These are shown dynamically on the public Club page.
              Saving the same asset type again will update its count.
            </p>

            <div style={{...S.row, gridTemplateColumns:'1fr 1fr'}}>
              <FG label="Asset Type *">
                <select style={S.select} value={aForm.asset_type} onChange={e=>setAForm(f=>({...f, asset_type:e.target.value}))}>
                  {FIXED_ASSETS.map(a => (
                    <option key={a.label} value={a.label}>{a.icon} {a.label}</option>
                  ))}
                </select>
              </FG>
              <FG label="Count *">
                <input
                  type="number"
                  min={0}
                  style={S.input}
                  value={aForm.count}
                  onChange={e=>setAForm(f=>({...f, count:e.target.value}))}
                  placeholder="e.g. 18"
                />
              </FG>
            </div>

            <button style={{...S.btnPri, opacity:aSaving?0.6:1}} onClick={saveAsset} disabled={aSaving}>
              {aSaving ? '⏳ Saving…' : '✓ Save Asset Count'}
            </button>
          </div>

          {/* Current asset counts */}
          <div style={S.card}>
            <h2 style={S.h2}>Current Club Assets</h2>
            {loading ? <Spinner/> : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:'16px'}}>
                {FIXED_ASSETS.map(fa => {
                  const saved = assets.find(a => a.label === fa.label);
                  return (
                    <div key={fa.label} style={{...S.cardSm, textAlign:'center', borderColor: saved ? C.borderBr : C.border}}>
                      <div style={{fontSize:'2.4rem', marginBottom:'8px'}}>{fa.icon}</div>
                      <div style={{fontFamily:C.serif, fontSize:'2rem', color: saved ? C.gold : C.muted, fontWeight:700}}>
                        {saved ? saved.count : '—'}
                      </div>
                      <div style={{fontFamily:C.mono, fontSize:'0.72rem', color:C.muted, letterSpacing:'0.08em', marginBottom: saved ? '12px' : '0'}}>
                        {fa.label.toUpperCase()}
                      </div>
                      {saved && (
                        <button style={S.btnDng} onClick={()=>setConfirm({...saved, name:saved.label, type:'asset'})}>
                          Delete
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SIDEBAR NAV + ROOT
════════════════════════════════════════════════════════════ */
const NAV = [
  {id:'teams',icon:'🏟️',label:'Teams'},
  {id:'players',icon:'👤',label:'Players'},
  {id:'matches',icon:'⚽',label:'Matches'},
  {id:'tournaments',icon:'🏆',label:'Tournaments'},
  {id:'club',icon:'🏢',label:'Club & Staff'},
];

export default function AdminPortal() {
  const [section,   setSection]   = useState('matches');
  const [bootstrap, setBootstrap] = useState(null);
  const [toast,     setToast]     = useState(null);
  const [authUser,  setAuthUser]  = useState(null);    // ← ADD
  const [checking,  setChecking]  = useState(true);    // ← ADD

  // ── Verify JWT token on every portal load ────────────────
  useEffect(() => {
    const verify = async () => {
      const res = await authApi.verify();
      if (!res.success) {
        // Token missing, invalid, or expired — send to login
        clearTokens();
        window.location.href = '/admin';
        return;
      }
      setAuthUser(res.data);    // store logged-in user info
      setChecking(false);
    };
    verify();
  }, []);

  // ── Logout handler ────────────────────────────────────────
  const handleLogout = async () => {
    await authApi.logout();
    window.location.href = '/admin';
  };

  const showToast       = useCallback((msg, type='ok') => setToast({ msg, type, key: Date.now() }), []);
  const refreshBootstrap = useCallback(async () => {
    const r = await adminApi.bootstrap();
    if (r.success) setBootstrap(r.data);
  }, []);

  useEffect(() => {
    if (!checking) refreshBootstrap();
  }, [checking, refreshBootstrap]);

  // Show nothing while checking auth (prevents flash of portal)
  if (checking) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0810', color:'#C9980A', fontFamily:'monospace', fontSize:'0.9rem' }}>
        Verifying session…
      </div>
    );
  }

  

  return (
    <div style={S.page}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:7px;height:7px;}
        ::-webkit-scrollbar-track{background:${C.bgDeep};}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px;}
        input:focus,select:focus,textarea:focus{border-color:${C.gold}!important;box-shadow:0 0 0 3px rgba(201,152,10,0.1);}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        button:active{transform:scale(0.97);}
      `}</style>

      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}

      <div style={S.sidebar}>
        <div style={{padding:'28px 22px 22px',borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'42px',height:'42px',borderRadius:'12px',background:`linear-gradient(135deg,${C.violet},${C.gold})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem'}}>⚽</div>
            <div>
              <div style={{fontFamily:C.serif,fontSize:'0.95rem',color:C.ivory,fontWeight:700}}>Golden Rock FC</div>
              <div style={{fontFamily:C.mono,fontSize:'0.65rem',color:C.gold,letterSpacing:'0.12em'}}>ADMIN PORTAL</div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:'18px 14px',overflow:'auto'}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setSection(n.id)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderRadius:'10px',marginBottom:'5px',background:section===n.id?'rgba(201,152,10,0.12)':'transparent',border:section===n.id?`1px solid ${C.borderBr}`:'1px solid transparent',color:section===n.id?C.gold:C.ivoryD,fontSize:'0.95rem',cursor:'pointer',textAlign:'left',transition:'all 0.15s',fontWeight:section===n.id?600:400}}
              onMouseEnter={e=>{if(section!==n.id)e.currentTarget.style.background='rgba(255,255,255,0.04)';}}
              onMouseLeave={e=>{if(section!==n.id)e.currentTarget.style.background='transparent';}}
            >
              <span style={{fontSize:'1.1rem'}}>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div style={{padding:'18px',borderTop:`1px solid ${C.border}`}}>
  {/* Logged-in user info */}
  {authUser && (
    <div style={{marginBottom:'14px',padding:'12px',background:'rgba(201,152,10,0.06)',border:`1px solid rgba(201,152,10,0.2)`,borderRadius:'10px'}}>
      <div style={{fontFamily:C.mono,fontSize:'0.6rem',color:C.gold,letterSpacing:'0.12em',marginBottom:'4px'}}>LOGGED IN AS</div>
      <div style={{fontSize:'0.82rem',color:C.ivory,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{authUser.email}</div>
    </div>
  )}
  <a href="/" style={{display:'flex',alignItems:'center',gap:'10px',color:C.muted,textDecoration:'none',fontSize:'0.88rem',fontFamily:C.mono,marginBottom:'10px'}}>← Public Site</a>
  <button
    onClick={handleLogout}
    style={{width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'9px',background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.25)',color:'#f87171',fontSize:'0.88rem',cursor:'pointer',fontFamily:C.mono,transition:'all 0.2s'}}
    onMouseEnter={e=>e.currentTarget.style.background='rgba(248,113,113,0.15)'}
    onMouseLeave={e=>e.currentTarget.style.background='rgba(248,113,113,0.08)'}
  >
    🚪 Logout
  </button>
</div>
      </div>

      <main style={S.main}>
        {section==='teams'       && <TeamsSection       {...props}/>}
        {section==='players'     && <PlayersSection     {...props}/>}
        {section==='matches'     && <MatchesSection     {...props}/>}
        {section==='tournaments' && <TournamentsSection {...props}/>}
        {section==='club'        && <ClubSection        {...props}/>}
      </main>
    </div>
  );
}