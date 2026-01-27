import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const PY_URL = "http://localhost:8000";
const TMDB_KEY = "128694e67f08e5e75b7877b59f232011";
const IMG_BASE_LG = "https://image.tmdb.org/t/p/original";

const MovieDetail = ({ userId }) => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Get Details
    axios.get(`${PY_URL}/movie/${id}`).then(async (res) => {
        setMovie(res.data);
        const imgRes = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(res.data.Title.split("(")[0])}`);
        setBgImage(imgRes.data.results?.[0]?.backdrop_path);
    });
    // Get Similar
    axios.get(`${PY_URL}/recommend/${id}`).then(async (res) => {
        const withImages = await Promise.all(res.data.map(async m => {
             const i = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(m.Title.split("(")[0])}`);
             return { ...m, poster: i.data.results?.[0]?.poster_path };
        }));
        setRecs(withImages);
    });
  }, [id]);

  const handlePlay = () => {
    // Add to History
    axios.post(`${PY_URL}/user/history`, { user_id: userId, movie_id: id });
    alert(`Playing "${movie.Title}"... (Added to History)`);
  };

  const handleWatchlist = () => {
    axios.post(`${PY_URL}/user/watchlist`, { user_id: userId, movie_id: id })
      .then(res => alert(res.data.status === "added" ? "Added to My List" : "Removed from My List"));
  };

  if (!movie) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <nav className="absolute top-0 z-20 w-full p-6">
        <Link to="/" className="bg-black/50 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-bold transition"> Home</Link>
      </nav>

      <div className="relative h-[70vh] w-full">
         <div className="absolute inset-0">
            {bgImage ? <img src={IMG_BASE_LG + bgImage} className="w-full h-full object-cover opacity-50" /> : <div className="bg-gray-900 w-full h-full" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
         </div>
         <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.Title}</h1>
            <div className="flex gap-4 text-sm mb-6 text-gray-300">
                <span className="text-green-400 font-bold">98% Match</span>
                <span>{movie.Year}</span>
                <span>{movie.Genres.replace(/\|/g, "  ")}</span>
            </div>
            <div className="flex gap-4">
                <button onClick={handlePlay} className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 flex items-center gap-2"> Play</button>
                <button onClick={handleWatchlist} className="bg-gray-700/80 text-white px-8 py-3 rounded font-bold hover:bg-gray-600 flex items-center gap-2">+ My List</button>
            </div>
         </div>
      </div>

      <div className="px-8 py-12">
        <h3 className="text-xl font-bold mb-4 border-l-4 border-red-600 pl-4">More Like This</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
           {recs.map(r => (
             <Link to={`/movie/${r.MovieID}`} key={r.MovieID} className="group">
                <div className="aspect-[2/3] bg-gray-800 rounded overflow-hidden transition hover:scale-105">
                   {r.poster ? <img src={`https://image.tmdb.org/t/p/w500${r.poster}`} className="w-full h-full object-cover" /> : <div className="p-2 text-xs text-center">{r.Title}</div>}
                </div>
             </Link>
           ))}
        </div>
      </div>
    </div>
  );
};
export default MovieDetail;
