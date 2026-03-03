import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Sparkles, Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);

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
          <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
          <p className="text-gray-400 mb-8">
            Enter your new password below
          </p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <Link to="/login">
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
              >
                Reset Password
              </button>
            </Link>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
