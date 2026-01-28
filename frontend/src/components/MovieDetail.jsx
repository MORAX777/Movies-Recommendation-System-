import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TMDB_KEY = "128694e67f08e5e75b7877b59f232011"; // Use your valid key if you changed it
const IMG_BASE = "https://image.tmdb.org/t/p/original";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=en-US`
        );
        setMovie(res.data);
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="text-white text-center mt-20 text-xl">Loading Movie...</div>;
  if (!movie) return <div className="text-white text-center mt-20 text-xl">Movie not found.</div>;

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40" 
        style={{ backgroundImage: `url(${IMG_BASE}${movie.backdrop_path})` }} 
      />
      
      {/* CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10 items-center md:items-start animate-fadeIn">
        
        {/* POSTER */}
        <img 
          src={movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : "https://via.placeholder.com/300x450"} 
          alt={movie.title} 
          className="w-64 md:w-80 rounded-lg shadow-2xl border border-gray-700 hover:scale-105 transition duration-500"
        />

        {/* DETAILS */}
        <div className="flex-1 bg-black/30 p-6 rounded-xl backdrop-blur-sm border border-white/5">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">{movie.title}</h1>
          <p className="text-gray-400 italic text-lg mb-6">{movie.tagline}</p>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="bg-red-600 px-3 py-1 rounded text-sm font-bold shadow-lg shadow-red-900/50">
              {movie.release_date?.split("-")[0]}
            </span>
            <span className="border border-white/30 px-3 py-1 rounded text-sm bg-black/50">
              {movie.runtime} min
            </span>
            <span className="text-yellow-400 font-bold text-lg border border-yellow-500/30 px-3 py-1 rounded bg-yellow-500/10">
               {movie.vote_average.toFixed(1)}
            </span>
          </div>

          <h3 className="text-xl font-bold mb-2 text-gray-200">Overview</h3>
          <p className="text-gray-300 text-lg leading-relaxed mb-8 border-l-4 border-red-600 pl-4">
            {movie.overview}
          </p>

          {/* GENRES */}
          <div className="flex gap-2 flex-wrap">
            {movie.genres?.map((g) => (
              <span key={g.id} className="text-xs border border-gray-600 px-3 py-1 rounded-full text-gray-400">
                {g.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
