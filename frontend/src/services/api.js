import axios from 'axios';

// Determine the backend URL based on the environment
// During development, the backend might run on localhost:5000 (or whatever PORT is set in .env)
// In production, this would be the deployed backend URL.
// Use Vite's env variable mechanism
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor (optional, e.g., for adding auth tokens)
// apiClient.interceptors.request.use(config => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// == Tournament Admin Services ==

export const addTournament = (tournamentData) => {
  return apiClient.post('/tournaments', tournamentData);
};

export const deleteTournament = (tournamentId) => {
  return apiClient.delete(`/tournaments/${tournamentId}`);
};

export const addTeamToTournament = (tr_id, teamData) => {
  return apiClient.post(`/tournaments/${tr_id}/teams`, teamData);
};

export const approvePlayer = (tr_id, team_id, player_id) => {
  // Assuming the backend route is POST for this action
  return apiClient.post(`/tournaments/${tr_id}/teams/${team_id}/players/${player_id}/approve`);
};

// == Guest Services ==

export const getMatchesByTournament = (tr_id, sortByDate = 'asc') => {
  return apiClient.get(`/tournaments/${tr_id}/matches?sort_by_date=${sortByDate}`);
};

export const getTopScorers = () => {
  return apiClient.get('/scorers');
};

export const getRedCardedPlayers = (team_id) => {
  return apiClient.get(`/teams/${team_id}/redcards`);
};

export const getTeamComposition = (team_id, tr_id) => {
  return apiClient.get(`/teams/${team_id}/composition?tr_id=${tr_id}`);
};

// == System Services (Placeholder) ==

export const login = (credentials) => {
  // Using placeholder endpoint
  return apiClient.post('/login', credentials);
};

export const logout = () => {
  // Using placeholder endpoint
  return apiClient.post('/logout');
};

export default apiClient;

