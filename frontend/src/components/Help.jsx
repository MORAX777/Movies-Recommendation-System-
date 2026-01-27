import React from "react";
import { Link } from "react-router-dom";

const Help = () => {
  const faqs = [
    { q: "How do I reset my password?", a: "Currently, password reset is not supported in this demo version. Please create a new account." },
    { q: "Why are some movie images missing?", a: "We fetch images live from TMDB. If a movie is very old or obscure, TMDB might not have an image for it." },
    { q: "How does the recommendation work?", a: "We analyze the genres of the movies you watch and recommend similar highly-rated films you haven't seen yet." },
    { q: "Can I watch movies here?", a: "This is a recommendation engine demo. The 'Play' button simulates watching by adding it to your history." }
  ];

  return (
    <div className="min-h-screen bg-[#121212] p-8 text-white flex justify-center">
      <div className="max-w-2xl w-full">
        <Link to="/" className="text-gray-400 hover:text-white mb-6 block"> Back to Home</Link>
        <h1 className="text-3xl font-bold mb-8 text-red-600">Help Center</h1>
        
        <div className="space-y-6">
          {faqs.map((item, i) => (
            <div key={i} className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
              <h3 className="font-bold text-lg mb-2 text-gray-200">{item.q}</h3>
              <p className="text-gray-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-900/20 p-6 rounded-lg border border-blue-500/30 text-center">
          <p className="mb-4">Still having trouble?</p>
          <Link to="/feedback" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold transition">Contact Support</Link>
        </div>
      </div>
    </div>
  );
};
export default Help;
