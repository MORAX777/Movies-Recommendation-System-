import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Library from "./components/Library";
import MovieDetail from "./components/MovieDetail";

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || null);
  const navigate = useNavigate();

  const handleLogin = (id, name) => {
    setUserId(id);
    setUserName(name);
    localStorage.setItem("userId", id);
    localStorage.setItem("userName", name);
    navigate("/");
  };

  const handleLogout = () => {
    setUserId(null);
    setUserName(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={userId ? <Dashboard user={userName} userId={userId} logout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/genre/:genreName" element={userId ? <Dashboard user={userName} userId={userId} logout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/library" element={userId ? <Library userId={userId} /> : <Navigate to="/login" />} />
      <Route path="/movie/:id" element={<MovieDetail userId={userId} />} />
    </Routes>
  );
}

export default App;
