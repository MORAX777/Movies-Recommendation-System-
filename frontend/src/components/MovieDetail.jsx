import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// ?? PRODUCTION URL
const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";
const TMDB_KEY = "128694e67f08e5e75b7877b59f232011"; 
const IMG_BASE = "https://image.tmdb.org/t/p/original";

const MovieDetail = ({ userId }) => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=en-US`);
        setMovie(res.data);
        if (userId) {
          try {
            const rateRes = await axios.get(`${PY_URL}/rate/${userId}/${id}`);
            setUserRating(rateRes.data.rating);
          } catch (e) {} 
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, userId]);

  const handleRate = async (star) => {
    setUserRating(star);
    if (!userId) return alert("Please log in to rate!");
    try {
      await axios.post(`${PY_URL}/rate`, { user_id: userId, movie_id: parseInt(id), rating: star });
    } catch (err) { console.error("Rating failed"); }
  };

  if (loading) return <div className="text-white text-center mt-20 text-xl">Loading...</div>;
  if (!movie) return <div className="text-white text-center mt-20 text-xl">Movie not found.</div>;

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${IMG_BASE}${movie.backdrop_path})` }} />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10 items-center md:items-start animate-fadeIn">
        <img src={movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : "https://via.placeholder.com/300x450"} className="w-64 md:w-80 rounded-lg shadow-2xl border border-gray-700 hover:scale-105 transition duration-500" />
        <div className="flex-1 bg-black/30 p-6 rounded-xl backdrop-blur-sm border border-white/5">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="bg-red-600 px-3 py-1 rounded text-sm font-bold shadow-lg shadow-red-900/50">{movie.release_date?.split("-")[0]}</span>
            <span className="border border-white/30 px-3 py-1 rounded text-sm bg-black/50">{movie.runtime} min</span>
            <span className="text-yellow-400 font-bold text-lg border border-yellow-500/30 px-3 py-1 rounded bg-yellow-500/10">? {movie.vote_average.toFixed(1)}</span>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed mb-8 border-l-4 border-red-600 pl-4">{movie.overview}</p>
          
          {/* ? STAR SYSTEM ? */}
          <div className="bg-white/10 p-5 rounded-lg border border-white/10 inline-block">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Your Rating</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => handleRate(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="text-4xl transition-transform hover:scale-125 focus:outline-none" style={{ color: star <= (hoverRating || userRating) ? "#FFD700" : "#4B5563" }} title={`Rate ${star} Stars`}>?</button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 h-4">{userRating > 0 ? `You rated this ${userRating} stars` : "Tap a star to rate"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MovieDetail;
