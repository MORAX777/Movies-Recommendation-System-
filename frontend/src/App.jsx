import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import MovieDetail from "./components/MovieDetail";

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
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/movie/:id" element={userId ? <MovieDetail /> : <Navigate to="/login" />} />
    </Routes>
  );
}
export default App;
