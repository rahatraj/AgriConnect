import React, { useState, useEffect } from "react";
import { Sun, Moon, Leaf } from "lucide-react"; // Leaf icon for AgriTheme
import toast from "react-hot-toast";

const themes = ["light", "dark", "agriTheme"];

function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <button onClick={toggleTheme} className="btn btn-ghost">
      {theme === "light" ? <Moon size={24} /> : theme === "dark" ? <Leaf size={24} /> : <Sun size={24} />}
    </button>
  );
}

export default ThemeToggle;
