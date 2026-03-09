import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Sparkles, Mail, CheckCircle } from 'lucide-react';
import useTitle from "../hooks/useTitle";


export default function EmailVerification() {
  useTitle("Email Verification");
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
          className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="w-10 h-10" />
          </motion.div>

          <h2 className="text-3xl font-bold mb-2">Check Your Email</h2>
          <p className="text-gray-400 mb-8">
            We've sent a verification link to your email address. Click the link to verify your account.
          </p>

          <div className="p-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 mb-6">
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                Didn't receive the email? Check your spam folder or click resend below.
              </p>
            </div>
          </div>

          <button className="w-full px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all mb-4">
            Resend Verification Email
          </button>

          <Link to="/login">
            <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
              Continue to Login
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
