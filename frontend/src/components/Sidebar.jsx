import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, close, logout, userId }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 z-[9998] transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`} 
        onClick={close}
      ></div>

      {/* Sidebar Menu */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-[#0a0a0a] border-r border-red-900/50 z-[9999] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-red-600 tracking-tighter">MENU</h2>
          <button onClick={close} className="text-gray-400 hover:text-white text-2xl"></button>
        </div>
        
        <div className="flex flex-col p-6 gap-4">
          <Link to="/" onClick={close} className="text-lg text-gray-300 hover:text-red-500 font-semibold"> Home</Link>
          <Link to="/library" onClick={close} className="text-lg text-gray-300 hover:text-red-500 font-semibold"> My Library</Link>
          <div className="h-px bg-gray-800 my-2"></div>
          <Link to="/genre/Action" onClick={close} className="text-gray-400 hover:text-white"> Action</Link>
          <Link to="/genre/Comedy" onClick={close} className="text-gray-400 hover:text-white"> Comedy</Link>
          <Link to="/genre/Drama" onClick={close} className="text-gray-400 hover:text-white"> Drama</Link>
          <Link to="/genre/Sci-Fi" onClick={close} className="text-gray-400 hover:text-white"> Sci-Fi</Link>
          <Link to="/genre/Horror" onClick={close} className="text-gray-400 hover:text-white"> Horror</Link>
          
          <div className="mt-10">
            <button onClick={logout} className="w-full bg-red-900/20 text-red-500 border border-red-900 py-3 rounded hover:bg-red-900/40 transition">Sign Out</button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Sidebar;
