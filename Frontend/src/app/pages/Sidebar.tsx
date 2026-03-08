import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Zap,
  Upload,
  BarChart3,
  Folder,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Start Pitch", icon: Zap, path: "/pre-pitch" },
    { name: "My Pitches", icon: Upload, path: "/my-pitches" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
  ];

  return (
    <div className="w-64 min-h-screen bg-white dark:bg-[#0D1117] border-r border-gray-200 dark:border-white/10 flex flex-col justify-between">

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="flex items-center gap-3 p-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center text-white">
            🚀
          </div>

          <span className="font-semibold text-lg">
            PitchNest
          </span>
        </div>

        {/* MENU */}
        <nav className="px-4 space-y-2">

          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                  active
                    ? "bg-blue-100 text-blue-600 dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}

          <div className="border-t border-gray-200 dark:border-white/10 my-4" />

          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <Settings size={18} />
            Settings
          </Link>

        </nav>
      </div>

      {/* PRO PLAN */}
      <div className="p-4">
        <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">

          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            PRO PLAN
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            You have 12 pitch simulations left this month.
          </p>

          <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mb-3">
            <div className="bg-blue-500 h-2 rounded-full w-[70%]" />
          </div>

        </div>
      </div>

    </div>
  );
}