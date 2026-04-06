const BASE_URL = 'http://127.0.0.1:8000/api';

export const api = {
  home:        ()       => fetch(`${BASE_URL}/home/`).then(r => r.json()),
  daily:       (date)   => fetch(`${BASE_URL}/daily/${date ? date + '/' : ''}`).then(r => r.json()),
  matches:     (filter) => fetch(`${BASE_URL}/matches/${filter && filter !== 'all' ? '?result=' + filter : ''}`).then(r => r.json()),
  players:     ()       => fetch(`${BASE_URL}/players/`).then(r => r.json()),
  playerById:  (id)     => fetch(`${BASE_URL}/players/${id}/`).then(r => r.json()),
  honours:     ()       => fetch(`${BASE_URL}/honours/`).then(r => r.json()),
  snapshot:    ()       => fetch(`${BASE_URL}/snapshot/`).then(r => r.json()),
  tournaments: (filter) => fetch(`${BASE_URL}/tournaments/${filter && filter !== 'all' ? '?result=' + filter : ''}`).then(r => r.json()),
  club:        ()       => fetch(`${BASE_URL}/club/`).then(r => r.json()),
};