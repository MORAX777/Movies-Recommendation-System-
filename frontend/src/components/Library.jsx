import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const PY_URL = "http://localhost:8000";
const TMDB_KEY = "128694e67f08e5e75b7877b59f232011";

const Library = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImage = async (title) => {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title.split("(")[0])}`);
      return res.data.results?.[0]?.poster_path || null;
    } catch { return null; }
  };

  useEffect(() => {
    const load = async () => {
      // Get History
      const hRes = await axios.get(`${PY_URL}/user/history/${userId}`);
      const hData = await Promise.all(hRes.data.map(async m => ({ ...m, poster: await fetchImage(m.Title) })));
      setHistory(hData);

      // Get Watchlist
      const wRes = await axios.get(`${PY_URL}/user/watchlist/${userId}`);
      const wData = await Promise.all(wRes.data.map(async m => ({ ...m, poster: await fetchImage(m.Title) })));
      setWatchlist(wData);
      
      setLoading(false);
    };
    if (userId) load();
  }, [userId]);

  const removeHistory = async (movie_id) => {
    // Optimistic UI update (remove immediately)
    setHistory(history.filter(m => m.MovieID !== movie_id));
    await axios.delete(`${PY_URL}/user/history/${userId}/${movie_id}`);
  };

  const removeWatchlist = async (movie_id) => {
    setWatchlist(watchlist.filter(m => m.MovieID !== movie_id));
    await axios.post(`${PY_URL}/user/watchlist`, { user_id: userId, movie_id });
  };

  if (loading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white animate-pulse">Loading Your Library...</div>;

  return (
    <div className="min-h-screen bg-[#121212] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 max-w-[1600px] mx-auto border-b border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="bg-gray-800 hover:bg-white hover:text-black px-4 py-2 rounded-full text-sm font-bold transition"> Home</Link>
          <div>
            <h1 className="text-3xl font-bold text-white">My Library</h1>
            <p className="text-gray-400 text-sm">Manage your watched movies and saved list</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-16">
        
        {/* WATCHLIST SECTION */}
        <section>
           <h2 className="text-xl font-bold text-red-500 mb-6 flex items-center gap-2">
             <span></span> My Watchlist <span className="text-gray-600 text-sm font-normal">({watchlist.length})</span>
           </h2>
           
           {watchlist.length === 0 ? (
             <div className="bg-[#1a1a1a] p-10 rounded-lg text-center border border-gray-800 border-dashed">
               <p className="text-gray-500 mb-4">You haven't saved any movies yet.</p>
               <Link to="/" className="text-red-500 hover:underline">Go explore!</Link>
             </div>
           ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
               {watchlist.map(m => (
                 <div key={m.MovieID} className="relative group bg-[#1a1a1a] rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    <Link to={`/movie/${m.MovieID}`}>
                      <div className="aspect-[2/3] relative">
                        {m.poster ? <img src={`https://image.tmdb.org/t/p/w500${m.poster}`} className="w-full h-full object-cover transition duration-500 group-hover:opacity-40" /> : <div className="p-2 text-xs h-full flex items-center justify-center text-center">{m.Title}</div>}
                      </div>
                    </Link>
                    
                    {/* Hover Overlay Buttons */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 gap-2">
                        <Link to={`/movie/${m.MovieID}`} className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-200">View</Link>
                        <button onClick={() => removeWatchlist(m.MovieID)} className="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-full hover:bg-red-700">Remove</button>
                    </div>

                    <div className="p-3">
                       <p className="text-gray-200 text-xs font-bold truncate">{m.Title}</p>
                       <p className="text-[10px] text-gray-500 mt-1">{m.Genres.split("|")[0]}</p>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </section>

        {/* HISTORY SECTION */}
        <section>
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <span></span> Watch History <span className="text-gray-600 text-sm font-normal">({history.length})</span>
           </h2>
           
           {history.length === 0 ? (
             <div className="text-gray-500">No movies watched yet.</div>
           ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
               {history.map(m => (
                 <div key={m.MovieID} className="relative group bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <Link to={`/movie/${m.MovieID}`}>
                      <div className="aspect-[2/3] relative opacity-70 group-hover:opacity-100 transition duration-300">
                        {m.poster ? <img src={`https://image.tmdb.org/t/p/w500${m.poster}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" /> : <div className="p-2 text-xs h-full flex items-center justify-center">{m.Title}</div>}
                        
                        {/* Red Progress Bar (Fake) */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700"><div className="h-full bg-red-600 w-full"></div></div>
                      </div>
                    </Link>
                    
                    <button 
                      onClick={() => removeHistory(m.MovieID)} 
                      className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                      title="Remove from History"
                    >
                      
                    </button>

                    <div className="p-3">
                       <p className="text-gray-400 group-hover:text-white text-xs font-bold truncate transition">{m.Title}</p>
                       <p className="text-[10px] text-gray-600 mt-1">Watched recently</p>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </section>
      </div>
    </div>
  );
};
export default Library;
