import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";
const TMDB_KEY = "128694e67f08e5e75b7877b59f232011"; 
const IMG_BASE = "https://image.tmdb.org/t/p/original";

const MovieDetail = ({ userId }) => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=en-US`);
        setMovie(res.data);
        if (userId) {
          const listRes = await axios.get(`${PY_URL}/user/watchlist/${userId}`);
          const found = listRes.data.some(item => item.movie_id == id || item.MovieID == id);
          setInWatchlist(found);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchData();
  }, [id, userId]);

  const toggleWatchlist = async () => {
    if (!userId) return alert("Login required!");
    setInWatchlist(!inWatchlist);
    try {
      await axios.post(`${PY_URL}/user/watchlist`, { user_id: userId, movie_id: parseInt(id) });
    } catch (err) { setInWatchlist(!inWatchlist); }
  };

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
  if (!movie) return <div className="text-white text-center mt-20">Movie not found.</div>;

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${IMG_BASE}${movie.backdrop_path})` }} />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
        <img src={movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : "https://via.placeholder.com/300"} className="w-64 md:w-80 rounded-lg shadow-2xl" />
        <div className="flex-1 bg-black/50 p-6 rounded-xl border border-gray-800">
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          
          {/*  BIG VISIBLE BUTTON  */}
          <button 
            onClick={toggleWatchlist}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg transition ${inWatchlist ? "bg-red-600 text-white" : "bg-white text-black hover:bg-gray-200"}`}
          >
            {inWatchlist ? " In Watchlist" : "+ Add to Watchlist"}
          </button>

          <p className="mt-6 text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
        </div>
      </div>
    </div>
  );
};
export default MovieDetail;
