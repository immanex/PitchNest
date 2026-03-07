import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { 
  Download, 
  Play, 
  TrendingUp, 
  TrendingDown,
  MessageSquare,
  Clock,
  AlertCircle,
  Award,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../context/UserContext';

type Pitch = {
  id: string;
  overall_score: number | null;
  clarity_score: number | null;
  communication_score: number | null;
  market_fit_score: number | null;
  verdict: string | null;
  feedback_summary: string | null;
  recommendations: { id: string; category: string; content: string }[];
};

// Fallback mock data for confidence trend (when no detailed analytics yet)
const defaultConfidenceData = [
  { time: '0:00', confidence: 45 },
  { time: '1:00', confidence: 52 },
  { time: '2:00', confidence: 68 },
  { time: '3:00', confidence: 71 },
  { time: '4:00', confidence: 65 },
  { time: '5:00', confidence: 78 },
  { time: '6:00', confidence: 82 },
  { time: '7:00', confidence: 85 },
];

const defaultFillerWords = [
  { word: 'um', count: 12 },
  { word: 'uh', count: 8 },
  { word: 'like', count: 15 },
  { word: 'you know', count: 6 },
];

export default function PostPitchAnalytics() {
  const [searchParams] = useSearchParams();
  const pitchId = searchParams.get('pitch_id');
  const { token } = useUser();
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPitch = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const url = pitchId
          ? `http://localhost:8000/api/dashboard/pitches/${pitchId}`
          : 'http://localhost:8000/api/dashboard/pitches/recent?limit=1';
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load pitch');
        const data = await res.json();
        const p = Array.isArray(data) ? data[0] : data;
        setPitch(p || null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchPitch();
  }, [token, pitchId]);

  const strengths = pitch?.recommendations?.filter(r => r.category === 'strength').map(r => r.content) ?? [];
  const weaknesses = pitch?.recommendations?.filter(r => r.category === 'weakness').map(r => r.content) ?? [];
  const suggestions = pitch?.recommendations?.filter(r => r.category === 'suggestion').map(r => r.content) ?? [];

  const overallScore = pitch?.overall_score ?? 78;
  const clarity = pitch?.clarity_score ?? 82;
  const confidence = pitch?.communication_score ?? 85;
  const marketFit = pitch?.market_fit_score ?? 68;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <Link to="/dashboard" className="text-[#3B82F6] hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-[#3B82F6] opacity-10 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-[#10B981] opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl mb-2">Session Complete! 🎉</h1>
            <p className="text-gray-400 text-lg">Here's how you performed</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
              <Play className="w-5 h-5" />
              Replay Session
            </button>
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 rounded-3xl bg-gradient-to-br from-[#3B82F6]/20 to-[#7C3AED]/20 backdrop-blur-sm border border-[#3B82F6]/30 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6] opacity-10 blur-3xl rounded-full" />
          
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Overall Score</div>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent">
                  {Math.round(overallScore)}
                </span>
                <span className="text-2xl text-gray-400">/ 100</span>
              </div>
              {pitch && (
                <div className="flex items-center gap-2 mt-4">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-green-500">AI-evaluated with Gemini</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-8">
              <ScoreBadge label="Clarity" score={Math.round(clarity)} color="#3B82F6" />
              <ScoreBadge label="Communication" score={Math.round(confidence)} color="#7C3AED" />
              <ScoreBadge label="Market Fit" score={Math.round(marketFit)} color="#10B981" />
            </div>
          </div>
        </motion.div>

        {/* Pitch Summary: Panel Verdict, Strengths, Weaknesses, AI Feedback, Improvement Suggestions */}
        {pitch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Panel Verdict & AI Feedback */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 space-y-6">
              <h3 className="text-lg">Panel Verdict</h3>
              <p className="text-lg text-gray-200">{pitch.verdict ?? '—'}</p>
              {pitch.feedback_summary && (
                <>
                  <h3 className="text-lg pt-4 border-t border-white/10">AI Written Feedback</h3>
                  <p className="text-gray-300">{pitch.feedback_summary}</p>
                </>
              )}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 space-y-6">
              {strengths.length > 0 && (
                <div>
                  <h3 className="text-lg flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {strengths.map((s, i) => (
                      <li key={i} className="text-gray-300 flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {weaknesses.length > 0 && (
                <div>
                  <h3 className="text-lg flex items-center gap-2 mb-3">
                    <XCircle className="w-5 h-5 text-amber-500" />
                    Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {weaknesses.map((w, i) => (
                      <li key={i} className="text-gray-300 flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {suggestions.length > 0 && (
                <div>
                  <h3 className="text-lg flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-[#3B82F6]" />
                    Improvement Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {suggestions.map((s, i) => (
                      <li key={i} className="text-gray-300 flex items-start gap-2">
                        <span className="text-[#3B82F6]">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Duration"
            value="7:42"
            color="#3B82F6"
          />
          <StatCard
            icon={<MessageSquare className="w-6 h-6" />}
            label="Words Spoken"
            value="842"
            color="#7C3AED"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            label="Filler Words"
            value="41"
            trend="down"
            color="#F59E0B"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label="Questions Asked"
            value="8"
            color="#10B981"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Confidence Trend */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-lg mb-6">Confidence Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={defaultConfidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(13, 17, 23, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Filler Word Breakdown */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-lg mb-6">Filler Word Analysis</h3>
            <div className="space-y-4">
              {defaultFillerWords.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">"{item.word}"</span>
                    <span className="text-white">{item.count}x</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / 15) * 100}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30">
              <div className="text-sm text-gray-300">
                💡 <strong>Tip:</strong> Try pausing instead of using filler words. Practice makes perfect!
              </div>
            </div>
          </div>
        </div>

        {/* Investor Reaction Timeline (placeholder until real-time analysis) */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <h3 className="text-lg mb-6">Investor Reaction Timeline</h3>
          <div className="space-y-4">
            {[
              { time: '1:24', investor: 'The Skeptic', reaction: 'Raised eyebrow at market size claim', type: 'concern' as const },
              { time: '3:45', investor: 'The Friendly Angel', reaction: 'Nodded positively at team slide', type: 'positive' as const },
              { time: '5:12', investor: 'The Aggressive VC', reaction: 'Asked about unit economics', type: 'question' as const },
            ].map((reaction, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    reaction.type === 'positive' 
                      ? 'bg-green-500/20 border border-green-500/50' 
                      : reaction.type === 'concern'
                      ? 'bg-yellow-500/20 border border-yellow-500/50'
                      : 'bg-blue-500/20 border border-blue-500/50'
                  }`}>
                    {reaction.type === 'positive' ? '✓' : reaction.type === 'concern' ? '!' : '?'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm text-gray-400">{reaction.time}</span>
                    <span className="text-sm text-[#3B82F6]">{reaction.investor}</span>
                  </div>
                  <p className="text-sm text-gray-300">{reaction.reaction}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Buttons: Pitch Again, Back to Dashboard */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="px-8 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/modes"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
          >
            Pitch Again
          </Link>
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl mb-2"
        style={{
          background: `${color}20`,
          border: `1px solid ${color}40`,
          boxShadow: `0 0 20px ${color}30`
        }}
      >
        {score}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  trend 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `${color}20`,
          color: color
        }}
      >
        {icon}
      </div>
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl">{value}</span>
        {trend && (
          trend === 'down' ? (
            <TrendingDown className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingUp className="w-4 h-4 text-green-500" />
          )
        )}
      </div>
    </div>
  );
}
