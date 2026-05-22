import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from 'react'

const Home = lazy(() => import ('./pages/home'));
const Daily = lazy(() => import ( "./pages/daily"));
const Matches = lazy (() => import ("./pages/matches"));
const Players = lazy (() => import ("./pages/players"));
const PlayerProfile = lazy (() => import ("./pages/playersprofile"));
const Tournaments = lazy(() => import ("./pages/tournament"));
const TournamentDetail = lazy(() => import ('./pages/tournamentdetail'));
const Club = lazy(() => import ("./pages/club"));
const Admin = lazy(() => import ("./pages/admin"));
const AdminPortal = lazy(() => import ('./pages/adminportal'));




function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/players" element={<Players />} />
          <Route path="/player-profile/:id" element={<PlayerProfile />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournament/:id"      element={<TournamentDetail />} />
          <Route path="/club" element={<Club />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-portal" element={<AdminPortal />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;