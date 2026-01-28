import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const Library = ({ userId }) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    axios.get(`${PY_URL}/user/watchlist/${userId}`).then(res => setList(res.data));
  }, [userId]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Link to="/" className="text-red-500 mb-6 inline-block"> Back to Dashboard</Link>
      <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
      {list.length === 0 ? <p className="text-gray-500">No movies saved yet.</p> : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {list.map(m => (
            <Link to={`/movie/${m.movie_id}`} key={m.id} className="bg-gray-900 p-4 rounded hover:bg-gray-800">
               <p className="text-sm font-bold">{m.title}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default Library;
