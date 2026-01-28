import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, close, logout, userName }) => {
  return (
    <>
      <div className={`fixed inset-0 bg-black/80 z-40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={close} />
      
      <div className={`fixed top-0 left-0 h-full w-72 bg-[#111] z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} border-r border-gray-800`}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-red-600">MENU</h2>
          <button onClick={close} className="text-gray-400 hover:text-white"></button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="text-gray-400 text-sm">Hello, <span className="text-white font-bold">{userName}</span></div>
          
          <Link to="/" onClick={close} className="text-lg hover:text-red-500 font-semibold"> Home</Link>
          <Link to="/library" onClick={close} className="text-lg hover:text-red-500 font-semibold"> Watchlist</Link>
          
          <div className="h-px bg-gray-800 my-2"></div>
          <button onClick={logout} className="text-left text-red-500 font-semibold hover:text-red-400">Sign Out</button>
        </div>

        {/*  CREDITS SECTION (Requested Name Change)  */}
        <div className="absolute bottom-6 left-0 w-full text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Developed By</p>
          <p className="text-xs text-gray-300 font-mono">
            Aryan, Mohan<br/>Vijay, Bala Sai
          </p>
        </div>
      </div>
    </>
  );
};
export default Sidebar;
