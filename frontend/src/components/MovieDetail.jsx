import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const TMDB_KEY = "128694e67f08e5e75b7877b59f232011";
const IMG_BASE = "https://image.tmdb.org/t/p/original";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    // We fetch details from TMDB directly for the nice UI
    const fetchDetails = async () => {
      // First get the movie title from our backend ID (we cheat a bit here and just fetch by ID from TMDB assuming sync)
      // Actually, standard way: Fetch TMDB details by ID. 
      // Note: MovieLens IDs != TMDB IDs. But for this demo, we will search by title if needed.
      // SIMPLIFICATION: We will use the TMDB ID search trick again.
      // For stability, we assume the user clicked from dashboard which had data.
      // Let"s just fetch by ID from TMDB assuming the ID passed is the TMDB ID? No, it is MovieLens ID.
      // We will just show a "Details" placeholder to keep it simple and stable as requested.
      
      try {
         // This is a simplified fetch. In a real app we map IDs. 
         // For now, we will just use the "Movie Not Found" fallback if complex logic fails.
         // But the user wants it WORKING. 
         // Strategy: Get Movie Info from Backend first.
         const pyRes = await axios.get(`https://movies-recommendation-system-70ns.onrender.com/movies/${id}`);
         const title = pyRes.data.Title.split("(")[0].trim();
         
         const tmdbSearch = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${title}`);
         const tmdbData = tmdbSearch.data.results[0];
         setMovie(tmdbData);
      } catch (e) { console.error(e); }
    };
    fetchDetails();
  }, [id]);

  if (!movie) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="h-[60vh] relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <img src={IMG_BASE + movie.backdrop_path} className="w-full h-full object-cover opacity-50" />
        <div className="absolute bottom-10 left-10 z-20">
          <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>
          <p className="max-w-xl text-lg text-gray-300">{movie.overview}</p>
          <Link to="/" className="inline-block mt-6 bg-red-600 px-6 py-2 rounded font-bold">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};
export default MovieDetail;
