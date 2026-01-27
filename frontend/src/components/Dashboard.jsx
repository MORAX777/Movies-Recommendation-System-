import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";

// ?? PRODUCTION URL
const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";
const TMDB_KEY = "128694e67f08e5e75b7877b59f232011";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const Dashboard = ({ user, userId, logout }) => {
  const { genreName } = useParams();
  const [movies, setMovies] = useState([]);
  const [personalRecs, setPersonalRecs] = useState([]);
  const [history, setHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const fetchImage = async (title) => {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title.split("(")[0])}`);
      return res.data.results?.[0]?.poster_path || null;
    } catch { return null; }
  };

  useEffect(() => {
    let url = `${PY_URL}/movies?limit=40`;
    if (search) url += `&search=${search}`;
    else if (genreName) url += `&genre=${genreName}`;

    axios.get(url).then(async (res) => {
      const withImages = await Promise.all(res.data.map(async m => ({ ...m, poster: await fetchImage(m.Title) })));
      setMovies(withImages);
    });

    if (userId) refreshUserData();
  }, [search, genreName, userId]);

  const refreshUserData = () => {
    if (!userId) return;
    axios.get(`${PY_URL}/user/history/${userId}`).then(async (res) => {
      const hWithImages = await Promise.all(res.data.map(async m => ({ ...m, poster: await fetchImage(m.Title) })));
      setHistory(hWithImages);
    });
    axios.get(`${PY_URL}/user/watchlist/${userId}`).then(res => setWatchlist(res.data));
    
    if (!genreName && !search) {
      axios.get(`${PY_URL}/user/personal/${userId}`).then(async (res) => {
        const rWithImages = await Promise.all(res.data.map(async m => ({ ...m, poster: await fetchImage(m.Title) })));
        setPersonalRecs(rWithImages);
      });
    }
  };

  const removeHistoryItem = async (movieId) => {
    await axios.delete(`${PY_URL}/user/history/${userId}/${movieId}`);
    setHistory(history.filter(m => m.MovieID !== movieId));
  };

  const toggleWatchlistItem = async (movieId) => {
    await axios.post(`${PY_URL}/user/watchlist`, { user_id: userId, movie_id: movieId });
    const res = await axios.get(`${PY_URL}/user/watchlist/${userId}`);
    setWatchlist(res.data);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isInWatchlist = (id) => watchlist.some(w => w.MovieID === id);

  return (
    <div className="flex flex-col min-h-screen bg-[#141414]">
      <Sidebar isOpen={isSidebarOpen} close={() => setSidebarOpen(false)} logout={logout} userId={userId} />

      <nav className="sticky top-0 z-50 bg-black/95 px-6 py-4 shadow-xl border-b border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           
           <div className="flex items-center gap-4 w-full md:w-auto">
             <button 
               onClick={() => setSidebarOpen(true)} 
               className="text-red-600 text-4xl hover:text-white transition cursor-pointer p-1 font-bold"
               title="Open Menu"
             >
               ?
             </button>

             <div className="flex flex-col items-start">
               <Link to="/" className="text-red-600 text-3xl font-extrabold tracking-tighter hover:text-red-500 transition">
                 TEAM TARGARYAN
               </Link>
               <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] -mt-1 block">
                 Movie Recommendation System
               </span>
             </div>
           </div>

           <div className="hidden md:flex gap-6 text-sm font-semibold text-gray-400">
             <Link to="/" className="hover:text-white transition hover:scale-105">Home</Link>
             <Link to="/genre/Action" className="hover:text-white transition hover:scale-105">Action</Link>
             <Link to="/genre/Comedy" className="hover:text-white transition hover:scale-105">Comedy</Link>
             <Link to="/genre/Drama" className="hover:text-white transition hover:scale-105">Drama</Link>
           </div>

           <div className="flex gap-3 items-center relative">
             <input className="bg-[#222] px-4 py-1.5 rounded-full text-sm w-32 md:w-48 focus:w-64 focus:bg-[#333] transition-all outline-none border border-transparent focus:border-red-600" placeholder="Search titles..." onChange={(e) => setSearch(e.target.value)} />
             
             <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setMenuOpen(!isMenuOpen)} 
                  className="text-red-600 text-2xl px-2 py-1 hover:bg-gray-800 rounded-full transition font-bold rotate-90"
                  title="Quick Menu"
                >
                  •••
                </button>
                
                {isMenuOpen && (
                  <div className="absolute top-12 right-0 w-72 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-[60]">
                    <div className="p-3 border-b border-gray-700 bg-gray-900/50"><h3 className="text-white font-bold text-xs uppercase">Quick Access</h3></div>
                    <div className="max-h-60 overflow-y-auto scrollbar-hide p-2">
                      <p className="text-[10px] text-gray-500 uppercase font-bold px-2 mb-2">Watchlist</p>
                      {watchlist.length === 0 ? <p className="text-gray-600 text-xs px-2 mb-2">Empty.</p> : (
                        watchlist.map(w => (
                          <div key={w.MovieID} className="flex justify-between items-center p-2 hover:bg-white/5 rounded">
                             <span className="text-gray-300 text-xs truncate w-40">{w.Title}</span>
                             <button onClick={() => toggleWatchlistItem(w.MovieID)} className="text-red-500 text-xs">?</button>
                          </div>
                        ))
                      )}
                      <div className="border-t border-gray-800 my-2"></div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold px-2 mb-2">Recent History</p>
                      {history.slice(0,5).map(h => (
                          <div key={h.MovieID} className="flex justify-between items-center p-2 hover:bg-white/5 rounded">
                             <span className="text-gray-400 text-xs truncate w-40">{h.Title}</span>
                             <button onClick={() => removeHistoryItem(h.MovieID)} className="text-gray-500 hover:text-white text-xs">?</button>
                          </div>
                      ))}
                    </div>
                    <Link to="/library" className="block text-center bg-gray-900 text-xs text-blue-400 py-2 hover:bg-gray-800 border-t border-gray-700">Open Full Library</Link>
                  </div>
                )}
             </div>

             <button onClick={logout} className="bg-red-600 px-5 py-1.5 rounded-full text-xs font-bold hover:bg-red-700 transition shadow-lg shadow-red-900/20 whitespace-nowrap">
               Sign Out
             </button>
           </div>
        </div>
      </nav>

      <div className="flex-grow px-6 pt-8 max-w-[1600px] mx-auto w-full">
        
        {!search && !genreName && history.length > 0 && (
          <div className="mb-6 animate-fadeIn">
            <h2 className="text-sm font-bold mb-2 text-white flex items-center gap-2 uppercase tracking-wide opacity-80">
              <span className="text-red-500">?</span> Continue Watching
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {history.map(m => (
                <Link to={`/movie/${m.MovieID}`} key={m.MovieID} className="min-w-[100px] md:min-w-[140px] group relative flex-shrink-0">
                   <div className="aspect-video bg-gray-800 rounded overflow-hidden border border-white/10 group-hover:border-red-600 transition duration-300">
                     {m.poster ? <img src={`https://image.tmdb.org/t/p/w500${m.poster}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500" /> : <div className="flex items-center justify-center h-full text-[10px] text-center p-1 text-gray-500">{m.Title}</div>}
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40"><div className="bg-red-600 rounded-full p-2 shadow-lg transform group-hover:scale-110 transition text-xs">?</div></div>
                   </div>
                   <div className="mt-1 h-0.5 w-full bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-red-600 w-2/3"></div></div>
                   <p className="mt-1 text-[10px] font-bold text-gray-400 truncate group-hover:text-white">{m.Title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* --- MINI-SIZE 'PICKED FOR USER' SECTION --- */}
        {!search && !genreName && personalRecs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold mb-2 text-white uppercase tracking-wide opacity-80">Picked for {user}</h2>
            {/* Extremely compact layout */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {personalRecs.map(m => (
                <Link to={`/movie/${m.MovieID}`} key={m.MovieID} className="min-w-[80px] md:min-w-[100px] group flex-shrink-0 hover:-translate-y-1 transition duration-300">
                   {/* Thumbnail size */}
                   <div className="aspect-[2/3] bg-gray-800 rounded-sm overflow-hidden relative shadow-lg">
                     {m.poster ? <img src={IMG_BASE + m.poster} className="w-full h-full object-cover" /> : <div className="p-1 text-[9px] text-center">{m.Title}</div>}
                     
                     {/* Overlay */}
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white text-center px-1 leading-tight">{m.Title}</span>
                     </div>
                   </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4 text-white border-l-4 border-red-600 pl-4">{genreName ? `${genreName} Movies` : (search ? `Results for "${search}"` : "Trending Now")}</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {movies.map((m) => {
             const isSaved = isInWatchlist(m.MovieID);
             return (
              <div key={m.MovieID} className="group bg-[#1a1a1a] rounded-lg overflow-hidden hover:shadow-2xl transition duration-300 hover:-translate-y-2 relative">
                <Link to={`/movie/${m.MovieID}`}>
                  <div className="aspect-[2/3] relative bg-gray-900 overflow-hidden">
                    {m.poster ? <img src={IMG_BASE + m.poster} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" /> : <div className="flex items-center justify-center h-full text-gray-500 text-center text-xs p-2">{m.Title}</div>}
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-yellow-400 font-bold border border-yellow-500/30">? {m.Rating}</div>
                  </div>
                </Link>
                <button onClick={() => toggleWatchlistItem(m.MovieID)} className={`absolute top-2 left-2 p-1.5 rounded-full z-10 transition ${isSaved ? "bg-red-600 text-white" : "bg-black/50 text-gray-400 hover:text-white"}`}>{isSaved ? "?" : "?"}</button>
                <div className="p-3">
                   <h3 className="text-xs font-bold text-gray-200 truncate group-hover:text-red-500 transition-colors">{m.Title}</h3>
                   <p className="text-[10px] text-gray-400 mt-1 truncate">{m.Genres ? m.Genres.replace(/\|/g, " • ") : "Genre N/A"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mt-20 bg-black py-10 border-t border-gray-900"><div className="max-w-4xl mx-auto text-center space-y-4"><p className="text-gray-500 text-sm tracking-widest uppercase">Developed By</p><div className="flex flex-wrap justify-center gap-4 md:gap-8"><span className="text-white font-bold text-lg hover:text-red-500 transition cursor-default">Aryan</span><span className="text-gray-700">•</span><span className="text-white font-bold text-lg hover:text-red-500 transition cursor-default">Mohan</span><span className="text-gray-700">•</span><span className="text-white font-bold text-lg hover:text-red-500 transition cursor-default">Vijay</span><span className="text-gray-700">•</span><span className="text-white font-bold text-lg hover:text-red-500 transition cursor-default">Bala Sai</span></div><div className="text-[10px] text-gray-600 mt-8">© 2024 Team Targaryan. Powered by MovieLens 1M & TMDB.</div></div></footer>
    </div>
  );
};
export default Dashboard;
