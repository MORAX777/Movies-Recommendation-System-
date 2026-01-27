import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    
    // API CONFIG
    //  IMPORTANT: If you deployed to Render, change this URL to your Render URL!
    // For local testing, keep it https://movies-recommendation-system-70ns.onrender.com
    const BASE_URL = "https://movies-recommendation-system-70ns.onrender.com"; 
    const endpoint = isSignUp ? "/auth/signup" : "/auth/login";
    const payload = isSignUp ? formData : { email: formData.email, password: formData.password };

    try {
      const res = await axios.post(`${BASE_URL}${endpoint}`, payload);
      if (isSignUp) {
        alert(" Account Created! Welcome to Team Targaryan. Please Log In.");
        setIsSignUp(false);
      } else {
        onLogin(res.data);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.detail || "Connection Error. Is Backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      
      {/* 1. CINEMATIC BACKGROUND ANIMATION */}
      <style>{`
        @keyframes pan-zoom {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-2%, -2%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        .animate-cinematic {
          animation: pan-zoom 20s ease-in-out infinite alternate;
        }
      `}</style>
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10"></div>
        {/* High Quality Movie Collage Background */}
        <img 
          src="https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_large.jpg" 
          className="w-full h-full object-cover opacity-60 animate-cinematic"
          alt="Background"
        />
      </div>

      {/* 2. GLASSMORPHISM LOGIN CARD */}
      <div className="relative z-20 w-full max-w-md p-8 md:p-12 bg-black/75 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl transform transition-all">
        
        {/* BRANDING LOGO */}
        <div className="text-center mb-8">
           <h1 className="text-red-600 text-4xl font-extrabold tracking-tighter drop-shadow-lg">TEAM TARGARYAN</h1>
           <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] mt-1">Unlimited Entertainment</p>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded mb-6 text-sm flex items-center gap-2 animate-pulse">
            <span></span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="relative group">
              <input 
                name="name" 
                type="text" 
                placeholder="Full Name" 
                required 
                className="w-full p-4 rounded bg-[#333] text-white border border-transparent focus:border-red-600 focus:bg-[#444] outline-none transition-all placeholder-gray-500" 
                onChange={handleChange} 
              />
            </div>
          )}
          <input 
            name="email" 
            type="email" 
            placeholder="Email Address" 
            required 
            className="w-full p-4 rounded bg-[#333] text-white border border-transparent focus:border-red-600 focus:bg-[#444] outline-none transition-all placeholder-gray-500" 
            onChange={handleChange} 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required 
            className="w-full p-4 rounded bg-[#333] text-white border border-transparent focus:border-red-600 focus:bg-[#444] outline-none transition-all placeholder-gray-500" 
            onChange={handleChange} 
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/40"
          >
            {loading ? "Processing..." : (isSignUp ? "Start Membership" : "Sign In")}
          </button>
        </form>

        <div className="mt-8 text-gray-400 text-sm text-center">
          {isSignUp ? "Already have an account?" : "New to Team Targaryan?"} 
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }} 
            className="text-white font-bold ml-2 hover:text-red-500 hover:underline transition"
          >
            {isSignUp ? "Sign In now." : "Sign up now."}
          </button>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-4 text-gray-600 text-xs z-20">
         2026 Team Targaryan Project. Developed by Aryan, Mohan, Vijay, Bala Sai.
      </div>
    </div>
  );
};

export default Login;

