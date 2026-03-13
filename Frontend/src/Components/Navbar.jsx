import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const linkClass = ({ isActive }) =>
  `relative z-[5]
  sm:px-3 md:px-4 sm:py-1 md:py-2
  text-sm sm:text-base md:text-lg
  flex items-center justify-center gap-2
  font-semibold
  py-2.5 px-5
  w-fit
  rounded-2xl
  border-t-2 border-l-2 border-b-4 border-r-4 border-slate-900
  shadow-md
  active:scale-95
   hover:-translate-y-1
  transition-all duration-200
  group
  ${
    isActive
      ? "bg-blue-700 text-white"
      : "bg-blue-600 text-white hover:bg-blue-700"
  }`;

  const navItemStyle = {
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s ease",
  };

  const handleMouseEnter = (e) => {
    const el = e.currentTarget;
    const underline = el.querySelector(".nav-underline");
    if (underline) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const fromLeft = x < width / 2;
      underline.style.left = fromLeft ? "-100%" : "100%";
      underline.style.right = "auto";
      el.style.textShadow = "0 0 5px rgba(56, 182, 255, 0.5)";
      setTimeout(() => {
        underline.style.left = "0";
      }, 10);
    }
  };

  const handleMouseLeave = (e) => {
    const el = e.currentTarget;
    el.style.textShadow = "none";
  };

  const handleLinkClick = () => {
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 px-3 ${
        isScrolled
          ? "bg-white/40 backdrop-blur-md shadow-md border-b border-[#b4b4b4]/30"
          : "bg-white shadow-sm border-b border-[#b4b4b4]/30"
      }`}
    >
      <div className="container-fluid mx-auto">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <Link to="/app/personalassistant" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0">
              <img
                src="/logo.png-removebg-preview.png"
                alt="Kenkoo logo"
                className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
              />
            </Link>
            <div className="font-bold text-xl sm:text-3xl md:text-4xl text-[#05395e] tracking-tight">
              Kenkoo
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden shrink-0">
            <button
              onClick={toggleMenu}
              className="relative flex flex-col justify-center gap-2 w-6 h-4 sm:w-8 sm:h-6 focus:outline-none group"
              aria-label="Toggle menu"
            >
              <motion.span
                className="block h-1 w-full bg-gray-800 rounded-full"
                animate={
                  isMenuOpen ? { rotate: 45, y: 11 } : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
              <motion.span
                className="block h-1 w-full bg-gray-800 rounded-full"
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block h-1 w-full bg-gray-800 rounded-full"
                animate={
                  isMenuOpen ? { rotate: -45, y: -11 } : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:gap-2 md:items-center">
            <NavLink
              to="/app/personalassistant"
              className={linkClass}
              style={navItemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Diagnosis
              <div className="nav-underline absolute bottom-0 left-0 h-0.5 w-full transform transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            </NavLink>
            <NavLink
              to="/app/Records"
              className={linkClass}
              style={navItemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Records
              <div className="nav-underline absolute bottom-0 left-0 h-0.5 w-full transform transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            </NavLink>
            <NavLink
              to="/app/Insights"
              className={linkClass}
              style={navItemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Insights
              <div className="nav-underline absolute bottom-0 left-0 h-0.5 w-full transform transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            </NavLink>
            <NavLink
              to="/app/careplan"
              className={linkClass}
              style={navItemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Doctor Connect
              <div className="nav-underline absolute bottom-0 left-0 h-0.5 w-full transform transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            </NavLink>
            <NavLink
              to="/app/firstaid"
              className={linkClass}
              style={navItemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              First Aid
              <div className="nav-underline absolute bottom-0 left-0 h-0.5 w-full transform transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/app/profile"
                  className={linkClass}
                  style={navItemStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  Profile
                  <div className="nav-underline absolute bottom-0 left-0 h-0.5 w-full transform transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors border border-red-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="ml-2 px-6 py-2.5 rounded-2xl bg-[#1447E6] text-white font-bold hover:bg-[#032b48] hover:-translate-y-1 transition-all duration-200
  border-t-2 border-l-2 border-b-4 border-r-4 border-slate-900 hover:bg-blue-700 shadow-md active:scale-95"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden ${isMenuOpen ? "block" : "hidden"} bg-white shadow-md z-20 border-b border-gray-200`}
        >
          <div className="flex flex-col py-2">
            <NavLink
              to="/app/personalassistant"
              className="px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#05395e] font-medium transition-all duration-300 hover:pl-6 hover:shadow-inner"
              onClick={handleLinkClick}
            >
              Diagnosis
            </NavLink>
            <NavLink
              to="/app/Records"
              className="px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#05395e] font-medium transition-all duration-300 hover:pl-6 hover:shadow-inner"
              onClick={handleLinkClick}
            >
              Records
            </NavLink>
            <NavLink
              to="/app/Insights"
              className="px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#05395e] font-medium transition-all duration-300 hover:pl-6 hover:shadow-inner"
              onClick={handleLinkClick}
            >
              Insights
            </NavLink>
            <NavLink
              to="/app/careplan"
              className="px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#05395e] font-medium transition-all duration-300 hover:pl-6 hover:shadow-inner"
              onClick={handleLinkClick}
            >
              Doctor Connect
            </NavLink>
            <NavLink
              to="/app/firstaid"
              className="px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#05395e] font-medium transition-all duration-300 hover:pl-6 hover:shadow-inner"
              onClick={handleLinkClick}
            >
              First Aid
            </NavLink>

            <div className="border-t border-gray-100 my-2 pt-2"></div>

            {user ? (
              <>
                <NavLink
                  to="/app/profile"
                  className="px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#05395e] font-medium transition-all duration-300 hover:pl-6 hover:shadow-inner"
                  onClick={handleLinkClick}
                >
                  Your Profile ({user.name})
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    handleLinkClick();
                  }}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-medium transition-all duration-300 hover:pl-6 hover:shadow-inner"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="px-4 py-3 text-[#1447E6] hover:bg-blue-50 font-bold transition-all duration-300 hover:pl-6 hover:shadow-inner"
                onClick={handleLinkClick}
              >
                Login / Sign Up
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
