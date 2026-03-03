import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account created successfully!");
        navigate("/login");
      } else {
        alert(data?.message || "Signup failed");
      }
    } catch (error) {
      alert("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white">
      <form
        onSubmit={handleRegister}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-96 shadow-lg border border-white/10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>

        <input
          type="text"
          required
          placeholder="Full Name"
          className="w-full mb-4 p-3 rounded bg-white/20 outline-none focus:ring-2 focus:ring-purple-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          required
          placeholder="Email"
          className="w-full mb-4 p-3 rounded bg-white/20 outline-none focus:ring-2 focus:ring-purple-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          required
          placeholder="Password"
          className="w-full mb-6 p-3 rounded bg-white/20 outline-none focus:ring-2 focus:ring-purple-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] p-3 rounded font-semibold hover:opacity-90 transition-all"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="mt-4 text-sm text-center text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
