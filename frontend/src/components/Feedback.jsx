import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Feedback = ({ userId, user }) => {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    
    try {
      await axios.post("http://localhost:8000/user/feedback", {
        user_id: userId,
        user_name: user,
        message: msg
      });
      setStatus("success");
      setMsg("");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] p-8 rounded-xl max-w-lg w-full border border-gray-800 shadow-2xl">
        <Link to="/" className="text-sm text-gray-500 hover:text-white mb-6 block"> Cancel</Link>
        <h1 className="text-2xl font-bold text-white mb-2">Send Feedback</h1>
        <p className="text-gray-400 mb-6 text-sm">Found a bug? Have a suggestion? Let Team Targaryan know!</p>

        {status === "success" ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-4"></div>
            <h3 className="text-white font-bold mb-2">Feedback Received!</h3>
            <p className="text-gray-500">Thank you for helping us improve.</p>
            <button onClick={() => setStatus("")} className="mt-6 text-red-500 hover:underline">Send another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea 
              className="w-full h-40 bg-[#121212] text-white p-4 rounded border border-gray-700 focus:border-red-600 outline-none resize-none"
              placeholder="Type your message here..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              required
            ></textarea>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition">
              Submit Feedback
            </button>
            {status === "error" && <p className="text-red-500 text-center text-sm">Failed to send. Try again.</p>}
          </form>
        )}
      </div>
    </div>
  );
};
export default Feedback;
