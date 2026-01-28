import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_KEY = "128694e67f08e5e75b7877b59f232011";

const Dashboard = ({ userId, userName, logout }) => {
  const [movies, setMovies] = useState([]);
  const [recs, setRecs] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchImages = async (list) => {
    return Promise.all(list.map(async (m) => {
      try {
        const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${m.Title.split("(")[0]}`);
        return { ...m, poster: res.data.results?.[0]?.poster_path };
      } catch { return m; }
    }));
  };

  useEffect(() => {
    // Load All Movies
    axios.get(`${PY_URL}/movies`).then(async res => setMovies(await fetchImages(res.data)));
    // Load Recommendations
    if (userId) axios.get(`${PY_URL}/user/recommendations/${userId}`).then(async res => setRecs(await fetchImages(res.data)));
  }, [userId]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar isOpen={menuOpen} close={() => setMenuOpen(false)} logout={logout} userName={userName} />
      
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuOpen(true)} className="text-2xl"></button>
            <h1 className="text-3xl font-bold text-red-600">MOVIEFLIX</h1>
          </div>
        </div>

        {/* RECOMMENDATION SECTION */}
        {recs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-gray-300">Recommended for You</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {recs.map(m => (
                <Link to={`/movie/${m.MovieID}`} key={"rec"+m.MovieID} className="min-w-[150px]">
                  <img src={m.poster ? IMG_BASE + m.poster : "https://via.placeholder.com/150"} className="rounded-lg hover:scale-105 transition" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ALL MOVIES */}
        <h2 className="text-xl font-bold mb-4 text-gray-300">All Movies</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {movies.map((m) => (
            <Link to={`/movie/${m.MovieID}`} key={m.MovieID} className="group">
              <div className="aspect-[2/3] bg-gray-900 rounded overflow-hidden">
                <img src={m.poster ? IMG_BASE + m.poster : "https://via.placeholder.com/200"} className="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
              <p className="mt-2 text-sm text-gray-400 truncate">{m.Title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
