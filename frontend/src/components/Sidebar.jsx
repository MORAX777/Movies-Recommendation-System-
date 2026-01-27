import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const genresList = [
  "Action", "Adventure", "Animation", "Children''s", "Comedy", "Crime", 
  "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror", "Musical", 
  "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"
];

const Sidebar = ({ isOpen, close, logout, userId }) => {
  const [showGenres, setShowGenres] = useState(false);
  const [miniHistory, setMiniHistory] = useState([]);

  // Load mini history when sidebar opens
  useEffect(() => {
    if (isOpen && userId) {
      axios.get(`https://movies-recommendation-system-70ns.onrender.com/user/history/${userId}`)
        .then(res => setMiniHistory(res.data.slice(0, 5))) // Get top 5
        .catch(() => {});
    }
  }, [isOpen, userId]);

  const removeSideHistory = async (movieId) => {
    await axios.delete(`https://movies-recommendation-system-70ns.onrender.com/user/history/${userId}/${movieId}`);
    setMiniHistory(miniHistory.filter(m => m.MovieID !== movieId));
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={close}
      ></div>
      
      <div className={`fixed top-0 left-0 h-full w-80 bg-[#0a0a0a] border-r border-red-900/50 z-[9999] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-6 relative">
          
          {/* CLOSE BUTTON (RED) */}
          <button 
            onClick={close} 
            className="absolute top-4 right-4 text-red-600 hover:text-white hover:bg-red-900/20 p-2 rounded-full transition text-xl font-bold"
            title="Close Menu"
          >
            
          </button>

          <div className="mb-6 mt-2">
             <h2 className="text-red-600 text-2xl font-extrabold tracking-tighter">MENU</h2>
             <p className="text-[10px] text-gray-500 uppercase tracking-widest">Team Targaryan</p>
          </div>
          
          <div className="flex-col gap-2 overflow-y-auto scrollbar-hide flex-grow space-y-2">
            
            <Link to="/" onClick={close} className="flex items-center gap-4 text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-all">
              <span className="text-xl"></span> <span className="font-bold">Home</span>
            </Link>

            {/* GENRES */}
            <div className="border-t border-white/10 pt-2">
              <button 
                onClick={() => setShowGenres(!showGenres)}
                className="w-full flex justify-between items-center text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl"></span> <span className="font-bold">Browse Genres</span>
                </div>
                <span className={`text-xs transition-transform ${showGenres ? "rotate-180" : ""}`}></span>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${showGenres ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="grid grid-cols-2 gap-1 pl-4 mt-2 bg-white/5 p-2 rounded border border-white/10">
                  {genresList.map(g => (
                    <Link key={g} to={`/genre/${g}`} onClick={close} className="text-[10px] text-gray-400 hover:text-red-500 py-1 px-2 hover:bg-black rounded block truncate">
                      {g}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* QUICK HISTORY REMOVAL */}
            <div className="border-t border-white/10 pt-4 mt-2">
               <div className="flex justify-between items-center px-3 mb-2">
                 <span className="text-xs font-bold text-gray-500 uppercase">Recent History</span>
                 <Link to="/library" onClick={close} className="text-[10px] text-blue-400 hover:underline">View All</Link>
               </div>
               
               {miniHistory.length === 0 ? (
                 <p className="text-gray-600 text-xs px-3 italic">Nothing watched yet.</p>
               ) : (
                 <div className="space-y-1">
                   {miniHistory.map(m => (
                     <div key={m.MovieID} className="flex justify-between items-center p-2 hover:bg-white/5 rounded group">
                        <span className="text-gray-400 text-xs truncate w-48">{m.Title}</span>
                        <button 
                          onClick={() => removeSideHistory(m.MovieID)} 
                          className="text-gray-600 hover:text-red-600 transition px-2"
                          title="Remove from History"
                        >
                          
                        </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>

            <div className="border-t border-white/10 pt-2 mt-2">
               <Link to="/help" onClick={close} className="flex items-center gap-4 text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-all">
                 <span className="text-xl"></span> <span className="font-bold">Help Center</span>
               </Link>
               <Link to="/feedback" onClick={close} className="flex items-center gap-4 text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-all">
                 <span className="text-xl"></span> <span className="font-bold">Feedback</span>
               </Link>
            </div>

          </div>

          <div className="pt-4 mt-auto">
            <button onClick={() => { close(); logout(); }} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Sidebar;

