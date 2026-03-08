import { Search, Bell, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

export default function Header() {
  const { user } = useUser();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="w-full h-16 bg-white dark:bg-[#0D1117] border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-6">

      {/* SEARCH */}
      <div className="relative w-[420px]">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type="text"
          placeholder="Search analytics or sessions..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border 
          text-gray-500 border-gray-500 dark:border-white/10 bg-gray-100 dark:bg-white/5 focus:outline-none"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        {/* THEME TOGGLE */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg bg-gray-400 dark:bg-white/10"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* NOTIFICATION */}
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-gray-500 dark:text-gray-300" />

          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </div>

        {/* USER */}
        <div className="flex items-center gap-3 border-l border-gray-200 dark:border-white/10 pl-6">

          <div className="text-right">
            <div className=" text-gray-500 font-medium text-sm">
              {user?.full_name || "Alex Morgan"}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Founder
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center text-white text-sm font-semibold">
            {user?.full_name?.[0] || "A"}
          </div>

        </div>

      </div>
    </div>
  );
}