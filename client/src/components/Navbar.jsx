import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/CC.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth() || {};

  const [menuOpen, setMenuOpen] = useState(false);

  // Hide navbar on auth pages
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  const logout = () => {
    if (signOut) signOut();
    navigate("/");
  };

  // Active link style
  const isActive = (path) => {
    return location.pathname.startsWith(path)
      ? "text-blue-600 font-semibold"
      : "text-gray-600 hover:text-blue-600";
  };

  return (
    <nav className="w-full bg-white border-b sticky top-0 z-50 shadow-sm">

      {/* FULL WIDTH CONTAINER */}
      <div className="w-full px-6 py-3 flex items-center justify-between">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-8">

          {/* LOGO */}
          <Link
            to="/dashboard"
            className="font-bold text-xl text-blue-600 whitespace-nowrap"
          >

             <img
                src={logo}
                alt="CampusConnect"
                className="w-10 h-10 rounded-full object-cover"
                />
            SRIT CampusConnect
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">

            <Link
              to="/dashboard"
              className={isActive("/dashboard")}
            >
              Dashboard
            </Link>

            <Link
              to="/clubs"
              className={isActive("/clubs")}
            >
              Clubs
            </Link>

            <Link
              to="/events"
              className={isActive("/events")}
            >
              Events
            </Link>

            <Link
              to="/notices"
              className={isActive("/notices")}
            >
              Notices
            </Link>

            <Link
              to="/lost-found"
              className={isActive("/lost-found")}
            >
              Lost & Found
            </Link>

            {/* ✅ GENERAL CHAT LINK */}
            <Link
              to="/chat/general"
              className={isActive("/chat")}
            >
              Chat
            </Link>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden text-gray-600 text-xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {/* USER INFO */}
          {user && (
            <div className="flex items-center gap-3">

              <Link
                to="/profile"
                className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-lg"
              >
                <Avatar
                  name={user?.name || "User"}
                  src={profile?.avatarUrl}
                  size={36}
                />

                <div className="hidden sm:block">
                  <div className="text-sm font-semibold">
                    {user?.name}
                  </div>

                  <div className="text-xs text-gray-500 capitalize">
                    {profile?.role || "student"}
                  </div>
                </div>
              </Link>

              <Button
                variant="ghost"
                onClick={logout}
                className="text-sm"
              >
                Logout
              </Button>

            </div>
          )}

        </div>

      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden border-t px-6 py-3 flex flex-col gap-3 text-sm font-medium">

          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className={isActive("/dashboard")}
          >
            Dashboard
          </Link>

          <Link
            to="/clubs"
            onClick={() => setMenuOpen(false)}
            className={isActive("/clubs")}
          >
            Clubs
          </Link>

          <Link
            to="/events"
            onClick={() => setMenuOpen(false)}
            className={isActive("/events")}
          >
            Events
          </Link>

          <Link
            to="/notices"
            onClick={() => setMenuOpen(false)}
            className={isActive("/notices")}
          >
            Notices
          </Link>

          <Link
            to="/lost-found"
            onClick={() => setMenuOpen(false)}
            className={isActive("/lost-found")}
          >
            Lost & Found
          </Link>

          <Link
            to="/chat/general"
            onClick={() => setMenuOpen(false)}
            className={isActive("/chat")}
          >
            Chat
          </Link>

        </div>
      )}

    </nav>
  );
}
