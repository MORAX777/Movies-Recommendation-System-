import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

//  RENDER URL
const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${PY_URL}/auth/signup`, { 
        name: name, 
        email: email, 
        password: password 
      });
      alert("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      setError("Signup failed. Try a different email.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#141414] text-white">
      <div className="bg-black/80 p-10 rounded-lg w-96 border border-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-red-600">Sign Up</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <input 
            className="w-full p-3 bg-[#333] rounded text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <input 
            className="w-full p-3 bg-[#333] rounded text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            className="w-full p-3 bg-[#333] rounded text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button className="w-full bg-red-600 py-3 rounded font-bold hover:bg-red-700 transition" type="submit">
            Create Account
          </button>
        </form>
        <p className="mt-4 text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-white hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
