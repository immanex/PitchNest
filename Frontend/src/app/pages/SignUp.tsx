import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, Rocket, Sun, Moon } from "lucide-react";
import useTitle from "../hooks/useTitle";


export default function SignUp() {
  useTitle("Sign Up");
  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

  const [showPassword, setShowPassword] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Theme handler
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    let response = await fetch(`${BaseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    });

    if (response.ok) {
      alert("Account created successfully! Please verify your email.");
      window.location.href = "/login";
    } else {
      let error = await response.json();
      alert(`Error: ${error.detail || "Something went wrong"}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0D1117] flex items-center justify-center px-6 relative text-gray-900 dark:text-white">

      {/* THEME TOGGLE BUTTON */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-6 right-6 p-2 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:scale-105 transition"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      <div className="max-w-6xl w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT SIDE */}
        <div className="p-10">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Rocket className="text-white w-5 h-5" />
            </div>
            <span className="font-semibold text-lg text-gray-800 dark:text-white">
              PitchNest
            </span>
          </Link>

          <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
            Create your account
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Join the future of AI-driven startup pitching.
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full pl-10 py-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@company.com"
                  className="w-full pl-10 py-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 py-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Confirm Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 py-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Role */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                I am a...
              </label>

              <select className="w-full py-3 px-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 focus:ring-2 focus:ring-blue-400 outline-none">
                <option>Founder</option>
                <option>Investor</option>
                <option>Mentor</option>
                <option>Student</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition"
            >
              Create Account →
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex flex-col items-center justify-center bg-blue-100 dark:bg-blue-500/10 p-10 text-center">

          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df"
            className="rounded-xl shadow-md mb-6"
          />

          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            The AI Pitch Deck Evolution
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm">
            Join 10,000+ founders using PitchNest to refine their narratives
            with real-time AI feedback and investor matching.
          </p>

          <div className="flex gap-2 mt-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
            <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
          </div>

        </div>

      </div>
    </div>
  );
}