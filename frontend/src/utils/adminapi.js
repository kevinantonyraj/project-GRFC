import { getToken, clearTokens } from './auth.js';

const BASE = import.meta.env.VITE_API_BASE_URL;


const req = async (method, url, data=null) => {
  const token = getToken();
  const opts = {
    method,
    headers: {
      'Content-Type':  'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  };
  if (data) opts.body = JSON.stringify(data);
  const res = await fetch(BASE + url, opts);

  if (res.status === 401) {
    clearTokens();
    window.location.href = '/admin';
    return { success: false, message: 'Session expired. Please log in again.' };
  }

  return res.json();
};

export const adminApi = {
  bootstrap:          ()          => req('GET',    '/admin/bootstrap/'),

  
  getTeams:           ()          => req('GET',    '/admin/teams/'),
  createTeam:         (d)         => req('POST',   '/admin/teams/', d),
  updateTeam:         (id, d)     => req('PUT',    `/admin/teams/${id}/`, d),
  deleteTeam:         (id)        => req('DELETE', `/admin/teams/${id}/`),

  getPlayers:         ()          => req('GET',    '/admin/players/'),
  createPlayer:       (d)         => req('POST',   '/admin/players/', d),
  updatePlayer:       (id, d)     => req('PUT',    `/admin/players/${id}/`, d),
  deletePlayer:       (id)        => req('DELETE', `/admin/players/${id}/`),

  getMatches:         ()          => req('GET',    '/admin/matches/'),
  createMatch:        (d)         => req('POST',   '/admin/matches/', d),
  updateMatch:        (id, d)     => req('PUT',    `/admin/matches/${id}/`, d),
  deleteMatch:        (id)        => req('DELETE', `/admin/matches/${id}/`),

  getGoals:           (matchId)   => req('GET',    `/admin/goals/?match_id=${matchId}`),
  createGoal:         (d)         => req('POST',   '/admin/goals/', d),
  deleteGoal:         (id)        => req('DELETE', `/admin/goals/${id}/`),

  getAppearances:     (matchId)   => req('GET',    `/admin/appearances/?match_id=${matchId}`),
  saveAppearance:     (d)         => req('POST',   '/admin/appearances/', d),
  deleteAppearance:   (id)        => req('DELETE', `/admin/appearances/${id}/`),

  getDailyEntries:    ()          => req('GET',    '/admin/daily/'),
  getDailyByMatch:    (matchId)   => req('GET',    `/admin/daily/?match_id=${matchId}`),
  saveDailyEntry:     (d)         => req('POST',   '/admin/daily/', d),
  deleteDailyEntry:   (id)        => req('DELETE', `/admin/daily/${id}/`),

  getTournaments:     ()          => req('GET',    '/admin/tournaments/'),
  createTournament:   (d)         => req('POST',   '/admin/tournaments/', d),
  updateTournament:   (id, d)     => req('PUT',    `/admin/tournaments/${id}/`, d),
  deleteTournament:   (id)        => req('DELETE', `/admin/tournaments/${id}/`),
  addSquadPlayer:     (d)         => req('POST',   '/admin/tournament-squad/', d),
  removeSquadPlayer:  (d)         => req('DELETE', '/admin/tournament-squad/', d),
  addTournamentTeam:  (d)         => req('POST',   '/admin/tournament-team/', d),
  removeTournamentTeam:(d)        => req('DELETE', '/admin/tournament-team/', d),

  getStaff:           ()          => req('GET',    '/admin/staff/'),
  createStaff:        (d)         => req('POST',   '/admin/staff/', d),
  updateStaff:        (id, d)     => req('PUT',    `/admin/staff/${id}/`, d),
  deleteStaff:        (id)        => req('DELETE', `/admin/staff/${id}/`),

  getPartners:        ()          => req('GET',    '/admin/partners/'),
  createPartner:      (d)         => req('POST',   '/admin/partners/', d),
  updatePartner:      (id, d)     => req('PUT',    `/admin/partners/${id}/`, d),
  deletePartner:      (id)        => req('DELETE', `/admin/partners/${id}/`),

  getAssets:            ()      => req('GET',    '/admin/assets/'),
  createAsset:          (d)     => req('POST',   '/admin/assets/', d),
  updateAsset:          (id, d) => req('PUT',    `/admin/assets/${id}/`, d),
  deleteAsset:          (id)    => req('DELETE', `/admin/assets/${id}/`),
};