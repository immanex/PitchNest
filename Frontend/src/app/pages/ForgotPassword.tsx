import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Sparkles, Mail, ArrowLeft } from 'lucide-react';
import useTitle from "../hooks/useTitle";

export default function ForgotPassword() {
  useTitle("Forgot Password");
  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center px-6">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#3B82F6] opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xl font-semibold">PitchNest-Live</span>
        </Link>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10"
        >
          <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
          <p className="text-gray-400 mb-8">
            No worries! Enter your email and we'll send you a reset link.
          </p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
            >
              Send Reset Link
            </button>
          </form>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-6">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
