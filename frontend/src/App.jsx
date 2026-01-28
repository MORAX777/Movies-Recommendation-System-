import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import MovieDetail from "./components/MovieDetail";
import Library from "./components/Library";

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [userName, setUserName] = useState(localStorage.getItem("userName"));

  const handleLogin = (id, name) => {
    localStorage.setItem("userId", id);
    localStorage.setItem("userName", name);
    setUserId(id);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserId(null);
    setUserName(null);
  };

  return (
    <Routes>
      <Route path="/" element={userId ? <Dashboard userId={userId} userName={userName} logout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/library" element={userId ? <Library userId={userId} /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/movie/:id" element={userId ? <MovieDetail userId={userId} /> : <Navigate to="/login" />} />
    </Routes>
  );
}
export default App;
