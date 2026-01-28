import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_KEY = "128694e67f08e5e75b7877b59f232011";

const Dashboard = ({ logout }) => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // Fetch from our Python Backend
    axios.get(`${PY_URL}/movies`).then(async (res) => {
      // Fetch Images from TMDB for each movie
      const withImages = await Promise.all(res.data.map(async (m) => {
        try {
          const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(m.Title.split("(")[0])}`);
          return { ...m, poster_path: tmdbRes.data.results?.[0]?.poster_path };
        } catch { return m; }
      }));
      setMovies(withImages);
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-red-600">MOVIEFLIX</h1>
        <button onClick={logout} className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700">Sign Out</button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((m) => (
          <Link to={`/movie/${m.MovieID}`} key={m.MovieID} className="group cursor-pointer">
            <div className="relative aspect-[2/3] bg-gray-900 rounded overflow-hidden hover:scale-105 transition duration-300">
              {m.poster_path ? (
                <img src={IMG_BASE + m.poster_path} alt={m.Title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full p-4 text-center text-gray-500">{m.Title}</div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-300 group-hover:text-white truncate">{m.Title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default Dashboard;
