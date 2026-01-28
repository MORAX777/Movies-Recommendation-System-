import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_KEY = "128694e67f08e5e75b7877b59f232011"; 

const Library = ({ userId }) => {
  const [watchlist, setWatchlist] = useState([]);
  
  const fetchImage = async (title) => {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title.split("(")[0])}`);
      return res.data.results?.[0]?.poster_path || null;
    } catch { return null; }
  };

  useEffect(() => {
    axios.get(`${PY_URL}/user/watchlist/${userId}`).then(async (res) => {
      const withImgs = await Promise.all(res.data.map(async m => ({ ...m, poster: await fetchImage(m.title || m.Title) })));
      setWatchlist(withImgs);
    });
  }, [userId]);

  return (
    <div className="min-h-screen bg-[#141414] text-white p-8">
      <Link to="/" className="text-red-500 font-bold mb-6 inline-block"> Back to Dashboard</Link>
      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
      {watchlist.length === 0 ? <p className="text-gray-500">Your library is empty.</p> : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {watchlist.map(m => (
            <Link to={`/movie/${m.movie_id || m.MovieID}`} key={m.id} className="group">
              <div className="aspect-[2/3] bg-gray-800 rounded overflow-hidden">
                {m.poster ? <img src={IMG_BASE + m.poster} className="w-full h-full object-cover group-hover:scale-105 transition" /> : <div className="p-4 text-center">{m.title || m.Title}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default Library;
