import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const PY_URL = "https://movies-recommendation-system-70ns.onrender.com";
const TMDB_KEY = "128694e67f08e5e75b7877b59f232011";
const IMG_BASE = "https://image.tmdb.org/t/p/original";

const MovieDetail = ({ userId }) => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [inList, setInList] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Log History
      if (userId) axios.post(`${PY_URL}/user/history`, { user_id: userId, movie_id: parseInt(id) });

      // 2. Check Watchlist
      if (userId) {
        const res = await axios.get(`${PY_URL}/user/watchlist/${userId}`);
        setInList(res.data.some(i => i.movie_id == id));
      }

      // 3. Get Details
      const pyRes = await axios.get(`${PY_URL}/movies/${id}`);
      // Enhance with TMDB
      const tmdbSearch = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${pyRes.data.Title.split("(")[0]}`);
      setMovie({ ...pyRes.data, ...tmdbSearch.data.results[0] });
    };
    init();
  }, [id, userId]);

  const toggleList = async () => {
    setInList(!inList);
    await axios.post(`${PY_URL}/user/watchlist`, { user_id: userId, movie_id: parseInt(id) });
  };

  if (!movie) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{backgroundImage: `url(${IMG_BASE}${movie.backdrop_path})`}}></div>
      <div className="relative z-10 p-10 flex flex-col md:flex-row gap-8 mt-10">
        <img src={IMG_BASE + movie.poster_path} className="w-72 rounded-lg shadow-2xl" />
        <div>
          <h1 className="text-5xl font-bold mb-4">{movie.title || movie.Title}</h1>
          <button onClick={toggleList} className={`px-6 py-2 rounded font-bold mb-6 ${inList ? "bg-red-600" : "bg-white text-black"}`}>
            {inList ? " In Watchlist" : "+ Add to Watchlist"}
          </button>
          <p className="text-lg text-gray-300 max-w-2xl">{movie.overview}</p>
          <Link to="/" className="inline-block mt-8 text-gray-400 hover:text-white"> Back Home</Link>
        </div>
      </div>
    </div>
  );
};
export default MovieDetail;
