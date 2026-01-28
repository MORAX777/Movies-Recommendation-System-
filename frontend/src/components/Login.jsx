import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${PY_URL}/auth/login`, { email, password });
      onLogin(res.data.user_id, res.data.name);
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 bg-black/75 p-12 rounded w-96">
        <h1 className="text-3xl font-bold text-white mb-8">Sign In</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input className="p-3 rounded bg-[#333] text-white focus:outline-none focus:ring-1 focus:ring-red-600" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="p-3 rounded bg-[#333] text-white focus:outline-none focus:ring-1 focus:ring-red-600" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="bg-red-600 text-white font-bold py-3 rounded mt-4 hover:bg-red-700 transition">Sign In</button>
        </form>
        <p className="text-gray-400 mt-4 text-sm">New here? <Link to="/signup" className="text-white hover:underline">Sign up now.</Link></p>
      </div>
    </div>
  );
};
export default Login;
