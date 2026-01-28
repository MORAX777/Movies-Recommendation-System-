import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${PY_URL}/auth/login`, { email, password });
      onLogin(res.data.user_id, res.data.name);
      navigate("/");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="p-10 bg-gray-900 rounded-lg shadow-xl w-96 border border-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-red-600">Sign In</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input className="p-3 rounded bg-gray-800 border border-gray-700" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="p-3 rounded bg-gray-800 border border-gray-700" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="bg-red-600 py-3 rounded font-bold hover:bg-red-700">Sign In</button>
        </form>
        <p className="mt-4 text-gray-400">New? <Link to="/signup" className="text-white hover:underline">Sign up now</Link></p>
      </div>
    </div>
  );
};
export default Login;
