const BASE = 'http://127.0.0.1:8000/api';

const get = (url) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
});

export const api = {
  home:             ()           => get(`${BASE}/home/`),
  daily:            (date)       => get(`${BASE}/daily/${date ? date + '/' : ''}`),
  matches:          (result)     => get(`${BASE}/matches/${result && result !== 'all' ? '?result=' + result : ''}`),
  players:          (search)     => get(`${BASE}/players/${search ? '?search=' + encodeURIComponent(search) : ''}`),
  playerById:       (id)         => get(`${BASE}/players/${id}/`),
  honours:          ()           => get(`${BASE}/honours/`),
  snapshot:         ()           => get(`${BASE}/snapshot/`),
  tournaments:      (result)     => get(`${BASE}/tournaments/${result && result !== 'all' ? '?result=' + result : ''}`),
  tournamentDetail: (id)         => get(`${BASE}/tournaments/${id}/`),
  club:             ()           => get(`${BASE}/club/`),
};