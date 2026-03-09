import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Sparkles,
  Brain,
  Zap,
  ChevronRight,
  Video,
  BarChart3,
  Users,
  Check,
  MessageSquare,
  Mail,
  Phone,
  HelpCircle,
} from "lucide-react";
import useTitle from "../hooks/useTitle";

import { useUser } from "../context/UserContext";
export default function Landing() {
  useTitle("Home");
  const { user } = useUser();
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-[#3B82F6] opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-[#7C3AED] opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.25, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Animated circuit/wave lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <motion.path
            d="M0,150 Q250,100 500,150 T1000,150"
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M0,300 Q300,250 600,300 T1200,300"
            stroke="#7C3AED"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: 0.5,
            }}
          />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xl font-semibold">PitchNest-Live</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("features")}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="text-gray-300 hover:text-white transition-colors"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Contact
          </button>
        </div>
        {user ? (
          <Link to="/settings">
            <div className="flex items-center gap-3 pl-4  border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center">
                {user?.full_name ? user.full_name[0] : "U"}
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login">
              <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-6 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 mb-6">
              <Brain className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm text-gray-300">
                AI-Powered Pitch Simulation
              </span>
            </div>

            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Perfect Your Pitch with{" "}
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent">
                AI Investors
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Practice pitching to AI-powered investor personas. Get real-time
              feedback, improve your delivery, and close deals with confidence.
            </p>

            {user ? (
              <Link to="/dashboard">
                <motion.button
                  className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-300 flex items-center gap-3 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className="w-5 h-5" />
                  <span className="text-lg"> Go to Dashboard</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            ) : (
              <Link to="/signup">
                <motion.button
                  className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-300 flex items-center gap-3 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className="w-5 h-5" />
                  <span className="text-lg"> Go to Dashboard</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            )}
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div
          id="features"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <FeatureCard
            icon={<Video className="w-6 h-6" />}
            title="Real-Time Simulation"
            description="Practice with AI investors who respond like real VCs and angels"
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Instant Analytics"
            description="Get detailed feedback on clarity, confidence, and market fit"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Multiple Personas"
            description="Face diverse investor types from aggressive VCs to friendly angels"
          />
        </motion.div>
      </div>

      {/* About Section */}
      <section
        id="about"
        className="relative z-10 px-6 py-24 bg-white/5 backdrop-blur-sm border-y border-white/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">About PitchNest-Live</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The world's first AI-powered pitch simulation platform designed to
              help founders, students, and coaches master the art of
              fundraising.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">Our Mission</h3>
              <p className="text-gray-400">
                We believe that every entrepreneur deserves the opportunity to
                practice and perfect their pitch before facing real investors.
                PitchNest-Live uses cutting-edge AI to simulate realistic
                investor interactions, providing immediate, actionable feedback.
              </p>
              <p className="text-gray-400">
                Whether you're preparing for your first pitch competition or
                raising your Series A, our platform helps you build confidence
                and refine your story.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatBox label="Active Users" value="10K+" />
              <StatBox label="Pitches Practiced" value="50K+" />
              <StatBox label="Success Rate" value="85%" />
              <StatBox label="Avg. Improvement" value="40%" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 text-lg">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              name="Free"
              price="$0"
              period="forever"
              features={[
                "3 practice sessions/month",
                "Basic AI feedback",
                "Session recordings",
                "Email support",
              ]}
              cta="Get Started"
              link="/signup"
            />
            <PricingCard
              name="Pro"
              price="$29"
              period="per month"
              features={[
                "Unlimited practice sessions",
                "Advanced AI feedback",
                "All investor personas",
                "Analytics dashboard",
                "Priority support",
                "PDF export",
              ]}
              cta="Start Free Trial"
              link="/signup"
              popular
            />
            <PricingCard
              name="Team"
              price="$99"
              period="per month"
              features={[
                "Everything in Pro",
                "5 team members",
                "Team analytics",
                "Custom AI personas",
                "Dedicated support",
                "API access",
              ]}
              cta="Contact Sales"
              link="/signup"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="contact"
        className="relative z-10 px-6 py-24 bg-white/5 backdrop-blur-sm border-y border-white/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* FAQ */}
            <div>
              <h2 className="text-3xl font-bold mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <FAQItem
                  question="How does the AI simulation work?"
                  answer="Our AI is trained on thousands of real investor interactions to provide realistic, challenging questions and feedback tailored to your industry and pitch stage."
                />
                <FAQItem
                  question="Can I use my own pitch deck?"
                  answer="Yes! You can upload your deck in PDF or PPT format, and our system will display it during your simulation sessions."
                />
                <FAQItem
                  question="Is my data secure?"
                  answer="Absolutely. We use enterprise-grade encryption and never share your pitch materials or session data with third parties."
                />
                <FAQItem
                  question="What industries do you support?"
                  answer="We support all major industries including SaaS, FinTech, Healthcare, E-Commerce, EdTech, and more."
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
              <p className="text-gray-400 mb-8">
                Have questions? We're here to help. Reach out to our team and
                we'll get back to you within 24 hours.
              </p>

              <div className="space-y-6">
                <ContactItem
                  icon={<Mail className="w-5 h-5" />}
                  label="Email"
                  value="hello@pitchnest.live"
                />
                <ContactItem
                  icon={<Phone className="w-5 h-5" />}
                  label="Phone"
                  value="+1 (555) 123-4567"
                />
                <ContactItem
                  icon={<MessageSquare className="w-5 h-5" />}
                  label="Live Chat"
                  value="Available 9am-6pm EST"
                />
              </div>

              <div className="mt-8">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none mb-4"
                />
                <textarea
                  placeholder="Your message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none mb-4"
                />
                <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold text-white">
              PitchNest-Live
            </span>
          </div>
          <p className="text-sm">© 2026 PitchNest-Live. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-[#3B82F6]/30 transition-all duration-300 group">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#7C3AED]/20 flex items-center justify-center text-[#3B82F6] mb-4 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-shadow">
        {icon}
      </div>
      <h3 className="text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center">
      <div className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent mb-2">
        {value}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  link,
  popular,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  link: string;
  popular?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-3xl backdrop-blur-sm border transition-all duration-300 relative ${
        popular
          ? "bg-gradient-to-br from-[#3B82F6]/20 to-[#7C3AED]/20 border-[#3B82F6]/50 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
          : "bg-white/5 border-white/10 hover:border-white/20"
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-sm">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-400">/{period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Link to={link}>
        <button
          className={`w-full px-6 py-3 rounded-xl transition-all ${
            popular
              ? "bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              : "bg-white/10 border border-white/20 hover:bg-white/20"
          }`}
        >
          {cta}
        </button>
      </Link>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-semibold mb-2">{question}</h4>
          <p className="text-sm text-gray-400">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className="text-white">{value}</div>
      </div>
    </div>
  );
}
