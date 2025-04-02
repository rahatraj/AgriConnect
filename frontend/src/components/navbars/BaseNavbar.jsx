import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, Settings,X } from "lucide-react";
import NotificationListener from "../NotificationListner";
import LanguageSwitcher from "../languageTranslator/LanguageSwitcher";
import ThemeSwitcher from "../Theme/ThemeSwitcher";


function BaseNavbar({ links, dropdowns = [], user, onLogout }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    onLogout(); 
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-100 shadow-md h-20 px-4 fixed top-0 w-full z-50">
      {/* Left Side - Brand */}
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl">
          AgriConnect
        </Link>
      </div>

      {/* Center - Desktop Navigation */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {links.map((link, index) => (
            <li key={index}>
              <NavLink to={link.path} className="flex items-center gap-2">
                {link.icon} {link.label}
              </NavLink>
            </li>
          ))}
          {/* Dropdowns */}
          {dropdowns.map((dropdown, index) => (
            <li key={index} className="dropdown dropdown-hover">
              <label tabIndex={index} className="cursor-pointer flex items-center gap-2">
                {dropdown.icon} {dropdown.label}
              </label>
              <ul tabIndex={index} 
                  className="dropdown-content z-10 bg-base-100 shadow-lg rounded-box p-2 w-52">
                {dropdown.links.map((subLink, subIndex) => (
                  <li key={subIndex}>
                    <NavLink to={subLink.path} className="flex items-center gap-2">
                      {subLink.icon} {subLink.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Side - User Info & Mobile Menu */}
      <div className="navbar-end flex items-center lg:gap-4">
        {/* Language Switcher - Hidden on mobile */}
        <div className="hidden lg:block">
          <LanguageSwitcher />
        </div>

        {/* theme switcher */}
          <ThemeSwitcher />
          
        {/* Notifications Icon */}
        {user && <NotificationListener />}

        {user ? (
          <div className="hidden lg:flex items-center gap-4">
            <button className="btn btn-outline btn-error flex justify-center gap-2" 
                onClick={handleLogout}
            >
                <LogOut size={18} />
                Logout
            </button>
          </div>
        ) : (
          <div className="hidden lg:flex gap-4">
            <NavLink to="/login" className="btn btn-primary">
              Login
            </NavLink>
            <NavLink to="/register" className="btn btn-secondary">
              Register
            </NavLink>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button className="lg:hidden btn btn-ghost" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setIsOpen(false)}>
          <div className="fixed top-0 left-0 h-full w-64 bg-base-100 shadow-lg p-4">
            {/* Close Button */}
            <button className="btn btn-sm btn-circle btn-outline absolute top-2 right-2" 
                    onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>

            {/* Links */}
            <ul className="menu mt-8">
              {/* Language and Theme Switchers for Mobile */}
              <li 
                className="flex items-center justify-between mb-4"
                onClick={(e) => e.stopPropagation()}
              >
                <LanguageSwitcher />
              </li>

              {links.map((link, index) => (
                <li key={index}>
                  <NavLink to={link.path} 
                          className="flex items-center gap-2" 
                          onClick={() => setIsOpen(false)}
                  >
                    {link.icon} {link.label}
                  </NavLink>
                </li>
              ))}

              {/* Dropdowns */}
              {dropdowns.map((dropdown, index) => (
                <li key={index} className="dropdown">
                  <label className="cursor-pointer flex items-center gap-2">
                    {dropdown.icon} {dropdown.label}
                  </label>
                  <ul className="menu ml-4">
                    {dropdown.links.map((subLink, subIndex) => (
                      <li key={subIndex}>
                        <NavLink to={subLink.path} className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                          {subLink.icon} {subLink.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            
            {/* User Info & Logout */}
            <div className="mt-3">
              {user ? (
                    <div className="flex flex-col gap-2">
                        <button className="btn btn-error w-full" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <NavLink to="/login" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                    Register
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BaseNavbar;
