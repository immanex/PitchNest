import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#0D1117] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-gray-300 dark:text-white/10">404</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Page not found
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition"
          >
            <Home size={18} />
            Home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            <ArrowLeft size={18} />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
