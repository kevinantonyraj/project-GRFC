
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Daily from "./pages/daily";
import Matches from "./pages/matches"
import Players from "./pages/players";
import PlayerProfile from "./pages/playersprofile";
import Tournaments from "./pages/tournament";
import Club from "./pages/club";
import Admin from "./pages/admin";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<Daily />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/players" element={<Players />} />
        <Route path="/player-profile" element={<PlayerProfile />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/club" element={<Club />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;