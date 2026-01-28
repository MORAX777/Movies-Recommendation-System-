import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

//  PRODUCTION URL
const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";
const TMDB_KEY = "128694e67f08e5e75b7877b59f232011";
const IMG_BASE = "https://image.tmdb.org/t/p/original";

const MovieDetail = ({ userId }) => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tmdbRes = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=en-US`);
        setMovie(tmdbRes.data);
        if (userId) {
          try {
            const rateRes = await axios.get(`${PY_URL}/rate/${userId}/${id}`);
            setUserRating(rateRes.data.rating);
          } catch (e) {} // Ignore error if no rating
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
    } catch (err) { alert("Failed to save rating"); }
  };

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
  if (!movie) return <div className="text-white text-center mt-20">Movie not found</div>;

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${IMG_BASE}${movie.backdrop_path})` }} />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
        <img src={movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : "https://via.placeholder.com/300"} className="w-64 md:w-80 rounded-lg shadow-2xl" />
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold mb-2">{movie.title}</h1>
          <p className="text-yellow-400 font-bold mb-4"> {movie.vote_average.toFixed(1)}</p>
          <p className="text-gray-300 text-lg mb-8">{movie.overview}</p>
          <div className="bg-white/10 p-6 rounded-xl border border-white/10 backdrop-blur-sm max-w-md">
            <h3 className="text-sm font-bold uppercase text-gray-400 mb-3">Rate this Movie</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => handleRate(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="text-4xl hover:scale-125 transition" style={{ color: star <= (hoverRating || userRating) ? "#FFD700" : "#4B5563" }}></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MovieDetail;
