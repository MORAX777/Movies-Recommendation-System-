import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${PY_URL}/auth/signup`, { email, password, name });
      navigate("/login");
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="p-10 bg-gray-900 rounded-lg shadow-xl w-96 border border-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-red-600">Sign Up</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input className="p-3 rounded bg-gray-800 border border-gray-700" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="p-3 rounded bg-gray-800 border border-gray-700" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="p-3 rounded bg-gray-800 border border-gray-700" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="bg-red-600 py-3 rounded font-bold hover:bg-red-700">Sign Up</button>
        </form>
        <p className="mt-4 text-gray-400">Already have an account? <Link to="/login" className="text-white hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
};
export default Signup;
