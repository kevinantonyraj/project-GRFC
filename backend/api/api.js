const BASE = 'http://127.0.0.1:8000/api';

const get = (url) => {
  const token = localStorage.getItem("token");

  return fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  }).then(r => {
    if (!r.ok) throw new Error(`API error ${r.status}`);
    return r.json();
  });
};

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

  login: (username, password) =>
    fetch(`${BASE}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }).then(res => {
      if (!res.ok) throw new Error("Invalid credentials");
      return res.json();
    }),
};