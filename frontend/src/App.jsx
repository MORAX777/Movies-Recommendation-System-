import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MovieDetail from "./components/MovieDetail";
import Library from "./components/Library";
import Help from "./components/Help";
import Feedback from "./components/Feedback";

function App() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const savedName = localStorage.getItem("ml_name");
    const savedId = localStorage.getItem("ml_id");
    if (savedName && savedId) {
      setUser(savedName);
      setUserId(savedId);
    }
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem("ml_name", data.name);
    localStorage.setItem("ml_id", data.id);
    setUser(data.name);
    setUserId(data.id);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setUserId(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        
        <Route path="/" element={user ? <Dashboard user={user} userId={userId} logout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/genre/:genreName" element={user ? <Dashboard user={user} userId={userId} logout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/movie/:id" element={user ? <MovieDetail userId={userId} /> : <Navigate to="/login" />} />
        
        {/* NEW ROUTES */}
        <Route path="/library" element={user ? <Library userId={userId} /> : <Navigate to="/login" />} />
        <Route path="/help" element={user ? <Help /> : <Navigate to="/login" />} />
        <Route path="/feedback" element={user ? <Feedback userId={userId} user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
export default App;
